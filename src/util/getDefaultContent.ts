// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getProposalTypeTitle, ProposalType } from '~src/global/proposalType';

export const getDefaultContent = ({ proposalType, proposer }: { proposalType: ProposalType; proposer: string | null }) => {
	let content = '';
	if (proposer) {
		content = `This is a ${getProposalTypeTitle(
			proposalType
		)} whose proposer address (${proposer}) is shown in on-chain info below. Only this user can edit this description and the title. If you own this account, login and tell us more about your proposal.`;
	} else {
		content = `This is a ${getProposalTypeTitle(
			proposalType
		)}. Only the proposer can edit this description and the title. If you own this account, login and tell us more about your proposal.`;
	}

	return content;
};
