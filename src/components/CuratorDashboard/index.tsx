// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import Image from 'next/image';
import { dmSans, spaceGrotesk } from 'pages/_app';
import ImageIcon from '~src/ui-components/ImageIcon';
import CuratorDashboardTabItems from './CuratorDashboardTabs';
import { useTheme } from 'next-themes';
import { useUserDetailsSelector } from '~src/redux/selectors';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';
import BountyActionModal from '../Bounties/bountyProposal/BountyActionModal';
import CustomButton from '~src/basic-components/buttons/CustomButton';

interface Props {
	className?: string;
}

const CuratorDashboard = ({ className }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const { id, loginAddress } = useUserDetailsSelector();
	const [openLoginPrompt, setOpenLoginPrompt] = useState<boolean>(false);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [proposerAddress, setProposerAddress] = useState<string>('');
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);

	const handleClick = () => {
		if (id && !isNaN(id)) {
			if (proposerAddress.length > 0) {
				setOpenModal(!openModal);
			} else if (setOpenAddressLinkedModal) {
				setOpenAddressLinkedModal(true);
			}
		} else {
			setOpenLoginPrompt(true);
		}
	};

	return (
		<div className={className}>
			<main className='mx-3 mt-3'>
				<div className='flex items-center justify-between'>
					<span className={`text-3xl ${spaceGrotesk.className} ${spaceGrotesk.variable} font-bold text-bodyBlue dark:text-blue-dark-high`}>Curator Dashboard</span>
					{!isNaN(id || 0) && !!loginAddress?.length && (
						<CustomButton
							type='primary'
							onClick={handleClick}
							className='bounty-button flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none px-[22px] py-3 md:w-auto md:justify-normal '
						>
							<ImageIcon
								src='/assets/bounty-icons/proposal-icon.svg'
								alt='bounty icon'
								imgClassName=''
							/>
							<span className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-sm font-medium text-white`}>Create Bounty Proposal</span>
						</CustomButton>
					)}
				</div>
				<div>
					{!isNaN(id || 0) && !!loginAddress?.length ? (
						<CuratorDashboardTabItems handleClick={handleClick} />
					) : (
						<div className={`flex h-[900px] ${dmSans.variable} ${dmSans.className} flex-col items-center rounded-xl  px-5 pt-5  md:pt-10`}>
							<Image
								src='/assets/Gifs/login-dislike.gif'
								alt='empty state'
								className='h-80 w-80 p-0'
								width={320}
								height={320}
							/>
							<p className='p-0 text-xl font-medium text-bodyBlue dark:text-white'>Join Polkassembly to see your Curator Dashboard!</p>
							<p className='p-0 text-center text-bodyBlue dark:text-white'>Discuss, contribute and get regular updates from Polkassembly.</p>
							<div className='flex flex-col gap-4 pt-3'>
								<CustomButton
									type='primary'
									onClick={() => setLoginOpen(true)}
									className='w-full cursor-pointer rounded-md px-4 py-3 text-center text-sm text-white lg:w-[480px]'
								>
									Log In
								</CustomButton>
								<CustomButton
									type='default'
									onClick={() => setLoginOpen(true)}
									className='w-full cursor-pointer rounded-md border-[1px] border-solid px-4 py-3 text-center text-sm text-pink_primary lg:w-[480px] lg:border'
								>
									Sign Up
								</CustomButton>
							</div>
						</div>
					)}
				</div>
			</main>
			<SignupPopup
				setLoginOpen={setLoginOpen}
				modalOpen={openSignup}
				setModalOpen={setSignupOpen}
				isModal={true}
			/>
			<LoginPopup
				setSignupOpen={setSignupOpen}
				modalOpen={openLogin}
				setModalOpen={setLoginOpen}
				isModal={true}
			/>
			{!isNaN(id || 0) && !!loginAddress?.length && (
				<BountyActionModal
					theme={theme}
					openAddressLinkedModal={openAddressLinkedModal}
					setOpenAddressLinkedModal={setOpenAddressLinkedModal}
					openModal={openModal}
					setOpenModal={setOpenModal}
					openLoginPrompt={openLoginPrompt}
					setOpenLoginPrompt={setOpenLoginPrompt}
					setProposerAddress={setProposerAddress}
					proposerAddress={proposerAddress}
				/>
			)}
		</div>
	);
};

export default CuratorDashboard;
