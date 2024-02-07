// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Alert, Button, Modal, Spin } from 'antd';
import { poppins } from 'pages/_app';
import styled from 'styled-components';
import { CloseIcon } from './CustomIcons';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { ChangeEvent, useState } from 'react';
import AuthForm from './AuthForm';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import BecomeDelegateIdentiyButton from './BecomeDelegateIdentityButton';
import Address from './Address';
import { IDelegationProfileType } from '~src/auth/types';
import { NotificationStatus } from '~src/types';
import queueNotification from './QueueNotification';
import InputTextarea from '~src/basic-components/Input/InputTextarea';

interface IDetailsState {
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
	profileDetails: IDelegationProfileType;
	userBio: string;
	setUserBio: (pre: string) => void;
	onchainUsername: string;
	isEditMode?: boolean;
}

const BecomeDelegateModal = ({ isModalOpen, setIsModalOpen, className, profileDetails, userBio, setUserBio, onchainUsername, isEditMode = false }: Props) => {
	const { delegationDashboardAddress } = useUserDetailsSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [newBio, setNewBio] = useState<string>(userBio || '');

	const handleSubmit = async () => {
		setLoading(true);
		const trimmedBio = newBio.trim();

		if (!trimmedBio) {
			setLoading(false);
			return;
		}
		const requestData: IDetailsState = {
			address: delegationDashboardAddress,
			bio: trimmedBio,
			isNovaWalletDelegate: false,
			userId: profileDetails.user_id,
			username: !onchainUsername?.length ? profileDetails?.username : onchainUsername
		};
		const { data, error } = await nextApiClientFetch('api/v1/delegations/become-pa-delegate', requestData);
		if (data) {
			setLoading(false);
			setUserBio(newBio);
			setIsModalOpen(false);
			queueNotification({
				header: 'Success!',
				message: isEditMode ? 'Delegation Mandate Updated Successfully' : 'Congrats! You have been successfully registered as a delegate',
				status: NotificationStatus.SUCCESS
			});
		} else if (error) {
			console.log(error);
			queueNotification({
				header: 'Error!',
				message: error,
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		}
	};

	return (
		<Modal
			title={
				<div className='flex items-center border-0 border-b-[1px] border-solid border-[#D2D8E0] px-5 py-4 text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-blue-dark-high'>
					{isEditMode ? 'Edit Delegate Details' : 'Become A Delegate'}
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
			<Spin
				spinning={loading}
				className='h-[250px]'
			>
				<AuthForm onSubmit={handleSubmit}>
					<div className='mt-6 px-5'>
						<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Your Address</label>
						<div className='w-full rounded-md border border-solid border-[#d2d8e0] px-3 py-[10px]'>
							<Address
								address={delegationDashboardAddress}
								displayInline
								isTruncateUsername={false}
							/>
						</div>
					</div>
					<div className='mt-6 px-6'>
						<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>
							{isEditMode ? 'Edit Delegation Mandate' : 'Your Delegation Mandate'}
							<span className='font-semibold text-[#FF3C5F]'>*</span>
						</label>
						<InputTextarea
							name='bio'
							className='min-h-[100px] border px-3 py-2 text-sm font-normal text-lightBlue dark:border-[#4b4b4b] dark:bg-[#0d0d0d] dark:text-blue-dark-high'
							placeholder='Add message for delegate address'
							value={newBio || userBio}
							onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
								setNewBio(e.target.value);
							}}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && !e.shiftKey) {
									e.stopPropagation(); // Prevent form submission but allow newline insertion
								}
							}}
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
							className={`flex h-10 w-full items-center justify-center space-x-2 rounded-[4px] border-none bg-pink_primary text-sm font-medium text-white dark:bg-pink_primary ${
								userBio || loading ? '' : 'opacity-60'
							}`}
							type='primary'
							onClick={handleSubmit}
							disabled={!newBio || loading}
						>
							<span className='text-white'>{isEditMode ? 'Edit' : 'Confirm'}</span>
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
