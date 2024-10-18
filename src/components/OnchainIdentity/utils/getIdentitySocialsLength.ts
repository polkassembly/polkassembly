// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IIdentityInfo } from '../types';

const getIdentitySocialsLength = (alreadySetIdentityCredentials: IIdentityInfo) => {
	const credentials = [alreadySetIdentityCredentials.email, alreadySetIdentityCredentials.matrix, alreadySetIdentityCredentials.twitter, alreadySetIdentityCredentials.web];
	return credentials.filter((cred: string) => !!cred.length)?.length || 0;
};

export default getIdentitySocialsLength;
