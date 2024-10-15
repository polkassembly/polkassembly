// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { trackEvent } from 'analytics';
import { Modal } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { poppins } from 'pages/_app';
import { useState, useEffect } from 'react';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import ImageIcon from '~src/ui-components/ImageIcon';
import { onchainIdentitySupportedNetwork } from '../AppLayout';
import dynamic from 'next/dynamic';
import LoginPopup from '~src/ui-components/loginPopup';
import SignupPopup from '~src/ui-components/SignupPopup';

const OnchainIdentity = dynamic(() => import('~src/components/OnchainIdentity'), {
	ssr: false
});

interface IFeature {
	title: string;
	description: string;
	image: string;
	path: string;
}

function FeaturesSection() {
	const currentUser = useUserDetailsSelector();
	const [openLogin, setLoginOpen] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [open, setOpen] = useState(false);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState(false);
	const { network } = useNetworkSelector();
	const [identityMobileModal, setIdentityMobileModal] = useState(false);
	const [openSignup, setSignupOpen] = useState(false);
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1024;
	const features = [
		{
			description: 'Delegate your vote and catchup with Delegation Dashboard',
			image: '/assets/features1.svg',
			path: '/delegation',
			title: 'Delegation Dashboard'
		},
		{
			description: 'Vote on top proposals in a single transaction',
			image: '/assets/features2.svg',
			path: '/batch-voting',
			title: 'Batch Voting'
		},
		{
			description: 'Create, Manage and Participate in Bounties',
			image: '/assets/features3.svg',
			path: 'bounty',
			title: 'Bounties'
		},
		{
			description: 'Set identity with Polkassembly at 1/4th of the cost',
			image: '/assets/features4.svg',
			path: '',
			title: 'Identity'
		}
	];

	const handleDotClick = (index: number) => {
		setCurrentIndex(index);
	};

	const handleFeatureClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, feature: IFeature) => {
		if (feature?.title === 'Identity') {
			e.stopPropagation();
			e.preventDefault();
			if (typeof currentUser?.id === 'number' && !isNaN(currentUser.id) && currentUser?.username) {
				trackEvent('set_onchain_identity_clicked', 'opened_identity_verification', {
					userId: currentUser?.id?.toString(),
					userName: currentUser?.username
				});
				handleIdentityButtonClick();
			} else {
				setLoginOpen(true);
			}
		}
	};

	const handleIdentityButtonClick = () => {
		const address = localStorage?.getItem('identityAddress');
		if (isMobile) {
			setIdentityMobileModal(true);
		} else {
			if (address?.length) {
				setOpen(!open);
			} else {
				setOpenAddressLinkedModal(true);
			}
		}
	};

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % features?.length);
		}, 5000);

		return () => clearInterval(interval);
	}, [features?.length]);

	return (
		<div className='mt-5 rounded-xxl border-[0.6px] border-solid border-[#D2D8E0] bg-white p-5 font-poppins text-[13px] dark:border-[#4B4B4B] dark:bg-section-dark-overlay md:p-5 md:pb-3'>
			<div className='flex items-start justify-between gap-2'>
				<div className='flex items-start gap-1'>
					<p className='text-[20px] font-semibold text-[#243A57] dark:text-white'>Features</p>
					<p className='mt-1 rounded-full bg-[#E5007A] p-1 text-[10px] font-bold text-white'>LIVE</p>
				</div>
				<div className='flex gap-2'>
					{features?.map((_, index) => (
						<div
							key={index}
							className={`mt-2 h-2 w-2 cursor-pointer rounded-full ${index === currentIndex ? 'bg-black  dark:bg-[#9E9E9E]' : 'bg-[#D9D9D9] '}`}
							onClick={() => handleDotClick(index)}
						/>
					))}
				</div>
			</div>
			<div className='-mt-2'>
				<Link
					href={features[currentIndex]?.path}
					onClick={(e) => handleFeatureClick(e, features[currentIndex])}
				>
					<Image
						src={features[currentIndex]?.image}
						className='h-full w-full'
						alt={features[currentIndex]?.title}
						width={800}
						height={800}
					/>
					<div className='mt-3'>
						<p className='m-0 text-[16px] font-semibold text-[#243A57] dark:text-white'>{features[currentIndex]?.title}</p>
						<p className='pt-1 text-[14px] text-[#243A57] dark:text-white'>{features[currentIndex]?.description}</p>
					</div>
				</Link>
			</div>
			<Modal
				zIndex={100}
				open={identityMobileModal}
				footer={false}
				closeIcon={<CloseIcon className='font-medium text-lightBlue  dark:text-icon-dark-inactive' />}
				onCancel={() => setIdentityMobileModal(false)}
				className={`${poppins?.className} ${poppins?.variable} w-[600px] max-sm:w-full`}
				title={<span className='-mx-6 flex items-center gap-2 border-0 border-b-[1px] border-solid border-[#E1E6EB] px-6 pb-3 text-xl font-semibold'>On-chain identity</span>}
				wrapClassName='dark:bg-modalOverlayDark'
			>
				<div className='flex flex-col items-center gap-6 py-4 text-center'>
					<ImageIcon
						src='/assets/icons/delegation-empty-state.svg'
						alt='delegation empty state icon'
					/>
					<span className='dark:text-white'>Please use your desktop computer to verify on chain identity</span>
				</div>
			</Modal>
			{onchainIdentitySupportedNetwork?.includes(network) && (
				<OnchainIdentity
					open={open}
					setOpen={setOpen}
					openAddressModal={openAddressLinkedModal}
					setOpenAddressModal={setOpenAddressLinkedModal}
				/>
			)}
			<LoginPopup
				setSignupOpen={setSignupOpen}
				modalOpen={openLogin}
				setModalOpen={setLoginOpen}
				isModal={true}
			/>
			<SignupPopup
				setLoginOpen={setLoginOpen}
				modalOpen={openSignup}
				setModalOpen={setSignupOpen}
				isModal={true}
			/>
		</div>
	);
}

export default FeaturesSection;
