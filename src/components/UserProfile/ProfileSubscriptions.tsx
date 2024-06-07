// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import classNames from 'classnames';
import { SubscriptionsIcon } from '~src/ui-components/CustomIcons';
import Image from 'next/image';
import Link from 'next/link';
import { useNetworkSelector } from '~src/redux/selectors';
import { Divider } from 'antd';

interface Props {
	className?: string;
}

const ProfileSubscriptions = ({ className }: Props) => {
	const { network } = useNetworkSelector();
	return (
		<div
			className={classNames(
				className,
				'mt-6 flex min-h-[280px] flex-col gap-5 rounded-[14px] border-[1px] border-solid border-[#D2D8E0] bg-white px-6 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
			)}
		>
			<div className='flex items-center space-x-1'>
				<SubscriptionsIcon className='active-icon text-[24px] text-lightBlue dark:text-[#9E9E9E]' />
				<span className='ml-2 text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>Subscriptions</span>
				<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>(02)</span>
			</div>

			{/* Cards */}
			<div className='p-2'>
				<div className='my-3'>
					<div className='flex items-center space-x-1'>
						<span className='text-sm font-semibold text-blue-light-high dark:to-blue-dark-high'>Marsha Fisher</span>
						<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>subscribed to</span>
					</div>
					{/* 140 words */}
					<div>
						<span className='text-xs font-semibold text-blue-light-medium dark:text-blue-dark-medium'>
							‘Standard Guidelines to judge Liquidity Treasury Proposals on the main governance side - Kusama and Polkadot your necleo at dui euismod ...’
						</span>
						<Link
							href={`https://${network}.polkassembly.io/`}
							target='_blank'
						>
							<Image
								src='/assets/icons/redirect.svg'
								alt='redirection-icon'
								width={16}
								height={16}
								className=''
							/>
						</Link>
					</div>
				</div>
				<Divider className='m-0 bg-[#D2D8E0] p-0 dark:bg-separatorDark' />
			</div>
		</div>
	);
};

export default ProfileSubscriptions;
