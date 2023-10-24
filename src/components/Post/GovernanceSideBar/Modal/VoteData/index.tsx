// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { getVotingTypeFromProposalType } from '~src/global/proposalType';
import VotersList from './VoteList';
import VoteDataIcon from '~assets/icons/vote-data-icon.svg';
import { Divider, Modal as AntdModal } from 'antd';
import CloseIcon from '~assets/icons/close-icon.svg';
import styled from 'styled-components';
interface IVoteDataModal {
	setOpen?: any;
	open?: any;
	onchainId?: any;
	proposalType?: any;
	tally: any;
	pipsVoters?: any;
	thresholdData?: {
		curvesError: any;
		curvesLoading: any;
		data: any;
		progress: any;
		setData: any;
	};
}

const Modal = styled(AntdModal)`
	.ant-modal-content {
		padding-top: 12px;
	}
`;

const VoteDataModal: FC<IVoteDataModal> = ({ setOpen, open, onchainId, proposalType, thresholdData, tally }) => {
	return (
		<Modal
			wrapClassName='dark:bg-modalOverlayDark'
			title={
				<div className='ml-[-24px] mr-[-24px] text-[18px] dark:bg-section-dark-overlay'>
					<h3 className='align-center mb-0 ml-[24px] flex gap-2 font-semibold text-blue-light-high dark:text-blue-dark-high'>
						<span className='relative top-[3px]'>
							<VoteDataIcon />
						</span>
						<span className='text-xl font-semibold text-bodyBlue dark:text-blue-dark-high'>Voting Data</span>
					</h3>
					<Divider className='my-2 mb-5 text-[#D2D8E0]' />
				</div>
			}
			open={open}
			closable
			closeIcon={<CloseIcon />}
			className={'sm:w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay'}
			onCancel={() => {
				setOpen(false);
			}}
			footer={null}
		>
			<VotersList
				tally={tally}
				referendumId={onchainId as number}
				voteType={getVotingTypeFromProposalType(proposalType)}
				thresholdData={thresholdData}
			/>
		</Modal>
	);
};

export default React.memo(VoteDataModal);
