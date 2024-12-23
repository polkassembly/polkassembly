// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState, useMemo } from 'react';
import { Input, Popover, Button } from 'antd';
import Image from 'next/image';
import { EChatFilter, EChatTab } from '~src/types';

interface ChatFilterProps {
	onSearch: (searchText: string) => void;
	onFilterChange: (filterType: EChatFilter) => void;
	selectedChatTab: EChatTab;
}

const filterOptions = Object.values(EChatFilter).filter((option) => option !== EChatFilter.ALL);

const ChatFilter: React.FC<ChatFilterProps> = ({ onSearch, onFilterChange, selectedChatTab }) => {
	const memoizedFilterOptions = useMemo(() => filterOptions, []);

	const [searchText, setSearchText] = useState('');
	const [isFilterTabOpen, setIsFilterTabOpen] = useState<boolean>(false);
	const [filter, setFilter] = useState<EChatFilter>(EChatFilter.ALL);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const text = e.target.value;
		setSearchText(text);
		onSearch(text);
	};

	const handleChatFilterChange = (value: EChatFilter) => {
		onFilterChange(value);
	};

	useEffect(() => {
		setSearchText('');
		onSearch('');
		setFilter(EChatFilter.ALL);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedChatTab]);

	return (
		<div className='w-full p-5 pb-0'>
			<Input
				placeholder='Search'
				aria-label='Search chats'
				value={searchText}
				onChange={handleSearch}
				size='large'
				className='[&_.ant-input-group-addon]:bg-transparent [&_.ant-input]:border-r-0'
				styles={{
					suffix: { background: 'red' }
				}}
				addonAfter={
					<Popover
						placement='bottomRight'
						content={memoizedFilterOptions.map((option) => (
							<Button
								key={option}
								className={`flex w-44 items-center justify-between border-none px-2 capitalize shadow-none dark:text-blue-dark-high ${
									filter === option ? 'bg-[#FCE5F2] text-pink_primary dark:bg-[#33071E]' : 'bg-transparent'
								}`}
								aria-label={`Filter by ${option}`}
								role='menuitem'
								onClick={() => {
									setFilter(filter === option ? EChatFilter.ALL : option);
									handleChatFilterChange(filter === option ? EChatFilter.ALL : option);
									setIsFilterTabOpen(false);
								}}
							>
								{option}
							</Button>
						))}
						trigger='click'
						arrow={false}
						open={isFilterTabOpen}
						onOpenChange={setIsFilterTabOpen}
					>
						<Button
							aria-label={`Filter options - currently ${filter}`}
							className={`flex h-7 w-7 items-center justify-center rounded-full border-none p-2 hover:bg-black/5 hover:dark:bg-white/10 ${
								filter !== EChatFilter.ALL ? 'bg-[#FCE5F2] dark:bg-[#33071E]' : 'bg-transparent'
							}`}
						>
							<Image
								src={`/assets/icons/delegation-chat/${filter === EChatFilter.ALL ? 'filter-default' : 'filter-active'}.svg`}
								width={16}
								height={18}
								alt='chat filter icon'
							/>
						</Button>
					</Popover>
				}
			/>
		</div>
	);
};

export default ChatFilter;
