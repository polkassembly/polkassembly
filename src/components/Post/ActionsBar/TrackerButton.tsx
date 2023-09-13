// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';

import { ProposalType } from '~src/global/proposalType';

interface IDiscussionProps {
	onchainId: string | number;
	proposalType: ProposalType;
}

function getTrackType(proposalType: ProposalType): string {
	switch(proposalType) {
	case ProposalType.BOUNTIES:
		return 'bounty';
	case ProposalType.CHILD_BOUNTIES:
		return 'child_bounty';
	case ProposalType.COUNCIL_MOTIONS:
		return 'motion';
	case ProposalType.DEMOCRACY_PROPOSALS:
		return 'proposal';
	case ProposalType.DISCUSSIONS:
		return 'post';
	case ProposalType.FELLOWSHIP_REFERENDUMS:
		return 'fellowship_referendum';
	case ProposalType.OPEN_GOV:
		return 'referendumV2';
	case ProposalType.REFERENDUMS:
		return 'referendum';
	case ProposalType.TECH_COMMITTEE_PROPOSALS:
		return 'techCommitteeProposal';
	case ProposalType.TIPS:
		return 'tipProposal';
	case ProposalType.TREASURY_PROPOSALS:
		return 'treasuryProposal';
	}
	return 'post';
}

const TrackerButton: FC<IDiscussionProps> = function ({
	onchainId,
	proposalType
}) {
	const [tracked, setTracked] = useState(false);
	const postType = getTrackType(proposalType);

	useEffect(() => {
		let trackMap: any = {};
		try {
			trackMap = JSON.parse(global.window.localStorage.getItem('trackMap') || '{}');
		} catch (error) {
			console.error(error);
		}

		if (trackMap[postType]?.[onchainId]) {
			setTracked(true);
		}
	}, [onchainId, postType]);

	const handleTrack = () => {
		let trackMap: any = {};
		try {
			trackMap = JSON.parse(global.window.localStorage.getItem('trackMap') || '{}');
		} catch (error) {
			console.error(error);
		}

		if (!trackMap[postType]) {
			trackMap[postType] = {};
		}

		if (tracked) {
			delete trackMap[postType][onchainId];
		} else {
			if (onchainId) {
				trackMap[postType][onchainId] = 1;
			}
		}

		global.window.localStorage.setItem('trackMap', JSON.stringify(trackMap));

		queueNotification({
			header: 'Success!',
			message: `Post #${onchainId} ${tracked ? 'removed from' : 'added to'} personal tracker`,
			status: NotificationStatus.SUCCESS
		});

		setTracked(!tracked);
	};

	return (
		<Button
			className={'text-pink_primary flex items-center border-none shadow-none px-1 md:px-2 dark:bg-transparent'}
			onClick={handleTrack}
		>
			{tracked ? <EyeInvisibleOutlined /> : <EyeOutlined />}
			{tracked ? 'Untrack' : 'Track'}
		</Button>
	);
};

export default TrackerButton;
