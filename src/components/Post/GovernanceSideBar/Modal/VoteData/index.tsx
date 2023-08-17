// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { getVotingTypeFromProposalType } from '~src/global/proposalType';
import Modal from '~src/ui-components/Modal';
import VotersList from './VoteList';
import VoteDataIcon from '~assets/icons/vote-data-icon.svg';
interface IVoteDataModal {
  setOpen?: any;
  open?: any;
  onchainId?: any;
  proposalType?: any;
}

const VoteDataModal: FC<IVoteDataModal> = ({
	setOpen,
	open,
	onchainId,
	proposalType
}) => {
	return (
		<Modal
			title={<span className='text-xl font-semibold text-bodyBlue'>Voting Data</span>}
			titleIcon={<span className='top-1 relative'><VoteDataIcon /></span>}
			onCancel={() => {
				setOpen(false);
			}}
			open={open}
			onConfirm={() => {}}
		>
			<VotersList
				referendumId={onchainId as number}
				voteType={getVotingTypeFromProposalType(proposalType)}
			/>
		</Modal>
	);
};

export default VoteDataModal;
