// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider } from 'antd';
import classNames from 'classnames';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ProfileDetailsResponse } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface Props {
	className?: string;
	userProfile: ProfileDetailsResponse;
}
interface IStats {
	label: string;
	value: number;
	src: string;
}
const ProfileStatsCard = ({ className, userProfile }: Props) => {
	const [statsArr, setStatsArr] = useState<IStats[]>([]);
	const { user_id: userId, addresses } = userProfile;
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 768) || false;

	const fetchData = async () => {
		let payload;
		if (userId !== 0 && !userId) {
			payload = { addresses: addresses };
		} else {
			payload = { userId: userId };
		}
		const { data, error } = await nextApiClientFetch<any>('/api/v1/posts/user-total-post-counts', payload);
		if (data) {
			setStatsArr([
				{ label: 'Proposal Created', src: '/assets/profile/profile-clipboard.svg', value: data?.proposals },
				{ label: 'Discussion Created', src: '/assets/icons/Calendar.svg', value: data?.discussions },
				{ label: 'Proposals Voted', src: '/assets/profile/profile-votes.svg', value: data?.votes }
			]);
		} else {
			console.log(error);
		}
	};
	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	if (!statsArr.length) return null;
	return (
		<div
			className={classNames(
				className,
				'flex gap-10 rounded-[14px] border-[1px] border-solid border-[#D2D8E0] bg-white px-4 py-6 dark:border-separatorDark dark:bg-section-dark-overlay max-md:flex-col max-md:gap-4 max-md:py-4'
			)}
		>
			{statsArr.map((item, index) => (
				<div
					className={`flex gap-2  ${
						statsArr.length - 1 !== index &&
						'border-[#D2D8E0] dark:border-separatorDark max-md:w-full max-md:flex-col max-md:border-0 max-md:border-b-[1px] max-md:border-solid max-md:pb-4'
					} max-md:py-2`}
					key={item?.label}
				>
					<div className='flex gap-2 px-2 max-md:items-center max-md:px-0'>
						<span className='flex h-full items-center justify-center rounded-[8px] border-[1px] border-solid border-[#D2D8E0] px-1 dark:border-separatorDark'>
							<Image
								src={item?.src}
								alt={item?.label}
								width={32}
								height={32}
								className='rounded-sm bg-[#F3F4F6] p-[1px] dark:bg-section-dark-overlay'
							/>
						</span>
						<div className='flex flex-col justify-center'>
							<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>{item?.label}</span>
							<span className='text-xl font-semibold text-bodyBlue dark:text-blue-dark-high max-md:text-lg'>{item?.value}</span>
						</div>
					</div>
					{!isMobile && statsArr.length - 1 !== index && (
						<Divider
							type={'vertical'}
							className='ml-10 h-full bg-[#D2D8E0] dark:bg-separatorDark max-lg:ml-0'
						/>
					)}
				</div>
			))}
		</div>
	);
};

export default ProfileStatsCard;
