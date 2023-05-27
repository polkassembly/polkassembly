// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Checkbox, Input, Popover, Radio, RadioChangeEvent } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { SearchOutlined, DownOutlined } from '@ant-design/icons';
import { useNetworkContext } from '~src/context';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { poppins } from 'pages/_app';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import FilterByTags from '~src/ui-components/FilterByTags';
import { topicToOptionText } from 'src/components/Post/CreatePost/TopicsRadio';
import ResultPosts from './ResultPosts';
import SuperSearchIcon from '~assets/icons/super-search.svg';
import ResultPeople from './ResultPeople';
import algoliasearch from 'algoliasearch';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_API_KEY =process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;

interface Props{
  className?: string;
  setIsSuperSearch: (pre: boolean) => void;
  isSuperSearch: boolean;

}
enum EFilterValues {
  Referenda = 'on-chain-posts',
  Users = 'users',
  Discussions = 'off-chain-posts'
}
enum EMultipleCheckFilters {
  Tracks = 'track',
  Tags = 'tags',
  Topic = 'topic',
  Chain = 'chain'
}
enum EDateFilter {

  Today = 'today',
  Yesterday = 'yesterday',
  Last_7_days = 'last_7_days',
  Last_30_days = 'last_30_days' ,
  Last_3_months = 'last_3_months',
  Last_12_months = 'last_12_months'
}

const Search = ({ className, isSuperSearch, setIsSuperSearch }: Props) => {

	const client = algoliasearch(ALGOLIA_APP_ID || '', ALGOLIA_SEARCH_API_KEY || '');
	const index = client.initIndex('polkassembly_users');
	const getResultData = () => {

		index.search('17').then(({ hits }) => {
			console.log(hits);
		});

	};
	useEffect(() => {
		getResultData();
	}, []);

	const { network } = useNetworkContext();
	const [filterBy, setFilterBy] = useState<EFilterValues>();
	const [dateFilter, setDateFilter] = useState<EDateFilter>();
	const [selectedTags, setSelectedTags] =  useState<string[]>([]);
	const [selectedTracks, setSelectedTracks] = useState<CheckboxValueType[]>([]);
	const [selectedTopics, setSelectedTopics] = useState<CheckboxValueType[]>([]);
	const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
	const [ topicOptions, setTopicOptions]=useState<string[]>([]);
	const [govType, setGovType] = useState<'gov_1' | 'open_gov'>('open_gov');

	useEffect(() => {
		govType === 'gov_1' ? setTopicOptions([topicToOptionText('COUNCIL'),topicToOptionText('DEMOCRACY'),topicToOptionText('GENERAL'),topicToOptionText('TECHNICAL_COMMITTEE'), topicToOptionText('TREASURY')]) : setTopicOptions([topicToOptionText('ROOT'),topicToOptionText('STAKING_ADMIN'),topicToOptionText('AUCTION_ADMIN'),topicToOptionText('FELLOWSHIP'), topicToOptionText('TREASURY'),topicToOptionText('GOVERNANCE')]);
	}, [govType]);

	const tracksArr: { name: string; trackId: number; }[] = [];

	if (networkTrackInfo?.[network]) {
		Object.entries(networkTrackInfo?.[network]).forEach(([key, value]) => tracksArr.push({ name: key === 'root' ? 'Root' : key, trackId: value?.trackId }));
	}

	const onChange = (list: CheckboxValueType[], filter: EMultipleCheckFilters) => {
		if(filter === EMultipleCheckFilters.Tracks){ setSelectedTracks(list); }
		else if(filter === EMultipleCheckFilters.Topic) {setSelectedTopics(list);}
	};

	return <div className={className}>
		<Input className='placeholderColor mt-4' type='search' allowClear placeholder='Type here to search for something' addonAfter= {<SearchOutlined className='text-white text-[18px] tracking-[0.02em]'/>}/>
		<div className='mt-[18px] flex justify-between max-lg:flex-col max-md:gap-2'>
			<Radio.Group onChange={(e: RadioChangeEvent) => setFilterBy(e.target.value)} value={filterBy} className={`flex gap-[1px] ${poppins.variable} ${poppins.className}`}>
				<Radio value={EFilterValues.Referenda} className={`text-xs font-medium py-1.5 rounded-[24px] ${filterBy === EFilterValues.Referenda ? 'bg-[#FEF2F8] text-[#243A57] px-4 ' : 'text-[#667589] px-1'}`}>Referenda</Radio>
				<Radio value={EFilterValues.Users} className={`text-xs font-medium py-1.5 rounded-[24px] ${filterBy === EFilterValues.Users ? 'bg-[#FEF2F8] text-[#243A57] px-4' : 'text-[#667589] px-1'}`}>People</Radio>
				<Radio value={EFilterValues.Discussions} className={`text-xs font-medium py-1.5 rounded-[24px] ${filterBy === EFilterValues.Discussions ? 'bg-[#FEF2F8] text-[#243A57] px-4 ' : 'text-[#667589] px-1'}`}>Discussions</Radio>
			</Radio.Group>
			<div className='flex text-xs font-medium tracking-[0.02em] text-[#667589] gap-3.5'>
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
				<Popover content={
					<Checkbox.Group className={`checkboxStyle flex flex-col tracking-[0.01em] justify-start max-h-[200px] overflow-y-scroll ${poppins.className} ${poppins.variable}`} onChange={(list) => onChange(list, EMultipleCheckFilters.Tracks)} value={selectedTracks} >
						{tracksArr && tracksArr?.map((track) => <Checkbox key={track?.name} value={track?.name} className={`text-xs font-normal py-1.5 ml-0 ${selectedTracks.includes(track?.name) ? 'text-[#243A57]' : 'text-[#667589]'}`}>
							<div className='mt-[2px]'>{track?.name}</div>
						</Checkbox> )}
					</Checkbox.Group>} placement="bottomLeft">
					<div className='flex items-center justify-center text-xs'>
          Tracks
						<span className='text-[#96A4B6]'><DownOutlined className='ml-2.5'/></span>
					</div>
				</Popover>
				<Popover content={<Checkbox.Group className={`checkboxStyle flex flex-col tracking-[0.01em] justify-start ${poppins.className} ${poppins.variable}`} onChange={(list) => onChange(list, EMultipleCheckFilters.Topic)} value={selectedTopics} >
					{topicOptions && topicOptions?.map((topic) => <Checkbox key={topic} value={topic} className={`text-xs font-normal py-1.5 ml-0 ${selectedTopics.includes(topic) ? 'text-[#243A57]' : 'text-[#667589]'}`}>
						<div className='mt-[2px]'>{topic}</div>
					</Checkbox>)}</Checkbox.Group>} placement="bottomLeft" >
					<div className='flex items-center justify-center text-xs'>
          Topic
						<span className='text-[#96A4B6]'><DownOutlined className='ml-2.5'/></span>
					</div>
				</Popover>
			</div>
		</div>
		{(filterBy === EFilterValues.Referenda || filterBy ===  EFilterValues.Discussions) && <ResultPosts className='mt-6'/>}
		{filterBy === EFilterValues.Users && <ResultPeople />}

		{!isSuperSearch && <div className='flex flex-col justify-center items-center mt-7 gap-4 mb-5'>
			<label className='text-[#243A57] text-sm font-medium tracking-[0.01em]'>Didn’t find what you were looking for?</label>
			<Button onClick={() => setIsSuperSearch(true)} className='flex items-center justify-center gap-1.5 bg-[#E5007A] text-white text-sm font-medium rounded-[4px]'>
				<SuperSearchIcon/>
				<span>Use Super Search</span></Button>
		</div>}
	</div>;
};

export default styled(Search)`
.placeholderColor .ant-input-group-addon{
background: #E5007A;
color: white !important;
font-size:12px;
border: 1px solid #E5007A; 
}
.checkboxStyle .ant-checkbox-wrapper+.ant-checkbox-wrapper{
  margin-inline-start: 0px !important;
}

`;
