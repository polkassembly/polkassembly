// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { ClockCircleOutlined ,LoadingOutlined } from '@ant-design/icons';
import { Radio, Spin } from 'antd';
import { ProposalType } from '~src/global/proposalType';
import { usePostDataContext } from 'src/context';
import CautionSVG from '~assets/icons/caution.svg';
import YouTubeIcon from '~assets/icons/video.svg';
import PdfIcon from '~assets/icons/pdfs.svg';
import PdfViewer from './PdfViewer';
import VideoViewer from './VideoViewer';
import NoAuditReport from './NoAuditReport';
import ImageViewer from './ImageViewer';
import { useNetworkSelector } from '~src/redux/selectors';

export interface IDataType {
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

export interface IDataVideoType {
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

const PostAudit = () => {

	const { network } = useNetworkSelector();
	const { postData } = usePostDataContext();

	// Fetching data
	const [auditData, setAuditData] = useState<IDataType[]>([]);
	const [videoData, setVideoData] = useState<IDataVideoType[]>([]);
	const [loadingAudit , setLoadingAudit] = useState(true);
	const [loadingVideo , setLoadingVideo] = useState(true);

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
			setLoadingAudit(true);
			const response = await fetch(`https://api.github.com/repos/CoinStudioDOT/OpenGov/contents/${networkModified}/${postType}/${postData.postIndex}`,
				{
					headers: {
						'Accept': 'application/vnd.github.v3+json',
						'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
						'X-GitHub-Api-Version': '2022-11-28'
					}
				}
			);
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
		setLoadingAudit(false);
	};
	const videosData = async () => {
		try {
			setLoadingVideo(true);
			const response = await fetch(`https://api.github.com/repos/CoinStudioDOT/OpenGov/contents/${networkModified}/${postType}/${postData.postIndex}/video.json`,
				{
					headers: {
						'Accept': 'application/vnd.github.v3+json',
						'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
						'X-GitHub-Api-Version': '2022-11-28'
					}
				});
			if (response.ok) {
				const data = await response.json();
				const decoded = atob(data.content);
				setVideoData(JSON.parse(decoded) as IDataVideoType[]);
			} else {
				throw new Error('Request failed');
			}
		}
		catch (error) {
			console.log('Error:', error);
		}
		setLoadingVideo(false);
	};

	useEffect(() => {
		productData().then(() => {});
		videosData().then(() => {});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// showing count of pdfs and videos
	function getCountByType(data: any[]): number {
		let count = 0;

		for (const file of data) {
			if (file.name.endsWith('.pdf') || file.name.endsWith('.png')) {
				count++;
			}
		}
		return count;
	}
	const pdfCount = getCountByType(auditData);

	// For filtering data based on pdfs and videos

	const [selectedType, setSelectedType] = useState<string>('reports');
	const handleChange = (e: any) => {
		setSelectedType(e.target.value);
	};
	useEffect(() => {
		const pdfCount = getCountByType(auditData);
		const selectedValue = pdfCount === 0 ?'videos':'reports';
		setSelectedType(selectedValue);
	},[auditData,videoData]);
	return (
		<Spin spinning={loadingAudit || loadingVideo} indicator={<LoadingOutlined/>}>
			<div className='min-h-[400px]'>
				{
					!(loadingAudit || loadingVideo)?
						<>
							{
								pdfCount || videoData.length?
									<div
										className='flex items-center gap-x-[11px] p-[15px] rounded-[6px] bg-[#E6F4FF] mt-3'
									>
										<span
											className='flex items-center justify-center'
										>
											<CautionSVG />
										</span>
										<p className='m-0 font-normal text-sm leading-[21px] text-[#243A57]'>
							The reports provided here does not represent Polkassembly&apos;s views and we do not endorse them.
										</p>
									</div>
									: <NoAuditReport />
							}
							<div
								className='mt-4'
							>
								<Radio.Group className='flex m-0' onChange={handleChange} value={selectedType} >
									{pdfCount !== 0  && <Radio value="reports"
										className={`${selectedType === 'reports' ? 'bg-pink-50' : 'bg-transparent'} rounded-full flex items-center px-4 py-[7px]`}>
										<div className='flex items-center'>
											<PdfIcon className="bg-cover bg-no-repeat bg-center" />
											<span className="text-[#243A57] pl-1"><span className='hidden md:inline-block'>Reports</span>{' '}({pdfCount})</span>
										</div>
									</Radio>}
									{videoData.length !== 0 && <Radio value="videos"
										className={`${selectedType ==='videos' ? 'bg-pink-50' : 'bg-transparent'} rounded-full flex items-center px-4 py-[7px]`}>
										<div className='flex items-center'>
											<YouTubeIcon className="bg-cover bg-no-repeat bg-center" />
											<span className="text-[#243A57] pl-1"><span className='hidden md:inline-block'>Videos</span> {' '} ({videoData.length})</span>
										</div>
									</Radio>}
								</Radio.Group>
							</div>
							{selectedType === 'reports' && pdfCount > 0 ? (
								<section>
									{ (
										auditData.filter((item) => (item.name.endsWith('.pdf') || item.name.endsWith('.png'))).map((item, index) => {
											const date = formatDate(item.name.split(' - ')[1]);
											return (
												<article key={item.sha} className={`flex flex-col gap-y-6 py-[26px] ${index !== 0? 'border-0 border-t border-solid border-[#D2D8E0]': ''}`}>
													<p className="text-[#485F7D] m-0 text-sm leading-[18px] font-normal flex items-center gap-x-2">
														<span>{item.name.split(' - ')[0]}</span>
														{
															date.includes('NaN')?
																null
																: <> |
																	<ClockCircleOutlined />
																	<span>{date}</span>

																</>
														}
													</p>
													{
														item.name.endsWith('.pdf') ? (
															<PdfViewer
																item={item}
															/>
														) : item.name.endsWith('.png') ?(
															<ImageViewer
																item={item}
															/>
														) : null}
												</article>
											);
										}))
									}
								</section>
							) : (
								<></>
							)}
							{
								selectedType === 'videos' && videoData.length > 0 ? (
									<section>
										{
											videoData.map((item, index) => (
												<article key={item.title} className={`flex flex-col gap-y-6 py-[26px] ${index !== 0? 'border-0 border-t border-solid border-[#D2D8E0]': ''}`}>
													<p className="text-[#485F7D] m-0 text-sm leading-[18px] font-normal flex items-center gap-x-2">
														<span>{item.name}</span> |
														<ClockCircleOutlined />
														<span>{formatDate(item.date)}</span>
													</p>
													<VideoViewer
														item={item}
													/>
												</article>
											))
										}
									</section>
								) : null
							}

						</>
						: null
				}
			</div>
		</Spin>
	);
};

export default PostAudit;
