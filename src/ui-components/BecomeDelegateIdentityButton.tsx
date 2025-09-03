// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import ImageIcon from './ImageIcon';
import OnchainIdentity from '~src/components/OnchainIdentity';
import { onchainIdentitySupportedNetwork } from '~src/components/AppLayout';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';

interface Props {
	closeModal: () => void;
}
const BecomeDelegateIdentiyButton = ({ closeModal }: Props) => {
	const { network } = useNetworkSelector();
	const { loginAddress } = useUserDetailsSelector();
	const [open, setOpen] = useState<boolean>(false);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);

	const handleIdentityButtonClick = () => {
		if (loginAddress?.length) {
			setOpen(!open);
		} else {
			setOpenAddressLinkedModal(true);
		}
	};

	return (
		<>
			<span className='text-xs text-blue-light-medium dark:text-blue-dark-high sm:text-sm'>
				To add socials to your delegate profile{' '}
				<span
					onClick={() => {
						(handleIdentityButtonClick(), closeModal());
					}}
					className='-mt-[2px] inline-flex cursor-pointer text-xs font-medium text-pink_primary'
				>
					<ImageIcon
						src='/assets/delegation-tracks/shield-icon-pink.svg'
						alt='shield icon'
						imgClassName='-mt-[3px] mr-[1.5px]'
					/>{' '}
					Set identity
				</span>{' '}
				with Polkassembly
			</span>
			{onchainIdentitySupportedNetwork.includes(network) && (
				<OnchainIdentity
					open={open}
					setOpen={setOpen}
					openAddressModal={openAddressLinkedModal}
					setOpenAddressModal={setOpenAddressLinkedModal}
				/>
			)}
		</>
	);
};

export default BecomeDelegateIdentiyButton;
