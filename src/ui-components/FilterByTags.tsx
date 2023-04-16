// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Dropdown, Input, MenuProps } from 'antd';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import useGetFilterByFromUrl from '~src/hooks/useGetFilterbyFromUrl';

import { IPostTag } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { poppins } from 'pages/_app';
import handleFilterResults from '~src/util/handleFilterResults';
import NoTagsFoundIcon from '~assets/icons/no-tag.svg';

import { CheckOutlineIcon, CheckedIcon, FilterIcon, FilterUnfilledIcon, SearchIcon, TrendingIcon } from './CustomIcons';
import ClearIcon from '~assets/icons/close-tags.svg';

interface Props {
  className?:string;
}

const FilterByTags=({ className }:Props) => {
	const defaultTags = useGetFilterByFromUrl();
	const [openFilter,setOpenFilter] = useState<boolean>(false);
	const [filteredTags,setFilteredTags] = useState<IPostTag[]>([]);
	const [allTags,setAllTags] = useState<IPostTag[]>([]);
	const [searchInput,setSearchInput] = useState('');
	const [tags,setTags] = useState<string[]>([]);
	const [trendingTags,setTrendingTags] = useState<IPostTag[]>([]);
	const router = useRouter();

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
		setTags(defaultTags);
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

	const handleSetTags=(tag:string) => {

		if (tag && tags.indexOf( tag.toLowerCase() ) === -1 && tags.length<5){
			setTags([...tags, tag.toLowerCase()]);
			handleFilterByClick([...tags, tag.toLowerCase()]);
		}
		return;

	};

	const handleRemoveTag= ( removedTag: string ) => {
		const newTags = tags.filter((tag) => tag !== removedTag);
		setTags(newTags);
		handleFilterByClick(newTags);
	};

	useEffect(() => {
		handleFilterResults(allTags, setFilteredTags, tags, searchInput);
		handleFilterResults(trendingTags, setTrendingTags, tags, searchInput);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[searchInput,tags]);

	const items:MenuProps['items'] = [
		{ key: 1, label: <div className={`text-sidebarBlue cursor-auto flex text-sm justify-between font-medium mb-[-4px] mt-[-2px] tracking-wide ${poppins.variable} ${poppins.className}`}>Tags <span className='text-pink_primary font-normal text-[10px] flex justify-center cursor-pointer' onClick={() => {setTags([]);handleFilterByClick([]);setSearchInput('');}}>Clear Filters</span></div> },
		{ key: 2, label: <Input allowClear={{ clearIcon:<ClearIcon/> }} type='search' value={searchInput} onChange={(e) => setSearchInput(e.target.value)} prefix={<SearchIcon/>} /> },
		...tags.map((tag,index) =>
		{
			return { key: index+3, label: <div className='flex items-center justify-between boder-solid'><div><SearchIcon className='mr-2'/><span className={`${poppins.variable} ${poppins.className} text-navBlue text-xs tracking-wide`}>{tag}</span></div><div>{handleExits(tag)?<div onClick={() => handleRemoveTag(tag)}><CheckedIcon className='mt-[-2px]'/></div>:<div onClick={() => handleSetTags(tag)}><CheckOutlineIcon className='mt-[-2px]'/></div>}</div></div>
			};
		}),
		...trendingTags.slice(0,5).map((tag, index) => {
			if(searchInput.length === 0 && tags.length === 0 && filteredTags.length === 0)
			{
				return { key:index+10,label:<div onClick={() => handleSetTags(tag?.name)} className={`flex gap-2 text-xs items-center ${poppins.className} ${poppins.variable}`}><TrendingIcon/><span className='text-xs text-navBlue tracking-wide'>{tag.name}</span></div> };
			}
			return null;
		}),
		filteredTags.length === 0 && searchInput.length > 0 ? { key: 0, label: <div className='h-[100%] flex items-center justify-center flex-col gap-2'><NoTagsFoundIcon/><span className={`text-[10px] text-navBlue tracking-wide ${poppins.className} ${poppins.variable} `}>No tag found.</span></div> } : null ,

		...filteredTags.slice(0,5).map((tag, index) => {
			return { key: index+20, label:<div className='flex items-center justify-between'><div><SearchIcon className='mr-2'/><span className={`${poppins.variable} ${poppins.className} text-navBlue text-xs tracking-wide`}>{tag?.name}</span></div><div>{!handleExits(tag?.name) && <div onClick={() => handleSetTags(tag?.name)}><CheckOutlineIcon className='mt-[-2px]'/></div>}</div></div> };
		})
	];

	return (

		<Dropdown
			menu={{ items }}
			open={openFilter}
			className={className}
			overlayClassName='background-change'
			onOpenChange={() => setOpenFilter(!openFilter)}
			placement="bottomRight"
		>

			<div className={`text-sm tracking-wide font-normal flex items-center ${openFilter ? 'text-pink_primary':'text-grey_primary'} mt-[3.5px] cursor-pointer`}>
        Filter
				<span className='text-xl ml-2 mt-[2px]'>
					{openFilter?<FilterIcon/>:<FilterUnfilledIcon/>}
				</span>
			</div>

		</Dropdown> );
};
export default FilterByTags;
