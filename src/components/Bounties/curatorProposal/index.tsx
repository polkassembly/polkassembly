// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { useUserDetailsSelector } from '~src/redux/selectors';
// import ImageIcon from '~src/ui-components/ImageIcon';
import { useTheme } from 'next-themes';
import CuratorActionModal from './CuratorActionModal';

interface ICuratorProposalActionButtonProps {
	className?: string;
	bountyId: number;
}

const CuratorProposalActionButton = ({ className, bountyId }: ICuratorProposalActionButtonProps) => {
	const currentUser = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();
	const { id } = currentUser;
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [referendaModal, setReferendaModal] = useState<number>(0);
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

	return (
		<div className={className}>
			<span onClick={() => handleClick(1)}>Assign Curator</span>{' '}
			<CuratorActionModal
				theme={theme}
				referendaModal={referendaModal}
				openAddressLinkedModal={openAddressLinkedModal}
				setOpenAddressLinkedModal={setOpenAddressLinkedModal}
				openModal={openModal}
				setOpenModal={setOpenModal}
				bountyId={bountyId}
				openLoginPrompt={openLoginPrompt}
				setOpenLoginPrompt={setOpenLoginPrompt}
				setProposerAddress={setProposerAddress}
				proposerAddress={proposerAddress}
			/>
		</div>
	);
};

export default CuratorProposalActionButton;
