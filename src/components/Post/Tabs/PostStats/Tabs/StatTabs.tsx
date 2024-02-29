// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Popover, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';

interface IStatsProps {
	items: any;
	setActiveTab: (tab: string) => void;
	activeTab: any;
}

export const StatTabs = ({ items, setActiveTab, activeTab }: IStatsProps) => {
	return (
		<>
			{items && items.length > 0 ? (
				<Popover
					title=''
					trigger='hover'
					placement='bottom'
					overlayClassName='dark:bg-section-dark-overlay dark:text-white w-40'
					content={
						<div>
							{items &&
								items.map((item: any) => {
									return (
										<div
											className='cursor-pointer p-1 text-sm font-medium text-blue-light-high hover:scale-105 hover:opacity-80 dark:text-white'
											key={item.key}
											onClick={() => setActiveTab(item.key)}
										>
											{item.label}
										</div>
									);
								})}
						</div>
					}
					arrow={false}
				>
					{items.map((item: any) => {
						if (item.key === activeTab) {
							return (
								<Button
									key={item.key}
									className='mb-5 w-40 font-medium text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white'
								>
									{item.label} <DownOutlined />
								</Button>
							);
						}
					})}
				</Popover>
			) : null}
		</>
	);
};
