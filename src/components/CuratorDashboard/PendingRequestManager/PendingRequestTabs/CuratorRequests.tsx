// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { EPendingCuratorReqType } from '~src/types';
import { ProposalType } from '~src/global/proposalType';
import BountyORChildBountySection from './BountyORChildBountySection';

interface Props {
	className?: string;
	reqType: EPendingCuratorReqType;
}

const CuratorRequests = ({ className, reqType }: Props) => {
	return (
		<div className={className}>
			<BountyORChildBountySection
				title='ON-CHAIN BOUNTY REQUESTS'
				proposalType={ProposalType.BOUNTIES}
				reqType={reqType}
			/>
			<BountyORChildBountySection
				title='ON-CHAIN CHILD BOUNTY REQUESTS'
				proposalType={ProposalType.CHILD_BOUNTIES}
				reqType={reqType}
			/>
		</div>
	);
};

export default CuratorRequests;
