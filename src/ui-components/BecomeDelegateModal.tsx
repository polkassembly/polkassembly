// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Alert, Button, Modal, Spin } from 'antd';
import { poppins } from 'pages/_app';
import styled from 'styled-components';
import { CloseIcon } from './CustomIcons';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useEffect, useState } from 'react';
import AuthForm from './AuthForm';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import BecomeDelegateIdentiyButton from './BecomeDelegateIdentityButton';
import Address from './Address';
import { IDelegationProfileType } from '~src/auth/types';
import { NotificationStatus } from '~src/types';
import queueNotification from './QueueNotification';
import ContentForm from '~src/components/ContentForm';
import { useTranslation } from 'react-i18next';

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
	defaultAddress?: string;
}

const BecomeDelegateModal = ({ isModalOpen, setIsModalOpen, className, profileDetails, userBio, setUserBio, onchainUsername, isEditMode = false, defaultAddress }: Props) => {
	const { delegationDashboardAddress } = useUserDetailsSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [newBio, setNewBio] = useState<string>(userBio || '');
	const { t } = useTranslation('common');

	const handleSubmit = async () => {
		setLoading(true);
		const trimmedBio = newBio.trim();

		if (!trimmedBio) {
			setLoading(false);
			return;
		}
		const requestData: IDetailsState = {
			address: defaultAddress || delegationDashboardAddress,
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

	useEffect(() => {
		setNewBio(userBio);
	}, [userBio]);

	return (
		<Modal
			title={
				<div className='flex items-center border-0 border-b-[1px] border-solid border-section-light-container px-4 py-[14px] text-sm font-semibold text-bodyBlue dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-blue-dark-high sm:px-5 sm:py-4 sm:text-[20px]'>
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
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive sm:mt-2' />}
		>
			<Spin
				spinning={loading}
				className='h-[250px]'
			>
				<AuthForm onSubmit={handleSubmit}>
					<div className='mt-3 px-4 sm:mt-6 sm:px-5'>
						<label className='text-xs text-lightBlue dark:text-blue-dark-medium sm:text-sm'>{t('your_address')}</label>
						<div className='w-full rounded-md border border-solid border-[#d2d8e0] px-3 py-[10px] dark:border-separatorDark'>
							<Address
								address={defaultAddress || delegationDashboardAddress}
								displayInline
								isTruncateUsername={false}
								destroyTooltipOnHide={true}
							/>
						</div>
					</div>
					<div className='mt-3 px-4 sm:mt-6 sm:px-6'>
						<label className='text-xs text-lightBlue dark:text-blue-dark-medium sm:text-sm'>
							{isEditMode ? 'Edit Delegation Mandate' : 'Your Delegation Mandate'}
							<span className='font-semibold text-[#FF3C5F]'>*</span>
						</label>
						<ContentForm
							value={newBio}
							height={250}
							onChange={(content: string) => {
								setNewBio(content);
							}}
						/>
					</div>
					<div className='-mt-2 mb-4 rounded-[4px] px-4 sm:mb-7 sm:mt-6 sm:px-5'>
						<Alert
							message={<BecomeDelegateIdentiyButton closeModal={() => setIsModalOpen && setIsModalOpen(false)} />}
							type='info'
							showIcon
							className='border-none dark:bg-infoAlertBgDark'
						/>
					</div>
					<div className='mt-4 flex justify-end border-0 border-t-[1px] border-solid border-section-light-container px-4 py-4 dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-blue-dark-medium sm:mt-5 sm:px-5 sm:py-4'>
						<Button
							className={`flex h-10 w-full items-center justify-center space-x-2 rounded-[4px] border-none bg-pink_primary text-xs font-medium tracking-wide text-white dark:bg-pink_primary sm:text-sm ${
								newBio || loading ? '' : 'opacity-60'
							}`}
							type='primary'
							onClick={handleSubmit}
							disabled={!newBio || loading}
						>
							<span className='text-white'>{isEditMode ? t('edit') : t('confirm')}</span>
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
		border-radius: 14px !important;
	}
	@media (max-width: 640px) {
		.ant-modal-content .ant-modal-close {
			margin-top: -5px !important;
		}
	}
`;
