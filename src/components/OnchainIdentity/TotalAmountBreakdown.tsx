// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import BN from 'bn.js';
import { network as AllNetworks } from '~src/global/networkConstants';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { ESetIdentitySteps, ITxFee, IVerifiedFields } from '.';
import { Alert, Button } from 'antd';
import UpArrowIcon from '~assets/icons/up-arrow.svg';
import DownArrowIcon from '~assets/icons/down-arrow.svg';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { AmountBreakdownModalIcon } from '~src/ui-components/CustomIcons';
import styled from 'styled-components';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';

interface Props {
	className?: string;
	txFee: ITxFee;
	changeStep: (step: ESetIdentitySteps) => void;
	perSocialBondFee: BN;
	loading: boolean;
	isIdentityAlreadySet: boolean;
	alreadyVerifiedfields: IVerifiedFields;
}
const getLearnMoreRedirection = (network: string) => {
	switch (network) {
		case AllNetworks.POLKADOT:
			return 'https://wiki.polkadot.network/docs/learn-identity';
		case AllNetworks.KUSAMA:
			return 'https://guide.kusama.network/docs/learn-identity';
	}
};

const TotalAmountBreakdown = ({ className, txFee, changeStep, perSocialBondFee, loading, isIdentityAlreadySet, alreadyVerifiedfields }: Props) => {
	const { registerarFee, minDeposite } = txFee;
	const { network } = useNetworkSelector();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [amountBreakup, setAmountBreakup] = useState<boolean>(false);
	const { id: userId } = useUserDetailsSelector();
	const [showAlert, setShowAlert] = useState<boolean>(false);

	const handleLocalStorageSave = (field: any) => {
		let data: any = localStorage.getItem('identityForm');
		if (data) {
			data = JSON.parse(data);
		}
		localStorage.setItem(
			'identityForm',
			JSON.stringify({
				...data,
				...field
			})
		);
	};
	useEffect(() => {
		let identityForm: any = localStorage.getItem('identityForm');
		identityForm = JSON.parse(identityForm);

		localStorage.setItem(
			'identityForm',
			JSON.stringify({
				...identityForm,
				userId
			})
		);
	}, [network, userId]);

	const handleRequestJudgement = () => {
		if (isIdentityAlreadySet && !!alreadyVerifiedfields.email && !!alreadyVerifiedfields.twitter) {
			handleLocalStorageSave({ setIdentity: true });
			changeStep(ESetIdentitySteps.SOCIAL_VERIFICATION);
		} else {
			setShowAlert(true);
		}
	};
	return (
		<div className={className}>
			{!isIdentityAlreadySet && showAlert && !alreadyVerifiedfields.email && !alreadyVerifiedfields.twitter && (
				<Alert
					showIcon
					type='info'
					className='mt-4 h-10 rounded-[4px] text-sm text-bodyBlue'
					message='No identity request found for judgment.'
				/>
			)}
			{isIdentityAlreadySet && showAlert && (!alreadyVerifiedfields.email || !alreadyVerifiedfields.twitter) && (
				<Alert
					showIcon
					type='info'
					className='mt-4 rounded-[4px] text-sm text-bodyBlue'
					description='To request judgement from Polkassembly please provide both twitter and email credentials for verification before requesting judgement.'
				/>
			)}

			<span className='-mt-6 flex items-center justify-center text-[350px]'>
				<AmountBreakdownModalIcon />
			</span>
			<ul className='-mt-6 flex flex-col gap-2 pl-4 text-sm tracking-[0.001em] text-bodyBlue'>
				<li>Polkadot offers on-chain identities that verify users&apos;s credentials through appointed registrars, instilling greater trust and support. </li>
				<li>
					Once successfully verified, users receive a green checkmark, symbolising their trusted status. This verified status symbol enhances trustworthiness when requesting funds
					from the treasury or participating in discussions and proposals.
					<u className='text-pink_primary'>
						<a
							className='ml-1 text-sm text-pink_primary'
							href={getLearnMoreRedirection(network)}
						>
							Learn more
						</a>
					</u>
				</li>
			</ul>
			<div className='min-h-[60px] rounded-lg bg-[#F6F7F9] px-3 py-[14px]'>
				<div className={`flex justify-between ${amountBreakup && 'border-0 border-b-[1px] border-solid border-[#E1E6EB] pb-3'}`}>
					<span className='text-sm text-lightBlue'>Total Amount Required</span>
					<div className='flex cursor-pointer flex-col text-base font-semibold text-bodyBlue'>
						<span
							className='flex justify-end'
							onClick={() => setAmountBreakup(!amountBreakup)}
						>
							{formatedBalance(perSocialBondFee.add(registerarFee.add(minDeposite)).toString(), unit, 2)} {unit}
							{amountBreakup ? <DownArrowIcon className='ml-2' /> : <UpArrowIcon className='ml-2' />}
						</span>
						<span className='mr-1 mt-[-2px] text-xs font-normal text-lightBlue'>{amountBreakup ? 'Hide' : 'View'} Amount Breakup</span>
					</div>
				</div>
				{amountBreakup && (
					<div className='mt-3 flex flex-col gap-2'>
						<span className='flex justify-between text-sm'>
							<span className='text-lightBlue'>Bond</span>
							<span className='font-medium text-bodyBlue'>
								{formatedBalance(perSocialBondFee.toString(), unit)} {unit} per social field
							</span>
						</span>
						<span className='flex justify-between text-sm'>
							<span className='text-lightBlue'>
								Min Deposit{' '}
								<HelperTooltip
									className='ml-1'
									text='Amount that needs held in an address for a verified account.'
								/>
							</span>
							<span className='font-medium text-bodyBlue'>
								{formatedBalance(minDeposite.toString(), unit, 2)} {unit}
							</span>
						</span>
						<span className='flex justify-between text-sm'>
							<span className='text-lightBlue'>
								Registrar fees{' '}
								<HelperTooltip
									text='Costs of development & maintenance are funded by the treasury.'
									className='ml-1'
								/>
							</span>
							<span className='font-medium text-bodyBlue'>
								{formatedBalance(registerarFee.toString(), unit)} {unit}
							</span>
						</span>
					</div>
				)}
			</div>
			<div className='-mx-6 mt-6 border-0 border-t-[1px] border-solid border-[#E1E6EB] px-6 pt-5'>
				<Button
					loading={loading}
					onClick={() => changeStep(ESetIdentitySteps.SET_IDENTITY_FORM)}
					className='h-[40px] w-full rounded-[4px] border-pink_primary bg-pink_primary text-sm tracking-wide text-white'
				>
					Let&apos;s Begin
				</Button>
				<button
					onClick={handleRequestJudgement}
					className='mt-2 h-[40px] w-full cursor-pointer rounded-[4px] bg-white text-sm tracking-wide text-pink_primary'
				>
					Request Judgement
					<HelperTooltip
						className='ml-2 w-[20px]'
						text={<span className='break-words'>If you have already set your identity, you can request a judgment directly from here </span>}
					/>
				</button>
			</div>
		</div>
	);
};

export default styled(TotalAmountBreakdown)`
	button {
		border: 1px solid var(--pink_primary);
	}
	.ant-alert-with-description {
		padding-block: 12px !important;
		padding-inline: 12px;
	}
	.ant-alert-with-description .ant-alert-icon {
		font-size: 18px !important;
		margin-top: 4px;
	}
`;
