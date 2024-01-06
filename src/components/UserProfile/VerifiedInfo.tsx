// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { VerifiedIcon } from '~src/ui-components/CustomIcons';
import { poppins } from 'pages/_app';
import ImageIcon from '~src/ui-components/ImageIcon';
import ShieldUserIcon from '~assets/icons/shield-user-icon-pink.svg';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { onchainIdentitySupportedNetwork } from '../AppLayout';
import { useNetworkSelector } from '~src/redux/selectors';
import dynamic from 'next/dynamic';
const OnChainIdentity = dynamic(() => import('~src/components/OnchainIdentity'), {
	ssr: false
});

interface Props {
	isCurrentUser?: boolean;
}

const VerifiedInfo = ({ isCurrentUser }: Props) => {
	const isMobile = typeof window !== 'undefined' && window.screen.width < 1024;
	const [open, setOpen] = useState(false);

	const { network } = useNetworkSelector();

	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);

	const handleIdentityButtonClick = () => {
		const address = localStorage.getItem('identityAddress');
		if (isMobile) {
			return;
		} else {
			if (address?.length) {
				setOpen(!open);
			} else {
				setOpenAddressLinkedModal(true);
			}
		}
	};
	return (
		<div className={`p-4 px-2 ${poppins.className} ${poppins.variable}`}>
			<div className='flex items-center gap-x-1'>
				<VerifiedIcon className='scale-125' />
				<p className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>Verified Account</p>
			</div>
			<div className='mt-2'>
				<div className='m-0 flex h-[18px] items-center gap-x-1 whitespace-nowrap p-0 text-xs font-normal text-bodyBlue'>
					This account is verified
					<span className='m-0 flex cursor-pointer gap-x-1 whitespace-nowrap p-0 font-normal text-pink_primary underline'>
						Learn More
						<ImageIcon
							src='/assets/icons/redirect.svg'
							alt='calenderIcon'
							className=''
						/>
					</span>
				</div>
			</div>
			<div className='mt-2'>
				<div className='m-0 flex items-center whitespace-nowrap p-0 text-xs font-normal text-lightBlue'>
					Verified Since:
					<ImageIcon
						src='/assets/icons/greyCalendar.svg'
						alt='calenderIcon'
						className='-mt-0.5 ml-1'
					/>
					<p className='m-0 ml-1 p-0'>27th Jun 2024</p>
				</div>
			</div>

			{/* revert isCurrentUser before pushing */}
			{onchainIdentitySupportedNetwork.includes(network) && !isCurrentUser && (
				<div className='mt-2 flex h-[34px] w-full items-center justify-center rounded-md bg-[#F7F8F9] px-[10px] py-4'>
					<div className='m-0 flex items-center justify-center whitespace-nowrap p-0 text-xs font-normal text-lightBlue'>
						To get a tick on your profile
						<CustomButton
							variant='default'
							icon={<ShieldUserIcon className='mr-1' />}
							className='m-0 ml-2 border-none p-0 text-xs font-medium'
							text='Set Identity'
							onClick={handleIdentityButtonClick}
						/>
					</div>
				</div>
			)}

			{onchainIdentitySupportedNetwork.includes(network) && !isMobile && (
				<OnChainIdentity
					open={open}
					setOpen={setOpen}
					openAddressLinkedModal={openAddressLinkedModal}
					setOpenAddressLinkedModal={setOpenAddressLinkedModal}
				/>
			)}
		</div>
	);
};

export default VerifiedInfo;
