// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Divider, Switch } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import OverallPostsNotification from '~assets/icons/gov-icon.svg';
import GroupCheckbox from '../common-ui/GroupCheckbox';
import { iconMapper, pipNotification, postOriginMapper, titleMapper } from './utils';
import { ACTIONS } from '../Reducer/action';
import { INotificationObject } from '../types';
import { Collapse } from '../common-ui/Collapse';
import { useTheme } from 'next-themes';

// import { ProposalType } from '~src/global/proposalType';

const { Panel } = Collapse;
type Props = {
	onSetNotification: (obj: INotificationObject) => void;
	userNotification: INotificationObject;
	dispatch: React.Dispatch<any>;
	options: any;
};

const getConsecutiveKeys = () => {
	const keys = Object.keys(pipNotification);
	const result = [];

	for (let i = 0; i < keys.length; i += 2) {
		result.push([keys?.[i], keys?.[i + 1] || []]);
	}

	return result;
};

export default function PipNotification({ onSetNotification, userNotification, dispatch, options }: Props) {
	const [active, setActive] = useState<boolean | undefined>(false);
	const [all, setAll] = useState(false);
	const pipTwoOptions = getConsecutiveKeys();
	const { resolvedTheme: theme } = useTheme();

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
				let pip_types = notification?.[option.triggerName]?.pip_types || [];
				if (checked) {
					if (!pip_types.includes(key)) pip_types.push(key);
				} else {
					pip_types = pip_types.filter((pip: string) => pip !== key);
				}
				notification[option.triggerName] = {
					enabled: pip_types.length > 0,
					name: option?.triggerPreferencesName,
					pip_types
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

	const handleCategoryAllClick = (checked: boolean, categoryOptions: any, title: any) => {
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
			let pip_types = notification?.[option.triggerName]?.pip_types || [];
			if (checked) {
				if (!pip_types.includes(title)) pip_types.push(title);
			} else {
				pip_types = pip_types.filter((pip: string) => pip !== title);
			}
			notification[option.triggerName] = {
				enabled: pip_types.length > 0,
				name: option?.triggerPreferencesName,
				pip_types
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
		let pip_types = notification?.[option.triggerName]?.pip_types || [];
		if (checked) {
			if (!pip_types.includes(title)) pip_types.push(title);
		} else {
			pip_types = pip_types.filter((pip: string) => pip !== title);
		}
		notification[option.triggerName] = {
			enabled: pip_types.length > 0,
			name: option?.triggerPreferencesName,
			pip_types
		};
		onSetNotification(notification);
	};
	return (
		<Collapse
			size='large'
			className={'bg-white dark:border-separatorDark dark:bg-section-dark-overlay'}
			theme={theme}
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
						<h3 className='mb-0 mt-[2px] text-[16px] font-semibold leading-[21px] tracking-wide text-blue-light-high dark:text-blue-dark-high md:text-[18px]'>Pip Notifications</h3>
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
									<p className='m-0 text-[#485F7D] dark:text-blue-dark-medium'>All</p>
								</span>
							</>
						)}
					</div>
				}
				key='1'
			>
				<div className='flex flex-col'>
					{pipTwoOptions.map((category: any[], i: number) => (
						<React.Fragment key={category.toString()}>
							<div className='flex flex-wrap'>
								{category.map((postType, i) => {
									return (
										<React.Fragment key={postType.toString()}>
											<GroupCheckbox
												categoryOptions={options[postType]}
												title={postOriginMapper(postType)}
												classname={
													i === category.length - 1
														? 'md:border-dashed md:border-x-0 md:border-y-0 md:border-l-2 md:border-[#D2D8E0] md:pl-[48px] dark:border-separatorDark'
														: 'md:basis-[50%]'
												}
												Icon={iconMapper(postType)}
												onChange={handleChange}
												handleCategoryAllClick={handleCategoryAllClick}
											/>
											{i !== category.length - 1 && (
												<Divider
													className='border-[2px] border-[#D2D8E0] md:hidden'
													dashed
												/>
											)}
										</React.Fragment>
									);
								})}
							</div>
							{i !== pipTwoOptions.length - 1 && (
								<Divider
									className='border-2 border-[#D2D8E0] dark:border-separatorDark'
									dashed
								/>
							)}
						</React.Fragment>
					))}
				</div>
			</Panel>
		</Collapse>
	);
}
