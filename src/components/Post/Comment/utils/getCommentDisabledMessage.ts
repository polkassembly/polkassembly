// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import messages from '~src/auth/utils/messages';
import { EAllowedCommentor } from '~src/types';

const getCommentDisabledMessage = (allowedCommentors: EAllowedCommentor, isUserOnchainVerified: boolean) => {
	switch (allowedCommentors) {
		case EAllowedCommentor.ALL:
			return null;
		case EAllowedCommentor.NONE:
			return messages.DISABLE_COMMENTS;
		case EAllowedCommentor.ONCHAIN_VERIFIED:
			return isUserOnchainVerified ? null : messages.UNVERIFIED_DISABLE_COMMENTS;
		default:
			return null;
	}
};

export default getCommentDisabledMessage;
