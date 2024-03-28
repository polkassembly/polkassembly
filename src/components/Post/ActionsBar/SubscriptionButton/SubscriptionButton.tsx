// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { trackEvent } from 'analytics';
import React, { FC, useState } from 'react';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import cleanError from 'src/util/cleanError';
import { ChangeResponseType } from '~src/auth/types';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { usePostDataContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import { useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import SubscribeOutlined from '~assets/icons/reactions/SubscribedIcon.svg';
import SubscribedIconDark from '~assets/icons/reactions/SubscribedIconDark.svg';
import SubscribeFilled from '~assets/icons/reactions/SubscribedFilled.svg';
import { useTheme } from 'next-themes';

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
	const { resolvedTheme: theme } = useTheme();

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
		<CustomButton
			variant='default'
			disabled={loading || !id}
			onClick={handleSubscribe}
			className={`shadow-0 border-none bg-transparent px-0 font-normal disabled:opacity-[0.5] dark:text-blue-dark-helper ${subscribed && id ? ' negative' : ''}`}
		>
			<span className='flex items-center gap-[6px] rounded-md bg-[#F4F6F8] px-2 py-[2px] hover:bg-[#ebecee] dark:bg-[#1F1F21] dark:hover:bg-[#313133]'>
				<span className='mt-[3px]'>{subscribed && id ? <SubscribeFilled /> : theme == 'dark' ? <SubscribedIconDark /> : <SubscribeOutlined />}</span>
				<span className={`font-medium ${subscribed && id ? 'text-pink_primary' : 'text-lightBlue dark:text-icon-dark-inactive'}`}>
					{subscribed && id ? 'Unsubscribe' : 'Subscribe'}
				</span>
			</span>
		</CustomButton>
	);

	return id ? <SubscribeButton /> : <></>;
};

export default SubscriptionButton;
