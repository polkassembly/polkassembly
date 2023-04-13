// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ProposalType } from '~src/global/proposalType';

export const onTagClickFilter = (proposalType:ProposalType,trackName:string) => {

	if(proposalType === ProposalType.DISCUSSIONS){
		return 'discussions';
	}

	if(proposalType === ProposalType.REFERENDUMS){
		return 'referenda';
	}

	if(proposalType === ProposalType.DEMOCRACY_PROPOSALS){
		return 'proposals';
	}

	if(proposalType === ProposalType.TREASURY_PROPOSALS){
		return 'treasury-proposals';
	}

	if(proposalType === ProposalType.GRANTS){
		return 'grants';
	}

	if(proposalType === ProposalType.CHILD_BOUNTIES){
		return 'child_bounties';
	}

	if(proposalType === ProposalType.TIPS){
		return 'tips';
	}

	if(proposalType === ProposalType.COUNCIL_MOTIONS){
		return 'motions';
	}

	if(proposalType === ProposalType.TECH_COMMITTEE_PROPOSALS){
		return 'tech-comm-proposals';
	}

	if(proposalType === ProposalType.REFERENDUM_V2){

		if(trackName === 'root'){
			return 'root';
		}
		else if(trackName === 'StackingAdmin'){
			return 'staking-admin';
		}
		else if(trackName === 'AuctionAdmin'){
			return 'auction-admin';
		}
		else if(trackName === 'LeaseAdmin'){
			return 'lease-admin';
		}
		else if(trackName === 'GeneralAdmin'){
			return 'general-admin';
		}
		else if(trackName === 'ReferendumCanceller'){
			return 'referendum-canceller';
		}
		else if(trackName === 'ReferendumKiller'){
			return 'referendum-killer';
		}
		else if(trackName === 'Treasurer'){
			return 'treasurer';
		}
		else if(trackName === 'SmallTipper'){
			return 'small-tipper';
		}
		else if(trackName === 'BigTipper'){
			return 'big-tipper';
		}
		else if(trackName === 'SmallSpender'){
			return 'small-spender';
		}

		else if(trackName === 'MediumSpender'){
			return 'medium-spender';
		}
		else if(trackName === 'BigSpender'){
			return 'big-spender';
		}
		else if(trackName === 'WhitelistedCaller'){
			return 'whitelisted-caller';
		}
		else if(trackName === 'FellowshipAdmin'){
			return 'fellowship-admin';
		}
	}

	if(proposalType === ProposalType.FELLOWSHIP_REFERENDUMS){
		if(trackName === 'Proficients'){
			return 'member-referenda';
		}
	}

	return '';
};
