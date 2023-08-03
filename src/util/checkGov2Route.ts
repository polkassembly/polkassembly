// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ParsedUrlQuery } from 'querystring';
import { networkTrackInfo } from '~src/global/post_trackInfo';

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

for (const trackName of Object.keys(networkTrackInfo.kusama)) {
	gov2Routes.push(trackName.split(/(?=[A-Z])/).join('-').toLowerCase());
}

function isOtherRouteGov2Route(pathname: string): boolean{
	const wasGov2RouteString = localStorage.getItem('wasGov2Route');
	if(wasGov2RouteString){
		const wasGov2Route = JSON.parse(wasGov2RouteString);
		return ['bounties','child_bounties'].includes(pathname.split('/')[1]) && wasGov2Route;
	}
	return gov2Routes.includes(pathname.split('/')[1]);
}

export default function checkGov2Route(pathname: string, query?: ParsedUrlQuery, prevRoute?: string, network?: string): boolean {

	const isGov2Route = checkGov2RouteUtility(pathname,query,prevRoute,network);
	localStorage.setItem('wasGov2Route',JSON.stringify(isGov2Route));
	return isGov2Route;
}
function checkGov2RouteUtility(pathname: string, query?: ParsedUrlQuery, prevRoute?: string, network?: string): boolean{
	if (network === 'collectives') {
		return false;
	}
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
	else if(prevRoute && gov2Routes.includes(prevRoute.split('/')[1]) && pathname.split('/')[1] === 'bounties'){
		return true;
	}
	else if(prevRoute && gov2Routes.includes(prevRoute.split('/')[1]) && pathname.split('/')[1] === 'child_bounties'){
		return true;
	}
	else if(!prevRoute && pathname.split('/')[1] === 'discussions'){ return false; }

	return isOtherRouteGov2Route(pathname);
}