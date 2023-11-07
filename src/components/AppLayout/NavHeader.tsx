// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-tabs */
import { ApplayoutIdentityIcon, Dashboard, OptionMenu } from '~src/ui-components/CustomIcons';
import { CloseOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Button, Divider, Skeleton, Space } from 'antd';
import { Dropdown } from '~src/ui-components/Dropdown';
import { Header } from 'antd/lib/layout/layout';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import NetworkDropdown from 'src/ui-components/NetworkDropdown';
import styled from 'styled-components';
import { chainProperties } from '~src/global/networkConstants';
import SearchBar from '~src/ui-components/SearchBar';
import TownHall from '~assets/icons/TownHall.svg';
import Mail from '~assets/icons/mail.svg';
import Arrow from '~assets/icons/arrow.svg';
import PolkaSafe from '~assets/icons/PolkaSafe.svg';
import PaLogo from './PaLogo';
import PaLogoDark from '~assets/PALogoDark.svg';
import chainLogo from '~assets/parachain-logos/chain-logo.jpg';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import { EGovType } from '~src/global/proposalType';
import UserProfileDropdown from '../../ui-components/UserProfileDropdown';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { IconLogout, IconProfile, IconSettings } from '~src/ui-components/CustomIcons';
import { onchainIdentitySupportedNetwork } from '.';
import IdentityCaution from '~assets/icons/identity-caution.svg';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { logout, setUserDetailsState } from '~src/redux/userDetails';
import { useTheme } from 'next-themes';
import PolkasafeWhiteIcon from '~assets/polkasafe-white-logo.svg';

const RPCDropdown = dynamic(() => import('~src/ui-components/RPCDropdown'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const OnChainIdentity = dynamic(() => import('~src/components/OnchainIdentity'), {
	ssr: false
});

interface Props {
	className?: string;
	sidedrawer: boolean;
	previousRoute?: string;
	setSidedrawer: React.Dispatch<React.SetStateAction<boolean>>;
	displayName?: string;
	isVerified?: boolean;
}

const NavHeader = ({ className, sidedrawer, setSidedrawer, displayName, isVerified }: Props) => {
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const { username, id } = currentUser;
	const router = useRouter();
	const { web3signup } = currentUser;
	const [open, setOpen] = useState(false);
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);
	const isClicked = useRef(false);
	const isMobile = typeof window !== 'undefined' && window.screen.width < 1024;
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();

	const handleLogout = async (username: string) => {
		dispatch(logout());
		if (!router.query?.username) return;
		if (router.query?.username.includes(username)) {
			router.push(isOpenGovSupported(network) ? '/opengov' : '/');
		}
	};
	const setGovTypeToContext = (govType: EGovType) => {
		dispatch(
			setUserDetailsState({
				...currentUser,
				govType
			})
		);
	};

	useEffect(() => {
		if (network && !isOpenGovSupported(network)) {
			setGovTypeToContext(EGovType.GOV1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const handleIdentityButtonClick = () => {
		const address = localStorage.getItem('identityAddress');
		if (isMobile) {
			return;
		} else {
			if (address?.length) {
				setOpen(!open);
			} else {
				setOpenAddressLinkedModal(true);
			}
		}
	};

	const menudropDownItems: ItemType[] = [
		{
			className: 'logo-class',
			key: 'Townhall',
			label: (
				<a
					href='https://townhallgov.com/'
					target='_blank'
					rel='noreferrer'
					className='custom-link'
				>
					<span className='flex items-center gap-x-2 text-sm font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink-dark-primary'>
						<TownHall />
						<span>TownHall</span>
					</span>
				</a>
			)
		},
		{
			className: 'logo-class',
			key: 'Polkasafe',
			label: (
				<a
					href='https://polkasafe.xyz/'
					target='_blank'
					rel='noreferrer'
					className='custom-link'
				>
					<span className='flex items-center gap-x-2 text-sm font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink-dark-primary'>
						{theme === 'dark' ? <PolkasafeWhiteIcon className='relative left-[3px] top-[-1px] scale-[2]' /> : <PolkaSafe />}
						<span>Polkasafe</span>
					</span>
				</a>
			)
		}
	];

	const dropdownMenuItems: ItemType[] = [
		{
			key: 'view profile',
			label: (
				<Link
					className='flex items-center gap-x-2 text-sm font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high'
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
					className='flex items-center gap-x-2 text-sm font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high'
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
					className='flex items-center gap-x-2 text-sm font-medium text-bodyBlue hover:text-pink_primary dark:text-white'
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
		dropdownMenuItems.splice(1, 0, {
			key: 'set on-chain identity',
			label: (
				<Link
					className={`flex items-center gap-x-2 font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high ${className}`}
					href={''}
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						handleIdentityButtonClick();
					}}
				>
					<span className='text-2xl'>
						<ApplayoutIdentityIcon />
					</span>
					<span>Set on-chain identity</span>
					{!isVerified && (
						<span className='flex items-center'>
							<IdentityCaution />
						</span>
					)}
				</Link>
			)
		});
	}

	const AuthDropdown = ({ children }: { children: ReactNode }) => (
		<Dropdown
			menu={{ items: dropdownMenuItems }}
			trigger={['click']}
			overlayClassName='navbar-dropdowns'
			theme={theme}
		>
			{children}
		</Dropdown>
	);

	const MenuDropdown = ({ children }: { children: ReactNode }) => (
		<Dropdown
			hideOverflow={true}
			menu={{ items: menudropDownItems }}
			trigger={['click']}
			overlayClassName='navbar-dropdowns'
			theme={theme}
		>
			{children}
		</Dropdown>
	);

	return (
		<Header
			className={`${className} shadow-md ${
				sidedrawer && !isMobile ? 'z-[500]' : isMobile ? 'z-[1010]' : 'z-[1000]'
			} navbar-container sticky top-0 flex h-[60px]  max-h-[60px] items-center border-b-2 border-l-0 border-r-0 border-t-0 border-solid border-pink_primary bg-white px-6 leading-normal dark:bg-section-dark-overlay`}
		>
			<span
				onClick={() => {
					setSidedrawer(!sidedrawer);
				}}
			>
				<Dashboard className='dashboard-container mr-5 mt-1 text-2xl lg:hidden' />
			</span>
			<nav className='flex h-[60px] max-h-[60px] w-full items-center justify-between'>
				<div className='flex items-center'>
					<Link
						className='logo-size flex'
						href={'/'}
					>
						{theme === 'dark' && isMobile ? (
							<PaLogoDark className='logo-container -ml-[2px]' />
						) : (
							<PaLogo
								className='logo-container -ml-[2px]'
								sidedrawer={isMobile}
							/>
						)}
					</Link>

					<div className='type-container flex items-center'>
						<span className='line-container ml-[16px] mr-[8px] h-5 w-[1.5px] bg-pink_primary md:mr-[10px] md:h-10'></span>
						<h2 className='text-container m-0 ml-[84px] p-0 text-base text-bodyBlue dark:text-blue-dark-high lg:text-sm lg:font-semibold lg:leading-[21px] lg:tracking-[0.02em]'>
							{isOpenGovSupported(network) ? 'OpenGov' : 'Gov1'}
						</h2>
					</div>
				</div>

				<div className='flex items-center justify-between gap-x-2 md:gap-x-4'>
					<SearchBar className='searchbar-container' />

					<Space className='hidden items-center justify-between gap-x-2 md:flex md:gap-x-4'>
						<NetworkDropdown setSidedrawer={setSidedrawer} />

						{['kusama', 'polkadot'].includes(network) ? <RPCDropdown /> : null}
						{!id ? (
							<div className='flex items-center lg:gap-x-2'>
								<Button
									id='login-btn'
									className='flex h-[22px] w-[60px] items-center justify-center rounded-[2px] bg-pink_primary tracking-[0.00125em] text-white hover:text-white dark:border-none md:rounded-[4px] lg:h-[32px] lg:w-[74px] lg:text-sm lg:font-medium lg:leading-[21px]'
									onClick={() => {
										setSidedrawer(false);
										setLoginOpen(true);
									}}
								>
									Login
								</Button>
							</div>
						) : (
							<AuthDropdown>
								{!web3signup ? (
									<div className='border-1px-solid-#d7dce3 flex items-center justify-between gap-x-2 rounded-3xl bg-[#f6f7f9] px-3  '>
										<Mail />
										<div className='flex items-center justify-between gap-x-1'>
											<span className='w-[85%] truncate normal-case'>{displayName || username || ''}</span>
											<Arrow />
										</div>
									</div>
								) : (
									<div className={'flex items-center justify-between gap-x-2'}>
										<UserProfileDropdown
											className='navbar-user-dropdown h-[32px] max-w-[165px]'
											displayName={displayName}
											isVerified={isVerified}
										/>
									</div>
								)}
							</AuthDropdown>
						)}
						<div className='mr-0 lg:mr-10'>
							<MenuDropdown>
								<OptionMenu className='mt-[6px] text-2xl' />
							</MenuDropdown>
						</div>
					</Space>
					{open ? (
						<button
							onBlur={() => {
								setTimeout(() => {
									setOpen(false);
								}, 100);
							}}
							onClick={() => {
								if (!isClicked.current) {
									setOpen(false);
								}
								isClicked.current = false;
							}}
							className='ml-auto flex h-8 w-8 items-center justify-center rounded-[4px] border border-solid border-[#D2D8E0] bg-[rgba(210,216,224,0.2)] outline-none dark:border-[#3B444F] dark:bg-section-dark-overlay md:hidden'
						>
							<CloseOutlined className='h-[15px] w-[15px] dark:text-white' />
							<div className={`absolute left-0 top-[60px] h-[calc(100vh-60px)] w-screen overflow-hidden bg-black bg-opacity-50 ${!sidedrawer && open ? 'block' : 'hidden'}`}>
								<div
									onClick={() => {
										isClicked.current = true;
									}}
									className='bg-white p-4 dark:bg-section-dark-overlay'
								>
									<div className='flex flex-col'>
										<div>
											<p className='m-0 p-0 text-left text-sm font-normal leading-[23px] tracking-[0.02em] text-lightBlue dark:text-blue-dark-medium'>Network</p>
											<NetworkDropdown
												setSidedrawer={() => {}}
												isSmallScreen={true}
											/>
										</div>
										<div className='mt-6'>
											<p className='m-0 p-0 text-left text-sm font-normal leading-[23px] tracking-[0.02em] text-lightBlue dark:text-blue-dark-medium'>Node</p>
											<RPCDropdown isSmallScreen={true} />
										</div>
										<div className={`${username ? 'hidden' : 'block'}`}>
											<Divider className='my-8' />
											<div className='flex flex-col gap-y-4'>
												<button
													onClick={() => {
														setOpen(false);
														router.push('/signup');
													}}
													className='flex h-10 items-center justify-center rounded-[6px] border border-solid border-pink_primary bg-white px-4 py-1 text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-pink_primary dark:bg-transparent'
												>
													Sign Up
												</button>
												<button
													onClick={() => {
														setOpen(false);
														router.push('/login');
													}}
													className='flex h-10 items-center justify-center rounded-[6px] border border-solid border-pink_primary bg-pink_primary px-4 py-1 text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-white'
												>
													Log In
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</button>
					) : (
						<button
							onClick={() => {
								setSidedrawer(false);
								setOpen(true);
							}}
							className='flex h-8 w-8 items-center justify-center rounded-[4px] border border-solid border-[#D2D8E0] bg-[rgba(210,216,224,0.2)] p-[6px] outline-none dark:border-[#3B444F] md:hidden'
						>
							<Image
								className='h-[20px] w-[20px] rounded-full'
								src={chainProperties[network]?.logo ? chainProperties[network]?.logo : chainLogo}
								alt='Logo'
							/>
						</button>
					)}
				</div>

				<SignupPopup
					setLoginOpen={setLoginOpen}
					modalOpen={openSignup}
					setModalOpen={setSignupOpen}
					isModal={true}
				/>
				<LoginPopup
					setSignupOpen={setSignupOpen}
					modalOpen={openLogin}
					setModalOpen={setLoginOpen}
					isModal={true}
				/>
			</nav>
			{onchainIdentitySupportedNetwork.includes(network) && !isMobile && (
				<OnChainIdentity
					open={open}
					setOpen={setOpen}
					openAddressLinkedModal={openAddressLinkedModal}
					setOpenAddressLinkedModal={setOpenAddressLinkedModal}
				/>
			)}
		</Header>
	);
};

export default styled(NavHeader)`
	svg:hover {
		cursor: pointer;
	}
	.drop .ant-select-selector {
		box-sizing: none;
		border: none !important;
		box-shadow: none !important;
	}
	.padding-zero .ant-modal-content {
		padding: 0 !important;
	}

	.gsc-control-cse {
		background: transparent !important;
		border: none !important;
		padding: 0 !important;
	}
	.gsc-search-button {
		display: none;
	}
	.gsc-input-box {
		border: none !important;
		background: none !important;
		width: 15rem;
		margin-right: 1em;
	}
	table.gsc-search-box {
		margin-bottom: 0 !important;
	}
	table.gsc-search-box td.gsc-input {
		padding-right: 0 !important;
	}
	.gsib_a {
		padding: 0 !important;
		position: relative !important;
	}
	.gsib_a input.gsc-input {
		background-color: #f0f2f5 !important;
		padding: 10px 10px 10px 30px !important;
		font-size: 1em !important;
		height: 40px !important;
		border-radius: 6px !important;
		color: #334d6e !important;
	}
	.gsib_b {
		display: none !important;
	}
	form.gsc-search-box {
		margin-bottom: 0 !important;
	}

	p {
		margin: 0;
	}

	navbar-user-dropdown {
		display: inline-block !important;
	}

	.line-container {
		display: none !important;
	}

	.userdropdown-icon {
		transform: scale(0.9);
	}
	.text-container {
		font-size: 16px !important;
		font-style: normal;
		font-weight: 600 !important;
	}

	@media (max-width: 1023px) and (min-width: 468px) {
		.text-container {
			margin-left: -2px !important;
		}

		.line-container {
			display: block !important;
			margin-left: -15px !important;
		}
	}

	@media (max-width: 468px) and (min-width: 380px) {
		.logo-size {
			transform: scale(0.9) !important;
			margin-left: -12px !important;
		}

		.type-container {
			margin-left: -10px !important;
		}

		.logo-container {
			margin-left: -8px !important;
		}

		.text-container {
			font-size: 12px !important;
			font-style: normal;
			font-weight: 600 !important;
			margin-left: -2px !important;
		}

		.line-container {
			display: block !important;
			margin-left: 4px !important;
		}
	}

	@media (max-width: 380px) and (min-width: 319px) {
		.logo-container {
			margin-left: -15px !important;
		}

		.type-container {
			margin-left: -10px !important;
		}

		.text-container {
			font-size: 12px !important;
			margin-left: -4px !important;
		}

		.line-container {
			display: block !important;
		}

		.logo-size {
			transform: scale(0.9) !important;
			margin-left: -25px !important;
		}

		.dashboard-container {
			margin-left: -15px !important;
		}
	}
`;
