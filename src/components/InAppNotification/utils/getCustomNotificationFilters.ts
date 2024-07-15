// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECustomNotificationFilters, ENotificationFilters } from '../types';

const getNotificationFiltersFromCustomFilters = (filter: ECustomNotificationFilters) => {
	const allFilter = [
		ENotificationFilters.COMMENTED,
		ENotificationFilters.REPLIED,
		ENotificationFilters.MENTIONED,
		ENotificationFilters.PROPOSALS_CREATED,
		ENotificationFilters.PROPOSALS_STATUS_CHANGED,
		ENotificationFilters.CONTENT_DELETED_BY_MOD,
		ENotificationFilters.FELLOWSHIP_REFERENDUM_CLOSED,
		ENotificationFilters.FELLOWSHIP_REFERENDUM_INVOTING,
		ENotificationFilters.FELLOWSHIP_REFERENDUM_SUBMITTED,
		ENotificationFilters.GOV1_PROPOSAL_CLOSED,
		ENotificationFilters.GOV1_PROPOSAL_INVOTING,
		ENotificationFilters.GOV1_PROPOSAL_SUBMITTED,
		ENotificationFilters.OPENGOV_REFERENDUM_CLOSED,
		ENotificationFilters.OPENGOV_REFERENDUM_INVOTING,
		ENotificationFilters.OPENGOV_REFERENDUM_SUBMITTED,
		ENotificationFilters.OWN_PROPOSAL_CREATED,
		ENotificationFilters.PIP_CLOSED,
		ENotificationFilters.PIP_INVOTING,
		ENotificationFilters.PIP_SUBMITTED
	];
	switch (filter) {
		case ECustomNotificationFilters.ALL:
			return allFilter;

		case ECustomNotificationFilters.PROPOSALS:
			return [
				ENotificationFilters.PROPOSALS_CREATED,
				ENotificationFilters.PROPOSALS_STATUS_CHANGED,
				ENotificationFilters.CONTENT_DELETED_BY_MOD,
				ENotificationFilters.FELLOWSHIP_REFERENDUM_CLOSED,
				ENotificationFilters.FELLOWSHIP_REFERENDUM_INVOTING,
				ENotificationFilters.FELLOWSHIP_REFERENDUM_SUBMITTED,
				ENotificationFilters.GOV1_PROPOSAL_CLOSED,
				ENotificationFilters.GOV1_PROPOSAL_INVOTING,
				ENotificationFilters.GOV1_PROPOSAL_SUBMITTED,
				ENotificationFilters.OPENGOV_REFERENDUM_CLOSED,
				ENotificationFilters.OPENGOV_REFERENDUM_INVOTING,
				ENotificationFilters.OPENGOV_REFERENDUM_SUBMITTED,
				ENotificationFilters.OWN_PROPOSAL_CREATED,
				ENotificationFilters.PIP_CLOSED,
				ENotificationFilters.PIP_INVOTING,
				ENotificationFilters.PIP_SUBMITTED
			];
		case ECustomNotificationFilters.MENTIONS:
			return [ENotificationFilters.MENTIONED];
		case ECustomNotificationFilters.COMMENTS:
			return [ENotificationFilters.COMMENTED, ENotificationFilters.REPLIED];
		default:
			return allFilter;
	}
};

export default getNotificationFiltersFromCustomFilters;
