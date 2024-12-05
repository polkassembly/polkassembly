// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { getVotingTypeFromProposalType } from '~src/global/proposalType';
import VotersList from './VoteList';
import { Divider, Modal as AntdModal } from 'antd';
import styled from 'styled-components';
import { CloseIcon, VoteDataIcon } from '~src/ui-components/CustomIcons';
import { IVotesCount } from '~src/types';
import { useTranslation } from 'next-i18next';
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
	ayeNayAbstainCounts: IVotesCount;
}

const Modal = styled(AntdModal)`
	.ant-modal-content {
		padding-top: 12px;
	}
	.ant-modal-content {
		padding: 8px 10px;
	}
	@media (min-width: 420px) {
		.ant-modal-content {
			padding: 20px 24px;
		}
	}
`;

const VoteDataModal: FC<IVoteDataModal> = ({ setOpen, open, onchainId, proposalType, thresholdData, tally, ayeNayAbstainCounts }) => {
	const { t } = useTranslation('common');
	return (
		<Modal
			wrapClassName='dark:bg-modalOverlayDark'
			title={
				<div className='text-[18px] dark:bg-section-dark-overlay'>
					<h3 className='align-center mb-0 flex gap-2 font-semibold text-blue-light-high dark:text-blue-dark-high'>
						<VoteDataIcon className='text-lightBlue dark:text-icon-dark-inactive' />
						<span className='text-xl font-semibold text-bodyBlue dark:text-blue-dark-high'>{t('voting_data')}</span>
					</h3>
					<Divider className='my-2 mb-2 text-section-light-container dark:border-separatorDark min-[450px]:mb-5' />
				</div>
			}
			open={open}
			// closable
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			maskClosable={false}
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
				ayeNayAbstainCounts={ayeNayAbstainCounts}
			/>
		</Modal>
	);
};

export default React.memo(VoteDataModal);
