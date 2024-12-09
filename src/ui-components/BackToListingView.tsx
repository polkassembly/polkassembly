// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { EMembersType } from 'pages/members';
import React from 'react';
import { PageLink, PostCategory } from 'src/global/post_categories';

interface Props {
	postCategory?: PostCategory | EMembersType | PageLink;
	trackName?: string;
	network?: string;
}

const BackToListingView = ({ postCategory, trackName, network }: Props) => {
	let path: string = '';

	if (trackName) {
		path = `${trackName
			.split(/(?=[A-Z])/)
			.join('-')
			.toLowerCase()}`;
	}

	if (postCategory) {
		switch (postCategory) {
			case PostCategory.DISCUSSION:
				path = 'discussions';
				break;
			case PostCategory.GRANT:
				path = 'grants';
				break;
			case PostCategory.REFERENDA:
				path = 'referenda';
				break;
			case PostCategory.PROPOSAL:
				path = 'proposals';
				break;
			case PostCategory.MOTION:
				path = 'motions';
				break;
			case PostCategory.TREASURY_PROPOSAL:
				path = 'treasury-proposals';
				break;
			case PostCategory.TECH_COMMITTEE_PROPOSAL:
				path = 'tech-comm-proposals';
				break;
			case PostCategory.BOUNTY:
				path = network == 'polkadot' ? 'bounties-listing' : 'bounties';
				break;
			case PostCategory.CHILD_BOUNTY:
				path = 'child_bounties';
				break;
			case PostCategory.TIP:
				path = 'tips';
				break;
			case PostCategory.ALLIANCE_MOTION:
				path = 'alliance/motions';
				break;
			case PostCategory.ANNOUNCEMENT:
				path = 'alliance/announcements';
				break;
			case PostCategory.TECHNICAL_PIPS:
				path = 'technical';
				break;
			case PostCategory.UPGRADE_PIPS:
				path = 'upgrade';
				break;
			case PostCategory.COMMUNITY_PIPS:
				path = 'community';
				break;
			case EMembersType.COUNCIL:
				path = 'council';
				break;
			case EMembersType.FELLOWSHIP:
				path = 'fellowship';
				break;
			case EMembersType.WHITELIST:
				path = 'whitelist';
				break;
			case PageLink.OVERVIEW_GOV_2:
				path = 'opengov';
				break;
			case PostCategory.ADVISORY_COMMITTEE:
				path = 'advisory-committee/motions';
				break;
		}
	}

	const listingPageText = postCategory === PostCategory.ADVISORY_COMMITTEE ? 'Motions' : path.replace(/-|_/g, ' ');

	return (
		<Link
			className='inline-flex items-center text-sidebarBlue hover:text-pink_primary dark:text-white'
			href={`/${path}`}
		>
			<div className='flex items-center'>
				<LeftOutlined className='mr-2 text-xs' />
				<span className='text-sm font-medium'>
					Back to <span className='capitalize'>{trackName ? trackName.split(/(?=[A-Z])/).join(' ') : listingPageText}</span>
				</span>
			</div>
		</Link>
	);
};

export default BackToListingView;
