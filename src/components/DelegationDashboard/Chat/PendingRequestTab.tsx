// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { EChatRequestStatus, IChat } from '~src/types';
import { useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { Button } from 'antd';

interface Props {
	chat: IChat;
	setIsRejectedRequest: (state: boolean) => void;
	setIsPendingRequest: (state: boolean) => void;
}

const PendingRequestTab = ({ chat, setIsRejectedRequest, setIsPendingRequest }: Props) => {
	const userProfile = useUserDetailsSelector();
	const { delegationDashboardAddress, loginAddress } = userProfile;

	const address = delegationDashboardAddress || loginAddress;

	const handleRejectRequest = async (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
		e.stopPropagation();

		const requestData = {
			address,
			chatId: chat?.chatId,
			requestStatus: EChatRequestStatus.REJECTED
		};

		const { data, error } = await nextApiClientFetch<IChat>('api/v1/delegate-chat/update-request-status', requestData);
		if (data) {
			setIsRejectedRequest(true);
			setIsPendingRequest(false);
		} else if (error) {
			console.log(error);
		}
	};

	return (
		<div className='flex items-center gap-2'>
			<Button
				type='primary'
				className='rounded-lg px-5'
			>
				Accept
			</Button>
			<Button
				className='rounded-lg border-pink_primary bg-transparent px-5 font-medium text-pink_primary'
				onClick={handleRejectRequest}
			>
				Reject
			</Button>
		</div>
	);
};

export default PendingRequestTab;
