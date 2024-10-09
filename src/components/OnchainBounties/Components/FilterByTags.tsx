// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Checkbox } from 'antd';
import React, { useEffect, useState } from 'react';
import Popover from '~src/basic-components/Popover';
import Input from '~src/basic-components/Input';
import { FilterIcon, NoTagFoundIcon, SearchIcon } from '~src/ui-components/CustomIcons';
import { useTheme } from 'next-themes';
import ClearIcon from '~assets/icons/close-tags.svg';

interface Props {
	className?: string;
	isSearch?: boolean;
	setSelectedTags?: (pre: string[]) => void;
	disabled?: boolean;
	bounties: any[];
	setFilteredBounties: (bounties: any[]) => void;
}

const FilterByTags = ({ className, isSearch = false, setSelectedTags, disabled, bounties, setFilteredBounties }: Props) => {
	const [openFilter, setOpenFilter] = useState<boolean>(false);
	const [searchInput, setSearchInput] = useState('');
	const [tags, setTags] = useState<string[]>([]);
	const [filteredTags, setFilteredTags] = useState<string[]>([]);
	const [availableTags, setAvailableTags] = useState<string[]>([]);

	const { resolvedTheme: theme } = useTheme();

	useEffect(() => {
		const uniqueCategories = new Set<string>();
		bounties.forEach((bounty) => {
			bounty.categories.forEach((category: string) => {
				uniqueCategories.add(category);
			});
		});
		setAvailableTags([...uniqueCategories]);
		setFilteredTags([...uniqueCategories]);
	}, [bounties]);

	useEffect(() => {
		const filtered = availableTags.filter((tag) => tag.toLowerCase().includes(searchInput.toLowerCase()));
		setFilteredTags(filtered);
	}, [searchInput, availableTags]);

	const handleSetTags = (tag: string) => {
		if (tag && !tags.includes(tag)) {
			const newTags = [...tags, tag];
			setTags(newTags);
			setSelectedTags && setSelectedTags(newTags);

			const filteredBounties = bounties.filter((bounty) => newTags.some((t) => bounty.categories.includes(t)));
			setFilteredBounties(filteredBounties);
		}
	};

	const handleRemoveTag = (tag: string) => {
		const newTags = tags.filter((t) => t !== tag);
		setTags(newTags);
		setSelectedTags && setSelectedTags(newTags);

		const filteredBounties = newTags.length ? bounties.filter((bounty) => newTags.some((t) => bounty.categories.includes(t))) : bounties; // If no tags, show all bounties
		setFilteredBounties(filteredBounties);
	};

	const handleClearFilters = () => {
		setTags([]);
		setFilteredBounties(bounties);
		setSearchInput('');
		setSelectedTags && setSelectedTags([]);
	};

	const content = (
		<div className='min-h-[150px] w-[180px] '>
			<div className='mb-[-2px] mt-[-2px] flex cursor-auto justify-between text-sm font-medium tracking-wide text-sidebarBlue dark:text-blue-dark-high'>
				Categories
				{!isSearch && (
					<span
						className='flex cursor-pointer justify-center text-[10px] font-normal text-pink_primary'
						onClick={handleClearFilters}
					>
						Clear Filters
					</span>
				)}
			</div>

			<Input
				allowClear={{ clearIcon: <ClearIcon /> }}
				type='search'
				className='mt-[4px]'
				value={searchInput}
				onChange={(e) => setSearchInput(e.target.value)}
				prefix={<SearchIcon className='text-lg' />}
			/>

			<Checkbox.Group
				value={tags}
				className='mt-1.5 flex max-h-[200px] flex-col overflow-y-scroll'
			>
				{filteredTags.map((tag, index) => (
					<Checkbox
						key={index}
						value={tag}
						checked={tags.includes(tag)}
						onClick={() => (tags.includes(tag) ? handleRemoveTag(tag) : handleSetTags(tag))}
						className='ml-2'
					>
						<span className='text-xs'>{tag}</span>
					</Checkbox>
				))}
			</Checkbox.Group>

			{filteredTags.length === 0 && searchInput.length > 0 && (
				<div className='mt-2 flex flex-col items-center justify-center gap-2'>
					<NoTagFoundIcon />
					<span className='text-[10px] tracking-wide'>No tag found.</span>
				</div>
			)}
		</div>
	);

	return (
		<Popover
			zIndex={1056}
			content={content}
			open={!disabled && openFilter}
			className={className}
			onOpenChange={() => !disabled && setOpenFilter(!openFilter)}
			placement='bottom'
			trigger='click'
			arrow={isSearch}
			overlayClassName={`dark:bg-section-dark-overlay dark:rounded-lg dark:text-white ${theme == 'dark' ? '[&>ul]:bg-section-dark-background [&>ul>li]:text-white' : ''}`}
		>
			<div className={`flex cursor-pointer items-center font-normal ${openFilter ? 'text-pink_primary' : 'text-bodyBlue'}`}>
				<span className='text-[16px] dark:text-lightWhite'>Filter</span>
				<FilterIcon className='ml-1 text-xl' />
			</div>
		</Popover>
	);
};

export default FilterByTags;
