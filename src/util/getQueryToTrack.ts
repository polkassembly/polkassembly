// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { networkTrackInfo } from '~src/global/post_trackInfo';
import { PostOrigin } from '~src/types';

const getQueryToTrack = (track: string, network:string) => {

	const originTrack = track && !Array.isArray(track) && track.split('-').join('_').toUpperCase();
	if(originTrack === 'ROOT'){
		const data = network && networkTrackInfo[network][PostOrigin.ROOT];
		return data;
	}
	else if(originTrack === 'AUCTION_ADMIN'){
		const data = network && networkTrackInfo[network][PostOrigin.AUCTION_ADMIN];
		return data;
	}
	else if(originTrack === 'BIG_SPENDER'){
		const data = network && networkTrackInfo[network][PostOrigin.BIG_SPENDER];
		return data;
	}
	else if(originTrack === 'BIG_TIPPER'){
		const data = network && networkTrackInfo[network][PostOrigin.BIG_TIPPER];
		return data;
	}
	else if(originTrack === 'FELLOWSHIP_ADMIN'){
		const data = network && networkTrackInfo[network][PostOrigin.FELLOWSHIP_ADMIN];
		return data;
	}
	else if(originTrack === 'GENERAL_ADMIN'){
		const data = network && networkTrackInfo[network][PostOrigin.GENERAL_ADMIN];
		return data;
	}
	else if(originTrack === 'LEASE_ADMIN'){
		const data = network && networkTrackInfo[network][PostOrigin.LEASE_ADMIN];
		return data;
	}
	else if(originTrack === 'MEDIUM_SPENDER'){
		const data = network && networkTrackInfo[network][PostOrigin.MEDIUM_SPENDER];
		return data;
	}
	else if(originTrack === 'REFERENDUM_CANCELLER'){
		const data = network && networkTrackInfo[network][PostOrigin.REFERENDUM_CANCELLER];
		return data;
	}
	else if(originTrack === 'REFERENDUM_KILLER'){
		const data = network && networkTrackInfo[network][PostOrigin.REFERENDUM_KILLER];
		return data;
	}
	else if(originTrack === 'SMALL_SPENDER'){
		const data = network && networkTrackInfo[network][PostOrigin.SMALL_SPENDER];
		return data;
	}
	else if(originTrack === 'SMALL_TIPPER'){
		const data = network && networkTrackInfo[network][PostOrigin.SMALL_TIPPER];
		return data;
	}
	else if(originTrack === 'STAKING_ADMIN'){
		const data = network && networkTrackInfo[network][PostOrigin.STAKING_ADMIN];
		return data;
	}
	else if(originTrack === 'TREASURER'){
		const data = network && networkTrackInfo[network][PostOrigin.TREASURER];
		return data;
	}
	else if(originTrack === 'WHITELISTED_CALLER'){
		const data = network && networkTrackInfo[network][PostOrigin.WHITELISTED_CALLER];
		return data;
	}
};

export default getQueryToTrack;