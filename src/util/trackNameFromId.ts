// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { networkTrackInfo } from '~src/global/post_trackInfo';

export const getTrackNameFromId = (network: string, trackId: any) => {
	let trackName = '';
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	Object.entries(networkTrackInfo?.[network]).forEach(([key, value]) => {
		if (value?.trackId === trackId && !value?.fellowshipOrigin) {
			trackName = value?.name;
		}
	});
	return trackName;
};
