// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Col, Row } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import ListingContainer from '~src/components/Tracker/ListingContainer';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';

interface ITrackerProps {
  className?: string;
  network: string;
}

const Tracker: FC<ITrackerProps> = ({ className, network }) => {
	const [ids, setIds] = useState({
		bounty: [],
		motion: [],
		proposal: [],
		referendum: [],
		techCommitteeProposal: [],
		tipProposal: [],
		treasuryProposal: []
	});

	useEffect(() => {
		let trackerMap: any = {};
		if (typeof window !== undefined) {
			trackerMap = JSON.parse(
				global.window?.localStorage.getItem('trackMap') || '{}'
			);
		}
		const ids: any = {
			bounty: [],
			motion: [],
			proposal: [],
			referendum: [],
			techCommitteeProposal: [],
			tipProposal: [],
			treasuryProposal: []
		};
		Object.entries(trackerMap || {}).forEach(([key, value]) => {
			ids[key] = Object.keys(value || {}).map((k) =>
				key === 'tipProposal' ? String(k) : Number(k)
			);
		});
		setIds(ids);
	}, []);

	return (
		<>
			<SEOHead title="Tracker" network={network} />
			<div className={className}>
				<h1 className="dashboard-heading mb-4 md:mb-6"> Tracker</h1>

				{/* Intro and Create Post Button */}
				<div className="flex flex-col md:flex-row">
					<p className="text-sidebarBlue text-sm md:text-base font-medium bg-white p-4 md:p-8 rounded-md w-full shadow-md mb-4">
            This is a place to keep track of on chain posts.
					</p>
				</div>
				<Row gutter={[0, 16]}>
					<Col span={24}>
						<ListingContainer
							title="Referenda"
							postIds={ids.referendum}
							proposalType={ProposalType.REFERENDUMS}
						/>
					</Col>
					<Col span={24}>
						<ListingContainer
							title="Proposals"
							postIds={ids.proposal}
							proposalType={ProposalType.DEMOCRACY_PROPOSALS}
						/>
					</Col>
					<Col span={24}>
						<ListingContainer
							title="Motions"
							postIds={ids.motion}
							proposalType={ProposalType.COUNCIL_MOTIONS}
						/>
					</Col>
					<Col span={24}>
						<ListingContainer
							title="Treasury Proposals"
							postIds={ids.treasuryProposal}
							proposalType={ProposalType.TREASURY_PROPOSALS}
						/>
					</Col>
					<Col span={24}>
						<ListingContainer
							title="Tech Committee Proposals"
							postIds={ids.techCommitteeProposal}
							proposalType={ProposalType.TECH_COMMITTEE_PROPOSALS}
						/>
					</Col>
					<Col span={24}>
						<ListingContainer
							title="Tip Proposals"
							isTip={true}
							postIds={ids.tipProposal}
							proposalType={ProposalType.TIPS}
						/>
					</Col>
					<Col span={24}>
						<ListingContainer
							title="Bounties"
							postIds={ids.bounty}
							proposalType={ProposalType.BOUNTIES}
						/>
					</Col>
				</Row>
			</div>
		</>
	);
};

export default Tracker;
