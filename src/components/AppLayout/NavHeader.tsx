// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-tabs */
import { ApplayoutIdentityIcon, ClearIdentityOutlinedIcon, Dashboard, OptionMenu } from '~src/ui-components/CustomIcons';
import { CloseOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Divider, Space } from 'antd';
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
import MailWhite from '~assets/icons/mailIconWhite.svg';
import Arrow from '~assets/icons/arrow.svg';
import ArrowWhite from '~assets/icons/arrow-white.svg';
import PolkaSafe from '~assets/icons/PolkaSafe.svg';
import PaLogo from './PaLogo';
import PaLogoDark from '~assets/PALogoDark.svg';
import chainLogo from '~assets/parachain-logos/chain-logo.jpg';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import { EGovType } from '~src/global/proposalType';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { IconLogout, IconProfile, IconSettings } from '~src/ui-components/CustomIcons';
import { onchainIdentitySupportedNetwork } from '.';
import IdentityCaution from '~assets/icons/identity-caution.svg';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { logout, setUserDetailsState } from '~src/redux/userDetails';
import { useTheme } from 'next-themes';
import PolkasafeWhiteIcon from '~assets/icons/polkasafe-white-logo.svg';
import { trackEvent } from 'analytics';
import StakeIcon from '~assets/stake-icon.svg';
import DelegateIcon from '~assets/delegate-icon.svg';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Skeleton from '~src/basic-components/Skeleton';
import UserDropdown from '../../ui-components/UserDropdown';
import { setOpenRemoveIdentityModal, setOpenRemoveIdentitySelectAddressModal } from '~src/redux/removeIdentity';
import { delegationSupportedNetworks } from '../Post/Tabs/PostStats/util/constants';

const RemoveIdentity = dynamic(() => import('~src/components/RemoveIdentity'), {
	ssr: false
});
const InAppNotification = dynamic(() => import('../InAppNotification'), {
	ssr: false
});

const RPCDropdown = dynamic(() => import('~src/ui-components/RPCDropdown'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const Identity = dynamic(() => import('~src/components/OnchainIdentity'), {
	ssr: false
});

interface Props {
	className?: string;
	sidedrawer: boolean;
	previousRoute?: string;
	setSidedrawer: React.Dispatch<React.SetStateAction<boolean>>;
	displayName?: string;
	isVerified?: boolean;
	isIdentityExists?: boolean;
}

const NavHeader = ({ className, sidedrawer, setSidedrawer, displayName, isVerified, isIdentityExists }: Props) => {
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const { username, id, loginAddress } = currentUser;
	const router = useRouter();
	const { web3signup } = currentUser;
	const [open, setOpen] = useState(false);
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);
	const isClicked = useRef(false);
	const isMobile = typeof window !== 'undefined' && window.screen.width < 1024;
	const [openAddressModal, setOpenAddressModal] = useState<boolean>(false);
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

	const handleRemoveIdentity = () => {
		if (loginAddress) {
			dispatch(setOpenRemoveIdentityModal(true));
		} else {
			dispatch(setOpenRemoveIdentitySelectAddressModal(true));
		}
	};

	useEffect(() => {
		if (network && !isOpenGovSupported(network)) {
			setGovTypeToContext(EGovType.GOV1);
		}
		setOpen(Boolean(router?.query?.setidentity) || false);
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
				setOpenAddressModal(true);
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
					className='custom-link after:hidden'
				>
					<span className='flex items-center gap-x-2 text-sm font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary'>
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
					className='custom-link after:hidden'
				>
					<span className='flex items-center gap-x-2 text-sm font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary'>
						{theme === 'dark' ? <PolkasafeWhiteIcon /> : <PolkaSafe />}
						<span>Polkasafe</span>
					</span>
				</a>
			)
		},
		{
			className: 'logo-class',
			key: 'Staking',
			label: (
				<a
					href='https://staking.polkadot.network/'
					target='_blank'
					rel='noreferrer'
					className='custom-link after:hidden'
				>
					<span className='flex items-center gap-x-2 text-sm font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary'>
						<StakeIcon />
						<span>Staking</span>
					</span>
				</a>
			)
		}
	];

	if (delegationSupportedNetworks?.includes(network)) {
		menudropDownItems.push({
			className: 'logo-class',
			key: 'Delegation',
			label: (
				<a
					href={`https://${network}.polkassembly.io/delegation`}
					target='_blank'
					rel='noreferrer'
					className='custom-link after:hidden'
				>
					<span className='flex items-center gap-x-2 text-sm font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary'>
						<DelegateIcon />
						<span>Delegation</span>
					</span>
				</a>
			)
		});
	}

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

	const AuthDropdown = ({ children }: { children: ReactNode }) => (
		<Dropdown
			menu={{ items: dropdownMenuItems }}
			trigger={['click']}
			overlayClassName='navbar-dropdowns'
			className='cursor-pointer'
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
				sidedrawer && !isMobile ? 'z-[101]' : isMobile ? 'z-[1050]' : 'z-[101]'
			} navbar-container sticky top-0 flex h-[60px] max-h-[60px] items-center border-b-2 border-l-0 border-r-0 border-t-0 border-solid border-pink_primary bg-white px-6 leading-normal dark:bg-section-dark-overlay`}
		>
			<div
				onClick={() => {
					setSidedrawer(!sidedrawer);
				}}
				className='-ml-3 mr-4 flex items-center justify-center lg:hidden'
			>
				<Dashboard className='text-2xl' />
			</div>
			<div className='ml-[84px] hidden lg:block'></div>
			<nav className='mx-auto flex h-[60px] max-h-[60px] w-full items-center justify-between lg:w-[85vw] xl:max-w-7xl xl:px-1'>
				<div className='flex items-center'>
					<Link
						className='logo-size flex lg:hidden'
						href={'/'}
					>
						{theme === 'dark' && isMobile ? (
							<PaLogoDark className='' />
						) : (
							<PaLogo
								className=''
								sidedrawer={isMobile}
							/>
						)}
					</Link>

					<div className='type-container hidden items-center gap-1 sm:flex'>
						<span className='line-container ml-4 mr-2 h-5 w-[1.5px] bg-pink_primary dark:mr-4 md:mr-[10px] md:h-10'></span>
						<h2 className='text-container m-0 ml-[84px] p-0 text-base text-bodyBlue dark:ml-[84px] dark:text-blue-dark-high lg:ml-0 lg:text-sm lg:font-semibold lg:leading-[21px] lg:tracking-[0.02em] dark:lg:ml-0'>
							{isOpenGovSupported(network) ? 'OpenGov' : 'Gov1'}
						</h2>
					</div>
				</div>

				<div className='flex items-center justify-between sm:gap-x-2 md:gap-x-4'>
					<SearchBar className='searchbar-container' />
					<InAppNotification />
					<Space className='hidden items-center justify-between gap-x-2 md:flex md:gap-x-4'>
						<NetworkDropdown setSidedrawer={setSidedrawer} />

						{chainProperties[network]?.rpcEndpoints && chainProperties[network]?.rpcEndpoints?.length > 0 && <RPCDropdown />}
						{!id ? (
							<div className='flex items-center lg:gap-x-2'>
								<CustomButton
									variant='primary'
									height={22}
									width={60}
									text='Login'
									className='rounded-[2px] md:rounded-[4px] lg:h-[32px] lg:w-[74px] lg:text-sm lg:font-medium lg:leading-[21px]'
									onClick={() => {
										setSidedrawer(false);
										setLoginOpen(true);
									}}
								/>
							</div>
						) : (
							<AuthDropdown>
								{!web3signup ? (
									<div className='flex items-center justify-between gap-x-2 rounded-3xl border border-solid border-section-light-container bg-[#f6f7f9] px-3 dark:border-[#3B444F] dark:border-separatorDark dark:bg-[#29323C33] dark:text-blue-dark-high  '>
										{theme === 'dark' ? <MailWhite /> : <Mail />}
										<div className='flex items-center justify-between gap-x-1'>
											<span className='w-[85%] truncate text-xs font-semibold normal-case'>{displayName || username || ''}</span>
											{theme === 'dark' ? <ArrowWhite /> : <Arrow />}
										</div>
									</div>
								) : (
									<div className={'flex items-center justify-between gap-x-2'}>
										<UserDropdown
											className='navbar-user-dropdown h-[32px] max-w-[165px]'
											displayName={displayName}
											isVerified={isVerified}
										/>
									</div>
								)}
							</AuthDropdown>
						)}
						<div
							className='mr-2 lg:mr-0'
							onClick={() => {
								trackEvent('renavigation_button_clicked', 'clicked_renavigation_button', {
									userId: id || '',
									userName: username || ''
								});
							}}
						>
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
							className='ml-auto flex h-8 w-8 items-center justify-center rounded-[4px] border border-solid border-section-light-container bg-[rgba(210,216,224,0.2)] outline-none dark:border-[#3B444F] dark:bg-section-dark-overlay md:hidden'
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
										{username ? (
											<div>
												<Divider className='my-8' />
												<div className='flex flex-col gap-y-4'>
													<button
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															handleLogout(username || '');
															window.location.reload();
														}}
														className='flex h-10 items-center justify-center rounded-sm border border-solid border-pink_primary bg-pink_primary px-4 py-1 text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-white'
													>
														Log Out
													</button>
												</div>
											</div>
										) : (
											<div className={`${username ? 'hidden' : 'block'}`}>
												<Divider className='my-8' />
												<div className='flex flex-col gap-y-4'>
													<button
														onClick={() => {
															setOpen(false);
															router.push('/signup');
														}}
														className='flex h-10 items-center justify-center rounded-sm border border-solid border-pink_primary bg-white px-4 py-1 text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-pink_primary dark:bg-transparent'
													>
														Sign Up
													</button>
													<button
														onClick={() => {
															setOpen(false);
															router.push('/login');
														}}
														className='flex h-10 items-center justify-center rounded-sm border border-solid border-pink_primary bg-pink_primary px-4 py-1 text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-white'
													>
														Log In
													</button>
												</div>
											</div>
										)}
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
							className='flex h-8 w-8 items-center justify-center rounded-[4px] border border-solid border-section-light-container bg-[rgba(210,216,224,0.2)] p-[6px] outline-none dark:border-[#3B444F] md:hidden'
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
				<>
					<Identity
						open={open}
						setOpen={setOpen}
						openAddressModal={openAddressModal}
						setOpenAddressModal={setOpenAddressModal}
					/>
					<RemoveIdentity />
				</>
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
		.dark .text-container {
			margin-left: 2px !important;
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
