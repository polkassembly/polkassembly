// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { DownOutlined, LogoutOutlined, SettingOutlined, UserOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Avatar, MenuProps } from 'antd';
import Link from 'next/link';
import React, { ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { Dropdown } from '~src/ui-components/Dropdown';
import styled from 'styled-components';
import { ApplayoutIdentityIcon, ClearIdentityOutlinedIcon } from '~src/ui-components/CustomIcons';
import { onchainIdentitySupportedNetwork } from '.';
import IdentityCaution from '~assets/icons/identity-caution.svg';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

export type MenuItem = Required<MenuProps>['items'][number];

const StyledLink = styled(Link)`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-weight: 500;
	color: var(--lightBlue);
	&:hover {
		color: var(--pink_primary);
	}
	&.dark {
		color: var(--icon-dark-inactive);
	}
`;

interface IUserDropdown {
	handleSetIdentityClick: () => void;
	isIdentityUnverified: boolean;
	isGood: boolean;
	handleLogout: (username: string) => void;
	network: string;
	handleRemoveIdentity: () => void;
	img?: string | null;
	username?: string;
	identityUsername?: string;
	className?: string;
	isIdentityExists: boolean;
	t: (key: string) => string;
}

const getUserDropDown = ({
	handleLogout,
	handleRemoveIdentity,
	handleSetIdentityClick,
	isGood,
	isIdentityExists,
	isIdentityUnverified,
	network,
	className,
	identityUsername,
	img,
	username = '',
	t
}: IUserDropdown): MenuItem => {
	const profileUsername = identityUsername || username || '';

	const dropdownMenuItems: ItemType[] = [
		{
			key: 'view profile',
			label: (
				<StyledLink
					href={`/user/${username}`}
					className={className}
				>
					<UserOutlined />
					<span>{t('view_profile')}</span>
				</StyledLink>
			)
		},
		{
			key: 'settings',
			label: (
				<StyledLink
					href='/settings?tab=account'
					className={className}
				>
					<SettingOutlined />
					<span>{t('settings')}</span>
				</StyledLink>
			)
		},
		{
			key: 'logout',
			label: (
				<StyledLink
					href='/'
					className={className}
					onClick={(e) => {
						e.preventDefault();
						handleLogout(username);
					}}
				>
					<LogoutOutlined />
					<span>{t('logout')}</span>
				</StyledLink>
			)
		}
	];

	if (onchainIdentitySupportedNetwork.includes(network)) {
		const identityOptions = [
			{
				key: 'set on-chain identity',
				label: (
					<StyledLink
						href='#'
						className={className}
						onClick={(e) => {
							e.preventDefault();
							handleSetIdentityClick();
						}}
					>
						<ApplayoutIdentityIcon />
						<span>{t('set_on_chain_identity')}</span>
						{isIdentityUnverified && <IdentityCaution />}
					</StyledLink>
				)
			}
		];

		if (isIdentityExists) {
			identityOptions.push({
				key: 'remove identity',
				label: (
					<StyledLink
						href='#'
						className={className}
						onClick={(e) => {
							e.preventDefault();
							handleRemoveIdentity();
						}}
					>
						<ClearIdentityOutlinedIcon />
						<span>{t('remove_identity')}</span>
					</StyledLink>
				)
			});
		}

		dropdownMenuItems.splice(1, 0, ...identityOptions);
	}

	const AuthDropdown = ({ children }: { children: ReactNode }) => {
		const { resolvedTheme: theme } = useTheme();

		return (
			<Dropdown
				theme={theme}
				menu={{ items: dropdownMenuItems }}
				trigger={['click']}
				className='profile-dropdown'
				overlayClassName='z-[101]'
			>
				{children}
			</Dropdown>
		);
	};

	return getSiderMenuItem(
		<AuthDropdown>
			<div className='flex items-center justify-between gap-x-2'>
				<div className={`flex gap-2 text-sm ${!isGood && isIdentityUnverified && 'w-[85%]'}`}>
					<span className={`normal-case ${!isGood && isIdentityUnverified && 'truncate'}`}>
						{profileUsername.length > 12 && isGood && !isIdentityUnverified ? `${profileUsername.slice(0, 12)}...` : profileUsername}
					</span>
					{isGood && !isIdentityUnverified && (
						<CheckCircleFilled
							style={{ color: 'green' }}
							className='rounded-full text-sm'
						/>
					)}
				</div>
				<DownOutlined className='text-base text-navBlue hover:text-pink_primary' />
			</div>
		</AuthDropdown>,
		'userMenu',
		<AuthDropdown>
			{img ? (
				<Avatar
					size={40}
					src={img}
					className='-ml-2.5 mr-2'
				/>
			) : (
				<Avatar
					size={40}
					icon={<UserOutlined />}
					className='-ml-2.5 mr-2'
				/>
			)}
		</AuthDropdown>
	);
};

export default getUserDropDown;

export function getSiderMenuItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[]): MenuItem {
	label = <span className='w-5 text-xs font-medium text-lightBlue  dark:text-icon-dark-inactive'>{label}</span>;
	return {
		children,
		icon,
		key,
		label,
		type: ['tracksHeading', 'pipsHeading'].includes(key as string) ? 'group' : ''
	} as MenuItem;
}

export const SidebarFoot1 = () => {
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common'); // Initialize the translation function

	return (
		<div className='fixed bottom-0 left-0 z-[100] w-full bg-white pb-4 before:pointer-events-none before:absolute before:left-0 before:right-0 before:top-0 before:z-[1] before:h-[3px] before:shadow-[0px_-2px_6px_rgba(0,0,0,0.08)] before:content-[""] dark:bg-section-dark-overlay md:pb-0 lg:pb-5 xl:h-[5vw]'>
			<div className='mt-5 flex items-center justify-center gap-2'>
				<div className='group relative'>
					<Link href='https://townhallgov.com/'>
						<Image
							src={theme === 'dark' ? '/assets/darkfoot1.svg' : '/assets/foot1.svg'}
							alt={t('townhall')}
							className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
							width={40}
							height={40}
						/>
						<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
							{t('townhall')}
							<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
						</div>
					</Link>
				</div>
				<div className='group relative'>
					<Link href='https://polkasafe.xyz/'>
						<Image
							src={theme === 'dark' ? '/assets/darkfoot2.svg' : '/assets/foot2.svg'}
							alt={t('polkasafe')}
							width={40}
							height={40}
							className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
						/>
						<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
							{t('polkasafe')}
							<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
						</div>
					</Link>
				</div>
				<div className='group relative'>
					<Link href='https://collectives.polkassembly.io/'>
						<Image
							src={theme === 'dark' ? '/assets/darkfoot3.svg' : '/assets/foot3.svg'}
							alt={t('fellowship')}
							width={40}
							height={40}
							className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
						/>
						<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
							{t('fellowship')}
							<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
						</div>
					</Link>
				</div>
				<div className='group relative'>
					<Link href='https://staking.polkadot.cloud/#/overview'>
						<Image
							src={theme === 'dark' ? '/assets/darkfoot4.svg' : '/assets/foot4.svg'}
							alt={t('staking')}
							width={40}
							height={40}
							className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
						/>
						<div className='absolute -left-0 bottom-full mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
							{t('staking')}
							<div className='absolute left-12  top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
						</div>
					</Link>
				</div>
			</div>
		</div>
	);
};

export const SidebarFoot2 = () => {
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common'); // Initialize the translation function

	return (
		<div className='fixed  bottom-0 left-0 z-[1000] h-[14vw] w-full bg-white py-3 before:pointer-events-none before:absolute before:left-0 before:right-0 before:top-0 before:z-[1] before:h-[3px] before:shadow-[0px_-2px_6px_rgba(0,0,0,0.08)] before:content-[""] dark:bg-section-dark-overlay'>
			<div className='flex flex-col items-center justify-center gap-2'>
				<div className='group relative'>
					<Link href='https://townhallgov.com/'>
						<Image
							src={theme === 'dark' ? '/assets/darkfoot1.svg' : '/assets/foot1.svg'}
							alt={t('townhall')}
							width={40}
							height={40}
							className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
						/>
						<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
							{t('townhall')}
							<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
						</div>
					</Link>
				</div>
				<div className='group relative'>
					<Link href='https://polkasafe.xyz/'>
						<Image
							src={theme === 'dark' ? '/assets/darkfoot2.svg' : '/assets/foot2.svg'}
							alt={t('polkasafe')}
							width={40}
							height={40}
							className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
						/>
						<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
							{t('polkasafe')}
							<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
						</div>
					</Link>
				</div>
				<div className='group relative'>
					<Link href='https://collectives.polkassembly.io/'>
						<Image
							src={theme === 'dark' ? '/assets/darkfoot3.svg' : '/assets/foot3.svg'}
							alt={t('fellowship')}
							width={40}
							height={40}
							className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
						/>
						<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
							{t('fellowship')}
							<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
						</div>
					</Link>
				</div>
				<div className='group relative'>
					<Link href='https://staking.polkadot.cloud/#/overview'>
						<Image
							src={theme === 'dark' ? '/assets/darkfoot4.svg' : '/assets/foot4.svg'}
							alt={t('staking')}
							width={40}
							height={40}
							className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
						/>
						<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
							{t('staking')}
							<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
						</div>
					</Link>
				</div>
			</div>
		</div>
	);
};
