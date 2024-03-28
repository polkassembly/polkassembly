// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Popover } from 'antd';
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import ImageIcon from './ImageIcon';

interface IProps {
	title: string;
	content: string;
}

const waterDropAnimation = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(229, 0, 122, 0.7);
  }
  50% {
    box-shadow: 0 0 15px rgba(229, 0, 122, 1);
  }
  100% {
    box-shadow: 0 0 30px rgba(229, 0, 122, 0.7);
  }
`;

const Circle = styled.div`
	animation: ${waterDropAnimation} 1s ease-in infinite;
	background-color: #e5007a;
	border-radius: 50%;
	height: 10px;
	width: 10px;
`;

const RadiatingCircle: React.FC<IProps> = ({ title, content }) => {
	const [open, setOpen] = useState(false);
	const [visible, setVisible] = useState(true);

	const hide = () => {
		setOpen(false);
		setVisible(false);
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
	};
	return (
		<Popover
			content={<span className='dark:text-blue-dark-high'>{content}</span>}
			title={
				<div className='flex items-center justify-between'>
					<span className='dark:text-blue-dark-medium'>{title}</span>
					<div onClick={hide}>
						<ImageIcon
							src='/assets/icons/close-icon.svg'
							alt='close icon'
							imgClassName='w-4 h-4'
							imgWrapperClassName='flex cursor-pointer text-grey_border dark:text-white'
						/>
					</div>
				</div>
			}
			trigger='click'
			open={open}
			onOpenChange={handleOpenChange}
		>
			<div className={`${visible ? 'visible' : 'hidden'}`}>
				<Circle />
			</div>
		</Popover>
	);
};

export default RadiatingCircle;
