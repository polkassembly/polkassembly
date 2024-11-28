// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useUserDetailsSelector } from '~src/redux/selectors';

const CreateProxyModal = dynamic(() => import('~src/components/createProxy/CreateProxyModal'), {
	ssr: false
});
const CreateProxyMainModal = dynamic(() => import('~src/components/createProxy/CreateProxyMainModal'), {
	ssr: false
});
const CreateProxySuccessModal = dynamic(() => import('~src/components/createProxy/CreateProxySuccessModal'), {
	ssr: false
});

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
				className=''
			/>
		</>
	);
};

export default ProxyMain;
