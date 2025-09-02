// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { VerifiedIcon } from '~src/ui-components/CustomIcons';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import SingleSignatoryAlertIcon from '~assets/icons/info-alert.svg';
import NonVerifiedAlertIcon from '~assets/icons/red-info-alert.svg';
import { useNetworkSelector } from '~src/redux/selectors';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import { MinusCircleFilled } from '@ant-design/icons';
import MultisigIcon from '~assets/icons/multisig-address.svg';
import { checkIsAddressMultisig } from '~src/components/DelegationDashboard/utils/checkIsAddressMultisig';
import Address from '~src/ui-components/Address';
import { shortenString } from '~src/util/shortenString';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
interface Props {
	address: string;
	showAddress?: boolean;
}
const AddressDetailsCard = ({ address, showAddress = false }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const [identity, setIdentity] = useState<DeriveAccountRegistration | null>(null);
	const judgements = identity?.judgements.filter(([, judgement]: any[]): boolean => !judgement?.FeePaid);
	const isGood = judgements?.some(([, judgement]: any[]): boolean => ['KnownGood', 'Reasonable'].includes(judgement));
	const isBad = judgements?.some(([, judgement]: any[]): boolean => ['Erroneous', 'LowQuality'].includes(judgement));

	const [isMultisigProposer, setIsMultisigProposer] = useState(false);

	const handleIdentityInfo = async () => {
		if (!api || !address || !apiReady) return;

		const info = await getIdentityInformation({
			address: address,
			api: peopleChainApi ?? api,
			network: network
		});
		setIdentity(info as any);
	};

	useEffect(() => {
		handleIdentityInfo();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, api, apiReady, address, peopleChainApi, peopleChainApiReady]);

	useEffect(() => {
		setIsMultisigProposer(false);
		if (address) {
			checkIsAddressMultisig(address).then((isMulti) => setIsMultisigProposer(isMulti));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, api, apiReady, address]);

	const color: 'brown' | 'green' | 'grey' = isGood ? 'green' : isBad ? 'brown' : 'grey';
	return (
		<div className='flex w-fit items-center gap-3'>
			{showAddress && (
				<span className='min-w-[120px]'>
					<Address
						address={address}
						displayInline
						iconSize={20}
					/>
				</span>
			)}
			<div
				className={`flex items-center gap-1 rounded-lg border-[1px] border-solid px-2 py-1 text-xs text-lightBlue dark:text-[#909090] ${
					!isMultisigProposer
						? 'border-infoAlertBorderDark bg-[#E6F4FF] dark:border-[#125798] dark:bg-[#05263F] '
						: 'border-[#531FE4] bg-[#EEE9FC] dark:border-[#531FE4] dark:bg-[#281856]'
				}`}
			>
				{isMultisigProposer ? (
					<>
						<MultisigIcon />
						Multisig Account
					</>
				) : (
					<div>
						<div className='token-desktop-container flex items-center gap-x-1'>
							<SingleSignatoryAlertIcon />
							<p className='m-0 p-0'>Single signatory account</p>
						</div>
						<div className='token-mobile-container block'>
							{/* <SingleSignatoryAlertIcon /> */}
							{shortenString('SingleSignatory', 4)} acc
						</div>
					</div>
				)}
			</div>
			<div
				className={`verified-container flex items-center gap-1 rounded-lg border-[1px] border-solid px-2 py-1 text-xs text-lightBlue dark:text-[#909090]  ${
					isGood ? 'border-[#2ED47A] bg-[#EFFCF5] dark:border-[#026630] dark:bg-[#063E20]' : 'border-[#FFA08B] bg-[#F7E3E0] dark:border-[#5C3931] dark:bg-[#331701]'
				}`}
			>
				{isGood ? (
					<>
						<VerifiedIcon className='text-base' />
						Verified
					</>
				) : (
					<div>
						<div className='token-desktop-container flex items-center gap-x-1'>
							{isBad ? <MinusCircleFilled style={{ color }} /> : <NonVerifiedAlertIcon />}
							<p className='m-0 p-0'>Non Verified</p>
						</div>
						<div className='token-mobile-container block'>{shortenString('Not Verified', 3)}</div>
					</div>
				)}
			</div>
		</div>
	);
};
export default AddressDetailsCard;
