// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { networkTrackInfo } from '~src/global/post_trackInfo';
import { PostOrigin } from '~src/types';

const getQueryToTrack = (track: string, network: string) => {
	const originTrack =
		track &&
		!Array.isArray(track) &&
		track.split('-').join('_').toUpperCase();

	switch (originTrack) {
		case 'ROOT':
			return networkTrackInfo[network][PostOrigin.ROOT];
		case 'AUCTION_ADMIN':
			return networkTrackInfo[network][PostOrigin.AUCTION_ADMIN];
		case 'BIG_SPENDER':
			return networkTrackInfo[network][PostOrigin.BIG_SPENDER];
		case 'BIG_TIPPER':
			return networkTrackInfo[network][PostOrigin.BIG_TIPPER];
		case 'FELLOWSHIP_ADMIN':
			return networkTrackInfo[network][PostOrigin.FELLOWSHIP_ADMIN];
		case 'GENERAL_ADMIN':
			return networkTrackInfo[network][PostOrigin.GENERAL_ADMIN];
		case 'LEASE_ADMIN':
			return networkTrackInfo[network][PostOrigin.LEASE_ADMIN];
		case 'MEDIUM_SPENDER':
			return networkTrackInfo[network][PostOrigin.MEDIUM_SPENDER];
		case 'REFERENDUM_CANCELLER':
			return networkTrackInfo[network][PostOrigin.REFERENDUM_CANCELLER];
		case 'REFERENDUM_KILLER':
			return networkTrackInfo[network][PostOrigin.REFERENDUM_KILLER];
		case 'WHITELISTED_CALLER':
			return networkTrackInfo[network][PostOrigin.WHITELISTED_CALLER];
		case 'TREASURER':
			return networkTrackInfo[network][PostOrigin.TREASURER];
		case 'SMALL_SPENDER':
			return networkTrackInfo[network][PostOrigin.SMALL_SPENDER];
		case 'STAKING_ADMIN':
			return networkTrackInfo[network][PostOrigin.STAKING_ADMIN];
		case 'SMALL_TIPPER':
			return networkTrackInfo[network][PostOrigin.SMALL_TIPPER];
	}
};

export default getQueryToTrack;
