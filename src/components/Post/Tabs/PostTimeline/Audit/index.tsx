// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Radio } from 'antd';
import CautionSVG from '~assets/icons/caution.svg';
// import YouTubeIcon from '~assets/icons/video.svg';
// import PdfIcon from '~assets/icons/pdfs.svg';
import PdfViewer from './PdfViewer';
import VideoViewer from './VideoViewer';
import NoAuditReport from './NoAuditReport';
import ImageViewer from './ImageViewer';
import ImageIcon from '~src/ui-components/ImageIcon';

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
	name: string;
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
	const suffix = suffixes[(relevantDigits - 20) % 10] || suffixes[relevantDigits] || suffixes[0];

	return suffix;
}
interface Props {
	auditData: IDataType[];
	videoData: IDataVideoType[];
}

const PostAudit = ({ auditData, videoData }: Props) => {
	const [selectedType, setSelectedType] = useState<string>('reports');
	const handleChange = (e: any) => {
		setSelectedType(e.target.value);
	};
	const pdfCount = auditData?.filter((file: any) => file.name.endsWith('.pdf') || file.name.endsWith('.png')).length;

	useEffect(() => {
		const pdfCount = auditData?.filter((file: any) => file.name.endsWith('.pdf') || file.name.endsWith('.png')).length;
		const selectedValue = pdfCount === 0 ? 'videos' : 'reports';
		setSelectedType(selectedValue);
	}, [auditData, videoData]);
	return (
		<div className='min-h-[400px]'>
			{
				<>
					{pdfCount || videoData.length ? (
						<div className='mt-3 flex items-center gap-x-[11px] rounded-sm bg-[#E6F4FF] p-[15px] dark:bg-section-dark-background'>
							<span className='flex items-center justify-center'>
								<CautionSVG />
							</span>
							<p className='m-0 text-sm font-normal leading-[21px] text-blue-light-high dark:text-blue-dark-high '>
								Reports provided here represent the auditor&apos;s views and are not endorsed by Polkassembly
							</p>
						</div>
					) : (
						<NoAuditReport />
					)}
					<div className='mt-4'>
						<Radio.Group
							className='m-0 flex'
							onChange={handleChange}
							value={selectedType}
						>
							{pdfCount !== 0 && (
								<Radio
									value='reports'
									className='flex items-center rounded-full bg-pink-50 px-4 py-[7px] dark:bg-section-dark-background'
								>
									<div className='flex items-center'>
										{/* <PdfIcon className='bg-cover bg-center bg-no-repeat' /> */}
										<ImageIcon
											src='/assets/icons/pdfs.svg'
											alt='pdfs icon'
											imgClassName='bg-cover bg-center bg-no-repeat'
										/>
										<span className='pl-1 text-blue-light-high dark:text-blue-dark-high'>
											<span className='hidden md:inline-block'>Reports</span> ({pdfCount})
										</span>
									</div>
								</Radio>
							)}
							{videoData.length !== 0 && (
								<Radio
									value='videos'
									className='flex items-center rounded-full bg-pink-50 px-4 py-[7px] dark:bg-section-dark-background'
								>
									<div className='flex items-center'>
										{/* <YouTubeIcon className='bg-cover bg-center bg-no-repeat' /> */}
										<ImageIcon
											src='/assets/icons/video.svg'
											imgClassName='bg-cover bg-center bg-no-repeat'
											alt='video icon'
										/>
										<span className='pl-1 text-blue-light-high dark:text-blue-dark-high'>
											<span className='hidden md:inline-block'>Videos</span> ({videoData.length})
										</span>
									</div>
								</Radio>
							)}
						</Radio.Group>
					</div>
					{selectedType === 'reports' && pdfCount > 0 ? (
						<section>
							{auditData
								.filter((item) => item.name.endsWith('.pdf') || item.name.endsWith('.png'))
								.map((item, index) => {
									const date = formatDate(item.name.split(' - ')[1]);
									return (
										<article
											key={item.sha}
											className={`flex flex-col gap-y-6 py-[26px] ${index !== 0 ? 'border-0 border-t border-solid border-section-light-container dark:border-[#3B444F]' : ''}`}
										>
											<p className='m-0 flex items-center gap-x-2 text-sm font-normal leading-[18px] text-[#485F7D] dark:text-blue-dark-medium'>
												<span>{item.name.split(' - ')[0]}</span>
												{date.includes('NaN') ? null : (
													<>
														{' '}
														|
														<ClockCircleOutlined />
														<span>{date}</span>
													</>
												)}
											</p>
											{item.name.endsWith('.pdf') ? <PdfViewer item={item} /> : item.name.endsWith('.png') ? <ImageViewer item={item} /> : null}
										</article>
									);
								})}
						</section>
					) : (
						<></>
					)}
					{selectedType === 'videos' && videoData.length > 0 ? (
						<section>
							{videoData.map((item, index) => (
								<article
									key={item.title}
									className={`flex flex-col gap-y-6 py-[26px] ${index !== 0 ? 'border-0 border-t border-solid border-section-light-container dark:border-[#3B444F]' : ''}`}
								>
									<p className='m-0 flex items-center gap-x-2 text-sm font-normal leading-[18px] text-[#485F7D] dark:text-blue-dark-medium'>
										<span>{item.name}</span> |
										<ClockCircleOutlined />
										<span>{formatDate(item.date)}</span>
									</p>
									<VideoViewer item={item} />
								</article>
							))}
						</section>
					) : null}
				</>
			}
		</div>
	);
};

export default PostAudit;
