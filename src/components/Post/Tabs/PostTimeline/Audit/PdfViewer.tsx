// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { DownloadOutlined } from '@ant-design/icons';
import React, { FC } from 'react';
import { Document, Page, pdfjs  } from 'react-pdf';
import Image from 'next/image';
import LoadingEffect from '~assets/wired-outline-334-loader-5.gif';
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
			<a className={`flex border border-solid border-[#D2D8E0] rounded-[6px] overflow-hidden items-center justify-center ${className}`} onClick={() => setOpen(true)} rel="noreferrer">
				<div>
					<article className='-mt-10 md:-mt-5 md:-mx-5 relative'>
						<Document
							file={item.download_url}
							loading= {
								<div className='flex justify-center items-center h-[300px]'>
									<Image src={LoadingEffect} height={100} width={100} alt='loader'/>
								</div>
							}
						>
							<Page renderAnnotationLayer={false} renderTextLayer={false} renderForms={false} pageNumber={1} />
						</Document>
					</article>
					<article className="px-4 py-[10px] bg-[rgba(210,216,224,0.2)] flex gap-x-2 items-center border-0 border-t border-solid border-t-[#D2D8E0]">
						<span className='flex items-center justify-center'>
							<PdfIcon />
						</span>
						<p className='m-0'>
							{item.name}
						</p>
					</article>
				</div>
			</a>
			<Modal
				open={open}
				onCancel={() => setOpen(false)}
				footer={false}
				className='w-full lg:max-w-[1024px]'
				title={<button onClick={() => {
					downloadFile(item.download_url);
				}} className='cursor-pointer text-base flex items-center m-0 border-none outline-none bg-transparent'>
					<DownloadOutlined />
				</button>}
			>
				<div className='overflow-hidden overflow-y-auto max-h-[calc(100vh-200px)] pdf w-auto'>
					<Document
						file={item.download_url}
						loading= {
							<div className='flex justify-center items-center h-[300px]'>
								<Image src={LoadingEffect} height={100} width={100} alt='loader'/>
							</div>
						}
					>
						<Page renderAnnotationLayer={false} renderTextLayer={false} renderForms={false} pageNumber={1} />
					</Document>
				</div>
			</Modal>
		</>
	);
};

export default styled(PdfViewer)`
    .react-pdf__Page {
	    width: 100% !important;
        display: flex !important;
        justify-content: center !important;
        overflow: hidden !important;
        border: 1px solid #D2D8E0;
        height: 300px !important;
    }
    .react-pdf__Page__canvas {
        width: 100% !important;
    }
`;