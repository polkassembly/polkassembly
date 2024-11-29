// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { MenuProps } from 'antd';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import ThreeDotsIcon from '~assets/icons/three-dots.svg';
import ProxyMain from '~src/components/createProxy';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { LinkProxyType } from '~src/types';
import { Dropdown } from '~src/ui-components/Dropdown';
import Loader from '~src/ui-components/Loader';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

const AddressActionDropdown = ({ address, isUsedInProxy, type }: { address: string; isUsedInProxy?: boolean; type: LinkProxyType | null }) => {
	const { resolvedTheme: theme } = useTheme();
	const currentUser = useUserDetailsSelector();
	const { loginAddress } = currentUser;
	const [state, setState] = useState({
		isDropdownActive: false,
		openAddressLinkModal: false,
		openAddressLinkedModal: false,
		openSetIdentityModal: false,
		openProxyModal: false,
		loading: false,
		isLinked: false
	});

	const checkIfLinked = async () => {
		setState((prevState) => ({ ...prevState, loading: true }));
		try {
			const { data, error } = await nextApiClientFetch<any>('/api/v1/accounts/checkIsLinkedProxy', {
				address: loginAddress,
				type: type,
				linked_address: address
			});

			if (error) {
				throw new Error(error);
			}
			setState((prevState) => ({ ...prevState, isLinked: data?.linked, loading: false }));
		} catch (error) {
			console.error('Error checking link status:', error);
			setState((prevState) => ({ ...prevState, loading: false }));
		}
	};

	useEffect(() => {
		if (loginAddress && address) {
			checkIfLinked();
		}
	}, [loginAddress, address]);

	const toggleLinkProxy = async () => {
		if (!loginAddress || !address) return;
		setState((prevState) => ({ ...prevState, loading: true }));

		const endpoint = state.isLinked ? '/api/v1/accounts/unlinkProxy' : '/api/v1/accounts/addProxy';
		const action = state.isLinked ? 'Unlinking...' : 'Linking...';

		try {
			const { data, error } = await nextApiClientFetch<any>(endpoint, {
				address: loginAddress,
				type: type,
				linked_address: address
			});

			if (error) {
				throw new Error(error);
			}
			setState((prevState) => ({
				...prevState,
				isLinked: !state.isLinked,
				loading: false
			}));
			console.log(action, data);
		} catch (error) {
			console.error(`Error in ${state.isLinked ? 'unlinking' : 'linking'} address:`, error);
			setState((prevState) => ({ ...prevState, loading: false }));
		}
	};

	const items: MenuProps['items'] = [
		{
			key: '1',
			label: (
				<div
					onClick={!state.loading ? toggleLinkProxy : undefined}
					className={`mt-1 flex items-center space-x-2 ${state.loading ? 'cursor-not-allowed opacity-50' : ''}`}
				>
					<span className={'text-sm text-blue-light-medium dark:text-blue-dark-medium'}>
						{state.loading ? (state.isLinked ? 'Unlinking...' : 'Linking...') : state.isLinked ? 'Unlink Address' : 'Link Address'}
					</span>
				</div>
			)
		},
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
								<span className={'text-sm text-blue-light-medium dark:text-blue-dark-medium'}>Add Proxy</span>
							</div>
						)
					}
			  ])
	];

	return (
		<div className='rounded-lg border border-solid border-[#F5F5F5] dark:border-separatorDark'>
			<Dropdown
				theme={theme}
				overlayStyle={{ marginTop: '20px' }}
				className={`flex h-8 w-8 ${
					state.loading ? 'cursor-not-allowed' : 'cursor-pointer'
				} items-center justify-center rounded-lg border border-solid border-section-light-container dark:border-separatorDark ${
					theme === 'dark' ? 'border-none bg-section-dark-overlay' : state.isDropdownActive ? 'bg-section-light-container' : 'bg-white'
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
	);
};

export default AddressActionDropdown;
