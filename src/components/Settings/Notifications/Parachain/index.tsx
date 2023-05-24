// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Collapse, Input, Space } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ParachainNotification from '~assets/icons/parachain-notification-icon.svg';
import { network } from '~src/global/networkConstants';
import NetworkTags from './NetworkTags';
import { chainProperties } from '~src/global/networkConstants';
import Toggler from '../common-ui/Toggler';
import SearchSVG from '~assets/icons/search.svg';

const { Panel } = Collapse;
type Props = {};
// eslint-disable-next-line no-empty-pattern
export default function Parachain({}: Props) {
	const [active, setActive] = useState<boolean | undefined>(false);
	return (
		<Collapse
			className='bg-white'
			size='large'
			expandIconPosition='end'
			expandIcon={({ isActive }) => {
				setActive(isActive);
				return isActive ? <CollapseIcon /> : <ExpandIcon />;
			}}
		>
			<Panel
				header={
					<div className='flex items-center gap-[8px]'>
						<ParachainNotification />
						<h3 className='font-semibold text-xl tracking-wide leading-7 text-sidebarBlue mb-0'>
                            Parachains
						</h3>
						{!!active && (
							<div className='flex justify-between w-full items-center'>
								<Toggler label='All' selected />
								<Input
									className='px-[0.5em] w-[200px]'
									placeholder='Search'
									prefix={<SearchSVG />}
									onClick={(e) => e.stopPropagation()}
								/>
							</div>
						)}
					</div>
				}
				key='1'
			>
				<p className='font-semibold text-[#243A57] text-[16px]'>
                    Please select the chains you would like to receive
                    notifications for:
				</p>
				<Space size={[0, 12]} wrap>
					{Object.values(network).map((value) => (
						<div key={value}>
							<NetworkTags
								icon={chainProperties[value].logo}
								name={value}
							/>
						</div>
					))}
				</Space>
			</Panel>
		</Collapse>
	);
}
