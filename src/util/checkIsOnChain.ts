// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ApiPromise } from '@polkadot/api';
import { ProposalType } from '~src/global/proposalType';

export async function checkIsOnChain(
	id: number | string,
	postType: ProposalType,
	api: ApiPromise
) {
	let dataFromChain: any[] = [];
	switch (postType) {
	case ProposalType.BOUNTIES:
		return Boolean(await api.query.bounties.bounties(Number(id)));
	case ProposalType.CHILD_BOUNTIES:
		return Boolean(await api.query.childBounties.childBounties(Number(id)));
	case ProposalType.DEMOCRACY_PROPOSALS:
		dataFromChain =
        ((await api.query.democracy.publicProps()).toJSON() as any[]) || [];
		return Boolean(dataFromChain.filter(([id]) => id === id).length);
	case ProposalType.FELLOWSHIP_REFERENDUMS:
		return Boolean(
			await api.query.fellowshipReferenda.referendumInfoFor(Number(id))
		);
	case ProposalType.OPEN_GOV || ProposalType.REFERENDUM_V2:
		return Boolean(await api.query.referenda.referendumInfoFor(Number(id)));
	case ProposalType.TECH_COMMITTEE_PROPOSALS:
		dataFromChain =
        ((await api.query.technicalCommittee.proposals()).toJSON() as any[]) ||
        [];
		return Boolean(dataFromChain.filter(([id]) => id === id).length);
	case ProposalType.TREASURY_PROPOSALS:
		return Boolean((await api.query.treasury.proposals(Number(id))).toJSON());
	case ProposalType.COUNCIL_MOTIONS:
		dataFromChain =
        ((await api.query.council.proposals()).toJSON() as any[]) || [];
		return Boolean(dataFromChain.filter(([id]) => id === id).length);
	case ProposalType.REFERENDUMS:
		return Boolean(
			(await api.query.democracy.referendumInfoOf(Number(id))).toJSON()
		);
	case ProposalType.TIPS:
		return Boolean(await api.query.tips.tips(String(id)));
	}
}
