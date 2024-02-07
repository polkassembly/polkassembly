// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import ImageIcon from './ImageIcon';
import { MenuProps } from 'antd';
import ThreeDotsIcon from '~assets/icons/three-dots.svg';
import ReferendaActionModal from '~src/components/Forms/ReferendaActionModal';
import styled from 'styled-components';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { Dropdown } from './Dropdown';

const ProposalActionButtons = () => {
	const { resolvedTheme: theme } = useTheme();
	const currentUser = useUserDetailsSelector();
	const { id } = currentUser;
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);
	const [referendaModal, setReferendaModal] = useState<number>(0);
	const [isDropdownActive, setIsDropdownActive] = useState(false);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [openLoginPrompt, setOpenLoginPrompt] = useState<boolean>(false);
	const [proposerAddress, setProposerAddress] = useState<string>('');

	const handleClick = (num: number) => {
		if (id) {
			if (proposerAddress.length > 0) {
				setReferendaModal(num);
				setOpenModal(!openModal);
			} else if (setOpenAddressLinkedModal) {
				setReferendaModal(num);
				setOpenAddressLinkedModal(true);
			}
		} else {
			setOpenLoginPrompt(true);
		}
	};

	const items: MenuProps['items'] = [
		{
			key: '1',
			label: (
				<div
					className='mt-2 flex items-center space-x-2'
					onClick={() => handleClick(2)}
				>
					<ImageIcon
						src='/assets/icons/cancel-referendum-icon.svg'
						alt='cancel referendum icon'
						className=''
					/>
					<div className='flex flex-col text-blue-light-medium dark:text-blue-dark-high'>
						<span className='text-sm font-medium '>Cancel Referendum</span>
						<span className='text-xs font-normal '>Cancel the referendum and return the deposit</span>
					</div>
				</div>
			)
		},
		{
			key: '2',
			label: (
				<div
					className='mb-2 flex items-center space-x-2'
					onClick={() => handleClick(3)}
				>
					<ImageIcon
						src='/assets/icons/kill-referendum-icon.svg'
						alt='kill referendum icon'
						className=''
					/>
					<div className='flex flex-col text-blue-light-medium dark:text-blue-dark-high'>
						<span className='text-sm font-medium '>Kill Referendum</span>
						<span className='text-xs font-normal '>Cancel the referendum and slash the deposit</span>
					</div>
				</div>
			)
		}
	];
	return (
		<>
			<div className='flex items-center justify-between space-x-4'>
				<CustomButton
					// htmlType='submit'
					width={226}
					height={32}
					variant='primary'
					text={
						<div className='flex items-center space-x-1'>
							<ImageIcon
								src='/assets/icons/create-treasury-proposal-icon.svg'
								alt='proposerIcon'
								className='-mt-[2px]'
							/>
							<span>Create Treasury Proposal</span>
						</div>
					}
					onClick={() => handleClick(1)}
				/>
				<div className='-mt-1'>
					<Dropdown
						theme={theme}
						overlayStyle={{ marginTop: '20px' }}
						className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-solid border-section-light-container ${
							theme === 'dark' ? 'border-none bg-section-dark-overlay' : isDropdownActive ? 'bg-section-light-container' : 'bg-white'
						}`}
						overlayClassName='z-[1056'
						placement='bottomRight'
						menu={{ items }}
						onOpenChange={() => setIsDropdownActive(!isDropdownActive)}
					>
						<span className='ml-1 mt-1'>
							<ThreeDotsIcon />
						</span>
					</Dropdown>
				</div>
			</div>

			<ReferendaActionModal
				referendaModal={referendaModal}
				openAddressLinkedModal={openAddressLinkedModal}
				setOpenAddressLinkedModal={setOpenAddressLinkedModal}
				openModal={openModal}
				setOpenModal={setOpenModal}
				openLoginPrompt={openLoginPrompt}
				setOpenLoginPrompt={setOpenLoginPrompt}
				setProposerAddress={setProposerAddress}
			/>
		</>
	);
};

export default styled(ProposalActionButtons)`
	&.ant-dropdown-menu.ant-dropdown-menu-root.ant-dropdown-menu-vertical {
		margin-top: 20px;
	}
`;
