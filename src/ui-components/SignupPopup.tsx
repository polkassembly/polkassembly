// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal } from 'antd';
import Signup from 'pages/signup';
import { dmSans } from 'pages/_app';
import styled from 'styled-components';
import { useNetworkSelector } from '~src/redux/selectors';
import { useState } from 'react';
import { CloseIcon } from './CustomIcons';

interface Props {
	modalOpen: boolean;
	setModalOpen: (pre: boolean) => void;
	isModal?: boolean;
	setLoginOpen?: (pre: boolean) => void;
	className?: string;
	closable?: boolean;
	isDelegation?: boolean;
}

const SignupPopup = ({ modalOpen, setModalOpen, isModal, setLoginOpen, className, closable, isDelegation }: Props) => {
	const { network } = useNetworkSelector();
	const [isClosable, setIsClosable] = useState(true);
	return (
		<Modal
			open={modalOpen}
			footer={false}
			closable={closable}
			maskClosable={closable}
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			className={`${dmSans.variable} ${dmSans.className} ${
				isClosable ? '' : 'hide-close-button'
			} padding-0 w-[605px] max-w-full shrink-0 dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => {
				if (isClosable) {
					setModalOpen(false);
				}
			}}
			closeIcon={isClosable ? <CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' /> : null}
		>
			<Signup
				network={network}
				isModal={isModal}
				setLoginOpen={setLoginOpen}
				setSignupOpen={setModalOpen}
				isDelegation={isDelegation}
				setIsClosable={setIsClosable}
			/>
		</Modal>
	);
};
export default styled(SignupPopup)`
	.padding-0 .ant-modal-content {
		padding: 0px !important;
		border-radius: 4px;
	}

	.hide-close-button .ant-modal-close {
		display: none;
	}
`;
