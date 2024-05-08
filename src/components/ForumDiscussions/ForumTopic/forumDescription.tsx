// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTheme } from 'next-themes';
import React from 'react';
import Markdown from '~src/ui-components/Markdown';
import LikeOutlined from '~assets/icons/reactions/LikeOutlined.svg';
import LikeOutlinedDark from '~assets/icons/reactions/LikeOutlinedDark.svg';
import ShareIcon from '~assets/icons/reactions/ShareIcon.svg';
import ShareIconDark from '~assets/icons/reactions/ShareIconDark.svg';

interface ForumDescriptionProps {
	description: string;
	like_count: number;
}

const ForumDescription = ({ like_count, description }: ForumDescriptionProps) => {
	const { resolvedTheme: theme } = useTheme();

	// const share = () => {
	// const twitterHandle = socialsData?.twitter.substring(socialsData.twitter.lastIndexOf('/') + 1);

	// let message = `The referendum ${title ? `for ${title}` : ''} is now live for @${twitterHandle} \n`;
	// message += `Cast your vote here: ${global.window.location.href}`;

	// const twitterParameters = [`text=${encodeURI(message)}`, 'via=' + encodeURI('polk_gov')];

	// const url = 'https://twitter.com/intent/tweet?' + twitterParameters.join('&');
	// global.window.open(url);
	// };

	return (
		<div className='mt-4'>
			{description && (
				<Markdown
					className='post-content'
					md={description}
					theme={theme}
				/>
			)}
			<div className=' mt-6 flex items-center justify-between'>
				<span className='flex w-min cursor-not-allowed items-center gap-1 rounded-md bg-[#F4F6F8] px-2 py-[1.5px] hover:bg-[#ebecee] dark:bg-[#1F1F21] dark:hover:bg-[#313133]'>
					<span className='mt-1'>{theme == 'dark' ? <LikeOutlinedDark /> : <LikeOutlined />}</span>
					<span className='text-xs font-semibold text-lightBlue dark:text-icon-dark-inactive'>{like_count}</span>
				</span>
				<div
					// onClick={share}
					className=' cursor-pointer'
				>
					<span className='flex items-center gap-1 rounded-md bg-[#F4F6F8] px-2 py-[5px] hover:bg-[#ebecee] dark:bg-[#1F1F21] dark:hover:bg-[#313133] '>
						{theme == 'dark' ? <ShareIconDark /> : <ShareIcon />}
						<span className='font-medium text-lightBlue dark:text-icon-dark-inactive'>Share</span>
					</span>
				</div>
			</div>
		</div>
	);
};

export default ForumDescription;
