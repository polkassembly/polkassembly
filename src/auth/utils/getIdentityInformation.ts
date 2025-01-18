// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ApiPromise } from '@polkadot/api';
import getEncodedAddress from '~src/util/getEncodedAddress';
import getIdentityRegistrarIndex from '~src/util/getIdentityRegistrarIndex';
import { hexToString, isHex } from '@polkadot/util';
import { IIdentityInfo } from '~src/types';
import { onchainIdentitySupportedNetwork } from '~src/components/AppLayout';

interface Args {
	api?: ApiPromise;
	address: string;
	network: string;
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
	parentProxyAddress: '',
	parentProxyTitle: null,
	twitter: '',
	verifiedByPolkassembly: false,
	web: ''
};

const getParentProxyInfo = async ({ address, api, apiReady, network }: { address: string; api: ApiPromise; apiReady: boolean; network: string }) => {
	if (!api || !apiReady || !address) return { address: '', title: null };

	const proxyInfo = await api?.query?.identity?.superOf(address);
	const formatedProxyInfo: any = proxyInfo?.toHuman();
	if (formatedProxyInfo && formatedProxyInfo?.[0] && getEncodedAddress(formatedProxyInfo?.[0] || '', network)) {
		return { address: formatedProxyInfo?.[0], title: formatedProxyInfo?.[1]?.Raw || null };
	}
	return { address: '', title: null };
};

const getIdentityInformation = async ({ api, address, network }: Args): Promise<IIdentityInfo> => {
	if (!api || !address || !onchainIdentitySupportedNetwork.includes(network)) return result;

	await api?.isReady;
	if (!api?.isReady) return result;

	const encodedQueryAddress = getEncodedAddress(address, network) || address;

	const parentProxyInfo = await getParentProxyInfo({ address: encodedQueryAddress, api: api, apiReady: !!api?.isReady, network });

	const encodedAddress = !!parentProxyInfo && !!parentProxyInfo?.address ? getEncodedAddress(parentProxyInfo?.address, network) : encodedQueryAddress;

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
		parentProxyAddress: parentProxyInfo?.address || '',
		parentProxyTitle: parentProxyInfo?.title || null,
		twitter: identity?.twitter?.Raw || '',
		verifiedByPolkassembly: verifiedByPolkassembly || false,
		web: identity?.web?.Raw || ''
	};
};
export default getIdentityInformation;
