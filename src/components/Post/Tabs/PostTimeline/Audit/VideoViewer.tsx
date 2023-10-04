// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import ReactPlayer from 'react-player';
import YouTubeIcon from '~assets/icons/video.svg';
import { IDataVideoType } from '.';

interface IVideoViewerProps {
	item: IDataVideoType;
	className?: string;
}

const VideoViewer: FC<IVideoViewerProps> = (props) => {
	const { item, className } = props;
	return (
<<<<<<< HEAD
		<section className={`flex flex-col border border-solid border-[#D2D8E0] dark:border-separatorDark rounded-[6px] overflow-hidden ${className}`}>
=======
		<section className={`flex flex-col overflow-hidden rounded-[6px] border border-solid border-[#D2D8E0] ${className}`}>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
			<div>
				<article className='flex items-center justify-center pt-6 '>
					<ReactPlayer
						url={item.url}
						controls={true}
					/>
				</article>
<<<<<<< HEAD
				<article className='px-4 py-[10px] bg-[rgba(210,216,224,0.2)] flex gap-x-2 items-center border-0 border-t border-solid border-t-[#D2D8E0] dark:border-t-separatorDark'>
=======
				<article className='flex items-center gap-x-2 border-0 border-t border-solid border-t-[#D2D8E0] bg-[rgba(210,216,224,0.2)] px-4 py-[10px]'>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
					<span className='flex items-center justify-center'>
						<YouTubeIcon />
					</span>
					<p className='m-0'>{item.title}</p>
				</article>
			</div>
		</section>
	);
};

export default VideoViewer;
