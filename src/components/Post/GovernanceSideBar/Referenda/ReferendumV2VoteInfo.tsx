// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';

import { VoteType } from '~src/global/proposalType';

import VotersList from './VotersList';
interface IReferendumV2VoteInfoProps {
	className?: string
	referendumId: number
	voteType: VoteType;
}

const ReferendumV2VoteInfo: FC<IReferendumV2VoteInfoProps> = (props) => {
	const { className, referendumId, voteType } = props;
	return (
		<>
			<VotersList
				className={className}
				referendumId={referendumId}
				voteType={voteType}
			/>
		</>
	);

};

export default React.memo(ReferendumV2VoteInfo);