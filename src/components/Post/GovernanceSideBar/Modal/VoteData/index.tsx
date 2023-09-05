// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { getVotingTypeFromProposalType } from '~src/global/proposalType';
import VotersList from './VoteList';
import VoteDataIcon from '~assets/icons/vote-data-icon.svg';
import { Divider, Modal } from 'antd';
import CloseIcon from '~assets/icons/close-icon.svg';
interface IVoteDataModal {
  setOpen?: any;
  open?: any;
  onchainId?: any;
  proposalType?: any;
  thresholdData?: {
    curvesError: any;
    curvesLoading: any;
    data: any;
    progress: any;
    setData: any;
  };
}

const VoteDataModal: FC<IVoteDataModal> = ({
	setOpen,
	open,
	onchainId,
	proposalType,
	thresholdData
}) => {
	return (
		<Modal
			title={
				<div className='mr-[-24px] ml-[-24px] text-[18px]'>
					<h3 className='ml-[24px] mb-0 font-semibold text-[#243A57] flex align-center gap-2'>
						<span className='top-1 relative'>
							<VoteDataIcon />
						</span>
						<span className='text-xl font-semibold text-bodyBlue'>
							Voting Data
						</span>
					</h3>
					<Divider className='text-[#D2D8E0]' />
				</div>
			}
			open={open}
			closable
			closeIcon={<CloseIcon />}
			className={'sm:w-[600px] lg:w-[1040px]'}
			onCancel={() => {
				setOpen(false);
			}}
			footer={null}
		>
			<VotersList
				referendumId={onchainId as number}
				voteType={getVotingTypeFromProposalType(proposalType)}
				thresholdData={thresholdData}
			/>
		</Modal>
	);
};

export default VoteDataModal;
