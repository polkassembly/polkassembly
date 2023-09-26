// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckCircleFilled } from '@ant-design/icons';
import React from 'react';
import styled from 'styled-components';
import { useUserDetailsContext } from '~src/context';
import DownIcon from '~assets/icons/down-arrow.svg';
import ImageComponent from '~src/components/ImageComponent';

export enum EAddressOtherTextType {
	CONNECTED = 'Connected',
	COUNCIL = 'Council',
	COUNCIL_CONNECTED = 'Council (Connected)',
	LINKED_ADDRESS = 'Linked',
	UNLINKED_ADDRESS = 'Address not linked'
}

interface Props {
	className?: string;
	displayName?: string;
	isVerified?: boolean;
}

const UserDropdown = ({ className, displayName, isVerified }: Props): JSX.Element => {
	const { username, picture } = useUserDetailsContext();
	const profileUsername = displayName || username || '';

	return (
		<div
			className={`${className} user-container flex items-center justify-center gap-1 rounded-3xl bg-[#f6f7f9] px-3 font-semibold`}
			style={{ border: '1px solid #d7dce3' }}
		>
			<ImageComponent
				src={picture}
				alt='User Picture'
				className='flex h-[40px] w-[40px] items-center justify-center bg-transparent'
				iconClassName='flex items-center justify-center text-[#FCE5F2] text-xxl w-full h-full rounded-full'
			/>
			<div className='flex w-[85%] items-center gap-1 text-xs'>
				<span className={`normal-case ${isVerified && 'truncate'}`}>
					{profileUsername && profileUsername?.length > 11 && !isVerified ? `${profileUsername?.slice(0, 11)}...` : profileUsername}
				</span>
				{isVerified && (
					<CheckCircleFilled
						style={{ color: 'green' }}
						className='rounded-full border-none bg-transparent text-sm'
					/>
				)}
				<DownIcon />
			</div>
		</div>
	);
};

export default styled(UserDropdown)`
	position: relative;
	display: flex;
	align-items: center;

	.content {
		display: inline-block;
		color: nav_blue !important;
	}

	.identicon {
		margin-right: 0.25rem;
	}
	.identicon svg {
		width: 20px;
		font-size: 15px;
	}

	.identityName {
		filter: grayscale(100%);
	}

	.header {
		color: black_text;
		font-weight: 500;
		margin-right: 0.4rem;
	}

	.description {
		color: nav_blue;
		margin-right: 0.4rem;
	}

	.display_inline {
		display: inline-flex !important;
	}

	.sub {
		color: nav_blue;
		line-height: inherit;
	}

	@media (max-width: 468px) and (min-width: 380px) {
		.user-details-container {
			width: 100px !important;
			font-size: 14px !important;
		}

		.user-image-container {
			transform: scale(2);
			margin-left: -32px !important;
		}

		.user-container {
			display: flex !important;
			margin-top: 30px !important;
		}
	}
`;
