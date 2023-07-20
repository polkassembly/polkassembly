// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';

import { ProposalType } from '~src/global/proposalType';
import { IPollVote } from '~src/types';

import CouncilSignals from './CouncilSignals';
import GeneralSignals from './GeneralSignals';

interface IPollProps {
	pollId: string;
	endBlock: number;
	canEdit: boolean;
	votes: IPollVote[];
	proposalType: ProposalType;
}

const Poll: FC<IPollProps> = ({
	pollId,
	endBlock,
	canEdit,
	votes,
	proposalType,
}) => {
	return (
		<>
			<GeneralSignals
				endBlock={endBlock}
				pollId={pollId}
				canEdit={canEdit}
				votes={votes}
				proposalType={proposalType}
			/>
			<CouncilSignals votes={votes} />
		</>
	);
};

export default Poll;
