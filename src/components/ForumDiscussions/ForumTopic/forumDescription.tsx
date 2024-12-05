// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTheme } from 'next-themes';
import React from 'react';
import Markdown from '~src/ui-components/Markdown';
import ShareIcon from '~assets/icons/reactions/ShareIcon.svg';
import ShareIconDark from '~assets/icons/reactions/ShareIconDark.svg';
import ForumLikeButton from '../utils/ForumLikeButton';
import { useTranslation } from 'next-i18next';

interface ForumDescriptionProps {
	description: string;
	username: string;
	like_count: number;
}

const ForumDescription = ({ like_count, description, username }: ForumDescriptionProps) => {
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common');

	const share = () => {
		let message = t('share_message', { username });
		message += `\n${t('share_link', { link: global.window.location.href })}`;

		const twitterParameters = [`text=${encodeURIComponent(message)}`, 'via=' + encodeURIComponent('polk_gov')];
		const url = 'https://twitter.com/intent/tweet?' + twitterParameters.join('&');
		global.window.open(url);
	};

	return (
		<div className='mt-4'>
			<div>
				{description && (
					<Markdown
						className=''
						md={description}
						theme={theme}
						disableQuote={true}
					/>
				)}
			</div>
			<div className='mt-6 flex items-center justify-between'>
				<ForumLikeButton like_count={like_count} />
				<div
					onClick={share}
					className='cursor-pointer'
				>
					<span className='flex items-center gap-1 rounded-md bg-[#F4F6F8] px-2 py-[5px] hover:bg-[#ebecee] dark:bg-[#1F1F21] dark:hover:bg-[#313133]'>
						{theme === 'dark' ? <ShareIconDark /> : <ShareIcon />}
						<span className='font-medium text-lightBlue dark:text-icon-dark-inactive'>{t('share')}</span>
					</span>
				</div>
			</div>
		</div>
	);
};

export default ForumDescription;
