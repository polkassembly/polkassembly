// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { networkTrackInfo } from '~src/global/post_trackInfo';
import { NetworkTrackInfo } from '../GovAnalytics/types';
import { IPostData } from '~src/context/PostDataContext';

export const showProgressReportUploadFlow = (network: string, trackName: string | undefined, proposalType: string, postData: IPostData) => {
	const allowedTracks = [];
	for (const key in networkTrackInfo[network] as NetworkTrackInfo) {
		if (networkTrackInfo[network]) {
			const group = networkTrackInfo[network][key].group;
			if (group === 'Treasury') {
				allowedTracks.push(
					networkTrackInfo[network][key].name
						?.split('_')
						.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
						.join('')
				);
			}
		}
	}
	if (
		proposalType === 'referendums_v2' &&
		trackName &&
		allowedTracks.includes(trackName) &&
		(postData?.status === 'Executed' || postData?.status === 'Passed' || postData?.status === 'Confirmed' || postData?.status === 'Approved')
	) {
		return true;
	} else {
		return false;
	}
};
