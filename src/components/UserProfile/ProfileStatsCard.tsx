// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider, Spin } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { ProfileDetailsResponse } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IStats } from '.';
import { ClipboardIcon, VotesIcon } from '~src/ui-components/CustomIcons';

interface Props {
	className?: string;
	userProfile: ProfileDetailsResponse;
	addressWithIdentity?: string;
	theme?: string;
	statsArr: IStats[];
	setStatsArr: (pre: IStats[]) => void;
}

const ProfileStatsCard = ({ className, userProfile, addressWithIdentity, statsArr, setStatsArr }: Props) => {
	const { user_id: userId, addresses } = userProfile;
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 768) || false;
	const [loading, setLoading] = useState<boolean>(false);

	const getIcon = (state: string) => {
		switch (state) {
			case 'Proposal Created':
				return <ClipboardIcon className='text-2xl text-lightBlue dark:text-[#9E9E9E]' />;
			case 'Discussion Created':
				return <ClipboardIcon className='text-2xl text-lightBlue dark:text-[#9E9E9E]' />;
			case 'Proposals Voted':
				return <VotesIcon className='text-2xl text-lightBlue dark:text-[#9E9E9E]' />;
		}
	};
	const fetchData = async () => {
		let payload;
		setLoading(true);
		if (userId !== 0 && !userId && addresses.length) {
			payload = { addresses: addresses || [addressWithIdentity] };
		} else {
			payload = { addresses: addresses || [addressWithIdentity], userId: userId };
		}
		const { data, error } = await nextApiClientFetch<any>('/api/v1/posts/user-total-post-counts', payload);
		if (data) {
			setStatsArr([
				{
					label: 'Proposal Created',
					value: data?.proposals
				},
				{
					label: 'Discussion Created',
					value: data?.discussions
				},
				{ label: 'Proposals Voted', value: data?.votes }
			]);
			setLoading(false);
		} else {
			console.log(error);
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userProfile]);

	return (
		<Spin spinning={loading}>
			<div
				className={classNames(
					className,
					'flex gap-10 rounded-[14px] border-[1px] border-solid border-section-light-container bg-white px-4 py-6 dark:border-separatorDark dark:bg-section-dark-overlay max-md:flex-col max-md:gap-4 max-md:py-4 md:h-[100px]'
				)}
			>
				{statsArr.map((item, index) => (
					<div
						className={`flex gap-2  ${
							statsArr.length - 1 !== index &&
							'border-section-light-container dark:border-separatorDark max-md:w-full max-md:flex-col max-md:border-0 max-md:border-b-[1px] max-md:border-solid max-md:pb-4'
						} max-md:py-2`}
						key={item?.label}
					>
						<div className='flex gap-2 px-2 max-md:items-center max-md:px-0'>
							<span className='flex h-full items-center justify-center rounded-xl border-[1px] border-solid border-section-light-container bg-[#F3F4F6] px-2.5 text-lightBlue dark:border-separatorDark dark:bg-transparent dark:text-[#9E9E9E]'>
								{getIcon(item?.label)}
							</span>
							<div className='flex flex-col justify-center'>
								<span className='text-[13px] text-lightBlue dark:text-blue-dark-medium'>{item?.label}</span>
								<span className='text-xl font-semibold text-bodyBlue dark:text-blue-dark-high max-md:text-lg'>{item?.value}</span>
							</div>
						</div>
						{!isMobile && statsArr.length - 1 !== index && (
							<Divider
								type={'vertical'}
								className='ml-10 h-full bg-section-light-container dark:bg-separatorDark max-lg:ml-0'
							/>
						)}
					</div>
				))}
			</div>
		</Spin>
	);
};

export default ProfileStatsCard;
