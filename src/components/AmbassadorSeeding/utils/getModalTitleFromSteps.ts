// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAmbassadorSeedingSteps } from '~src/redux/ambassadorSeeding/@types';

const getModalTitleFromSteps = (step: EAmbassadorSeedingSteps) => {
	switch (step) {
		case EAmbassadorSeedingSteps.PROMOTES_CALL:
			return 'Create Applicant';
		case EAmbassadorSeedingSteps.CREATE_PREIMAGE:
			return ' Create Preimage';
		case EAmbassadorSeedingSteps.CREATE_PROPOSAL:
			return ' Create Proposal';
	}
};
export default getModalTitleFromSteps;
