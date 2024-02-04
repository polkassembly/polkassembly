// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Input, Modal, Spin } from 'antd';
import { poppins } from 'pages/_app';
import styled from 'styled-components';
import { CloseIcon } from './CustomIcons';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useState } from 'react';
import AuthForm from './AuthForm';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Address from './Address';
import { IDelegationProfileType } from '~src/auth/types';

interface DetailsState {
	userId: number | null;
	username: string;
	address: string;
	bio: string;
	isNovaWalletDelegate: boolean;
}

interface Props {
	isEditModalOpen: boolean;
	setIsEditModalOpen: (pre: boolean) => void;
	className?: string;
	profileDetails: IDelegationProfileType;
	userBio: string;
	setUserBio: (pre: string) => void;
}

const BecomeDelegateEditModal = ({ isEditModalOpen, setIsEditModalOpen, className, profileDetails, userBio, setUserBio }: Props) => {
	const currentUser = useUserDetailsSelector();
	const { delegationDashboardAddress } = currentUser;
	const [loading, setLoading] = useState<boolean>(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [details, setDetails] = useState<DetailsState>({
		address: delegationDashboardAddress,
		bio: userBio,
		isNovaWalletDelegate: false,
		userId: profileDetails.user_id,
		username: profileDetails.username
	});

	const handleSubmit = async () => {
		setLoading(true);
		const trimmedBio = details.bio.trim();

		if (!trimmedBio) {
			setLoading(false);
			return;
		}
		const { data, error } = await nextApiClientFetch('api/v1/delegations/become-pa-delegate', { ...details, bio: trimmedBio });

		if (data) {
			setUserBio(trimmedBio);
			setLoading(false);
			setIsEditModalOpen(false);
		} else console.log(error);
	};
	return (
		<Modal
			title={
				<div className='flex items-center border-0 border-b-[1px] border-solid border-[#D2D8E0] px-5 py-4 text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-blue-dark-high'>
					Edit Delegate Details
				</div>
			}
			open={isEditModalOpen}
			footer={false}
			zIndex={1008}
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			className={`${poppins.variable} ${poppins.className} w-[605px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => {
				setIsEditModalOpen && setIsEditModalOpen(false);
			}}
			closeIcon={<CloseIcon className='mt-2 text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<Spin spinning={loading}>
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
					<div className='mt-6 px-5'>
						<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>
							Edit Delegation Mandate<span className='font-semibold text-[#FF3C5F]'>*</span>
						</label>
						<Input
							name='bio'
							className='h-[40px] border text-sm font-normal text-lightBlue dark:border-[#4b4b4b] dark:bg-[#0d0d0d] dark:text-blue-dark-medium'
							placeholder='Add message for delegate address'
							value={userBio}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								setUserBio(e.target.value);
							}}
						/>
					</div>
					<div className='mt-5 flex justify-end border-0 border-t-[1px] border-solid border-[#D2D8E0] px-5 py-4 dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-blue-dark-medium'>
						<Button
							className={`flex h-[40px] w-full items-center justify-center space-x-2 rounded-[4px] bg-pink_primary tracking-wide text-white dark:bg-pink_primary ${
								userBio || loading ? '' : 'opacity-60'
							}`}
							type='primary'
							onClick={handleSubmit}
							disabled={!userBio || loading}
						>
							<span className='text-base font-medium text-white'>Edit</span>
						</Button>
					</div>
				</AuthForm>
			</Spin>
		</Modal>
	);
};
export default styled(BecomeDelegateEditModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
	}
`;
