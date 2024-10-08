import { poppins } from 'pages/_app';
import React from 'react';
import Image from 'next/image';
import { Divider } from 'antd';
import { useNetworkSelector } from '~src/redux/selectors';
import { chainProperties } from '~src/global/networkConstants';

const BalanceDetails = () => {
	const { network } = useNetworkSelector();
	const unit = chainProperties?.[network]?.tokenSymbol;

	return (
		<div className={`${poppins.className} ${poppins.variable} flex items-center gap-2`}>
			<div className='flex flex-col items-center '>
				<div className='flex items-center gap-[6px]'>
					<Image
						className='h-4 w-4 rounded-full object-contain'
						src={'/assets/icons/accounts/polkadot-icon.svg'}
						alt='Logo'
						width={16}
						height={16}
					/>
					<span className='text-xs text-blue-light-medium dark:text-blue-dark-medium'>Balance</span>
				</div>
				<span className='text-base font-semibold text-blue-light-high dark:text-blue-dark-high'>60 {unit}</span>
			</div>
			<Divider
				type='vertical'
				className='border-l-1 h-10 border-[#D2D8E0] dark:border-separatorDark max-lg:hidden xs:mt-0.5 xs:inline-block'
			/>
			<div className='flex flex-col items-center '>
				<div className='flex items-center gap-[6px]'>
					<Image
						className='h-4 w-4 rounded-full object-contain'
						src={'/assets/icons/accounts/tick-icon.svg'}
						alt='Logo'
						width={16}
						height={16}
					/>
					<span className='text-xs text-blue-light-medium dark:text-blue-dark-medium'>Transferrable</span>
				</div>
				<span className='text-base font-semibold text-blue-light-high dark:text-blue-dark-high'>60 {unit}</span>
			</div>
			<Divider
				type='vertical'
				className='border-l-1 h-10 border-[#D2D8E0] dark:border-separatorDark max-lg:hidden xs:mt-0.5 xs:inline-block'
			/>
			<div className='flex flex-col items-center '>
				<div className='flex items-center gap-[6px]'>
					<Image
						className='h-4 w-4 rounded-full object-contain'
						src={'/assets/icons/accounts/lock-icon.svg'}
						alt='Logo'
						width={16}
						height={16}
					/>
					<span className='text-xs text-blue-light-medium dark:text-blue-dark-medium'>Locked</span>
				</div>
				<span className='text-base font-semibold text-blue-light-high dark:text-blue-dark-high'>60 {unit}</span>
			</div>
		</div>
	);
};

export default BalanceDetails;
