// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Alert, Button, Form, FormInstance, Input, Radio, Spin } from 'antd';
import BN from 'bn.js';
import { useTheme } from 'next-themes';
import { poppins } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import { ISteps } from '~src/components/OpenGovTreasuryProposal';
import { useApiContext } from '~src/context';
import { chainProperties } from '~src/global/networkConstants';
import { useInitialConnectAddress, useNetworkSelector } from '~src/redux/selectors';
import { IBountyProposerResponse, NotificationStatus } from '~src/types';
import BalanceInput from '~src/ui-components/BalanceInput';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import queueNotification from '~src/ui-components/QueueNotification';
import executeTx from '~src/util/executeTx';
import { formatedBalance } from '~src/util/formatedBalance';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface Props {
	className?: string;
	setSteps: (pre: ISteps) => void;
	isBounty: boolean | null;
	setIsBounty: (pre: boolean) => void;
	form: FormInstance;
	proposerAddress?: string;
}

const ZERO_BN = new BN(0);

const CreateBounty = ({ className, setSteps, isBounty, setIsBounty, form }: Props) => {
	const { network } = useNetworkSelector();
	const { address: linkedAddress, availableBalance } = useInitialConnectAddress();
	const { resolvedTheme: theme } = useTheme();
	const { api, apiReady } = useApiContext();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [bountyId, setBountyId] = useState<number | null>(null);
	const [bountyAmount, setBountyAmount] = useState<BN>(ZERO_BN);
	const [bountyProposer, setBountyProposer] = useState<string | null>(null);
	const [bountyBond, setBountyBond] = useState<BN>(ZERO_BN);
	const [loadingStatus, setLoadingStatus] = useState({ isLoading: false, message: '' });
	const [error, setError] = useState('');

	const fetchBountyProposer = async () => {
		const { data: bountyProposerData, error } = await nextApiClientFetch<IBountyProposerResponse>('/api/v1/bounty/getProposerInfo', {
			bountyId
		});

		if (error || !bountyProposerData || !bountyProposerData?.proposals?.length) {
			console.log('Error in fetching bouny proposer data');
			setBountyAmount(ZERO_BN);
			setError(error || 'Error in fetching bounty proposer data. Please input valid details.');
			return;
		}

		console.log('bountyProposerData: ', bountyProposerData);

		setBountyProposer(bountyProposerData?.proposals[0]?.proposer);

		const amount = new BN(String(bountyProposerData?.proposals[0]?.reward));

		setBountyAmount(amount);

		form.setFieldsValue({
			bounty_amount: amount
		});
	};

	useEffect(() => {
		if (bountyId !== null) {
			fetchBountyProposer();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bountyId]);

	function getBountyBond(title: string, baseBountyDeposit: BN, depositPerByte: BN): BN {
		return baseBountyDeposit.add(depositPerByte.muln(new Blob([title]).size));
	}

	const getBoundyBondValue = () => {
		if (!linkedAddress || !api || !!apiReady) return ZERO_BN;
		const baseBountyDeposit = api.consts.bounties.bountyDepositBase;
		const depositPerByte = api.consts.bounties.dataDepositPerByte;

		const title = 'PA';
		const bountyBondValue = getBountyBond(title, baseBountyDeposit, depositPerByte);
		setBountyBond(bountyBondValue);
	};
	useEffect(() => {
		getBoundyBondValue();
	}, []);

	const handleSubmit = async () => {
		await form.validateFields();

		if (!linkedAddress || !api || !!apiReady) return ZERO_BN;

		const availableBalanceBN = new BN(availableBalance || '0');

		if (availableBalanceBN.lt(bountyBond)) return;

		const title = 'PA';
		try {
			const bountyTx = api.tx.bounties.proposeBounty(bountyAmount, title);
			const bounty_id = Number(await api.query.bounties.bountyCount());

			const onFailed = (message: string) => {
				setLoadingStatus({ isLoading: false, message: '' });
				queueNotification({
					header: 'Failed!',
					message,
					status: NotificationStatus.ERROR
				});
			};

			const onSuccess = async () => {
				localStorage.setItem('bounty_id', bounty_id.toString());
				queueNotification({
					header: 'Success!',
					message: `Proposal #${bounty_id} successful.`,
					status: NotificationStatus.SUCCESS
				});
				setLoadingStatus({ isLoading: false, message: '' });
				setSteps({ percent: 0, step: 2 });
			};

			await executeTx({
				address: linkedAddress,
				api,
				apiReady,
				errorMessageFallback: 'Transaction failed.',
				network,
				onBroadcast: () => setLoadingStatus({ isLoading: true, message: 'Broadcasting the vote' }),
				onFailed,
				onSuccess,
				tx: bountyTx
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

	const onValueChange = (balance: BN) => setBountyAmount(balance);

	return (
		<div className={`${className} create-bounty`}>
			<Spin spinning={loadingStatus.isLoading}>
				{error && (
					<ErrorAlert
						className='my-2'
						errorMsg={error}
					/>
				)}

				<div className='my-8 flex flex-col'>
					<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Have you created a bounty already? </label>
					<Radio.Group
						onChange={(e) => {
							setIsBounty(e.target.value);
							// onChangeLocalStorageSet({ isPreimage: e.target.value }, e.target.value, preimageCreated, preimageLinked, true);
							setSteps({ percent: 20, step: 1 });
						}}
						size='small'
						className='mt-1.5'
						value={isBounty}
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
				{new BN(availableBalance || '0').lte(bountyBond) && (
					<Alert
						className='my-2 mt-6 rounded-[4px] dark:border-infoAlertBorderDark dark:bg-infoAlertBgDark'
						type='info'
						showIcon
						message={
							<span className='text-[13px] font-medium text-bodyBlue dark:text-blue-dark-high'>
								Please maintain minimum {formatedBalance(String(bountyBond.toString()), unit)} {unit} balance for these transactions:
							</span>
						}
						description={
							<div className='-mt-1 mr-[18px] flex flex-col gap-1 text-xs dark:text-blue-dark-high'>
								<li className='mt-0 flex w-full justify-between'>
									<div className='mr-1 text-lightBlue dark:text-blue-dark-medium'>Proposal Submission</div>
									<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
										{formatedBalance(String(bountyBond.toString()), unit)} {unit}
									</span>
								</li>
							</div>
						}
					/>
				)}
				<Form
					form={form}
					// disabled={loading}
					onFinish={handleSubmit}
					initialValues={{
						//after_blocks: String(advancedDetails.afterNoOfBlocks?.toString()),
						//at_block: String(advancedDetails.atBlockNo?.toString()),
						//preimage_hash: preimageHash,
						//preimage_length: preimageLength || 0,
						proposer_address: linkedAddress
					}}
					validateMessages={{ required: "Please add the '${name}' " }}
				>
					{isBounty && (
						<>
							<label className='mb-1.5 text-sm text-lightBlue dark:text-blue-dark-high'>Bounty Id</label>
							<Form.Item name='Bounty_id'>
								<Input
									name='Bounty_id'
									className='h-[40px] rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
									onChange={(e) => {
										setBountyId(Number(e.target.value));
										// onChangeLocalStorageSet({ title: e.target.value }, Boolean(isDiscussionLinked));
										setSteps({ percent: 100, step: 1 });
									}}
								/>
							</Form.Item>
						</>
					)}

					<div>
						<BalanceInput
							disabled={Boolean(isBounty)}
							theme={theme}
							balance={bountyAmount}
							formItemName='bounty_amount'
							placeholder='Enter Bounty Amount'
							label='Bounty Amount'
							inputClassName='dark:text-blue-dark-high text-bodyBlue'
							className='mb-0'
							// onChange={(address: BN) => handleOnchange({ ...gov1proposalData, fundingAmount: address.toString() })}
						/>
					</div>

					{!isBounty && (
						<>
							<div>
								<span className={`${poppins.variable} ${poppins.className} text-sm font-medium text-blue-light-medium dark:text-blue-dark-medium`}>Bounty Bond</span>
								<span className={`${poppins.variable} ${poppins.className} ml-3  text-sm font-semibold text-blue-light-high dark:text-blue-dark-high`}>
									{bountyBond.toString()}
								</span>
							</div>
						</>
					)}
					<div className='-mx-6 mt-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-section-dark-container'>
						<Button
							onClick={() => {
								setSteps({ percent: 100, step: 0 });
								// setGenralIndex(null);
							}}
							className='h-10 w-[155px] rounded-[4px] border-pink_primary text-sm font-medium tracking-[0.05em] text-pink_primary dark:bg-transparent'
						>
							Back
						</Button>
						<Button
							htmlType='submit'
							className={`${
								isBounty && linkedAddress != bountyProposer ? 'opacity-50' : ''
							} h-10 w-[165px] rounded-[4px] bg-pink_primary text-center text-sm font-medium tracking-[0.05em] text-white
						dark:border-pink_primary`}
							disabled={isBounty ? linkedAddress != bountyProposer : false}
						>
							{isBounty ? 'Next' : 'Create Bounty'}
						</Button>
					</div>
				</Form>
			</Spin>
		</div>
	);
};

export default CreateBounty;
