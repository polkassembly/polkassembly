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
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { Dropdown } from './Dropdown';
import dynamic from 'next/dynamic';
import SkeletonButton from '~src/basic-components/Skeleton/SkeletonButton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import CreateProposalsFabIcon from '~assets/icons/create-proposals-fab.svg';
import CreateProposalsFabIconDark from '~assets/icons/create-proposals-fab-dark.svg';
import { isActivityFeedSupportedNetwork } from '~src/components/ActivityFeed/utils/ActivityFeedSupportedNetwork';
import { dmSans } from 'pages/_app';

const OpenGovTreasuryProposal = dynamic(() => import('~src/components/OpenGovTreasuryProposal'), {
	loading: () => (
		<SkeletonButton
			className='w-[100%]'
			active
		/>
	),
	ssr: false
});

interface Props {
	isUsedInHomePage?: boolean;
	isCreateProposal?: boolean;
	isCancelProposal?: boolean;
	isKillProposal?: boolean;
	isUsedInFAB?: boolean;
}

const ProposalActionButtons = ({ isUsedInHomePage = false, isCreateProposal, isCancelProposal, isKillProposal, isUsedInFAB }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const { id } = currentUser;
	const pathname = usePathname();
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);
	const [referendaModal, setReferendaModal] = useState<number>(0);
	const [isDropdownActive, setIsDropdownActive] = useState(false);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [openLoginPrompt, setOpenLoginPrompt] = useState<boolean>(false);
	const [proposerAddress, setProposerAddress] = useState<string>('');
	const router = useRouter();
	const isRelevantPath = ['/activity-feed', '/opengov'].includes(pathname);

	const handleClick = (num: number) => {
		if (id) {
			if (proposerAddress.length > 0) {
				setReferendaModal(num);
				setIsDropdownActive(false);
				setOpenModal(!openModal);
			} else if (setOpenAddressLinkedModal) {
				setReferendaModal(num);
				setIsDropdownActive(false);
				setOpenAddressLinkedModal(true);
			}
		} else {
			setOpenLoginPrompt(true);
		}
	};
	const SwitchViewButton = ({ pathname }: { pathname: string }) => (
		<Link
			href={pathname === '/activity-feed' ? '/opengov' : '/activity-feed'}
			className=''
		>
			<div className='mr-2 mt-1 flex cursor-pointer items-center gap-[2px] whitespace-nowrap rounded-lg border-[1px] border-solid border-[#D2D8E0] bg-[#FFFFFF] px-2 py-[6px] font-dmSans text-[14px] text-[#243A57] dark:border-[#4B4B4B] dark:bg-[#0D0D0D] dark:text-white md:mr-0 md:mt-0 md:w-auto md:gap-1 lg:text-[14px] xl:mr-5 xl:px-3 xl:py-[6px]'>
				Switch to <span className='font-semibold'>{pathname === '/activity-feed' ? 'Overview' : 'Activity Feed'}</span>
				<span>
					<ImageIcon
						src='/assets/icons/loop.svg'
						alt='loop'
						className=' h-4 w-4 lg:h-5 lg:w-5'
					/>
				</span>
			</div>
		</Link>
	);

	const items: MenuProps['items'] = [
		{
			key: '1',
			label: (
				<div
					className='mb-2 flex items-center space-x-2'
					onClick={() => handleClick(1)}
				>
					<ImageIcon
						src='/assets/icons/create-referedum-icon.svg'
						alt='create referendum icon'
						className=''
					/>
					<div className='flex flex-col text-blue-light-medium dark:text-blue-dark-high'>
						<span className='text-sm font-medium '>Create Referendum</span>
						<span className='text-xs font-normal '>Create a referendum across any track</span>
					</div>
				</div>
			)
		},
		{
			key: '2',
			label: (
				<div
					className='mb-2 flex items-center space-x-2'
					onClick={() => handleClick(2)}
				>
					<ImageIcon
						src='/assets/icons/cancel-referendum-icon.svg'
						alt='cancel referendum icon'
						className=''
					/>
					<div className='flex flex-col text-blue-light-medium dark:text-blue-dark-high'>
						<span className='text-sm font-medium '>Cancel Referendum</span>
						<span className='text-xs font-normal '>Cancel a referendum and return the deposit</span>
					</div>
				</div>
			)
		},
		{
			key: '3',
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
						<span className='text-xs font-normal '>Cancel a referendum and slash the deposit</span>
					</div>
				</div>
			)
		}
	];
	return (
		<>
			{isUsedInHomePage && isActivityFeedSupportedNetwork(network) && isRelevantPath && <SwitchViewButton pathname={pathname} />}
			{isUsedInHomePage && (
				<div className='flex justify-between space-x-2 sm:space-x-4'>
					{router.pathname === '/activity-feed' ? (
						<CustomButton
							className='hidden w-min max-sm:p-1.5 xl:block'
							height={32}
							variant='primary'
						>
							<OpenGovTreasuryProposal
								theme={theme}
								isUsedInReferedumComponent={true}
							/>
						</CustomButton>
					) : (
						<CustomButton
							className='  w-min max-sm:p-1.5 '
							height={32}
							variant='primary'
						>
							<OpenGovTreasuryProposal
								theme={theme}
								isUsedInReferedumComponent={true}
							/>
						</CustomButton>
					)}

					<div className='-mt-1'>
						<Dropdown
							theme={theme}
							overlayStyle={{ marginTop: '20px' }}
							className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-solid border-section-light-container  ${
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
			)}
			{isCreateProposal && (
				<CustomButton
					className='w-min'
					variant='primary'
					height={40}
					onClick={() => handleClick(1)}
				>
					<div className='flex items-center space-x-2 text-blue-dark-high'>
						<ImageIcon
							src='/assets/icons/create-proposal-icon.svg'
							alt='create referendum icon'
						/>
						<span className='text-sm font-medium '>Create Proposal</span>
					</div>
				</CustomButton>
			)}
			{isCancelProposal && (
				<CustomButton
					className='w-min'
					variant='primary'
					height={40}
					onClick={() => handleClick(2)}
				>
					<div className='flex items-center space-x-2 text-blue-dark-high'>
						<ImageIcon
							src='/assets/icons/cancel-proposal-icon.svg'
							alt='cancel referendum icon'
							className='-mt-[2px]'
						/>
						<span className='text-sm font-medium '>Cancel Referendum</span>
					</div>
				</CustomButton>
			)}
			{isKillProposal && (
				<CustomButton
					className='w-min'
					variant='primary'
					height={40}
					onClick={() => handleClick(3)}
				>
					<div className='flex items-center space-x-2 text-blue-dark-high'>
						<ImageIcon
							src='/assets/icons/kill-proposal-icon.svg'
							alt='cancel referendum icon'
							className='-mt-[2px]'
						/>
						<span className='text-sm font-medium '>Kill Referendum</span>
					</div>
				</CustomButton>
			)}
			{isUsedInFAB && (
				<div
					className=' flex items-center gap-2 '
					onClick={() => handleClick(1)}
				>
					{theme == 'dark' ? <CreateProposalsFabIconDark /> : <CreateProposalsFabIcon />}
					<span className={`${dmSans.variable} ${dmSans.className} text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium`}>Proposal</span>
				</div>
			)}

			<ReferendaActionModal
				referendaModal={referendaModal}
				openAddressLinkedModal={openAddressLinkedModal}
				setOpenAddressLinkedModal={setOpenAddressLinkedModal}
				openModal={openModal}
				setOpenModal={setOpenModal}
				openLoginPrompt={openLoginPrompt}
				setOpenLoginPrompt={setOpenLoginPrompt}
				setProposerAddress={setProposerAddress}
				theme={theme}
				proposerAddress={proposerAddress}
			/>
		</>
	);
};

export default styled(ProposalActionButtons)`
	&.ant-dropdown-menu.ant-dropdown-menu-root.ant-dropdown-menu-vertical {
		margin-top: 20px;
	}
`;
