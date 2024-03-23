// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { isGrantsSupported } from '~src/global/grantsNetworks';
import { chainProperties } from '~src/global/networkConstants';
import { OffChainProposalType, ProposalType } from '~src/global/proposalType';
import { network as AllNetworks } from '~src/global/networkConstants';

export const getProposalTypesForNetwork = (network: string) => {
	let proposalTypes: { type: OffChainProposalType | ProposalType }[] = [{ type: OffChainProposalType.DISCUSSIONS }];

	if (chainProperties[network]?.subsquidUrl && network === AllNetworks.ZEITGEIST) {
		proposalTypes.push({ type: ProposalType.ADVISORY_COMMITTEE });
	}

	if (
		chainProperties[network]?.subsquidUrl &&
		![AllNetworks.COLLECTIVES, AllNetworks.POLIMEC, AllNetworks.ROLIMEC, AllNetworks.WESTENDCOLLECTIVES, AllNetworks.POLYMESH].includes(network)
	) {
		proposalTypes = proposalTypes.concat([
			{ type: ProposalType.BOUNTIES },
			{ type: ProposalType.COUNCIL_MOTIONS },
			{ type: ProposalType.DEMOCRACY_PROPOSALS },
			{ type: ProposalType.REFERENDUMS },
			{ type: ProposalType.TIPS },
			{ type: ProposalType.TREASURY_PROPOSALS }
		]);
	}

	if (chainProperties[network]?.subsquidUrl && network === AllNetworks.POLYMESH) {
		proposalTypes = proposalTypes.concat([{ type: ProposalType.COMMUNITY_PIPS }, { type: ProposalType.TECHNICAL_PIPS }, { type: ProposalType.UPGRADE_PIPS }]);
	}

	if (chainProperties[network]?.subsquidUrl && [AllNetworks.POLIMEC, AllNetworks.ROLIMEC].includes(network)) {
		proposalTypes = proposalTypes.concat([
			{ type: ProposalType.COUNCIL_MOTIONS },
			{ type: ProposalType.DEMOCRACY_PROPOSALS },
			{ type: ProposalType.REFERENDUMS },
			{ type: ProposalType.TREASURY_PROPOSALS }
		]);
	}

	if (isGrantsSupported(network)) {
		proposalTypes.push({ type: OffChainProposalType.GRANTS });
	}

	if (network === 'collectives') {
		proposalTypes.push({
			type: ProposalType.FELLOWSHIP_REFERENDUMS
		});
	}

	return proposalTypes;
};
