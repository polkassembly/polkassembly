import { Divider, Modal, Checkbox, Input, Radio, Form } from 'antd';
import { poppins } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { CloseIcon, ProxyIcon } from '~src/ui-components/CustomIcons';
import BN from 'bn.js';
import DownArrow from '~assets/icons/down-icon.svg';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useInitialConnectAddress, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { EEnactment, IEnactment } from '../OpenGovTreasuryProposal';
import { IAdvancedDetails } from '../OpenGovTreasuryProposal/CreatePreimage';
import { BN_HUNDRED, BN_ONE } from '@polkadot/util';
import { useCurrentBlock } from '~src/hooks';
import { formatedBalance } from '~src/util/formatedBalance';
import Alert from '~src/basic-components/Alert';
import { chainProperties } from '~src/global/networkConstants';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { useApiContext } from '~src/context';
import { LoadingStatusType, NotificationStatus, Wallet } from '~src/types';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { useTheme } from 'next-themes';
import Select from '~src/basic-components/Select';
import queueNotification from '~src/ui-components/QueueNotification';
import executeTx from '~src/util/executeTx';

interface Props {
	openModal: boolean;
	setOpenModal: (pre: boolean) => void;
	className: string;
}

const ZERO_BN = new BN(0);

const CreateProxyMainModal = ({ openModal, setOpenModal, className }: Props) => {
	const { network } = useNetworkSelector();
	const userDetails = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();
	const { api, apiReady } = useApiContext();
	const { availableBalance } = useInitialConnectAddress();
	const availableBalanceBN = new BN(availableBalance || '0');
	const { loginAddress, loginWallet } = userDetails;
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [form] = Form.useForm();
	const [createPureProxy, setCreatePureProxy] = useState<boolean>(false);
	const [openAdvanced, setOpenAdvanced] = useState<boolean>(true);
	const [advancedDetails, setAdvancedDetails] = useState<IAdvancedDetails>({ afterNoOfBlocks: BN_HUNDRED, atBlockNo: BN_ONE });
	const [gasFee, setGasFee] = useState(ZERO_BN);
	const [enactment, setEnactment] = useState<IEnactment>({ key: EEnactment.After_No_Of_Blocks, value: BN_HUNDRED });
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [wallet, setWallet] = useState<Wallet>();
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const [proxyAddress, setProxyAddress] = useState<string>('');
	const [proxyType, setProxyType] = useState<any>('Any');
	const [address, setAddress] = useState<string>('');
	const onAccountChange = (address: string) => setAddress(address);
	const currentBlock = useCurrentBlock();

	useEffect(() => {
		if (!api || !apiReady) return;
		if (loginWallet) {
			setWallet(loginWallet);
			(async () => {
				setLoadingStatus({ isLoading: true, message: 'Awaiting accounts' });
				const accountsData = await getAccountsFromWallet({ api, apiReady, chosenWallet: loginWallet, loginAddress, network });
				setAccounts(accountsData?.accounts || []);
				onAccountChange(accountsData?.account || '');
				setLoadingStatus({ isLoading: false, message: '' });
			})();
		} else {
			if (!window) return;
			const loginWallet = localStorage.getItem('loginWallet');
			if (loginWallet) {
				setWallet(loginWallet as Wallet);
				(async () => {
					const accountsData = await getAccountsFromWallet({ api, apiReady, chosenWallet: loginWallet as Wallet, loginAddress, network });
					setAccounts(accountsData?.accounts || []);
					onAccountChange(accountsData?.account || '');
				})();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userDetails]);

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

	const handleSubmit = async () => {
		setLoadingStatus({ isLoading: true, message: 'Awaiting Transaction' });
		if (!api || !apiReady || !proxyType) {
			return;
		}
		let txn;
		if (createPureProxy) {
			txn = api.tx.proxy.createPure(proxyType as any, 100, 12);
		}
		if (proxyAddress && !createPureProxy) {
			txn = api.tx.proxy.addProxy(proxyAddress, proxyType as any, 100);
		}
		if (!txn) return;
		const { partialFee: txGasFee } = (await txn.paymentInfo(loginAddress)).toJSON();
		setGasFee(new BN(String(txGasFee)));

		const onFailed = (message: string) => {
			setLoadingStatus({ isLoading: false, message: 'Awaiting accounts' });
			queueNotification({
				header: 'Failed!',
				message,
				status: NotificationStatus.ERROR
			});
		};

		const onSuccess = async () => {
			setLoadingStatus({ isLoading: false, message: 'Awaiting accounts' });
			queueNotification({
				header: 'Success!',
				message: 'Proposal created successfully.',
				status: NotificationStatus.SUCCESS
			});
			setOpenModal(false);
		};

		await executeTx({
			address: loginAddress,
			api,
			apiReady,
			errorMessageFallback: 'Transaction failed.',
			network,
			onBroadcast: () => setLoadingStatus({ isLoading: true, message: '' }),
			onFailed,
			onSuccess,
			tx: txn
		});
	};

	return (
		<Modal
			title={
				<div>
					<div
						className={`${poppins.variable} ${poppins.className} flex items-center px-[18px] py-4 text-sm font-semibold text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high`}
					>
						<span className='flex items-center gap-x-2 text-xl font-semibold text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary'>
							<ProxyIcon className='userdropdown-icon text-2xl' />
							<span>Proxy</span>
						</span>
					</div>
					<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
				</div>
			}
			open={openModal}
			footer={
				<div className='my-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 py-4 dark:border-[#3B444F] dark:border-separatorDark'>
					<CustomButton
						buttonsize='sm'
						text='Cancel'
						height={40}
						width={145}
						variant='default'
					/>
					<CustomButton
						onClick={handleSubmit}
						disabled={getSubstrateAddress(loginAddress) == getSubstrateAddress(proxyAddress) || availableBalanceBN.lt(gasFee)}
						height={40}
						width={145}
						text='Create Proxy'
						variant='primary'
					/>
				</div>
			}
			zIndex={1008}
			wrapClassName={' dark:bg-modalOverlayDark rounded-[14px]'}
			className={`${className} ${poppins.variable} ${poppins.className} w-[605px] rounded-[14px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => setOpenModal(false)}
			closeIcon={<CloseIcon className=' text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<div className='px-6 py-3'>
				<Form
					form={form}
					disabled={loadingStatus.isLoading}
					initialValues={{ loginAddress: loginAddress }}
					onFinish={handleSubmit}
				>
					<div className=''>
						<AccountSelectionForm
							title='Your Address'
							isTruncateUsername={false}
							accounts={accounts}
							address={loginAddress}
							withBalance={false}
							onAccountChange={onAccountChange}
							className={`${poppins.variable} ${poppins.className} text-sm font-normal text-lightBlue dark:text-blue-dark-medium`}
							inputClassName='rounded-[4px] px-3 py-1'
							withoutInfo={true}
							linkAddressTextDisabled
							theme={theme}
							isVoting
						/>
					</div>
					<div className='mt-5'>
						<AccountSelectionForm
							title='Proxy Address'
							isTruncateUsername={false}
							accounts={accounts}
							address={proxyAddress || loginAddress}
							withBalance={false}
							onAccountChange={(address) => setProxyAddress(address)}
							className={`${poppins.variable} ${poppins.className} text-sm font-normal text-lightBlue dark:text-blue-dark-medium`}
							inputClassName='rounded-[4px] px-3 py-1'
							withoutInfo={true}
							linkAddressTextDisabled
							theme={theme}
							isDisabled={createPureProxy}
							isVoting
						/>
						<div className='mt-1'>
							<Checkbox
								checked={createPureProxy}
								onChange={(e) => setCreatePureProxy(e.target.checked)}
								className='m-0 text-sm text-[#7F8FA4] dark:text-blue-dark-medium'
							>
								Create Pure Proxy
							</Checkbox>
						</div>
					</div>
					<div className='mt-5'>
						<label className='mb-[2px] text-sm text-lightBlue dark:text-blue-dark-medium'>Proxy Type</label>
						<Select
							className='w-full rounded-[4px] py-1'
							style={{ width: '100%' }}
							value={proxyType}
							size='large'
							suffixIcon={<DownArrow className='down-icon absolute right-2 top-[5px]' />}
							onChange={(value) => setProxyType(value)}
							defaultValue={'Any'}
							options={[
								{ value: 'Any', label: 'Any' },
								{ value: 'NonTransfer', label: 'Non Transfer' },
								{ value: 'Governance', label: 'Governance' },
								{ value: 'IdentityJudgement', label: 'Identity Judgment' },
								{ value: 'CancelProxy', label: 'Cancel Proxy' },
								{ value: 'Auction', label: 'Auction' },
								{ value: 'Society', label: 'Society' },
								{ value: 'OnDemandOrdering', label: 'On Demand Ordering' }
							]}
						/>
					</div>
					{proxyType && (
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
							className='mt-6 rounded-[4px] px-4 py-2 text-bodyBlue'
							showIcon
							description={
								<div className='mt-1 p-0 text-xs dark:text-blue-dark-high'>
									Gas Fees of {formatedBalance(String(gasFee.toString()), unit)} {unit} will be applied for this transaction.
								</div>
							}
						/>
					)}
				</Form>
			</div>
		</Modal>
	);
};

export default styled(CreateProxyMainModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
	}
`;
