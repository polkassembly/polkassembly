// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useCallback, useEffect, useState } from 'react';
import { Checkbox, Input, Modal, Popover, Radio, RadioChangeEvent } from 'antd';
import _ from 'lodash';
import { useNetworkContext } from '~src/context';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import FilterByTags from '~src/ui-components/FilterByTags';
import ResultPosts from './ResultPosts';
import ResultPeople from './ResultPeople';
import algoliasearch from 'algoliasearch/lite';
import { ProposalType } from '~src/global/proposalType';
import SuperSearchCard from './SuperSearchCard';
import { post_topic } from '~src/global/post_topics';
import { optionTextToTopic, topicToOptionText } from '../Post/CreatePost/TopicsRadio';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { poppins } from 'pages/_app';
import styled from 'styled-components';
import NetworkDropdown from '~src/ui-components/NetworkDropdown';
// import dayjs from 'dayjs';
import Image from 'next/image';
import SearchLoader from '~assets/search/search-loader.gif';
import DownOutlined from '~assets/search/dropdown-down.svg';
import { SearchOutlined } from '@ant-design/icons';
import CloseIcon from '~assets/icons/close.svg';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
export const algolia_client = algoliasearch(ALGOLIA_APP_ID || '', ALGOLIA_SEARCH_API_KEY || '');

interface Props{
  className?: string;
  openModal: boolean;
  setOpenModal: (pre: boolean) => void;
  isSuperSearch: boolean;
  setIsSuperSearch: ( pre: boolean) => void;
}
export enum EFilterBy {
  Referenda = 'on-chain-posts',
  Users = 'users',
  Discussions = 'off-chain-posts'
}
export enum EMultipleCheckFilters {
  Tracks = 'track',
  Tags = 'tags',
  Topic = 'topic',
  Chain = 'chains'
}
export enum EDateFilter {
  Today = 'today',
  Yesterday = 'yesterday',
  Last_7_days = 'last_7_days',
  Last_30_days = 'last_30_days' ,
  Last_3_months = 'last_3_months',
  Last_12_months = 'last_12_months'
}

const Search = ({ className, openModal, setOpenModal, isSuperSearch, setIsSuperSearch }: Props) => {
	const userIndex = algolia_client.initIndex('polkassembly_users');
	const postIndex = algolia_client.initIndex('polkassembly_posts');

	const { network } = useNetworkContext();
	const [searchInput, setSearchInput] = useState<string>('');
	const [filterBy, setFilterBy] = useState<EFilterBy>(EFilterBy.Referenda);
	const [dateFilter, setDateFilter] = useState<EDateFilter | null>();
	const [selectedTags, setSelectedTags] =  useState<string[]>([]);
	const [selectedTracks, setSelectedTracks] = useState<CheckboxValueType[]>([]);
	const [selectedTopics, setSelectedTopics] = useState<CheckboxValueType[]>([]);
	const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
	const [userResults, setPeopleResults] = useState<any[] | null>(null);
	const [postResults, setPostResults] = useState<any[] | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const topicOptions: string[] = [];
	const [usersPage, setUsersPage] = useState({ page: 1, totalUsers: 0 });
	const [postsPage, setPostsPage] = useState({ page: 1, totalPosts: 0 });
	const [openFilter, setOpenFilter] = useState<{ date: boolean , topic: boolean, track: boolean }>({ date: false , topic: false, track: false });

	Object.keys(post_topic).map((topic) => topicOptions.push(topicToOptionText(topic)));

	const tracksArr: { name: string; trackId: number; }[] = [];

	if (networkTrackInfo?.[network]) {
		Object.entries(networkTrackInfo?.[network]).forEach(([key, value]) => tracksArr.push({ name: key === 'root' ? 'Root' : key, trackId: value?.trackId }));
	}

	const handleFilterChange = (list: CheckboxValueType[], filter: EMultipleCheckFilters) => {
		if(filter === EMultipleCheckFilters.Tracks){ setSelectedTracks(list); }
		else if(filter === EMultipleCheckFilters.Topic) {setSelectedTopics(list);}
	};

	const getFacetFileters = () => {

		const postTypeFilter = [];
		// const currentDate = dayjs(); // Get the current date
		// const dateBefore30Days = currentDate.subtract(30, 'day');

		// const datefilter = [`created_at:${currentDate} - ${dateBefore30Days}`];

		// const tracksFilter = [selectedTracks.map((trackId) => `track_id:${Number(trackId)}`)];

		const topicFilter = [selectedTopics.map((topic) => {
			const topicStr = optionTextToTopic(String(topic));
			return `topic_id:${post_topic[topicStr as keyof typeof post_topic]}`;
		} )];

		const tagsFilter = [selectedTags.map((tag) => { return `tags:${tag}`;})];

		if(filterBy === EFilterBy.Referenda){
			postTypeFilter.push([`postType:-${ProposalType.DISCUSSIONS}`],[`postType:-${ProposalType.GRANTS}`]);
		}else if(filterBy === EFilterBy.Discussions){
			postTypeFilter.push([`postType:${ProposalType.DISCUSSIONS}`,`postType:${ProposalType.GRANTS}`]);
		}

		const networkFilter = [!isSuperSearch ? [`network:${network}`] : selectedNetworks.map((networkStr) => `network:${(networkStr).toLowerCase()}` )];
		return  [...networkFilter, ...postTypeFilter, ...tagsFilter, ...topicFilter];
	};

	const getResultData = async() => {

		if(searchInput.length <= 2 || !userIndex || !postIndex ){
			setLoading(false);
			return;
		}

		setLoading(true);
		if(filterBy !== EFilterBy.Users){
			const facetFilters = getFacetFileters();
			await postIndex.search(searchInput, { facetFilters, hitsPerPage: LISTING_LIMIT, page: postsPage.page-1 }).then(({ hits, nbHits }) => {
				setPostsPage({ ...postsPage, totalPosts: nbHits });
				setPostResults(hits);
			});
		}
		else{
			await userIndex.search(searchInput, { filters : '', hitsPerPage: LISTING_LIMIT, page: usersPage.page-1 }).then(({ hits, nbHits }) => {
				setUsersPage({ ...usersPage, totalUsers: nbHits });
				setPeopleResults(hits);
			});
		}
		setLoading(false);

	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedSearchFn = useCallback(_.debounce(getResultData, 5000), [searchInput, selectedTags, filterBy, selectedTopics, usersPage.page, postsPage.page, isSuperSearch, selectedNetworks]);

	useEffect(() => {
		if(searchInput.length<=2)return;
		setLoading(true);
		debouncedSearchFn();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearchFn]);

	const handleModalClose = () => {
		setSearchInput('');
		setPostResults([]);
		setPeopleResults([]);
		setFilterBy(EFilterBy.Referenda);
		setSelectedTags([]);
		setSelectedTopics([]);
		setDateFilter(null);
		setIsSuperSearch(false);
		setOpenModal(false);
	};

	return <Modal
		title={<label className='text-[#243A57] text-xl font-semibold'>{isSuperSearch ? 'Super Search':'Search'} {searchInput.length > 0 && `Results for "${searchInput}"`}</label>}
		open={openModal}
		onCancel={handleModalClose}
		footer={false}
		className={`${className} w-[850px] max-md:w-full ${poppins.className} ${poppins.variable}`}
		closeIcon={<CloseIcon/>}
	>
		<div className={`${className} ${isSuperSearch && !loading && 'pb-20'}`}>
			<Input className='placeholderColor mt-4' type='search' value={searchInput} onChange={(e) => setSearchInput(e.target.value)} allowClear placeholder='Type here to search for something' addonAfter= {<SearchOutlined className='text-white text-[18px] tracking-[0.02em]'/>}/>
			{!loading ?

				searchInput.length > 2 && (postResults || userResults) && <>
					<div className={`mt-[18px] flex justify-between max-md:flex-col max-md:gap-2 radio-btn ${isSuperSearch && 'max-lg:flex-col max-lg:gap-2 ' }`}>
						<Radio.Group onChange={(e: RadioChangeEvent) => {setFilterBy(e.target.value); setPostsPage({ page: 1, totalPosts: 0 }); setUsersPage({ page: 1, totalUsers: 0 });}} value={filterBy} className={`flex gap-[1px] ${poppins.variable} ${poppins.className}`}>
							<Radio value={EFilterBy.Referenda} className={`text-xs font-medium py-1.5 rounded-[24px] ${filterBy === EFilterBy.Referenda ? 'bg-[#FEF2F8] text-[#243A57] px-4 ' : 'text-[#667589] px-1'}`}>Referenda {filterBy === EFilterBy.Referenda && !loading && `(${postResults?.length})`}</Radio>
							<Radio value={EFilterBy.Users} className={`text-xs font-medium py-1.5 rounded-[24px] ${filterBy === EFilterBy.Users ? 'bg-[#FEF2F8] text-[#243A57] px-4' : 'text-[#667589] px-1'}`}>People {filterBy === EFilterBy.Users && !loading && `(${userResults?.length})`}</Radio>
							<Radio value={EFilterBy.Discussions} className={`text-xs font-medium py-1.5 rounded-[24px] ${filterBy === EFilterBy.Discussions ? 'bg-[#FEF2F8] text-[#243A57] px-4 ' : 'text-[#667589] px-1'}`}>Discussions {filterBy === EFilterBy.Discussions && !loading && `(${postResults?.length})`}</Radio>
						</Radio.Group>
						{(filterBy === EFilterBy.Referenda || filterBy === EFilterBy.Discussions) && <div className='flex text-xs font-medium tracking-[0.02em] text-[#667589] gap-3.5 max-md:px-4'>
							{ isSuperSearch && <NetworkDropdown setSidedrawer={() => {}} isSmallScreen={true} isSearch={true} setSelectedNetworks={setSelectedNetworks} selectedNetworks={selectedNetworks}/>}
							<Popover open={openFilter.date} onOpenChange={() => setOpenFilter({ ...openFilter,date: !openFilter.date })} content={<div className='flex flex-col gap-1'>
								<Radio.Group size='large' onChange={(e: RadioChangeEvent) => setDateFilter(e.target.value)} value={dateFilter} className={`gap-[1px] flex flex-col ${poppins.variable} ${poppins.className}`}>
									<Radio value={EDateFilter.Today} className={`text-xs font-normal py-1.5 ${dateFilter === EDateFilter.Today ? 'text-[#243A57]' : 'text-[#667589]'}`}>Today</Radio>
									<Radio value={EDateFilter.Yesterday} className={`text-xs font-normal py-1.5 ${dateFilter === EDateFilter.Yesterday ? 'text-[#243A57]' : 'text-[#667589]'}`}>Yesterday</Radio>
									<Radio value={EDateFilter.Last_7_days} className={`text-xs font-normal py-1.5 ${dateFilter === EDateFilter.Last_7_days ? 'text-[#243A57]' : 'text-[#667589]'}`}>Last 7 days</Radio>
									<Radio value={EDateFilter.Last_30_days} className={`text-xs font-normal py-1.5 ${dateFilter === EDateFilter.Last_30_days ? 'text-[#243A57]' : 'text-[#667589]'}`}>Last 30 days</Radio>
									<Radio value={EDateFilter.Last_3_months} className={`text-xs font-normal py-1.5 ${dateFilter === EDateFilter.Last_3_months ? 'text-[#243A57]' : 'text-[#667589]'}`}>Last 3 months</Radio>
									<Radio value={EDateFilter.Last_12_months} className={`text-xs font-normal py-1.5 ${dateFilter === EDateFilter.Last_12_months ? 'text-[#243A57]' : 'text-[#667589]'}`}>Last 12 months</Radio>
								</Radio.Group></div>} placement="bottomLeft" >
								<div className={`flex items-center justify-center text-xs cursor-pointer ${openFilter.date && 'text-pink_primary' }`}>
                               Date
									<span className='text-[#96A4B6]'>
										<DownOutlined className='ml-2.5 mt-1'/></span>
								</div>
							</Popover>
							<FilterByTags isSearch={true} setSelectedTags={setSelectedTags} selectedTags={selectedTags}/>
							{filterBy === EFilterBy.Referenda && <Popover  open={openFilter.track} onOpenChange={() => setOpenFilter({ ...openFilter, track: !openFilter.track })} content={
								<Checkbox.Group className={`checkboxStyle flex flex-col tracking-[0.01em] justify-start max-h-[200px] overflow-y-scroll ${poppins.className} ${poppins.variable}`} onChange={(list) => handleFilterChange(list, EMultipleCheckFilters.Tracks)} value={selectedTracks} >
									{tracksArr && tracksArr?.map((track) => <Checkbox key={track?.name} value={track?.trackId} className={`text-xs font-normal py-1.5 ml-0 ${selectedTracks.includes(track?.name) ? 'text-[#243A57]' : 'text-[#667589]'}`}>
										<div className='mt-[2px]'>{track?.name}</div>
									</Checkbox> )}
								</Checkbox.Group>} placement="bottomLeft">
								<div className={`flex items-center justify-center text-xs cursor-pointer ${openFilter.track && 'text-pink_primary' }`}>
                            Tracks
									<span className='text-[#96A4B6]'>
										<DownOutlined className='ml-2.5 mt-1'/></span>
								</div>
							</Popover>}
							<Popover open={openFilter.topic} onOpenChange={() => setOpenFilter({ ...openFilter, topic: !openFilter.topic })} content={<Checkbox.Group className={`checkboxStyle flex flex-col tracking-[0.01em] justify-start ${poppins.className} ${poppins.variable}`} onChange={(list) => handleFilterChange(list, EMultipleCheckFilters.Topic)} value={selectedTopics} >
								{topicOptions && topicOptions?.map((topic) => <Checkbox key={topic} value={topic} className={`text-xs font-normal py-1.5 ml-0 ${selectedTopics.includes(topic) ? 'text-[#243A57]' : 'text-[#667589]'}`}>
									<div className='mt-[2px]'>{topic}</div>
								</Checkbox>)}</Checkbox.Group>} placement="bottomLeft" >
								<div className={`flex items-center justify-center text-xs cursor-pointer ${openFilter.topic && 'text-pink_primary' }`}>
                 Topic
									<span className='text-[#96A4B6]'><DownOutlined className='ml-2.5 mt-1'/></span>
								</div>
							</Popover>
						</div>}
					</div>
					{
						(filterBy === EFilterBy.Referenda || filterBy ===  EFilterBy.Discussions)
          && postResults && <ResultPosts setOpenModal={setOpenModal} isSuperSearch={isSuperSearch} postsData={postResults} className='mt-6' postsPage={postsPage} setPostsPage={setPostsPage}/>
					}

					{filterBy === EFilterBy.Users && userResults &&  <ResultPeople searchInput={searchInput} setOpenModal={setOpenModal} peopleData={userResults} usersPage={usersPage} setUsersPage={setUsersPage} />}

					{
						!loading && (postResults || userResults) && <SuperSearchCard
							setFilterBy={setFilterBy}
							setIsSuperSearch={setIsSuperSearch}
							postResultsCounts={postResults?.length || 0}
							userResultsCounts={userResults?.length || 0}
							isSuperSearch= {isSuperSearch}
							filterBy={filterBy}/>}
				</>
				:<div className='flex flex-col justify-center items-center pt-10 pb-8 gap-4'>
					<Image src={SearchLoader} alt='' height={200} width={200}/>
					<span className='font-medium text-sm text-[#243A57] tracking-[0.01em]'>
						{isSuperSearch ? 'Looking for results across the Polkassembly Universe.': 'Looking for results.'}
					</span>
				</div>

			}
		</div>
	</Modal>;
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
