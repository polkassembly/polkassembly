// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAmbassadorRemovalSteps } from '~src/redux/ambassadorRemoval/@types';
import { EAmbassadorSeedingSteps } from '~src/redux/ambassadorSeeding/@types';
import { EAmbassadorActions } from '../types';

const getModalTitleFromSteps = (step: EAmbassadorSeedingSteps | EAmbassadorRemovalSteps, action: EAmbassadorActions) => {
	if (action === EAmbassadorActions.CREATE_AMBASSADOR) {
		switch (step) {
			case EAmbassadorSeedingSteps.PROMOTES_CALL:
				return 'Create Applicant';
			case EAmbassadorSeedingSteps.CREATE_PREIMAGE:
				return 'Create Preimage';
			case EAmbassadorSeedingSteps.CREATE_PROPOSAL:
				return 'Create Proposal';
		}
	} else {
		switch (step) {
			case EAmbassadorRemovalSteps.REMOVAL_CALL:
				return 'Create Removal Applicant';
			case EAmbassadorRemovalSteps.CREATE_PREIMAGE:
				return 'Create Preimage';
			case EAmbassadorRemovalSteps.CREATE_PROPOSAL:
				return 'Create Proposal';
		}
	}
};
export default getModalTitleFromSteps;
