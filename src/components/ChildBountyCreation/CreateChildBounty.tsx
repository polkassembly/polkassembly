// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useCallback, useEffect, useState } from 'react';
import { Form, Spin, Tag } from 'antd';
import BN from 'bn.js';
import { useTheme } from 'next-themes';
import { useDispatch } from 'react-redux';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Input from '~src/basic-components/Input';
import { childBountyCreationActions } from '~src/redux/childBountyCreation';
import { useChildBountyCreationSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import AddressInput from '~src/ui-components/AddressInput';
import BalanceInput from '~src/ui-components/BalanceInput';
import { EChildBountySteps } from './types';
import { useApiContext } from '~src/context';
import getEncodedAddress from '~src/util/getEncodedAddress';
import queueNotification from '~src/ui-components/QueueNotification';
import { EAllowedCommentor, ILoading, NotificationStatus } from '~src/types';
import executeTx from '~src/util/executeTx';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import getBountiesCustomStatuses from '~src/util/getBountiesCustomStatuses';
import { EBountiesStatuses } from '../Bounties/BountiesListing/types/types';
import _ from 'lodash';
import Alert from '~src/basic-components/Alert';
import classNames from 'classnames';
import Address from '~src/ui-components/Address';
import Balance from '../Balance';
import { parseBalance } from '../Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { CreatePostResponseType } from '~src/auth/types';

const ZERO_BN = new BN(0);

interface Props {
	className?: string;
	setStep: (pre: EChildBountySteps) => void;
	setOpenSuccessModal: (pre: boolean) => void;
	setCloseModal: () => void;
	multisigData: { signatories: string[]; threshold: number };
}

const CreateChildBounty = ({ setStep, setCloseModal, setOpenSuccessModal, multisigData }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const { loginAddress, multisigAssociatedAddress } = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const dispatch = useDispatch();
	const { api, apiReady } = useApiContext();
	const { parentBountyIndex, reqAmount, curator, curatorFee, title, content, categories, allowedCommentors, link, proposer } = useChildBountyCreationSelector();
	const [isValidBounty, setIsValidBounty] = useState<boolean | null>(null);
	const [loadingStatus, setLoadingStatus] = useState<ILoading>({ isLoading: false, message: '' });
	const [form] = Form.useForm();
	const [gasFee, setGasFee] = useState<BN>(ZERO_BN);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);

	const checkIsBountyActiveAndValid = async (index: number | null) => {
		if ((isNaN(index || 0) || !index) && index !== 0) {
			setIsValidBounty(false);
			return;
		}

		setLoadingStatus({ isLoading: true, message: '' });

		const { data, error } = await nextApiClientFetch<{ status: string }>('/api/v1/bounty/getBountyInfoFromIndex', {
			bountyIndex: index
		});

		if (data?.status) {
			const activeBountyStatuses = getBountiesCustomStatuses(EBountiesStatuses.ACTIVE);
			const isActive = activeBountyStatuses.includes(data?.status);
			setIsValidBounty(!!isActive);
			dispatch(childBountyCreationActions.updateSecondStepPercentage(!isActive || new BN(reqAmount).eq(ZERO_BN) ? 83.33 : 100));
		}
		if (error) {
			console.log(error);
			setIsValidBounty(false);
		}

		setLoadingStatus({ isLoading: false, message: '' });
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debounceCheckIsBountyActiveAndValid = useCallback(_.debounce(checkIsBountyActiveAndValid, 1000), []);

	const handleAvailableBalanceChange = (balanceStr: string) => {
		let balance = ZERO_BN;

		try {
			balance = new BN(balanceStr);
		} catch (err) {
			console.log(err);
		}
		setAvailableBalance(balance);
	};

	const handleParentBountyChange = (index: number) => {
		debounceCheckIsBountyActiveAndValid(index);
		dispatch(childBountyCreationActions.setParentBountyIndex(Number(index)));
	};

	const getOnChainTx = async () => {
		if (!api || !apiReady || parentBountyIndex == null || isNaN(parentBountyIndex)) return null;
		const description = 'PA';
		const childbountyIndex = Number(await api?.query?.childBounties?.childBountyCount());

		const childBountyTx = api?.tx?.childBounties?.addChildBounty(parentBountyIndex, reqAmount.toString(), description);
		let curatorTx = null;
		if (!!curator?.length && getEncodedAddress(curator, network)) {
			curatorTx = api?.tx?.childBounties?.proposeCurator(parentBountyIndex, childbountyIndex, curator, curatorFee);
		}
		let tx = curatorTx ? api?.tx?.utility?.batchAll([childBountyTx, curatorTx]) : childBountyTx;

		if (multisigData?.threshold > 0) {
			tx = api?.tx?.multisig?.asMulti(multisigData?.threshold, multisigData?.signatories?.map((item) => item), null, tx, {
				proofSize: null,
				refTime: null
			});
		}

		return { childbountyIndex: childbountyIndex || null, tx: tx || null };
	};

	const getGasFee = async () => {
		if (!multisigAssociatedAddress && !loginAddress) return;
		const txDetails = await getOnChainTx();

		const tx = txDetails?.tx;

		const paymentInfo = await tx?.paymentInfo(multisigAssociatedAddress || loginAddress);
		setGasFee(new BN(paymentInfo?.partialFee?.toString() || '0'));
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debounceGetGasFee = useCallback(_.debounce(getGasFee, 1000), []);

	const handleCreateBounty = async (index: number | null) => {
		if (index == null) return;
		setLoadingStatus({ isLoading: true, message: '' });

		const { data, error: apiError } = await nextApiClientFetch<CreatePostResponseType>('/api/v1/child_bounties/createChildBounty', {
			allowedCommentors: allowedCommentors ? [allowedCommentors] : [EAllowedCommentor?.ALL],
			content,
			link: link || '',
			postId: index,
			proposerAddress: proposer || loginAddress || '',
			tags: categories || [],
			title
		});

		if (apiError || !data?.post_id) {
			queueNotification({
				header: 'Error',
				message: 'There was an error creating your post.',
				status: NotificationStatus.ERROR
			});
			setLoadingStatus({ isLoading: false, message: '' });
			console.error(apiError);
		}
		if (data?.post_id) {
			queueNotification({
				header: 'Thanks for sharing!',
				message: 'Bounty created successfully.',
				status: NotificationStatus.SUCCESS
			});
			setLoadingStatus({ isLoading: false, message: '' });
		}
	};

	const handleSubmit = async () => {
		if (!api || !apiReady || parentBountyIndex == null || isNaN(parentBountyIndex)) return;

		const txDetails = await getOnChainTx();

		if (!txDetails?.tx || (txDetails?.childbountyIndex && isNaN(txDetails?.childbountyIndex))) return;

		const onFailed = async (message: string) => {
			setLoadingStatus({ isLoading: false, message: '' });
			queueNotification({
				header: 'Failed!',
				message,
				status: NotificationStatus.ERROR
			});
		};

		const onSuccess = async () => {
			queueNotification({
				header: 'Success!',
				message: `Child Bounty #${txDetails?.childbountyIndex} created successfully.`,
				status: NotificationStatus.SUCCESS
			});
			dispatch(childBountyCreationActions.setChildBountyIndex(Number(txDetails.childbountyIndex)));
			await handleCreateBounty(txDetails?.childbountyIndex || null);
			setLoadingStatus({ isLoading: false, message: '' });
			setOpenSuccessModal(true);
			setCloseModal();
			childBountyCreationActions.updateSecondStepPercentage(100);
		};

		await executeTx({
			address: multisigAssociatedAddress || '',
			api,
			apiReady,
			errorMessageFallback: 'Transaction failed.',
			network,
			onFailed,
			onSuccess,
			setStatus: (message: string) => setLoadingStatus({ isLoading: true, message: message }),
			tx: txDetails.tx
		});
	};

	useEffect(() => {
		if ((!parentBountyIndex || isNaN(parentBountyIndex)) && parentBountyIndex !== null) {
			setIsValidBounty(false);
			return;
		}

		checkIsBountyActiveAndValid(parentBountyIndex);
		getGasFee();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return (
		<Spin
			spinning={loadingStatus.isLoading}
			tip={loadingStatus?.message}
		>
			<Form
				form={form}
				onFinish={handleSubmit}
				initialValues={{ childbountyCurator: curator, parentBountyIndex: parentBountyIndex }}
				validateMessages={{ required: "Please add the '${name}'" }}
			>
				{gasFee.gte(availableBalance) && !gasFee.eq(ZERO_BN) && (
					<Alert
						type='error'
						className='mt-6'
						showIcon
						message={<span className='dark:text-blue-dark-high'>Insufficient available balance.</span>}
					/>
				)}
				{!isValidBounty && isValidBounty !== null && (
					<Alert
						type='info'
						message={'Parent Bounty is not active.'}
						showIcon
						className='mt-6'
					/>
				)}

				<div className='mt-6 text-sm font-normal text-lightBlue dark:text-blue-dark-high'>
					<section>
						<div className=' flex items-center justify-between text-lightBlue dark:text-blue-dark-medium'>
							<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Proposer Address </label>
							{!!loginAddress && (
								<Balance
									address={loginAddress}
									onChange={handleAvailableBalanceChange}
								/>
							)}
						</div>
						<div className='flex w-full items-end gap-2 text-sm '>
							<div className='flex h-10 w-full items-center gap-x-3 rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
								<Address
									address={loginAddress || ''}
									isTruncateUsername={false}
									displayInline
									disableTooltip
								/>
								{/* multisig Tag */}
								{multisigData?.threshold > 0 && <Tag className={'rounded-full bg-[#EFF0F1] px-3 py-0.5 text-xs text-[#F4970B] dark:bg-[#EFF0F1]'}>Multisig Address</Tag>}
							</div>
						</div>
					</section>
					<section className='mt-4'>
						<label className='mb-0.5'>
							Parent Bounty Id <span className='text-nay_red'>*</span>
						</label>
						<Form.Item
							name='parentBountyIndex'
							rules={[
								{
									message: 'Invalid parent Bounty index',
									validator(rule, value, callback) {
										if (callback && isNaN(value)) {
											callback(rule?.message?.toString());
										} else {
											callback();
										}
									}
								}
							]}
						>
							<Input
								name='parentBountyIndex'
								className='h-10 rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								onChange={(e) => {
									handleParentBountyChange(Number(e.target.value));
								}}
								value={parentBountyIndex ? parentBountyIndex.toString() : ''}
							/>
						</Form.Item>
					</section>
					<section className='mt-4'>
						<BalanceInput
							theme={theme}
							balance={new BN(reqAmount || '0')}
							formItemName='childBountyAmount'
							placeholder='Enter Funding Amount'
							label={
								<label className='mb-0.5 dark:text-white'>
									Child Bounty Amount <span className='text-nay_red'>*</span>
								</label>
							}
							inputClassName='dark:text-blue-dark-high text-bodyBlue'
							className='mb-0'
							onChange={(amount: BN) => {
								dispatch(childBountyCreationActions.updateSecondStepPercentage(amount.eq(ZERO_BN) || !isValidBounty ? 83.33 : 100));
								dispatch(childBountyCreationActions.setChildBountyAmount(amount.toString()));
								debounceGetGasFee();
							}}
						/>{' '}
					</section>
					<section className='mt-0'>
						<label className='mb-0.5'>Child Bounty Curator (optional)</label>
						<AddressInput
							skipFormatCheck
							className='-mt-6 w-full'
							defaultAddress={curator}
							name='childbountyCurator'
							placeholder='Enter Curator Address'
							iconClassName={'ml-[10px]'}
							identiconSize={26}
							onChange={(address: string) => {
								dispatch(childBountyCreationActions.setChildBountyCurator(address));
								debounceGetGasFee();
							}}
						/>
					</section>
					<section className='mt-6'>
						<BalanceInput
							noRules
							theme={theme}
							balance={new BN(curatorFee || '0')}
							formItemName='curatorFee'
							placeholder='Enter Curator fee'
							label={<label className='mb-0.5 dark:text-white'>Child Bounty Curator fee (optional)</label>}
							inputClassName='dark:text-blue-dark-high text-bodyBlue'
							className='mb-0'
							onChange={(amount: BN) => {
								dispatch(childBountyCreationActions.setChildBountyCuratorFee(amount.toString()));
							}}
						/>
					</section>

					{gasFee.gt(ZERO_BN) && (
						<Alert
							className='mt-0 rounded-[4px] text-bodyBlue'
							showIcon
							type='info'
							message={
								<span className='text-[13px] text-bodyBlue dark:text-blue-dark-high'>
									An amount of <span className='font-semibold'>{parseBalance(String(gasFee.toString()), 3, true, network)}</span> will be required to submit Child bounty
								</span>
							}
						/>
					)}
				</div>

				<div className='-mx-6 mt-6 flex justify-end gap-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
					<CustomButton
						text='Back'
						variant='default'
						height={40}
						width={155}
						onClick={() => setStep(EChildBountySteps.WRITE_CHILDBOUNTY)}
					/>
					<CustomButton
						htmlType='submit'
						text='Submit'
						variant='primary'
						height={40}
						width={155}
						className={classNames(new BN(reqAmount || '0').eq(ZERO_BN) || !isValidBounty ? 'opacity-50' : '')}
						disabled={new BN(reqAmount || '0').eq(ZERO_BN) || !isValidBounty}
					/>
				</div>
			</Form>
		</Spin>
	);
};

export default CreateChildBounty;
