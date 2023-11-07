// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { IDataType } from '.';
import PdfIcon from '~assets/icons/pdfs.svg';

interface IImageViewerProps {
	item: IDataType;
	className?: string;
}

const ImageViewer: FC<IImageViewerProps> = (props) => {
	const { className, item } = props;

	//Downloading Image
	function downloadImage(url: string, name: string) {
		fetch(url)
			.then((resp) => resp.blob())
			.then((blob) => {
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
		<button
			className={`flex items-center justify-center overflow-hidden rounded-[6px] border border-solid border-[#D2D8E0] dark:border-[#3B444F] ${className}`}
			onClick={() => downloadImage(item.download_url, 'image.png')}
		>
			<div>
				<div>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						className='img'
						src={item.download_url}
						alt={item.name}
						width={100}
						height={100}
					/>
				</div>
				<div className='flex items-center gap-x-2 border-0 border-t border-solid border-t-[#D2D8E0] bg-[rgba(210,216,224,0.2)] px-4 py-[10px]'>
					<PdfIcon />
					{item.name}
				</div>
			</div>
		</button>
	);
};

export default ImageViewer;
