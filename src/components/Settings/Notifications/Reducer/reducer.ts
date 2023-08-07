// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IReducerState } from "../types";
import {
    ACTIONS,
    updateALLMyProposal,
    updateALLSubscribedProposal,
    updateAll,
    updateGovOneAll,
    updateGovOneProposal,
    updateGovOneProposalAll,
    updateMyProposal,
    updateOpenGovAll,
    updateOpenGovProposal,
    updateOpenGovProposalAll,
    updateSubscribedProposal
} from "./action";

// of the Apache-2.0 license. See the LICENSE file for details.
export function reducer(
    state: IReducerState,
    action: { type: string; payload: any }
) {
    switch (action.type) {
        case ACTIONS.INITIAL_SET: {
            return state;
        }
        case ACTIONS.GET_NOTIFICATION_OBJECT: {
            return updateAll(action.payload, state);
        }
        case ACTIONS.MY_PROPOSAL_SINGLE_CHANGE: {
            return updateMyProposal(action.payload, state);
        }
        case ACTIONS.MY_PROPOSAL_ALL_CHANGE: {
            return updateALLMyProposal(action.payload, state);
        }
        case ACTIONS.SUBSCRIBED_PROPOSAL_SINGLE_CHANGE: {
            return updateSubscribedProposal(action.payload, state);
        }
        case ACTIONS.SUBSCRIBED_PROPOSAL_ALL_CHANGE: {
            return updateALLSubscribedProposal(action.payload, state);
        }
        case ACTIONS.GOV_ONE_PROPOSAL_SINGLE_CHANGE: {
            return updateGovOneProposal(action.payload, state);
        }
        case ACTIONS.GOV_ONE_PROPOSAL_ALL_CHANGE: {
            return updateGovOneProposalAll(action.payload, state);
        }
        case ACTIONS.GOV_ONE_ALL_CHANGE: {
            return updateGovOneAll(action.payload, state);
        }
        case ACTIONS.OPEN_GOV_PROPOSAL_SINGLE_CHANGE: {
            return updateOpenGovProposal(action.payload, state);
        }
        case ACTIONS.OPEN_GOV_PROPOSAL_ALL_CHANGE: {
            return updateOpenGovProposalAll(action.payload, state);
        }
        case ACTIONS.OPEN_GOV_ALL_CHANGE: {
            return updateOpenGovAll(action.payload, state);
        }
        default: {
            return state;
        }
    }
}
