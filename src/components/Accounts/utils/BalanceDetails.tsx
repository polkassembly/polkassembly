// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { poppins } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Divider } from 'antd';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { chainProperties } from '~src/global/networkConstants';
import BN from 'bn.js';
import { useApiContext } from '~src/context';
import userProfileBalances from '~src/util/userProfileBalances';
import { formatedBalance } from '~src/util/formatedBalance';

const ZERO_BN = new BN(0);

const BalanceDetails = ({ address }: { address: string }) => {
	const { api, apiReady } = useApiContext();
	const currentUser = useUserDetailsSelector();
	const { loginAddress } = currentUser;
	const { network } = useNetworkSelector();
	const unit = chainProperties?.[network]?.tokenSymbol;
	const [balances, setBalances] = useState<{ freeBalance: BN; transferableBalance: BN; lockedBalance: BN; total: BN }>({
		freeBalance: ZERO_BN,
		lockedBalance: ZERO_BN,
		total: ZERO_BN,
		transferableBalance: ZERO_BN
	});

	useEffect(() => {
		if (!api || !apiReady) return;
		(async () => {
			const allBalances = await userProfileBalances({ address: address || loginAddress, api, apiReady, network });
			setBalances({
				freeBalance: allBalances?.freeBalance || ZERO_BN,
				lockedBalance: allBalances?.transferableBalance || ZERO_BN,
				total: allBalances?.totalBalance || ZERO_BN,
				transferableBalance: allBalances?.lockedBalance || ZERO_BN
			});
		})();
	}, [address, network, loginAddress, api, apiReady]);

	return (
		<div className={`${poppins.className} ${poppins.variable} mt-1 md:mt-0 flex justify-between md:justify-start items-center md:gap-2`}>
			<div className='flex flex-col items-center '>
				<div className='flex items-center gap-1 md:gap-[6px]'>
					<Image
						className='h-4 w-4 rounded-full object-contain'
						src={'/assets/icons/accounts/polkadot-icon.svg'}
						alt='Logo'
						width={16}
						height={16}
					/>
					<span className='text-xs text-blue-light-medium dark:text-blue-dark-medium'>Balance</span>
				</div>
				<span className='whitespace-nowrap text-sm font-semibold text-blue-light-high dark:text-blue-dark-high md:text-base'>
					{formatedBalance(balances.freeBalance.toString(), unit, 1)} {unit}
				</span>
			</div>
			<Divider
				type='vertical'
				className='border-l-1 h-10 border-[#D2D8E0] dark:border-separatorDark max-lg:hidden xs:mt-0.5 xs:inline-block'
			/>
			<div className='flex flex-col items-center '>
				<div className='flex items-center gap-1 md:gap-[6px]'>
					<Image
						className='h-4 w-4 rounded-full object-contain'
						src={'/assets/icons/accounts/tick-icon.svg'}
						alt='Logo'
						width={16}
						height={16}
					/>
					<span className='text-xs text-blue-light-medium dark:text-blue-dark-medium'>Transferrable</span>
				</div>
				<span className='whitespace-nowrap text-sm font-semibold text-blue-light-high dark:text-blue-dark-high md:text-base'>
					{formatedBalance(balances.transferableBalance.toString(), unit, 1)} {unit}
				</span>
			</div>
			<Divider
				type='vertical'
				className='border-l-1 h-10 border-[#D2D8E0] dark:border-separatorDark max-lg:hidden xs:mt-0.5 xs:inline-block'
			/>
			<div className='flex flex-col items-center '>
				<div className='flex items-center gap-1 md:gap-[6px]'>
					<Image
						className='h-4 w-4 rounded-full object-contain'
						src={'/assets/icons/accounts/lock-icon.svg'}
						alt='Logo'
						width={16}
						height={16}
					/>
					<span className='text-xs text-blue-light-medium dark:text-blue-dark-medium'>Locked</span>
				</div>
				<span className='whitespace-nowrap text-sm font-semibold text-blue-light-high dark:text-blue-dark-high md:text-base'>
					{formatedBalance(balances.lockedBalance.toString(), unit, 1)} {unit}
				</span>
			</div>
		</div>
	);
};

export default BalanceDetails;
