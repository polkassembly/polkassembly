// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Spin } from 'antd';
import BN from 'bn.js';
import React, { useState } from 'react';
import Alert from '~src/basic-components/Alert';
import { useNetworkSelector, useOnchainIdentitySelector } from '~src/redux/selectors';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { formatedBalance } from '~src/util/formatedBalance';
import { ITxFee } from './types';
import { chainProperties } from '~src/global/networkConstants';
import { useTranslation } from 'next-i18next';

const ZERO_BN = new BN(0);

interface IIdentityTxBreakdown {
	txFee: ITxFee;
	loading: boolean;
}

const IdentityTxBreakdown = ({ txFee, loading }: IIdentityTxBreakdown) => {
	const { t } = useTranslation('common');
	const { network } = useNetworkSelector();
	const { identityInfo } = useOnchainIdentitySelector();
	const { registerarFee, minDeposite, gasFee } = txFee;
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [hideDetails, setHideDetails] = useState<boolean>(false);

	const totalFee = gasFee.add(registerarFee?.add(!!identityInfo?.alreadyVerified || !!identityInfo.isIdentitySet ? ZERO_BN : minDeposite));
	return (
		<div>
			{(!gasFee.eq(ZERO_BN) || loading) && (
				<Spin spinning={loading}>
					<Alert
						className='mt-4 rounded-[4px]'
						type='info'
						showIcon
						message={
							<span className='text-[13px] font-medium text-bodyBlue dark:text-blue-dark-high'>
								{t('transaction_fee_required', { amount: formatedBalance(totalFee.toString(), unit, 2), unit })}
								<span
									className='ml-1 cursor-pointer text-xs text-pink_primary'
									onClick={() => setHideDetails(!hideDetails)}
								>
									{hideDetails ? t('show_details') : t('hide_details')}
								</span>
							</span>
						}
						description={
							hideDetails ? (
								''
							) : (
								<div className='mr-[18px] flex flex-col gap-1 text-sm'>
									<span className='flex justify-between text-xs'>
										<span className='text-lightBlue dark:text-blue-dark-medium'>
											{t('min_deposit_refundable')}
											<HelperTooltip
												className='ml-1'
												text={t('deposit_tooltip')}
											/>
										</span>
										<span className='dark:text-blue-dark-hi font-medium text-bodyBlue dark:text-blue-dark-high'>
											{formatedBalance(identityInfo.alreadyVerified || identityInfo.isIdentitySet ? '0' : minDeposite.toString(), unit, 2)} {unit}
										</span>
									</span>
									<span className='flex justify-between text-xs'>
										<span className='text-lightBlue dark:text-blue-dark-medium'>{t('gas_fee')}</span>
										<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
											{formatedBalance(gasFee.toString(), unit)} {unit}
										</span>
									</span>
									<span className='flex justify-between text-xs'>
										<span className='text-lightBlue dark:text-blue-dark-medium'>
											{t('registrar_fee')}
											<HelperTooltip
												text={t('registrar_fee_tooltip')}
												className='ml-1'
											/>
										</span>
										<span className='dark:text-blue-dark-hi font-medium text-bodyBlue dark:text-blue-dark-high'>
											{formatedBalance(registerarFee.toString(), unit)} {unit}
										</span>
									</span>
									<span className='text-md mt-1 flex justify-between'>
										<span className='text-lightBlue dark:text-blue-dark-medium'>{t('total')}</span>
										<span className='dark:text-blue-dark-hi font-medium text-bodyBlue dark:text-blue-dark-high'>
											{formatedBalance(totalFee.toString(), unit, 2)} {unit}
										</span>
									</span>
								</div>
							)
						}
					/>
				</Spin>
			)}
		</div>
	);
};

export default IdentityTxBreakdown;
