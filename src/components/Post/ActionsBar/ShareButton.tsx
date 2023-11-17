// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ShareAltOutlined } from '@ant-design/icons';
import { trackEvent } from 'analytics';
import { Button } from 'antd';
import React, { FC } from 'react';
import { ProposalType } from '~src/global/proposalType';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';

interface IShareButtonProps {
	postId: number | string;
	proposalType: ProposalType;
	title?: string;
}
const ShareButton: FC<IShareButtonProps> = (props) => {
	const { postId, proposalType, title } = props;
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();

	const share = () => {
		// GAEvent for post sharing
		trackEvent('post_share_clicked', 'share_post', {
			postId: postId,
			postTitle: title,
			proposalType: proposalType,
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});
		const twitterParameters = [];

		twitterParameters.push(`url=${encodeURI(global.window.location.href)}`);

		if (title) {
			twitterParameters.push(`text=${encodeURI(`[${network}] ${title}`)}`);
		}

		twitterParameters.push('via=' + encodeURI('polkassembly'));

		const url = 'https://twitter.com/intent/tweet?' + twitterParameters.join('&');

		global.window.open(url);
	};

	return (
		<>
			<Button
				className={'flex items-center border-none px-1 text-pink_primary shadow-none dark:bg-transparent dark:text-blue-dark-helper md:px-2'}
				onClick={share}
			>
				<ShareAltOutlined /> {' Share'}
			</Button>
		</>
	);
};

export default ShareButton;
