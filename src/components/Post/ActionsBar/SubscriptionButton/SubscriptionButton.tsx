// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BookFilled, BookOutlined } from '@ant-design/icons';
import { trackEvent } from 'analytics';
import { Button } from 'antd';
import React, { FC, useState } from 'react';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import cleanError from 'src/util/cleanError';

import { ChangeResponseType } from '~src/auth/types';
import { usePostDataContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import { useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface ISubscriptionButtonProps {
	postId: number | string;
	proposalType: ProposalType;
	title?: string;
}

const SubscriptionButton: FC<ISubscriptionButtonProps> = (props) => {
	const { postId, proposalType, title } = props;
	const currentUser = useUserDetailsSelector();

	const {
		postData: { subscribers },
		setPostData
	} = usePostDataContext();

	const { id } = useUserDetailsSelector();
	const [subscribed, setSubscribed] = useState<boolean>(Boolean(id && subscribers.includes(id)));
	const [loading, setLoading] = useState(false);

	const handleSubscribe = async () => {
		if (!id) return;
		// GAEvent for post subscribe
		trackEvent('post_subscribe_clicked', 'subscribe_post', {
			postId: postId,
			postTitle: title,
			proposalType: proposalType,
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});
		setLoading(true);

		if (subscribed) {
			const { data, error } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/postUnsubscribe', { post_id: postId, proposalType });
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
				setPostData((prev) => ({
					...prev,
					subscribers: prev.subscribers.filter((subscriber) => subscriber !== id)
				}));
			}
		} else {
			const { data, error } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/postSubscribe', { post_id: postId, proposalType });
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
				setPostData((prev) => ({
					...prev,
					subscribers: [...prev.subscribers, Number(id)]
				}));
			}
		}

		setLoading(false);
	};

	const SubscribeButton = () => (
		<Button
			className={`${
				subscribed && id ? ' negative' : ''
			} flex items-center border-none px-1.5 text-pink_primary shadow-none disabled:bg-transparent disabled:opacity-[0.5] dark:bg-transparent dark:text-blue-dark-helper`}
			disabled={loading || !id}
			onClick={handleSubscribe}
		>
			{subscribed && id ? <BookFilled /> : <BookOutlined />}
			{subscribed && id ? 'Unsubscribe' : 'Subscribe'}
		</Button>
	);

	return id ? <SubscribeButton /> : <></>;
};

export default SubscriptionButton;
