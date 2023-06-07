// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Collapse, Divider } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import OverallPostsNotification from '~assets/icons/overall-posts-notification-icon.svg';
import GroupCheckbox from '../common-ui/GroupCheckbox';
import TipsIcon from '~assets/icons/tips.svg';
import BountiesIcon from '~assets/icons/bounties.svg';
import ReferendumsIcon from '~assets/icons/referndums.svg';
import TechCommiteeIcon from '~assets/icons/tech-commitee.svg';
import Toggler from '../common-ui/Toggler';
import TreasuryProposalIcon from '~assets/icons/treasury-proposal.svg';
import { bounties, childBounties, councilMotion, proposal, referendumsV1, techCommittee, tips } from './utils';

const { Panel } = Collapse;
type Props = {};

// eslint-disable-next-line no-empty-pattern
export default function Gov1Notification({}: Props) {
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
                            Gov 1 Notifications
						</h3>
						{!!active && <Toggler label='All' selected />}
					</div>
				}
				key='1'
			>
				<div className='flex flex-col'>
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={referendumsV1}
							title='Referendums'
							classname='basis-[50%]'
							Icon={ReferendumsIcon}
						/>
						<GroupCheckbox
							categoryOptions={proposal}
							title='Proposal'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={TreasuryProposalIcon}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-2' dashed />
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={bounties}
							title='Bounties'
							classname='basis-[50%]'
							Icon={BountiesIcon}
						/>
						<GroupCheckbox
							categoryOptions={childBounties}
							title='Child Bounties'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={BountiesIcon}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-2' dashed />
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={tips}
							title='Tips'
							classname='basis-[50%]'
							Icon={TipsIcon}
						/>
						<GroupCheckbox
							categoryOptions={techCommittee}
							title='Tech Committee'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={TechCommiteeIcon}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-[2px]' dashed />
					<div className='flex'>
						<div className='basis-[50%] flex flex-col gap-[16px]'>
							<GroupCheckbox
								categoryOptions={councilMotion}
								title='Council Motion'
								Icon={TipsIcon}
							/>
						</div>
					</div>

				</div>
			</Panel>
		</Collapse>
	);
}