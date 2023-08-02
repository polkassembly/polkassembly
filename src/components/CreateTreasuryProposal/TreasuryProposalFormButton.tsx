// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckCircleFilled, DownOutlined, LoadingOutlined, UpOutlined, WarningFilled } from '@ant-design/icons';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import Identicon from '@polkadot/react-identicon';
import { Button, Divider, Form, Input, Modal, Spin, Tooltip } from 'antd';
import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
//TODO: import { useAddPolkassemblyProposalMutation } from 'src/generated/graphql';
import { APPNAME } from 'src/global/appName';
import { chainProperties } from 'src/global/networkConstants';
import { LoadingStatusType, NotificationStatus } from 'src/types';
import BalanceInput from 'src/ui-components/BalanceInput';
import HelperTooltip from 'src/ui-components/HelperTooltip';
import queueNotification from 'src/ui-components/QueueNotification';
import getEncodedAddress from 'src/util/getEncodedAddress';
import styled from 'styled-components';
import { CreatePostResponseType } from '~src/auth/types';

import { useApiContext, useUserDetailsContext } from '~src/context';
import EthIdenticon from '~src/ui-components/EthIdenticon';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import AddressComponent from '../../ui-components/Address';
import ContentForm from '../ContentForm';
import TitleForm from '../TitleForm';
import { useNetworkSelector } from '~src/redux/selectors';
import executeTx from '~src/util/executeTx';

interface Props {
	className?: string
	// setTipModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

enum AvailableAccountsInput {
	submitWithAccount,
	beneficiary
}

const TreasuryProposalFormButton = ({
	className
	// setTipModalOpen,
} : Props) => {
	const { network } = useNetworkSelector();

	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [extensionNotAvailable, setExtensionNotAvailable] = useState(false);
	const [availableAccounts, setAvailableAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [showAvailableAccountsObj, setShowAvailableAccountsObj] = useState<{ [key: string]: boolean}>({
		'beneficiary': false,
		'submitWithAccount': false
	});
	const [submitWithAccount, setSubmitWithAccount] = useState<string>('');
	const [beneficiaryAccount, setBeneficiaryAccount] = useState<string>('');
	const [value, setValue] = useState<BN>(new BN(0));
	const [postTitle, setPostTitle] = useState<string>('');
	const [postDescription, setPostDescription] = useState<string>('');
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message:'' });
	// const [addPolkassemblyProposalMutation] = useAddPolkassemblyProposalMutation();

	const [errorsFound, setErrorsFound] = useState<string[]>([]);
	const [treasuryProposal, setTreasuryProposal] = useState<{
		bondPercent: null | string;
		maxBond: null | string;
		minBond: null | string;
	}>({
		bondPercent: '',
		maxBond: '',
		minBond: ''
	});

	const { id } = useUserDetailsContext();

	useEffect(() => {
		const networkChainProperties = chainProperties[network];
		if (networkChainProperties) {
			const { treasuryProposalBondPercent, treasuryProposalMaxBond, treasuryProposalMinBond } = networkChainProperties;
			setTreasuryProposal({
				bondPercent: treasuryProposalBondPercent,
				maxBond: treasuryProposalMaxBond,
				minBond: treasuryProposalMinBond
			});
		}
	}, [network]);

	const minimumBond = chainProperties[network]?.tokenSymbol === 'DOT' ? '100.0000 DOT' : '66.66 mKSM';

	const handleDetect = async (updateForInput: AvailableAccountsInput) => {
		const extensions = await web3Enable(APPNAME);
		if (extensions.length === 0) {
			setExtensionNotAvailable(true);
			return;
		} else {
			setExtensionNotAvailable(false);
		}

		const allAccounts = await web3Accounts();
		setAvailableAccounts(allAccounts);

		const availableAccountsObj : { [key: string]: boolean } = {
			'beneficiary': false,
			'submitWithAccount': false
		};

		switch (updateForInput) {
		case AvailableAccountsInput.submitWithAccount:
			availableAccountsObj.submitWithAccount = !showAvailableAccountsObj['submitWithAccount'];
			break;
		case AvailableAccountsInput.beneficiary:
			availableAccountsObj.beneficiary = !showAvailableAccountsObj['beneficiary'];
			break;
		}

		setShowAvailableAccountsObj(availableAccountsObj);
	};

	const isSelected = (updateForInput: AvailableAccountsInput, address: string) => {
		switch (updateForInput) {
		case AvailableAccountsInput.submitWithAccount:
			return submitWithAccount === address;
		case AvailableAccountsInput.beneficiary:
			return beneficiaryAccount === address;
		}
	};

	const handleSelectAvailableAccount = (updateForInput: AvailableAccountsInput, address: string) => {
		switch (updateForInput) {
		case AvailableAccountsInput.submitWithAccount:
			setSubmitWithAccount(address);
			break;
		case AvailableAccountsInput.beneficiary:
			setBeneficiaryAccount(address);
		}

		// Close dropdown on select
		const availableAccountsObj : { [key: string]: boolean } = {
			'beneficiary': false,
			'submitWithAccount': false
		};
		setShowAvailableAccountsObj(availableAccountsObj);
	};

	const getAvailableAccounts = (updateForInput: AvailableAccountsInput) => {
		return (
			<div className=' w-full pl-[1.5em] pr-[1em]'>
				{availableAccounts.map(account => {
					const address = getEncodedAddress(account.address, network);

					return address &&
							<div key={address} onClick={() => handleSelectAvailableAccount(updateForInput, address)} className=' mb-[10px] flex justify-between items-center cursor-pointer'>
								<div className='item'>
									<AddressComponent className='item' address={address} extensionName={account.meta.name} />
								</div>
								{isSelected(updateForInput, address) ? <CheckCircleFilled style={{ color:'green' }} />: <div style={{ border:'1px solid grey', borderRadius:'50%', height:'1em', width:'1em' }}></div>}
							</div>;
				})}
			</div>
		);
	};

	const onBalanceChange = (balance: BN) => setValue(balance);

	const onTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {setPostTitle(event.currentTarget.value); return event.currentTarget.value;};
	const onPostDescriptionChange = (data: string) => {setPostDescription(data); return data.length ? data : null;};

	const isFormValid = () => {
		const errorsFound: string[] = [];

		if(!beneficiaryAccount){
			errorsFound.push('beneficiaryAccount');
		}
		if(!submitWithAccount){
			errorsFound.push('submitWithAccount');
		}

		if(!value.gt(new BN(0))) {
			errorsFound.push('value');
		}

		if(errorsFound.length > 0){
			setErrorsFound(errorsFound);
			return false;
		}else{
			setErrorsFound([]);
		}

		return true;
	};
	const { api, apiReady } = useApiContext();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const saveProposal = async (userId: number, title: string, content: string, proposerAddress: string) => {

		if (!api || !apiReady) {
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const proposalId: number = ((await api.query.treasury.proposalCount()) as any).toNumber();

		const { data, error: apiError } = await nextApiClientFetch<CreatePostResponseType>( 'api/v1/auth/actions/createTreasuryPost', {
			content,
			postId: proposalId,
			proposerAddress,
			title,
			userId
		});

		if(apiError || !data?.post_id) {
			queueNotification({
				header: 'Error',
				message: 'There was an error creating your treasury post.',
				status: NotificationStatus.ERROR
			});
			console.error(apiError);
		}

		if(data && data.post_id) {
			queueNotification({
				header: 'Thanks for sharing!',
				message: 'Treasury Post created successfully.',
				status: NotificationStatus.SUCCESS
			});
		}
	};

	const handleSignAndSubmit = async () => {

		if(!isFormValid()) return;

		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		const injected = await web3FromSource(availableAccounts[0].meta.source);

		api.setSigner(injected.signer);

		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });
		try {
			const proposal = api.tx.treasury.proposeSpend(value.toString(), beneficiaryAccount);

			const onSuccess = async() => {
				queueNotification({
					header: 'Success!',
					message: `Propsal #${proposal.hash} successful.`,
					status: NotificationStatus.SUCCESS
				});
				setLoadingStatus({ isLoading: false, message: '' });
				setModalOpen(false);
				const userId = id;
				if (!userId){
					return;
				}
				await saveProposal(userId, postTitle, postDescription, submitWithAccount);
			};

			const onFailed = (message: string) => {
				setLoadingStatus({ isLoading: false, message: '' });
				setModalOpen(false);
				queueNotification({
					header: 'Failed!',
					message,
					status: NotificationStatus.ERROR
				});
			};

			await executeTx({
				address: submitWithAccount,
				api,
				errorMessageFallback: 'Transaction failed.',
				network,
				onBroadcast:() => setLoadingStatus({ isLoading: true, message: 'Broadcasting the vote' }),
				onFailed,
				onSuccess,
				tx: proposal
			});
		}
		catch(error){
			setLoadingStatus({ isLoading: false, message: '' });
			console.log(':( transaction failed');
			console.error('ERROR:', error);
			setModalOpen(false);
			queueNotification({
				header: 'Failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
		}
	};

	const triggerBtn = <button disabled={!id} className='outline-none whitespace-pre border-none p-3 font-medium  leading-[20px] tracking-[0.01em] shadow-[0px_6px_18px_rgba(0,0,0,0.06)] flex items-center justify-center rounded-[4px] text-white bg-pink_primary cursor-pointer -mt-1' onClick={() => setModalOpen(true)}>+ Add New Proposal</button>;
	const triggerBtnLoginDisabled = <Tooltip  color='#E5007A' title='Please signup/login to create treasury proposal'> <button disabled={true} className='font-medium text-sm p-4 rounded-[4px] shadow-[0px_6px_18px_rgba(0,0,0,0.06)] text-white border-none outline-none cursor-pointer  bg-grey_secondary'>+ Add New Proposal</button></Tooltip>;
	return (
		loadingStatus.isLoading
			? <Spin indicator={<LoadingOutlined />} >
				<div className='font-medium text-sm leading-[27px] px-[19x] py-6 rounded-[4px] shadow-[0px_6px_18px_rgba(0,0,0,0.06)] text-pink_primary border-none outline-none h-[75px] min-w-[226px] cursor-not-allowed bg-white flex items-center justify-center'>
					{loadingStatus.message}
				</div>
			</Spin>:
			<>
				{!id ? triggerBtnLoginDisabled : triggerBtn}

				<Modal
					className={className}
					onCancel={() => setModalOpen(false)}
					centered
					wrapClassName='p-5 before:h-0 md:p-10'
					zIndex={1002}
					title='Create Treasury Proposal'
					footer={[
						<Button key='submit'  className='bg-pink_primary text-white' onClick={handleSignAndSubmit}>Sign &amp; Submit</Button>
					]}
					open={modalOpen}
				>
					<div>
						<div className='modal-desc'>
							<Form className='identity-form'>
								<div>
									{/* Submit with account */}
									<div className=' mb-[1.5em]'>
										<label className='mb-3 font-bold flex items-center text-sm text-sidebarBlue'>
													Submit with account
											<HelperTooltip className='ml-2' text='This account will make the proposal and be responsible for the bond.' />
										</label>

										<div className=' flex items-center'>
											{
												submitWithAccount.startsWith('0x') ?
													<EthIdenticon size={26} address={submitWithAccount} />
													:
													<Identicon
														className='z-10 absolute left-8'
														value={submitWithAccount}
														size={26}
														theme={'polkadot'}
													/>
											}
											<Form.Item className=' mb-0 w-full' validateStatus={errorsFound.includes('submitWithAccount') ? 'error' : ''}>
												{errorsFound.includes('submitWithAccount') && <span className='text-red-800'>Please select an address</span>}
												<Input
													value={submitWithAccount}
													className={`${submitWithAccount === '' ? 'px-[0.5em]' : 'pl-10'}`}
													onChange={ (e) => setSubmitWithAccount(e.target.value)}
													placeholder='Account Address'
												/>

											</Form.Item>
										</div>

										{!extensionNotAvailable && <div className=' flex justify-between mb-[1em]'>
											<div onClick={() => handleDetect(AvailableAccountsInput.submitWithAccount)} className=' text-pink_primary cursor-pointer ml-[1.5em] mt-[0.25em]'>
														or choose from available addresses
												{showAvailableAccountsObj['submitWithAccount'] ? <UpOutlined className='ml-1 align-middle' /> : <DownOutlined className='ml-1 align-middle'/>}
											</div>
										</div>}
										{extensionNotAvailable && <div className="error">Please install polkadot.js extension</div>}
										{showAvailableAccountsObj['submitWithAccount'] && availableAccounts.length > 0 && getAvailableAccounts(AvailableAccountsInput.submitWithAccount)}
									</div>

									{/* Beneficiary account */}
									<>
										<div  className='mb-[1.5em]'>
											<label className=' mb-3 font-bold flex items-center text-sm text-sidebarBlue'>
													Beneficiary Account
												<HelperTooltip className='ml-2' text='The beneficiary will receive the full amount if the proposal passes.' />
											</label>

											<div className=' flex items-center'>
												{
													beneficiaryAccount.startsWith('0x') ?
														<EthIdenticon size={26} address={beneficiaryAccount} />
														:
														<Identicon
															className='z-10 absolute left-8'
															value={beneficiaryAccount}
															size={26}
															theme={'polkadot'}
														/>
												}

												<Form.Item className=' mb-0 w-full' validateStatus={errorsFound.includes('beneficiaryAccount') ? 'error' : ''}>
													{errorsFound.includes('beneficiaryAccount') && <span className='text-red-800'>Please select an address</span>}
													<Input
														value={beneficiaryAccount}
														className={`${beneficiaryAccount === '' ? 'px-[0.5em]' : 'pl-10'}`}
														onChange={ (e) => setBeneficiaryAccount(e.target.value)}
														placeholder='Account Address'
													/>

												</Form.Item>
											</div>

											{!extensionNotAvailable && <div className=' flex justify-between mb-[1em]'>
												<div onClick={() => handleDetect(AvailableAccountsInput.beneficiary)} className=' text-pink_primary cursor-pointer ml-[1.5em] mt-[0.25em]'>
														or choose from available addresses
													{showAvailableAccountsObj['beneficiary'] ? <UpOutlined className='ml-1 align-middle' /> : <DownOutlined className='ml-1 align-middle'/>}
												</div>
											</div>}
											{extensionNotAvailable && <div className="error">Please install polkadot.js extension</div>}
											{showAvailableAccountsObj['beneficiary'] && availableAccounts.length > 0 && getAvailableAccounts(AvailableAccountsInput.beneficiary)}
										</div>
									</>

									{/* Value */}
									<div className='flex items-center mb-[1.5em]'>
										<BalanceInput
											label={'Value'}
											helpText={'The value is the amount that is being asked for and that will be allocated to the beneficiary if the proposal is approved.'}
											placeholder={'0'}
											className=' w-full m-0'
											onChange={onBalanceChange}
										/>
									</ div>

									{/* Proposal Bond */}
									{
										treasuryProposal.bondPercent?
											<div className='mb-[1.5em]'>
												<label className='mb-3 font-bold flex items-center text-sm text-sidebarBlue'>
													Proposal Bond
													<HelperTooltip className='ml-2' text='Of the beneficiary amount, at least 5.00% would need to be put up as collateral. The maximum of this and the minimum bond will be used to secure the proposal, refundable if it passes.' />
												</label>

												<Input
													className=' hide-pointer'
													value={treasuryProposal.bondPercent}
												/>
											</div>
											: null
									}

									{/* Minimum Bond */}
									{
										treasuryProposal.minBond?
											<div className='mb-[1.5em]'>
												<label className=' mb-3 font-bold flex items-center text-sm text-sidebarBlue'>
												Minimum Bond
													<HelperTooltip className='ml-2' text='The minimum amount that will be bonded.' />
												</label>

												<Input
													className=' hide-pointer'
													value={minimumBond}
												/>
											</div>
											: null
									}

									<p><WarningFilled /> Be aware that once submitted the proposal will be put to a council vote. If the proposal is rejected due to a lack of info, invalid requirements or non-benefit to the network as a whole, the full bond posted (as describe above) will be lost.</p>
								</div>
								<Divider className='my-[1.5em]' />

								<div >
									<TitleForm
										onChange={onTitleChange}
									/>
									<ContentForm
										onChange={onPostDescriptionChange}
									/>
								</div>
							</Form>
						</div>
					</div>
				</Modal>
			</>
	);

};

export default styled(TreasuryProposalFormButton)`
	.textarea-input {
		min-height: 100;
		margin-left: 1.5em !important;
	}

	.hide-pointer{
		pointer-events:none;
	}

	/* Hides Increment Arrows in number input */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input[type=number] {
		-moz-appearance: textfield;
	}
`;
