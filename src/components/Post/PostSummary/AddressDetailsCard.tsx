// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { VerifiedIcon } from '~src/ui-components/CustomIcons';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import SingleSignatoryAlertIcon from '~assets/icons/info-alert.svg';
import NonVerifiedAlertIcon from '~assets/icons/red-info-alert.svg';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { useNetworkSelector } from '~src/redux/selectors';
import { useApiContext } from '~src/context';
import { MinusCircleFilled } from '@ant-design/icons';
import MultisigIcon from '~assets/icons/multisig-address.svg';
import { checkIsAddressMultisig } from '~src/components/DelegationDashboard/utils/checkIsAddressMultisig';
import Address from '~src/ui-components/Address';

interface Props {
	address: string;
	showAddress?: boolean;
}
const AddressDetailsCard = ({ address, showAddress = false }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const [identity, setIdentity] = useState<DeriveAccountRegistration | null>(null);
	const judgements = identity?.judgements.filter(([, judgement]): boolean => !judgement.isFeePaid);
	const isGood = judgements?.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);
	const isBad = judgements?.some(([, judgement]): boolean => judgement.isErroneous || judgement.isLowQuality);
	const [isMultisigProposer, setIsMultisigProposer] = useState(false);

	const handleIdentityInfo = async () => {
		if (!api || !apiReady || !address) return;

		const encoded_addr = getEncodedAddress(address, network);

		await api.derive.accounts
			.info(encoded_addr, (info: DeriveAccountInfo) => {
				setIdentity(info.identity);
			})
			.catch((e) => console.error(e));
	};
	useEffect(() => {
		handleIdentityInfo();
		setIsMultisigProposer(false);
		if (address) {
			checkIsAddressMultisig(address).then((isMulti) => setIsMultisigProposer(isMulti));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, api, apiReady, address]);

	const color: 'brown' | 'green' | 'grey' = isGood ? 'green' : isBad ? 'brown' : 'grey';
	return (
		<div className='flex items-center gap-3'>
			{showAddress && (
				<span className='min-w-[120px]'>
					<Address
						address={address}
						displayInline
						iconSize={20}
					/>
				</span>
			)}
			<span
				className={`flex items-center gap-1 rounded-lg border-[1px] border-solid px-2 py-1 text-xs text-lightBlue dark:text-[#909090] ${
					!isMultisigProposer ? 'border-[#91CAFF] bg-[#E6F4FF] dark:border-[#125798] dark:bg-[#05263F] ' : 'border-[#531FE4] bg-[#EEE9FC] dark:border-[#531FE4] dark:bg-[#281856]'
				}`}
			>
				{isMultisigProposer ? (
					<>
						<MultisigIcon />
						Multisig Account
					</>
				) : (
					<>
						<SingleSignatoryAlertIcon />
						Single signatory account
					</>
				)}
			</span>
			<span
				className={`flex items-center gap-1 rounded-lg border-[1px] border-solid px-2 py-1 text-xs text-lightBlue dark:text-[#909090]  ${
					isGood ? 'border-[#2ED47A] bg-[#EFFCF5] dark:border-[#026630] dark:bg-[#063E20]' : 'border-[#FFA08B] bg-[#F7E3E0] dark:border-[#5C3931] dark:bg-[#331701]'
				}`}
			>
				{isGood ? (
					<>
						<VerifiedIcon className='text-base' />
						Verified
					</>
				) : (
					<>
						{isBad ? <MinusCircleFilled style={{ color }} /> : <NonVerifiedAlertIcon />}
						Non Verified
					</>
				)}
			</span>
		</div>
	);
};
export default AddressDetailsCard;
