// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { useUserDetailsSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';
import { useTheme } from 'next-themes';
import BountyActionModal from './BountyActionModal';
import { spaceGrotesk } from 'pages/_app';
import { useTranslation } from 'react-i18next';

interface IBountyProposalActionButtonProps {
	className?: string;
}

const BountyProposalActionButton = ({ className }: IBountyProposalActionButtonProps) => {
	const currentUser = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();
	const { id } = currentUser;
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [referendaModal, setReferendaModal] = useState<number>(0);
	const [openLoginPrompt, setOpenLoginPrompt] = useState<boolean>(false);
	const [proposerAddress, setProposerAddress] = useState<string>('');
	const { t } = useTranslation();

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

	return (
		<div className={className}>
			<button
				onClick={() => handleClick(1)}
				className='bounty-button flex w-full cursor-pointer items-center justify-center gap-[6px] rounded-[20px] border-none px-[22px] py-[11px] md:w-auto md:justify-normal '
			>
				<ImageIcon
					src='/assets/bounty-icons/proposal-icon.svg'
					alt='bounty icon'
					imgClassName=''
				/>
				<span className={`${spaceGrotesk.className} ${spaceGrotesk.variable} font-bold text-white`}>{t('create_bounty_proposal')}</span>
			</button>
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

export default BountyProposalActionButton;
