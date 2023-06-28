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

import { FilterIcon, FilterUnfilledIcon, SearchIcon, TrendingIcon } from './CustomIcons';
import ClearIcon from '~assets/icons/close-tags.svg';

interface Props {
  className?: string;
  isSearch?: boolean;
  setSelectedTags?: (pre: string[]) => void;
  disabled?: boolean;
}

const FilterByTags=({ className, isSearch, setSelectedTags, disabled }:Props) => {
	const defaultTags = useGetFilterByFromUrl();
	const [openFilter, setOpenFilter] = useState<boolean>(false);
	const [filteredTags, setFilteredTags] = useState<IPostTag[]>([]);
	const [allTags, setAllTags] = useState<IPostTag[]>([]);
	const [searchInput, setSearchInput] = useState('');
	const [tags, setTags] = useState<string[]>([]);
	const [trendingTags, setTrendingTags] = useState<IPostTag[]>([]);
	const router = useRouter();
	const [displayTags, setDisplayTags] = useState<string[]>([]);

	const getData= async() => {
		const { data , error } = await nextApiClientFetch<IPostTag[]>('api/v1/all-tags');
		if(error) console.error('Error in getting all-tags', error);

		else if(data ){
			setAllTags(data);
			setTrendingTags(data);
		}
	};

	useEffect(() => {
		allTags.length === 0 && getData();
		!isSearch && setTags(defaultTags);
		defaultTags.length > 0 && setDisplayTags(defaultTags);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[defaultTags]);

	const handleFilterByClick = (key:string[]) => {
		if(key.length>0){
			router.replace({
				pathname:'',
				query: {
					...router.query,
					filterBy: encodeURIComponent(JSON.stringify(key))
				}
			});
		}
		else if(router.query.sortBy){
			router.replace({ pathname:'',
				query: {
					sortBy: router.query.sortBy
				}
			});
		}
		else{
			router.push({ pathname:'' });
		}
	};

	const handleExits= (value:string) => {
		value= value.toLowerCase();
		const isExits= tags.filter((tag) => tag === value);

		if ( isExits.length > 0 )return true;

		return false;
	};

	const handleSetTags=(tag: string) => {
		setOpenFilter(false);
		if (tag && tags.indexOf( tag.toLowerCase() ) === -1 && tags.length<5){
			setTags([...tags, tag.toLowerCase()]);
			setSelectedTags && setSelectedTags([...tags, tag.toLowerCase()]);
			!isSearch && handleFilterByClick([...tags, tag.toLowerCase()]);
		}
		return;

	};

	const handleRemoveTag= ( removedTag: string ) => {
		setOpenFilter(false);
		const newTags = tags.filter((tag) => tag !== removedTag);
		setTags(newTags);
		setSelectedTags && setSelectedTags(newTags);
		!isSearch && handleFilterByClick(newTags);
	};

	useEffect(() => {
		handleFilterResults(allTags, setFilteredTags, tags, searchInput);
		handleFilterResults(trendingTags, setTrendingTags, tags, searchInput);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[searchInput, tags]);

	useEffect(() => {
		setOpenFilter(false);
		if(searchInput.length === 0 && tags.length === 0 && filteredTags.length === 0){
			setDisplayTags(trendingTags.slice(0, 5).map((tag) => tag?.name));
		}else{
			setDisplayTags([...tags, ...(filteredTags?.slice(0, 5).map((tag) => tag?.name) || filteredTags.map((tag) => tag?.name))]);
		}
	}, [filteredTags, searchInput.length, tags, trendingTags, allTags]);

	const content = <div className='min-h-[150px]'>
		{!isSearch ? <div className={`text-sidebarBlue cursor-auto flex text-sm justify-between font-medium mb-[-2px] mt-[-2px] tracking-wide ${poppins.variable} ${poppins.className}`}>
      Tags
			{!isSearch && <span className='text-pink_primary font-normal text-[10px] flex justify-center cursor-pointer' onClick={() => {setTags([]); !isSearch && handleFilterByClick([]);setSearchInput('');}}>
			Clear Filters
			</span>}
		</div> : ''}

		<Input allowClear={{ clearIcon:<ClearIcon/> }} type='search' className='mt-[4px]' value={searchInput} onChange={(e) => setSearchInput(e.target.value)} prefix={<SearchIcon/>} />

		{searchInput.length === 0 && tags.length === 0 && filteredTags.length === 0
			? <div className='flex-col'>
				{isSearch && <div className={`text-[10px] text-[#243A57] font-normal mt-1 ${poppins.variable} ${poppins.className}`}>Suggestion :</div>}

				{ trendingTags.slice(0,5).map((tag, index) => <div key={index} onClick={() => handleSetTags(tag?.name)} className={`flex gap-2 text-xs items-center py-1 cursor-pointer ${poppins.className} ${poppins.variable}`}>
					<TrendingIcon/>
					<span className='text-xs text-[#667589] tracking-wide'>
						{tag.name}
					</span>
				</div> )}
			</div>
			: <Checkbox.Group className={`flex flex-col mt-1.5 tracking-[0.01em] justify-start max-h-[200px] overflow-y-scroll  ${poppins.className} ${poppins.variable}`} value={tags}>
				{displayTags.map((item, index) => <Checkbox onClick={() => handleExits(item) ? handleRemoveTag(item) : handleSetTags(item) }
					className={`text-xs font-normal ml-0 ${tags.includes(item) ? 'text-[#243A57]' : 'text-[#667589]'} ${index !== 0 ? 'py-1.5' : 'pb-1.5'}`}
					key={index} value={item}>
					<div className='mt-[2px]'>{item}</div>
				</Checkbox>)}
			</Checkbox.Group>}
		{filteredTags.length === 0 && searchInput.length > 0 ? <div className='h-[100%] flex items-center justify-center flex-col gap-2 mt-2'><NoTagsFoundIcon/><span className={`text-[10px] text-navBlue tracking-wide ${poppins.className} ${poppins.variable} `}>No tag found.</span></div> : null }
	</div>;

	return (

		<Popover
			content={content}
			open={!disabled && openFilter}
			className={className}
			onOpenChange={() => !disabled && setOpenFilter(!openFilter)}
			placement='bottomLeft'
			arrow={isSearch}
		>

			{!isSearch ? <div className={`text-sm tracking-wide font-normal flex items-center ${openFilter ? 'text-pink_primary':'text-grey_primary'} mt-[3.5px] cursor-pointer`}>
        Filter
				<span className='text-xl ml-2 mt-[2px]'>
					{openFilter?<FilterIcon/>:<FilterUnfilledIcon/>}
				</span>
			</div> : <div className={`flex items-center justify-center text-xs ${(openFilter) ? 'text-pink_primary':'text-[#667589]'} ${disabled ? 'text-[#B5BFCC] cursor-not-allowed' : 'cursor-pointer'}`}>
          Tags
				<span className='text-[#96A4B6] font-semibold'>{openFilter ? <HightlightDownOutlined className='ml-2.5 mt-1 max-md:ml-1'/> :<DownOutlined className='ml-2.5 mt-1 max-md:ml-1'/>}</span>
			</div> }

		</Popover> );
};
export default FilterByTags;