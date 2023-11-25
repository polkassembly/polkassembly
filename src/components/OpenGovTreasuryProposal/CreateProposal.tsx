// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Alert, Button, Spin, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { EEnactment, IEnactment } from '.';
import BN from 'bn.js';
import Address from '~src/ui-components/Address';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { useApiContext } from '~src/context';
import { BN_HUNDRED, formatBalance } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';
import { formatedBalance } from '~src/util/formatedBalance';
import copyToClipboard from '~src/util/copyToClipboard';
import { LoadingOutlined } from '@ant-design/icons';
import queueNotification from '~src/ui-components/QueueNotification';
import { IBeneficiary, NotificationStatus } from '~src/types';
import { Injected, InjectedWindow } from '@polkadot/extension-inject/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { APPNAME } from '~src/global/appName';
import styled from 'styled-components';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { CreatePostResponseType } from '~src/auth/types';
import { poppins } from 'pages/_app';
import executeTx from '~src/util/executeTx';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { CopyIcon } from '~src/ui-components/CustomIcons';
import Beneficiary from '~src/ui-components/BeneficiariesListing/Beneficiary';
import { trackEvent } from 'analytics';

const ZERO_BN = new BN(0);

interface Props {
	className?: string;
	isPreimage: boolean;
	proposerAddress: string;
	fundingAmount: BN;
	selectedTrack: string;
	preimageHash: string;
	preimageLength: number | null;
	enactment: IEnactment;
	beneficiaryAddresses: IBeneficiary[];
	setOpenModal: (pre: boolean) => void;
	setOpenSuccess: (pre: boolean) => void;
	title: string;
	content: string;
	tags: string[];
	postId: number;
	setPostId: (pre: number) => void;
	availableBalance: BN;
	discussionLink: string | null;
}
const getDiscussionIdFromLink = (discussion: string) => {
	const splitedArr = discussion?.split('/');
	return splitedArr[splitedArr.length - 1];
};

const CreateProposal = ({
	className,
	isPreimage,
	fundingAmount,
	proposerAddress,
	selectedTrack,
	preimageHash,
	preimageLength,
	enactment,
	beneficiaryAddresses,
	setOpenModal,
	setOpenSuccess,
	title,
	content,
	tags,
	setPostId,
	availableBalance,
	discussionLink
}: Props) => {
	const { network } = useNetworkSelector();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [messageApi, contextHolder] = message.useMessage();
	const { api, apiReady } = useApiContext();
	const [txFee, setTxFee] = useState(ZERO_BN);
	const [submitionDeposite, setSubmissionDeposite] = useState<BN>(ZERO_BN);
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const { id: userId } = useUserDetailsSelector();
	const discussionId = discussionLink ? getDiscussionIdFromLink(discussionLink) : null;
	const currentUser = useUserDetailsSelector();

	const success = (message: string) => {
		messageApi.open({
			content: message,
			duration: 10,
			type: 'success'
		});
	};
	const copyLink = (address: string) => {
		copyToClipboard(address);
	};

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		setShowAlert(false);
		const obj = localStorage.getItem('treasuryProposalData');
		obj && localStorage.setItem('treasuryProposalData', JSON.stringify({ ...JSON.parse(obj), step: 2 }));

		if (!proposerAddress || !api || !apiReady || !fundingAmount || fundingAmount.lte(ZERO_BN)) return;
		if (selectedTrack.length === 0) return;
		setLoading(true);

		const origin: any = { Origins: selectedTrack };
		setLoading(true);
		const tx = api.tx.referenda.submit(
			origin,
			{ Lookup: { hash: preimageHash, len: String(preimageLength) } },
			enactment.value ? (enactment.key === EEnactment.At_Block_No ? { At: enactment.value } : { After: enactment.value }) : { After: BN_HUNDRED }
		);
		(async () => {
			const info = await tx.paymentInfo(proposerAddress);
			setTxFee(new BN(info.partialFee.toString() || 0));
			setLoading(false);
			setShowAlert(true);
		})();
		const submissionDeposite = api.consts.referenda.submissionDeposit;
		setSubmissionDeposite(submissionDeposite);
		setLoading(false);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [proposerAddress, beneficiaryAddresses, fundingAmount, api, apiReady, network, selectedTrack, preimageHash, preimageLength, enactment.value, enactment.key]);

	const handleSaveTreasuryProposal = async (postId: number) => {
		const { data, error: apiError } = await nextApiClientFetch<CreatePostResponseType>('api/v1/auth/actions/createOpengovTreasuryProposal', {
			content,
			discussionId: discussionId || null,
			postId,
			proposerAddress,
			tags,
			title,
			userId
		});

		if (data && !isNaN(Number(data?.post_id)) && data.post_id !== undefined) {
			setPostId(data?.post_id);
			setOpenSuccess(true);
			console.log(postId, 'postId');
			localStorage.removeItem('treasuryProposalProposerAddress');
			localStorage.removeItem('treasuryProposalProposerWallet');
			localStorage.removeItem('treasuryProposalData');
			setOpenModal(false);
		} else if (apiError || !data?.post_id) {
			queueNotification({
				header: 'Error',
				message: apiError,
				status: NotificationStatus.ERROR
			});
			console.error(apiError);
		}
		setLoading(false);
	};

	const handleSubmitTreasuryProposal = async () => {
		// GAEvent for create preImage CTA clicked
		trackEvent('create_proposal_cta_clicked', 'created_proposal', {
			isWeb3Login: currentUser?.web3signup,
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});
		if (!api || !apiReady) return;
		const post_id = Number(await api.query.referenda.referendumCount());
		const origin: any = { Origins: selectedTrack };
		const proposerWallet = localStorage.getItem('treasuryProposalProposerWallet') || '';

		const injectedWindow = window as Window & InjectedWindow;
		const wallet = isWeb3Injected ? injectedWindow?.injectedWeb3?.[String(proposerWallet)] : null;

		if (!wallet) {
			return;
		}

		let injected: Injected | undefined;

		try {
			injected = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Wallet Timeout'));
				}, 60000); // wait 60 sec
				if (wallet && wallet.enable) {
					wallet
						.enable(APPNAME)
						.then((value) => {
							clearTimeout(timeoutId);
							resolve(value);
						})
						.catch((error) => {
							reject(error);
						});
				}
			});
		} catch (err) {
			console.log(err?.message);
		}
		if (!injected) {
			return;
		}
		api.setSigner(injected.signer);

		setLoading(true);
		try {
			const proposal = api.tx.referenda.submit(
				origin,
				{ Lookup: { hash: preimageHash, len: String(preimageLength) } },
				enactment.value ? (enactment.key === EEnactment.At_Block_No ? { At: enactment.value } : { After: enactment.value }) : { After: BN_HUNDRED }
			);

			const onSuccess = async () => {
				await handleSaveTreasuryProposal(post_id);
				setLoading(false);
			};

			const onFailed = async () => {
				queueNotification({
					header: 'Failed!',
					message: 'Transaction failed!',
					status: NotificationStatus.ERROR
				});

				setLoading(false);
			};
			setLoading(true);
			await executeTx({ address: proposerAddress, api, apiReady, errorMessageFallback: 'failed.', network, onFailed, onSuccess, tx: proposal });
		} catch (error) {
			setLoading(false);
			console.log(':( transaction failed');
			console.error('ERROR:', error);
			queueNotification({
				header: 'Failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
		}
	};

	return (
		<Spin
			spinning={loading}
			indicator={<LoadingOutlined />}
		>
			<div className={`create-proposal ${className}`}>
				{submitionDeposite.gte(availableBalance) && !txFee.eq(ZERO_BN) && (
					<Alert
						type='error'
						className={`mt-6 h-10 rounded-[4px] text-bodyBlue dark:border-[#5C3931] dark:bg-[#331701] dark:text-blue-dark-high ${poppins.variable} ${poppins.className}`}
						showIcon
						message={<span className='text-[13px] dark:text-blue-dark-high'>Insufficient available balance.</span>}
					/>
				)}
				<Alert
					message={<span className='text-[13px] dark:text-blue-dark-high'>Preimage {isPreimage ? 'linked' : 'created'} successfully</span>}
					className={`mt-4 rounded-[4px] text-sm text-bodyBlue dark:border-[#026630] dark:bg-[#063E20] dark:text-blue-dark-high ${poppins.variable} ${poppins.className}`}
					type='success'
					showIcon
				/>
				<div className='mt-4 text-sm font-normal text-lightBlue dark:text-blue-dark-medium'>
					<div className='mt-4 flex flex-col gap-2'>
						<span className='flex'>
							<span className='w-[150px]'>Proposer Address:</span>
							<Address
								addressClassName='text-bodyBlue text-sm dark:text-blue-dark-high'
								address={proposerAddress}
								iconSize={18}
								displayInline
								isTruncateUsername={false}
							/>
						</span>
						<span className='flex'>
							<span className='w-[150px]'>Beneficiary Address:</span>
							<div className='flex flex-col gap-2'>
								{beneficiaryAddresses.map((beneficiary, index) => (
									<Beneficiary
										beneficiary={beneficiary}
										key={index}
										disableBalanceFormatting
									/>
								))}
							</div>
						</span>
						<span className='flex'>
							<span className='w-[150px]'>Track:</span>
							<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
								{selectedTrack} <span className='ml-1 text-pink_primary'>#{networkTrackInfo[network][selectedTrack]?.trackId || 0}</span>
							</span>
						</span>
						<span className='flex'>
							<span className='w-[150px]'>Funding Amount:</span>
							<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
								{formatedBalance(fundingAmount.toString(), unit)} {unit}
							</span>
						</span>
						<span className='flex items-center'>
							<span className='w-[150px]'>Preimage Hash:</span>
							<span className='font-medium  text-bodyBlue dark:text-blue-dark-high'>{preimageHash.slice(0, 10) + '...' + preimageHash.slice(55)}</span>
							<span
								className='flex cursor-pointer items-center'
								onClick={(e) => {
									e.preventDefault();
									copyLink(preimageHash);
									success('Preimage hash copied to clipboard');
								}}
							>
								{contextHolder}
								<CopyIcon className='text-lightBlue dark:text-icon-dark-inactive' />
							</span>
						</span>
						<span className='flex'>
							<span className='w-[150px]'>Preimage Length:</span>
							<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>{preimageLength}</span>
						</span>
						<span className='flex items-center'>
							<span className='w-[150px]'>Preimage Link:</span>
							<a
								target='_blank'
								rel='noreferrer'
								href={`/preimages/${preimageHash}`}
								className='font-medium text-bodyBlue dark:text-blue-dark-high'
							>{`https://${network}.polkassembly.io/preimages/${preimageHash.slice(0, 5)}...`}</a>
							<span
								className='flex cursor-pointer items-center'
								onClick={(e) => {
									e.preventDefault();
									copyLink(`https://${network}.polkassembly.io/preimages/${preimageHash}`);
									success('Preimage link copied to clipboard.');
								}}
							>
								{contextHolder}
								<CopyIcon className='text-lightBlue dark:text-icon-dark-inactive' />
							</span>
						</span>
					</div>
				</div>
				{showAlert && (
					<Alert
						className='mt-6 rounded-[4px] text-bodyBlue dark:border-[#125798] dark:bg-[#05263F]'
						showIcon
						type='info'
						message={
							<span className='text-[13px] text-bodyBlue dark:text-blue-dark-high'>
								An amount of{' '}
								<span className='font-semibold'>
									{formatedBalance(String(txFee.add(submitionDeposite).toString()), unit)} {unit}
								</span>{' '}
								will be required to submit proposal.
							</span>
						}
						description={
							<div className='mt-[10px] flex flex-col gap-1'>
								<span className='flex justify-between pr-[70px] text-xs font-normal text-lightBlue dark:text-blue-900'>
									<span className='w-[150px] dark:text-blue-dark-high'>Deposit amount</span>
									<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
										{formatedBalance(String(submitionDeposite.toString()), unit)} {unit}
									</span>
								</span>
								<span className='flex justify-between pr-[70px] text-xs font-normal text-lightBlue dark:text-blue-dark-high'>
									<span className='w-[150px]'>Gas fees</span>
									<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
										{formatedBalance(String(txFee.toString()), unit)} {unit}
									</span>
								</span>
								<span className='flex justify-between pr-[70px] text-sm font-semibold text-lightBlue dark:text-blue-dark-high '>
									<span className='w-[150px]'>Total</span>
									<span className='text-bodyBlue dark:text-blue-dark-high'>
										{formatedBalance(String(txFee.add(submitionDeposite).toString()), unit)} {unit}
									</span>
								</span>
							</div>
						}
					/>
				)}
				<div className='-mx-6 mt-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-[#D2D8E0] px-6 pt-4 dark:border-[#3B444F]'>
					<Button
						disabled={txFee.eq(ZERO_BN) || loading || availableBalance.lte(submitionDeposite)}
						onClick={() => handleSubmitTreasuryProposal()}
						className={`h-[40px] w-[155px] rounded-[4px] bg-pink_primary text-sm font-medium tracking-[0.05em] text-white ${
							(txFee.eq(ZERO_BN) || loading || availableBalance.lte(submitionDeposite)) && 'opacity-50'
						}`}
					>
						Create Proposal
					</Button>
				</div>
			</div>
		</Spin>
	);
};
export default styled(CreateProposal)`
	.ant-alert-with-description {
		padding-block: 15px !important;
	}
	.ant-alert-with-description .ant-alert-icon {
		font-size: 18px !important;
		margin-top: 4px;
	}
`;
