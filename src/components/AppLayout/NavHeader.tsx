// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-tabs */
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Button, Divider, Skeleton, Space } from 'antd';
import { Header } from 'antd/lib/layout/layout';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import { useNetworkContext, useUserDetailsContext } from 'src/context';
import NetworkDropdown from 'src/ui-components/NetworkDropdown';
import checkGov2Route from 'src/util/checkGov2Route';
import styled from 'styled-components';
import { chainProperties } from '~src/global/networkConstants';

import { isOpenGovSupported } from '~src/global/openGovNetworks';
import SearchBar from '~src/ui-components/SearchBar';

import GovernanceSwitchButton from './GovernanceSwitchButton';
import PaLogo from './PaLogo';
import chainLogo from '~assets/parachain-logos/chain-logo.jpg';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';

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

const NavHeader = ({ className, sidedrawer, setSidedrawer, previousRoute } : Props) => {
	const { network } = useNetworkContext();
	const currentUser = useUserDetailsContext();
	const router = useRouter();
	const { pathname, query } = router;
	const { username } = currentUser;
	const [open, setOpen] = useState(false);
	const [openLogin,setLoginOpen]=useState<boolean>(false);
	const [openSignup,setSignupOpen]=useState<boolean>(false);

	const isGov2Route: boolean = checkGov2Route(pathname, query, previousRoute);
	const isClicked = useRef(false);

	return (
		<Header className={`${className} shadow-md z-[1001] sticky top-0 flex items-center bg-white h-[60px] max-h-[60px] px-6 leading-normal border-solid border-t-0 border-r-0 border-b-2 border-l-0 border-pink_primary`}>
			<MenuOutlined className='lg:hidden mr-5' onClick={() => {
				setSidedrawer(!sidedrawer);
			}} />
			<nav className='w-full flex items-center justify-between h-[60px] max-h-[60px]'>
				<div className='flex items-center'>
					<Link className='flex' href={isGov2Route ? '/opengov' : '/'}><PaLogo className='w-[99px] h-[32px] md:w-[116px] md:h-[39px]' /></Link>
					<div className='flex items-center'>
						<span className='bg-pink_primary h-5 md:h-10 w-[1.5px] ml-[2px] mr-[8px] md:mr-[10px]'></span>
						<h2 className='m-0 p-0 text-[#243A57] text-xs lg:text-sm font-medium lg:font-semibold lg:leading-[21px] lg:tracking-[0.02em]'>
							{
								isGov2Route? 'OpenGov': 'Gov1'
							}
						</h2>
					</div>
				</div>

				{
					isOpenGovSupported(network) ?
						<>
							<GovernanceSwitchButton previousRoute={previousRoute} className='hidden lg:flex' />
						</> :
						<div className='hidden lg:flex min-w-[120px] mr-6 lg:mr-5 xl:mr-0'></div>
				}
				<div className="flex items-center justify-between gap-x-2 md:gap-x-4">

					<Space className='hidden md:flex items-center justify-between gap-x-2 md:gap-x-4'>
						<SearchBar/>
						{/* <Link className='text-navBlue hidden hover:text-pink_primary text-lg items-center' href='/notification-settings'>
							<BellOutlined />
						</Link> */}
						<NetworkDropdown setSidedrawer={setSidedrawer} />
						{
							['kusama', 'polkadot'].includes(network)?
								<RPCDropdown />
								: null
						}
						{!username
							&& <div className='flex items-center lg:gap-x-2'>
								<Button className='w-[60px] h-[22px] lg:w-[74px] lg:h-[32px] bg-pink_primary rounded-[2px] md:rounded-[4px] text-white lg:text-sm lg:font-medium lg:leading-[21px] tracking-[0.00125em] flex items-center justify-center hover:text-white' onClick={() => {setSidedrawer(false); setLoginOpen(true);}}>Login</Button>
							</div>
						}
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
											{/* <SearchBar isSmallScreen={true} /> */}
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

`;
