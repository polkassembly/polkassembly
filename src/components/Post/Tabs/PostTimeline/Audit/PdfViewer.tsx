// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { DownloadOutlined } from '@ant-design/icons';
import React, { FC } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Image from 'next/image';
import LoadingEffect from '~assets/audit-loader.gif';
import PdfIcon from '~assets/icons/pdfs.svg';
import { IDataType } from '.';
import styled from 'styled-components';
import { Modal } from 'antd';

// for showing pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface IPdfViewerProps {
	item: IDataType;
	className?: string;
}

const PdfViewer: FC<IPdfViewerProps> = (props) => {
	const { className, item } = props;
	const [open, setOpen] = React.useState(false);
	const downloadFile = (url: string) => {
		const link = document.createElement('a');
		link.href = url;
		link.target = '_self';
		link.target = '_blank';
		link.download = '';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};
	return (
		<>
			<button
<<<<<<< HEAD
				className={`outline-none bg-transparent flex border border-solid border-[#D2D8E0] dark:border-separatorDark rounded-[6px] overflow-hidden items-center justify-center ${className}`}
=======
				className={`flex items-center justify-center overflow-hidden rounded-[6px] border border-solid border-[#D2D8E0] bg-transparent outline-none ${className}`}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
				onClick={() => setOpen(true)}
			>
				<div className='w-full flex-1'>
					<article className='relative p-2'>
<<<<<<< HEAD
						<div className='overflow-hidden h-[300px] relative rounded-md border border-solid border-[#D2D8E0] dark:border-separatorDark'>
=======
						<div className='relative h-[300px] overflow-hidden rounded-md border border-solid border-[#D2D8E0]'>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
							<Document
								file={item.download_url}
								loading={
									<div className='flex h-[300px] items-center justify-center'>
										<Image
											src={LoadingEffect}
											height={100}
											width={100}
											alt='loader'
										/>
									</div>
								}
							>
								<Page
									renderAnnotationLayer={false}
									renderTextLayer={false}
									renderForms={false}
									pageNumber={1}
								/>
							</Document>
						</div>
					</article>
<<<<<<< HEAD
					<article className="px-4 py-[10px] bg-[rgba(210,216,224,0.2)] flex gap-x-2 items-center border-0 border-t border-solid border-t-[#D2D8E0] dark:border-t-separatorDark">
=======
					<article className='flex items-center gap-x-2 border-0 border-t border-solid border-t-[#D2D8E0] bg-[rgba(210,216,224,0.2)] px-4 py-[10px]'>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
						<span className='flex items-center justify-center'>
							<PdfIcon />
						</span>
						<p className='m-0'>{item.name}</p>
					</article>
				</div>
			</button>
			<Modal
				open={open}
				onCancel={() => setOpen(false)}
				footer={false}
				className='w-full lg:max-w-[1024px]'
				title={
					<button
						onClick={() => {
							downloadFile(item.download_url);
						}}
						className='m-0 flex cursor-pointer items-center border-none bg-transparent text-base outline-none'
					>
						<DownloadOutlined />
					</button>
				}
			>
				<div className='pdf max-h-[calc(100vh-200px)] w-auto overflow-hidden overflow-y-auto'>
					<Document
						file={item.download_url}
						loading={
							<div className='flex h-[300px] items-center justify-center'>
								<Image
									src={LoadingEffect}
									height={100}
									width={100}
									alt='loader'
								/>
							</div>
						}
					>
						<Page
							renderAnnotationLayer={false}
							renderTextLayer={false}
							renderForms={false}
							pageNumber={1}
						/>
					</Document>
				</div>
			</Modal>
		</>
	);
};

export default styled(PdfViewer)`
	.react-pdf__Page__canvas {
		width: auto !important;
		position: absolute !important;
		top: 0 !important;
		left: 50% !important;
		transform: translate(-50%, 0) !important;
		z-index: 99999 !important;
		scale: 1.1 !important;
	}
`;
