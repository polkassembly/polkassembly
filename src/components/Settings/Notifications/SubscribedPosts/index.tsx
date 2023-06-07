// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Collapse } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import SubscribedPostsNotification from '~assets/icons/subscribed-posts-notification-icon.svg';
import GroupCheckbox from '../common-ui/GroupCheckbox';
import Toggler from '../common-ui/Toggler';

const { Panel } = Collapse;
type Props = {};

const categoryOptions = [
	{
		label: 'Comments on my posts',
		value: 'Comments on my posts'
	}
];

// eslint-disable-next-line no-empty-pattern
export default function SubscribedPosts({}: Props) {
	const [active, setActive] = useState<boolean | undefined>(false);
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
						<SubscribedPostsNotification />
						<h3 className='font-semibold text-xl tracking-wide leading-7 text-sidebarBlue mb-0'>
                            Subscribed Posts (Others proposals)
						</h3>
						{!!active && <Toggler label='All' selected />}
					</div>
				}
				key='1'
			>
				<GroupCheckbox categoryOptions={categoryOptions} />
			</Panel>
		</Collapse>
	);
}
