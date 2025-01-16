// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Checkbox } from 'antd';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import useGetFilterByFromUrl from '~src/hooks/useGetFilterbyFromUrl';
import DownOutlined from '~assets/search/dropdown-down.svg';
import { IPostTag } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { dmSans } from 'pages/_app';
import handleFilterResults from '~src/util/handleFilterResults';
import HightlightDownOutlined from '~assets/search/pink-dropdown-down.svg';

import { NoTagFoundIcon, SearchIcon, TrendingIcon } from './CustomIcons';
import ClearIcon from '~assets/icons/close-tags.svg';
import { useTheme } from 'next-themes';
import DropdownGreyIcon from '~assets/icons/dropdown-grey.svg';
import Popover from '~src/basic-components/Popover';
import Input from '~src/basic-components/Input';

interface Props {
	className?: string;
	isSearch?: boolean;
	setSelectedTags?: (pre: string[]) => void;
	disabled?: boolean;
	clearTags?: boolean;
	isUsedInBountyPage?: boolean;
}

const FilterByTags = ({ className, isSearch = false, setSelectedTags, disabled, clearTags, isUsedInBountyPage }: Props) => {
	const defaultTags = useGetFilterByFromUrl();
	const [openFilter, setOpenFilter] = useState<boolean>(false);
	const [filteredTags, setFilteredTags] = useState<IPostTag[]>([]);
	const [allTags, setAllTags] = useState<IPostTag[]>([]);
	const [searchInput, setSearchInput] = useState('');
	const [tags, setTags] = useState<string[]>([]);
	const [trendingTags, setTrendingTags] = useState<IPostTag[]>([]);
	const router = useRouter();
	const [displayTags, setDisplayTags] = useState<string[]>([]);
	const { resolvedTheme: theme } = useTheme();
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
		if (!allTags.length) {
			getData();
		}
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
		} else if (router.query.proposalStatus) {
			router.replace({
				pathname: '',
				query: {
					filterBy: router.query.proposalStatus
				}
			});
		} else {
			router.push({ pathname: '' });
		}
	};

	const handleFilterByClickinBounty = (key: string[]) => {
		const queryParams = { ...router.query };

		delete queryParams.filterBy;

		if (key.length > 0) {
			queryParams.filterBy = encodeURIComponent(JSON.stringify(key));
		}

		router.push({
			pathname: router.pathname,
			query: queryParams
		});
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
				<div
					className={`mb-[-2px] mt-[-2px] flex cursor-auto justify-between text-sm font-medium tracking-wide text-sidebarBlue ${dmSans.variable} ${dmSans.className} dark:text-blue-dark-high`}
				>
					{isUsedInBountyPage ? 'Categories' : 'Tags'}
					{!isSearch && (
						<span
							className='flex cursor-pointer justify-center text-[10px] font-normal text-pink_primary'
							onClick={() => {
								setTags([]);
								!isSearch && isUsedInBountyPage ? handleFilterByClickinBounty([]) : handleFilterByClick([]);
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
			{/* Input Component */}
			<Input
				allowClear={{ clearIcon: <ClearIcon /> }}
				type='search'
				className='mt-[4px] dark:border-[#3B444F] dark:bg-section-dark-background dark:text-blue-dark-high dark:focus:border-[#91054F] [&>input]:dark:bg-section-dark-background [&>input]:dark:text-blue-dark-high'
				value={searchInput}
				onChange={(e) => setSearchInput(e.target.value)}
				prefix={<SearchIcon />}
			/>

			{searchInput.length === 0 && tags.length === 0 && filteredTags.length === 0 ? (
				<div className='flex-col'>
					{isSearch && <div className={`mt-1 text-[10px] font-normal text-[#243A57] ${dmSans.variable} ${dmSans.className} dark:text-white`}>Suggestion :</div>}

					{trendingTags.slice(0, 5).map((tag, index) => (
						<div
							key={index}
							onClick={() => handleSetTags(tag?.name)}
							className={`flex cursor-pointer items-center gap-2 py-1 text-xs ${dmSans.className} ${dmSans.variable} dark:text-white`}
						>
							<TrendingIcon />
							<span className='text-xs tracking-wide text-separatorDark dark:text-white'>{tag.name}</span>
						</div>
					))}
				</div>
			) : (
				<Checkbox.Group
					className={`mt-1.5 flex max-h-[200px] flex-col justify-start overflow-y-scroll tracking-[0.01em]  ${dmSans.className} ${dmSans.variable} dark:text-white`}
					value={tags}
				>
					{displayTags.map((item, index) => (
						<Checkbox
							onClick={() => (handleExits(item) ? handleRemoveTag(item) : handleSetTags(item))}
							className={`ml-0 text-xs font-normal ${tags.includes(item) ? 'text-[#243A57]' : 'text-[#667589]'} ${index !== 0 ? 'py-1.5' : 'pb-1.5'} dark:text-white`}
							key={index}
							value={item}
						>
							<div className='mt-[2px] dark:text-white'>{item}</div>
						</Checkbox>
					))}
				</Checkbox.Group>
			)}
			{filteredTags.length === 0 && searchInput.length > 0 ? (
				<div className='mt-2 flex h-[100%] flex-col items-center justify-center gap-2 text-[50px] dark:text-white'>
					<NoTagFoundIcon />
					<span className={`text-[10px] tracking-wide text-navBlue ${dmSans.className} ${dmSans.variable} dark:text-white`}>No tag found.</span>
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
			overlayClassName={`dark:bg-section-dark-overlay dark:rounded-lg dark:text-white ${theme == 'dark' ? '[&>ul]:bg-section-dark-background [&>ul>li]:text-white' : ''}`}
		>
			{!isSearch ? (
				<div className={'flex cursor-pointer items-center font-normal tracking-wide text-bodyBlue'}>
					<span className='text-sm text-lightBlue dark:text-blue-dark-medium'>{isUsedInBountyPage ? 'Filter' : 'Tags'}</span>
					<DropdownGreyIcon className='ml-1' />
				</div>
			) : (
				<div
					className={`flex items-center justify-center text-xs ${openFilter ? 'text-pink_primary' : ''} ${
						disabled ? 'cursor-not-allowed text-[#B5BFCC]' : 'cursor-pointer'
					} max-sm:text-[10px]`}
				>
					{isUsedInBountyPage ? 'Filter' : 'Tags'}
					<span className='font-semibold text-[#96A4B6]'>
						{openFilter ? <HightlightDownOutlined className='ml-2.5 mt-1 max-md:ml-1' /> : <DownOutlined className='ml-2.5 mt-1 max-md:ml-1' />}
					</span>
				</div>
			)}
		</Popover>
	);
};
export default FilterByTags;
