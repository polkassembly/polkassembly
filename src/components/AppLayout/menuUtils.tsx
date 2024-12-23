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
	username = ''
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
					<span>View Profile</span>
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
					<span>Settings</span>
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
					<span>Logout</span>
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
						<span>Set on-chain identity</span>
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
						<span>Remove Identity</span>
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
