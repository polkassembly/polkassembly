// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAmbassadorSeedingSteps } from '~src/redux/addAmbassadorSeeding/@types';
import { EAmbassadorActions } from '../types';

const getModalTitleFromSteps = (step: EAmbassadorSeedingSteps, action: EAmbassadorActions) => {
	if (action === EAmbassadorActions.REPLACE_AMBASSADOR && step === EAmbassadorSeedingSteps.CREATE_APPLICANT) {
		return 'Create Replace Applicant';
	} else if (action === EAmbassadorActions.REMOVE_AMBASSADOR && step === EAmbassadorSeedingSteps.CREATE_APPLICANT) {
		return 'Create Removal Applicant';
	} else {
		switch (step) {
			case EAmbassadorSeedingSteps.CREATE_APPLICANT:
				return 'Create Applicant';
			case EAmbassadorSeedingSteps.CREATE_PREIMAGE:
				return 'Create Preimage';
			case EAmbassadorSeedingSteps.CREATE_PROPOSAL:
				return 'Create Proposal';
		}
	}
};
export default getModalTitleFromSteps;
