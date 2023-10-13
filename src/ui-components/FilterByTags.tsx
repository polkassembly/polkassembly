// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Checkbox, Input, Popover } from 'antd';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import useGetFilterByFromUrl from '~src/hooks/useGetFilterbyFromUrl';
import DownOutlined from '~assets/search/dropdown-down.svg';
import { IPostTag } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { poppins } from 'pages/_app';
import handleFilterResults from '~src/util/handleFilterResults';
import NoTagsFoundIcon from '~assets/icons/no-tag.svg';
import HightlightDownOutlined from '~assets/search/pink-dropdown-down.svg';

import { FilterIcon, SearchIcon, TrendingIcon } from './CustomIcons';
import ClearIcon from '~assets/icons/close-tags.svg';

interface Props {
	className?: string;
	isSearch?: boolean;
	setSelectedTags?: (pre: string[]) => void;
	disabled?: boolean;
	clearTags?: boolean;
}

const FilterByTags = ({ className, isSearch = false, setSelectedTags, disabled, clearTags }: Props) => {
	const defaultTags = useGetFilterByFromUrl();
	const [openFilter, setOpenFilter] = useState<boolean>(false);
	const [filteredTags, setFilteredTags] = useState<IPostTag[]>([]);
	const [allTags, setAllTags] = useState<IPostTag[]>([]);
	const [searchInput, setSearchInput] = useState('');
	const [tags, setTags] = useState<string[]>([]);
	const [trendingTags, setTrendingTags] = useState<IPostTag[]>([]);
	const router = useRouter();
	const [displayTags, setDisplayTags] = useState<string[]>([]);

	const getData = async () => {
		const { data, error } = await nextApiClientFetch<IPostTag[]>('api/v1/all-tags');
		if (error) console.error('Error in getting all-tags', error);
		else if (data) {
			setAllTags(data);
			setTrendingTags(data);
		}
	};

	useEffect(() => {
		if (!isSearch) return;
		clearTags && setTags([]);
	}, [clearTags, isSearch]);

	useEffect(() => {
		allTags.length === 0 && getData();
		!isSearch && setTags(defaultTags);
		defaultTags.length > 0 && setDisplayTags(defaultTags);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultTags]);

	const handleFilterByClick = (key: string[]) => {
		if (key.length > 0) {
			router.replace({
				pathname: '',
				query: {
					...router.query,
					filterBy: encodeURIComponent(JSON.stringify(key))
				}
			});
		} else if (router.query.sortBy) {
			router.replace({
				pathname: '',
				query: {
					sortBy: router.query.sortBy
				}
			});
		} else {
			router.push({ pathname: '' });
		}
	};

	const handleExits = (value: string) => {
		value = value.toLowerCase();
		const isExits = tags.filter((tag) => tag === value);

		if (isExits.length > 0) return true;

		return false;
	};

	const handleSetTags = (tag: string) => {
		if (tag && tags.indexOf(tag.toLowerCase()) === -1 && tags.length < 5) {
			setTags([...tags, tag.toLowerCase()]);
			setSelectedTags && setSelectedTags([...tags, tag.toLowerCase()]);
			!isSearch && handleFilterByClick([...tags, tag.toLowerCase()]);
		}
		return;
	};

	const handleRemoveTag = (removedTag: string) => {
		const newTags = tags.filter((tag) => tag !== removedTag);
		setTags(newTags);
		setSelectedTags && setSelectedTags(newTags);
		!isSearch && handleFilterByClick(newTags);
	};

	useEffect(() => {
		handleFilterResults(allTags, setFilteredTags, tags, searchInput);
		handleFilterResults(trendingTags, setTrendingTags, tags, searchInput);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchInput, tags]);

	useEffect(() => {
		if (searchInput.length === 0 && tags.length === 0 && filteredTags.length === 0) {
			setDisplayTags(trendingTags.slice(0, 5).map((tag) => tag?.name));
		} else {
			setDisplayTags([...tags, ...(filteredTags?.slice(0, 5).map((tag) => tag?.name) || filteredTags.map((tag) => tag?.name))]);
		}
	}, [filteredTags, searchInput.length, tags, trendingTags, allTags]);

	const content = (
		<div className='min-h-[150px] w-[180px] '>
			{!isSearch ? (
				<div className={`mb-[-2px] mt-[-2px] flex cursor-auto justify-between text-sm font-medium tracking-wide text-sidebarBlue ${poppins.variable} ${poppins.className}`}>
					Tags
					{!isSearch && (
						<span
							className='flex cursor-pointer justify-center text-[10px] font-normal text-pink_primary'
							onClick={() => {
								setTags([]);
								!isSearch && handleFilterByClick([]);
								setSearchInput('');
							}}
						>
							Clear Filters
						</span>
					)}
				</div>
			) : (
				''
			)}

			<Input
				allowClear={{ clearIcon: <ClearIcon /> }}
				type='search'
				className='mt-[4px]'
				value={searchInput}
				onChange={(e) => setSearchInput(e.target.value)}
				prefix={<SearchIcon />}
			/>

			{searchInput.length === 0 && tags.length === 0 && filteredTags.length === 0 ? (
				<div className='flex-col'>
					{isSearch && <div className={`mt-1 text-[10px] font-normal text-[#243A57] ${poppins.variable} ${poppins.className}`}>Suggestion :</div>}

					{trendingTags.slice(0, 5).map((tag, index) => (
						<div
							key={index}
							onClick={() => handleSetTags(tag?.name)}
							className={`flex cursor-pointer items-center gap-2 py-1 text-xs ${poppins.className} ${poppins.variable}`}
						>
							<TrendingIcon />
							<span className='text-xs tracking-wide text-[#667589]'>{tag.name}</span>
						</div>
					))}
				</div>
			) : (
				<Checkbox.Group
					className={`mt-1.5 flex max-h-[200px] flex-col justify-start overflow-y-scroll tracking-[0.01em]  ${poppins.className} ${poppins.variable}`}
					value={tags}
				>
					{displayTags.map((item, index) => (
						<Checkbox
							onClick={() => (handleExits(item) ? handleRemoveTag(item) : handleSetTags(item))}
							className={`ml-0 text-xs font-normal ${tags.includes(item) ? 'text-[#243A57]' : 'text-[#667589]'} ${index !== 0 ? 'py-1.5' : 'pb-1.5'}`}
							key={index}
							value={item}
						>
							<div className='mt-[2px]'>{item}</div>
						</Checkbox>
					))}
				</Checkbox.Group>
			)}
			{filteredTags.length === 0 && searchInput.length > 0 ? (
				<div className='mt-2 flex h-[100%] flex-col items-center justify-center gap-2'>
					<NoTagsFoundIcon />
					<span className={`text-[10px] tracking-wide text-navBlue ${poppins.className} ${poppins.variable} `}>No tag found.</span>
				</div>
			) : null}
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
			arrow={isSearch}
		>
			{!isSearch ? (
				<div className={'mt-[3.5px] flex cursor-pointer items-center text-base font-normal tracking-wide text-pink_primary'}>
					<span> Filter</span>
					<span className='ml-2 text-lg'>
						<FilterIcon />
					</span>
				</div>
			) : (
				<div
					className={`flex items-center justify-center text-xs ${openFilter ? 'text-pink_primary' : 'text-[#667589]'} ${
						disabled ? 'cursor-not-allowed text-[#B5BFCC]' : 'cursor-pointer'
					} max-sm:text-[10px]`}
				>
					Tags
					<span className='font-semibold text-[#96A4B6]'>
						{openFilter ? <HightlightDownOutlined className='ml-2.5 mt-1 max-md:ml-1' /> : <DownOutlined className='ml-2.5 mt-1 max-md:ml-1' />}
					</span>
				</div>
			)}
		</Popover>
	);
};
export default FilterByTags;
