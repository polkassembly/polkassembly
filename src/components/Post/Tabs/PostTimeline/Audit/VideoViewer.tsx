// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import ReactPlayer from 'react-player';
// import YouTubeIcon from '~assets/icons/video.svg';
import { IDataVideoType } from '.';
import ImageIcon from '~src/ui-components/ImageIcon';

interface IVideoViewerProps {
	item: IDataVideoType;
	className?: string;
}

const VideoViewer: FC<IVideoViewerProps> = (props) => {
	const { item, className } = props;
	return (
		<section className={`flex flex-col overflow-hidden rounded-sm border border-solid border-section-light-container dark:border-[#3B444F] ${className}`}>
			<div>
				<article className='flex items-center justify-center pt-6 '>
					<ReactPlayer
						url={item.url}
						controls={true}
					/>
				</article>
				<article className='flex items-center gap-x-2 border-0 border-t border-solid border-t-section-light-container bg-[rgba(210,216,224,0.2)] px-4 py-[10px]'>
					<span className='flex items-center justify-center'>
						{/* <YouTubeIcon /> */}
						<ImageIcon
							src='/assets/icons/video.svg'
							imgWrapperClassName='w-4 h-4 flex items-center justify-center bg-cover bg-center bg-no-repeat'
							alt='video icon'
						/>
					</span>
					<p className='m-0'>{item.title}</p>
				</article>
			</div>
		</section>
	);
};

export default VideoViewer;
