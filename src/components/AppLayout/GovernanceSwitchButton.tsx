// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import React from 'react';
import { useNetworkContext } from '~src/context';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { SyncIcon } from '~src/ui-components/CustomIcons';

interface Props {
	className?: string;
}

const GovernanceSwitchButton = ({ className }: Props) => {
	const { network } = useNetworkContext();

	return (
		<div className={`${className}`}>
<<<<<<< HEAD
			<Link className='m-0 border border-solid border-[rgba(72,95,125,0.2)] dark:border-[#3B444F] rounded-full flex items-center justify-center min-w-[200px] p-2 py-1' href={isGov2Route ? '/' : '/opengov'}>
				<p className='text-sidebarBlue dark:text-blue-dark-high font-normal text-[10px] leading-[15px] tracking-[0.02em] m-0'>Switch to</p>
				<p className='font-poppins ml-[6px] mr-[11px] text-sidebarBlue dark:text-blue-dark-high text-xs font-semibold leading-[18px] tracking-[0.02em] m-0'> {isGov2Route ? 'Governance V1' : 'OpenGov'} </p>
				<p className='flex items-center justify-center text-navBlue dark:text-blue-dark-high text-base m-0'><SyncIcon /></p>
=======
			<Link
				className='m-0 flex min-w-[200px] items-center justify-center rounded-full border border-solid border-[rgba(72,95,125,0.2)] p-2 py-1'
				href='/'
			>
				<p className='m-0 text-[10px] font-normal leading-[15px] tracking-[0.02em] text-sidebarBlue'>Switch to</p>
				<p className='m-0 ml-[6px] mr-[11px] font-poppins text-xs font-semibold leading-[18px] tracking-[0.02em] text-sidebarBlue'>
					{isOpenGovSupported(network) ? 'OpenGov' : 'Governance V1'}
				</p>
				<p className='m-0 flex items-center justify-center text-base text-navBlue'>
					<SyncIcon />
				</p>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
			</Link>
		</div>
	);
};

export default GovernanceSwitchButton;
