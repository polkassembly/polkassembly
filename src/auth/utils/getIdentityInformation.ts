// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ApiPromise } from '@polkadot/api';
import getEncodedAddress from '~src/util/getEncodedAddress';
import type { RegistrationJudgement } from '@polkadot/types/interfaces';
import getIdentityRegistrarIndex from '~src/util/getIdentityRegistrarIndex';
import { hexToString, isHex } from '@polkadot/util';

interface Args {
	api?: ApiPromise;
	address: string;
	network: string;
}
interface IIdentityInfo {
	display: string;
	legal: string;
	email: string;
	twitter: string;
	web: string;
	github: string;
	discord: string;
	matrix: string;
	displayParent: string;
	nickname: string;
	isIdentitySet: boolean;
	isVerified: boolean;
	isGood: boolean;
	judgements: RegistrationJudgement[];
	verifiedByPolkassembly: boolean;
}

const result: IIdentityInfo = {
	discord: '',
	display: '',
	displayParent: '',
	email: '',
	github: '',
	isGood: false,
	isIdentitySet: false,
	isVerified: false,
	judgements: [],
	legal: '',
	matrix: '',
	nickname: '',
	twitter: '',
	verifiedByPolkassembly: false,
	web: ''
};

const getIdentityInformation = async ({ api, address, network }: Args): Promise<IIdentityInfo> => {
	if (!api || !address) return result;

	await api.isReady;

	const encodedAddress = getEncodedAddress(address, network) || address;

	const identityInfo: any = await api?.query.identity?.identityOf(encodedAddress).then((res: any) => res?.toHuman()?.[0]);

	const infoCall = identityInfo?.judgements
		? identityInfo?.judgements.filter(([, judgement]: any[]): boolean => {
				return ['KnownGood', 'Reasonable'].includes(judgement);
		  })
		: [];
	const verifiedByPolkassembly = infoCall
		? infoCall.some(([index, judgement]: any[]) => {
				return Number(getIdentityRegistrarIndex({ network })) == index && ['KnownGood', 'Reasonable'].includes(judgement);
		  })
		: false;

	const unverified = !infoCall?.length || !identityInfo?.judgements?.length;
	const isGood = identityInfo?.judgements.some(([, judgement]: any[]): boolean => {
		return ['KnownGood', 'Reasonable'].includes(judgement);
	});
	const identity = identityInfo?.info;

	return {
		discord: identity?.discord?.Raw || '',
		display: isHex(identity?.display?.Raw || '') ? hexToString(identity?.display?.Raw) || identity?.display?.Raw || '' : identity?.display?.Raw || '',
		displayParent: identity?.displayParent?.Raw || '',
		email: identity?.email?.Raw || '',
		github: identity?.github?.Raw || '',
		isGood: isGood || false,
		isIdentitySet: !!identity?.display?.Raw,
		isVerified: !unverified,
		judgements: identityInfo?.judgements || [],
		legal: isHex(identity?.legal?.Raw || '') ? hexToString(identity?.legal?.Raw) || identity?.legal?.Raw || '' : identity?.legal?.Raw || '',
		matrix: identity?.matrix?.Raw || identity?.riot?.Raw || '',
		nickname: identity?.nickname?.Raw || '',
		twitter: identity?.twitter?.Raw || '',
		verifiedByPolkassembly: verifiedByPolkassembly || false,
		web: identity?.web?.Raw || ''
	};
};
export default getIdentityInformation;
