// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { UserProfileImage } from 'pages/api/v1/auth/data/getUsersProfileImages';
import ImageComponent from '~src/components/ImageComponent';
import Loader from '~src/ui-components/Loader';
import Link from 'next/link';
import { useNetworkSelector } from '~src/redux/selectors';
import classNames from 'classnames';
import { dmSans } from 'pages/_app';

interface TooltipContentProps {
	users: UserProfileImage[];
	usernames: string[];
	isLoading: boolean;
}

const TooltipContent: React.FC<TooltipContentProps> = ({ users, usernames, isLoading }) => {
	const { network } = useNetworkSelector();

	const filteredUsers = users.filter((_, index) => usernames[index] !== undefined);

	const allUsers = filteredUsers.map((user) => ({
		id: user?.id,
		image: user?.image || '',
		username: user?.username || ''
	}));

	return (
		<div className={classNames('max-h-24 w-min overflow-y-auto', dmSans.className, dmSans.variable)}>
			{isLoading ? (
				<Loader className='h-7 w-7' />
			) : (
				<div>
					{allUsers.map((user) => (
						<Link
							href={`https://${network}.polkassembly.io/user/${user.username}`}
							key={user.id}
							target='_blank'
							className='mb-[6px] flex items-center gap-[6px]'
						>
							<ImageComponent
								src={user?.image}
								alt='User Picture'
								className='flex h-[20px] w-[20px] items-center justify-center bg-transparent'
								iconClassName='flex items-center justify-center text-[#FCE5F2] text-xxl w-full h-full rounded-full'
							/>
							<span className='mr-2 text-xs font-medium text-blue-light-high hover:text-pink_primary dark:text-blue-dark-high'>{user.username}</span>
						</Link>
					))}
				</div>
			)}
		</div>
	);
};

export default TooltipContent;
