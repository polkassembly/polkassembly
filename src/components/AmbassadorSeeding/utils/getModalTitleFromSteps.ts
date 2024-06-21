// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAmbassadorSeedingSteps } from '~src/redux/ambassadorSeeding/@types';

const getModalTitleFromSteps = (step: EAmbassadorSeedingSteps) => {
	switch (step) {
		case EAmbassadorSeedingSteps.PROMOTES_CALL:
			return 'Add Rank';
		case EAmbassadorSeedingSteps.CREATE_PREIMAGE:
			return ' Create Amabassador Preimage';
		case EAmbassadorSeedingSteps.CREATE_PROPOSAL:
			return ' Create Amabassador Proposal';
	}
};
export default getModalTitleFromSteps;
