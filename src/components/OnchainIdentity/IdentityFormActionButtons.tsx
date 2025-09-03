// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import BN from 'bn.js';
import React, { useMemo } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useOnchainIdentitySelector } from '~src/redux/selectors';
import { IIdentityFormActionButtons } from './types';
import allowSetIdentity from './utils/allowSetIdentity';
import classNames from 'classnames';

const ZERO_BN = new BN(0);

const IdentityFormActionButtons = ({
	onCancel,
	handleSetIdentity,
	loading,
	availableBalance,
	txFee,
	okAll,
	proxyAddresses,
	showProxyDropdown,
	isProxyExistsOnWallet
}: IIdentityFormActionButtons) => {
	const { identityInfo, displayName, legalName, socials } = useOnchainIdentitySelector();
	const { registerarFee, minDeposite, gasFee } = txFee;
	const { email, twitter, matrix } = socials;

	const totalFee = useMemo(() => {
		return gasFee.add(registerarFee?.add(!!identityInfo?.alreadyVerified || !!identityInfo.isIdentitySet ? ZERO_BN : minDeposite));
	}, [gasFee, registerarFee, minDeposite, identityInfo]);

	const handleAllowSetIdentity = () => {
		return allowSetIdentity({ displayName, email: email, identityInfo: identityInfo, legalName: legalName, matrix, twitter: twitter });
	};

	return (
		<div className='-mx-6 mt-6 flex justify-end gap-4 rounded-[4px] border-0 border-t-[1px] border-solid border-[#E1E6EB] px-6 pt-5 dark:border-separatorDark'>
			<CustomButton
				onClick={() => onCancel()}
				className='rounded-[4px]'
				text='Cancel'
				type='default'
				buttonsize='xs'
			/>
			{!!identityInfo?.email && !!identityInfo?.displayName && handleAllowSetIdentity() && !identityInfo?.alreadyVerified ? (
				<CustomButton
					onClick={() => handleSetIdentity(true)}
					loading={loading}
					disabled={!(availableBalance && availableBalance.gt(totalFee))}
					className={classNames('rounded-[4px]', !(availableBalance && availableBalance.gt(totalFee)) ? 'opacity-50' : '')}
					text='Request Judgement'
					type='primary'
					width={186}
				/>
			) : (
				<CustomButton
					disabled={
						!okAll ||
						loading ||
						(availableBalance && availableBalance.lte(totalFee)) ||
						handleAllowSetIdentity() ||
						(!!proxyAddresses && proxyAddresses?.length > 0 && showProxyDropdown && !isProxyExistsOnWallet)
					}
					onClick={() => handleSetIdentity(false)}
					loading={loading}
					className={`rounded-[4px] ${
						(!okAll ||
							loading ||
							(availableBalance && availableBalance.lte(totalFee)) ||
							handleAllowSetIdentity() ||
							(!!proxyAddresses && proxyAddresses?.length > 0 && showProxyDropdown && !isProxyExistsOnWallet)) &&
						'opacity-50'
					}`}
					text='Set Identity'
					type='primary'
					buttonsize='xs'
				/>
			)}
		</div>
	);
};
export default IdentityFormActionButtons;
