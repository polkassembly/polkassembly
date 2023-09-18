// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-tabs */
import { Dashboard, OptionMenu } from '~src/ui-components/CustomIcons';
import { CloseOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Button, Divider, Dropdown, Skeleton, Space } from 'antd';
import { Header } from 'antd/lib/layout/layout';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useNetworkContext, useUserDetailsContext } from 'src/context';
import NetworkDropdown from 'src/ui-components/NetworkDropdown';
import styled from 'styled-components';
import { chainProperties } from '~src/global/networkConstants';
import SearchBar from '~src/ui-components/SearchBar';
import TownHall from '~assets/icons/TownHall.svg';
import Mail from '~assets/icons/mail.svg';
import Arrow from '~assets/icons/arrow.svg';
import PolkaSafe from '~assets/icons/PolkaSafe.svg';
import PaLogo from './PaLogo';
import chainLogo from '~assets/parachain-logos/chain-logo.jpg';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import { logout } from '~src/services/auth.service';
import { EGovType } from '~src/global/proposalType';
import UserDropdown from '../../ui-components/UserDropdown';
import { UserDetailsContextType } from '~src/types';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { IconLogout, IconProfile, IconSettings } from '~src/ui-components/CustomIcons';

const RPCDropdown = dynamic(() => import('~src/ui-components/RPCDropdown'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface Props {
	className?: string
	sidedrawer: boolean
  previousRoute?: string;
	setSidedrawer: React.Dispatch<React.SetStateAction<boolean>>
}

const NavHeader = ({ className, sidedrawer, setSidedrawer } : Props) => {

	const { network } = useNetworkContext();
	const currentUser = useUserDetailsContext();
	const { govType, username, setUserDetailsContextState } = useUserDetailsContext();
	const router = useRouter();
	const { defaultAddress,web3signup } = currentUser;
	const [open, setOpen] = useState(false);
	const [openLogin,setLoginOpen]=useState<boolean>(false);
	const [openSignup,setSignupOpen]=useState<boolean>(false);
	const isClicked = useRef(false);
	const isMobile = typeof window !== 'undefined' && window.screen.width < 1024;
	// const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

	const handleLogout = async () => {
		logout(setUserDetailsContextState);
		router.replace(router.asPath);
	};
	const setGovTypeToContext = (govType: EGovType) => {
		setUserDetailsContextState((prev: UserDetailsContextType) => {
			return {
				...prev,
				govType
			};
		});
	};

	useEffect(() => {
		if(network && !isOpenGovSupported(network)){
			setGovTypeToContext(EGovType.GOV1);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[network]);

	const menudropDownItems: ItemType[]= [
		{
			className:'logo-class',
			key: 'Townhall',
			label: (
				<a  href="https://townhallgov.com/" target="_blank" rel="noreferrer" className='custom-link' >

					<span className='flex justify-center items-center '>
						<TownHall />
						<div className='ml-2 '> TownHall </div>
					</span>
				</a>
			)
		},
		{
			className:'logo-class',
			key: 'Polkasafe',
			label: (<a href="https://polkasafe.xyz/" target="_blank" rel="noreferrer" className='custom-link'>
				<span className='flex justify-center items-center'>
					<PolkaSafe/>
					<span className='ml-2'>Polkasafe</span>
				</span>
			</a>
			)
		}
	];

	const dropdownMenuItems: ItemType[] = [
		{
			key: 'view profile',
			label: <Link className='text-bodyBlue hover:text-pink_primary font-medium flex items-center gap-x-2' href={`/user/${username}`}>
				<IconProfile className='text-2xl' />
				<span>View Profile</span>
			</Link>
		},
		{
			key: 'settings',
			label: <Link className='text-bodyBlue hover:text-pink_primary font-medium flex items-center gap-x-2' href='/settings?tab=account'>
				<IconSettings className='text-2xl' />
				<span>Settings</span>
			</Link>
		},
		{
			key: 'logout',
			label: <Link className='text-bodyBlue hover:text-pink_primary font-medium flex items-center gap-x-2'	onClick={handleLogout} href='/'>
				<IconLogout className='text-2xl' />
				<span>Logout</span>
			</Link>
		}
	];
	const AuthDropdown = ({ children }: {children: ReactNode}) => (
		<Dropdown menu={{ items: dropdownMenuItems }} trigger={['click']} overlayClassName='navbar-dropdowns'>
			{children}
		</Dropdown>
	);

	const MenuDropdown = ({ children }: {children: ReactNode}) => (
		<Dropdown menu={{ items: menudropDownItems }} trigger={['click']} overlayClassName='navbar-dropdowns'>
			{children}
		</Dropdown>

	);

	return (
		<Header className={`${className} shadow-md ${sidedrawer?'z-1':'z-[1000]'} sticky top-0 flex items-center  bg-white h-[60px] max-h-[60px] px-6 leading-normal border-solid border-t-0 border-r-0 border-b-2 border-l-0 border-pink_primary`}>
			<span onClick={() => { setSidedrawer(!sidedrawer); }} >
				<Dashboard className='text-2xl mt-1 lg:hidden mr-5'/>
			</span>
			<nav className='w-full flex items-center justify-between h-[60px] max-h-[60px]'>
				<div className='flex items-center'>
					<Link className='flex' href={'/'}>
						<PaLogo className='-ml-[2px] logo-container' sidedrawer={isMobile}/>
					</Link>

					<div className='flex items-center type-container'>
						<span className='line-container bg-pink_primary h-5 md:h-10 w-[1.5px] mr-[8px] md:mr-[10px] ml-[16px]'></span>
						<h2 className='text-container font-semibold m-0 p-0 ml-[84px] text-[#243A57] text-base lg:text-sm lg:font-semibold lg:leading-[21px] lg:tracking-[0.02em]'>
							{
								govType === EGovType.OPEN_GOV ? 'OpenGov': 'Gov1'
							}
						</h2>
					</div>
				</div>

				<div className="flex items-center justify-between gap-x-2 md:gap-x-4">
					<SearchBar className='searchbar-container'/>

					<Space className='hidden md:flex items-center justify-between gap-x-2 md:gap-x-4'>

						<NetworkDropdown setSidedrawer={setSidedrawer} />

						{
							['kusama', 'polkadot'].includes(network)?
								<RPCDropdown />
								: null
						}
						{!username
							? <div className='flex items-center lg:gap-x-2'>
								<Button className='w-[60px] h-[22px] lg:w-[74px] lg:h-[32px] bg-pink_primary rounded-[2px] md:rounded-[4px] text-white lg:text-sm lg:font-medium lg:leading-[21px] tracking-[0.00125em] flex items-center justify-center hover:text-white' onClick={() => {setSidedrawer(false); setLoginOpen(true);}}>Login</Button>

							</div>

							:<AuthDropdown>
								{
									!web3signup ?	<div className="flex items-center justify-between gap-x-2 bg-[#f6f7f9] rounded-3xl px-3 border-1px-solid-#d7dce3  ">

										<Mail/>
										<div className='flex items-center justify-between gap-x-1'>
											<span className='truncate w-[85%] normal-case'>{username || ''}</span>
											<Arrow/>
										</div>

									</div>:	<div className={'flex items-center justify-between gap-x-2'} >
										<UserDropdown className="navbar-user-dropdown h-[32px] max-w-[160px]" address={defaultAddress || ''}/>
									</div>
								}

							</AuthDropdown>
						}
						<div className='mr-0 lg:mr-10'>
							<MenuDropdown>
								<OptionMenu className="text-2xl mt-[6px]"/>
							</MenuDropdown>
						</div>

					</Space>
					{
						open?
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
								className='ml-auto outline-none bg-[rgba(210,216,224,0.2)] border border-solid border-[#D2D8E0] rounded-[4px] flex items-center justify-center h-8 w-8 md:hidden'
							>
								<CloseOutlined className='w-[15px] h-[15px]' />
								<div
									className={`absolute w-screen bg-black bg-opacity-50 top-[60px] left-0 overflow-hidden h-[calc(100vh-60px)] ${(!sidedrawer && open)? 'block': 'hidden'}`}
								>
									<div
										onClick={() => {
											isClicked.current = true;
										}}
										className='p-4 bg-white'
									>
										<div className='flex flex-col'>
											<SearchBar/>
											<div>
												<p className='m-0 p-0 text-[#485F7D] font-normal text-sm leading-[23px] tracking-[0.02em] text-left'>Network</p>
												<NetworkDropdown setSidedrawer={() => {}} isSmallScreen={true} />
											</div>
											<div className='mt-6'>
												<p className='m-0 p-0 text-[#485F7D] font-normal text-sm leading-[23px] tracking-[0.02em] text-left'>Node</p>
												<RPCDropdown isSmallScreen={true} />
											</div>
											<div className={`${username? 'hidden': 'block'}`}>
												<Divider className='my-8'/>
												<div className='flex flex-col gap-y-4'>
													<button
														onClick={() => {
															setOpen(false);
															router.push('/signup');
														}}
														className='rounded-[6px] bg-white flex items-center justify-center border border-solid border-pink_primary px-4 py-[4px] text-pink_primary font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize h-10'
													>
														Sign Up
													</button>
													<button
														onClick={() => {
															setOpen(false);
															router.push('/login');
														}}
														className='h-10 rounded-[6px] bg-[#E5007A] flex items-center justify-center border border-solid border-pink_primary px-4 py-[4px] text-white font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize'
													>
														Log In
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</button>
							: <button
								onClick={() => {
									setSidedrawer(false);
									setOpen(true);
								}}
								className='outline-none flex md:hidden items-center justify-center w-8 h-8 p-[6px] rounded-[4px] bg-[rgba(210,216,224,0.2)] border-solid border border-[#D2D8E0]'
							>
								<Image
									className='w-[20px] h-[20px] rounded-full'
									src={chainProperties[network]?.logo ? chainProperties[network]?.logo : chainLogo}
									alt='Logo'
								/>
							</button>
					}
				</div>

				<SignupPopup setLoginOpen={setLoginOpen} modalOpen={openSignup} setModalOpen={setSignupOpen} isModal={true} />
				<LoginPopup setSignupOpen={setSignupOpen} modalOpen={openLogin} setModalOpen={setLoginOpen} isModal={true} />
			</nav>

		</Header>
	);
};

export default styled(NavHeader)`

svg:hover {
	cursor: pointer;
  }
.drop .ant-select-selector {
    
	box-sizing:none;
	border:none !important;
	box-shadow:none !important;
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

@media (max-width: 1023px) and (min-width: 468px){
	.text-container {
		margin-left: -2px!important;
	}

	.line-container {
		display: block !important;
		margin-left: -15px !important;
	}
}

@media (max-width: 468px) and (min-width: 380px){
	.type-container {
		margin-left:5px !important;
	}

	.logo-container {
		margin-left: -8px !important;
	}

	.type-container {
		margin-left: -24px !important;
	}

	.text-container {
		margin-left: -2px!important;
	}

	.line-container {
		display: block !important;
		margin-left: 4px !important;
	}

	.searchbar-container {
		display: none !important;
	}
}	

@media (max-width: 380px) and (min-width: 320px){
	.logo-container {
		margin-left: -15px !important;
	}

	.type-container {
		margin-left: -38px !important;
	}

	.text-container {
		margin-left: -4px!important;
	}

	.line-container {
		display: block !important;
	}

	.searchbar-container {
		display: none !important;
	}
}	

.user-profile.ant-dropdown-menu {
	margin-top: 500px !important;
	border: 1px solid black;
}
`;
