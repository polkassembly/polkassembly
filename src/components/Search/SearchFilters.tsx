// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Checkbox, Popover, Radio, RadioChangeEvent } from 'antd';
import { SearchOutlined, DownOutlined } from '@ant-design/icons';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import FilterByTags from '~src/ui-components/FilterByTags';
import { poppins } from 'pages/_app';

export enum EFilterBy {
  Referenda = 'on-chain-posts',
  Users = 'users',
  Discussions = 'off-chain-posts'
}
export enum EMultipleCheckFilters {
  Tracks = 'track',
  Tags = 'tags',
  Topic = 'topic',
  Chain = 'chain'
}
export enum EDateFilter {

  Today = 'today',
  Yesterday = 'yesterday',
  Last_7_days = 'last_7_days',
  Last_30_days = 'last_30_days' ,
  Last_3_months = 'last_3_months',
  Last_12_months = 'last_12_months'
}
interface Props{
  filterBy: EFilterBy;
  dateFilter ?: EDateFilter;
  setDateFilter : (pre: EDateFilter) => void;
  selectedTags: string[];
  setSelectedTags: (pre: string[] ) => void;
  selectedTracks: CheckboxValueType[];
  setSelectedTracks: (pre: CheckboxValueType[] ) => void;
  selectedTopics: CheckboxValueType[];
  setSelectedTopics: (pre: CheckboxValueType[] ) => void;
  topicOptions: string[];
  isSuperSearch: boolean;
  tracksArr:  { name: string; trackId: number; }[];
}

const SearchFilters = ({ filterBy, dateFilter, setDateFilter, selectedTags, setSelectedTags, selectedTracks, setSelectedTracks, selectedTopics, setSelectedTopics, topicOptions, isSuperSearch, tracksArr }: Props) =>
{

	const onChange = (list: CheckboxValueType[], filter: EMultipleCheckFilters) => {
		if(filter === EMultipleCheckFilters.Tracks){ setSelectedTracks(list); }
		else if(filter === EMultipleCheckFilters.Topic) {setSelectedTopics(list);}
	};

	return<>
		{(filterBy === EFilterBy.Referenda || filterBy === EFilterBy.Discussions) && <div className='flex text-xs font-medium tracking-[0.02em] text-[#667589] gap-3.5'>
			{isSuperSearch && <Popover content={<div>hello</div>} placement="bottomLeft">
				<div className='flex items-center justify-center text-xs'>
          Chain
					<span className='text-[#96A4B6]'><DownOutlined className='ml-2.5'/></span>
				</div>
			</Popover>}
			<Popover content={<div className='flex flex-col gap-1'>
				<Radio.Group onChange={(e: RadioChangeEvent) => setDateFilter(e.target.value)} value={dateFilter} className={`gap-[1px] flex flex-col ${poppins.variable} ${poppins.className}`}>
					<Radio value={EDateFilter.Today} className={`text-xs font-normal py-1.5 ${dateFilter === EDateFilter.Today ? 'text-[#243A57]' : 'text-[#667589]'}`}>Today</Radio>
					<Radio value={EDateFilter.Yesterday} className={`text-xs font-normal py-1.5 ${dateFilter === EDateFilter.Yesterday ? 'text-[#243A57]' : 'text-[#667589]'}`}>Yesterday</Radio>
					<Radio value={EDateFilter.Last_7_days} className={`text-xs font-normal py-1.5 ${dateFilter === EDateFilter.Last_7_days ? 'text-[#243A57]' : 'text-[#667589]'}`}>Last 7 days</Radio>
					<Radio value={EDateFilter.Last_30_days} className={`text-xs font-normal py-1.5 ${dateFilter === EDateFilter.Last_30_days ? 'text-[#243A57]' : 'text-[#667589]'}`}>Last 30 days</Radio>
					<Radio value={EDateFilter.Last_3_months} className={`text-xs font-normal py-1.5 ${dateFilter === EDateFilter.Last_3_months ? 'text-[#243A57]' : 'text-[#667589]'}`}>Last 3 months</Radio>
					<Radio value={EDateFilter.Last_12_months} className={`text-xs font-normal py-1.5 ${dateFilter === EDateFilter.Last_12_months ? 'text-[#243A57]' : 'text-[#667589]'}`}>Last 12 months</Radio>
				</Radio.Group></div>} placement="bottomLeft" >
				<div className='flex items-center justify-center text-xs'>
          Date
					<span className='text-[#96A4B6]'><DownOutlined className='ml-2.5 '/></span>
				</div>
			</Popover>
			<FilterByTags isSearch={true} setSelectedTags={setSelectedTags}/>
			{filterBy === EFilterBy.Referenda && <Popover content={
				<Checkbox.Group className={`checkboxStyle flex flex-col tracking-[0.01em] justify-start max-h-[200px] overflow-y-scroll ${poppins.className} ${poppins.variable}`} onChange={(list) => onChange(list, EMultipleCheckFilters.Tracks)} value={selectedTracks} >
					{tracksArr && tracksArr?.map((track) => <Checkbox key={track?.name} value={track?.name} className={`text-xs font-normal py-1.5 ml-0 ${selectedTracks.includes(track?.name) ? 'text-[#243A57]' : 'text-[#667589]'}`}>
						<div className='mt-[2px]'>{track?.name}</div>
					</Checkbox> )}
				</Checkbox.Group>} placement="bottomLeft">
				<div className='flex items-center justify-center text-xs'>
          Tracks
					<span className='text-[#96A4B6]'><DownOutlined className='ml-2.5'/></span>
				</div>
			</Popover>}
			<Popover content={<Checkbox.Group className={`checkboxStyle flex flex-col tracking-[0.01em] justify-start ${poppins.className} ${poppins.variable}`} onChange={(list) => onChange(list, EMultipleCheckFilters.Topic)} value={selectedTopics} >
				{topicOptions && topicOptions?.map((topic) => <Checkbox key={topic} value={topic} className={`text-xs font-normal py-1.5 ml-0 ${selectedTopics.includes(topic) ? 'text-[#243A57]' : 'text-[#667589]'}`}>
					<div className='mt-[2px]'>{topic}</div>
				</Checkbox>)}</Checkbox.Group>} placement="bottomLeft" >
				<div className='flex items-center justify-center text-xs'>
          Topic
					<span className='text-[#96A4B6]'><DownOutlined className='ml-2.5'/></span>
				</div>
			</Popover>
		</div>}</>;
};
export default SearchFilters;