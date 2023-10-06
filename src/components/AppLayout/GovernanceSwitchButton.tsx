// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import React from 'react';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { SyncIcon } from '~src/ui-components/CustomIcons';
import { useNetworkSelector } from '~src/redux/selectors';

interface Props {
	className?: string;
}

const GovernanceSwitchButton = ({ className }: Props) => {
	const { network } = useNetworkSelector();

	return (
		<div className={`${className}`}>
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
			</Link>
		</div>
	);
};

export default GovernanceSwitchButton;
