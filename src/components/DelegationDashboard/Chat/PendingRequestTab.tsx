// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import { EChatRequestStatus, IChat } from '~src/types';
import { useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { Button, message } from 'antd';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

interface Props {
	chat: IChat;
	setIsRejectedRequest: (state: boolean) => void;
	setIsPendingRequest: (state: boolean) => void;
	handleAcceptRequestSuccess: (chat: IChat) => void;
}

const PendingRequestTab = ({ chat, setIsRejectedRequest, setIsPendingRequest, handleAcceptRequestSuccess }: Props) => {
	const userProfile = useUserDetailsSelector();
	const { delegationDashboardAddress, loginAddress } = userProfile;

	const address = delegationDashboardAddress || loginAddress;
	const substrateAddress = getSubstrateAddress(address);

	const [loading, setLoading] = useState(false);

	const [messageApi, contextHolder] = message.useMessage();

	const success = () => {
		messageApi.open({
			className:
				'[&_.ant-message-notice-content]:bg-[#1DBF73] [&_.ant-message-notice-content]:text-white [&_svg]:filter [&_svg]:invert [&_svg]:brightness-0 flex items-center justify-end',
			content: 'Request accepted successfully!',
			duration: 2,
			style: {
				marginRight: '110px',
				marginTop: '75vh'
			},
			type: 'success'
		});
	};

	const handleRejectRequest = async (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
		e.stopPropagation();
		setLoading(true);

		const requestData = {
			address: substrateAddress,
			chatId: chat?.chatId,
			requestStatus: EChatRequestStatus.REJECTED
		};

		const { data, error } = await nextApiClientFetch<IChat>('api/v1/delegate-chat/update-request-status', requestData);
		if (data) {
			setIsRejectedRequest(true);
			setIsPendingRequest(false);

			setLoading(false);
		} else if (error) {
			console.log(error);
			setLoading(false);
		}
	};

	const handleAcceptRequest = async (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
		e.stopPropagation();
		setLoading(true);

		const requestData = {
			address: substrateAddress,
			chatId: chat?.chatId,
			requestStatus: EChatRequestStatus.ACCEPTED
		};

		const { data, error } = await nextApiClientFetch<IChat>('api/v1/delegate-chat/update-request-status', requestData);
		if (data) {
			success();
			setTimeout(() => handleAcceptRequestSuccess(chat), 1000);

			setLoading(false);
		} else if (error) {
			message.error('Failed to accept request');
			console.log(error);

			setLoading(false);
		}
	};

	return (
		<>
			{contextHolder}
			<div className='flex items-center gap-2'>
				<Button
					type='primary'
					className='rounded-lg px-5'
					onClick={handleAcceptRequest}
					disabled={loading}
				>
					Accept
				</Button>
				<Button
					className='rounded-lg border-pink_primary bg-transparent px-5 font-medium text-pink_primary'
					onClick={handleRejectRequest}
					disabled={loading}
				>
					Reject
				</Button>
			</div>
		</>
	);
};

export default PendingRequestTab;
