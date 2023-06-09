// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Collapse, Divider, Switch } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import OverallPostsNotification from '~assets/icons/overall-posts-notification-icon.svg';
import GroupCheckbox from '../common-ui/GroupCheckbox';
import TipsIcon from '~assets/icons/tips.svg';
import BountiesIcon from '~assets/icons/bounties.svg';
import ReferendumsIcon from '~assets/icons/referndums.svg';
import TechCommiteeIcon from '~assets/icons/tech-commitee.svg';
import TreasuryProposalIcon from '~assets/icons/treasury-proposal.svg';
import { allGov1, titleMapper } from './utils';
import { useNetworkContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';

const { Panel } = Collapse;
type Props = {
    onSetNotification: any;
    userNotification: any;
	sendAllCategoryRequest:any;
	onSetCurrentNetworkNotifications:any
};

export default function Gov1Notification({
	onSetNotification,
	userNotification,
	sendAllCategoryRequest,
	onSetCurrentNetworkNotifications
}: Props) {
	const [active, setActive] = useState<boolean | undefined>(false);
	const [all, setAll] = useState(false);
	const { network } = useNetworkContext();
	const [userData, setUserData] = useState<any>(allGov1);

	useEffect(() => {
		const payload: any = {};
		for (const key in userData) {
			payload[key] = userData?.[key].map((category: any) => {
				return {
					...category,
					selected:
                        userNotification?.[category.triggerName]?.post_types.includes(key) || false
				};
			});
		}
		setUserData(payload);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userNotification]);

	const handleAllClick = (checked: boolean) => {
		Object.keys(userData).map((key) => {
			handleCategoryAllClick(checked, userData[key], key);
		});
		setAll(checked);
	};

	const handleCategoryAllClick = (checked:boolean, categoryOptions:any, title:string) => {
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
		const option = categoryOptions.find((opt: any) => opt.label === value);
		if (!option?.triggerName) {
			return;
		}
		let postTypes =
		notification?.[option.triggerName]?.post_types || [];
		if (checked) {
			if(!postTypes.includes(title))
				postTypes.push(title);
		} else {
			postTypes = postTypes.filter((postType: string) => {
				return postType !== title;
			});
		}
		const payload = {
			network,
			trigger_name: option?.triggerName,
			trigger_preferences: {
				enabled: postTypes.length > 0,
				name: option?.triggerPreferencesName,
				post_types: postTypes
			}
		};
		notification[option.triggerName] = {
			enabled: postTypes.length > 0,
			name: option?.triggerPreferencesName,
			post_types: postTypes
		};
		const userPayload: any = {};
		let allSelected = true;
		for (const key in userData) {
			userPayload[key] = userData[key].map((category: any) => {
				const isSelected =
				category.label === value && key === title? checked: userNotification[category.triggerName]?.post_types.includes(key) || false;

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
                            Gov 1 Notifications
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
				key='5'
			>
				<div className='flex flex-col'>
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={userData[ProposalType.REFERENDUMS]}
							title='Referendums'
							classname='basis-[50%]'
							Icon={ReferendumsIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
						<GroupCheckbox
							categoryOptions={userData[ProposalType.DEMOCRACY_PROPOSALS]}
							title='Proposal'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={TreasuryProposalIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-2' dashed />
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={userData[ProposalType.BOUNTIES]}
							title='Bounties'
							classname='basis-[50%]'
							Icon={BountiesIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
						<GroupCheckbox
							categoryOptions={userData[ProposalType.CHILD_BOUNTIES]}
							title='Child Bounties'
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
							categoryOptions={userData[ProposalType.TIPS]}
							title='Tips'
							classname='basis-[50%]'
							Icon={TipsIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
						<GroupCheckbox
							categoryOptions={userData[ProposalType.TECH_COMMITTEE_PROPOSALS]}
							title='Tech Committee'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={TechCommiteeIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
							sectionAll={all}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-[2px]' dashed />
					<div className='flex'>
						<div className='basis-[50%] flex flex-col gap-[16px]'>
							<GroupCheckbox
								categoryOptions={userData[ProposalType.COUNCIL_MOTIONS]}
								title='Council Motion'
								Icon={TipsIcon}
								onChange={handleChange}
								handleCategoryAllClick={handleCategoryAllClick}
								sectionAll={all}
							/>
						</div>
					</div>
				</div>
			</Panel>
		</Collapse>
	);
}
