// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ApiPromise } from '@polkadot/api';
import getEncodedAddress from '~src/util/getEncodedAddress';
import type { RegistrationJudgement } from '@polkadot/types/interfaces';

interface Args {
	api: ApiPromise;
	apiReady: boolean;
	address: string;
	network: string;
}
interface IIdentityInfo {
	display: string;
	legal: string;
	riot: string;
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
	riot: '',
	twitter: '',
	web: ''
};

const getIdentityInformation = async ({ api, apiReady, address, network }: Args): Promise<IIdentityInfo> => {
	if (!api || !apiReady || !address) return result;
	const encodedAddress = getEncodedAddress(address, network) || address;

	const identityInfo: any = await api?.query.identity.identityOf(encodedAddress).then((res: any) => res?.toHuman()?.[0]);

	const infoCall = identityInfo?.judgements.filter(([, judgement]: any[]): boolean => {
		return !!judgement?.FeePaid;
	});

	const unverified = !!infoCall?.length || !identityInfo?.judgements?.length;
	const isGood = identityInfo?.judgements.some(([, judgement]: any[]): boolean => {
		return ['KnownGood', 'Reasonable'].includes(judgement);
	});
	const identity = identityInfo?.info;

	return {
		discord: identity?.discord?.Raw || '',
		display: identity?.display?.Raw || '',
		displayParent: identity?.displayParent?.Raw || '',
		email: identity?.email?.Raw || '',
		github: identity?.github?.Raw || '',
		isGood: isGood || false,
		isIdentitySet: !!identity?.display?.Raw,
		isVerified: !unverified,
		judgements: identityInfo?.judgements || [],
		legal: identity?.legal?.Raw || '',
		matrix: identity?.matrix?.Raw || '',
		nickname: identity?.nickname?.Raw || '',
		riot: identity?.riot?.Raw || '',
		twitter: identity?.twitter?.Raw || '',
		web: identity?.web?.Raw || ''
	};
};
export default getIdentityInformation;
