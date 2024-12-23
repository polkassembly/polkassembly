// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Switch } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ChatActive from '~assets/icons/chat-active.svg';
import GroupCheckbox from '../common-ui/GroupCheckbox';
import { ACTIONS } from '../Reducer/action';
import { EMentionType, INotificationObject } from '../types';
import { Collapse } from '../common-ui/Collapse';
import { useTheme } from 'next-themes';

const { Panel } = Collapse;

type Props = {
	onSetNotification: (obj: INotificationObject) => void;
	dispatch: React.Dispatch<any>;
	options: any;
	userNotification: INotificationObject;
};

export default function Proposals({ onSetNotification, dispatch, options, userNotification }: Props) {
	const [active, setActive] = useState<boolean | undefined>(false);
	const [all, setAll] = useState(false);
	const { resolvedTheme: theme } = useTheme();
	useEffect(() => {
		setAll(options.every((category: any) => category.selected));
	}, [options]);

	const handleAllClick = (checked: boolean) => {
		dispatch({
			payload: {
				params: { checked }
			},
			type: ACTIONS.MY_PROPOSAL_ALL_CHANGE
		});
		const notification = Object.assign({}, userNotification);
		options.forEach((option: any) => {
			const trigger = option.triggerPreferencesName;
			if (trigger === 'newMention') {
				notification[option.triggerName] = {
					enabled: checked,
					mention_types: [EMentionType.COMMENT, EMentionType.REPLY],
					name: option?.triggerPreferencesName
				};
			} else if (trigger === 'ownProposalCreated') {
				notification[option.triggerName] = {
					enabled: checked,
					name: option?.triggerPreferencesName
				};
			} else {
				let subTriggers = notification?.[option.triggerName]?.sub_triggers || [];
				if (checked) {
					if (!subTriggers.includes(trigger)) subTriggers = [...subTriggers, trigger];
				} else {
					subTriggers = subTriggers.filter((postType: string) => postType !== trigger);
				}
				notification[option.triggerName] = {
					enabled: subTriggers.length > 0,
					name: option?.triggerName,
					sub_triggers: subTriggers
				};
			}
		});
		onSetNotification(notification);
		setAll(checked);
	};

	const handleChange = (categoryOptions: any, checked: boolean, value: string) => {
		dispatch({
			payload: {
				params: { categoryOptions, checked, value }
			},
			type: ACTIONS.MY_PROPOSAL_SINGLE_CHANGE
		});
		const notification = Object.assign({}, userNotification);
		const option = categoryOptions.find((opt: any) => opt.label === value);
		const trigger = option.triggerPreferencesName;
		if (trigger === 'newMention') {
			notification[option.triggerName] = {
				enabled: checked,
				mention_types: [EMentionType.COMMENT, EMentionType.REPLY],
				name: option?.triggerPreferencesName
			};
		} else if (trigger === 'ownProposalCreated') {
			notification[option.triggerName] = {
				enabled: checked,
				name: option?.triggerPreferencesName
			};
		} else {
			let subTriggers = notification?.[option.triggerName]?.sub_triggers || [];
			if (checked) {
				if (!subTriggers.includes(trigger)) subTriggers = [...subTriggers, trigger];
			} else {
				subTriggers = subTriggers.filter((postType: string) => postType !== trigger);
			}
			notification[option.triggerName] = {
				enabled: subTriggers.length > 0,
				name: option?.triggerName,
				sub_triggers: subTriggers
			};
		}
		onSetNotification(notification);
	};

	return (
		<Collapse
			size='large'
			className={'bg-white dark:border-separatorDark dark:bg-section-dark-overlay'}
			theme={theme as any}
			expandIconPosition='end'
			expandIcon={({ isActive }) => {
				setActive(isActive);
				return isActive ? <CollapseIcon /> : <ExpandIcon />;
			}}
		>
			<Panel
				header={
					<div className='channel-header flex items-center gap-[6px]'>
						<ChatActive />
						<h3 className='mb-0 text-[16px] font-semibold leading-[21px] tracking-wide text-blue-light-high dark:text-blue-dark-high md:text-[18px]'>My Proposals</h3>
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
									<p className='m-0 text-[#485F7D] dark:text-white'>All</p>
								</span>
							</>
						)}
					</div>
				}
				key='1'
			>
				<GroupCheckbox
					categoryOptions={options}
					onChange={handleChange}
				/>
			</Panel>
		</Collapse>
	);
}
