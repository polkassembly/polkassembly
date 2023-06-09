// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Collapse, Switch } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ChatActive from '~assets/icons/chat-active.svg';
import GroupCheckbox from '../common-ui/GroupCheckbox';
import { ACTIONS } from '../Reducer/action';

const { Panel } = Collapse;

type Props = {
    onSetNotification: any;
    dispatch: any;
    options: any;
	userNotification:any
};

export default function Proposals({
	onSetNotification,
	dispatch,
	options,
	userNotification
}: Props) {
	const [active, setActive] = useState<boolean | undefined>(false);
	const [all, setAll] = useState(false);
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
			notification[option.triggerName] = {
				enabled: checked,
				name: option?.triggerPreferencesName
			};
		});
		console.log(notification);
		onSetNotification(notification);
		setAll(checked);
	};

	const handleChange = (
		categoryOptions: any,
		checked: boolean,
		value: string
	) => {
		dispatch({
			payload: {
				params: { categoryOptions, checked, value }
			},
			type: ACTIONS.MY_PROPOSAL_SINGLE_CHANGE
		});
		const notification = Object.assign({}, userNotification);
		const option = categoryOptions.find((opt: any) => opt.label === value);
		notification[option.triggerName] = {
			enabled: checked,
			name: option?.triggerPreferencesName
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
						<ChatActive />
						<h3 className='font-semibold text-xl tracking-wide leading-7 text-sidebarBlue mb-0'>
                            My Proposals
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
				key='3'
			>
				<GroupCheckbox
					categoryOptions={options}
					onChange={handleChange}
				/>
			</Panel>
		</Collapse>
	);
}
