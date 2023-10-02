// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { networkTrackInfo } from '~src/global/post_trackInfo';
import { IReducerState } from '../types';
import { fellowShipOptions } from '../OpenGovNotification/utils';

// of the Apache-2.0 license. See the LICENSE file for details.
const ACTIONS = {
	GET_NOTIFICATION_OBJECT: 'get_notification_object',
	GOV_ONE_ALL_CHANGE: 'gov_one_all_change',
	GOV_ONE_PROPOSAL_ALL_CHANGE: 'gov_one_proposal_all_change',
	GOV_ONE_PROPOSAL_SINGLE_CHANGE: 'gov_one_proposal_single_change',
	INITIAL_SET: 'initial_set',
	MY_PROPOSAL_ALL_CHANGE: 'my_proposal_all_change',
	MY_PROPOSAL_SINGLE_CHANGE: 'my_proposal_single_change',
	OPEN_GOV_ALL_CHANGE: 'open_gov_all_change',
	OPEN_GOV_PROPOSAL_ALL_CHANGE: 'open_gov_proposal_all_change',
	OPEN_GOV_PROPOSAL_SINGLE_CHANGE: 'open_gov_proposal_single_change',
	SUBSCRIBED_PROPOSAL_ALL_CHANGE: 'subscribed_proposal_all_change',
	SUBSCRIBED_PROPOSAL_SINGLE_CHANGE: 'subscribed_proposal_single_change'
};

const updateOpenGovAll = (payload: any, state: IReducerState) => {
	const { checked } = payload.params;
	const updatedOpenGov: any = {};
	Object.keys(state.openGov).forEach((key) => {
		updatedOpenGov[key] = state.openGov[key].map((category: any) => ({ ...category, selected: checked }));
	});
	return { ...state, openGov: updatedOpenGov };
};

const updateOpenGovProposalAll = (payload: any, state: IReducerState) => {
	const { checked, key } = payload.params;
	const updatedOpenGov = state.openGov[key].map((category: any) => ({ ...category, selected: checked }));
	return { ...state, openGov: { ...state.openGov, [key]: updatedOpenGov } };
};

const updateOpenGovProposal = (payload: any, state: IReducerState) => {
	const { checked, value, key } = payload.params;
	const updatedOpenGov = state.openGov[key].map((category: any) => (category.label === value ? { ...category, selected: checked } : category));
	return { ...state, openGov: { ...state.openGov, [key]: updatedOpenGov } };
};

const updateGovOneAll = (payload: any, state: IReducerState) => {
	const { checked } = payload.params;
	const updatedGovOne: any = {};
	Object.keys(state.gov1Post).forEach((key) => {
		updatedGovOne[key] = state.gov1Post[key].map((category: any) => ({ ...category, selected: checked }));
	});
	return { ...state, gov1Post: updatedGovOne };
};

const updateGovOneProposalAll = (payload: any, state: IReducerState) => {
	const { checked, key } = payload.params;
	const updatedGovOneKey = state.gov1Post[key].map((category: any) => ({ ...category, selected: checked }));
	return { ...state, gov1Post: { ...state.gov1Post, [key]: updatedGovOneKey } };
};

const updateGovOneProposal = (payload: any, state: IReducerState) => {
	const { checked, value, key } = payload.params;
	const updatedGovOneKey = state.gov1Post[key].map((category: any) => (category.label === value ? { ...category, selected: checked } : category));
	return { ...state, gov1Post: { ...state.gov1Post, [key]: updatedGovOneKey } };
};

const updateALLSubscribedProposal = (payload: any, state: IReducerState) => {
	const { checked } = payload.params;
	const subscribePostPayload = state.subscribePost.map((category: any) => ({
		...category,
		selected: checked
	}));
	return { ...state, subscribePost: subscribePostPayload };
};

const updateSubscribedProposal = (payload: any, state: IReducerState) => {
	const { categoryOptions, checked, value } = payload.params;
	const subscribePostPayload = categoryOptions.map((category: any) => (category.label === value ? { ...category, selected: checked } : category));
	return { ...state, subscribePost: subscribePostPayload };
};

const updateALLMyProposal = (payload: any, state: IReducerState) => {
	const { checked } = payload.params;
	const myProposalPayload = state.myProposal.map((category: any) => ({
		...category,
		selected: checked
	}));
	return { ...state, myProposal: myProposalPayload };
};

const updateMyProposal = (payload: any, state: IReducerState) => {
	const { categoryOptions, checked, value } = payload.params;
	const myProposalPayload = categoryOptions.map((category: any) => (category.label === value ? { ...category, selected: checked } : category));
	return { ...state, myProposal: myProposalPayload };
};

const updateAll = (payload: any, state: IReducerState) => {
	const myProposal = state.myProposal.map((category: any) => {
		return {
			...category,
			selected: payload?.data?.[category.triggerName]?.enabled || false
		};
	});

	const subscribePost = state.subscribePost.map((category: any) => {
		return {
			...category,
			selected: payload?.data?.[category.triggerName]?.enabled || false
		};
	});

	const openGov: any = {};
	for (const key in state.openGov) {
		state.openGov[key] = networkTrackInfo?.[payload.network]?.[key]?.fellowshipOrigin ? fellowShipOptions : state.openGov[key];
		openGov[key] = state.openGov[key]?.map((category: any) => {
			return {
				...category,
				selected: payload?.data?.[category.triggerName]?.tracks.includes(networkTrackInfo?.[payload.network]?.[key]?.trackId) || false
			};
		});
	}

	const gov1Post: any = {};
	for (const key in state.gov1Post) {
		gov1Post[key] = state.gov1Post?.[key].map((category: any) => {
			return {
				...category,
				selected: payload?.data?.[category.triggerName]?.post_types.includes(key) || false
			};
		});
	}

	return {
		gov1Post,
		myProposal,
		openGov,
		subscribePost
	};
};

export {
	ACTIONS,
	updateOpenGovAll,
	updateOpenGovProposalAll,
	updateOpenGovProposal,
	updateGovOneAll,
	updateGovOneProposalAll,
	updateGovOneProposal,
	updateALLSubscribedProposal,
	updateSubscribedProposal,
	updateALLMyProposal,
	updateMyProposal,
	updateAll
};
