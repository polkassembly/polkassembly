// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ShareAltOutlined } from '@ant-design/icons';
import { trackEvent } from 'analytics';
import React, { FC } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
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
			<CustomButton
				onClick={share}
				variant='default'
				className='m-0 border-none px-1 py-2'
			>
				<ShareAltOutlined /> {' Share'}
			</CustomButton>
		</>
	);
};

export default ShareButton;
