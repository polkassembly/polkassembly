// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-tabs */
import { MenuOutlined } from '@ant-design/icons';
// import { Skeleton, Space } from 'antd';
import { Skeleton, Space } from 'antd';
import { Header } from 'antd/lib/layout/layout';
import dynamic from 'next/dynamic';
// import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import { useUserDetailsContext } from 'src/context';
import NetworkDropdown from 'src/ui-components/NetworkDropdown';
import checkGov2Route from 'src/util/checkGov2Route';
import styled from 'styled-components';

import PALogoBlack from '~assets/pa-logo-black.svg';import { NetworkContext } from '~src/context/NetworkContext';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import SearchBar from '~src/ui-components/SearchBar';

import GovernanceSwitchButton from './GovernanceSwitchButton';

const RPCDropdown = dynamic(() => import('~src/ui-components/RPCDropdown'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface Props {
	className?: string
	sidedrawer: boolean
	setSidedrawer: React.Dispatch<React.SetStateAction<boolean>>
}

const CSSVariables = styled.div`
	@property --angle {
		syntax: '<angle>';
		initial-value: 90deg;
		inherits: true;
	}

	--d: 3500ms;
	--angle: 90deg;
	--gradX: 100%;
	--gradY: 50%;
	--c1: #F696C9;
	--c2: #ffffff;
`;

const NavHeader = ({ className, sidedrawer, setSidedrawer } : Props) => {
	const { network } = useContext(NetworkContext);
	const currentUser = useUserDetailsContext();
	const { pathname, query } = useRouter();
	const { username } = currentUser;

	const isGov2Route: boolean = checkGov2Route(pathname, query);

	return (
		<Header className={`${className} shadow-md z-[1001] sticky top-0 flex items-center bg-white h-[60px] max-h-[60px] px-6 leading-normal border-solid border-t-0 border-r-0 border-b-2 border-l-0 border-pink_primary`}>
			<MenuOutlined className='lg:hidden mr-5' onClick={() => {
				setSidedrawer(!sidedrawer);
			}} />
			<nav className='w-full lg:w-11/12 lg:mx-auto flex items-center justify-between h-[60px] max-h-[60px]'>
				<div className='flex items-center'>
					<Link className='flex' href={isGov2Route ? '/gov-2' : '/'}><PALogoBlack className='' /></Link>
					<div className='flex items-center'>
						<span className='bg-pink_primary h-10 w-[1.5px] ml-[2px] mr-[10px]'></span>
						<h2 className='m-0 p-0 text-[#243A57] text-xs lg:text-sm font-medium lg:font-semibold lg:leading-[21px] lg:tracking-[0.02em]'>
							{
								isGov2Route? 'OpenGov': 'Governance V1'
							}
						</h2>
					</div>
				</div>

				<div className="flex items-center justify-between gap-x-2 md:gap-x-4 w-max lg:w-[82%] xl:w-[63%] 2xl:w-[55%]">
					{
						isOpenGovSupported(network) ?
							<CSSVariables>
								<GovernanceSwitchButton className='hidden lg:flex' />
							</CSSVariables> :
							<div className='hidden lg:flex min-w-[120px] mr-6 lg:mr-5 xl:mr-0'></div>
					}

					<Space className='flex items-center justify-between gap-x-2 md:gap-x-4'>
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
								<Link className='w-[60px] h-[22px] lg:w-[74px] lg:h-[32px] bg-pink_primary rounded-[2px] md:rounded-[4px] text-white lg:text-sm lg:font-medium lg:leading-[21px] tracking-[0.00125em] flex items-center justify-center hover:text-white' onClick={() => {setSidedrawer(false);}} href='/login'>Login</Link>
							</div>
						}
					</Space>
				</div>

			</nav>
		</Header>
	);
};

export default styled(NavHeader)`
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

.v2-button-wrapper {
min-width: min(40rem, 100%);
}

.v2-box {
font-family: 'Poppins';
margin: max(1rem, 3vw);
border: 0.25px solid;
padding: 6px 12px;
border-image: conic-gradient(from var(--angle), var(--c2), var(--c1) 0.1turn, var(--c1) 0.15turn, var(--c2) 0.25turn) 15;
animation: borderRotate var(--d) linear infinite forwards;
}

@keyframes borderRotate {
100% {
	--angle: 420deg;
}
}
`;
