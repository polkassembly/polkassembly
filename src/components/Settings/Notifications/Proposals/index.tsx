// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Collapse, Switch } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ChatActive from '~assets/icons/chat-active.svg';
import GroupCheckbox from '../common-ui/GroupCheckbox';
import { useNetworkContext } from '~src/context';

const { Panel } = Collapse;

const categoryOptions = [
	{
		label: 'Comments on my posts',
		triggerName: 'commentsOnMyPosts',
		triggerPreferencesName: 'newCommentAdded',
		value: 'Comments on my posts'
	}
];

type Props = {
    onSetNotification: any;
    userNotification: any;
};

export default function Proposals({
	onSetNotification,
	userNotification
}: Props) {
	const [active, setActive] = useState<boolean | undefined>(false);
	const [all, setAll] = useState(false);
	const { network } = useNetworkContext();
	const [userData, setUserData] = useState(categoryOptions);
	useEffect(() => {
		const payload = categoryOptions.map((category: any) => {
			return {
				...category,
				selected:
					userNotification[category.triggerName]?.enabled ||
					false
			};
		});
		setUserData(payload);
		setAll(payload.every((category:any) => category.selected));
	}, [userNotification]);

	const handleAllClick = (checked: boolean) => {
		setUserData(
			categoryOptions.map((category: any) => ({
				...category,
				selected: checked
			}))
		);
		const promises = categoryOptions.map((option: any) => {
			const payload = {
				network,
				trigger_name: option?.triggerName,
				trigger_preferences: {
					enabled: checked,
					name: option?.triggerPreferencesName
				}
			};
			return onSetNotification(payload);
		});
		setAll(checked);
		Promise.all(promises);
	};

	const handleChange = (
		categoryOptions: any,
		checked: boolean,
		value: string
	) => {
		const option = categoryOptions.find((opt: any) => opt.label === value);
		const payload = {
			network,
			trigger_name: option?.triggerName,
			trigger_preferences: {
				enabled: checked,
				name: option?.triggerPreferencesName
			}
		};
		const userPayload = categoryOptions.map((category: any) =>
			category.label === value
				? { ...category, selected: checked }
				: category
		);
		setUserData(userPayload);
		onSetNotification(payload);
		setAll(userPayload.every((category:any) => category.selected));
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
					categoryOptions={userData}
					onChange={handleChange}
					sectionAll={all}
				/>
			</Panel>
		</Collapse>
	);
}
