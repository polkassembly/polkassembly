// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { onChainProxy } from 'pages/api/v1/accounts/proxyAddress';
/* eslint-disable sort-keys */

const CreateProxyModal = dynamic(() => import('~src/components/createProxy/CreateProxyModal'), {
	ssr: false
});
const CreateProxyMainModal = dynamic(() => import('~src/components/createProxy/CreateProxyMainModal'), {
	ssr: false
});
const CreateProxySuccessModal = dynamic(() => import('~src/components/createProxy/CreateProxySuccessModal'), {
	ssr: false
});

export interface IProxyState {
	pureProxyAddress: string | null;
	loading: boolean;
	error: string | null;
}

interface Props {
	openProxyModal: boolean;
	setOpenProxyModal: (pre: boolean) => void;
	className?: string;
}

const ProxyMain = ({ openProxyModal, setOpenProxyModal }: Props) => {
	const { loginAddress } = useUserDetailsSelector();
	const [openProxyMainModal, setOpenProxyMainModal] = useState<boolean>(false);
	const [openProxySuccessModal, setOpenProxySuccessModal] = useState<boolean>(false);
	const [address, setAddress] = useState<string>(loginAddress);
	const { network } = useNetworkSelector();
	const [proxyState, setProxyState] = useState<IProxyState>({
		pureProxyAddress: null as string | null,
		loading: false,
		error: null as string | null
	});

	const fetchProxyAddress = async () => {
		if (openProxySuccessModal) {
			setProxyState((prevState) => ({ ...prevState, loading: true, error: null }));
			try {
				const fetchedProxyAddress = await onChainProxy(address, network);
				setProxyState((prevState) => ({
					...prevState,
					pureProxyAddress: fetchedProxyAddress,
					loading: false
				}));
			} catch (err) {
				console.error('Error fetching proxy address:', err);
				setProxyState((prevState) => ({
					...prevState,
					error: 'Failed to fetch proxy address',
					loading: false
				}));
			}
		}
	};

	useEffect(() => {
		if (!address && !openProxySuccessModal) return;
		fetchProxyAddress();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [openProxySuccessModal, address, network]);

	return (
		<>
			<CreateProxyModal
				openModal={openProxyModal}
				setOpenModal={setOpenProxyModal}
				className=''
				setOpenProxyMainModal={setOpenProxyMainModal}
			/>
			<CreateProxyMainModal
				openModal={openProxyMainModal}
				setOpenModal={setOpenProxyMainModal}
				setOpenProxySuccessModal={setOpenProxySuccessModal}
				setAddress={setAddress}
				address={address}
				className=''
			/>
			<CreateProxySuccessModal
				openModal={openProxySuccessModal}
				setOpenModal={setOpenProxySuccessModal}
				address={address}
				proxyState={proxyState}
				className=''
			/>
		</>
	);
};

export default ProxyMain;
