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
import { titleMapper } from './utils';
import { ProposalType } from '~src/global/proposalType';
import { ACTIONS } from '../Reducer/action';

const { Panel } = Collapse;
type Props = {
    onSetNotification: any;
    userNotification: any;
    dispatch: any;
    options: any;
};

export default function Gov1Notification({
	onSetNotification,
	userNotification,
	dispatch,
	options
}: Props) {
	const [active, setActive] = useState<boolean | undefined>(false);
	const [all, setAll] = useState(false);

	const handleAllClick = (checked: boolean) => {
		dispatch({
			payload: {
				params: { checked }
			},
			type: ACTIONS.GOV_ONE_ALL_CHANGE
		});
		const notification = Object.assign({}, userNotification);
		Object.keys(options).forEach((key) => {
			options[key].forEach((option: any) => {
				if (!option?.triggerName) {
					return;
				}
				let postTypes =
                    notification?.[option.triggerName]?.post_types || [];
				if (checked) {
					if (!postTypes.includes(key)) postTypes.push(key);
				} else {
					postTypes = postTypes.filter((postType: string) => {
						// console.log(postType, title);
						return postType !== key;
					});
				}
				notification[option.triggerName] = {
					enabled: postTypes.length > 0,
					name: option?.triggerPreferencesName,
					post_types: postTypes
				};
			});
		});
		onSetNotification(notification);
		setAll(checked);
	};

	useEffect(() => {
		const allSelected = Object.values(options).every((option: any) =>
			option.every((item: any) => item.selected)
		);
		setAll(allSelected);
	}, [options]);

	const handleCategoryAllClick = (
		checked: boolean,
		categoryOptions: any,
		title: string
	) => {
		title = titleMapper(title) as string;
		dispatch({
			payload: {
				params: { checked, key: title }
			},
			type: ACTIONS.GOV_ONE_PROPOSAL_ALL_CHANGE
		});
		const notification = Object.assign({}, userNotification);
		options[title].forEach((option: any) => {
			if (!option?.triggerName) {
				return;
			}
			let postTypes =
                notification?.[option.triggerName]?.post_types || [];
			if (checked) {
				if (!postTypes.includes(title)) postTypes.push(title);
			} else {
				postTypes = postTypes.filter((postType: string) => {
					// console.log(postType, title);
					return postType !== title;
				});
			}
			notification[option.triggerName] = {
				enabled: postTypes.length > 0,
				name: option?.triggerPreferencesName,
				post_types: postTypes
			};
		});
		onSetNotification(notification);
	};

	const handleChange = (
		categoryOptions: any,
		checked: boolean,
		value: string,
		title: string
	) => {
		title = titleMapper(title) as string;
		dispatch({
			payload: {
				params: { checked, key: title, value }
			},
			type: ACTIONS.GOV_ONE_PROPOSAL_SINGLE_CHANGE
		});
		const notification = Object.assign({}, userNotification);
		const option = categoryOptions.find((opt: any) => opt.label === value);
		if (!option?.triggerName) {
			return;
		}
		let postTypes = notification?.[option.triggerName]?.post_types || [];
		if (checked) {
			if (!postTypes.includes(title)) postTypes.push(title);
		} else {
			postTypes = postTypes.filter((postType: string) => postType !== title);
		}
		notification[option.triggerName] = {
			enabled: postTypes.length > 0,
			name: option?.triggerPreferencesName,
			post_types: postTypes
		};
		onSetNotification(notification);
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
							categoryOptions={options[ProposalType.REFERENDUMS]}
							title='Referendums'
							classname='basis-[50%]'
							Icon={ReferendumsIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
						/>
						<GroupCheckbox
							categoryOptions={
								options[ProposalType.DEMOCRACY_PROPOSALS]
							}
							title='Proposal'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={TreasuryProposalIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-2' dashed />
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={options[ProposalType.BOUNTIES]}
							title='Bounties'
							classname='basis-[50%]'
							Icon={BountiesIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
						/>
						<GroupCheckbox
							categoryOptions={
								options[ProposalType.CHILD_BOUNTIES]
							}
							title='Child Bounties'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={BountiesIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-2' dashed />
					<div className='flex'>
						<GroupCheckbox
							categoryOptions={options[ProposalType.TIPS]}
							title='Tips'
							classname='basis-[50%]'
							Icon={TipsIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
						/>
						<GroupCheckbox
							categoryOptions={
								options[ProposalType.TECH_COMMITTEE_PROPOSALS]
							}
							title='Tech Committee'
							classname='border-dashed border-x-0 border-y-0 border-l-2 border-[#D2D8E0] pl-[48px]'
							Icon={TechCommiteeIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
						/>
					</div>
					<Divider className='border-[#D2D8E0] border-[2px]' dashed />
					<div className='flex'>
						<div className='basis-[50%] flex flex-col gap-[16px]'>
							<GroupCheckbox
								categoryOptions={
									options[ProposalType.COUNCIL_MOTIONS]
								}
								title='Council Motion'
								Icon={TipsIcon}
								onChange={handleChange}
								handleCategoryAllClick={handleCategoryAllClick}
							/>
						</div>
					</div>
				</div>
			</Panel>
		</Collapse>
	);
}
