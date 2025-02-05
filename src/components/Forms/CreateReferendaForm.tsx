// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { AnyTuple } from '@polkadot/types/types';
import { Alert, Button, Form, Input, Radio, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useApiContext } from '~src/context';
import { useInitialConnectAddress, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import { formatedBalance } from '~src/util/formatedBalance';
import { BN, BN_HUNDRED, BN_ONE, isHex } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { EEnactment, IEnactment, ISteps } from '../OpenGovTreasuryProposal';
import { IAdvancedDetails } from '../OpenGovTreasuryProposal/CreatePreimage';
import { useCurrentBlock } from '~src/hooks';
import DownArrow from '~assets/icons/down-icon.svg';
import { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { LoadingOutlined } from '@ant-design/icons';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IPreimageData } from 'pages/api/v1/preimages/latest';
import _ from 'lodash';
import SelectSection from '../CreateReferendum/SelectSection';
import SelectMethod from '../CreateReferendum/SelectMethod';
import { getTypeDef } from '@polkadot/types';
import Params from '../CreateReferendum/Params';

// Testing adding a new commit

const DEFAULT_SECTION_NAME = 'system';
const DEFAULT_METHOD_NAME = 'setCode';

const ZERO_BN = new BN(0);

function getParams({ meta }: { meta: any }) {
	return meta.args.map(({ name, type, typeName }: any) => ({
		name: name.toString(),
		type: {
			...getTypeDef(type.toString()),
			...(typeName.isSome ? { typeName: typeName.unwrap().toString() } : {})
		}
	}));
}

function useCallValues({ items, itemIndex, setItems }: any) {
	const setValue = useCallback(
		(valueOrFunction: any) => {
			setItems((items: any) => {
				const newItems = items ? { ...items } : {};
				return { itemIndex, newItems, valueOrFunction };
			});
		},
		[itemIndex, setItems]
	);

	return [items?.[itemIndex], setValue];
}

export default function CreateReferendaForm({
	setSteps,
	setOpenSuccess,
	handleClose,
	afterProposalCreated,
	selectedTrack,
	setSelectedTrack,
	isPreimage,
	setIsPreimage,
	preimageHash,
	setPreimageHash,
	preimageLength,
	setPreimageLength
}: {
	setSteps: (pre: ISteps) => void;
	setOpenSuccess: (pre: boolean) => void;
	handleClose: () => void;
	afterProposalCreated: (postId: number) => Promise<void>;
	selectedTrack: string;
	setSelectedTrack: React.Dispatch<React.SetStateAction<string>>;
	isPreimage: boolean | null;
	setIsPreimage: (pre: boolean) => void;
	preimageHash: string;
	setPreimageHash: (pre: string) => void;
	preimageLength: number | null;
	setPreimageLength: (pre: number | null) => void;
}) {
	const { api, apiReady } = useApiContext();
	const { address, availableBalance } = useInitialConnectAddress();
	const availableBalanceBN = new BN(availableBalance);
	const { loginWallet } = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const [submissionDeposite, setSubmissionDeposite] = useState<BN>(ZERO_BN);
	const [loadingStatus, setLoadingStatus] = useState({ isLoading: false, message: '' });
	const [enactment, setEnactment] = useState<IEnactment>({ key: EEnactment.After_No_Of_Blocks, value: BN_HUNDRED });
	const [advancedDetails, setAdvancedDetails] = useState<IAdvancedDetails>({ afterNoOfBlocks: BN_HUNDRED, atBlockNo: BN_ONE });
	const currentBlock = useCurrentBlock();
	const unit = `${chainProperties[network]?.tokenSymbol}`;

	const [openAdvanced, setOpenAdvanced] = useState<boolean>(false);
	const [sectionName, setSectionName] = useState(DEFAULT_SECTION_NAME);
	const [methodName, setMethodName] = useState(DEFAULT_METHOD_NAME);
	const [callState, setCallState] = useState<any>();

	const [callValues, setCallValues] = useCallValues({
		itemIndex: 'values',
		items: callState,
		setItems: setCallState
	});

	// const handleExistingPreimageSubmit = async () => {
	// 	if (!api || !apiReady) {
	// 		return;
	// 	}
	// 	if (!loginWallet) {
	// 		return;
	// 	}
	// 	await setSigner(api, loginWallet);

	// 	if (!preimageHash || !preimageLength) {
	// 		return;
	// 	}
	// 	setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });
	// 	try {
	// 		const origin = { Origins: selectedTrack };
	// 		const proposalTx: any = api.tx.referenda.submit(
	// 			origin as any,
	// 			{ Lookup: { hash: preimageHash, len: preimageLength } },
	// 			enactment.value ? (enactment.key === EEnactment.At_Block_No ? { At: enactment.value } : { After: enactment.value }) : { After: BN_HUNDRED }
	// 		);
	// 		const post_id = Number(await api.query.referenda.referendumCount());

	// 		const onSuccess = async () => {
	// 			afterProposalCreated(post_id);
	// 			queueNotification({
	// 				header: 'Success!',
	// 				message: `Proposal #${post_id} successful.`,
	// 				status: NotificationStatus.SUCCESS
	// 			});
	// 			setLoadingStatus({ isLoading: false, message: '' });
	// 			handleClose();
	// 			setOpenSuccess(true);
	// 		};

	// 		const onFailed = (message: string) => {
	// 			setLoadingStatus({ isLoading: false, message: '' });
	// 			queueNotification({
	// 				header: 'Failed!',
	// 				message,
	// 				status: NotificationStatus.ERROR
	// 			});
	// 		};
	// 		await executeTx({
	// 			address,
	// 			api,
	// 			apiReady,
	// 			errorMessageFallback: 'Transaction failed.',
	// 			network,
	// 			onBroadcast: () => setLoadingStatus({ isLoading: true, message: 'Broadcasting the vote' }),
	// 			onFailed,
	// 			onSuccess,
	// 			tx: proposalTx
	// 		});
	// 	} catch (error) {
	// 		setLoadingStatus({ isLoading: false, message: '' });
	// 		console.log(':( transaction failed');
	// 		console.error('ERROR:', error);
	// 		queueNotification({
	// 			header: 'Failed!',
	// 			message: error.message,
	// 			status: NotificationStatus.ERROR
	// 		});
	// 	}
	// };

	const existPreimageData = async (preimageHash: string) => {
		setPreimageLength(0);
		if (!api || !apiReady || !isHex(preimageHash, 256) || preimageHash?.length < 0) return;
		setLoadingStatus({ isLoading: true, message: '' });
		const { data, error } = await nextApiClientFetch<IPreimageData>(`api/v1/preimages/latest?hash=${preimageHash}`);

		if (data && !data?.message) {
			if (data.hash === preimageHash) {
				setPreimageLength(data.length);
				setSteps({ percent: 100, step: 1 });
			} else {
				setPreimageLength(0);
				queueNotification({
					header: 'Incorrect Preimage Added!',
					message: 'Please enter a preimage for a treasury related track.',
					status: NotificationStatus.ERROR
				});
			}
		} else if (error || data?.message) {
			console.log('fetching data from polkadotjs');
		}
		setLoadingStatus({ isLoading: false, message: '' });
	};
	const checkPreimageHash = (preimageLength: number | null, preimageHash: string) => {
		if (!preimageHash || preimageLength === null) return false;
		return !isHex(preimageHash, 256) || !preimageLength || preimageLength === 0;
	};

	const invalidPreimageHash = useCallback(() => checkPreimageHash(preimageLength, preimageHash), [preimageHash, preimageLength]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debounceExistPreimageFn = useCallback(_.debounce(existPreimageData, 2000), []);

	const handlePreimageHash = (preimageHash: string) => {
		if (!preimageHash || preimageHash.length === 0) return;
		setSteps({ percent: 60, step: 1 });
		debounceExistPreimageFn(preimageHash);
		setPreimageHash(preimageHash);
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
			// onChangeLocalStorageSet({ enactment: { ...enactment, value: bnValue.toString() } }, Boolean(isPreimage));
		} catch (error) {
			console.log(error);
		}
	};

	function getCallState(fn: SubmittableExtrinsicFunction<'promise', AnyTuple>, values = []) {
		return {
			extrinsic: {
				fn,
				params: getParams(fn)
			},
			values
		};
	}

	useEffect(() => {
		if (!api || !apiReady) return;
		const submissionDeposite = api?.consts?.referenda?.submissionDeposit || ZERO_BN;
		setSubmissionDeposite(submissionDeposite);
	}, [api, apiReady]);

	useEffect(() => {
		if (!api) return;

		const fn = api.tx[sectionName]?.[methodName];
		if (!fn) return;

		setCallState((state: any) => {
			if (state?.extrinsic.fn.section === sectionName && state?.extrinsic.fn.method === methodName) {
				return state;
			}
			return getCallState(fn);
		});
	}, [api, sectionName, methodName]);

	console.log({ callState });

	return (
		<Spin
			spinning={loadingStatus.isLoading}
			indicator={<LoadingOutlined />}
		>
			<section className='w-full'>
				<div className='my-5 flex flex-col'>
					<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Do you have an existing preimage? </label>
					<Radio.Group
						onChange={(e) => {
							setIsPreimage(e.target.value);
							// onChangeLocalStorageSet({ isPreimage: e.target.value }, e.target.value, preimageCreated, preimageLinked, true);
							setSteps({ percent: 20, step: 1 });
						}}
						size='small'
						className='mt-1.5'
						value={isPreimage}
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
									className='h-10 rounded-[4px] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
									value={preimageHash}
									onChange={(e) => handlePreimageHash(e.target.value)}
								/>
							</Form.Item>
							{invalidPreimageHash() && !loadingStatus.isLoading && <span className='text-sm text-[#ff4d4f]'>Invalid Preimage hash . Please enter valid preimage</span>}
						</div>
						<div className='mt-6'>
							<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Preimage Length</label>
							<Input
								name='preimage_length'
								className='h-10 rounded-[4px] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								value={preimageLength || 0}
								disabled
							/>
						</div>
						<div className='mt-4'>
							<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>
								Select Track{' '}
								<span>
									<HelperTooltip
										text='Track selection is done based on the amount requested.'
										className='ml-1'
									/>
								</span>
							</label>
							{/* <SelectTracks
								tracksArr={trackArr}
								onTrackChange={(track) => {
									setSelectedTrack(track);
									// onChangeLocalStorageSet({ selectedTrack: track }, isPreimage);
									// getPreimageTxFee();
									// setSteps({ percent: 100, step: 1 });
								}}
								selectedTrack={selectedTrack}
							/> */}
						</div>
					</>
				)}
				{isPreimage === false && (
					<div>
						{availableBalanceBN.lte(submissionDeposite) && (
							<Alert
								className='my-2 rounded-[4px] dark:border-infoAlertBorderDark dark:bg-infoAlertBgDark'
								type='info'
								showIcon
								message={
									<span className='text-[13px] font-medium text-bodyBlue dark:text-blue-dark-high'>
										Please maintain minimum {formatedBalance(String(submissionDeposite.toString()), unit)} {unit} balance for these transactions:
									</span>
								}
								description={
									<div className='-mt-1 mr-[18px] flex flex-col gap-1 text-xs dark:text-blue-dark-high'>
										<li className='mt-0 flex w-full justify-between'>
											<div className='mr-1 text-lightBlue dark:text-blue-dark-medium'>Proposal Submission</div>
											<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
												{formatedBalance(String(submissionDeposite.toString()), unit)} {unit}
											</span>
										</li>
									</div>
								}
							/>
						)}
						{loadingStatus.isLoading && (
							<div className='flex flex-col items-center justify-center'>
								{/* <Loader /> */}
								{loadingStatus.isLoading && <span className='text-pink_primary dark:text-pink-dark-primary'>{loadingStatus.message}</span>}
							</div>
						)}
						<div className='flex flex-col gap-y-4'>
							<SelectSection
								sectionName={sectionName}
								setSectionName={setSectionName}
							/>
							<SelectMethod
								sectionName={sectionName}
								methodName={methodName}
								setMethodName={setMethodName}
							/>
							<Params
								params={callState?.extrinsic?.params}
								value={callValues}
								setValue={setCallValues}
							/>
						</div>
					</div>
				)}

				{console.log({ sectionName, methodName, callState })}

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
															const bnValue = new (BN as any)(Number(value) >= 0 ? value : '0') || ZERO_BN;

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
													className='mt-4 w-[100px] rounded-[4px] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
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
													defaultValue={100}
													className='mt-4 w-[100px] rounded-[4px] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
													onChange={(e) => handleAdvanceDetailsChange(EEnactment.After_No_Of_Blocks, e.target.value)}
												/>
											</Form.Item>
										)}
									</span>
								</div>
							</Radio>
						</Radio.Group>
					</div>
				)}
				<div className='mt-6 flex items-center justify-end space-x-3'>
					<Button
						onClick={() => setSteps({ percent: 100, step: 0 })}
						className='h-10 w-[155px] rounded-[4px] border-pink_primary text-sm font-medium tracking-[0.05em] text-pink_primary dark:bg-transparent'
					>
						Back
					</Button>
					{/* <CustomButton
						variant='primary'
						htmlType='submit'
						buttonsize='sm'
						onClick={isPreimage ? handleExistingPreimageSubmit : handleSubmit}
						className={`w-min ${!methodCall || !selectedTrack ? 'opacity-60' : ''}`}
						disabled={Boolean(((!methodCall || !selectedTrack) && !isPreimage) || (isPreimage && (!preimageHash || !preimageLength)))}
					>
						Create Referendum
					</CustomButton> */}
				</div>
			</section>
		</Spin>
	);
}
