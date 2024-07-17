// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Form, FormInstance, Input, Radio, Spin } from 'antd';
import BN from 'bn.js';
import React, { useCallback, useEffect, useState } from 'react';
import { EEnactment, IEnactment, IPreimage, ISteps } from '~src/components/OpenGovTreasuryProposal';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import DownArrow from '~assets/icons/down-icon.svg';
import { useCurrentBlock } from '~src/hooks';
import { BN_HUNDRED, BN_MAX_INTEGER, BN_ONE, isHex } from '@polkadot/util';
import { formatedBalance } from '~src/util/formatedBalance';
import { IAdvancedDetails } from '~src/components/OpenGovTreasuryProposal/CreatePreimage';
import { chainProperties } from '~src/global/networkConstants';
import { useInitialConnectAddress, useNetworkSelector } from '~src/redux/selectors';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import SelectTracks from '~src/components/OpenGovTreasuryProposal/SelectTracks';
import { inputToBn } from '~src/util/inputToBn';
import { useTheme } from 'next-themes';
import { HexString } from '@polkadot/util/types';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import dynamic from 'next/dynamic';
import { useApiContext } from '~src/context';
import { Injected, InjectedWindow } from '@polkadot/extension-inject/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { APPNAME } from '~src/global/appName';
import { CreatePostResponseType } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import queueNotification from '~src/ui-components/QueueNotification';
import { EAllowedCommentor, NotificationStatus } from '~src/types';
import executeTx from '~src/util/executeTx';
import { IPreimageData } from 'pages/api/v1/preimages/latest';
import _ from 'lodash';
import { ApiPromise } from '@polkadot/api';
import { blake2AsHex } from '@polkadot/util-crypto';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import Alert from '~src/basic-components/Alert';

const BalanceInput = dynamic(() => import('~src/ui-components/BalanceInput'), {
	ssr: false
});

interface Props {
	className?: string;
	setSteps: (pre: ISteps) => void;
	form: FormInstance;
	isPreimage: boolean | null;
	setIsPreimage: (pre: boolean) => void;
	enactment: IEnactment;
	setEnactment: (pre: IEnactment) => void;
	proposerAddress: string;
	selectedTrack: string;
	setSelectedTrack: (pre: string) => void;
	setPreimageHash: (pre: string) => void;
	setPostId: (pre: number) => void;
	setOpenModal: (pre: boolean) => void;
	setOpenSuccess: (pre: boolean) => void;
	allowedCommentors?: EAllowedCommentor;
	discussionLink?: string | null;
	bountyId: number | null;
	title: string;
	content: string;
	tags: string[];
	preimageHash: string;
	preimageLength: number | null;
	setPreimageLength: (pre: number | null) => void;
	bountyAmount: BN;
	setBountyAmount: (pre: BN) => void;
	postId?: number | null;
}

const ZERO_BN = new BN(0);
const EMPTY_HASH = blake2AsHex('');

const CreateReferendum = ({
	className,
	setSteps,
	form,
	isPreimage,
	setIsPreimage,
	enactment,
	setOpenModal,
	setOpenSuccess,
	setEnactment,
	selectedTrack,
	setSelectedTrack,
	setPostId,
	proposerAddress,
	preimageHash,
	preimageLength,
	allowedCommentors,
	title,
	content,
	setPreimageHash,
	bountyAmount,
	setPreimageLength,
	bountyId
}: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const currentBlock = useCurrentBlock();
	const { address: linkedAddress, availableBalance } = useInitialConnectAddress();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [openAdvanced, setOpenAdvanced] = useState<boolean>(false);
	const [advancedDetails, setAdvancedDetails] = useState<IAdvancedDetails>({ afterNoOfBlocks: BN_HUNDRED, atBlockNo: BN_ONE });
	const [gasFee, setGasFee] = useState(ZERO_BN);
	const { resolvedTheme: theme } = useTheme();
	const [loading, setLoading] = useState<boolean>(false);
	const [newBountyAmount, setNewBountyAmount] = useState(bountyAmount);
	const [error, setError] = useState('');
	const baseDeposit = new BN(chainProperties[network]?.preImageBaseDeposit || 0);
	const [eligibleToCreateRef, setEligibleToCreateRef] = useState<boolean>(false);

	const trackArr: string[] = [];
	const maxSpendArr: { track: string; maxSpend: number }[] = [];

	if (network) {
		Object.entries(networkTrackInfo?.[network]).forEach(([key, value]) => {
			if (value.group === 'Treasury') {
				trackArr.push(key);
				if (value?.maxSpend === -1) {
					maxSpendArr.push({ maxSpend: Number(BN_MAX_INTEGER.toString()), track: key });
				} else {
					maxSpendArr.push({ maxSpend: value?.maxSpend, track: key });
				}
			}
		});
	}
	maxSpendArr.sort((a, b) => a.maxSpend - b.maxSpend);

	const handleSelectTrack = (fundingAmount: BN) => {
		let selectedTrack = '';

		for (const i in maxSpendArr) {
			const [maxSpend] = inputToBn(String(maxSpendArr[i].maxSpend), network, false);
			if (maxSpend.gte(fundingAmount)) {
				selectedTrack = maxSpendArr[i].track;
				setSelectedTrack(maxSpendArr[i].track);
				break;
			}
		}

		return selectedTrack;
	};

	const handleAdvanceDetailsChange = (key: EEnactment, value: string) => {
		if (!value || value.includes('-')) return;
		try {
			const bnValue = new BN(value || '0');
			if (!bnValue) return;
			switch (key) {
				case EEnactment.At_Block_No:
					setAdvancedDetails({ afterNoOfBlocks: null, atBlockNo: bnValue });
					break;
				case EEnactment.After_No_Of_Blocks:
					setAdvancedDetails({ afterNoOfBlocks: bnValue, atBlockNo: null });
					break;
			}
			setEnactment({ ...enactment, value: bnValue });
		} catch (error) {
			console.log(error);
		}
	};
	const handleSaveTreasuryProposal = async (postId: number) => {
		const { data, error: apiError } = await nextApiClientFetch<CreatePostResponseType>('api/v1/auth/actions/saveBountyProposalInfo', {
			allowedCommentors: [allowedCommentors] || [EAllowedCommentor.ALL],
			bountyId,
			content,
			postId,
			proposerAddress,
			title
		});

		if (apiError || !data?.post_id) {
			queueNotification({
				header: 'Error',
				message: apiError,
				status: NotificationStatus.ERROR
			});
			console.error(apiError);
		}

		setLoading(false);
	};

	const handleSubmitCreateReferendum = async () => {
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
				}, 60000);
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
				setPostId(post_id);
				setLoading(false);
				setOpenModal(false);
				setOpenSuccess(true);
				localStorage.removeItem('treasuryProposalProposerAddress');
				localStorage.removeItem('treasuryProposalProposerWallet');
				localStorage.removeItem('treasuryProposalData');
			};

			const onFailed = async () => {
				setLoading(false);
				queueNotification({
					header: 'Failed!',
					message: 'Transaction failed!',
					status: NotificationStatus.ERROR
				});
			};
			await executeTx({ address: proposerAddress, api, apiReady, errorMessageFallback: 'failed.', network, onFailed, onSuccess, tx: proposal });
			setLoading(false);
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

	const getState = (api: ApiPromise, proposal: SubmittableExtrinsic<'promise'>): IPreimage => {
		let preimageHash = EMPTY_HASH;
		let encodedProposal: HexString | null = null;
		let preimageLength = 0;
		let notePreimageTx: SubmittableExtrinsic<'promise'> | null = null;
		let storageFee = ZERO_BN;

		encodedProposal = proposal?.method.toHex();
		preimageLength = Math.ceil((encodedProposal?.length - 2) / 2);
		preimageHash = blake2AsHex(encodedProposal);
		notePreimageTx = api.tx.preimage.notePreimage(encodedProposal);

		// we currently don't have a constant exposed, however match to Substrate
		storageFee = ((api?.consts?.preimage?.baseDeposit || ZERO_BN) as unknown as BN).add(((api.consts.preimage?.byteDeposit || ZERO_BN) as unknown as BN).muln(preimageLength));
		setPreimageHash(preimageHash);
		setPreimageLength(preimageLength);

		return {
			encodedProposal,
			notePreimageTx,
			preimageHash,
			preimageLength,
			storageFee
		};
	};

	const existPreimageData = async (preimageHash: string) => {
		setPreimageLength(0);
		form.setFieldValue('preimage_length', 0);
		if (!api || !apiReady || !isHex(preimageHash, 256) || preimageHash?.length < 0) return;
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IPreimageData>(`api/v1/preimages/latest?hash=${preimageHash}`);

		if (data && !data?.message) {
			if (data.section === 'Bounties' && data?.method === 'approve_bounty' && !isNaN(data.proposedCall?.args?.bountyId) && !isNaN(data?.length)) {
				form.setFieldValue('preimage_length', data?.length);

				setPreimageLength(data?.length);
				form.setFieldValue('preimage_length', data?.length);

				setSteps({ percent: 100, step: 2 });
			} else {
				setPreimageLength(0);
				form.setFieldValue('preimage_length', 0);

				queueNotification({
					header: 'Incorrect Preimage Added!',
					message: 'Please enter a preimage for a treasury related track.',
					status: NotificationStatus.ERROR
				});
			}
		} else if (error || data?.message) {
			console.log('fetching data from polkadotjs');
		}
		setLoading(false);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debounceExistPreimageFn = useCallback(_.debounce(existPreimageData, 2000), []);

	const handlePreimageHash = (preimageHash: string) => {
		setPreimageLength(0);
		if (!preimageHash || preimageHash.length === 0) return;
		setSteps({ percent: 60, step: 2 });
		debounceExistPreimageFn(preimageHash);
		setPreimageHash(preimageHash);
	};

	useEffect(() => {
		setIsPreimage(false);
		form.setFieldsValue({
			bounty_amount: Number(formatedBalance(bountyAmount.toString(), unit).replaceAll(',', ''))
		});
		handleSelectTrack(bountyAmount);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bountyAmount]);

	const onValueChange = (balance: BN) => setNewBountyAmount(balance);

	useEffect(() => {
		const calculateGasFee = async () => {
			if (!proposerAddress || !api || !apiReady || !bountyAmount || !bountyId) return;
			const submissionDeposit = api?.consts?.referenda?.submissionDeposit || ZERO_BN;

			const availableBalanceBN = new BN(availableBalance || '0');

			const txns = [];

			if (!isPreimage) {
				const preimage = getState(api, api.tx.bounties.approveBounty(bountyId));

				if (!preimage.notePreimageTx) {
					setError('Error in creating preimage');
					return;
				}
				txns.push(preimage.notePreimageTx);
			}

			const origin: any = { Origins: selectedTrack };
			const proposalTx = api.tx.referenda.submit(
				origin,
				{ Lookup: { hash: preimageHash, len: preimageLength } },
				enactment.value ? (enactment.key === EEnactment.At_Block_No ? { At: enactment.value } : { After: enactment.value }) : { After: BN_HUNDRED }
			);
			txns.push(proposalTx);

			const mainTx = txns.length > 1 ? api.tx.utility.batchAll(txns) : proposalTx;
			const { partialFee: bountyTxGasFee } = (await mainTx.paymentInfo(linkedAddress || proposerAddress)).toJSON();

			setGasFee(new BN(String(bountyTxGasFee)));

			const totalRequired = new BN(gasFee).add(baseDeposit).add(submissionDeposit);

			if (availableBalanceBN.gt(totalRequired)) {
				setEligibleToCreateRef(true);
			} else {
				setEligibleToCreateRef(false);
			}
		};

		calculateGasFee();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, proposerAddress, bountyAmount, bountyId, isPreimage, preimageHash, preimageLength, selectedTrack, enactment]);

	const handleSubmit = async () => {
		if (!proposerAddress || !api || !apiReady || !bountyAmount || !bountyId) return;

		const txns = [];

		if (isPreimage && !preimageLength) {
			setError('Your Preimage length is not valid');
			return;
		}

		if (!isPreimage) {
			const preimage = getState(api, api.tx.bounties.approveBounty(bountyId));

			if (!preimage.notePreimageTx) {
				setError('Error in creating preimage');
				return;
			}
			txns.push(preimage.notePreimageTx);
		}

		const origin: any = { Origins: selectedTrack };
		const proposalTx = api.tx.referenda.submit(
			origin,
			{ Lookup: { hash: preimageHash, len: preimageLength } },
			enactment.value ? (enactment.key === EEnactment.At_Block_No ? { At: enactment.value } : { After: enactment.value }) : { After: BN_HUNDRED }
		);
		txns.push(proposalTx);

		const mainTx = txns.length > 1 ? api.tx.utility.batchAll(txns) : proposalTx;

		const onFailed = (message: string) => {
			setLoading(false);
			queueNotification({
				header: 'Failed!',
				message,
				status: NotificationStatus.ERROR
			});
		};

		const onSuccess = async () => {
			setLoading(false);
			queueNotification({
				header: 'Success!',
				message: 'Proposal created successfully.',
				status: NotificationStatus.SUCCESS
			});
			setOpenModal(false);
			setOpenSuccess(true);
			setSteps({ percent: 0, step: 2 });
		};

		await executeTx({
			address: linkedAddress || proposerAddress,
			api,
			apiReady,
			errorMessageFallback: 'Transaction failed.',
			network,
			onBroadcast: () => setLoading(true),
			onFailed,
			onSuccess,
			tx: mainTx
		});
	};

	return (
		<div className={`${className} create-referendum`}>
			<Spin spinning={loading}>
				{error && (
					<ErrorAlert
						className='my-2'
						errorMsg={error}
					/>
				)}
				<div className='my-8 flex flex-col'>
					<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Do you have an existing preimage? </label>
					<Radio.Group
						onChange={(e) => {
							setIsPreimage(e.target.value);
							setSteps({ percent: 20, step: 2 });
						}}
						size='small'
						className='mt-1.5'
						value={isPreimage}
						defaultValue={false}
					>
						<Radio
							value={true}
							className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'
						>
							Yes
						</Radio>
						<Radio
							value={false}
							className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'
						>
							No
						</Radio>
					</Radio.Group>
				</div>
				<Form
					form={form}
					disabled={loading}
					onFinish={handleSubmit}
					initialValues={{
						after_blocks: String(advancedDetails.afterNoOfBlocks?.toString()),
						at_block: String(advancedDetails.atBlockNo?.toString()),
						preimage_hash: preimageHash,
						preimage_length: preimageLength || 0
					}}
					validateMessages={{ required: "Please add the '${name}' " }}
				>
					{isPreimage && (
						<>
							<div className='preimage mt-6'>
								<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>
									Preimage Hash{' '}
									<span>
										<HelperTooltip
											text='A unique hash is generate for your preimage and it is used to populate proposal details.'
											className='ml-1'
										/>
									</span>
								</label>
								<Form.Item name='preimage_hash'>
									<Input
										name='preimage_hash'
										className='h-10 rounded-[4px] dark:border-section-dark-container dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
										value={preimageHash}
										onChange={(e) => handlePreimageHash(e.target.value)}
									/>
								</Form.Item>
							</div>
							<div className='mt-6'>
								<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Preimage Length</label>
								<Form.Item name='preimage_length'>
									<Input
										name='preimage_length'
										value={preimageLength?.toString()}
										className='h-10 rounded-[4px] dark:border-section-dark-container dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
										disabled
									/>
								</Form.Item>
							</div>
						</>
					)}
					{!isPreimage && (
						<>
							<div className='-mb-6 mt-6'>
								<div>
									<BalanceInput
										theme={theme}
										balance={newBountyAmount || bountyAmount}
										formItemName='bounty_amount'
										placeholder='Enter Bounty Amount'
										label='Bounty Amount'
										inputClassName='dark:text-blue-dark-high text-bodyBlue'
										className='mb-0'
										noRules
										disabled
										onChange={onValueChange}
									/>
								</div>
							</div>
							<div className='mt-6'>
								<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>
									Select Track{' '}
									<span>
										<HelperTooltip
											text='Track selection is done based on the amount requested.'
											className='ml-1'
										/>
									</span>
								</label>
								<SelectTracks
									tracksArr={trackArr}
									onTrackChange={(track) => {
										setSelectedTrack(track);
										setSteps({ percent: 100, step: 2 });
									}}
									selectedTrack={selectedTrack}
								/>
							</div>
						</>
					)}
					{isPreimage !== null && (
						<div
							className='mt-6 flex cursor-pointer items-center gap-2'
							onClick={() => setOpenAdvanced(!openAdvanced)}
						>
							<span className='text-sm font-medium text-pink_primary'>Advanced Details</span>
							<DownArrow className='down-icon' />
						</div>
					)}
					{openAdvanced && (
						<div className='preimage mt-3 flex flex-col'>
							<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>
								Enactment{' '}
								<span>
									<HelperTooltip
										text='A custom delay can be set for enactment of approved proposals.'
										className='ml-1'
									/>
								</span>
							</label>
							<Radio.Group
								className='enactment mt-1 flex flex-col gap-2'
								value={enactment.key}
								onChange={(e) => {
									setEnactment({ ...enactment, key: e.target.value });
								}}
							>
								<Radio
									value={EEnactment.At_Block_No}
									className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'
								>
									<div className='flex h-10 items-center gap-4'>
										<span>
											At Block no.
											<HelperTooltip
												className='ml-1'
												text='Allows you to choose a custom block number for enactment.'
											/>
										</span>
										<span>
											{enactment.key === EEnactment.At_Block_No && (
												<Form.Item
													name='at_block'
													rules={[
														{
															message: 'Invalid Block no.',
															validator(rule, value, callback) {
																const bnValue = new BN(Number(value) >= 0 ? value : '0') || ZERO_BN;

																if (callback && value?.length > 0 && ((currentBlock && bnValue?.lt(currentBlock)) || (value?.length && Number(value) <= 0))) {
																	callback(rule.message?.toString());
																} else {
																	callback();
																}
															}
														}
													]}
												>
													<Input
														name='at_block'
														value={String(advancedDetails.atBlockNo?.toString())}
														className='w-[100px] rounded-[4px] dark:border-section-dark-container dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
														onChange={(e) => handleAdvanceDetailsChange(EEnactment.At_Block_No, e.target.value)}
													/>
												</Form.Item>
											)}
										</span>
									</div>
								</Radio>
								<Radio
									value={EEnactment.After_No_Of_Blocks}
									className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'
								>
									<div className='flex h-[30px] items-center gap-2'>
										<span className='w-[150px]'>
											After no. of Blocks
											<HelperTooltip
												text='Allows you to choose a custom delay in terms of blocks for enactment.'
												className='ml-1'
											/>
										</span>
										<span>
											{enactment.key === EEnactment.After_No_Of_Blocks && (
												<Form.Item
													name='after_blocks'
													rules={[
														{
															message: 'Invalid no. of Blocks',
															validator(rule, value, callback) {
																const bnValue = new BN(Number(value) >= 0 ? value : '0') || ZERO_BN;
																if (callback && value?.length > 0 && (bnValue?.lt(BN_ONE) || (value?.length && Number(value) <= 0))) {
																	callback(rule.message?.toString());
																} else {
																	callback();
																}
															}
														}
													]}
												>
													<Input
														name='after_blocks'
														className='w-[100px] rounded-[4px] dark:border-section-dark-container dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
														onChange={(e) => handleAdvanceDetailsChange(EEnactment.At_Block_No, e.target.value)}
													/>
												</Form.Item>
											)}
										</span>
									</div>
								</Radio>
							</Radio.Group>
						</div>
					)}
					{gasFee && gasFee != ZERO_BN && (
						<Alert
							type='info'
							className='mt-6 rounded-[4px] text-bodyBlue '
							showIcon
							description={
								<span className='text-xs dark:text-blue-dark-high'>
									Gas Fees of {formatedBalance(String(gasFee.toString()), unit)} {unit} will be applied to create preimage.
								</span>
							}
							message='Gas Fee'
						/>
					)}
					<div className='-mx-6 mt-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-section-dark-container'>
						<Button
							onClick={() => {
								setSteps({ percent: 100, step: 1 });
							}}
							className='h-10 w-[155px] rounded-[4px] border-pink_primary text-sm font-medium tracking-[0.05em] text-pink_primary dark:bg-transparent'
						>
							Back
						</Button>
						<Button
							htmlType='submit'
							className={`h-10 w-min ${
								!eligibleToCreateRef ? 'opacity-50' : ''
							} rounded-[4px] bg-pink_primary text-center text-sm font-medium tracking-[0.05em] text-white dark:border-pink_primary `}
							onClick={() => handleSubmitCreateReferendum()}
							disabled={loading || !eligibleToCreateRef}
						>
							Create Referendum
						</Button>
					</div>
				</Form>
			</Spin>
		</div>
	);
};

export default CreateReferendum;
