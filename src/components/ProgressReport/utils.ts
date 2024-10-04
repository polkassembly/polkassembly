// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { networkTrackInfo } from '~src/global/post_trackInfo';
import { NetworkTrackInfo } from '../GovAnalytics/types';
import { IPostData } from '~src/context/PostDataContext';
import { ProposalType } from '~src/global/proposalType';
import { isOpenGovSupported } from '~src/global/openGovNetworks';

export const showProgressReportUploadFlow = (network: string, trackName: string | undefined, proposalType: ProposalType, postData: IPostData) => {
	if (isOpenGovSupported(network)) {
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
		const allowedStatus = ['Executed', 'Passed', 'Confirmed', 'Approved'];
		if (proposalType === ProposalType.OPEN_GOV && allowedTracks.includes(trackName) && allowedStatus.includes(postData?.status)) {
			return true;
		}
	} else {
		if ([ProposalType.TREASURY_PROPOSALS].includes(proposalType)) {
			return true;
		}
	}

	return false;
};
