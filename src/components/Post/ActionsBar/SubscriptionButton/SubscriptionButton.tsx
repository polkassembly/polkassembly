// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BookFilled, BookOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import Link from 'next/link';
import React, { FC, useCallback, useContext,useEffect, useState } from 'react';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import cleanError from 'src/util/cleanError';
import styled from 'styled-components';

import { ChangeResponseType, Subscription } from '~src/auth/types';
import { ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface ISubscriptionButtonProps {
	postId: number | string;
	proposalType: ProposalType;
}

const PopupContent = styled.span`
	font-size: 12px;
	color: var(--grey_primary);
	a {
		color: var(--pink_primary);

		&:hover {
			text-decoration: none;
			color: var(--pink_secondary);
		}
	}
`;
const SubscriptionButton: FC<ISubscriptionButtonProps> = (props) => {
	const { postId, proposalType } = props;

	const { email_verified } = useContext(UserDetailsContext);
	const [subscribed, setSubscribed] = useState(false);

	const getSubscriptionStatus = useCallback(async () => {
		const { data: subData } = await nextApiClientFetch<Subscription>( 'api/v1/auth/data/subscription', { post_id: postId, proposalType });
		if (subData?.subscribed) setSubscribed(subData?.subscribed);
	}, [postId, proposalType]);

	useEffect(() => {
		getSubscriptionStatus();
	},[getSubscriptionStatus]);

	const handleSubscribe = async () => {
		if (subscribed) {
			const { data , error } = await nextApiClientFetch<ChangeResponseType>( 'api/v1/auth/actions/postUnsubscribe', { post_id: postId, proposalType });
			if (error) {
				queueNotification({
					header: 'Failed!',
					message: cleanError(error),
					status: NotificationStatus.ERROR
				});
			}

			if (data?.message) {
				queueNotification({
					header: 'Success!',
					message: data.message,
					status: NotificationStatus.SUCCESS
				});
				setSubscribed(false);
			}
		} else {
			const { data , error } = await nextApiClientFetch<ChangeResponseType>( 'api/v1/auth/actions/postSubscribe', { post_id: postId, proposalType });
			if (error) {
				queueNotification({
					header: 'Failed!',
					message: cleanError(error),
					status: NotificationStatus.ERROR
				});
			}

			if (data?.message) {
				queueNotification({
					header: 'Success!',
					message: data.message,
					status: NotificationStatus.SUCCESS
				});
				setSubscribed(true);
			}
		}

	};

	const SubscribeButton = () => <Button
		className={`${subscribed && email_verified ? ' negative' : ''} text-pink_primary flex items-center border-none shadow-none disabled:opacity-[0.5] px-1.5 disabled:bg-transparent`}
		disabled={email_verified ? false : true}
		onClick={handleSubscribe}
	>
		{subscribed && email_verified ? <BookFilled /> : <BookOutlined />}
		{subscribed && email_verified ? 'Unsubscribe' : 'Subscribe'}
	</Button>;

	return email_verified
		?  <SubscribeButton />
		: <Tooltip color='#fff' title={<PopupContent>Set and verify an email <Link href="/settings">in your settings</Link> to be able to subscribe</PopupContent>}>
			<span><SubscribeButton/></span>
		</Tooltip>;

};

export default SubscriptionButton;
