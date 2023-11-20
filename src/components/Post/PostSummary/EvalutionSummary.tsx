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
import { useApiContext, usePostDataContext } from '~src/context';
import { MinusCircleFilled } from '@ant-design/icons';
import MultisigIcon from '~assets/icons/multisig-address.svg';
import { checkIsAddressMultisig } from '~src/components/DelegationDashboard/utils/checkIsAddressMultisig';

const EvalutionSummary = () => {
	const {
		postData: { proposer }
	} = usePostDataContext();
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const [identity, setIdentity] = useState<DeriveAccountRegistration | null>(null);
	const judgements = identity?.judgements.filter(([, judgement]): boolean => !judgement.isFeePaid);
	const isGood = judgements?.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);
	const isBad = judgements?.some(([, judgement]): boolean => judgement.isErroneous || judgement.isLowQuality);
	const [isMultisigProposer, setIsMultisigProposer] = useState(false);

	const handleIdentityInfo = async () => {
		if (!api || !apiReady || !proposer) return;

		const encoded_addr = getEncodedAddress(proposer, network);

		await api.derive.accounts
			.info(encoded_addr, (info: DeriveAccountInfo) => {
				setIdentity(info.identity);
			})
			.catch((e) => console.error(e));
	};
	useEffect(() => {
		handleIdentityInfo();
		setIsMultisigProposer(false);
		if (proposer) {
			checkIsAddressMultisig(proposer).then((isMulti) => setIsMultisigProposer(isMulti));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, api, apiReady, proposer]);

	const color: 'brown' | 'green' | 'grey' = isGood ? 'green' : isBad ? 'brown' : 'grey';
	return (
		<div className='mt-4 pb-4 text-bodyBlue dark:text-blue-dark-high'>
			<label className='tracking[0.01em] text-lg font-medium'>Evaluation Summary</label>
			<div className='mt-4 flex items-center gap-2.5'>
				<span className='text-sm tracking-[0.01em]'>Proposer is </span>
				<span
					className={`flex items-center gap-1 rounded-lg border-[1px] border-solid px-2 py-1 text-xs text-lightBlue ${
						!isMultisigProposer ? 'border-[#91CAFF] bg-[#E6F4FF] ' : 'border-[#531FE4] bg-[#EEE9FC] '
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
					className={`flex items-center gap-1 rounded-lg border-[1px] border-solid px-2 py-1 text-xs text-lightBlue ${
						isGood ? 'border-[#2ED47A] bg-[#EFFCF5] ' : 'border-[#FFA08B] bg-[#F7E3E0] '
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
		</div>
	);
};
export default EvalutionSummary;
