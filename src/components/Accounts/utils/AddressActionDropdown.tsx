// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { MenuProps } from 'antd';
import { useTheme } from 'next-themes';
import React, { useState } from 'react';
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
		loading: false
	});

	const addProxy = async () => {
		if (!loginAddress || !address) return;
		setState((prevState) => ({ ...prevState, loading: true }));
		try {
			const { data, error } = await nextApiClientFetch<any>('/api/v1/accounts/addProxy', {
				address: loginAddress,
				type: type,
				linked_address: address
			});

			if (error) {
				throw new Error(error);
			}
			console.log('data', data, error);
		} catch (error) {
			console.error('Error in Linking address:', error);
		} finally {
			setState((prevState) => ({ ...prevState, loading: false }));
		}
	};

	const items: MenuProps['items'] = [
		...(loginAddress !== address
			? [
					{
						key: '1',
						label: (
							<div
								onClick={!state.loading ? addProxy : undefined}
								className={`mt-1 flex items-center space-x-2 ${state.loading ? 'cursor-not-allowed opacity-50' : ''}`}
							>
								<span className={' text-sm text-blue-light-medium dark:text-blue-dark-medium'}>{state.loading ? 'Linking...' : 'Link Address'}</span>
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
								<span className={' text-sm text-blue-light-medium dark:text-blue-dark-medium'}>Add Proxy</span>
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
				<span className=' dark:bg-section-dark-background'>{state.loading ? <Loader /> : <ThreeDotsIcon />}</span>
			</Dropdown>
			<ProxyMain
				openProxyModal={state.openProxyModal}
				setOpenProxyModal={(open) => setState((prevState) => ({ ...prevState, openProxyModal: open }))}
			/>
		</div>
	);
};

export default AddressActionDropdown;
