// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import ImageIcon from './ImageIcon';
import OnchainIdentity from '~src/components/OnchainIdentity';
import { onchainIdentitySupportedNetwork } from '~src/components/AppLayout';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTranslation } from 'next-i18next';

interface Props {
	closeModal: () => void;
}
const BecomeDelegateIdentiyButton = ({ closeModal }: Props) => {
	const { network } = useNetworkSelector();
	const { loginAddress } = useUserDetailsSelector();
	const [open, setOpen] = useState<boolean>(false);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);
	const { t } = useTranslation('common');

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
				{t('to_add_socials_to_your_delegate_profile')}{' '}
				<span
					onClick={() => {
						handleIdentityButtonClick(), closeModal();
					}}
					className='-mt-[2px] inline-flex cursor-pointer text-xs font-medium text-pink_primary'
				>
					<ImageIcon
						src='/assets/delegation-tracks/shield-icon-pink.svg'
						alt='shield icon'
						imgClassName='-mt-[3px] mr-[1.5px]'
					/>{' '}
					{t('set_identity')}
				</span>{' '}
				{t('with_polkassembly')}
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
