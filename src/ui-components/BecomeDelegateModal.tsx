// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Alert, Button, Input, Modal, Spin } from 'antd';
import { poppins } from 'pages/_app';
import styled from 'styled-components';
import { CloseIcon } from './CustomIcons';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useEffect, useState } from 'react';
import AuthForm from './AuthForm';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import BecomeDelegateIdentiyButton from './BecomeDelegateIdentityButton';
import AddressDropdown from './AddressDropdown';
import { useApiContext } from '~src/context';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { useDispatch } from 'react-redux';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import { setUserDetailsState } from '~src/redux/userDetails';

interface DetailsState {
	userId: number | null;
	username: string;
	address: string;
	bio: string;
	isNovaWalletDelegate: boolean;
}

interface Props {
	isModalOpen: boolean;
	setIsModalOpen: (pre: boolean) => void;
	className?: string;
	userBio: string;
	setUserBio: (userBio: string) => void;
}

const BecomeDelegateModal = ({ isModalOpen, setIsModalOpen, className, setUserBio }: Props) => {
	const { api, apiReady } = useApiContext();
	const currentUser = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const { loginWallet, loginAddress, delegationDashboardAddress } = currentUser;
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [defaultAddress, setAddress] = useState<string>(loginAddress);
	const [loading, setLoading] = useState<boolean>(false);
	const [details, setDetails] = useState<DetailsState>({
		address: defaultAddress,
		bio: '',
		isNovaWalletDelegate: false,
		userId: 0,
		username: ''
	});
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);

	const fetchUserID = async (address: string) => {
		const substrateAddress = getSubstrateAddress(address);
		if (substrateAddress) {
			try {
				const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${substrateAddress}`, undefined, 'GET');
				if (error || !data || !data.username || !data.user_id) {
					return;
				}
				setDetails((prevDetails) => ({ ...prevDetails, userId: data.user_id, username: data.username }));
			} catch (error) {
				console.log(error);
			}
		}
	};

	const dispatch = useDispatch();

	const getAllAccounts = async () => {
		if (!api || !apiReady || !loginWallet) return;

		const addressData = await getAccountsFromWallet({ api, apiReady, chosenWallet: loginWallet, loginAddress, network });
		if (addressData) {
			setAccounts(addressData.accounts || []);
			setAddress(addressData.account || '');
		}
	};

	const handleSubmit = async () => {
		setLoading(true);
		const trimmedBio = details.bio.trim();

		if (!trimmedBio) {
			setLoading(false);
			return;
		}

		const { data, error } = await nextApiClientFetch('api/v1/delegations/become-pa-delegate', { ...details, bio: trimmedBio });

		if (data) {
			setUserBio(details.bio);
			setLoading(false);
			setIsModalOpen(false);
		} else console.log(error);
	};

	useEffect(() => {
		fetchUserID(defaultAddress);
	}, [defaultAddress]);

	useEffect(() => {
		if (!api || !apiReady) return;

		getAllAccounts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [delegationDashboardAddress, api, apiReady, currentUser]);

	return (
		<Modal
			title={
				<div className='flex items-center border-0 border-b-[1px] border-solid border-[#D2D8E0] px-5 py-4 text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-blue-dark-high'>
					Become A Delegate
				</div>
			}
			open={isModalOpen}
			footer={false}
			zIndex={1008}
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			className={`${poppins.variable} ${poppins.className} w-[605px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => {
				setIsModalOpen && setIsModalOpen(false);
			}}
			closeIcon={<CloseIcon className='mt-2 text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<Spin spinning={loading}>
				<AuthForm onSubmit={handleSubmit}>
					<div className='mt-6 px-5'>
						<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Your Address</label>
						<AddressDropdown
							accounts={accounts}
							onAccountChange={(address) => {
								setAddress(address);
								setDetails((prevDetails) => ({ ...prevDetails, address }));
								dispatch(setUserDetailsState({ ...currentUser, delegationDashboardAddress: address }));
								fetchUserID(address);
							}}
							defaultAddress={defaultAddress}
						/>
					</div>
					<div className='mt-6 px-5'>
						<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>
							Your Delegation Mandate<span className='font-semibold text-[#FF3C5F]'>*</span>
						</label>
						<Input
							name='bio'
							className='h-[40px] border text-sm font-normal text-lightBlue dark:border-[#4b4b4b] dark:bg-[#0d0d0d] dark:text-blue-dark-medium'
							placeholder='Add message for delegate address'
							value={details.bio}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDetails({ ...details, bio: e.target.value })}
						/>
					</div>
					<div className='mb-7 mt-6 rounded-[4px] px-5'>
						<Alert
							message={<BecomeDelegateIdentiyButton closeModal={() => setIsModalOpen && setIsModalOpen(false)} />}
							type='info'
							showIcon
							className='border-none dark:bg-infoAlertBgDark'
						/>
					</div>
					<div className='mt-5 flex justify-end border-0 border-t-[1px] border-solid border-[#D2D8E0] px-5 py-4 dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-blue-dark-medium'>
						<Button
							className={`flex h-[40px] w-full items-center justify-center space-x-2 rounded-[4px] bg-pink_primary text-sm font-medium text-white dark:bg-pink_primary ${
								details.bio || loading ? '' : 'opacity-60'
							}`}
							type='primary'
							onClick={handleSubmit}
							disabled={!details.bio || loading}
						>
							<span className='text-white'>Confirm</span>
						</Button>
					</div>
				</AuthForm>
			</Spin>
		</Modal>
	);
};
export default styled(BecomeDelegateModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
	}
`;
