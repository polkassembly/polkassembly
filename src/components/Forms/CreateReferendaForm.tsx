// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ArrowDownIcon } from '~src/ui-components/CustomIcons';
import { getTypeDef } from '@polkadot/types/create';
import { TypeDef, TypeDefInfo } from '@polkadot/types/types';
import { Button, Form, Input, Radio, Spin } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useApiContext } from '~src/context';
import BalanceInput from '~src/ui-components/BalanceInput';
import AddressInput from '~src/ui-components/AddressInput';
import { Dropdown } from '~src/ui-components/Dropdown';
import { useTheme } from 'next-themes';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useInitialConnectAddress, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus, PostOrigin } from '~src/types';
import executeTx from '~src/util/executeTx';
import { BN, BN_HUNDRED, BN_ONE, isHex } from '@polkadot/util';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import SelectTracks from '../OpenGovTreasuryProposal/SelectTracks';
import { EEnactment, IEnactment, ISteps } from '../OpenGovTreasuryProposal';
import { IAdvancedDetails } from '../OpenGovTreasuryProposal/CreatePreimage';
import { useCurrentBlock } from '~src/hooks';
import DownArrow from '~assets/icons/down-icon.svg';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { setSigner } from '~src/util/create-referenda/setSigner';
import { createPreImage } from '~src/util/create-referenda/createPreImage';
import { LoadingOutlined } from '@ant-design/icons';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IPreimageData } from 'pages/api/v1/preimages/latest';
import _ from 'lodash';
import { isOpenGovSupported } from '~src/global/openGovNetworks';

// Testing adding a new commit
interface ParamField {
	name: string;
	type: string;
	optional: boolean;
	raw: TypeDef;
	typeName: string;
}

interface FormState {
	palletRpc: string;
	callable: string;
	inputParams: any[];
}

const initFormState = {
	callable: '',
	inputParams: [] as any[],
	palletRpc: ''
} as FormState;

const paramIsOptional = (arg: any) => arg.type.toString().startsWith('Option<');

const isNumberType = (type: string) => ['Compact<Balance>', 'BalanceOf', 'u8', 'u16', 'u32', 'u64', 'u128', 'i8', 'i16', 'i32', 'i64', 'i128'].includes(type);

const transformParams = (paramFields: ParamField[], inputParams: any[], opts = { emptyAsNull: true }) => {
	const paramVal = inputParams.map((inputParam) => {
		if (typeof inputParam === 'object' && inputParam !== null && typeof inputParam.value === 'string') {
			return inputParam.value.trim();
		}
		if (typeof inputParam === 'string') {
			return inputParam.trim();
		}
		return inputParam;
	});

	const params = paramFields.map((field, ind) => ({
		...field,
		value: paramVal[ind] || null
	}));

	return params.reduce((previousValue, { type = 'string', value }) => {
		if (value == null || value === '') return opts.emptyAsNull ? [...previousValue, null] : previousValue;

		let converted = value;

		if (type.indexOf('Vec<') >= 0) {
			converted = converted.split(',').map((e: string) => e.trim());
			converted = converted.map((single: any) => (isNumberType(type) ? (single.indexOf('.') >= 0 ? Number.parseFloat(single) : Number.parseInt(single, 10)) : single));
			return [...previousValue, converted];
		}

		if (isNumberType(type)) {
			converted = converted.indexOf('.') >= 0 ? Number.parseFloat(converted) : Number.parseInt(converted, 10);
		}
		return [...previousValue, converted];
	}, [] as any[]);
};
const ZERO_BN = new BN(0);

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
	const { address } = useInitialConnectAddress();
	const { loginWallet } = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const [palletRPCs, setPalletRPCs] = useState<ItemType[]>([]);
	const [callables, setCallables] = useState<ItemType[]>([]);
	const [paramFields, setParamFields] = useState<ParamField[] | null>(null);
	const [formState, setFormState] = useState(initFormState);
	const { palletRpc, callable, inputParams } = formState;
	const [transformedParams, setTransformedParams] = useState<any>();
	const [methodCall, setMethodCall] = useState<SubmittableExtrinsic<'promise'> | null>();
	const [loadingStatus, setLoadingStatus] = useState({ isLoading: false, message: '' });
	const [enactment, setEnactment] = useState<IEnactment>({ key: EEnactment.After_No_Of_Blocks, value: BN_HUNDRED });
	const [advancedDetails, setAdvancedDetails] = useState<IAdvancedDetails>({ afterNoOfBlocks: BN_HUNDRED, atBlockNo: BN_ONE });
	const currentBlock = useCurrentBlock();
	const [openAdvanced, setOpenAdvanced] = useState<boolean>(false);

	const handleSubmit = async () => {
		if (!methodCall) return;
		if (!api || !apiReady) {
			return;
		}
		if (!loginWallet) {
			return;
		}
		await setSigner(api, loginWallet);

		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });
		try {
			const proposalPreImage = createPreImage(api, methodCall);
			const preImageTx = proposalPreImage.notePreimageTx;
			const origin: any = { Origins: selectedTrack };
			const proposalTx = api.tx.referenda.submit(
				origin,
				{ Lookup: { hash: proposalPreImage.preimageHash, len: proposalPreImage.preimageLength } },
				enactment.value ? (enactment.key === EEnactment.At_Block_No ? { At: enactment.value } : { After: enactment.value }) : { After: BN_HUNDRED }
			);
			const mainTx = api.tx.utility.batchAll([preImageTx, proposalTx]);
			const post_id = Number(await api.query.referenda.referendumCount());

			const onSuccess = async () => {
				afterProposalCreated(post_id);
				queueNotification({
					header: 'Success!',
					message: `Proposal #${post_id} successful.`,
					status: NotificationStatus.SUCCESS
				});
				setLoadingStatus({ isLoading: false, message: '' });
				handleClose();
				setOpenSuccess(true);
			};

			const onFailed = (message: string) => {
				setLoadingStatus({ isLoading: false, message: '' });
				queueNotification({
					header: 'Failed!',
					message,
					status: NotificationStatus.ERROR
				});
			};
			await executeTx({
				address,
				api,
				apiReady,
				errorMessageFallback: 'Transaction failed.',
				network,
				onBroadcast: () => setLoadingStatus({ isLoading: true, message: 'Broadcasting the vote' }),
				onFailed,
				onSuccess,
				tx: mainTx
			});
		} catch (error) {
			setLoadingStatus({ isLoading: false, message: '' });
			console.log(':( transaction failed');
			console.error('ERROR:', error);
			queueNotification({
				header: 'Failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
		}
	};

	const handleExistingPreimageSubmit = async () => {
		if (!api || !apiReady) {
			return;
		}
		if (!loginWallet) {
			return;
		}
		await setSigner(api, loginWallet);

		if (!preimageHash || !preimageLength) {
			return;
		}
		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });
		try {
			const origin = { Origins: selectedTrack };
			const proposalTx: any = api.tx.referenda.submit(
				origin as any,
				{ Lookup: { hash: preimageHash, len: preimageLength } },
				enactment.value ? (enactment.key === EEnactment.At_Block_No ? { At: enactment.value } : { After: enactment.value }) : { After: BN_HUNDRED }
			);
			const post_id = Number(await api.query.referenda.referendumCount());

			const onSuccess = async () => {
				afterProposalCreated(post_id);
				queueNotification({
					header: 'Success!',
					message: `Proposal #${post_id} successful.`,
					status: NotificationStatus.SUCCESS
				});
				setLoadingStatus({ isLoading: false, message: '' });
				handleClose();
				setOpenSuccess(true);
			};

			const onFailed = (message: string) => {
				setLoadingStatus({ isLoading: false, message: '' });
				queueNotification({
					header: 'Failed!',
					message,
					status: NotificationStatus.ERROR
				});
			};
			await executeTx({
				address,
				api,
				apiReady,
				errorMessageFallback: 'Transaction failed.',
				network,
				onBroadcast: () => setLoadingStatus({ isLoading: true, message: 'Broadcasting the vote' }),
				onFailed,
				onSuccess,
				tx: proposalTx
			});
		} catch (error) {
			setLoadingStatus({ isLoading: false, message: '' });
			console.log(':( transaction failed');
			console.error('ERROR:', error);
			queueNotification({
				header: 'Failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
		}
	};

	const areAllParamsFilled = useMemo(() => {
		if (paramFields === null) {
			return false;
		}

		if (paramFields.length === 0) {
			return true;
		}

		return paramFields?.every((paramField, ind) => {
			const param = inputParams[ind];
			if (paramField.optional) {
				return true;
			}
			if (param == null) {
				return false;
			}

			const value = typeof param === 'object' ? param.value : param;
			return value !== null && value !== '';
		});
	}, [inputParams, paramFields]);

	const updatePalletRPCs = useCallback(() => {
		if (!api) {
			return;
		}
		const apiType = api.tx;
		const palletRPCsList = Object.keys(apiType)
			.sort()
			.filter((pr) => Object.keys(apiType[pr]).length > 0)
			.map((pr) => ({ key: pr, label: <span className='flex items-center gap-x-2 dark:text-white'>{pr}</span> }));
		setPalletRPCs(palletRPCsList);
	}, [api]);

	const updateCallables = useCallback(() => {
		if (!api || !palletRpc) {
			return;
		}

		const callablesList = Object.keys(api.tx[palletRpc])
			.sort()
			.map((c) => ({ key: c, label: <span className='flex items-center gap-x-2 dark:text-white'>{c}</span> }));
		setCallables(callablesList);
	}, [api, palletRpc]);

	const updateParamFields = useCallback(() => {
		if (!api || !palletRpc || !callable) {
			setParamFields(null);
			return;
		}

		let paramFieldsList: ParamField[] = [];
		const metaArgs = api.tx[palletRpc][callable].meta.args;

		if (metaArgs && metaArgs.length > 0) {
			paramFieldsList = metaArgs.map((arg) => {
				const instance = api.registry.createType(arg.type as unknown as 'u32');

				const raw = getTypeDef(instance.toRawType());

				return {
					name: arg.name.toString(),
					optional: paramIsOptional(arg),
					raw,
					type: arg.type.toString(),
					typeName: arg.typeName.toString()
				};
			});
		}

		setParamFields(paramFieldsList);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, callable, palletRpc, formState]);

	useEffect(() => {
		if (!!paramFields?.length && !!inputParams.length) {
			setTransformedParams(transformParams(paramFields, inputParams));
		}
	}, [inputParams, paramFields]);
	useEffect(updatePalletRPCs, [updatePalletRPCs]);
	useEffect(updateCallables, [updateCallables]);
	useEffect(updateParamFields, [updateParamFields]);

	const onPalletCallableParamChange = useCallback((event: any, state: string) => {
		// reset the params
		setParamFields(null);

		setFormState((prevState) => {
			return { ...prevState, [state]: '' };
		});

		setFormState((prevState) => {
			const value = event.key;
			if (state === 'palletRpc') {
				return {
					...prevState,
					callable: '',
					inputParams: [],
					[state]: value
				};
			}
			if (state === 'callable') {
				return { ...prevState, inputParams: [], [state]: value };
			}

			return initFormState;
		});
	}, []);

	const onParamChange = (value: string, { ind, paramField }: { ind: number; paramField: ParamField }) => {
		if (!value) {
			return;
		}
		setFormState((prevState) => {
			const inputParams = [...prevState.inputParams];
			inputParams[ind] = { type: paramField.type, value };
			return { ...prevState, inputParams };
		});
	};
	const trackArr: string[] = [];

	if (network && isOpenGovSupported(network)) {
		Object.values(PostOrigin).forEach((value) => {
			trackArr.push(value);
		});
	}

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

	useEffect(() => {
		if (!apiReady || !api) {
			return;
		}

		if (!callable || !palletRpc || !areAllParamsFilled) {
			return;
		}

		try {
			const extrinsic = transformedParams ? api.tx[palletRpc][callable](...transformedParams) : api.tx[palletRpc][callable]();

			if (extrinsic) setMethodCall(extrinsic);
		} catch (e) {
			console.error('Error in ManualExtrinsic');
			console.error(e);
		}
	}, [api, areAllParamsFilled, callable, apiReady, palletRpc, transformedParams]);

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
						{isOpenGovSupported(network) && (
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
								<SelectTracks
									tracksArr={trackArr}
									onTrackChange={(track) => {
										setSelectedTrack(track);
										// onChangeLocalStorageSet({ selectedTrack: track }, isPreimage);
										// getPreimageTxFee();
										// setSteps({ percent: 100, step: 1 });
									}}
									selectedTrack={selectedTrack}
								/>
							</div>
						)}
					</>
				)}
				{isPreimage === false && (
					<div>
						{loadingStatus.isLoading && (
							<div className='flex flex-col items-center justify-center'>
								{/* <Loader /> */}
								{loadingStatus.isLoading && <span className='text-pink_primary dark:text-pink-dark-primary'>{loadingStatus.message}</span>}
							</div>
						)}
						<div className='flex items-center gap-x-2'>
							<div className='w-full'>
								<label className='input-label dark:text-blue-dark-medium'>Pallet</label>
								<Dropdown
									theme={theme}
									overlayClassName='z-[1056]'
									trigger={['click']}
									menu={{
										items: palletRPCs,
										onClick: (e: any) => onPalletCallableParamChange(e, 'palletRpc')
									}}
									className={'border border-white'}
								>
									<div className='flex items-center justify-between gap-x-2 rounded-md border border-solid border-section-light-container bg-[#f6f7f9] px-4 py-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-[#29323C33] dark:text-blue-dark-high '>
										<span className='flex items-center gap-x-2'>{palletRpc || <span className='text-lightBlue dark:text-blue-dark-medium'>Pallet</span>}</span>
										<ArrowDownIcon className='text-[#90A0B7] dark:text-blue-dark-medium' />
									</div>
								</Dropdown>
							</div>
							{palletRpc && (
								<div className='w-full'>
									<label className='input-label dark:text-blue-dark-medium'>Method</label>
									<Dropdown
										theme={theme}
										trigger={['click']}
										menu={{
											items: callables,
											onClick: (e: any) => onPalletCallableParamChange(e, 'callable')
										}}
									>
										<div className='flex items-center justify-between gap-x-2 rounded-md border border-solid border-section-light-container bg-[#f6f7f9] px-4 py-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-[#29323C33] dark:text-blue-dark-high'>
											<span className='flex items-center gap-x-2'>{callable || <span className='text-lightBlue dark:text-blue-dark-medium'>Method</span>}</span>
											<ArrowDownIcon className='text-[#90A0B7] dark:text-blue-dark-medium' />
										</div>
									</Dropdown>
								</div>
							)}
						</div>
						{paramFields?.map((paramField, ind) => {
							return (
								<div
									key={ind}
									className=''
								>
									<label className='input-label dark:text-blue-dark-medium'>
										{paramField.name}
										{paramField.optional ? ' (optional)' : ''}
									</label>
									{['i8', 'i16', 'i32', 'i64', 'i128', 'u8', 'u16', 'u32', 'u64', 'u128', 'u256'].includes(
										paramField.raw.info === TypeDefInfo.Compact && paramField.raw.sub ? (paramField.raw.sub as any)?.type : paramField.raw.type
									) && ['Amount', 'Balance', 'BalanceOf'].includes(paramField.typeName) ? (
										<BalanceInput
											theme={theme}
											onChange={(balance) => onParamChange(balance.toString(), { ind, paramField })}
										/>
									) : ['AccountId', 'Address', 'LookupSource', 'MultiAddress'].includes(paramField.type) ? (
										<AddressInput
											theme={theme}
											onChange={(address) => onParamChange(address, { ind, paramField })}
											placeholder={paramField.type}
											className='!mt-0'
										/>
									) : (
										<Input
											placeholder={paramField.type}
											type='text'
											className='rounded-md px-4 py-3 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
											value={inputParams[ind]?.value || ''}
											onChange={(event) => onParamChange(event.target.value, { ind, paramField })}
										/>
									)}
								</div>
							);
						})}
						{isOpenGovSupported(network) && (
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
								<SelectTracks
									tracksArr={trackArr}
									onTrackChange={(track) => {
										setSelectedTrack(track);
										// onChangeLocalStorageSet({ selectedTrack: track }, isPreimage);
										// getPreimageTxFee();
										// setSteps({ percent: 100, step: 1 });
									}}
									selectedTrack={selectedTrack}
								/>
							</div>
						)}
					</div>
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
					<CustomButton
						variant='primary'
						htmlType='submit'
						buttonsize='sm'
						onClick={isPreimage ? handleExistingPreimageSubmit : handleSubmit}
						className='w-min'
						disabled={Boolean(((!methodCall || (isOpenGovSupported(network) && !selectedTrack)) && !isPreimage) || (isPreimage && (!preimageHash || !preimageLength)))}
					>
						Create Referendum
					</CustomButton>
				</div>
			</section>
		</Spin>
	);
}
