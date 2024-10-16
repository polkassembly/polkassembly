// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { LeftOutlined } from '@ant-design/icons';
import { spaceGrotesk } from 'pages/_app';
import ImageIcon from '~src/ui-components/ImageIcon';
import { useUserDetailsSelector } from '~src/redux/selectors';
import BountyActionModal from '~src/components/Bounties/bountyProposal/BountyActionModal';
import { useTheme } from 'next-themes';
import CuratorDashboardTabItems from '~src/components/CuratorDashboard';
import SEOHead from '~src/global/SEOHead';
import Image from 'next/image';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';

interface ICuratorProfileProps {
	network: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const network = getNetworkFromReqHeaders(context.req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;
	return {
		props: {
			network
		}
	};
};

const LoginButton = ({ onClick }: { onClick: () => void }) => (
	<p
		onClick={onClick}
		className='w-full cursor-pointer rounded-md bg-[#E5007A] px-4 py-3 text-center text-[14px] text-white lg:w-[480px]'
	>
		Log In
	</p>
);

const SignupButton = ({ onClick }: { onClick: () => void }) => (
	<p
		onClick={onClick}
		className='w-full cursor-pointer rounded-md border-[1px] border-solid border-[#E5007A] px-4 py-3 text-center text-[14px] text-pink_primary lg:w-[480px] lg:border'
	>
		Sign Up
	</p>
);
const CuratorDashboard: FC<ICuratorProfileProps> = (props) => {
	const dispatch = useDispatch();
	const { network } = props;
	const { resolvedTheme: theme } = useTheme();
	const currentUser = useUserDetailsSelector();
	const { id } = currentUser;
	const [openLoginPrompt, setOpenLoginPrompt] = useState<boolean>(false);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [referendaModal, setReferendaModal] = useState<number>(0);
	const [proposerAddress, setProposerAddress] = useState<string>('');
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);

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

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return (
		<div>
			<SEOHead
				title='Curator Dashboard'
				desc='Discover and participate in treasury-funded bounties on Polkassembly, where members can propose and work on projects to improve the governance and growth of our community.'
				network={network}
			/>
			<Link
				className='inline-flex items-center pt-3 text-sidebarBlue hover:text-pink_primary dark:text-white'
				href='/bounty'
			>
				<div className='flex items-center'>
					<LeftOutlined className='mr-2 text-xs' />
					<span className='text-sm font-medium'>
						Back to <span className='capitalize'> Bounty Dashboard</span>
					</span>
				</div>
			</Link>
			<main className='mx-3 mt-3'>
				<div className='flex items-center justify-between'>
					<span className={` text-[32px] ${spaceGrotesk.className} ${spaceGrotesk.variable} font-bold text-blue-light-high dark:text-blue-dark-high`}>Curator Dashboard</span>
					<button
						onClick={() => handleClick(1)}
						className='bounty-button flex w-full cursor-pointer items-center justify-center gap-[6px] rounded-[20px] border-none px-[22px] py-[11px] md:w-auto md:justify-normal '
					>
						<ImageIcon
							src='/assets/bounty-icons/proposal-icon.svg'
							alt='bounty icon'
							imgClassName=''
						/>
						<span className={`${spaceGrotesk.className} ${spaceGrotesk.variable} font-bold text-white`}>Create Bounty Proposal</span>
					</button>
				</div>
				<div>
					{currentUser?.id && currentUser?.username ? (
						<CuratorDashboardTabItems handleClick={handleClick} />
					) : (
						<div className={'flex h-[900px]  flex-col items-center rounded-xl  px-5 pt-5 dark:border-[#4B4B4B] dark:bg-[#0D0D0D] md:pt-10'}>
							<Image
								src='/assets/Gifs/login-dislike.gif'
								alt='empty state'
								className='h-80 w-80 p-0'
								width={320}
								height={320}
							/>
							<p className='p-0 text-xl font-medium text-[#243A57] dark:text-white'>Join Polkassembly to see your Curator Dashboard!</p>
							<p className='p-0 text-center text-[#243A57] dark:text-white'>Discuss, contribute and get regular updates from Polkassembly.</p>
							<div className='pt-3'>
								<LoginButton onClick={() => setLoginOpen(true)} />
								<SignupButton onClick={() => setSignupOpen(true)} />
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
			<BountyActionModal
				theme={theme}
				referendaModal={referendaModal}
				openAddressLinkedModal={openAddressLinkedModal}
				setOpenAddressLinkedModal={setOpenAddressLinkedModal}
				openModal={openModal}
				setOpenModal={setOpenModal}
				openLoginPrompt={openLoginPrompt}
				setOpenLoginPrompt={setOpenLoginPrompt}
				setProposerAddress={setProposerAddress}
				proposerAddress={proposerAddress}
			/>
		</div>
	);
};

export default CuratorDashboard;
