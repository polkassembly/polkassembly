// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Checkbox, Input, List, Modal, Popover, Radio, RadioChangeEvent, Collapse } from 'antd';
import _ from 'lodash';
import { useNetworkContext } from '~src/context';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import FilterByTags from '~src/ui-components/FilterByTags';
import ResultPosts from './ResultPosts';
import ResultPeople from './ResultPeople';
import algoliasearch from 'algoliasearch/lite';
import { ProposalType } from '~src/global/proposalType';
import SearchErrorsCard from './SearchErrorsCard';
import { post_topic } from '~src/global/post_topics';
import { optionTextToTopic, topicToOptionText } from '../Post/CreatePost/TopicsRadio';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { poppins } from 'pages/_app';
import styled from 'styled-components';
import NetworkDropdown from '~src/ui-components/NetworkDropdown';
import dayjs from 'dayjs';
import Image from 'next/image';
import SearchLoader from '~assets/search/search-loader.gif';
import DownOutlined from '~assets/search/dropdown-down.svg';
import HighlightDownOutlined from '~assets/search/pink-dropdown-down.svg';
import InputClearIcon from '~assets/icons/close-tags.svg';
import { SearchOutlined } from '@ant-design/icons';
import CloseIcon from '~assets/icons/close.svg';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import Markdown from '~src/ui-components/Markdown';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
export const algolia_client = algoliasearch(ALGOLIA_APP_ID || '', ALGOLIA_SEARCH_API_KEY || '');

const AUTOCOMPLETE_INDEX_LIMIT = 5;

interface IAutocompleteResults {
	posts: {[index: string]: any}[],
	users: {[index: string]: any}[]
}

const initAutocompleteResults: IAutocompleteResults = {
	posts: [],
	users: []
};

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
  Last_7_days = 'last_7_days',
  Last_30_days = 'last_30_days' ,
  Last_3_months = 'last_3_months',

}

const gov1Tracks =['tips','council_motions','bounties','child_bounties','treasury_proposals','democracy_proposals','tech_committee_proposals','referendums'];
const getTrackNameFromId = (network: string, trackId: number ) => {

	let trackName = '';
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	Object.entries(networkTrackInfo?.[network]).forEach(([key, value]) => {
		if(value?.trackId === trackId && !value?.fellowshipOrigin){
			trackName = value?.name;
		}
	}
	);
	return trackName;
};

const Search = ({ className, openModal, setOpenModal, isSuperSearch, setIsSuperSearch }: Props) => {
	const userIndex = algolia_client.initIndex('polkassembly_users');
	const postIndex = algolia_client.initIndex('polkassembly_posts');
	const addressIndex = algolia_client?.initIndex('polkassembly_addresses');

	const { network } = useNetworkContext();
	const [searchInput, setSearchInput] = useState<string>('');
	const [finalSearchInput, setFinalSearchInput] = useState<string>('');
	const [filterBy, setFilterBy] = useState<EFilterBy>(EFilterBy.Referenda);
	const [dateFilter, setDateFilter] = useState<EDateFilter | null>(null);
	const [selectedTags, setSelectedTags] =  useState<string[]>([]);
	const [selectedOpengovTracks, setSelectedOpengovTracks] = useState<CheckboxValueType[]>([]);
	const [selectedGov1Tracks, setSelectedGov1Tracks] = useState<CheckboxValueType[]>([]);
	const [selectedTopics, setSelectedTopics] = useState<CheckboxValueType[]>([]);
	const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
	const [peopleResults, setPeopleResults] = useState<any[] | null>(null);
	const [postResults, setPostResults] = useState<any[] | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const topicOptions: string[] = [];
	const [usersPage, setUsersPage] = useState({ page: 1, totalPeople: 0 });
	const [postsPage, setPostsPage] = useState({ page: 1, totalPosts: 0 });
	const [openFilter, setOpenFilter] = useState<{ date: boolean , topic: boolean, track: boolean }>({ date: false , topic: false, track: false });
	const [searchInputErr, setSearchInputErr] = useState({ clicked :false, err: false });
	const [autoCompleteResults, setAutoCompleteResults] = useState<IAutocompleteResults>(initAutocompleteResults);

	Object.keys(post_topic).map((topic) => topicOptions.push(topicToOptionText(topic)));

	const openGovTracks: { name: string; trackId: number; }[] = [];

	if (networkTrackInfo?.[network]) {
		Object.entries(networkTrackInfo?.[network]).forEach(([key, value]) =>
		{
			if(!value.fellowshipOrigin){
				openGovTracks.push({ name: key === 'root' ? 'Root' : value?.name, trackId: value?.trackId });
			}
		});
	}

	const getFacetFileters = () => {
		const postTypeFilter = [];

		if(filterBy === EFilterBy.Referenda){
			postTypeFilter.push([`post_type:-${ProposalType.DISCUSSIONS}`],[`post_type:-${ProposalType.GRANTS}`]);
			if(selectedGov1Tracks.length > 0 ){
				postTypeFilter.push(...selectedGov1Tracks.map((track) => [`post_type:${track}`] ));
			}
		}else if(filterBy === EFilterBy.Discussions){
			postTypeFilter.push([`post_type:${ProposalType.DISCUSSIONS}`,`post_type:${ProposalType.GRANTS}`]);
		}
		const tracksFilter = [
			(isOpenGovSupported(network)|| isSuperSearch) && filterBy !== EFilterBy.Discussions ?  selectedOpengovTracks.map((trackId) => `track_number:${Number(trackId)}`) : []
		];

		return  [
			...postTypeFilter,
			...tracksFilter,
			!isSuperSearch ? [`network:${network}`] : selectedNetworks.map((networkStr) => `network:${(networkStr).toLowerCase()}` ),
			selectedTags.map((tag) => { return `tags:${tag}`;}),
			selectedTopics.map((topic) => `topic_id:${post_topic[optionTextToTopic(String(topic)) as keyof typeof post_topic]}`)];
	};

	const getDateFilter = () => {
		if(!dateFilter) return '';

		const currentDate = dayjs(); // Get the current date

		function getPreviousDate(day: number){
			return currentDate.subtract(day, 'day').unix();
		}

		switch (dateFilter){
		case EDateFilter.Today:
			return `created_at:${currentDate.unix()} TO ${currentDate.unix()}`;
		case EDateFilter.Last_7_days:
			return `created_at:${currentDate.unix()} TO ${getPreviousDate(7)}`;
		case EDateFilter.Last_30_days:
			return `created_at:${currentDate.unix()} TO ${getPreviousDate(30)}`;
		case EDateFilter.Last_3_months:
			return `created_at:${currentDate.unix()} TO ${getPreviousDate(91)}`;
		}

	};

	const getpeopleDatawithAddress = (addressData: any[], postsData: any[]) => {
		if(!addressData || !postsData) return;
		const results = postsData?.map((people: any) =>
		{
			let result = people;
			for(const data of addressData){
				if(Number(data?.objectID) === Number(data?.objectID) && data?.default){
					result = { ...people, defaultAddress: data?.address || '' };
				}

			}
			return result;
		}
		);
		setPeopleResults(results);
	};

	const getDefaultAddress= async(data: any[]) => {
		if(!addressIndex) return ;

		const userIds = data.map((people: any) => `user_id:${Number(people?.objectID)}`);

		addressIndex.search('', { facetFilters: userIds, hitsPerPage: LISTING_LIMIT  }).then(({ hits }) => {
			getpeopleDatawithAddress(hits, data);
		}).catch((err) => {
			console.log(err);
		});
	};

	const getResultData = async() => {
		if(finalSearchInput.length <= 3 || !userIndex || !postIndex ){
			setLoading(false);
			return;
		}
		setAutoCompleteResults(initAutocompleteResults);
		setLoading(true);
		if(filterBy !== EFilterBy.Users){
			const facetFilters = getFacetFileters();
			await postIndex.search(finalSearchInput, { facetFilters, filters: getDateFilter(), hitsPerPage: LISTING_LIMIT, page: postsPage.page-1 }).then(({ hits, nbHits }) => {
				setPostsPage({ ...postsPage, totalPosts: nbHits });
				setPostResults(hits);
				console.log('here');
			}).catch((error) => {
				console.log(error);
				setLoading(false);
			});
		}
		else{
			await userIndex.search(finalSearchInput, { hitsPerPage: LISTING_LIMIT, page: usersPage.page-1 }).then(({ hits, nbHits }) => {
				setUsersPage({ ...usersPage, totalPeople: nbHits });

				setPeopleResults(hits);
				getDefaultAddress(hits);

			}).catch((error) => {
				console.log(error);
				setLoading(false);
			});
		}
		setLoading(false);

	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedSearchFn = useCallback(_.debounce(getResultData, 5000), [finalSearchInput, selectedTags, filterBy, selectedTopics, usersPage.page, postsPage.page, isSuperSearch, selectedNetworks, selectedGov1Tracks , selectedOpengovTracks, dateFilter]);

	useEffect(() => {
		if(finalSearchInput.length > 3){
			setSearchInputErr({ ...searchInputErr, err: false });
			setOpenFilter({ date: false, topic: false, track: false });
			setLoading(true);
			debouncedSearchFn();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[debouncedSearchFn]);

	const handleClearFilters = (close?: boolean) => {
		close && searchInput.length > 0 && setSearchInput('');
		close && finalSearchInput.length > 0 && setFinalSearchInput('');
		setSearchInputErr({ clicked: false, err: false });
		postResults && postResults?.length > 0 && setPostResults([]);
		peopleResults && peopleResults?.length > 0 && setPeopleResults([]);
		setFilterBy(EFilterBy.Referenda);
		selectedTags && selectedTags.length > 0 && setSelectedTags([]);
		selectedTopics.length > 0 && setSelectedTopics([]);
		selectedOpengovTracks.length > 0 && setSelectedOpengovTracks([]);
		dateFilter && setDateFilter(null);
		isSuperSearch && setIsSuperSearch(false);
		close && setOpenModal(false);
	};

	const getAutoCompleteData = async (queryStr: string) => {
		if(!queryStr) {
			setAutoCompleteResults({ posts: [], users: [] });
			return;
		}

		const postResults = await postIndex.search(queryStr, {
			facetFilters: getFacetFileters(),
			hitsPerPage: AUTOCOMPLETE_INDEX_LIMIT,
			highlightPreTag:'<mark>',
			highlightPostTag:'</mark>',
			page: 1,
			restrictSearchableAttributes: ['title', 'parsed_content']
		}).catch((error) => console.log('Posts autocomplete fetch error: ', error));

		const userResults = await userIndex.search(queryStr, {
			hitsPerPage: AUTOCOMPLETE_INDEX_LIMIT,
			page: 1,
			highlightPreTag:'<mark>',
			highlightPostTag:'</mark>',
			restrictSearchableAttributes: ['username', 'profile.bio', 'profile.title']
		}).catch((error) => console.log('Users autocomplete fetch error: ', error));

		setAutoCompleteResults({ posts: postResults?.hits || [], users: userResults?.hits || [] });
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedAutoCompleteFn = useCallback(_.debounce(getAutoCompleteData, 500), []);

	const handleSearchOnChange = async (queryStr: string) => {
		setSearchInput(queryStr);
		setSearchInputErr({ ...searchInputErr, clicked:false });

		if(autoCompleteResults.posts.length || autoCompleteResults.users.length){
			setAutoCompleteResults(initAutocompleteResults);
		}else {
			debouncedAutoCompleteFn(queryStr);
		}

	};

	function getMatchedWordsLength(hitObject: any) {
		let matchedWordsLength = 0;

		matchedWordsLength += hitObject._highlightResult?.title?.matchedWords?.length || 0;
		matchedWordsLength += hitObject._highlightResult?.pasrsed_content?.matchedWords?.length || 0;
		matchedWordsLength += hitObject._highlightResult?.username?.matchedWords?.length || 0;
		matchedWordsLength += hitObject._highlightResult?.profile?.bio?.matchedWords?.length || 0;
		matchedWordsLength += hitObject._highlightResult?.profile?.title?.matchedWords?.length || 0;

		return matchedWordsLength;
	}

	const sortedAutoCompleteResults = useMemo(() => {
		return autoCompleteResults.posts.concat(autoCompleteResults.users).sort((a, b) => {
			const aMatchedWordsLength = getMatchedWordsLength(a);
			const bMatchedWordsLength = getMatchedWordsLength(b);
			return aMatchedWordsLength - bMatchedWordsLength;
		});
	},[autoCompleteResults]);

	const getCleanString = (str: string) => {
		return str.replace(/<[^>]+>|\n|<br\s*\/?>|[*_~`]|(?:^|\s)#\S+|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)/g, '');
	};

	const getAutocompleteMarkedText = (highlightResult: {[index: string]: any}) => {
		const keysToCheck = ['parsed_content', 'title', 'profile', 'username'];
		let maxMatchedWordsLength = 0;
		let maxMatchedWordsObject = null;

		for (const key of keysToCheck) {
			const result = highlightResult[key];

			if (result && result.matchedWords && result.matchedWords.length > maxMatchedWordsLength) {
				maxMatchedWordsLength = result.matchedWords.length;
				maxMatchedWordsObject = result;
			}
		}

		function extractContent(str: string, extraContentLength: number = 40): string {
			// Find the first occurrence of <mark> tag in the input string
			const match = str.match(/<mark>(.*?)<\/mark>/);
			if (!match) return str.substring(0, extraContentLength);

			const markIndex = match.index || 0;
			const endIndex = markIndex + (match?.[0]?.length || 0);

			const subStrAfterMark = str.substring(endIndex) || '';

			// Remove all other tags
			const cleanSubStrAfterMark = getCleanString(subStrAfterMark);

			// Extract the substring including the first <mark> tag and its content
			return `${str.substring(markIndex, endIndex)}${cleanSubStrAfterMark.substring(0, extraContentLength)}${cleanSubStrAfterMark.length > extraContentLength ? '...' : ''}`;
		}

		return extractContent(maxMatchedWordsObject?.value || 'Untitled');
	};

	const handleSearchSubmit = () => {
		if(loading) return;
		setAutoCompleteResults(initAutocompleteResults);
		if(searchInput.length > 3){
			setFinalSearchInput(searchInput);
			setSearchInputErr({ err: false, clicked: true });
		}
		else {
			setPostResults([]);
			setPeopleResults([]);
			setSearchInputErr({ err: true, clicked: true });
		}
		setUsersPage({ page: 1, totalPeople: 0 });
		setPostsPage({ page: 1, totalPosts: 0 });

	};

	return <Modal
		title={<label className='text-[#243A57] text-xl font-semibold flex flex-wrap'>{isSuperSearch ? 'Super Search':'Search'} {finalSearchInput.length > 0 && `Results for "${finalSearchInput}"`}</label>}
		open={openModal}
		onCancel={() => handleClearFilters(true)}
		footer={false}
		className={`${className} w-[850px] max-md:w-full ${poppins.className} ${poppins.variable}`}
		closeIcon={<CloseIcon/>}
	>
		<div className={`${className} ${isSuperSearch && !loading && 'pb-20'}`}>
			<Input
				className='placeholderColor mt-4 rounded-[4px]'
				type='search'
				value={searchInput}
				onChange={(e) => handleSearchOnChange(e.target.value)}
				allowClear={{ clearIcon:<InputClearIcon/> }}
				placeholder='Type here to search for something'
				onPressEnter={handleSearchSubmit}
				addonAfter={
					<div onClick={handleSearchSubmit}
						className={`text-white text-[18px] tracking-[0.02em] ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
						<SearchOutlined/>
					</div>
				}
			/>

			{/* Autocomplete results */}
			{
				((autoCompleteResults.posts.length > 0 || autoCompleteResults.users.length > 0) && !searchInputErr?.err) &&
				<section className='border-solid border-[1px] border-gray-200 rounded-b-[4px] absolute z-50 w-[94.3%] bg-white'>
					{/* Posts List */}
					<List
						size="small"
						dataSource={sortedAutoCompleteResults}
						className='listing'
						renderItem={(item) => {
							const isPost = ('post_type' in item);
							const str = getAutocompleteMarkedText(item._highlightResult) || 'No title';
							const cleanStr = getCleanString(str);

							return(
								<List.Item className='flex justify-start hover:cursor-pointer whitespace-nowrap hover:bg-[#FEF2F8] ' onClick={() => {
									setFilterBy(!isPost ? EFilterBy.Users : item.post_type === 'discussions' ? EFilterBy.Discussions : EFilterBy.Referenda);
									handleSearchOnChange(cleanStr.endsWith('...') ? cleanStr.slice(0, -3) : cleanStr);
									setFinalSearchInput(cleanStr);
								}}>
									<Markdown className='hover:text-pink_primary' md={str} isAutoComplete />
									<span className='text-[9px] mx-2 text-gray-400'>&#9679;</span>
									<span className='text-xs text-gray-500'>{isPost ? 'in Posts' : 'in People'}</span>
								</List.Item>
							);
						}
						}
					/>
				</section>
			}

			{(finalSearchInput.length > 3 || searchInputErr.err ) && <div className={`${loading && 'hidden'} z-10`}>
				<div className={`mt-[18px] flex justify-between max-md:flex-col max-md:gap-2 radio-btn ${isSuperSearch && 'max-lg:flex-col max-lg:gap-2' }`}>
					<Radio.Group onChange={(e: RadioChangeEvent) => {setFilterBy(e.target.value); setPostsPage({ page: 1, totalPosts: 0 }); setUsersPage({ page: 1, totalPeople: 0 });}} value={filterBy} className={`flex gap-[1px] ${poppins.variable} ${poppins.className} max-md:flex-col`}>
						<Radio value={EFilterBy.Referenda} className={`text-xs font-medium py-1.5 rounded-[24px] ${filterBy === EFilterBy.Referenda ? 'bg-[#FEF2F8] text-[#243A57] px-4 ' : 'text-[#667589] px-1'} max-md:px-4`}>Referenda {filterBy === EFilterBy.Referenda && !loading && `(${postsPage?.totalPosts})`}</Radio>
						<Radio value={EFilterBy.Users} className={`text-xs font-medium py-1.5 rounded-[24px] ${filterBy === EFilterBy.Users ? 'bg-[#FEF2F8] text-[#243A57] px-4' : 'text-[#667589] px-1'} max-md:px-4`}>People {filterBy === EFilterBy.Users && !loading && `(${usersPage?.totalPeople})`}</Radio>
						<Radio value={EFilterBy.Discussions} className={`text-xs font-medium py-1.5 rounded-[24px] ${filterBy === EFilterBy.Discussions ? 'bg-[#FEF2F8] text-[#243A57] px-4 ' : 'text-[#667589] px-1'} max-md:px-4`}>Discussions {filterBy === EFilterBy.Discussions && !loading && `(${postsPage?.totalPosts})`}</Radio>
					</Radio.Group>

					{(filterBy === EFilterBy.Referenda || filterBy === EFilterBy.Discussions) && <div className='flex text-xs font-medium tracking-[0.02em] text-[#667589] gap-3.5 max-md:px-0 max-md:gap-1.5'>
						{ isSuperSearch && <NetworkDropdown setSidedrawer={() => {}} isSmallScreen={true} isSearch={true} setSelectedNetworks={setSelectedNetworks} selectedNetworks={selectedNetworks}/>}

						<Popover open={openFilter.date} onOpenChange={() => setOpenFilter({ ...openFilter,date: !openFilter.date })} content={<div className='flex flex-col gap-1'>
							<Radio.Group size='large' onChange={(e: RadioChangeEvent) => setDateFilter(e.target.value)} value={dateFilter} className={`gap-[1px] flex flex-col ${poppins.variable} ${poppins.className}`}>
								<Radio value={EDateFilter.Today} className={`text-xs font-normal py-1.5 ${dateFilter === EDateFilter.Today ? 'text-[#243A57]' : 'text-[#667589]'}`}>Today</Radio>
								<Radio value={EDateFilter.Last_7_days} className={`text-xs font-normal py-1.5 ${dateFilter === EDateFilter.Last_7_days ? 'text-[#243A57]' : 'text-[#667589]'}`}>Last 7 days</Radio>
								<Radio value={EDateFilter.Last_30_days} className={`text-xs font-normal py-1.5 ${dateFilter === EDateFilter.Last_30_days ? 'text-[#243A57]' : 'text-[#667589]'}`}>Last 30 days</Radio>
								<Radio value={EDateFilter.Last_3_months} className={`text-xs font-normal py-1.5 ${dateFilter === EDateFilter.Last_3_months ? 'text-[#243A57]' : 'text-[#667589]'}`}>Last 3 months</Radio>
								<Radio value={null} className={`text-xs font-normal py-1.5 ${!dateFilter ? 'text-[#243A57]' : 'text-[#667589]'}`}>All time</Radio>
							</Radio.Group></div>} placement="bottomLeft" >
							<div className={`flex items-center justify-center text-xs cursor-pointer ${openFilter.date && 'text-pink_primary' }`}>
                               Date
								<span className='text-[#96A4B6]'>
									{openFilter.date ?<HighlightDownOutlined  className='ml-2.5 mt-1 max-md-ml-1'/> :<DownOutlined className='ml-2.5 mt-1 max-md-ml-1'/>}
								</span>
							</div>
						</Popover>

						<FilterByTags isSearch={true} setSelectedTags={setSelectedTags} />

						{filterBy === EFilterBy.Referenda && <Popover rootClassName='track-popover' open={openFilter.track} onOpenChange={() => setOpenFilter({ ...openFilter, track: !openFilter.track })} content={
							<Collapse collapsible='header' className={`${poppins.className} ${poppins.variable} cursor-pointer`}>
								<Collapse.Panel key={1} header='Gov1' className='cursor-pointer'>
									<Checkbox.Group className={`checkboxStyle flex flex-col tracking-[0.01em] justify-start max-h-[200px] overflow-y-scroll ${poppins.className} ${poppins.variable}`} onChange={(list) => setSelectedGov1Tracks(list)} value={selectedGov1Tracks} >
										{gov1Tracks && gov1Tracks?.map((track) => <Checkbox key={track} value={track} className={`text-xs font-normal py-1.5 ml-0 ${selectedGov1Tracks.includes(track) ? 'text-[#243A57]' : 'text-[#667589]'}`}>
											<div className='mt-[2px] capitalize'>{track?.split('_')?.join(' ')}</div>
										</Checkbox> )}
									</Checkbox.Group>
								</Collapse.Panel>
								<Collapse.Panel key={2} header='OpenGov' className='cursor-pointer'>
									<Checkbox.Group className={`checkboxStyle flex flex-col tracking-[0.01em] justify-start max-h-[200px] overflow-y-scroll ${poppins.className} ${poppins.variable}`} onChange={(list) => setSelectedOpengovTracks(list)} value={selectedOpengovTracks} >
										{openGovTracks && openGovTracks?.map((track) => <Checkbox key={track?.name} value={track?.trackId} className={`text-xs font-normal py-1.5 ml-0 ${selectedOpengovTracks.includes(track?.name) ? 'text-[#243A57]' : 'text-[#667589]'}`}>
											<div className='mt-[2px] capitalize'>{track?.name?.split('_')?.join(' ')}</div>
										</Checkbox> )}
									</Checkbox.Group>
								</Collapse.Panel>
							</Collapse>

						} placement="bottomLeft">
							<div className={`flex items-center justify-center text-xs cursor-pointer ${(openFilter.track) && 'text-pink_primary' }`}>
                            Tracks
								<span className='text-[#96A4B6]'>
									{openFilter.track ?<HighlightDownOutlined  className='ml-2.5 mt-1 max-md-ml-1'/> : <DownOutlined className='ml-2.5 mt-1 max-md-ml-1'/>}</span>
							</div>
						</Popover>}

						<Popover open={openFilter.topic} onOpenChange={() => setOpenFilter({ ...openFilter, topic: !openFilter.topic })} content={<Checkbox.Group className={`checkboxStyle flex flex-col tracking-[0.01em] justify-start ${poppins.className} ${poppins.variable}`} onChange={(list) => setSelectedTopics(list)} value={selectedTopics} >
							{topicOptions && topicOptions?.map((topic) => <Checkbox key={topic} value={topic} className={`text-xs font-normal py-1.5 ml-0 ${selectedTopics.includes(topic) ? 'text-[#243A57]' : 'text-[#667589]'}`}>
								<div className='mt-[2px]'>{topic}</div>
							</Checkbox>)}</Checkbox.Group>} placement="bottomLeft" >
							<div className={`flex items-center justify-center text-xs cursor-pointer ${(openFilter.topic) && 'text-pink_primary' }`}>
                 Topic
								<span className='text-[#96A4B6]'>
									{openFilter.topic ? <HighlightDownOutlined  className='ml-2.5 mt-1 max-md-ml-1'/> :<DownOutlined className='ml-2.5 mt-1 max-md-ml-1'/>}
								</span>
							</div>
						</Popover>
					</div>}
				</div>

				<div className='mt-3 flex justify-between text-xs font-medium text-[#243A57] '>
					<div className='flex gap-1'>
						{isSuperSearch && selectedNetworks.length > 0 && <div className='py-1 px-2 bg-[#FEF2F8] flex gap-1 rounded-[4px]'>
							<span className='text-pink_primary'>Network:</span>
							<span>{selectedNetworks?.join(',')}</span>
						</div>}
						{dateFilter && <div className='py-1 px-2 bg-[#FEF2F8] flex gap-1 rounded-[4px] font-medium'>
							<span className='text-pink_primary'>Date:</span>
							<span className='capitalize'>{dateFilter?.split('_')?.join(' ')}</span>
						</div>}
						{selectedTags.length > 0 && <div className='py-1 px-2 bg-[#FEF2F8] flex gap-1 rounded-[4px]'>
							<span className='text-pink_primary'>Tags:</span>
							<span className='capitalize'>{selectedTags?.join(',')}</span>
						</div>}
						{(selectedOpengovTracks.length > 0 || selectedGov1Tracks.length > 0) && <div className='py-1 px-2 bg-[#FEF2F8] flex gap-1 rounded-[4px]'>
							<span className='text-pink_primary'>Tracks:</span>
							<>
								{selectedOpengovTracks?.map((trackId, index) => <span key={index} className="capitalize gap-[2px]">{ getTrackNameFromId(network, Number(trackId))?.split('_')?.join(' ')}{index !== selectedOpengovTracks.length - 1 && ','} </span> )}
								{selectedGov1Tracks.map((track, index) => <span key={index} className="capitalize gap-[2px]"> {selectedOpengovTracks.length > 0 && ', '}{ (track as string)?.split('_')?.join(' ')}{index !== selectedGov1Tracks.length - 1 && ','} </span>)}
							</>
						</div>}
						{selectedTopics.length > 0 && <div className='py-1 px-2 bg-[#FEF2F8] flex gap-1 rounded-[4px]'>
							<span className='text-pink_primary'>Topics:</span>
							<span>{selectedTopics?.join(',')}</span>
						</div>}
					</div>
					{filterBy !== EFilterBy.Users && <span className='text-pink_primary cursor-pointer' onClick={() => handleClearFilters()}>Clear All Filters</span>}
				</div>

				{
					(filterBy === EFilterBy.Referenda || filterBy ===  EFilterBy.Discussions) && !searchInputErr.err
						&& postResults && <ResultPosts setOpenModal={setOpenModal} isSuperSearch={isSuperSearch} postsData={postResults} className='mt-3' postsPage={postsPage} setPostsPage={setPostsPage}/>
				}

				{filterBy === EFilterBy.Users && !searchInputErr.err
					&& peopleResults && <ResultPeople searchInput={finalSearchInput} setOpenModal={setOpenModal} peopleData={peopleResults} usersPage={usersPage} setUsersPage={setUsersPage} />
				}

				{
					!loading && (searchInputErr.err || postResults || peopleResults)  && <SearchErrorsCard
						isSearchErr = {searchInput.length <= 3 && searchInputErr.clicked ? true : searchInputErr?.err}
						filterBy={filterBy}
						setFilterBy={setFilterBy}
						setOpenModal= {setOpenModal}
						setIsSuperSearch={setIsSuperSearch}
						postResultsCounts={ isSuperSearch ? 0 : postsPage.totalPosts || 0}
						peopleResultsCounts={isSuperSearch ? 0 : usersPage.totalPeople || 0}
						isSuperSearch= {isSuperSearch}
					/>
				}
			</div>}

			<div className={`flex flex-col justify-center items-center pt-10 pb-8 gap-4 ${!loading && 'hidden'}`}>
				<Image src={SearchLoader} alt='' height={150} width={150}/>
				<span className='font-medium text-sm text-[#243A57] tracking-[0.01em]'>
					{isSuperSearch ? 'Looking for results across the Polkassembly Universe.': 'Looking for results.'}
				</span>
			</div>

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
.ant-input-affix-wrapper {
	border-width: 1px !important;
  border-radius:4px 0px 0px 4px !important;
}
.listing .ant-spin-nested-loading .ant-spin-container .ant-list-items .ant-list-item{
  padding:0px 18px !important;
}
.track-popover .ant-popover-content .ant-popover-inner {
  padding:0px !important;
  border-radius: 4px !important;

}
.track-popover .ant-popover-content .ant-popover-inner .ant-collapse{
  padding:0px !important;
  border-radius: 4px !important;
  border:none !important;
}
`;
