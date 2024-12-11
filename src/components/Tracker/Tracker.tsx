// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Col, Row } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import ListingContainer from '~src/components/Tracker/ListingContainer';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { useTranslation } from 'next-i18next';

interface ITrackerProps {
	className?: string;
	network: string;
}

const Tracker: FC<ITrackerProps> = ({ className, network }) => {
	const { t } = useTranslation('common');
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
			trackerMap = JSON.parse(global.window?.localStorage.getItem('trackMap') || '{}');
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
			ids[key] = Object.keys(value || {}).map((k) => (key === 'tipProposal' ? String(k) : Number(k)));
		});
		setIds(ids);
	}, []);

	return (
		<>
			<SEOHead
				title={t('tracker')}
				network={network}
			/>
			<div className={className}>
				<h1 className='dashboard-heading mb-4 dark:text-white md:mb-6'>{t('tracker')}</h1>

				{/* Intro and Create Post Button */}
				<div className='flex flex-col md:flex-row'>
					<p className='mb-4 w-full rounded-md bg-white p-4 text-sm font-medium text-sidebarBlue shadow-md dark:bg-section-dark-overlay dark:text-white md:p-8 md:text-base'>
						{t('tracker_description')}
					</p>
				</div>
				<Row gutter={[0, 16]}>
					<Col span={24}>
						<ListingContainer
							title={t('referenda')}
							postIds={ids.referendum}
							proposalType={ProposalType.REFERENDUMS}
						/>
					</Col>
					<Col span={24}>
						<ListingContainer
							title={t('proposals')}
							postIds={ids.proposal}
							proposalType={ProposalType.DEMOCRACY_PROPOSALS}
						/>
					</Col>
					<Col span={24}>
						<ListingContainer
							title={t('motions')}
							postIds={ids.motion}
							proposalType={ProposalType.COUNCIL_MOTIONS}
						/>
					</Col>
					<Col span={24}>
						<ListingContainer
							title={t('treasury_proposals')}
							postIds={ids.treasuryProposal}
							proposalType={ProposalType.TREASURY_PROPOSALS}
						/>
					</Col>
					<Col span={24}>
						<ListingContainer
							title={t('tech_committee_proposals')}
							postIds={ids.techCommitteeProposal}
							proposalType={ProposalType.TECH_COMMITTEE_PROPOSALS}
						/>
					</Col>
					<Col span={24}>
						<ListingContainer
							title={t('tip_proposals')}
							isTip={true}
							postIds={ids.tipProposal}
							proposalType={ProposalType.TIPS}
						/>
					</Col>
					<Col span={24}>
						<ListingContainer
							title={t('bounties')}
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
