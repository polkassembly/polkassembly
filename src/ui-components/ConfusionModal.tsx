// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { CloseIcon } from './CustomIcons';

interface Props {
	modalOpen: boolean;
	setModalOpen: (pre: boolean) => void;
	className?: string;
}

const ConfusionModal = ({ modalOpen, setModalOpen, className }: Props) => {
	const [message, setMessage] = useState<string>('');

	return (
		<StyledModal
			open={modalOpen}
			onCancel={() => setModalOpen(false)}
			closeIcon={<CloseIcon className='text-lightBlue' />}
			centered
			zIndex={1002}
			className={className}
			footer={null}
		>
			<div className='gif-container -mt-48'>
				<Image
					src='/assets/Gifs/confused.gif'
					alt='Confusion GIF'
					width={320}
					height={320}
				/>
				<p className='font-medium text-[#243A57]'>Confusion everywhere, It&apos;s a Menace!</p>
			</div>
			<div className='message-input-container rounded-lg p-6 px-10'>
				<p>Add a message</p>
				<input
					type='text'
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder='Hey check out this proposal and help me make a decision.'
				/>
			</div>
		</StyledModal>
	);
};

// Styled components
const StyledModal = styled(Modal)`
	.gif-container {
		text-align: center;
		color: white;
		font-family: 'Poppins', sans-serif;
		font-size: 20px;
		font-weight: 600;
		line-height: 24px;
		letter-spacing: 0.0015em;
		padding: 24px;

		h3 {
			margin-top: 10px;
		}
	}

	.message-input-container {
		position: relative;
		background: #185cf60a;

		input {
			width: 100%;
			padding: 8px;
			border: none;
			background: white;
			border-radius: 4px;
		}

		&::after {
			content: '';
			position: absolute;
			left: 5px;
			bottom: -5px; // Adjust based on your input height
			width: 0;
			height: 0;
			border-style: solid;
			border-width: 10px 10px 0 0; // Creates the arrow shape
			rotate: 180deg;
			border-color: #185cf60a transparent transparent transparent;
			transform: rotate(45deg);
		}
	}
`;

export default ConfusionModal;
