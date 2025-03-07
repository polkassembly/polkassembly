// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, Radio } from 'antd';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import Input from '~src/basic-components/Input';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import SelectTracks from '../OpenGovTreasuryProposal/SelectTracks';
import { useAddCuratorSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { addCuratorActions } from '~src/redux/AddCurator';
import { useApiContext, usePostDataContext } from '~src/context';
import { BN_HUNDRED, BN_MAX_INTEGER, BN_ONE } from '@polkadot/util';
import queueNotification from '~src/ui-components/QueueNotification';
import { EAllowedCommentor, NotificationStatus } from '~src/types';
import { chainProperties } from 'src/global/networkConstants';
import AddressInput from '~src/ui-components/AddressInput';
import getEncodedAddress from '~src/util/getEncodedAddress';
import BN from 'bn.js';
import Balance from '../Balance';
import Address from '~src/ui-components/Address';
import BalanceInput from '~src/ui-components/BalanceInput';
import { useTheme } from 'next-themes';
import { inputToBn } from '~src/util/inputToBn';
import { parseBalance } from '../Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { EEnactment } from '../OpenGovTreasuryProposal';
import { useCurrentBlock } from '~src/hooks';
import DownArrow from '~assets/icons/down-icon.svg';
import executeTx from '~src/util/executeTx';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ApiPromise } from '@polkadot/api';
import { blake2AsHex } from '@polkadot/util-crypto';
import { HexString } from '@polkadot/util/types';
import { useRouter } from 'next/router';
import PreimageAlreadyExists from './PreimageAlreadyExists';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { CreatePostResponseType } from '~src/auth/types';

interface IParams {
	className?: string;
	pressBack: () => void;
}
const ZERO_BN = new BN(0);
const EMPTY_HASH = blake2AsHex('');

const getAllTrack = (network: string, requestedAmt: string) => {
	if (!network) return { maxSpendArr: [], trackArr: [] };

	const trackArr: string[] = [];
	const maxSpendArr: { track: string; maxSpend: number }[] = [];
	let selectedTrack = null;

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

	const sortedMaxSpendArr = maxSpendArr?.sort((a, b) => a.maxSpend - b.maxSpend);

	for (const i in sortedMaxSpendArr) {
		const [maxSpend] = inputToBn(String(sortedMaxSpendArr[i].maxSpend), network, false);

		if (maxSpend.gte(new BN(requestedAmt))) {
			selectedTrack = sortedMaxSpendArr[i].track;
			break;
		}
	}
	return { selectedTrack, trackArr };
};

const handleErrorMsg = ({
	curatorAddress,
	curatorFee,
	network,
	rewardAmt,
	isPreimage,
	hash,
	length
}: {
	curatorAddress: string | null;
	curatorFee: string;
	rewardAmt: string;
	network: string;
	isPreimage: boolean;
	hash: string;
	length: number;
}) => {
	if (isPreimage) {
		if (!hash) {
			return 'Preimage is required!';
		}
		if (!length) {
			return 'Invalid Preimage length!';
		}
	} else {
		if (!curatorAddress || !getEncodedAddress(curatorAddress, network)) {
			return 'Curator Address is required!';
		}
		if (new BN(curatorFee).gt(new BN(rewardAmt || '0'))) {
			return 'Curator fee should be less than max bounty amount!';
		}
	}

	return '';
};

const CreatePreimage = ({ className, pressBack }: IParams) => {
	const dispatch = useDispatch();
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const currentBlock = useCurrentBlock();
	const { id: userId } = useUserDetailsSelector();
	const {
		postData: { reward, postIndex }
	} = usePostDataContext();
	const { preimage, proposer, curatorFee, curatorAddress, track, enactment, allowedCommentors, proposal, bountyIndex } = useAddCuratorSelector();
	const [form] = Form.useForm();
	const [isPreimage, setIsPreimage] = useState(null);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [loading, setLoading] = useState<boolean>(false);
	const [openAdvanced, setOpenAdvanced] = useState<boolean>(false);
	const { trackArr } = useMemo(() => {
		const { selectedTrack, trackArr } = getAllTrack(network, reward || '0');

		dispatch(addCuratorActions.updateTrack(selectedTrack || null));

		return { trackArr };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const fundingAmtToBN = (amount: string) => {
		const fundingAmount = new BN(amount || '0').div(new BN('10').pow(new BN(chainProperties[network].tokenDecimals)));
		return fundingAmount;
	};

	const getState = (api: ApiPromise, proposal: SubmittableExtrinsic<'promise'>) => {
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

		return {
			encodedProposal,
			notePreimageTx,
			preimageHash,
			preimageLength,
			storageFee
		};
	};

	const handleSaveTreasuryProposal = async (postId: number) => {
		const { data, error: apiError } = await nextApiClientFetch<CreatePostResponseType>('api/v1/auth/actions/createTreasuryProposal', {
			allowedCommentors: allowedCommentors ? [allowedCommentors] : [EAllowedCommentor.ALL],
			bountyId: bountyIndex || null,
			content: proposal?.content,
			postId,
			proposerAddress: proposer,
			tags: proposal?.tags || [],
			title: proposal?.title,
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

		setLoading(false);
	};

	const createProposal = async ({ preimageHash, onFailed, preimageLength }: { preimageHash: string; preimageLength: number; onFailed: (error: string) => void }) => {
		if (!api || !apiReady) return;
		const origin: any = { Origins: track };

		const postId = Number(await api.query.referenda.referendumCount());

		const onSuccess = async () => {
			dispatch(addCuratorActions.updateBountyProposalIndex(postId));

			queueNotification({
				header: 'Success!',
				message: 'Add Curator Proposal Created Successfully',
				status: NotificationStatus.SUCCESS
			});
			await handleSaveTreasuryProposal(postId);

			router.replace(`/referenda/${postId}`);
			dispatch(addCuratorActions.resetAddCurator());
		};

		const proposalTx = api.tx.referenda.submit(
			origin,
			{ Lookup: { hash: preimageHash, len: String(preimageLength) } },
			enactment.value ? (enactment.key === EEnactment.At_Block_No ? { At: enactment.value } : { After: enactment.value }) : { After: BN_HUNDRED }
		);

		await executeTx({
			address: proposer,
			api,
			apiReady,
			errorMessageFallback: 'failed.',
			network,
			onFailed: (error: string) => onFailed(error),
			onSuccess,
			tx: proposalTx
		});
	};

	const handleSubmit = async () => {
		if (!api || !apiReady || isPreimage === null) return;
		const errorMsg = handleErrorMsg({
			curatorAddress: curatorAddress,
			curatorFee,
			hash: preimage.hash,
			isPreimage: Boolean(isPreimage),
			length: preimage.length,
			network,
			rewardAmt: reward || '0'
		});

		if (errorMsg) {
			queueNotification({
				header: 'Error!',
				message: errorMsg,
				status: NotificationStatus.ERROR
			});
		} else {
			const onFailed = (error: string) => {
				queueNotification({
					header: 'failed!',
					message: error || 'Transaction failed!',
					status: NotificationStatus.ERROR
				});
				setLoading(false);
			};

			if (isPreimage) {
				await createProposal({ onFailed, preimageHash: preimage.hash, preimageLength: preimage.length });
			} else {
				const proposal = api?.tx.bounties.proposeCurator(postIndex, getEncodedAddress(curatorAddress, network) || curatorAddress || '', curatorFee);
				const preimageDetails = getState(api, proposal);

				const onSuccess = async () => {
					dispatch(addCuratorActions.updateAlreadyPreimage(false));
					dispatch(addCuratorActions.updateCuratorPreimage({ hash: preimageDetails.preimageHash, length: preimageDetails.preimageLength }));

					await createProposal({ onFailed, preimageHash: preimageDetails?.preimageHash, preimageLength: preimageDetails.preimageLength });
				};

				await executeTx({
					address: proposer,
					api,
					apiReady,
					errorMessageFallback: 'Error in creating preimage',
					network,
					onFailed: onFailed,
					onSuccess: onSuccess,
					tx: preimageDetails?.notePreimageTx
				});
			}
		}
	};

	return (
		<div className={classNames(className)}>
			<div className='mt-6 flex flex-col'>
				<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Do you have an existing preimage? </label>
				<Radio.Group
					size='small'
					className='mt-1.5'
					value={isPreimage}
					onChange={(e) => {
						setIsPreimage(e.target.value);
						dispatch(addCuratorActions.updateCuratorPreimage({ hash: '', length: 0 }));
						dispatch(addCuratorActions.updateAlreadyPreimage(e.target.value));
					}}
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

				<Form
					form={form}
					disabled={loading}
					onFinish={handleSubmit}
					initialValues={{
						afterBlock: BN_HUNDRED?.toString(),
						atBlock: currentBlock?.toString(),
						bountyAmount: fundingAmtToBN(reward || '0'),
						curatorAddress: curatorAddress,
						proposerAddress: proposer
					}}
					validateMessages={{ required: "Please add the '${name}' " }}
				>
					<>
						{isPreimage && <PreimageAlreadyExists trackArr={trackArr} />}

						{isPreimage !== null && !isPreimage && (
							<>
								<section className='mt-6'>
									<div className='flex items-center justify-between text-lightBlue dark:text-blue-dark-medium '>
										Proposer Address
										<span>
											<Balance
												address={proposer}
												onChange={(balance: string) => setAvailableBalance(new BN(balance || '0'))}
											/>
										</span>
									</div>

									<div className='flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
										<Address
											address={proposer || ''}
											isTruncateUsername={false}
											displayInline
											usernameClassName='text-sm font-medium ml-1'
										/>
									</div>
								</section>
								<section>
									<div className='mt-6 flex items-center justify-between text-lightBlue dark:text-blue-dark-medium '>Curator Address</div>
									<AddressInput
										name='curatorAddress'
										defaultAddress={getEncodedAddress(curatorAddress, network) || ''}
										onChange={(address: string) => dispatch(addCuratorActions.updateCuratorAddress(address))}
										inputClassName={' font-normal text-sm h-10'}
										className='-mt-6 text-sm font-normal text-lightBlue dark:text-blue-dark-medium'
										size='large'
										identiconSize={22}
										iconClassName={'ml-[10px]'}
									/>
								</section>

								<section>
									<div className='-mb-6 mt-6'>
										<div className='mb-[2px] flex items-center justify-between text-sm text-lightBlue dark:text-blue-dark-medium'>
											<label>
												Curator Fee
												<span>
													<HelperTooltip
														text='Amount requested in bounty'
														className='ml-1'
													/>
												</span>
											</label>
											<div className='flex gap-2'>
												<span className='text-xs'>Max </span>
												<span className='text-xs text-pink_primary dark:text-[#FF4098]'>{parseBalance(reward || '0', 2, true, network)}</span>
											</div>
										</div>
										<BalanceInput
											address={proposer}
											placeholder='Add funding amount'
											formItemName='curatorFee'
											theme={theme}
											balance={fundingAmtToBN(curatorFee)}
											onChange={(balance: BN) => dispatch(addCuratorActions.updateCuratorFee(balance?.toString()))}
										/>
									</div>
								</section>

								<section>
									<div className='-mb-6 mt-6'>
										<div className='mb-[2px] flex items-center justify-between text-sm text-lightBlue dark:text-blue-dark-medium'>
											<label>
												Bounty Amount{' '}
												<span>
													<HelperTooltip
														text='Amount requested in bounty'
														className='ml-1'
													/>
												</span>
											</label>
										</div>
										<BalanceInput
											address={proposer}
											placeholder='Add funding amount'
											formItemName='bountyAmount'
											theme={theme}
											balance={fundingAmtToBN(reward || '0')}
											disabled={true}
										/>
									</div>
								</section>

								<section className=' mt-6'>
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
										onTrackChange={(trackName: string) => {
											dispatch(addCuratorActions.updateTrack(trackName));
										}}
										selectedTrack={track as string}
									/>
								</section>
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

						{isPreimage !== null && (
							<div>
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
												dispatch(addCuratorActions.updateEnactment({ key: e.target.value, value: null }));
											}}
										>
											<Radio
												value={EEnactment.At_Block_No}
												className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'
											>
												<div className='flex h-10 items-center gap-x-4'>
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
																	name='atBlock'
																	value={enactment.value || currentBlock?.toString()}
																	className='-mb-6 w-[100px] rounded-[4px] dark:border-section-dark-container dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
																	onChange={(e) => dispatch(addCuratorActions.updateEnactment({ key: EEnactment.At_Block_No, value: e.target?.value }))}
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
																name='afterBlocks'
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
																	className='-mb-6 w-[100px] rounded-[4px] dark:border-section-dark-container dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
																	onChange={(e) => dispatch(addCuratorActions.updateEnactment({ key: EEnactment.After_No_Of_Blocks, value: e.target?.value }))}
																/>
															</Form.Item>
														)}
													</span>
												</div>
											</Radio>
										</Radio.Group>
									</div>
								)}
							</div>
						)}
						<div className='-mx-6 mt-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-0 pt-4 dark:border-section-dark-container'>
							<CustomButton
								text='Back'
								variant='default'
								onClick={() => pressBack()}
								width={155}
							/>
							<CustomButton
								htmlType='submit'
								text={isPreimage ? 'Create Referendum' : 'Add curator & Create Referendum'}
								variant='primary'
							/>
						</div>
					</>
				</Form>
			</div>
		</div>
	);
};

export default CreatePreimage;
