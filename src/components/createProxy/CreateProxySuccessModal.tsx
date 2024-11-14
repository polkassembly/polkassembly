// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal } from 'antd';
import { poppins } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import Image from 'next/image';
import Address from '~src/ui-components/Address';
import { useNetworkSelector } from '~src/redux/selectors';
import SkeletonInput from '~src/basic-components/Skeleton/SkeletonInput';
import useImagePreloader from '~src/hooks/useImagePreloader';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Alert from '~src/basic-components/Alert';
import Link from 'next/link';
import { ProxyAddressResponse } from 'pages/api/v1/accounts/proxyAddress';

interface Props {
	openModal: boolean;
	setOpenModal: (pre: boolean) => void;
	className: string;
	address: string;
}

const CreateProxySuccessModal = ({ openModal, setOpenModal, className, address }: Props) => {
	const { network } = useNetworkSelector();
	const [pureProxyAddress, setPureProxyAddress] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isGifLoaded = useImagePreloader('/assets/Gifs/voted.gif');

	const fetchProxyAddress = async () => {
		if (openModal) {
			setLoading(true);
			setError(null);
			console.log('address', address);

			try {
				const { data, error } = await nextApiClientFetch<ProxyAddressResponse>('/api/v1/accounts/proxyAddress', {
					address,
					network
				});

				if (error) {
					setError(error);
				}
				if (data?.data?.proxyAddress) {
					setPureProxyAddress(data?.data?.proxyAddress);
				}
			} catch (err) {
				console.error('Error fetching proxy address:', err);
				setError('Failed to fetch proxy address');
			} finally {
				setLoading(false);
			}
		}
	};

	useEffect(() => {
		if (!address) return;
		fetchProxyAddress();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [openModal, address, network]);

	return (
		<Modal
			title={false}
			open={openModal}
			footer={false}
			zIndex={1008}
			wrapClassName={' dark:bg-modalOverlayDark rounded-[14px]'}
			className={`${className} ${poppins.variable} ${poppins.className} w-[605px] rounded-[14px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => setOpenModal(false)}
			closeIcon={<CloseIcon className=' text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<div className={`${error && 'pb-10'} pb-2`}>
				{' '}
				<div className='flex items-center justify-center pb-10'>
					<div>
						<div className='-mt-[100px]'>
							<Image
								src={!isGifLoaded ? '/assets/Gifs/voted.svg' : '/assets/Gifs/voted.gif'}
								alt='Voted-successfully'
								width={363}
								height={347}
								priority={true}
							/>
						</div>
						<h2 className={`${poppins.variable} ${poppins.className} -mt-2 text-center text-xl font-semibold text-blue-light-high dark:text-blue-dark-high`}>
							Proxy created successfully
						</h2>
						<div className='ml-5 mt-4 flex flex-col gap-1'>
							<div className='flex items-center gap-2'>
								<span className='w-[104px] text-blue-light-medium dark:text-blue-dark-medium'>With Address:</span>
								<Address
									displayInline
									iconSize={18}
									isTruncateUsername={false}
									address={address}
									destroyTooltipOnHide
								/>
							</div>
							<div className='flex items-center gap-2'>
								<span className='w-[104px] text-blue-light-medium dark:text-blue-dark-medium'>Proxy Address:</span>
								{loading ? (
									<SkeletonInput active />
								) : (
									pureProxyAddress && (
										<Address
											displayInline
											iconSize={18}
											isTruncateUsername={false}
											address={pureProxyAddress}
											destroyTooltipOnHide
										/>
									)
								)}
							</div>
						</div>
					</div>
				</div>
				<Alert
					type='info'
					className={`mx-8 mb-5 h-10 rounded-[4px] text-bodyBlue ${poppins.variable} ${poppins.className}`}
					showIcon
					message={
						<span className='text-sm dark:text-blue-dark-high'>
							Visit{' '}
							<Link
								href='/accounts'
								className='cursor-pointer font-medium text-pink_primary'
							>
								Profile
							</Link>{' '}
							to view proxy address
						</span>
					}
				/>
				{error && (
					<Alert
						type='error'
						className={`mx-10 h-10 rounded-[4px] text-bodyBlue ${poppins.variable} ${poppins.className}`}
						showIcon
						message={<span className='dark:text-blue-dark-high'>{error}</span>}
					/>
				)}
			</div>
		</Modal>
	);
};

export default styled(CreateProxySuccessModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
	}
`;
