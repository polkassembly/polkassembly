// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Popover, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';

interface IStatsProps {
	items: any;
	setActiveTab: (tab: string) => void;
	activeTab: any;
	isUsedInAnalytics?: boolean;
}

export const StatTabs = ({ items, setActiveTab, activeTab, isUsedInAnalytics }: IStatsProps) => {
	return (
		<>
			{items && items.length > 0 ? (
				<Popover
					title=''
					trigger='hover'
					placement='bottom'
					overlayClassName='dark:bg-section-dark-overlay dark:text-white w-fit text-left'
					content={
						<div>
							{items &&
								items.map((item: any) => {
									return (
										<div
											className={`cursor-pointer p-1 text-sm font-medium  hover:scale-105 hover:text-pink_primary dark:hover:text-pink_primary  ${
												item.key === activeTab ? 'text-pink_primary' : 'text-blue-light-high dark:text-white'
											}`}
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
									className={`${
										isUsedInAnalytics ? 'py-0 text-sm' : 'mb-5'
									} w-fit text-left font-medium text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white`}
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
