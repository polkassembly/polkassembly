// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { IBeneficiary } from '~src/types';
import Beneficiary from './Beneficiary';
import { Popover } from 'antd';
import { BeneficiaryIcon, BeneficiaryWhiteIcon } from '../CustomIcons';
import { useTheme } from 'next-themes';

interface Props {
	className?: string;
	beneficiaries?: IBeneficiary[];
}

const BeneficiariesListing = ({ className, beneficiaries }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	if (!beneficiaries || beneficiaries.length === 0) return null;

	return (
		<div className={`${className} flex flex-wrap items-center gap-1`}>
			{theme === 'dark' ? <BeneficiaryWhiteIcon className='-mt-[2px]' /> : <BeneficiaryIcon className='-mt-[2px]' />}
			<span className='ml-[1px] mr-1 text-xs text-blue-light-medium dark:text-blue-dark-medium'>Beneficiary:</span>
			<Beneficiary beneficiary={beneficiaries[0]} />
			{beneficiaries.length > 1 && (
				<span className='flex items-center gap-1'>
					&amp;
					<Popover
						content={
							<div className='flex flex-col gap-2'>
								{beneficiaries.slice(1).map((beneficiary, index) => (
									<Beneficiary
										key={index}
										beneficiary={beneficiary}
									/>
								))}
							</div>
						}
						trigger='click'
					>
						<u className='cursor-pointer text-[#407BFF]'>{beneficiaries.length - 1} more</u>
					</Popover>
				</span>
			)}
		</div>
	);
};

export default BeneficiariesListing;
