// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal } from 'antd';
import { dmSans } from 'pages/_app';
import Login from 'pages/login';
import styled from 'styled-components';
import { useNetworkSelector } from '~src/redux/selectors';
import { useState } from 'react';
import { CloseIcon } from './CustomIcons';

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
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			className={`${dmSans.variable} ${dmSans.className} ${
				isClosable ? '' : 'hide-close-button'
			} padding-0 padding-0 w-[605px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => {
				if (isClosable) {
					setModalOpen && setModalOpen(false);
				}
			}}
			closeIcon={isClosable ? <CloseIcon className='mt-2 text-lightBlue dark:text-icon-dark-inactive' /> : null}
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
