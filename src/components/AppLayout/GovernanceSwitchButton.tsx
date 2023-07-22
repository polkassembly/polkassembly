// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useUserDetailsContext } from '~src/context';
import { EGovType } from '~src/global/proposalType';
import { UserDetailsContextType } from '~src/types';
import { SyncIcon } from '~src/ui-components/CustomIcons';

interface Props {
	className?: string;
  previousRoute?: string;
}

const GovernanceSwitchButton = ({ className } : Props) => {

	const { govType, setUserDetailsContextState } = useUserDetailsContext();
	const router = useRouter();

	return (
		<Link className={`${className}`}
			href={govType === EGovType.OPEN_GOV ? '/' : '/opengov' }
			onClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
				setUserDetailsContextState((prev: UserDetailsContextType) => {
					return{
						...prev,
						govType:  EGovType.OPEN_GOV === govType ? EGovType.GOV1 : EGovType.OPEN_GOV
					};
				});
				router.push(govType === EGovType.OPEN_GOV ? '/' : '/opengov');
			} }
		>
			<div className='m-0 border border-solid border-[rgba(72,95,125,0.2)] rounded-full flex items-center justify-center min-w-[200px] p-2 py-1'>
				<p className='text-sidebarBlue font-normal text-[10px] leading-[15px] tracking-[0.02em] m-0'>Switch to</p>
				<p className='font-poppins ml-[6px] mr-[11px] text-sidebarBlue text-xs font-semibold leading-[18px] tracking-[0.02em] m-0'> {govType === EGovType.OPEN_GOV ? 'Governance V1' : 'OpenGov'} </p>
				<p className='flex items-center justify-center text-navBlue text-base m-0'><SyncIcon /></p>
			</div>
		</Link>
	);
};

export default GovernanceSwitchButton;