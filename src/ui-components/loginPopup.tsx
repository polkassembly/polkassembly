// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal } from 'antd';
import CloseIcon from 'public/assets/icons/close.svg';
import { poppins } from 'pages/_app';
import Login from 'pages/login';
import styled from 'styled-components';
import { useNetworkSelector } from '~src/redux/selectors';
import { useState } from 'react';

interface Props {
	modalOpen: boolean;
	setModalOpen: (pre: boolean) => void;
	isModal: boolean;
	setSignupOpen: (pre: boolean) => void;
	className?: string;
	closable?: boolean;
	isDelegation?: boolean;
}

const LoginPopup = ({ modalOpen, setModalOpen, isModal, setSignupOpen, className, closable, isDelegation }: Props) => {
	const { network } = useNetworkSelector();
	const [isClosable, setIsClosable] = useState(true);
	return (
		<Modal
			open={modalOpen}
			footer={false}
			closable={closable}
			maskClosable={closable}
			zIndex={1008}
			wrapClassName={className}
			className={`${poppins.variable} ${poppins.className} ${isClosable ? '' : 'hide-close-button'} padding-0 w-[605px]`}
			onCancel={() => {
				if (isClosable) {
					setModalOpen && setModalOpen(false);
				}
			}}
			closeIcon={isClosable ? <CloseIcon /> : null}
		>
			<Login
				network={network}
				isModal={isModal}
				setLoginOpen={setModalOpen}
				setSignupOpen={setSignupOpen}
				isDelegation={isDelegation}
				setIsClosable={setIsClosable}
			/>
		</Modal>
	);
};
export default styled(LoginPopup)`
	.padding-0 .ant-modal-content {
		padding: 0px !important;
		border-radius: 4px;
	}
	.hide-close-button .ant-modal-close {
		display: none;
	}
`;
