// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Collapse, Divider } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import OverallPostsNotification from '~assets/icons/overall-posts-notification-icon.svg';
import GroupCheckbox from '../common-ui/GroupCheckbox';
import TipsIcon from '~assets/icons/overall-posts-notification-icon.svg';
import TreasuryProposalIcon from '~assets/icons/treasury-proposal.svg';
import BountiesIcon from '~assets/icons/bounties.svg';
import ReferendumsIcon from '~assets/icons/referndums.svg';
import TechCommiteeIcon from '~assets/icons/tech-commitee.svg';
import Toggler from '../common-ui/Toggler';

const { Panel } = Collapse;
type Props = {};

// eslint-disable-next-line no-empty-pattern
export default function OverallPost({}: Props) {
	const [active, setActive] = useState<boolean | undefined>(false);
	return (
		<Collapse
			size='large'
			className='bg-white'
			expandIconPosition='end'
			expandIcon={({ isActive }) => {
				setActive(isActive);
				return isActive ? <CollapseIcon /> : <ExpandIcon />;
			}}
		>
			<Panel
				header={
					<div className='flex items-center gap-[8px]'>
						<OverallPostsNotification />
						<h3 className='font-semibold text-xl tracking-wide leading-7 text-sidebarBlue mb-0'>
                            Overall Posts
						</h3>
						{!!active && <Toggler label='All' selected />}
					</div>
				}
				key='1'
			>
				<div className='flex flex-col'>
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={treasuryProposal}
							title='Treasury Proposal'
							classname='basis-[50%]'
							Icon={TreasuryProposalIcon}
						/>
						<GroupCheckbox
							categoryOptions={tips}
							title='Tips'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={TipsIcon}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-2' dashed />
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={techCommittee}
							title='Tech Committee'
							classname='basis-[50%]'
							Icon={TechCommiteeIcon}
						/>
						<GroupCheckbox
							categoryOptions={bounties}
							title='Bounties'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={BountiesIcon}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-[2px]' dashed />
					<div className='flex'>
						<div className='basis-[50%] flex flex-col gap-[16px]'>
							<GroupCheckbox
								categoryOptions={referendumsV2}
								title='Referendums'
								sortedList={[
									{
										label: 'Open Gov',
										value: 'Open Gov'
									}
								]}
								unsortedList={[
									{
										label: 'Option for tracks',
										value: 'Option for tracks'
									}
								]}
								Icon={ReferendumsIcon}
							/>
							<GroupCheckbox
								categoryOptions={choices}
								unsortedList={[
									{
										label: 'choices',
										value: 'choices'
									}
								]}
							/>
						</div>
						<GroupCheckbox
							categoryOptions={referendumsV1}
							title='Referendums'
							sortedList={[
								{
									label: 'Gov 1',
									value: 'Gov 1'
								}
							]}
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={ReferendumsIcon}
						/>
					</div>
				</div>
			</Panel>
		</Collapse>
	);
}

const treasuryProposal = [
	{
		label: 'New Treasury Proposals',
		value: 'New Treasury Proposals'
	},
	{
		label: 'Proposals in which you participated',
		value: 'Proposals in which you participated'
	},
	{
		label: 'Proposal Approved or Rejected',
		value: 'Proposal Approved or Rejected'
	},
	{
		label: 'Proposal Awarded',
		value: 'Proposal Awarded'
	}
];

const tips = [
	{
		label: 'New Tips',
		value: 'New Tips'
	},
	{
		label: 'Tips in which you participated',
		value: 'Tips in which you participated'
	},
	{
		label: 'Tips closed or retracted',
		value: 'Tips closed or retracted'
	}
];

const techCommittee = [
	{
		label: 'New Tech Committe Proposals',
		value: 'New Tech Committe Proposals'
	},
	{
		label: 'New vote on Proposals',
		value: 'New vote on Proposals'
	}
];

const bounties = [
	{
		label: 'Bounties in which you participated',
		value: 'Bounties in which you participated'
	},
	{
		label: 'Bounties Approved or Rejected',
		value: 'Bounties Approved or Rejected'
	}
];

const referendumsV1 = [
	{
		label: 'New Referendum',
		value: 'New Referendum'
	},
	{
		label: 'Referendum passed/not passed',
		value: 'Referendum passed/not passed'
	},
	{
		label: 'Referendum Cancelled',
		value: 'Referendum Cancelled'
	},
	{
		label: 'Referendum Executed / not executed',
		value: 'Referendum Executed / not executed'
	}
];

const referendumsV2 = [
	{
		label: 'Treasury',
		value: 'Treasury'
	},
	{
		label: 'Auction',
		value: 'Auction'
	},
	{
		label: 'Staking',
		value: 'Staking'
	},
	{
		label: 'Governance',
		value: 'Governance'
	},
	{
		label: 'Fellowship',
		value: 'Fellowship'
	},
	{
		label: 'Root',
		value: 'Root'
	}
];

const choices = [
	{
		label: 'New Referendum',
		value: 'New Referendum'
	},
	{
		label: 'Referendum passed/not passed',
		value: 'Referendum passed/not passed'
	},
	{
		label: 'Referendum Cancelled',
		value: 'Referendum Cancelled'
	},
	{
		label: 'Referendum Executed / not executed',
		value: 'Referendum Executed / not executed'
	}
];
