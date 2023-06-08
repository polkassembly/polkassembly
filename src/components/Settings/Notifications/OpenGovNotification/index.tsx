// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Collapse, Divider, Switch } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import OverallPostsNotification from '~assets/icons/overall-posts-notification-icon.svg';
import GroupCheckbox from '../common-ui/GroupCheckbox';
import BountiesIcon from '~assets/icons/bounties.svg';
import ReferendumsIcon from '~assets/icons/referndums.svg';
import TechCommiteeIcon from '~assets/icons/tech-commitee.svg';
import { useNetworkContext } from '~src/context';

const { Panel } = Collapse;
type Props = {
    onSetNotification: any;
    userNotification: any;
	onSetCurrentNetworkNotifications:any
};

// eslint-disable-next-line no-empty-pattern
export default function OpenGovNotification({
	onSetNotification,
	userNotification,
	onSetCurrentNetworkNotifications
}: Props) {
	const [active, setActive] = useState<boolean | undefined>(false);
	const [all, setAll] = useState(false);

	const [userData, setUserData] = useState(types);
	useEffect(() => {
		setUserData(
			types.map((type: any) => {
				return type.map((item: any) => {
					item.options = options.map((opt: any) => ({
						...opt,
						selected:
                            userNotification[opt.triggerName]?.tracks.includes(item.label) || false
					}));
					return item;
				});
			})
		);
	}, [userNotification]);

	const handleAllClick = (checked: boolean) => {
		setAll(checked);
	};

	const { network } = useNetworkContext();

	const handleChange = (
		categoryOptions: any,
		checked: boolean,
		value: string,
		title: string
	) => {
		const notification = Object.assign({}, userNotification);
		const option = categoryOptions.find((opt: any) => opt.label === value);
		if (!option?.triggerName) {
			return;
		}
		let tracks = notification?.[option.triggerName]?.tracks || [];
		if (checked) {
			if(!tracks.includes(title))
				tracks.push(title);
		} else {
			tracks = tracks.filter((track: string) => track !== title);
		}
		const payload = {
			network,
			trigger_name: option?.triggerName,
			trigger_preferences: {
				enabled: tracks.length > 0,
				name: option?.triggerPreferencesName,
				tracks
			}
		};
		notification[option.triggerName].tracks = tracks;
		const userPayload = userData.map((type: any) => {
			return type.map((item: any) => {
				item.options = options.map((opt: any) =>
					opt.label === value && item.label === title
						? {
							...opt,
							selected: checked
						}
						: {
							...opt,
							selected:
					userNotification[opt.triggerName]?.tracks.includes(item.label) || false
						}
				);
				return item;
			});
		});
		setUserData(userPayload);
		onSetNotification(payload);
		onSetCurrentNetworkNotifications(notification);
	};
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
						{!!active && (
							<>
								<span className='flex gap-[8px] items-center'>
									<Switch
										size='small'
										id='postParticipated'
										onChange={(checked, e) => {
											e.stopPropagation();
											handleAllClick(checked);
										}}
										checked={all}
									/>
									<p className='m-0 text-[#243A57B2]'>All</p>
								</span>
							</>
						)}
					</div>
				}
				key='6'
			>
				<div className='flex flex-col'>
					{userData.map((data, i) => {
						return (
							<>
								<div className='flex'>
									{data.map((proposal, i) => {
										return (
											<GroupCheckbox
												key={proposal.label}
												categoryOptions={
													proposal.options
												}
												title={proposal.label}
												classname={
													i === 0
														? 'basis-[50%]'
														: 'border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
												}
												Icon={proposal.Icon}
												onChange={handleChange}
												sectionAll={all}
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

const options = [
	{
		label: 'New Referendum submitted',
		triggerName: 'openGovReferendumSubmitted',
		triggerPreferencesName: 'openGovReferendumSubmitted',
		value: 'New Referendum submitted'
	},
	{
		label: 'Referendum in voting ',
		triggerName: 'openGovReferendumInVoting',
		triggerPreferencesName: 'openGovReferendumInVoting',
		value: 'Referendum in voting '
	},
	{
		label: 'Referendum closed',
		triggerName: 'openGovReferendumClosed',
		triggerPreferencesName: 'openGovReferendumClosed',
		value: 'Referendum closed'
	}
];

const types = [
	[
		{
			Icon: BountiesIcon,
			label: 'Root',
			options
		},
		{
			Icon: ReferendumsIcon,
			label: 'Small Tipper',
			options
		}
	],
	[
		{
			Icon: TechCommiteeIcon,
			label: 'Staking Admin',
			options
		},
		{
			Icon: BountiesIcon,
			label: 'Big Tipper',
			options
		}
	],
	[
		{
			Icon: ReferendumsIcon,
			label: 'Auction Admin',
			options
		},
		{
			Icon: ReferendumsIcon,
			label: 'Small Spender',
			options
		}
	],
	[
		{
			Icon: ReferendumsIcon,
			label: 'Treasurer',
			options
		},
		{
			Icon: TechCommiteeIcon,
			label: 'Medium Spender',
			options
		}
	],
	[
		{
			Icon: BountiesIcon,
			label: 'Referendum Canceler',
			options
		},
		{
			Icon: ReferendumsIcon,
			label: 'Big Spender',
			options
		}
	],
	[
		{
			Icon: ReferendumsIcon,
			label: 'Referendum Killer',
			options
		},
		{
			Icon: ReferendumsIcon,
			label: 'Fellowship Admin',
			options
		}
	],
	[
		{
			Icon: TechCommiteeIcon,
			label: 'Lease Admin',
			options
		},
		{
			Icon: BountiesIcon,
			label: 'General Admin',
			options
		}
	],
	[
		{
			Icon: ReferendumsIcon,
			label: 'Member Referenda',
			options
		},
		{
			Icon: ReferendumsIcon,
			label: 'Whitelisted Call',
			options
		}
	]
];
