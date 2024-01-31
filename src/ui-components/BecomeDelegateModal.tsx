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
import CustomButton from '~src/basic-components/buttons/CustomButton';
import ImageIcon from './ImageIcon';
import Address from './Address';
import { onchainIdentitySupportedNetwork } from '~src/components/AppLayout';
import OnChainIdentity from '~src/components/OnchainIdentity';

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
	openAddressLinkedModal?: boolean;
	setOpenAddressLinkedModal?: (pre: boolean) => void;
}

const BecomeDelegateModal = ({ isModalOpen, setIsModalOpen, className, setUserBio, openAddressLinkedModal: addressModal }: Props) => {
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const { loginAddress, delegationDashboardAddress } = currentUser;
	const [loading, setLoading] = useState<boolean>(false);
	const [details, setDetails] = useState<DetailsState>({
		address: loginAddress,
		bio: '',
		isNovaWalletDelegate: false,
		userId: 0,
		username: ''
	});
	const [open, setOpen] = useState<boolean>(false);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(addressModal || false);

	const handleIdentityButtonClick = () => {
		if (loginAddress?.length) {
			setOpen(!open);
		} else {
			setOpenAddressLinkedModal(true);
		}
	};

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
		fetchUserID(loginAddress);
	}, [loginAddress]);

	return (
		<>
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
							<div className='flex w-full items-end gap-2 text-sm '>
								<div className='flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-[#D2D8E0] bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
									<Address
										address={delegationDashboardAddress}
										isTruncateUsername={false}
										displayInline
									/>
									<CustomButton
										text='Change'
										onClick={() => {
											// setAddressChangeModalOpen();
											setOpenAddressLinkedModal(true);
											// setOpen(true);
											setIsModalOpen(false);
										}}
										width={80}
										className='text-xs'
										height={26}
										variant='primary'
									/>
								</div>
							</div>
						</div>
						<div className='mt-6 px-5'>
							<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>
								Your Bio<span className='font-semibold text-[#FF3C5F]'>*</span>
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
								message={
									<span className='text-sm text-blue-light-medium dark:text-blue-dark-high'>
										To add socials to your delegate profile{' '}
										<span
											onClick={() => {
												handleIdentityButtonClick(), setIsModalOpen && setIsModalOpen(false);
											}}
											className='-mt-[2px] inline-flex cursor-pointer text-xs font-medium text-[#E5007A]'
										>
											<ImageIcon
												src='/assets/delegation-tracks/shield-icon-pink.svg'
												alt='shield icon'
												imgClassName='-mt-[3px] mr-[1.5px]'
											/>{' '}
											Set identity
										</span>{' '}
										with Polkassembly
									</span>
								}
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
			{onchainIdentitySupportedNetwork.includes(network) && (
				<OnChainIdentity
					open={open}
					setOpen={setOpen}
					openAddressLinkedModal={openAddressLinkedModal}
					setOpenAddressLinkedModal={setOpenAddressLinkedModal}
					isUsedInDelegationModal={true}
				/>
			)}
		</>
	);
};
export default styled(BecomeDelegateModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
	}
`;
