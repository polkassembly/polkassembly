// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { networkTrackInfo } from '~src/global/post_trackInfo';

export const getTrackNameFromId = (network: string, trackId: any) => {
	let trackName = '';
	if (networkTrackInfo?.[network] && Object?.entries(networkTrackInfo[network])) {
		Object?.entries(networkTrackInfo?.[network]).forEach(([, value]) => {
			if (value?.trackId === trackId && !value?.fellowshipOrigin) {
				trackName = value?.name;
			}
		});
	}
	return trackName;
};
