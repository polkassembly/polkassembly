// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckCircleFilled } from '@ant-design/icons';
import React from 'react';
import ImageComponent from '~src/components/ImageComponent';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { IconLogout, IconProfile, IconSettings } from '~src/ui-components/CustomIcons';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { logout } from '~src/redux/userDetails';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Dropdown } from '~src/ui-components/Dropdown';
import { useTheme } from 'next-themes';
import { trackEvent } from 'analytics';
import { setOpenRemoveIdentityModal, setOpenRemoveIdentitySelectAddressModal } from '~src/redux/removeIdentity';
import { onchainIdentitySupportedNetwork } from '../Post/Tabs/PostStats/util/constants';
import styled from 'styled-components';

import MailIcon from '~assets/icons/mail.svg';
import ArrowIcon from '~assets/icons/arrow.svg';
import IdentityCaution from '~assets/icons/identity-caution.svg';
import { ApplayoutIdentityIcon, ArrowDownIcon, ClearIdentityOutlinedIcon } from '../../ui-components/CustomIcons';
import { IUserDropdown } from './types';

const UserDropdown = ({ className, displayName, isVerified, isIdentityExists, setOpenAddressLinkedModal, setOpenIdentityModal, children }: IUserDropdown): JSX.Element => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const dispatch = useDispatch();
	const router = useRouter();
	const currentUser = useUserDetailsSelector();
	const { username, picture } = useUserDetailsSelector();
	const profileUsername = displayName || username || '';
	const isMobile = typeof window !== 'undefined' && window.screen.width < 1024;

	const handleLogout = async (username: string) => {
		dispatch(logout());
		if (!router.query?.username) return;
		if (router.query?.username.includes(username)) {
			router.push(isOpenGovSupported(network) ? '/opengov' : '/');
		}
	};

	const handleIdentityButtonClick = () => {
		const address = localStorage.getItem('identityAddress');
		if (isMobile) {
			return;
		} else {
			if (address?.length) {
				setOpenIdentityModal(true);
			} else {
				setOpenAddressLinkedModal(true);
			}
		}
	};

	const handleRemoveIdentity = () => {
		if (currentUser.loginAddress) {
			dispatch(setOpenRemoveIdentityModal(true));
		} else {
			dispatch(setOpenRemoveIdentitySelectAddressModal(true));
		}
	};

	const dropdownMenuItems: ItemType[] = [
		{
			key: 'view profile',
			label: (
				<Link
					className='flex items-center gap-x-2 text-sm font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary'
					href={`/user/${username}`}
				>
					<IconProfile className='userdropdown-icon text-2xl' />
					<span>View Profile</span>
				</Link>
			)
		},
		{
			key: 'settings',
			label: (
				<Link
					className='flex items-center gap-x-2 text-sm font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary'
					href='/settings?tab=account'
				>
					<IconSettings className='userdropdown-icon text-2xl' />
					<span>Settings</span>
				</Link>
			)
		},
		{
			key: 'logout',
			label: (
				<Link
					href='/'
					className='mt-1 flex items-center gap-x-2 text-sm font-medium text-bodyBlue hover:text-pink_primary dark:text-white dark:hover:text-pink_primary'
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						handleLogout(username || '');
						window.location.reload();
					}}
				>
					<IconLogout className='userdropdown-icon text-2xl' />
					<span>Logout</span>
				</Link>
			)
		}
	];

	if (onchainIdentitySupportedNetwork.includes(network)) {
		const options = [
			{
				key: 'set on-chain identity',
				label: (
					<Link
						className={`flex items-center gap-x-2 font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary ${className}`}
						href={''}
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
							// GAEvent for setOnchain identity clicked
							trackEvent('set_onchain_identity_clicked', 'opened_identity_verification', {
								userId: currentUser?.id || '',
								userName: currentUser?.username || ''
							});
							handleIdentityButtonClick();
						}}
					>
						<span className='text-2xl'>
							<ApplayoutIdentityIcon />
						</span>
						<span>Set on-chain identity</span>
						{!isIdentityExists && (
							<span className='flex items-center'>
								<IdentityCaution />
							</span>
						)}
					</Link>
				)
			}
		];

		if (isIdentityExists) {
			options.push({
				key: 'remove identity',
				label: (
					<Link
						className={`-mt-1 flex items-center gap-x-2.5 font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary ${className}`}
						href={''}
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
							handleRemoveIdentity?.();
						}}
					>
						<span className='ml-0.5 text-[22px]'>
							<ClearIdentityOutlinedIcon />
						</span>
						<span>Remove Identity</span>
					</Link>
				)
			});
		}
		dropdownMenuItems.splice(1, 0, ...options);
	}

	return (
		<Dropdown
			menu={{ items: dropdownMenuItems }}
			trigger={['click']}
			overlayClassName='navbar-dropdowns'
			className='cursor-pointer'
			theme={theme}
		>
			{children ? (
				children
			) : isMobile ? (
				<div className='flex items-center justify-between gap-x-1'>
					<div className={`flex gap-1 text-sm ${isVerified ? 'w-[85%]' : ''}`}>
						<span className={`normal-case ${!isVerified && 'truncate'}`}>
							{!!profileUsername && profileUsername?.length > 12 ? `${profileUsername?.slice(0, 12)}...` : profileUsername}
						</span>
						{isVerified && (
							<CheckCircleFilled
								style={{ color: 'green' }}
								className='rounded-full border-none bg-transparent text-sm'
							/>
						)}
					</div>
					<ArrowIcon className={theme === 'dark' ? 'dark-icons' : ''} />
				</div>
			) : !currentUser.web3signup ? (
				<div className='flex items-center justify-between gap-x-2 rounded-3xl border border-solid border-[#D2D8E0] bg-[#f6f7f9] px-3 dark:border-[#3B444F] dark:border-separatorDark dark:bg-[#29323C33] dark:text-blue-dark-high  '>
					<MailIcon className={theme === 'dark' ? 'dark-icons' : ''} />
					<div className='flex items-center justify-between gap-x-1'>
						<span className='w-[85%] truncate text-xs font-semibold normal-case'>{displayName || username || ''}</span>
						<ArrowIcon className={theme === 'dark' ? 'dark-icons' : ''} />
					</div>
				</div>
			) : (
				<div
					className={`${className} user-container flex items-center justify-center gap-1 rounded-3xl border-[#d7dce3] bg-[#f6f7f9] px-3 py-1.5 font-semibold dark:border-separatorDark dark:bg-section-dark-overlay`}
					style={{ border: '1px solid #d7dce3' }}
				>
					<ImageComponent
						src={picture}
						alt='User Picture'
						className='flex h-[16px] w-[16px] items-center justify-center bg-transparent'
						iconClassName='flex items-center justify-center text-[#FCE5F2] text-xxl w-full h-full rounded-full'
					/>
					<div className='flex w-[85%] items-center gap-1 text-xs dark:text-white'>
						<span className={`normal-case ${isVerified && 'truncate'}`}>
							{!!profileUsername && profileUsername?.length > 11 && !isVerified ? `${profileUsername?.slice(0, 11)}...` : profileUsername}
						</span>
						{isVerified && (
							<CheckCircleFilled
								style={{ color: 'green' }}
								className='rounded-full border-none bg-transparent text-sm'
							/>
						)}
						<ArrowDownIcon className={'text-sm text-lightBlue dark:text-blue-dark-medium'} />
					</div>
				</div>
			)}
		</Dropdown>
	);
};

export default styled(UserDropdown)`
	.userdropdown-icon {
		transform: scale(0.9);
	}
`;
