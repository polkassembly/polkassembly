// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Divider, Switch } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import OverallPostsNotification from '~assets/icons/gov-icon.svg';
import GroupCheckbox from '../common-ui/GroupCheckbox';
import { useNetworkSelector } from '~src/redux/selectors';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { iconMapper, postOriginMapper, titleMapper } from './utils';
import { ACTIONS } from '../Reducer/action';
import { INotificationObject } from '../types';
import { Collapse } from '../common-ui/Collapse';

const { Panel } = Collapse;
type Props = {
	onSetNotification: (obj: INotificationObject) => void;
	userNotification: INotificationObject;
	dispatch: React.Dispatch<any>;
	options: any;
};

const getConsecutiveKeys = (obj: any) => {
	const keys = Object.keys(obj);
	const result = [];

	for (let i = 0; i < keys.length - 1; i += 2) {
		result.push([keys[i], keys[i + 1]]);
	}

	return result;
};

// eslint-disable-next-line no-empty-pattern
export default function OpenGovNotification({ onSetNotification, userNotification, dispatch, options }: Props) {
	const [active, setActive] = useState<boolean | undefined>(false);
	const { network } = useNetworkSelector();
	const [all, setAll] = useState(false);
	const openGovTwoOptions = getConsecutiveKeys(networkTrackInfo[network] || {});

	const handleAllClick = (checked: boolean) => {
		dispatch({
			payload: {
				params: { checked }
			},
			type: ACTIONS.OPEN_GOV_ALL_CHANGE
		});
		const notification = Object.assign({}, userNotification);
		Object.keys(options).forEach((key) => {
			const id = networkTrackInfo[network][key]?.trackId;
			options[key].forEach((option: any) => {
				if (!option?.triggerName) {
					return;
				}
				let tracks = notification?.[option.triggerName]?.tracks || [];
				if (checked) {
					if (!tracks.includes(id)) tracks.push(id);
				} else {
					tracks = tracks.filter((track: number) => track !== id);
				}
				notification[option.triggerName] = {
					enabled: tracks.length > 0,
					name: option?.triggerPreferencesName,
					tracks
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
			type: ACTIONS.OPEN_GOV_PROPOSAL_ALL_CHANGE
		});
		const notification = Object.assign({}, userNotification);
		const id = networkTrackInfo[network][title]?.trackId;
		options[title].forEach((option: any) => {
			if (!option?.triggerName) {
				return;
			}
			let tracks = notification?.[option.triggerName]?.tracks || [];
			if (checked) {
				if (!tracks.includes(id)) tracks.push(id);
			} else {
				tracks = tracks.filter((track: number) => track !== id);
			}
			notification[option.triggerName] = {
				enabled: tracks.length > 0,
				name: option?.triggerPreferencesName,
				tracks
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
			type: ACTIONS.OPEN_GOV_PROPOSAL_SINGLE_CHANGE
		});
		const notification = Object.assign({}, userNotification);
		const id = networkTrackInfo[network][title]?.trackId;
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
		notification[option.triggerName] = {
			enabled: tracks.length > 0,
			name: option?.triggerPreferencesName,
			tracks
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
						<h3 className='mb-0 mt-[2px] text-[16px] font-semibold leading-[21px] tracking-wide text-[#243A57] md:text-[18px]'>OpenGov Notifications</h3>
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
					{openGovTwoOptions.map((category: any[], i: number) => (
						<React.Fragment key={category.toString()}>
							<div className='flex flex-wrap'>
								{category.map((postType, i) => {
									return (
										<React.Fragment key={postType.toString()}>
											<GroupCheckbox
												categoryOptions={options[postType]}
												title={postOriginMapper(postType)}
												classname={i === category.length - 1 ? 'md:border-dashed md:border-x-0 md:border-y-0 md:border-l-2 md:border-[#D2D8E0] md:pl-[48px]' : 'md:basis-[50%]'}
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
							{i !== openGovTwoOptions.length - 1 && (
								<Divider
									className='border-2 border-[#D2D8E0]'
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
