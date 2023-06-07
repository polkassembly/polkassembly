// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Collapse, Divider } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import OverallPostsNotification from '~assets/icons/overall-posts-notification-icon.svg';
import GroupCheckbox from '../common-ui/GroupCheckbox';
import BountiesIcon from '~assets/icons/bounties.svg';
import ReferendumsIcon from '~assets/icons/referndums.svg';
import TechCommiteeIcon from '~assets/icons/tech-commitee.svg';
import Toggler from '../common-ui/Toggler';

const { Panel } = Collapse;
type Props = {};

// eslint-disable-next-line no-empty-pattern
export default function OpenGovNotification({}: Props) {
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
                            OpenGov Notifications
						</h3>
						{!!active && <Toggler label='All' selected />}
					</div>
				}
				key='1'
			>
				<div className='flex flex-col'>
					{types.map((data, i) => {
						return (
							<>
								<div className='flex'>
									{data.map((proposal, i) => {
										return (
											<GroupCheckbox
												key={proposal.label}
												categoryOptions={option}
												title={proposal.label}
												classname={
													i === 0
														? 'basis-[50%]'
														: 'border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
												}
												Icon={proposal.Icon}
											/>
										);
									})}
								</div>
								{i < types.length - 1 && (
									<Divider
										className='border-[#D2D8E0] border-2'
										dashed
									/>
								)}
							</>
						);
					})}
				</div>
			</Panel>
		</Collapse>
	);
}

const option = [
	{
		label: 'New Referendum submitted',
		value: 'New Referendum submitted'
	},
	{
		label: 'Referendum in voting ',
		value: 'Referendum in voting '
	},
	{
		label: 'Referendum closed',
		value: 'Referendum closed'
	}
];

const types = [
	[
		{
			Icon: BountiesIcon,
			label: 'Root'
		},
		{
			Icon: ReferendumsIcon,
			label: 'Small Tipper'
		}
	],
	[
		{
			Icon: TechCommiteeIcon,
			label: 'Staking Admin'
		},
		{
			Icon: BountiesIcon,
			label: 'Big Tipper'
		}
	],
	[
		{
			Icon: ReferendumsIcon,
			label: 'Auction Admin'
		},
		{
			Icon: ReferendumsIcon,
			label: 'Small Spender'
		}
	],
	[
		{
			Icon: ReferendumsIcon,
			label: 'Treasurer'
		},
		{
			Icon: TechCommiteeIcon,
			label: 'Medium Spender'
		}
	],
	[
		{
			Icon: BountiesIcon,
			label: 'Referendum Canceler'
		},
		{
			Icon: ReferendumsIcon,
			label: 'Big Spender'
		}
	],
	[
		{
			Icon: ReferendumsIcon,
			label: 'Referendum Killer'
		},
		{
			Icon: ReferendumsIcon,
			label: 'Fellowship Admin'
		}
	],
	[
		{
			Icon: TechCommiteeIcon,
			label: 'Lease Admin'
		},
		{
			Icon: BountiesIcon,
			label: 'General Admin'
		}
	],
	[
		{
			Icon: ReferendumsIcon,
			label: 'Member Referenda'
		},
		{
			Icon: ReferendumsIcon,
			label: 'Whitelisted Call'
		}
	]
];
