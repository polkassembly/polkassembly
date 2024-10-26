// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useGov1treasuryProposal, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import AddressInput from '~src/ui-components/AddressInput';
import Balance from '../Balance';
import getEncodedAddress from '~src/util/getEncodedAddress';
import classNames from 'classnames';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Address from '~src/ui-components/Address';
import { updateGov1TreasuryProposal } from '~src/redux/gov1TreasuryProposal';
import BalanceInput from '~src/ui-components/BalanceInput';
import { useTheme } from 'next-themes';
import BN from 'bn.js';
import { chainProperties } from '~src/global/networkConstants';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import { poppins } from 'pages/_app';
import { formatedBalance } from '~src/util/formatedBalance';
import Alert from '~src/basic-components/Alert';
import executeTx from '~src/util/executeTx';
import queueNotification from '~src/ui-components/QueueNotification';
import { ILoading, NotificationStatus } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { CreatePostResponseType } from '~src/auth/types';
import { ProposalType } from '~src/global/proposalType';
import Link from 'next/link';
import { onchainIdentitySupportedNetwork } from '../AppLayout';
import Image from 'next/image';
import { checkIsAddressMultisig } from '../DelegationDashboard/utils/checkIsAddressMultisig';
import { trackEvent } from 'analytics';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';

interface Props {
	className?: string;
	setStep: (pre: number) => void;
	setOpenAddressLinkedModal: (pre: boolean) => void;
	setOpen: (pre: boolean) => void;
	setOpenSuccessModal: (pre: boolean) => void;
}
const ZERO_BN = new BN(0);
const CreateProposal = ({ className, setOpenAddressLinkedModal, setOpen, setOpenSuccessModal }: Props) => {
	const { network } = useNetworkSelector();
	const { id: userId, loginAddress, username } = useUserDetailsSelector();
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const { resolvedTheme: theme } = useTheme();
	const [form] = Form.useForm();
	const dispatch = useDispatch();
	const gov1proposalData = useGov1treasuryProposal();
	const { beneficiary, proposer, fundingAmount, title, content, discussionId, isDiscussionLinked, tags, allowedCommentors } = gov1proposalData;

	const [{ minBond, proposalBond }, setTreasuryData] = useState<{ proposalBond: string | null; minBond: string | null }>({
		minBond: '',
		proposalBond: ''
	});
	const [gasFee, setGasFee] = useState<BN>(ZERO_BN);
	const [showIdentityInfoCardForProposer, setShowIdentityInfoCardForProposer] = useState<boolean>(false);
	const [showMultisigInfoCard, setShowMultisigInfoCard] = useState<boolean>(false);
	const [showIdentityInfoCardForBeneficiary, setShowIdentityInfoCardForBeneficiary] = useState<boolean>(false);
	const [loading, setLoading] = useState<ILoading>({ isLoading: false, message: '' });
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const unit = network ? chainProperties[network]?.tokenSymbol : null;

	const getGasFee = async () => {
		if (!api || !apiReady || !beneficiary || !getEncodedAddress(beneficiary, network) || fundingAmount == '0' || !proposer) return;
		const tx = api.tx.treasury.proposeSpend(fundingAmount, beneficiary);
		const gasFee = await tx.paymentInfo(proposer);
		setGasFee(new BN(gasFee.partialFee || '0'));
	};

	const handleOnchange = (obj: any) => {
		dispatch(updateGov1TreasuryProposal({ ...gov1proposalData, ...obj }));
	};

	const handleAvailableBalanceChange = (balanceStr: string) => {
		let balance = ZERO_BN;

		try {
			balance = new BN(balanceStr);
		} catch (err) {
			console.log(err);
		}
		setAvailableBalance(balance);
	};

	const checkBeneficiaryMultisig = async (address: string) => {
		if (!address) {
			setShowMultisigInfoCard(false);
			return;
		}
		await checkIsAddressMultisig(address).then((isMulti) => setShowMultisigInfoCard(!isMulti));
	};

	const checkBeneficiaryIdentity = async (address: string) => {
		if (!api || !address || !apiReady) {
			setShowIdentityInfoCardForBeneficiary(false);
			return;
		}

		const info = await getIdentityInformation({ address: address, api: peopleChainApi ?? api, network });
		setShowIdentityInfoCardForBeneficiary(!info?.isGood);
	};

	const handleBeneficiaryChange = async (address: string) => {
		const encodedAddr = getEncodedAddress(address, network) || '';
		handleOnchange({ ...gov1proposalData, beneficiary: encodedAddr || address });
		await checkBeneficiaryIdentity(encodedAddr || address);
		await checkBeneficiaryMultisig(encodedAddr || address);
	};

	const handleSaveTreasuryProposal = async (postId: number) => {
		const { data, error: apiError } = await nextApiClientFetch<CreatePostResponseType>('api/v1/auth/actions/createTreasuryProposal', {
			allowedCommentors: [allowedCommentors],
			content,
			discussionId: isDiscussionLinked ? discussionId : null,
			postId,
			proposalType: ProposalType.TREASURY_PROPOSALS,
			proposerAddress: proposer,
			tags,
			title,
			userId
		});

		if (apiError || !data?.post_id) {
			queueNotification({
				header: 'Error',
				message: apiError,
				status: NotificationStatus.ERROR
			});
			console.error(apiError);
		}
		setOpen(false);
	};

	const handleCreateProposal = async () => {
		if (!api || !apiReady || !beneficiary || fundingAmount == '0' || !proposer) return;

		setLoading({ isLoading: true, message: 'Awaiting Confirmation' });

		const tx = api.tx.treasury.proposeSpend(fundingAmount, beneficiary);
		const postId = Number(await api.query.treasury.proposalCount());

		const onSuccess = () => {
			trackEvent('gov1_proposal_via_polkassembly_created', 'created_gov1_proposal_via_polkassembly', {
				loginAddress: loginAddress || '',
				postId: postId || '',
				userId: userId || '',
				userName: username || ''
			});
			handleSaveTreasuryProposal(postId);
			queueNotification({
				header: 'Success!',
				message: 'Proposal Created Successfully!',
				status: NotificationStatus.SUCCESS
			});

			handleOnchange({ ...gov1proposalData, proposalIndex: postId });

			setLoading({ isLoading: true, message: 'Proposal Creation Succcess!' });
			setOpen(false);
			setOpenSuccessModal(true);
		};
		const onFailed = () => {
			queueNotification({
				header: 'failed!',
				message: 'Transaction failed!',
				status: NotificationStatus.ERROR
			});
			setLoading({ isLoading: false, message: '' });
		};

		await executeTx({
			address: proposer,
			api,
			apiReady,
			errorMessageFallback: 'Failed!',
			network,
			onFailed,
			onSuccess,
			setStatus: (message: string) => setLoading({ isLoading: true, message }),
			tx
		});
	};

	const checkProposerIdentity = async (address: string) => {
		if (!api || !address || !apiReady) {
			setShowIdentityInfoCardForProposer(false);
			return;
		}
		const info = await getIdentityInformation({ address: address, api: peopleChainApi ?? api, network });
		setShowIdentityInfoCardForProposer(!info?.display);
	};

	useEffect(() => {
		let firstStepPercentage = 0;
		let secondStepPercentage = 0;
		if (proposer?.length) {
			secondStepPercentage += 33.33;
		}
		if (beneficiary?.length) {
			secondStepPercentage += 33.33;
		}
		if (fundingAmount !== '0') {
			secondStepPercentage += 33.33;
		}

		if (title?.length) {
			firstStepPercentage += 50;
		}
		if (content?.length) {
			firstStepPercentage += 50;
		}
		dispatch(
			updateGov1TreasuryProposal({
				...gov1proposalData,
				firstStepPercentage,
				proposer: proposer || loginAddress,
				secondStepPercentage
			})
		);
		checkProposerIdentity(proposer || loginAddress);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginAddress, proposer, api, apiReady, network, peopleChainApi, peopleChainApiReady]);

	useEffect(() => {
		const networkChainProperties = chainProperties[network];
		if (networkChainProperties) {
			const { treasuryProposalBondPercent, treasuryProposalMinBond } = networkChainProperties;
			setTreasuryData({ minBond: treasuryProposalMinBond, proposalBond: treasuryProposalBondPercent });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		let percentage = 0;
		if (beneficiary?.length) {
			percentage = 66.66;
		}
		if (fundingAmount !== '0') {
			percentage = 100;
		}
		handleOnchange({ ...gov1proposalData, secondStepPercentage: percentage });

		getGasFee();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [beneficiary, proposer, fundingAmount]);

	return (
		<Spin
			spinning={loading.isLoading}
			tip={loading.message}
		>
			<div className={classNames(className, 'mt-6')}>
				<Form
					initialValues={{ beneficiary, proposerAddress: proposer || loginAddress }}
					form={form}
					className={'proposal'}
				>
					<div className='mt-6 flex w-full flex-col gap-6'>
						{gasFee.gte(availableBalance) && !gasFee.eq(ZERO_BN) && (
							<Alert
								type='error'
								className={`h-10 rounded-[4px] text-bodyBlue ${poppins.variable} ${poppins.className}`}
								showIcon
								message={<span className='dark:text-blue-dark-high'>Insufficient available balance.</span>}
							/>
						)}
						{/* proposer address */}
						<div className='w-full'>
							<div className=' flex items-center justify-between text-lightBlue dark:text-blue-dark-medium'>
								<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Proposer Address </label>
								{!!proposer && (
									<Balance
										address={proposer}
										onChange={handleAvailableBalanceChange}
									/>
								)}
							</div>
							<div className='flex w-full items-end gap-2 text-sm '>
								<div className='flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
									<Address
										address={proposer || loginAddress || ''}
										isTruncateUsername={false}
										displayInline
									/>
									<CustomButton
										text='Change Wallet'
										onClick={() => {
											setOpenAddressLinkedModal(true);
											setOpen(false);
										}}
										width={91}
										className='change-wallet-button mr-1 flex items-center justify-center'
										height={21}
										variant='primary'
									/>
								</div>
							</div>
							{showIdentityInfoCardForProposer && onchainIdentitySupportedNetwork.includes(network) && (
								<Alert
									className='icon-fix mt-2 rounded-[4px] dark:text-blue-dark-high'
									showIcon
									type='info'
									message={
										<div className='text-[13px] dark:text-blue-dark-high'>
											Your proposer address is currently unverified. Please set your on-chain identity to increase the likelihood of your proposal being approved.
											<Link
												target='_blank'
												href={'?setidentity=true'}
												className='ml-1 text-xs font-medium text-pink_primary'
												onClick={(e) => {
													if (!userId) {
														e.preventDefault();
														e.stopPropagation();
													}
												}}
											>
												Set onchain identity
											</Link>
										</div>
									}
								/>
							)}
						</div>

						{/* beneficiary address */}
						<div>
							<div className=' flex items-center justify-between text-lightBlue dark:text-blue-dark-medium'>
								<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>
									Beneficary Address{' '}
									<HelperTooltip
										className='ml-1'
										text='The amount requested in the proposal will be received in this address.'
									/>
								</label>
							</div>
							<div className='flex w-full items-end gap-2 text-sm '>
								<AddressInput
									skipFormatCheck
									className='-mt-6 w-full'
									defaultAddress={beneficiary}
									name='beneficiary'
									placeholder='Enter Beneficary Address'
									iconClassName={'ml-[10px]'}
									identiconSize={26}
									onChange={(address: string) => handleBeneficiaryChange(address)}
								/>
							</div>
							{showMultisigInfoCard && (
								<Alert
									className='mt-2 rounded-[4px] text-[13px]'
									showIcon
									message={<span className='text-[13px] dark:text-blue-dark-high'>Using a multisig proposal address provides a higher chance for the proposal to pass. </span>}
									description={
										<Link
											className='text-xs font-medium text-pink_primary'
											target='_blank'
											href='https://polkasafe.xyz/'
										>
											<Image
												width={16}
												height={16}
												src='/assets/polkasafe-logo.svg'
												alt='polkasafe'
												className={`${theme === 'dark' && 'icon-color'} mr-0.5`}
											/>
											Create a Multisig Wallet on PolkaSafe now
										</Link>
									}
									type='info'
								/>
							)}
							{showIdentityInfoCardForBeneficiary && onchainIdentitySupportedNetwork.includes(network) && (
								<Alert
									className='icon-fix mt-2 rounded-[4px] dark:text-blue-dark-high'
									showIcon
									type='info'
									message={
										<div className='text-[13px] dark:text-blue-dark-high'>
											Your beneficiary address is currently unverified. Please set your on-chain identity to increase the likelihood of your proposal being approved.
											<Link
												target='_blank'
												href={'?setidentity=true'}
												className='ml-1 text-xs font-medium text-pink_primary'
												onClick={(e) => {
													if (!userId) {
														e.preventDefault();
														e.stopPropagation();
													}
												}}
											>
												Set onchain identity
											</Link>
										</div>
									}
								/>
							)}
						</div>

						{/* funding amount */}
						<div>
							<BalanceInput
								theme={theme}
								balance={new BN(fundingAmount || '0')}
								formItemName='balance'
								placeholder='Enter Funding Amount'
								label='Funding Amount'
								inputClassName='dark:text-blue-dark-high text-bodyBlue'
								className='mb-0'
								onChange={(amount: BN) => handleOnchange({ ...gov1proposalData, fundingAmount: amount.toString() })}
							/>
						</div>

						{/* Proposal Bond */}
						{proposalBond?.length ? (
							<div>
								<label className='mb-0.5 flex items-center text-sm text-bodyBlue dark:text-blue-dark-medium'>
									Proposal Bond
									<HelperTooltip
										className='ml-2'
										text='Of the beneficiary amount, at least 5.00% would need to be put up as collateral. The maximum of this and the minimum bond will be used to secure the proposal, refundable if it passes.'
									/>
								</label>
								<Input
									className='hide-pointer h-10 rounded-[4px] border-section-light-container dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high'
									value={proposalBond}
									disabled
								/>
							</div>
						) : null}

						{/* Minimum Bond */}
						{minBond?.length ? (
							<div>
								<label className=' mb-0.5 flex items-center text-sm text-bodyBlue dark:text-blue-dark-medium'>
									Minimum Bond
									<HelperTooltip
										className='ml-2'
										text='The minimum amount that will be bonded.'
									/>
								</label>

								<Input
									className='hide-pointer h-10 rounded-[4px] border-section-light-container dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high'
									value={minBond}
									disabled
								/>
							</div>
						) : null}
					</div>
				</Form>
				{gasFee.gte(ZERO_BN) && (
					<Alert
						showIcon
						type='info'
						className='mt-6 rounded-[4px]'
						message={
							<span className='text-[13px] dark:text-blue-dark-high'>
								An approximate fees of {formatedBalance(gasFee.toString(), unit as string, 2)} {unit} will be applied to the transaction
							</span>
						}
					/>
				)}
				<div className='-mx-6 mt-6 flex justify-end border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
					<CustomButton
						text='Create Proposal'
						onClick={handleCreateProposal}
						variant='primary'
						height={40}
						width={155}
						className={`${(!beneficiary?.length || !proposer?.length || fundingAmount == '0' || loading?.isLoading || gasFee.gte(availableBalance)) && 'opacity-50'} `}
						disabled={!beneficiary?.length || !proposer?.length || fundingAmount == '0' || loading.isLoading || gasFee.gte(availableBalance)}
					/>
				</div>
			</div>
		</Spin>
	);
};
export default styled(CreateProposal)`
	.change-wallet-button {
		font-size: 10px !important;
	}
	.proposal .ant-form-item {
		margin-bottom: 0px !important;
	}
	.ant-alert-with-description {
		padding-block: 10px !important;
		padding: 10px 12px !important;
	}
	.icon-fix .ant-alert-icon {
		font-size: 14px !important;
		margin-top: -20px;
	}

	.ant-alert-with-description .ant-alert-icon {
		font-size: 15px !important;
		margin-top: 6px;
		margin-right: 8px;
	}

	.ant-alert-with-description .ant-alert-description {
		color: var(--bodyBlue) !important;
		margin-top: -6px;
	}
	.icon-color {
		filter: brightness(100%) saturate(0%) contrast(3.5) invert(100%) !important;
	}
`;
