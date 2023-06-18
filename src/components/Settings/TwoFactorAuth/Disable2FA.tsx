// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, Modal, Spin } from 'antd';
import React, { FC, useState } from 'react';
import { NotificationStatus } from 'src/types';
import FilteredError from 'src/ui-components/FilteredError';
import queueNotification from 'src/ui-components/QueueNotification';
import { LoadingOutlined } from '@ant-design/icons';
import { TokenType } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import { poppins } from 'pages/_app';
import { handleTokenChange } from '~src/services/auth.service';
import { useUserDetailsContext } from '~src/context';

const Title = <>
	<span className='text-lg tracking-wide text-sidebarBlue font-bold'>Disable Two Factor Authentication</span>
	<Divider className='mt-2 mb-0' />
</>;

const Disable2FA: FC<{className?: string}> = ({ className }) => {
	const [error, setError] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const currentUser = useUserDetailsContext();

	const handleSubmit = async () => {
		// don't submit if loading or if user is already 2FA enabled
		if(loading || !currentUser?.username || !currentUser.is2FAEnabled) return;
		setLoading(true);

		try {
			const { data, error } = await nextApiClientFetch<TokenType>('api/v1/auth/actions/2fa/disable');

			if (error || !data || !data.token) {
				setError(error || 'Error disabling 2FA. Please try again.');
				setLoading(false);
				return;
			}

			handleTokenChange(data.token, currentUser);

			queueNotification({
				header: 'Success',
				message: 'Two factor authentication disabled successfully!',
				status: NotificationStatus.SUCCESS
			});

			setShowModal(false);

		} catch (error) {
			//await form.validateFields(); will automatically highlight the error ridden fields
			setError('Please input a valid auth code');
			setLoading(false);
			return;
		}
	};

	const dismissModal = () => {
		setError('');
		setShowModal(false);
	};

	return (
		<>
			<Modal
				className={`${className} ${poppins.variable} ${poppins.className}`}
				closable={false}
				title={Title}
				open={showModal}
				footer={[
					<Button
						htmlType='submit'
						key="disable"
						onClick={handleSubmit}
						disabled={loading}
						className='rounded-lg font-semibold text-md leading-7 text-white py-5 outline-none border-none px-7 inline-flex items-center justify-center bg-pink_primary'
					>
           Disable
					</Button>,
					<Button
						key="cancel"
						onClick={dismissModal}
						className='rounded-lg font-semibold text-md leading-7 text-white py-5 outline-none border-none px-7 inline-flex items-center justify-center bg-pink_primary'
						disabled={loading}
					>
						Cancel
					</Button>
				]}
			>
				{ currentUser.is2FAEnabled ?
					<Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
						{error && !loading && <div className='mb-4'><FilteredError text={error || 'Error in disabling two factor auth. Please reload and try again.'}/></div>}

						<section className='text-center my-10'>
							<p className='mb-3'>Are you sure you want to disable two factor authentication ?</p>
							<small><em>(Please remember to remove the entry from Google authenticator app too)</em></small>
						</section>
					</Spin>
					: <section className='text-center my-10'>Two factor authentication disabled successfully.</section>
				}
			</Modal>

			<Button
				onClick={() => setShowModal(true)}
				htmlType="submit"
				className='mt-5 rounded-lg font-semibold text-md leading-7 text-pink_primary py-5 outline-none border-solid border-pink_primary px-7 flex items-center justify-center bg-white'
			>
				Disable Two Factor Authentication
			</Button>
		</>
	);
};

export default Disable2FA;