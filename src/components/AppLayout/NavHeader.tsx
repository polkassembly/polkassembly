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
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';

const RPCDropdown = dynamic(() => import('~src/ui-components/RPCDropdown'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface Props {
	className?: string;
	sidedrawer: boolean;
	previousRoute?: string;
	setSidedrawer: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavHeader = ({ className, sidedrawer, setSidedrawer, previousRoute }: Props) => {
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const router = useRouter();
	const { pathname, query } = router;
	const { username } = currentUser;
	const [open, setOpen] = useState(false);
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);

	const isGov2Route: boolean = checkGov2Route(pathname, query, previousRoute, network);
	const isClicked = useRef(false);

	return (
		<Header
			className={`${className} sticky top-0 z-[1001] flex h-[60px] max-h-[60px] items-center border-b-2 border-l-0 border-r-0 border-t-0 border-solid border-pink_primary bg-white px-6 leading-normal shadow-md`}
		>
			<MenuOutlined
				className='mr-5 lg:hidden'
				onClick={() => {
					setSidedrawer(!sidedrawer);
				}}
			/>
			<nav className='flex h-[60px] max-h-[60px] w-full items-center justify-between'>
				<div className='flex items-center'>
					<Link
						className='flex'
						href={isGov2Route ? '/opengov' : '/'}
					>
						<PaLogo className='h-[32px] w-[99px] md:h-[39px] md:w-[116px]' />
					</Link>
					<div className='flex items-center'>
						<span className='ml-[2px] mr-[8px] h-5 w-[1.5px] bg-pink_primary md:mr-[10px] md:h-10'></span>
						<h2 className='m-0 p-0 text-xs font-medium text-[#243A57] lg:text-sm lg:font-semibold lg:leading-[21px] lg:tracking-[0.02em]'>{isGov2Route ? 'OpenGov' : 'Gov1'}</h2>
					</div>
				</div>

				{isOpenGovSupported(network) ? (
					<>
						<GovernanceSwitchButton
							previousRoute={previousRoute}
							className='hidden lg:flex'
						/>
					</>
				) : (
					<div className='mr-6 hidden min-w-[120px] lg:mr-5 lg:flex xl:mr-0'></div>
				)}
				<div className='flex items-center justify-between gap-x-2 md:gap-x-4'>
					<SearchBar />

					<Space className='hidden items-center justify-between gap-x-2 md:flex md:gap-x-4'>
						{/* <Link className='text-navBlue hidden hover:text-pink_primary text-lg items-center' href='/notification-settings'>
							<BellOutlined />
						</Link> */}
						<NetworkDropdown setSidedrawer={setSidedrawer} />
						{['kusama', 'polkadot'].includes(network) ? <RPCDropdown /> : null}
						{!username && (
							<div className='flex items-center lg:gap-x-2'>
								<Button
									className='flex h-[33px] w-[74px] items-center justify-center rounded-[2px] bg-pink_primary tracking-[0.00125em] text-white hover:text-white md:rounded-[4px] lg:text-sm lg:font-medium lg:leading-[21px]'
									onClick={() => {
										setSidedrawer(false);
										setLoginOpen(true);
									}}
								>
									Login
								</Button>
							</div>
						)}
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
							className='ml-auto flex h-8 w-8 items-center justify-center rounded-[4px] border border-solid border-[#D2D8E0] bg-[rgba(210,216,224,0.2)] outline-none md:hidden'
						>
							<CloseOutlined className='h-[15px] w-[15px]' />
							<div className={`absolute left-0 top-[60px] h-[calc(100vh-60px)] w-screen overflow-hidden bg-black bg-opacity-50 ${!sidedrawer && open ? 'block' : 'hidden'}`}>
								<div
									onClick={() => {
										isClicked.current = true;
									}}
									className='bg-white p-4'
								>
									<div className='flex flex-col'>
										<SearchBar />
										<div>
											<p className='m-0 p-0 text-left text-sm font-normal leading-[23px] tracking-[0.02em] text-[#485F7D]'>Network</p>
											<NetworkDropdown
												setSidedrawer={() => {}}
												isSmallScreen={true}
											/>
										</div>
										<div className='mt-6'>
											<p className='m-0 p-0 text-left text-sm font-normal leading-[23px] tracking-[0.02em] text-[#485F7D]'>Node</p>
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
													className='flex h-10 items-center justify-center rounded-[6px] border border-solid border-pink_primary bg-white px-4 py-[4px] text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-pink_primary'
												>
													Sign Up
												</button>
												<button
													onClick={() => {
														setOpen(false);
														router.push('/login');
													}}
													className='flex h-10 items-center justify-center rounded-[6px] border border-solid border-pink_primary bg-[#E5007A] px-4 py-[4px] text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-white'
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
							className='flex h-8 w-8 items-center justify-center rounded-[4px] border border-solid border-[#D2D8E0] bg-[rgba(210,216,224,0.2)] p-[6px] outline-none md:hidden'
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
