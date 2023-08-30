// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ParsedUrlQuery } from 'querystring';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { EGovType } from '~src/global/proposalType';

export const gov2Routes = [
	'gov-2',
	'opengov',
	'track',
	'preimages',
	'referenda',
	'fellowship',
	'member-referenda',
	'delegation'
];
const commonRoutes = [
	'discussions',
	'calender',
	'user',
	'settings',
	'post',
	'bounties',
	'child_bounties'
];

for (const trackName of Object.keys(networkTrackInfo.kusama)) {
	gov2Routes.push(trackName.split(/(?=[A-Z])/).join('-').toLowerCase());
}

export default function getCurrGovType(pathname: string, query?: ParsedUrlQuery, govType?: EGovType, network?: string): EGovType {
	if (network === 'collectives') {
		return EGovType.GOV1;
	}
	if(pathname === '/referenda'){
		return EGovType.GOV1;
	}
	if (query && query.membersType && ['fellowship', 'whitelist'].includes(String(query.membersType))) {
		return EGovType.OPEN_GOV;
	}
	const isGov2 = gov2Routes.includes(pathname.split('/')[1]);

	if(isGov2){
		return EGovType.OPEN_GOV;
	}else if(govType && !isGov2 && commonRoutes.includes(pathname.split('/')[1]) ){
		return govType;
	}
	return EGovType.GOV1;

}