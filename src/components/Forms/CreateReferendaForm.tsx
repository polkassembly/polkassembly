// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ArrowDownIcon } from '~src/ui-components/CustomIcons';
import { getTypeDef } from '@polkadot/types/create';
import { TypeDef, TypeDefInfo } from '@polkadot/types/types';
import { Alert, Input } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useApiContext } from '~src/context';
import BalanceInput from '~src/ui-components/BalanceInput';
import AddressInput from '~src/ui-components/AddressInput';
import { Dropdown } from '~src/ui-components/Dropdown';
import { useTheme } from 'next-themes';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { APPNAME } from '~src/global/appName';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus, PostOrigin, Wallet } from '~src/types';
import executeTx from '~src/util/executeTx';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import { formatedBalance } from '~src/util/formatedBalance';
import { BN, BN_HUNDRED } from '@polkadot/util';
import { poppins } from 'pages/_app';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import { chainProperties } from '~src/global/networkConstants';
import Loader from '~src/ui-components/Loader';

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

export default function CreateReferendaForm() {
	const { api, apiReady } = useApiContext();
	const { loginAddress, loginWallet } = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();

	const [address, setAddress] = useState<string>(loginAddress);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [submissionDeposite, setSubmissionDeposite] = useState<BN>(ZERO_BN);
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [palletRPCs, setPalletRPCs] = useState<ItemType[]>([]);
	const [callables, setCallables] = useState<ItemType[]>([]);
	const [paramFields, setParamFields] = useState<ParamField[] | null>(null);
	const [formState, setFormState] = useState(initFormState);
	const { palletRpc, callable, inputParams } = formState;
	const [transformedParams, setTransformedParams] = useState<any>();
	const [methodCall, setMethodCall] = useState<string>('');
	const [loadingStatus, setLoadingStatus] = useState({ isLoading: false, message: '' });

	const unit = `${chainProperties[network]?.tokenSymbol}`;

	const handleSubmit = async () => {
		if (!methodCall) return;
		if (!api || !apiReady) {
			return;
		}
		if (!loginWallet) {
			return;
		}
		const injectedWindow = window as Window & InjectedWindow;

		const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[loginWallet] : null;

		if (!wallet || !api || !apiReady) {
			console.log('wallet not found');
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
						.then((value: any) => {
							clearTimeout(timeoutId);
							resolve(value);
						})
						.catch((error: any) => {
							reject(error);
						});
				}
			});
		} catch (err) {
			console.log(err?.message);
		}

		if (!injected) {
			console.log('injected not found');
			return;
		}

		api.setSigner(injected.signer);

		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });
		try {
			const origin: any = { Origins: PostOrigin.ROOT };
			console.log(methodCall);
			const proposal = api.tx.referenda.submit(origin, { Lookup: { hash: methodCall, len: String(1) } }, { After: BN_HUNDRED });

			const onSuccess = async () => {
				queueNotification({
					header: 'Success!',
					message: `Propsal #${proposal.hash} successful.`,
					status: NotificationStatus.SUCCESS
				});
				setLoadingStatus({ isLoading: false, message: '' });
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
				tx: proposal
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

	const handleOnBalanceChange = async (balanceStr: string) => {
		if (!api || !apiReady) {
			return;
		}
		let balance = new BN(0);
		try {
			balance = new BN(balanceStr);
			setAvailableBalance(balance);
		} catch (err) {
			console.log(err);
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
			.map((pr) => ({ key: pr, label: <span className='flex items-center gap-x-2 text-white'>{pr}</span> }));
		setPalletRPCs(palletRPCsList);
	}, [api]);

	const updateCallables = useCallback(() => {
		if (!api || !palletRpc) {
			return;
		}

		const callablesList = Object.keys(api.tx[palletRpc])
			.sort()
			.map((c) => ({ key: c, label: <span className='flex items-center gap-x-2 text-white'>{c}</span> }));
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

	useEffect(() => {
		if (!apiReady || !api) {
			return;
		}

		if (!callable || !palletRpc || !areAllParamsFilled) {
			return;
		}

		try {
			const extrinsic = transformedParams ? api.tx[palletRpc][callable](...transformedParams) : api.tx[palletRpc][callable]();

			if (extrinsic) setMethodCall(extrinsic.method.toHex());
		} catch (e) {
			console.error('Error in ManualExtrinsic');
			console.error(e);
			console.error(e);
		}
	}, [api, areAllParamsFilled, callable, apiReady, palletRpc, transformedParams]);

	useEffect(() => {
		if (!api || !apiReady) return;

		if (!window) {
			return;
		}

		if (loginWallet) {
			(async () => {
				const accountsData = await getAccountsFromWallet({ api, apiReady, chosenWallet: loginWallet, loginAddress, network });
				setAccounts(accountsData?.accounts || []);
			})();
		} else {
			const loginWallet = localStorage.getItem('loginWallet');
			if (loginWallet) {
				(async () => {
					const accountsData = await getAccountsFromWallet({ api, apiReady, chosenWallet: loginWallet as Wallet, loginAddress, network });
					setAccounts(accountsData?.accounts || []);
				})();
			}
		}
		const submissionDeposite = api?.consts?.referenda?.submissionDeposit || ZERO_BN;
		setSubmissionDeposite(submissionDeposite);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [useUserDetailsSelector]);

	return (
		<section className='w-[500px]'>
			{availableBalance.lte(submissionDeposite) && (
				<Alert
					className='my-2 mt-6 rounded-[4px] dark:border-infoAlertBorderDark dark:bg-infoAlertBgDark'
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
			<AccountSelectionForm
				title='Select an Account'
				isTruncateUsername={false}
				accounts={accounts}
				address={address}
				withBalance
				onBalanceChange={handleOnBalanceChange}
				onAccountChange={setAddress}
				className={`${poppins.variable} ${poppins.className} text-sm font-normal text-lightBlue dark:text-blue-dark-medium`}
				inputClassName='rounded-[4px] px-3 py-1'
				theme={theme}
			/>
			{loadingStatus.isLoading && (
				<div className='flex flex-col items-center justify-center'>
					<Loader />
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
						<div className='flex items-center justify-between gap-x-2 rounded-md border border-solid border-[#D2D8E0] bg-[#f6f7f9] px-4 py-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-[#29323C33] dark:text-blue-dark-high '>
							<span className='flex items-center gap-x-2'>{palletRpc || <span className='text-text_secondary'>Pallet</span>}</span>
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
							<div className='flex items-center justify-between gap-x-2 rounded-md border border-solid border-[#D2D8E0] bg-[#f6f7f9] px-4 py-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-[#29323C33] dark:text-blue-dark-high'>
								<span className='flex items-center gap-x-2'>{callable || <span className='text-text_secondary'>Method</span>}</span>
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
						className='mt-2'
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
			{methodCall && (
				<div className=' mt-4 flex items-center justify-between'>
					<div className='flex items-center justify-end'>
						<CustomButton
							variant='primary'
							htmlType='submit'
							buttonsize='sm'
							onClick={handleSubmit}
						>
							Create a Referenda
						</CustomButton>
					</div>
				</div>
			)}
		</section>
	);
}
