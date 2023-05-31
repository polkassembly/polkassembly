// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState ,useContext } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Radio } from 'antd';
import { Document, Page, pdfjs  } from 'react-pdf';
import { ProposalType } from '~src/global/proposalType';
import { usePostDataContext } from 'src/context';
import { NetworkContext } from '~src/context/NetworkContext';
import PdfIcon from '~assets/icons/pdfs.svg';
import YouTubeIcon from '~assets/icons/video.svg';
import ReactPlayer from 'react-player';
import NoDataFound  from '~assets/no-audits.svg';
import styled from 'styled-components';

const DocumentContainer = styled.div`
.react-pdf__Page {
	width: 100% !important;
	display: flex !important;
	justify-content: center !important;
	overflow: hidden !important;
	border: 1px solid #D2D8E0;
	height: 500px !important;
}
.react-pdf__Page__canvas {
	width: 100% !important;
}
.documentContainerdiv{
	background-color:#F6F7F9;
	width : 100%;
	display: flex;
  align-items: center;
  justify-content: start;
  padding : 10px 5px;
  font-size : 14px;
}

`;
const ImageContainer = styled.div`
width: 100% !important;
display: flex !important;
justify-content: center !important;
overflow: hidden !important;
border: 1px solid #D2D8E0;
height: 500px !important;

.img{
	width: 100% !important;
	height : 100rem;
}

`;

const VideoContainer = styled.div`
	width: 100% !important;
	display: flex !important;
	flex-direction:column;
	justify-content: center !important;
	overflow: hidden !important;
	border: 1px solid #D2D8E0;
	height: 100% !important;

	.video{
		width: 95% !important;
		margin:auto;
	height : 100rem;
	}
`;
interface IDataType {
  download_url: string;
  url: string;
  git_url: string;
  html_url: string;
  name: string;
  sha: number;
  size: number;
  type: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

interface IDataVideoType {
	name:string;
	url: string;
	title: string;
	date: string;
}
// For showing date
function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	const day = date.getDate();
	const month = date.toLocaleString('default', { month: 'short' });
	const year = date.getFullYear().toString().substr(-2);

	return `${day}${getOrdinalSuffix(day)} ${month} '${year}`;
}

function getOrdinalSuffix(day: number): string {
	const suffixes = ['th', 'st', 'nd', 'rd'];
	const relevantDigits = day % 100;
	const suffix =
    suffixes[(relevantDigits - 20) % 10] ||
    suffixes[relevantDigits] ||
    suffixes[0];

	return suffix;
}

// for showing pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PostAudit = () => {

	const { network } = useContext(NetworkContext);
	const { postData } = usePostDataContext();
	// console.log('postData' , postData);

	// Fetching data
	const [auditData, setAuditData] = useState<IDataType[]>([]);
	const [videoData, setVideotData] = useState<IDataVideoType[]>([]);

	let postType:any = postData.postType;

	if(postType === ProposalType.REFERENDUM_V2){
		postType = 'OpenGov';
	}
	else if(postType === ProposalType.DISCUSSIONS){
		postType = 'Discussion';
	}

	const networkModified = network.charAt(0).toUpperCase() + network.slice(1);

	const productData = async () => {
		try {
			const response = await fetch(`https://api.github.com/repos/CoinStudioDOT/OpenGov/contents/${networkModified}/${postType}/${postData.postIndex}`);
			if (response.ok) {
				const data = await response.json();
				setAuditData(data);
			} else {
				throw new Error('Request failed');
			}
		}
		catch (error) {
			console.log('Error:', error);
		}
	};

	const videosData = async () => {
		try {
			const response = await fetch(`https://api.github.com/repos/CoinStudioDOT/OpenGov/contents/${networkModified}/${postType}/${postData.postIndex}/video.json`);
			if (response.ok) {
				const data = await response.json();
				const decoded = atob(data.content);
				const decodedContent = decoded.split('}').join('},');
				// console.log(decodedContent.split(']')[0].trim().slice(0,decodedContent.split(']')[0].trim().length-1)+']');
				setVideotData(JSON.parse(decodedContent.split(']')[0].trim().slice(0,decodedContent.split(']')[0].trim().length-1)+']') as IDataVideoType[]);
			} else {
				throw new Error('Request failed');
			}
		}
		catch (error) {
			console.log('Error:', error);
		}
	};

	useEffect(() => {
		productData();
		videosData();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// showing count of pdfs and videos
	function getCountByType(data: any[]): number {
		let count = 0;

		for (const file of data) {
			if (file.name.endsWith('.pdf') || file.name.endsWith('.png')) {
				count++;   }
		}
		return count;
	}
	const pdfCount = getCountByType(auditData);

	const getCountByVideo = videoData.length;
	const videoCount = getCountByVideo;

	// For filtering data based on pdfs and videos

	const [selectedType, setSelectedType] = useState<string>('reports');
	const handleChange = (e: any) => {
		setSelectedType(e.target.value);
	};

	//for showing pdf
	const onDocumentLoadSuccess = ({ numPages }: any) => {
		console.log('Total number of pages:', numPages);
	};

	//Downloding pdf
	const downloadFile = (url: string) => {
		const link = document.createElement('a');
		link.href = url;
		link.target = '_blank';
		link.download = '';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	//Downloding Image
	function downloadImage(url:string, name:string){
		fetch(url)
			.then(resp => resp.blob())
			.then(blob => {
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.style.display = 'none';
				a.href = url;
				a.download = name;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
			})
			.catch(() => alert('An error sorry'));
	}
	return (
		<>
			<div className="flex">
				<div className={' ml-2'}>
					<Radio.Group onChange={handleChange} value={selectedType}>
						<Radio value="reports"
							className={`${
								selectedType === 'reports' ? 'bg-pink-50' : 'bg-transparent'
							} absolute  pl-3 px-2 py-1 rounded-full`}>
							<PdfIcon className="absolute  bg-cover bg-no-repeat bg-center rounded-full" />
							<label className="text-#243A57 pl-8 ">Reports ({pdfCount})</label>
						</Radio>
						<Radio value="videos"
							className={`${
								selectedType ==='videos' ? 'bg-pink-50' : 'bg-transparent'
							} pl-3 px-2 py-1 ml-40 rounded-full`}>
							<YouTubeIcon className="absolute mt-1  bg-cover bg-no-repeat bg-center" />
							<label className="text-#243A57 pl-8">Videos({videoCount})</label>
						</Radio>
					</Radio.Group>
				</div>
			</div>
			{selectedType === 'reports' ? (
				<div>
					{auditData.length > 0 ? (
						auditData.map((item) => (
							<div key={item.sha}>
								<div className="mb-4">
									{item.name.endsWith('.pdf') ? (
										<><div>
											<div className="text-sm mt-6 mb-3 bg-#485F7D">
												<span className="ml-2 text-sm">{item.name.split(' - ')[0]}</span> |
												<ClockCircleOutlined className="mx-2" />
												<span>{formatDate(item.name.split(' - ')[1])}</span>
											</div>
											<a href={item.download_url} target="_blank" download onClick={() => downloadFile(item.download_url)} rel="noreferrer">
												<DocumentContainer>
													<Document file={item.download_url} onLoadSuccess={onDocumentLoadSuccess}>
														<Page renderAnnotationLayer={false} renderTextLayer={false} renderForms={false} pageNumber={1} />
													</Document>
													<div className="documentContainerdiv">
														<PdfIcon className="mr-2" />
														{item.name}
													</div>
												</DocumentContainer>
											</a>
										</div><hr className='mt-6'/></>
									) : item.name.endsWith('.png') ?(
										<><div>
											<div className="text-sm mt-6 mb-3 bg-#485F7D">
												<span className="ml-2 text-sm">{item.name.split(' - ')[0]}</span> |
												<ClockCircleOutlined className="mx-2" />
												<span>{formatDate(item.name.split(' - ')[1])}</span>
											</div>
											<button onClick={() => downloadImage(item.download_url, 'image.png')}>
												<ImageContainer>
													<img className="img " src={item.download_url} alt="PNG File" />
												</ImageContainer>
												<div className="flex justify-start p-2.5 bg-[#F6F7F9] text-small">
													<PdfIcon className="mr-2" />
													{item.name}
												</div>
											</button>
										</div><hr className='mt-6'/></>
									) :<></>}
								</div>

							</div>
						))
					) : (
						<div className='mt-10 flex justify-center align-middle '><NoDataFound className=' w-42 h-42 sm:w-58 sm:h-58 lg:w-3/4 lg:h-auto'/></div>
					)}
				</div>
			) : (
				<></>
			)}
			{selectedType === 'videos' ? (
				<div>
					{videoData.length > 0 ? (
						videoData.map((item, index) => (
							<><div key={index}>
								<div className="text-sm mt-6 mb-3 bg-#485F7D">
									<span className='ml-2 text-sm'>{item.name}</span> |
									<ClockCircleOutlined className="mx-2" />
									<span>{formatDate(item.date)}</span>
								</div>
								<p className='text-large ml-2 text-[#485F7D]'>{item.title}</p>
								<VideoContainer>
									<ReactPlayer url={item.url} controls={true} className='video'/>
									<div className='bg-[#F6F7F9]  flex justify-start items-center p-2'>
										<YouTubeIcon className='mr-3' />
										{item.title}
									</div>
								</VideoContainer>
							</div><hr className='mt-6' /></>
						))
					) : (
						<div className='mt-10 flex justify-center items-center'><NoDataFound className=' w-42 h-42 sm:w-58 sm:h-58 lg:w-3/4 lg:h-auto'/></div>
					)}
				</div>
			) : (
				<></>
			)}
		</>
	);
};

export default PostAudit;
