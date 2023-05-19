// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ParsedUrlQuery } from 'querystring';
import { networkTrackInfo } from '~src/global/post_trackInfo';

export const gov2Routes = [
	'gov-2',
	'track',
	'preimages',
	'referenda',
	'fellowship',
	'member-referenda',
	'delegation'
];

for (const trackName of Object.keys(networkTrackInfo.kusama)) {
	gov2Routes.push(trackName.split(/(?=[A-Z])/).join('-').toLowerCase());
}

export default function checkGov2Route(pathname: string, query?: ParsedUrlQuery, prevRoute?: string): boolean {

	console.log(prevRoute,'pre');
	if(pathname === '/referenda'){
		return false;
	}
	if (query && query.membersType && ['fellowship', 'whitelist'].includes(String(query.membersType))) {
		return true;
	}
	if(prevRoute && gov2Routes.includes(prevRoute.split('/')[1]) && pathname.split('/')[1] === 'discussions'){
		return true;
	}
	else if(prevRoute && gov2Routes.includes(prevRoute.split('/')[1]) && pathname.split('/')[1] === 'post'){
		return true;
	}
	else if(!prevRoute && pathname.split('/')[1] === 'discussions'){ return false; }

	return gov2Routes.includes(pathname.split('/')[1]);
}
