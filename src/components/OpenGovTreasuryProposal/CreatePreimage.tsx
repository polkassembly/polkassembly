// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Form, FormInstance, Input, Radio, Spin } from 'antd';
import { EBeneficiaryAddressesAction, EBeneficiaryAddressesActionType, EEnactment, IEnactment, INIT_BENEFICIARIES, IPreimage, ISteps } from '.';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import BN from 'bn.js';
import dynamic from 'next/dynamic';
import SelectTracks from './SelectTracks';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { useApiContext } from '~src/context';
import AddressInput from '~src/ui-components/AddressInput';
import Web3 from 'web3';
import getEncodedAddress from '~src/util/getEncodedAddress';
import styled from 'styled-components';
import DownArrow from '~assets/icons/down-icon.svg';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { BN_HUNDRED, BN_MAX_INTEGER, BN_ONE, BN_THOUSAND, formatBalance, isHex } from '@polkadot/util';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedWindow } from '@polkadot/extension-inject/types';
import { APPNAME } from '~src/global/appName';
import queueNotification from '~src/ui-components/QueueNotification';
import { IBeneficiary, NotificationStatus } from '~src/types';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { blake2AsHex } from '@polkadot/util-crypto';
import { HexString } from '@polkadot/util/types';
import { LoadingOutlined } from '@ant-design/icons';
import { chainProperties } from '~src/global/networkConstants';
import { formatedBalance } from '~src/util/formatedBalance';
import { useCurrentBlock } from '~src/hooks';
import { Proposal } from '@polkadot/types/interfaces';
import { ApiPromise } from '@polkadot/api';
import Balance from '../Balance';
import { inputToBn } from '~src/util/inputToBn';
import { Bytes } from '@polkadot/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IPreimageData } from 'pages/api/v1/preimages/latest';
import _ from 'lodash';
import { poppins } from 'pages/_app';
import executeTx from '~src/util/executeTx';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { trackEvent } from 'analytics';

const BalanceInput = dynamic(() => import('~src/ui-components/BalanceInput'), {
	ssr: false
});

const ZERO_BN = new BN(0);
const EMPTY_HASH = blake2AsHex('');

interface Props {
	className?: string;
	isPreimage: boolean | null;
	setIsPreimage: (pre: boolean) => void;
	preimageHash: string;
	setPreimageHash: (pre: string) => void;
	setSteps: (pre: ISteps) => void;
	proposerAddress: string;
	beneficiaryAddresses: IBeneficiary[];
	dispatchBeneficiaryAddresses: React.Dispatch<EBeneficiaryAddressesAction>;
	fundingAmount: BN;
	setFundingAmount: (pre: BN) => void;
	selectedTrack: string;
	setSelectedTrack: (pre: string) => void;
	enactment: IEnactment;
	setEnactment: (pre: IEnactment) => void;
	setPreimage: (pre: IPreimage) => void;
	preimage: IPreimage | undefined;
	form: FormInstance;
	preimageLength: number | null;
	setPreimageLength: (pre: number | null) => void;
	availableBalance: BN;
	setAvailableBalance: (pre: BN) => void;
	isUpdatedAvailableBalance: boolean;
}

interface IAdvancedDetails {
	afterNoOfBlocks: BN | null;
	atBlockNo: BN | null;
}

const CreatePreimage = ({
	className,
	isPreimage,
	setIsPreimage,
	setSteps,
	preimageLength,
	setPreimageLength,
	preimageHash,
	setPreimageHash,
	fundingAmount,
	setFundingAmount,
	selectedTrack,
	setSelectedTrack,
	proposerAddress,
	beneficiaryAddresses,
	dispatchBeneficiaryAddresses,
	enactment,
	setEnactment,
	setPreimage,
	availableBalance,
	setAvailableBalance,
	isUpdatedAvailableBalance,
	form
}: Props) => {
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const [preimageCreated, setPreimageCreated] = useState<boolean>(false);
	const [preimageLinked, setPreimageLinked] = useState<boolean>(false);
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [addressAlert, setAddressAlert] = useState<boolean>(false);
	const [openAdvanced, setOpenAdvanced] = useState<boolean>(false);
	const [validBeneficiaryAddress, setValidBeneficiaryAddress] = useState<boolean>(false);
	const [inputAmountValue, setInputAmountValue] = useState<string>('0');
	const [txFee, setTxFee] = useState(ZERO_BN);
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [currentTokenPrice, setCurrentTokenPrice] = useState({
		isLoading: true,
		value: ''
	});
	const [loading, setLoading] = useState<boolean>(false);
	const currentBlock = useCurrentBlock();
	const currentUser = useUserDetailsSelector();

	const checkPreimageHash = (preimageLength: number | null, preimageHash: string) => {
		if (!preimageHash || preimageLength === null) return false;
		return !isHex(preimageHash, 256) || !preimageLength || preimageLength === 0;
	};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const invalidPreimageHash = useCallback(() => checkPreimageHash(preimageLength, preimageHash), [preimageHash, preimageLength]);

	const [advancedDetails, setAdvancedDetails] = useState<IAdvancedDetails>({ afterNoOfBlocks: BN_HUNDRED, atBlockNo: BN_ONE });

	const trackArr: string[] = [];
	const maxSpendArr: { track: string; maxSpend: number }[] = [];
	const [gasFee, setGasFee] = useState(ZERO_BN);
	const baseDeposit = new BN(`${chainProperties[network]?.preImageBaseDeposit}` || 0);

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

	const getPreimageTxFee = (isPreimageVal?: boolean, selectedTrackVal?: string, fundingAmountVal?: BN, latestBenefeciaries?: IBeneficiary[]) => {
		const txSelectedTrack = selectedTrackVal || selectedTrack;
		const txFundingAmount = fundingAmountVal || fundingAmount;
		latestBenefeciaries = latestBenefeciaries || beneficiaryAddresses;

		//validate beneficiaryAddresses
		if (
			!latestBenefeciaries.length ||
			latestBenefeciaries.find(
				(beneficiary) => !beneficiary.address || isNaN(Number(beneficiary.amount)) || Number(beneficiary.amount) <= 0 || !getEncodedAddress(beneficiary.address, network)
			)
		) {
			return;
		}

		if (!api || !apiReady || !latestBenefeciaries.length || !txSelectedTrack) return;
		setShowAlert(false);
		if (isPreimageVal || isPreimage || !proposerAddress || !txFundingAmount || txFundingAmount.lte(ZERO_BN) || txFundingAmount.eq(ZERO_BN)) return;

		const txArr: any[] = [];

		latestBenefeciaries.forEach((beneficiary) => {
			if (beneficiary.address && beneficiary.amount && getEncodedAddress(beneficiary.address, network) && Number(beneficiary.amount) > 0) {
				const [balance] = inputToBn(`${beneficiary.amount}`, network, false);
				txArr.push(api?.tx?.treasury?.spend(balance.toString(), beneficiary.address));
			}
		});

		(async () => {
			await form.validateFields();
			const info = await (txArr.length > 1 ? api.tx.utility.batchAll(txArr).paymentInfo(proposerAddress) : txArr[0].paymentInfo(proposerAddress));
			const gasFee: BN = new BN(info.partialFee);
			setGasFee(gasFee);
			setTxFee(gasFee.add(baseDeposit));
			setShowAlert(true);
		})();
	};

	const handleStateChange = (createPreimageForm: any) => {
		setSteps({ percent: 20, step: 1 });

		setAdvancedDetails({ ...advancedDetails, atBlockNo: currentBlock?.add(BN_THOUSAND) || BN_ONE });
		const [balance, isValid] = inputToBn(`${isNaN(Number(createPreimageForm?.fundingAmount)) ? 0 : createPreimageForm?.fundingAmount}`, network, false);

		if (isValid) {
			if (createPreimageForm.isPreimage) {
				const bnBalance = new BN(isNaN(Number(createPreimageForm?.fundingAmount)) ? 0 : createPreimageForm?.fundingAmount);
				setFundingAmount(bnBalance);
			} else {
				setFundingAmount(balance);
			}
		} else {
			setFundingAmount(ZERO_BN);
		}
		setInputAmountValue(createPreimageForm?.fundingAmount);
		setPreimageHash(createPreimageForm?.preimageHash || '');
		setPreimageLength(createPreimageForm?.preimageLength || null);

		dispatchBeneficiaryAddresses({
			payload: {
				address: '',
				amount: '',
				index: 0,
				newState: createPreimageForm?.beneficiaryAddresses || INIT_BENEFICIARIES
			},
			type: EBeneficiaryAddressesActionType.REPLACE_STATE
		});

		setEnactment(createPreimageForm?.enactment || { key: EEnactment.After_No_Of_Blocks, value: BN_HUNDRED });
		setSelectedTrack(createPreimageForm?.selectedTrack || '');

		form.setFieldValue('preimage_hash', createPreimageForm?.preimageHash || '');
		form.setFieldValue('preimage_length', createPreimageForm?.preimageLength || 0);
		form.setFieldValue('funding_amount', createPreimageForm?.fundingAmount);
		form.setFieldValue('at_block', currentBlock?.add(BN_THOUSAND) || BN_ONE);

		((createPreimageForm?.beneficiaryAddresses || INIT_BENEFICIARIES) as IBeneficiary[]).forEach((beneficiary, index) => {
			form.setFieldValue(`address-${index}`, beneficiary.address || '');
			form.setFieldValue(`balance-${index}`, beneficiary.amount || ZERO_BN);
		});

		if (
			createPreimageForm.preimageHash &&
			createPreimageForm.preimageLength &&
			createPreimageForm.beneficiaryAddress &&
			createPreimageForm?.fundingAmount &&
			createPreimageForm?.selectedTrack
		) {
			setSteps({ percent: 100, step: 1 });
		}
		if (createPreimageForm.beneficiaryAddress && createPreimageForm?.fundingAmount && createPreimageForm?.selectedTrack) {
			setSteps({ percent: 100, step: 1 });
			const bnBalance = new BN(isNaN(Number(createPreimageForm?.fundingAmount)) ? 0 : createPreimageForm?.fundingAmount);
			getPreimageTxFee(createPreimageForm.isPreimage, createPreimageForm?.selectedTrack, createPreimageForm.isPreimage ? bnBalance : balance);
		}

		if (createPreimageForm?.enactment) {
			setOpenAdvanced(true);
			form.setFieldValue(createPreimageForm?.enactment?.key === EEnactment.At_Block_No ? 'at_block' : 'after_blocks', createPreimageForm?.enactment?.value || null);
		}
	};

	const handleSelectTrack = (fundingAmount: BN, isPreimage: boolean) => {
		let selectedTrack = '';

		for (const i in maxSpendArr) {
			const [maxSpend] = inputToBn(String(maxSpendArr[i].maxSpend), network, false);
			if (maxSpend.gte(fundingAmount)) {
				selectedTrack = maxSpendArr[i].track;
				setSelectedTrack(maxSpendArr[i].track);
				onChangeLocalStorageSet({ selectedTrack: maxSpendArr[i].track }, Boolean(isPreimage));
				break;
			}
		}

		return selectedTrack;
	};

	useEffect(() => {
		form.setFieldValue('at_block', currentBlock?.add(BN_THOUSAND) || BN_ONE);
		let data: any = localStorage.getItem('treasuryProposalData');
		data = JSON.parse(data);
		if (data && data?.createPreimageForm) {
			const isPreimage = data?.isPreimage;
			setIsPreimage(isPreimage);
			setSteps({ percent: 20, step: 1 });
			const createPreimageForm = data?.createPreimageForm?.[!isPreimage ? 'withoutPreimageForm' : 'withPreimageForm'];
			handleStateChange(createPreimageForm);
			if (data.preimageCreated) setPreimageCreated(data.preimageCreated);
			if (data.preimageLinked) setPreimageLinked(data.preimageLinked);
		}
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
		GetCurrentTokenPrice(network, setCurrentTokenPrice);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const onChangeLocalStorageSet = (changedKeyValueObj: any, isPreimage: boolean, preimageCreated?: boolean, preimageLinked?: boolean, isPreimageStateChange?: boolean) => {
		setTxFee(ZERO_BN);
		let data: any = localStorage.getItem('treasuryProposalData');
		if (data) {
			data = JSON.parse(data);
		}

		const createPreimageFormKey = !isPreimage ? 'withoutPreimageForm' : 'withPreimageForm';
		const createPreimageFormData = data?.createPreimageForm || {};
		const createPreimageKeysData = data?.createPreimageForm?.[createPreimageFormKey] || {};
		localStorage.setItem(
			'treasuryProposalData',
			JSON.stringify({
				...data,
				createPreimageForm: {
					...createPreimageFormData,
					[createPreimageFormKey]: { ...createPreimageKeysData, ...changedKeyValueObj }
				},
				isPreimage: isPreimage,
				preimageCreated: Boolean(preimageCreated),
				preimageLinked: Boolean(preimageLinked),
				step: 0
			})
		);

		if (isPreimageStateChange) {
			handleStateChange(createPreimageKeysData || {});
			setAdvancedDetails({ ...advancedDetails, atBlockNo: currentBlock?.add(BN_THOUSAND) || BN_ONE });
			form.setFieldValue('at_block', currentBlock?.add(BN_THOUSAND) || BN_ONE);
			if (data.preimageCreated) setPreimageCreated(data.preimageCreated);
			if (data.preimageLinked) setPreimageLinked(data.preimageLinked);
			setOpenAdvanced(false);
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

		return {
			encodedProposal,
			notePreimageTx,
			preimageHash,
			preimageLength,
			storageFee
		};
	};

	const getPreimage = async () => {
		if (!api || !apiReady) return;

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

		const txArr: any[] = [];

		beneficiaryAddresses.forEach((beneficiary) => {
			const [balance] = inputToBn(`${beneficiary.amount}`, network, false);
			if (beneficiary.address && !isNaN(Number(beneficiary.amount)) && getEncodedAddress(beneficiary.address, network) && Number(beneficiary.amount) > 0) {
				txArr.push(api?.tx?.treasury?.spend(balance.toString(), beneficiary.address));
			}
		});

		const proposal = txArr.length > 1 ? api.tx.utility.batchAll(txArr) : txArr[0];
		const preimage: any = getState(api, proposal);
		setLoading(true);
		const onSuccess = () => {
			setPreimage(preimage);
			setPreimageHash(preimage.preimageHash);
			setPreimageLength(preimage.preimageLength);
			setPreimageCreated(true);
			onChangeLocalStorageSet(
				{ beneficiaryAddresses: INIT_BENEFICIARIES, preimageCreated: true, preimageHash: preimage.preimageHash, preimageLength: preimage.preimageLength },
				Boolean(isPreimage),
				true
			);
			setLoading(false);
			setSteps({ percent: 100, step: 2 });
		};

		const onFailed = () => {
			queueNotification({
				header: 'failed!',
				message: 'Transaction failed!',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		};

		setLoading(true);
		await executeTx({ address: proposerAddress, api, apiReady, errorMessageFallback: 'failed.', network, onFailed, onSuccess, tx: preimage?.notePreimageTx });
	};

	const handleSubmit = async () => {
		// GAEvent for create preImage CTA clicked
		trackEvent('create_preImage_cta_clicked', 'clicked_create_preImage', {
			isWeb3Login: currentUser?.web3signup,
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});

		//validate beneficiaryAddresses and fundingAmount for each beneficiary
		let areBeneficiaryAddressesValid = true;
		for (const beneficiary in beneficiaryAddresses) {
			if (
				!beneficiaryAddresses[beneficiary].address ||
				isNaN(Number(beneficiaryAddresses[beneficiary].amount)) ||
				!getEncodedAddress(beneficiaryAddresses[beneficiary].address, network) ||
				Number(beneficiaryAddresses[beneficiary].amount) <= 0
			) {
				areBeneficiaryAddressesValid = false;
				setValidBeneficiaryAddress(false);
				return;
			}
		}

		if (!areBeneficiaryAddressesValid) return;

		if (!isPreimage) {
			if (txFee.gte(availableBalance)) return;
		}
		await form.validateFields();
		if (isPreimage) onChangeLocalStorageSet({ preimageLinked: true }, Boolean(isPreimage), preimageCreated, true);

		if (!isPreimage ? preimageCreated : preimageLinked) {
			setSteps({ percent: 100, step: 2 });
		} else {
			if (!isPreimage) {
				await getPreimage();
			} else if (preimageLength !== 0 && beneficiaryAddresses[0]?.address?.length > 0 && fundingAmount.gt(ZERO_BN)) {
				setSteps({ percent: 100, step: 2 });
			}
			setEnactment({ ...enactment, value: enactment.key === EEnactment.At_Block_No ? advancedDetails?.atBlockNo : advancedDetails?.afterNoOfBlocks });
		}
	};

	const getExistPreimageDataFromPolkadot = async (preimageHash: string, isPreimage: boolean) => {
		if (!api || !apiReady) return;

		const lengthObj = await api?.query?.preimage?.statusFor(preimageHash);

		const length = JSON.parse(JSON.stringify(lengthObj))?.unrequested?.len || 0;
		checkPreimageHash(length, preimageHash);
		setPreimageLength(length);
		form.setFieldValue('preimage_length', length);
		onChangeLocalStorageSet({ preimageLength: length || '' }, Boolean(isPreimage));

		const preimageRaw: any = await api?.query?.preimage?.preimageFor([preimageHash, length]);
		const preimage = preimageRaw.unwrapOr(null);
		if (!preimage) {
			console.log('Error in unwraping preimage');
			return;
		}

		const constructProposal = function (api: ApiPromise, bytes: Bytes): Proposal | undefined {
			let proposal: Proposal | undefined;

			try {
				proposal = api.registry.createType('Proposal', bytes.toU8a(true));
			} catch (error) {
				console.log(error);
			}

			return proposal;
		};

		try {
			const proposal = constructProposal(api, preimage);
			if (proposal) {
				const params = proposal?.meta ? proposal?.meta.args.filter(({ type }): boolean => type.toString() !== 'Origin').map(({ name }) => name.toString()) : [];

				const values = proposal?.args;
				const preImageArguments =
					proposal?.args &&
					params &&
					params.map((name, index) => {
						return {
							name,
							value: values?.[index]?.toString()
						};
					});
				if (preImageArguments && proposal.section === 'treasury' && proposal?.method === 'spend') {
					const balance = new BN(preImageArguments[0].value || '0') || ZERO_BN;

					const newBeneficiaryAddress = {
						address: preImageArguments[1].value,
						amount: balance.toString()
					};

					dispatchBeneficiaryAddresses({
						payload: {
							address: newBeneficiaryAddress.address,
							amount: newBeneficiaryAddress.amount,
							index: 0
						},
						type: EBeneficiaryAddressesActionType.REPLACE_ALL_WITH_ONE
					});

					setFundingAmount(balance);
					onChangeLocalStorageSet({ beneficiaryAddresses: [newBeneficiaryAddress] || '', fundingAmount: balance.toString() }, Boolean(isPreimage));
					setSteps({ percent: 100, step: 1 });
					handleSelectTrack(balance, isPreimage);
				} else {
					setPreimageLength(0);
					queueNotification({
						header: 'Incorrect Preimage Added!',
						message: 'Please enter a preimage for a treasury related track.',
						status: NotificationStatus.ERROR
					});
				}
			} else {
				queueNotification({
					header: 'Failed!',
					message: `Incorrect preimage for ${network} network.`,
					status: NotificationStatus.ERROR
				});
			}
		} catch (error) {
			queueNotification({
				header: 'Failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
		}
	};

	const existPreimageData = async (preimageHash: string, isPreimage: boolean) => {
		setPreimageLength(0);
		form.setFieldValue('preimage_length', 0);
		if (!api || !apiReady || !isHex(preimageHash, 256) || preimageHash?.length < 0) return;
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IPreimageData>(`api/v1/preimages/latest?hash=${preimageHash}`);

		if (data && !data?.message) {
			if (data.section === 'Treasury' && data.method === 'spend' && data.hash === preimageHash) {
				if (!data.proposedCall.args && !data?.proposedCall?.args?.beneficiary && !data?.proposedCall?.args?.amount) {
					console.log('fetching data from polkadotjs');
					getExistPreimageDataFromPolkadot(preimageHash, Boolean(isPreimage));
				} else {
					console.log('fetching data from subsquid');
					form.setFieldValue('preimage_length', data?.length);

					const balance = new BN(data?.proposedCall?.args?.amount || '0') || ZERO_BN;

					const newBeneficiaryAddress = {
						address: data?.proposedCall?.args?.beneficiary,
						amount: balance.toString()
					};

					dispatchBeneficiaryAddresses({
						payload: {
							address: newBeneficiaryAddress.address,
							amount: newBeneficiaryAddress.amount,
							index: 0
						},
						type: EBeneficiaryAddressesActionType.REPLACE_ALL_WITH_ONE
					});

					setFundingAmount(balance);
					setPreimageLength(data.length);
					form.setFieldValue('preimage_length', data.length);
					onChangeLocalStorageSet(
						{ beneficiaryAddresses: [newBeneficiaryAddress] || [], fundingAmount: balance.toString(), preimageLength: data?.length || '' },
						Boolean(isPreimage)
					);
					//select track
					handleSelectTrack(balance, isPreimage);

					setSteps({ percent: 100, step: 1 });
				}
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
			getExistPreimageDataFromPolkadot(preimageHash, Boolean(isPreimage));
		}
		setLoading(false);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debounceExistPreimageFn = useCallback(_.debounce(existPreimageData, 2000), []);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debounceGetPreimageTxFee = useCallback(_.debounce(getPreimageTxFee, 500), []);

	const handlePreimageHash = (preimageHash: string, isPreimage: boolean) => {
		if (!preimageHash || preimageHash.length === 0) return;
		setSteps({ percent: 60, step: 1 });
		debounceExistPreimageFn(preimageHash, isPreimage);
		setPreimageHash(preimageHash);
		onChangeLocalStorageSet({ preimageHash: preimageHash }, Boolean(isPreimage));
		setPreimageCreated(false);
		setPreimageLinked(false);
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
			onChangeLocalStorageSet({ enactment: { ...enactment, value: bnValue.toString() } }, Boolean(isPreimage));
		} catch (error) {
			console.log(error);
		}
		setPreimageCreated(false);
		setPreimageLinked(false);
	};

	const handleBeneficiaryAddresschange = (address: string, index: number) => {
		dispatchBeneficiaryAddresses({
			payload: {
				address,
				amount: '',
				index
			},
			type: EBeneficiaryAddressesActionType.UPDATE_ADDRESS
		});

		setPreimageCreated(false);
		setPreimageLinked(false);
		!isPreimage && onChangeLocalStorageSet({ beneficiaryAddresses: beneficiaryAddresses }, Boolean(isPreimage));
		setSteps({ percent: fundingAmount.gt(ZERO_BN) && address?.length > 0 ? 100 : 60, step: 1 });
		if (address.length > 0) {
			(getEncodedAddress(address, network) || Web3.utils.isAddress(address)) && address !== getEncodedAddress(address, network) && setAddressAlert(true);
		}
		setTimeout(() => {
			setAddressAlert(false);
		}, 5000);
	};

	const handleOnAvailableBalanceChange = (balanceStr: string) => {
		let balance = ZERO_BN;

		try {
			balance = new BN(balanceStr);
		} catch (err) {
			console.log(err);
		}
		setAvailableBalance(balance);
	};

	const handleFundingAmountChange = (fundingAmount: BN) => {
		setPreimageCreated(false);
		setPreimageLinked(false);
		setSteps({ percent: beneficiaryAddresses[0]?.address?.length > 0 && fundingAmount.gt(ZERO_BN) ? 100 : 60, step: 1 });
	};

	const handleInputValueChange = (input: string, index: number) => {
		if (isNaN(Number(input))) return;

		dispatchBeneficiaryAddresses({
			payload: {
				address: '',
				amount: input,
				index
			},
			type: EBeneficiaryAddressesActionType.UPDATE_AMOUNT
		});

		let totalAmt = 0;

		const latestBenefeciaries = beneficiaryAddresses.map((beneficiary, i) => {
			if (index === i) {
				totalAmt += Number(input);
				return { ...beneficiary, amount: input };
			} else {
				totalAmt += Number(beneficiary.amount);
			}
			return beneficiary;
		});

		totalAmt = Number(totalAmt.toFixed(6));

		setInputAmountValue(totalAmt.toString());
		form.setFieldValue('funding_amount', totalAmt.toString());
		onChangeLocalStorageSet({ beneficiaryAddresses: latestBenefeciaries, fundingAmount: totalAmt.toString() }, Boolean(isPreimage));

		const [fundingAmt] = inputToBn(totalAmt.toString(), network, false);
		setFundingAmount(fundingAmt);

		const selectedTrack = handleSelectTrack(fundingAmt, Boolean(isPreimage));
		debounceGetPreimageTxFee(Boolean(isPreimage), selectedTrack, fundingAmt, latestBenefeciaries);
	};

	const addBeneficiary = () => {
		dispatchBeneficiaryAddresses({
			payload: {
				address: '',
				amount: '',
				index: beneficiaryAddresses.length
			},
			type: EBeneficiaryAddressesActionType.ADD
		});
	};

	const removeAllBeneficiaries = () => {
		dispatchBeneficiaryAddresses({
			payload: {
				address: '',
				amount: '',
				index: 0
			},
			type: EBeneficiaryAddressesActionType.REMOVE_ALL
		});

		form.resetFields();

		setInputAmountValue('0');
		form.setFieldValue('funding_amount', '0');
		handleSelectTrack(ZERO_BN, Boolean(isPreimage));
	};

	const fundingAmtToBN = () => {
		const [fundingAmt] = inputToBn(inputAmountValue || '0', network, false);
		return fundingAmt;
	};

	return (
		<Spin
			spinning={loading}
			indicator={<LoadingOutlined />}
		>
			<div className={`${className} create-preimage`}>
				<div className='my-8 flex flex-col'>
					<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Do you have an existing preimage? </label>
					<Radio.Group
						onChange={(e) => {
							setIsPreimage(e.target.value);
							onChangeLocalStorageSet({ isPreimage: e.target.value }, e.target.value, preimageCreated, preimageLinked, true);
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
				<Form
					form={form}
					disabled={loading}
					onFinish={handleSubmit}
					initialValues={{
						after_blocks: String(advancedDetails.afterNoOfBlocks?.toString()),
						at_block: String(advancedDetails.atBlockNo?.toString()),
						preimage_hash: preimageHash,
						preimage_length: preimageLength || 0,
						proposer_address: proposerAddress
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
										className='h-[40px] rounded-[4px] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
										value={preimageHash}
										onChange={(e) => handlePreimageHash(e.target.value, Boolean(isPreimage))}
									/>
								</Form.Item>
								{invalidPreimageHash() && !loading && <span className='text-sm text-[#ff4d4f]'>Invalid Preimage hash</span>}
							</div>
							<div className='mt-6'>
								<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Preimage Length</label>
								<Form.Item name='preimage_length'>
									<Input
										name='preimage_length'
										className='h-[40px] rounded-[4px] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
										onChange={(e) => {
											setPreimageLength(Number(e.target.value));
											onChangeLocalStorageSet({ preimageLength: e.target.value }, isPreimage);
										}}
										disabled
									/>
								</Form.Item>
							</div>
						</>
					)}
					{isPreimage === false && (
						<>
							{txFee.gte(availableBalance) && !txFee.eq(ZERO_BN) && (
								<Alert
									type='error'
									className={`mt-6 h-10 rounded-[4px] text-bodyBlue dark:border-[#5C3931] dark:bg-[#331701] dark:text-blue-dark-high ${poppins.variable} ${poppins.className}`}
									showIcon
									message={<span className='text-[13px] dark:text-blue-dark-high'>Insufficient available balance.</span>}
								/>
							)}
							<div className='mt-6'>
								<div className='mt-6 flex items-center justify-between text-lightBlue dark:text-blue-dark-medium'>
									Proposer Address
									<span>
										<Balance
											isBalanceUpdated={isUpdatedAvailableBalance}
											address={proposerAddress}
											onChange={handleOnAvailableBalanceChange}
										/>
									</span>
								</div>
								<AddressInput
									name='proposer_address'
									defaultAddress={proposerAddress}
									onChange={() => setLoading(false)}
									inputClassName={' font-normal text-sm h-[40px]'}
									className='-mt-6 text-sm font-normal text-lightBlue dark:text-blue-dark-medium'
									disabled
									size='large'
									identiconSize={30}
								/>
							</div>

							{beneficiaryAddresses.map((beneficiary, index) => {
								return (
									<div
										key={index}
										className='flex items-center justify-center gap-3'
									>
										<div className='w-9/12'>
											<AddressInput
												name={`address-${index}`}
												defaultAddress={beneficiary.address}
												label={`${`Beneficiary Address ${beneficiaryAddresses.length > 1 ? index + 1 : ''}`}`}
												placeholder='Add beneficiary address'
												className='text-sm font-normal text-lightBlue dark:text-blue-dark-medium'
												onChange={(address) => handleBeneficiaryAddresschange(address, index)}
												helpText='The amount requested in the proposal will be received in this address.'
												size='large'
												identiconSize={30}
												inputClassName={'font-normal text-sm h-[40px]'}
												skipFormatCheck={true}
												checkValidAddress={setValidBeneficiaryAddress}
											/>

											{beneficiary.address
												? !(getEncodedAddress(beneficiary.address, network) || Web3.utils.isAddress(beneficiary.address)) && (
														<span className='-mt-6 text-sm text-[#ff4d4f]'>Invalid Address</span>
												  )
												: null}
										</div>
										<div className='-mb-[69px]'>
											<BalanceInput
												formItemName={`balance-${index}`}
												address={proposerAddress}
												placeholder='Split amount'
												setInputValue={(input: string) => handleInputValueChange(input, index)}
												onChange={handleFundingAmountChange}
												theme={theme}
											/>
										</div>
									</div>
								);
							})}

							<div className='flex items-center justify-between'>
								<Button
									type='text'
									className='mt-2 flex items-center text-xs text-[#407BFF]'
									size='small'
									onClick={addBeneficiary}
								>
									<PlusCircleOutlined />
									Add Beneficiary
								</Button>

								<Button
									type='text'
									className='mt-2 flex items-center text-xs text-red-light-text dark:text-red-dark-text'
									size='small'
									onClick={removeAllBeneficiaries}
								>
									<MinusCircleOutlined />
									Remove All
								</Button>
							</div>

							{addressAlert && (
								<Alert
									className='mt-2 dark:border-[#125798] dark:bg-[#05263F]'
									showIcon
									type='info'
									message={<span className='text-[13px] dark:text-blue-dark-high'>The substrate address has been changed to {network} network address.</span>}
								/>
							)}
							<div className='-mb-6 mt-6'>
								<div className='mb-[2px] flex items-center justify-between text-sm text-lightBlue dark:text-blue-dark-medium'>
									<label>
										Funding Amount{' '}
										<span>
											<HelperTooltip
												text='Amount requested by the proposer.'
												className='ml-1'
											/>
										</span>
									</label>
									<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>
										Current Value: <span className='text-pink_primary'>{Math.floor(Number(inputAmountValue) * Number(currentTokenPrice.value) || 0)} USD</span>
									</span>
								</div>
								<BalanceInput
									address={proposerAddress}
									placeholder='Add funding amount'
									formItemName='funding_amount'
									theme={theme}
									balance={fundingAmtToBN()}
									disabled={true}
								/>
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
										onChangeLocalStorageSet({ selectedTrack: track }, isPreimage);
										getPreimageTxFee();
										setSteps({ percent: 100, step: 1 });
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
									onChangeLocalStorageSet(
										{ enactment: { key: e.target.value, value: form.getFieldValue(e.target.value === EEnactment.At_Block_No ? 'at_block' : 'after_blocks').toString() } },
										Boolean(isPreimage)
									);
								}}
							>
								<Radio
									value={EEnactment.At_Block_No}
									className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'
								>
									<div className='flex h-[40px] items-center gap-2'>
										<span className='w-[150px]'>
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
														className='w-[100px] rounded-[4px] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
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
														className='w-[100px] rounded-[4px] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
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
					{showAlert && !isPreimage && !txFee.eq(ZERO_BN) && (
						<Alert
							type='info'
							className='mt-6 rounded-[4px] text-bodyBlue dark:border-[#125798] dark:bg-[#05263F]'
							showIcon
							description={
								<span className='text-xs dark:text-blue-dark-high'>
									Gas Fees of {formatedBalance(String(gasFee.toString()), unit)} {unit} will be applied to create preimage.
								</span>
							}
							message={
								<span className='text-[13px] dark:text-blue-dark-high'>
									{formatedBalance(String(baseDeposit.toString()), unit)} {unit} Base deposit is required to create a preimage.
								</span>
							}
						/>
					)}
					<div className='-mx-6 mt-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-[#D2D8E0] px-6 pt-4 dark:border-[#3B444F]'>
						<Button
							onClick={() => setSteps({ percent: 100, step: 0 })}
							className='h-[40px] w-[155px] rounded-[4px] border-pink_primary text-sm font-medium tracking-[0.05em] text-pink_primary dark:bg-transparent'
						>
							Back
						</Button>
						<Button
							htmlType='submit'
							className={`h-[40px] w-[165px] rounded-[4px] bg-pink_primary text-center text-sm font-medium tracking-[0.05em] text-white ${
								(isPreimage !== null && !isPreimage
									? !(
											!beneficiaryAddresses.find((beneficiary) => !beneficiary.address || isNaN(Number(beneficiary.amount)) || Number(beneficiary.amount) <= 0) &&
											validBeneficiaryAddress &&
											fundingAmount &&
											selectedTrack &&
											!txFee.gte(availableBalance) &&
											!txFee.eq(ZERO_BN) &&
											!loading
									  )
									: preimageHash?.length === 0 || invalidPreimageHash()) && 'opacity-50'
							}`}
							disabled={
								isPreimage !== null && !isPreimage
									? !(
											!beneficiaryAddresses.find((beneficiary) => !beneficiary.address || isNaN(Number(beneficiary.amount)) || Number(beneficiary.amount) <= 0) &&
											validBeneficiaryAddress &&
											fundingAmount &&
											selectedTrack &&
											!txFee.gte(availableBalance) &&
											!txFee.eq(ZERO_BN) &&
											!loading
									  )
									: preimageHash?.length === 0 || invalidPreimageHash()
							}
						>
							{isPreimage ? (preimageLinked ? 'Next' : 'Link Preimage') : preimageCreated ? 'Next' : 'Create Preimage'}
						</Button>
					</div>
				</Form>
			</div>
		</Spin>
	);
};

export default styled(CreatePreimage)`
	.down-icon {
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	}
	.preimage .ant-form-item {
		margin-bottom: 0px !important;
	}
	.enactment .ant-form-item .ant-form-item-control {
		flex-direction: row !important;
		gap: 6px !important;
	}
	.ant-alert-with-description {
		padding-block: 15px !important;
	}
	.ant-alert-with-description .ant-alert-icon {
		font-size: 18px !important;
		margin-top: 4px;
	}

	.ant-alert-with-description .ant-alert-description {
		color: black !important;
	}
`;
