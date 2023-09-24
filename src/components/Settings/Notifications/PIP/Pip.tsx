// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Divider, Switch } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import OverallPostsNotification from '~assets/icons/gov-icon.svg';
import GroupCheckbox from '../common-ui/GroupCheckbox';
import TipsIcon from '~assets/icons/tips.svg';
import ReferendumsIcon from '~assets/icons/referndums.svg';
import TreasuryProposalIcon from '~assets/icons/treasury-proposal.svg';
import { titleMapper } from './utils';
import { ProposalType } from '~src/global/proposalType';
import { ACTIONS } from '../Reducer/action';
import { Collapse } from '../common-ui/Collapse';

const { Panel } = Collapse;
type Props = {
	onSetNotification: any;
	userNotification: any;
	dispatch: any;
	options: any;
};

export default function PipNotification({ onSetNotification, userNotification, dispatch, options }: Props) {
	const [active, setActive] = useState<boolean | undefined>(false);
	const [all, setAll] = useState(false);

	const handleAllClick = (checked: boolean) => {
		dispatch({
			payload: {
				params: { checked }
			},
			type: ACTIONS.PIP_ALL_CHANGE
		});
		const notification = Object.assign({}, userNotification);
		Object.keys(options).forEach((key) => {
			options[key].forEach((option: any) => {
				if (!option?.triggerName) {
					return;
				}
				let postTypes = notification?.[option.triggerName]?.post_types || [];
				if (checked) {
					if (!postTypes.includes(key)) postTypes.push(key);
				} else {
					postTypes = postTypes.filter((postType: string) => {
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
		const allSelected = Object.values(options).every((option: any) => option.every((item: any) => item.selected));
		setAll(allSelected);
	}, [options]);

	const handleCategoryAllClick = (checked: boolean, categoryOptions: any, title: string) => {
		title = titleMapper(title) as string;
		dispatch({
			payload: {
				params: { checked, key: title }
			},
			type: ACTIONS.PIP_PROPOSAL_ALL_CHANGE
		});
		const notification = Object.assign({}, userNotification);
		options[title].forEach((option: any) => {
			if (!option?.triggerName) {
				return;
			}
			let postTypes = notification?.[option.triggerName]?.post_types || [];
			if (checked) {
				if (!postTypes.includes(title)) postTypes.push(title);
			} else {
				postTypes = postTypes.filter((postType: string) => {
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

	const handleChange = (categoryOptions: any, checked: boolean, value: string, title: string) => {
		title = titleMapper(title) as string;
		dispatch({
			payload: {
				params: { checked, key: title, value }
			},
			type: ACTIONS.PIP_PROPOSAL_SINGLE_CHANGE
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
					<div className='channel-header flex items-center gap-[6px]'>
						<OverallPostsNotification />
						<h3 className='mb-0 mt-[2px] text-[16px] font-semibold leading-[21px] tracking-wide text-[#243A57] md:text-[18px]'>Pip Notifications</h3>
						{!!active && (
							<>
								<span className='flex items-center gap-[8px]'>
									<Switch
										size='small'
										id='postParticipated'
										onChange={(checked, e) => {
											e.stopPropagation();
											handleAllClick(checked);
										}}
										checked={all}
									/>
									<p className='m-0 text-[#485F7D]'>All</p>
								</span>
							</>
						)}
					</div>
				}
				key='1'
			>
				<div className='flex flex-col'>
					<div className='flex flex-wrap'>
						<GroupCheckbox
							categoryOptions={options[ProposalType.TECHNICAL_PIPS]}
							title='Technical Pips'
							classname='md:basis-[50%]'
							Icon={ReferendumsIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
						/>
						<Divider
							className='border-[2px] border-[#D2D8E0] md:hidden'
							dashed
						/>
						<GroupCheckbox
							categoryOptions={options[ProposalType.UPGRADE_PIPS]}
							title='Upgrade Pips'
							classname='md:border-dashed md:border-x-0 md:border-y-0 md:border-l-2 md:border-[#D2D8E0] md:pl-[48px]'
							Icon={TipsIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
						/>
					</div>
					<Divider
						className='border-2 border-[#D2D8E0]'
						dashed
					/>
					<div className='flex flex-wrap'>
						<GroupCheckbox
							categoryOptions={options[ProposalType.COMMUNITY_PIPS]}
							title='Community Pips'
							classname='md:basis-[50%]'
							Icon={TreasuryProposalIcon}
							onChange={handleChange}
							handleCategoryAllClick={handleCategoryAllClick}
						/>
					</div>
				</div>
			</Panel>
		</Collapse>
	);
}
