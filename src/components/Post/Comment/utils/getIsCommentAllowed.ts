// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EAllowedCommentor } from '~src/types';

const getIsCommentAllowed = (allowedCommentors: EAllowedCommentor, isUserOnchainVerified: boolean) => {
	switch (allowedCommentors) {
		case EAllowedCommentor.ALL:
			return true;
		case EAllowedCommentor.NONE:
			return false;
		case EAllowedCommentor.ONCHAIN_VERIFIED:
			return isUserOnchainVerified;
		default:
			return true;
	}
};
export default getIsCommentAllowed;
