// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { VerifiedIcon } from '~src/ui-components/CustomIcons';
import { ISocialLayout } from './types';
import { Spin } from 'antd';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { ESocials, VerificationStatus } from '~src/types';
import useIsMobile from '~src/hooks/useIsMobile';

const SocialsLayout = ({ title, description, value, onVerify, verified, status, loading, fieldName }: ISocialLayout) => {
	const isMobile = useIsMobile();
	return (
		<Spin
			spinning={loading}
			className='-mt-4'
		>
			<div className='ml-2 flex h-[70px] gap-5 text-lightBlue dark:text-blue-dark-medium'>
				<span className='w-16 py-1.5 text-sm max-sm:text-xs'>{title}</span>
				<div className='w-full'>
					<div
						className={`flex h-10  items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container pl-3 pr-2 tracking-wide dark:border-[#3B444F] dark:bg-transparent ${
							verified ? 'bg-[#f6f7f9] text-[#8d99a9]' : 'bg-white text-bodyBlue dark:text-blue-dark-high'
						}`}
					>
						<span className='text-sm max-sm:text-xs'>{isMobile ? `${value?.slice(0, 10)}...` : value}</span>
						{verified ? (
							<span className='flex items-center justify-center gap-2 text-xs text-[#8d99a9] max-sm:text-[10px]'>
								<VerifiedIcon className='text-xl' />
								Verified
							</span>
						) : (
							<CustomButton
								onClick={onVerify}
								className={`text-xs ${
									[VerificationStatus.VERFICATION_EMAIL_SENT, VerificationStatus.PLEASE_VERIFY_TWITTER]?.includes(status as VerificationStatus) ? 'w-[120px]' : 'w-[68px]'
								}`}
								height={30}
								width={144}
								type='primary'
							>
								{status === VerificationStatus.VERFICATION_EMAIL_SENT || (fieldName === ESocials.TWITTER && status === VerificationStatus.PLEASE_VERIFY_TWITTER)
									? 'Confirm'
									: 'Verify'}
							</CustomButton>
						)}
					</div>
					{!verified && <span className='text-xs max-sm:text-[10px]'>{description}</span>}
				</div>
			</div>
		</Spin>
	);
};

export default SocialsLayout;
