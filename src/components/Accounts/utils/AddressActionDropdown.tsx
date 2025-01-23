// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useMemo, useState } from 'react';
import { MenuProps } from 'antd';
import { useTheme } from 'next-themes';
import ThreeDotsIcon from '~assets/icons/three-dots.svg';
import ProxyMain from '~src/components/createProxy';
import { LinkProxyType, NotificationStatus } from '~src/types';
import { Dropdown } from '~src/ui-components/Dropdown';
import Loader from '~src/ui-components/Loader';
import { useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import queueNotification from '~src/ui-components/QueueNotification';
import CustomButton from '~src/basic-components/buttons/CustomButton';

const AddressActionDropdown = ({
	address,
	type,
	linkedAddresses = [],
	isUsedInProxy,
	isUsedInLandingPage
}: {
	address: string;
	type: LinkProxyType | null;
	linkedAddresses?: Array<{ linked_address: string; is_linked: boolean }>;
	isUsedInProxy?: boolean;
	isUsedInLandingPage?: boolean;
}) => {
	const { resolvedTheme: theme } = useTheme();
	const userDetails = useUserDetailsSelector();
	const { loginAddress, id } = userDetails;
	const [state, setState] = useState({
		isDropdownActive: false,
		loading: false,
		openProxyModal: false
	});

	const isLinked = useMemo(() => {
		if (!Array.isArray(linkedAddresses)) return false;
		const result = linkedAddresses.map((linked) => getSubstrateAddress(linked.linked_address) === getSubstrateAddress(address) && linked.is_linked === true);

		return result.includes(true);
	}, [address, linkedAddresses]);

	const toggleLinkProxy = async () => {
		setState((prevState) => ({ ...prevState, loading: true }));

		try {
			const endpoint = isLinked ? '/api/v1/accounts/unlinkProxy' : '/api/v1/accounts/addProxy';

			const { data, error } = await nextApiClientFetch(endpoint, {
				address: loginAddress,
				linked_address: address,
				type
			});

			if (error && error === 'Document updated successfully') {
				const linkMsg = isLinked ? 'Address has been successfully unlinked.' : 'Address has been successfully linked.';
				queueNotification({
					header: 'Success!',
					message: linkMsg,
					status: NotificationStatus.SUCCESS
				});
				setState((prevState) => ({
					...prevState,
					loading: false
				}));
				window.location.reload();
				return;
			}

			if (error && error != 'Document updated successfully') {
				throw new Error(error);
			}

			const linkMsg = isLinked ? 'Address has been successfully unlinked.' : 'Address has been successfully linked.';

			if (data) {
				queueNotification({
					header: 'Success!',
					message: linkMsg,
					status: NotificationStatus.SUCCESS
				});
				setState((prevState) => ({
					...prevState,
					loading: false
				}));
				window.location.reload();
			}
		} catch (error) {
			console.error('Error toggling link proxy:', error);
			queueNotification({
				header: 'Error!',
				message: 'Failed to toggle link proxy. Please try again.',
				status: NotificationStatus.ERROR
			});

			setState((prevState) => ({ ...prevState, loading: false }));
		}
	};

	const items: MenuProps['items'] = [
		...(address !== loginAddress
			? [
					{
						key: '1',
						label: (
							<div
								onClick={!state.loading ? toggleLinkProxy : undefined}
								className={`mt-1 flex items-center space-x-2 ${state.loading ? 'cursor-not-allowed opacity-50' : ''}`}
							>
								<span className='text-sm text-blue-light-medium dark:text-blue-dark-medium'>
									{state.loading ? (isLinked ? 'Unlinking...' : 'Linking...') : isLinked ? 'Unlink Address' : 'Link Address'}
								</span>
							</div>
						)
					}
			  ]
			: []),
		...(isUsedInProxy
			? []
			: [
					{
						key: '2',
						label: (
							<div
								onClick={() => setState((prevState) => ({ ...prevState, openProxyModal: true }))}
								className='mt-1 flex items-center space-x-2'
							>
								<span className='text-sm text-blue-light-medium dark:text-blue-dark-medium'>Add Proxy</span>
							</div>
						)
					}
			  ])
	];

	return (
		<section>
			{isUsedInLandingPage ? (
				<CustomButton
					variant='primary'
					className={`px-2 text-xs font-normal ${!id && 'opacity-50'}`}
					disabled={!id}
					height={42}
					width={178}
					buttonsize={'14'}
				>
					<span className={'text-sm font-medium tracking-wide'}>Link Address</span>
				</CustomButton>
			) : (
				<div className='rounded-lg border border-solid border-[#F5F5F5] dark:border-separatorDark'>
					<Dropdown
						theme={theme}
						overlayStyle={{ marginTop: '20px' }}
						className={`flex h-8 w-8 ${
							state.loading ? 'cursor-not-allowed' : 'cursor-pointer'
						} items-center justify-center rounded-lg border border-solid border-section-light-container dark:border-separatorDark ${
							theme === 'dark' ? 'border-none bg-section-dark-overlay' : 'bg-white hover:bg-section-light-container'
						}`}
						overlayClassName='z-[1056]'
						placement='bottomRight'
						menu={{ items }}
						onOpenChange={() => setState((prevState) => ({ ...prevState, isDropdownActive: !prevState.isDropdownActive }))}
					>
						<span className='dark:bg-section-dark-background'>{state.loading ? <Loader /> : <ThreeDotsIcon />}</span>
					</Dropdown>
					<ProxyMain
						openProxyModal={state.openProxyModal}
						setOpenProxyModal={(open) => setState((prevState) => ({ ...prevState, openProxyModal: open }))}
					/>
				</div>
			)}
		</section>
	);
};

export default AddressActionDropdown;
