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
import { PostOrigin } from '~src/types';
import { networkTrackInfo } from '~src/global/post_trackInfo';

const { Panel } = Collapse;
type Props = {
    onSetNotification: any;
    userNotification: any;
    onSetCurrentNetworkNotifications: any;
    sendAllCategoryRequest: any;
};

// eslint-disable-next-line no-empty-pattern
export default function OpenGovNotification({
	onSetNotification,
	userNotification,
	onSetCurrentNetworkNotifications,
	sendAllCategoryRequest
}: Props) {
	const [active, setActive] = useState<boolean | undefined>(false);
	const [all, setAll] = useState(false);
	const { network } = useNetworkContext();

	const [userData, setUserData] = useState<any>(openGov);
	useEffect(() => {
		const payload: any = {};
		for (const key in userData) {
			payload[key] = userData[key].map((category: any) => {
				return {
					...category,
					selected:
                        userNotification?.[category.triggerName]?.tracks.includes(networkTrackInfo[network][key].trackId) || false
				};
			});
		}
		setUserData(payload);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userNotification]);

	const handleAllClick = (checked: boolean) => {
		console.log(checked);
		Object.keys(userData).map((key) => {
			handleCategoryAllClick(checked, userData[key], key);
		});
		setAll(checked);
	};

	const handleCategoryAllClick = (
		checked: boolean,
		categoryOptions: any,
		title: any
	) => {
		title = titleMapper(title) as string;
		const payload = Object.assign({}, userData);
		payload[title] = categoryOptions.map((category: any) => {
			return {
				...category,
				selected: checked
			};
		});
		setUserData(payload);
		sendAllCategoryRequest(payload[title], checked, title);
	};

	const handleChange = (
		categoryOptions: any,
		checked: boolean,
		value: string,
		title: string
	) => {
		const notification = Object.assign({}, userNotification);
		title = titleMapper(title) as string;
		const id = networkTrackInfo[network][title].trackId;
		const option = categoryOptions.find((opt: any) => opt.label === value);
		if (!option?.triggerName) {
			return;
		}
		let tracks = notification?.[option.triggerName]?.tracks || [];
		if (checked) {
			if (!tracks.includes(id)) tracks.push(id);
		} else {
			tracks = tracks.filter((track: number) => track !== id);
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

		notification[option.triggerName] = {
			enabled: tracks.length > 0,
			name: option?.triggerPreferencesName,
			tracks
		};
		const userPayload: any = {};
		let allSelected = true;
		for (const key in userData) {
			userPayload[key] = userData[key].map((category: any) => {
				const isSelected =
                    category.label === value && key === title? checked : userNotification[ category.triggerName]?.tracks.includes(key) || false;

				if (!isSelected) {
					allSelected = false;
				}

				return category.label === value && key === title
					? {
						...category,
						selected: checked
					}
					: category;
			});
		}
		setUserData(userPayload);
		setAll(allSelected);
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
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={userData[PostOrigin.ROOT]}
							title='Root'
							classname='basis-[50%]'
							Icon={BountiesIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
						<GroupCheckbox
							categoryOptions={userData[PostOrigin.SMALL_TIPPER]}
							title='Small Tipper'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={ReferendumsIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-2' dashed />
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={userData[PostOrigin.STAKING_ADMIN]}
							title='Staking Admin'
							classname='basis-[50%]'
							Icon={TechCommiteeIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
						<GroupCheckbox
							categoryOptions={userData[PostOrigin.BIG_TIPPER]}
							title='Big Tipper'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={BountiesIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-2' dashed />
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={userData[PostOrigin.AUCTION_ADMIN]}
							title='Auction Admin'
							classname='basis-[50%]'
							Icon={ReferendumsIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
						<GroupCheckbox
							categoryOptions={userData[PostOrigin.SMALL_SPENDER]}
							title='Small Spender'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={ReferendumsIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-[2px]' dashed />
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={userData[PostOrigin.TREASURER]}
							title='Treasurer'
							classname='basis-[50%]'
							Icon={ReferendumsIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
						<GroupCheckbox
							categoryOptions={userData[PostOrigin.MEDIUM_SPENDER]}
							title='Medium Spender'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={TechCommiteeIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-[2px]' dashed />
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={userData[PostOrigin.REFERENDUM_CANCELLER]}
							title='Referendum Canceler'
							classname='basis-[50%]'
							Icon={BountiesIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
						<GroupCheckbox
							categoryOptions={userData[PostOrigin.BIG_SPENDER]}
							title='Big Spender'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={ReferendumsIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-[2px]' dashed />
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={userData[PostOrigin.REFERENDUM_KILLER]}
							title='Referendum Killer'
							classname='basis-[50%]'
							Icon={ReferendumsIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
						<GroupCheckbox
							categoryOptions={userData[PostOrigin.FELLOWSHIP_ADMIN]}
							title='Fellowship Admin'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={ReferendumsIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-[2px]' dashed />
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={userData[PostOrigin.LEASE_ADMIN]}
							title='Lease Admin'
							classname='basis-[50%]'
							Icon={TechCommiteeIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
						<GroupCheckbox
							categoryOptions={userData[PostOrigin.GENERAL_ADMIN]}
							title='General Admin'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={BountiesIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-[2px]' dashed />
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={userData[PostOrigin.MEMBERS]}
							title='Member Referenda'
							classname='basis-[50%]'
							Icon={ReferendumsIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
						<GroupCheckbox
							categoryOptions={userData[PostOrigin.WHITELISTED_CALLER]}
							title='Whitelisted Call'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={ReferendumsIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
					</div>

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
		label: 'Referendum in voting',
		triggerName: 'openGovReferendumInVoting',
		triggerPreferencesName: 'openGovReferendumInVoting',
		value: 'Referendum in voting'
	},
	{
		label: 'Referendum closed',
		triggerName: 'openGovReferendumClosed',
		triggerPreferencesName: 'openGovReferendumClosed',
		value: 'Referendum closed'
	}
];

const openGov = {
	[PostOrigin.ROOT]: options,
	[PostOrigin.SMALL_TIPPER]: options,
	[PostOrigin.STAKING_ADMIN]: options,
	// eslint-disable-next-line sort-keys
	[PostOrigin.BIG_TIPPER]: options,
	// eslint-disable-next-line sort-keys
	[PostOrigin.AUCTION_ADMIN]: options,
	[PostOrigin.SMALL_SPENDER]: options,
	[PostOrigin.TREASURER]: options,
	// eslint-disable-next-line sort-keys
	[PostOrigin.MEDIUM_SPENDER]: options,
	[PostOrigin.REFERENDUM_CANCELLER]: options,
	// eslint-disable-next-line sort-keys
	[PostOrigin.BIG_SPENDER]: options,
	[PostOrigin.REFERENDUM_KILLER]: options,
	// eslint-disable-next-line sort-keys
	[PostOrigin.FELLOWSHIP_ADMIN]: options,
	[PostOrigin.LEASE_ADMIN]: options,
	// eslint-disable-next-line sort-keys
	[PostOrigin.GENERAL_ADMIN]: options,
	[PostOrigin.MEMBERS]: options,
	[PostOrigin.WHITELISTED_CALLER]: options
};

const titleMapper = (title:string) => {
	switch(title){
	case 'Root': {
		return PostOrigin.ROOT;
	}
	case 'Small Tipper': {
		return PostOrigin.SMALL_TIPPER;
	}
	case 'Staking Admin': {
		return PostOrigin.STAKING_ADMIN;
	}
	case 'Big Tipper': {
		return PostOrigin.BIG_TIPPER;
	}
	case 'Auction Admin': {
		return PostOrigin.AUCTION_ADMIN;
	}
	case 'Small Spender': {
		return PostOrigin.SMALL_SPENDER;
	}
	case 'Treasurer': {
		return PostOrigin.TREASURER;
	}
	case 'Medium Spender': {
		return PostOrigin.MEDIUM_SPENDER;
	}
	case 'Referendum Canceler': {
		return PostOrigin.REFERENDUM_CANCELLER;
	}
	case 'Big Spender': {
		return PostOrigin.BIG_SPENDER;
	}
	case 'Referendum Killer': {
		return PostOrigin.REFERENDUM_KILLER;
	}
	case 'Fellowship Admin': {
		return PostOrigin.FELLOWSHIP_ADMIN;
	}
	case 'Lease Admin': {
		return PostOrigin.LEASE_ADMIN;
	}
	case 'General Admin': {
		return PostOrigin.GENERAL_ADMIN;
	}
	case 'Member Referenda': {
		return PostOrigin.MEMBERS;
	}
	case 'Whitelisted Call': {
		return PostOrigin.WHITELISTED_CALLER;
	}
	default: {
		return title;
	}
	}
};