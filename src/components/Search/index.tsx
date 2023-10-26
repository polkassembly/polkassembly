// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Checkbox, Input, List, Modal, Popover, Radio, RadioChangeEvent, Collapse } from 'antd';
import _ from 'lodash';
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
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import Markdown from '~src/ui-components/Markdown';
import dayjs from 'dayjs';
import Image from 'next/image';
import { SearchOutlined } from '@ant-design/icons';
import SearchLoader from '~assets/search/search-loader.gif';
import StartSearchIcon from '~assets/search/search-start.svg';
import DownOutlined from '~assets/search/dropdown-down.svg';
import HighlightDownOutlined from '~assets/search/pink-dropdown-down.svg';
import InputClearIcon from '~assets/icons/close-tags.svg';
import LeftArrow from '~assets/icons/arrow-left.svg';
import PaLogo from '../AppLayout/PaLogo';
import { getTrackNameFromId } from '~src/util/trackNameFromId';
import { useNetworkSelector } from '~src/redux/selectors';
import { CloseIcon } from '~src/ui-components/CustomIcons';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
export const algolia_client = algoliasearch(ALGOLIA_APP_ID || '', ALGOLIA_SEARCH_API_KEY || '');

export const allowedNetwork = ['KUSAMA', 'POLKADOT', 'POLKADEX', 'CERE', 'MOONBEAM', 'MOONRIVER', 'MOONBASE'];

const AUTOCOMPLETE_INDEX_LIMIT = 5;

interface IAutocompleteResults {
	posts: { [index: string]: any }[];
	users: { [index: string]: any }[];
}

const initAutocompleteResults: IAutocompleteResults = {
	posts: [],
	users: []
};

interface Props {
	className?: string;
	openModal: boolean;
	setOpenModal: (pre: boolean) => void;
	isSuperSearch: boolean;
	setIsSuperSearch: (pre: boolean) => void;
	theme?: string;
}

export enum EFilterBy {
	Referenda = 'on-chain-posts',
	People = 'people',
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
	Last_30_days = 'last_30_days',
	Last_3_months = 'last_3_months'
}

const gov1Tracks = ['tips', 'council_motions', 'bounties', 'child_bounties', 'treasury_proposals', 'democracy_proposals', 'tech_committee_proposals', 'referendums'];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NewSearch = ({ className, openModal, setOpenModal, isSuperSearch, setIsSuperSearch, theme }: Props) => {
	const userIndex = algolia_client.initIndex('polkassembly_users');
	const postIndex = algolia_client.initIndex('polkassembly_posts');
	const addressIndex = algolia_client?.initIndex('polkassembly_addresses');

	const { network } = useNetworkSelector();
	const [searchInput, setSearchInput] = useState<string>('');
	const [finalSearchInput, setFinalSearchInput] = useState<string>('');
	const [filterBy, setFilterBy] = useState<EFilterBy>(EFilterBy.Referenda);
	const [dateFilter, setDateFilter] = useState<EDateFilter | null>(null);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [selectedOpengovTracks, setSelectedOpengovTracks] = useState<CheckboxValueType[]>([]);
	const [selectedGov1Tracks, setSelectedGov1Tracks] = useState<CheckboxValueType[]>([]);
	const [selectedTopics, setSelectedTopics] = useState<CheckboxValueType[]>([]);
	const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
	const [peopleResults, setPeopleResults] = useState<any[] | null>(null);
	const [onchainPostResults, setOnchainPostResults] = useState<{ data: any[]; total: number } | null>(null);
	const [offchainPostResults, setOffchainPostResults] = useState<{ data: any[]; total: number } | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const topicOptions: string[] = [];
	const [peoplePage, setPeoplePage] = useState({ page: 1, totalPeople: 0 });
	const [postsPage, setPostsPage] = useState(1);
	const [openFilter, setOpenFilter] = useState<{ date: boolean; topic: boolean; track: boolean }>({ date: false, topic: false, track: false });
	const [searchInputErr, setSearchInputErr] = useState({ clicked: false, err: false });
	const [autoCompleteResults, setAutoCompleteResults] = useState<IAutocompleteResults>(initAutocompleteResults);
	const [isFilter, setIsFilter] = useState<boolean>(false);
	const [justStart, setJustStart] = useState<boolean>(true);

	Object.keys(post_topic).map((topic) => topicOptions.push(topicToOptionText(topic)));

	const openGovTracks: { name: string; trackId: number }[] = [];

	if (networkTrackInfo?.[network]) {
		Object.entries(networkTrackInfo?.[network]).forEach(([key, value]) => {
			if (!value.fellowshipOrigin) {
				openGovTracks.push({ name: key === 'root' ? 'Root' : value?.name, trackId: value?.trackId });
			}
		});
	}

	const getFacetFileters = (filterBy?: EFilterBy) => {
		const postTypeFilter = [];

		if (filterBy === EFilterBy.Referenda) {
			postTypeFilter.push([`post_type:-${ProposalType.DISCUSSIONS}`], [`post_type:-${ProposalType.GRANTS}`]);
			if (selectedGov1Tracks.length > 0) {
				postTypeFilter.push(...selectedGov1Tracks.map((track) => [`post_type:${track}`]));
			}
		} else if (filterBy === EFilterBy.Discussions) {
			postTypeFilter.push([`post_type:${ProposalType.DISCUSSIONS}`, `post_type:${ProposalType.GRANTS}`]);
		}
		const tracksFilter = [
			(isOpenGovSupported(network) || isSuperSearch) && filterBy !== EFilterBy.Discussions ? selectedOpengovTracks.map((trackId) => `track_number:${Number(trackId)}`) : []
		];

		return [
			...postTypeFilter,
			...tracksFilter,
			!isSuperSearch
				? [`network:${network}`]
				: selectedNetworks.length > 0
				? selectedNetworks.map((networkStr) => `network:${networkStr.toLowerCase()}`)
				: allowedNetwork.map((networkStr) => `network:${networkStr.toLowerCase()}`),
			selectedTags.map((tag) => {
				return `tags:${tag}`;
			}),
			selectedTopics.map((topic) => `topic_id:${post_topic[optionTextToTopic(String(topic)) as keyof typeof post_topic]}`)
		];
	};

	const getDateFilter = () => {
		if (!dateFilter) return '';

		const currentDate = dayjs(); // Get the current date

		function getPreviousDate(day: number) {
			return currentDate.subtract(day, 'day').unix();
		}

		switch (dateFilter) {
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
		if (!addressData || !postsData) return;
		const results = postsData?.map((people: any) => {
			let result = people;
			for (const data of addressData) {
				if (Number(data?.objectID) === Number(data?.objectID) && data?.default) {
					result = { ...people, defaultAddress: data?.address || '' };
				}
			}
			return result;
		});
		setPeopleResults(results);
	};

	const getDefaultAddress = async (data: any[]) => {
		if (!addressIndex) return;

		const userIds = data.map((people: any) => `user_id:${Number(people?.objectID)}`);

		addressIndex
			.search('', { facetFilters: userIds, hitsPerPage: LISTING_LIMIT })
			.then(({ hits }) => {
				getpeopleDatawithAddress(hits, data);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const getResultData = async () => {
		if (finalSearchInput.length <= 2 || !userIndex || !postIndex) {
			setLoading(false);
			return;
		}

		setAutoCompleteResults(initAutocompleteResults);
		setLoading(true);

		//onchain data
		await postIndex
			.search(finalSearchInput, { facetFilters: getFacetFileters(EFilterBy.Referenda), filters: getDateFilter(), hitsPerPage: LISTING_LIMIT, page: postsPage - 1 })
			.then(({ hits, nbHits }) => {
				setOnchainPostResults({ data: hits, total: nbHits });
			})
			.catch((error) => {
				console.log(error);
				setLoading(false);
			});

		//ofchain data
		await postIndex
			.search(finalSearchInput, { facetFilters: getFacetFileters(EFilterBy.Discussions), filters: getDateFilter(), hitsPerPage: LISTING_LIMIT, page: postsPage - 1 })
			.then(({ hits, nbHits }) => {
				setOffchainPostResults({ data: hits, total: nbHits });
			})
			.catch((error) => {
				console.log(error);
				setLoading(false);
			});

		//people data
		await userIndex
			.search(finalSearchInput, { hitsPerPage: LISTING_LIMIT, page: peoplePage.page - 1 })
			.then(({ hits, nbHits }) => {
				setPeoplePage({ ...peoplePage, totalPeople: nbHits });
				setPeopleResults(hits);
				getDefaultAddress(hits);
			})
			.catch((error) => {
				console.log(error);
				setLoading(false);
			});

		setLoading(false);
	};

	useEffect(() => {
		Boolean(dateFilter) ||
		selectedGov1Tracks.length > 0 ||
		(filterBy === EFilterBy.Discussions ? false : selectedOpengovTracks.length > 0) ||
		selectedTags.length > 0 ||
		selectedTopics.length > 0 ||
		(isSuperSearch ? selectedNetworks.length > 0 : false)
			? setIsFilter(true)
			: setIsFilter(false);
		if (finalSearchInput.length > 2 && !searchInputErr.err) {
			setLoading(true);
			getResultData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		finalSearchInput,
		selectedTags,
		selectedTopics,
		peoplePage.page,
		postsPage,
		isSuperSearch,
		selectedNetworks,
		selectedGov1Tracks,
		selectedOpengovTracks,
		dateFilter,
		searchInputErr.err
	]);

	const handleClearFilters = (close?: boolean) => {
		setIsFilter(false);
		close && setSearchInput('');
		close && setFinalSearchInput('');
		setSearchInputErr({ clicked: false, err: false });
		setOnchainPostResults(null);
		setOffchainPostResults(null);
		setPeopleResults([]);
		setFilterBy(EFilterBy.Referenda);
		setSelectedNetworks([]);
		setSelectedTags([]);
		setSelectedTopics([]);
		setSelectedOpengovTracks([]);
		setSelectedGov1Tracks([]);
		dateFilter && setDateFilter(null);
		close && setIsSuperSearch(false);
		close && setOpenModal(false);
		close && setJustStart(true);
		close && setAutoCompleteResults({ posts: [], users: [] });
	};

	const getAutoCompleteData = async (queryStr: string) => {
		if (!queryStr) {
			setAutoCompleteResults({ posts: [], users: [] });
			return;
		}

		const postResults = await postIndex
			.search(queryStr, {
				facetFilters: getFacetFileters(filterBy),
				hitsPerPage: AUTOCOMPLETE_INDEX_LIMIT,
				highlightPreTag: '<mark>',
				highlightPostTag: '</mark>',
				page: 0,
				restrictSearchableAttributes: ['title', 'parsed_content']
			})
			.catch((error) => console.log('Posts autocomplete fetch error: ', error));

		const userResults = await userIndex
			.search(queryStr, {
				hitsPerPage: AUTOCOMPLETE_INDEX_LIMIT,
				page: 0,
				highlightPreTag: '<mark>',
				highlightPostTag: '</mark>',
				restrictSearchableAttributes: ['username', 'profile.bio', 'profile.title']
			})
			.catch((error) => console.log('Users autocomplete fetch error: ', error));

		setAutoCompleteResults({ posts: postResults?.hits || [], users: userResults?.hits || [] });
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedAutoCompleteFn = useCallback(_.debounce(getAutoCompleteData, 500), []);

	const handleSearchOnChange = async (queryStr: string) => {
		setSearchInput(queryStr);
		setSearchInputErr({ ...searchInputErr, clicked: false });

		if (autoCompleteResults.posts.length || autoCompleteResults.users.length) {
			setAutoCompleteResults(initAutocompleteResults);
		} else {
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

	const getCleanString = (str: string) => {
		return str.replace(/<[^>]+>|\n|<br\s*\/?>|[*_~`]|(?:^|\s)#\S+|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)/g, '');
	};

	const getAutocompleteMarkedText = (highlightResult: { [index: string]: any }) => {
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
		if (loading) return;
		setJustStart(false);
		setAutoCompleteResults(initAutocompleteResults);
		if (searchInput?.trim().length > 2) {
			setFinalSearchInput(searchInput?.trim());
			setSearchInputErr({ err: false, clicked: true });
		} else if (searchInput?.trim().length <= 2) {
			setOnchainPostResults(null);
			setOffchainPostResults(null);
			setPeopleResults([]);
			setSearchInputErr({ err: true, clicked: true });
		}
		setPeoplePage({ page: 1, totalPeople: 0 });
		setPostsPage(1);
	};

	const sortedAutoCompleteResults = useMemo(() => {
		return autoCompleteResults.posts.concat(autoCompleteResults.users).sort((a, b) => {
			const aMatchedWordsLength = getMatchedWordsLength(a);
			const bMatchedWordsLength = getMatchedWordsLength(b);
			return aMatchedWordsLength - bMatchedWordsLength;
		});
	}, [autoCompleteResults]);

	const dedupedSortedAutoCompleteResults = useMemo(() => {
		const dedupedResults = [];

		for (const [index, item] of sortedAutoCompleteResults.entries()) {
			if (index === 0) continue;

			// string that we need to check duplicates for
			const str = getAutocompleteMarkedText(item._highlightResult) || 'No title';

			// loop till index and check if there is any duplicate for str if there is then continue
			let isDuplicate = false;
			for (const result of sortedAutoCompleteResults.slice(0, index)) {
				const resultStr = getAutocompleteMarkedText(result._highlightResult) || 'No title';
				if (resultStr === str) {
					isDuplicate = true;
					break;
				}
			}

			if (!isDuplicate) {
				dedupedResults.push(item);
			}
		}

		return dedupedResults;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sortedAutoCompleteResults]);

	return (
		<Modal
			wrapClassName='dark:bg-modalOverlayDark'
			title={
				<label className={'search flex flex-wrap gap-1 text-xl font-semibold text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high'}>
					{isSuperSearch ? (
						<span
							className='flex cursor-pointer items-center'
							onClick={() => {
								setIsSuperSearch(false);
								setPostsPage(1);
								setPeoplePage({ page: 1, totalPeople: 0 });
							}}
						>
							<span className='supersearch'>
								<LeftArrow className='mr-2' />
							</span>{' '}
							{'Super Search'}{' '}
						</span>
					) : (
						'Search'
					)}
					{finalSearchInput.length > 0 && ` Results for "${finalSearchInput}"`}
				</label>
			}
			open={openModal}
			onCancel={() => handleClearFilters(true)}
			footer={false}
			className={`${className} w-[850px] max-md:w-full ${poppins.className} ${poppins.variable} dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<div className={`${className} ${isSuperSearch && !loading && 'pb-2'}`}>
				<Input
					className='placeholderColor mt-2 h-[40px] rounded-[4px] border-pink_primary text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high dark:focus:border-[#91054F]'
					type='search'
					value={searchInput}
					onChange={(e) => handleSearchOnChange(e.target.value)}
					allowClear={{ clearIcon: <InputClearIcon /> }}
					placeholder='Type here to search for something'
					onPressEnter={handleSearchSubmit}
					addonAfter={
						<div
							onClick={handleSearchSubmit}
							className={`text-[18px] tracking-[0.02em] text-white  ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
						>
							<SearchOutlined />
						</div>
					}
				/>

				{/* Autocomplete results */}
				{(autoCompleteResults.posts.length > 0 || autoCompleteResults.users.length > 0) && !searchInputErr?.err && !searchInputErr.clicked && (
					<section className='absolute z-50 w-[94.3%] rounded-b-[4px] border-[1px] border-solid border-gray-200 bg-white dark:bg-section-dark-overlay max-md:w-[85.7%]'>
						{/* Posts List */}
						<List
							size='small'
							dataSource={dedupedSortedAutoCompleteResults}
							className='listing'
							renderItem={(item) => {
								const isPost = 'post_type' in item;
								const str = getAutocompleteMarkedText(item._highlightResult) || 'No title';
								const cleanStr = getCleanString(str);

								return (
									<List.Item
										className='flex flex-wrap justify-start whitespace-nowrap hover:cursor-pointer hover:bg-[#FEF2F8] dark:bg-[#33071E] '
										onClick={() => {
											setFilterBy(!isPost ? EFilterBy.People : item.post_type === 'discussions' ? EFilterBy.Discussions : EFilterBy.Referenda);
											handleSearchOnChange(cleanStr.endsWith('...') ? cleanStr.slice(0, -3) : cleanStr);
											setFinalSearchInput(cleanStr.endsWith('...') ? cleanStr.slice(0, -3) : cleanStr);
										}}
									>
										<Markdown
											className='flex flex-wrap hover:text-pink_primary max-md:truncate'
											md={str}
											isAutoComplete
										/>
										<span className='mx-2 text-[9px] text-gray-400'>&#9679;</span>
										<span className='text-xs text-gray-500'>{isPost ? 'in Posts' : 'in People'}</span>
									</List.Item>
								);
							}}
						/>
					</section>
				)}
				<div className={`radio-btn mt-[18px] flex justify-between max-md:flex-col max-md:gap-2 ${isSuperSearch && 'max-lg:flex-col max-lg:gap-2'}`}>
					<Radio.Group
						disabled={finalSearchInput.length === 0 && justStart}
						onChange={(e: RadioChangeEvent) => {
							setFilterBy(e.target.value);
							setPostsPage(1);
							setPeoplePage({ ...peoplePage, page: 1 });
						}}
						value={filterBy}
						className={`flex gap-[1px] ${poppins.variable} ${poppins.className} max-sm:flex-wrap`}
					>
						<Radio
							value={finalSearchInput.length > 0 && EFilterBy.Referenda}
							className={`rounded-[24px] py-1.5 text-xs font-medium ${
								filterBy === EFilterBy.Referenda && finalSearchInput.length > 0 ? 'bg-[#FEF2F8] text-bodyBlue dark:bg-[#33071E] dark:text-blue-dark-high md:px-2' : 'text-[#667589]'
							} ${finalSearchInput.length === 0 && 'text-[#B5BFCC]'} max-sm:text-[10px]`}
						>
							Referenda {finalSearchInput.length > 0 && `(${onchainPostResults?.total || 0})`}
						</Radio>
						<Radio
							value={EFilterBy.People}
							className={`rounded-[24px] py-1.5 text-xs font-medium ${
								filterBy === EFilterBy.People && finalSearchInput.length > 0 ? 'bg-[#FEF2F8] text-bodyBlue dark:bg-[#33071E] dark:text-blue-dark-high md:px-2' : 'text-[#667589]'
							} ${finalSearchInput.length === 0 && 'text-[#B5BFCC]'} max-sm:text-[10px]`}
						>
							People {finalSearchInput.length > 0 && `(${peoplePage.totalPeople || 0})`}
						</Radio>
						<Radio
							value={EFilterBy.Discussions}
							className={`rounded-[24px] py-1.5 text-xs font-medium ${
								filterBy === EFilterBy.Discussions && finalSearchInput.length > 0
									? 'bg-[#FEF2F8] text-bodyBlue dark:bg-[#33071E] dark:text-blue-dark-high md:px-2'
									: 'text-[#667589]'
							} ${finalSearchInput.length === 0 && 'text-[#B5BFCC]'} max-sm:text-[10px]`}
						>
							Discussions {finalSearchInput.length > 0 && `(${offchainPostResults?.total || 0})`}
						</Radio>
					</Radio.Group>
					{(filterBy === EFilterBy.Referenda || filterBy === EFilterBy.Discussions) && (
						<div className='flex gap-3.5 text-xs font-medium tracking-[0.02em] text-[#667589] max-md:gap-1.5 max-md:px-0'>
							{isSuperSearch && (
								<NetworkDropdown
									setSidedrawer={() => {}}
									isSmallScreen={true}
									isSearch={true}
									setSelectedNetworks={setSelectedNetworks}
									selectedNetworks={selectedNetworks}
									allowedNetwork={allowedNetwork}
								/>
							)}

							<Popover
								zIndex={1055}
								open={openFilter.date}
								onOpenChange={() => finalSearchInput.length > 0 && setOpenFilter({ ...openFilter, date: !openFilter.date })}
								content={
									<div className='flex flex-col gap-1'>
										<Radio.Group
											size='large'
											onChange={(e: RadioChangeEvent) => setDateFilter(e.target.value)}
											value={dateFilter}
											className={`flex flex-col gap-[1px] ${poppins.variable} ${poppins.className}`}
										>
											<Radio
												value={EDateFilter.Today}
												className={`py-1.5 text-xs font-normal ${dateFilter === EDateFilter.Today ? 'text-bodyBlue dark:text-blue-dark-high' : 'text-[#667589]'}`}
											>
												Today
											</Radio>
											<Radio
												value={EDateFilter.Last_7_days}
												className={`py-1.5 text-xs font-normal ${dateFilter === EDateFilter.Last_7_days ? 'text-bodyBlue dark:text-blue-dark-high' : 'text-[#667589]'}`}
											>
												Last 7 days
											</Radio>
											<Radio
												value={EDateFilter.Last_30_days}
												className={`py-1.5 text-xs font-normal ${dateFilter === EDateFilter.Last_30_days ? 'text-bodyBlue dark:text-blue-dark-high' : 'text-[#667589]'}`}
											>
												Last 30 days
											</Radio>
											<Radio
												value={EDateFilter.Last_3_months}
												className={`py-1.5 text-xs font-normal ${dateFilter === EDateFilter.Last_3_months ? 'text-bodyBlue dark:text-blue-dark-high' : 'text-[#667589]'}`}
											>
												Last 3 months
											</Radio>
											<Radio
												value={null}
												className={`py-1.5 text-xs font-normal ${!dateFilter ? 'text-bodyBlue dark:text-blue-dark-high' : 'text-[#667589]'}`}
											>
												All time
											</Radio>
										</Radio.Group>
									</div>
								}
								placement='bottomLeft'
							>
								<div
									className={`flex items-center justify-center text-xs ${openFilter.date && 'text-pink_primary'} ${
										finalSearchInput.length === 0 ? 'cursor-not-allowed text-[#B5BFCC]' : 'cursor-pointer'
									} max-sm:text-[10px]`}
								>
									Date
									<span className='text-[#96A4B6]'>
										{openFilter.date ? <HighlightDownOutlined className='max-md-ml-1 ml-2.5 mt-1' /> : <DownOutlined className='max-md-ml-1 ml-2.5 mt-1' />}
									</span>
								</div>
							</Popover>

							<FilterByTags
								clearTags={!isFilter}
								isSearch={true}
								setSelectedTags={setSelectedTags}
								disabled={finalSearchInput.length === 0}
							/>

							{filterBy === EFilterBy.Referenda && (
								<Popover
									zIndex={1055}
									rootClassName='track-popover'
									open={openFilter.track}
									onOpenChange={() => finalSearchInput.length > 0 && setOpenFilter({ ...openFilter, track: !openFilter.track })}
									content={
										<Collapse
											collapsible='header'
											className={`${poppins.className} ${poppins.variable} cursor-pointer`}
										>
											<Collapse.Panel
												key={1}
												header='Gov1'
												className='cursor-pointer'
											>
												<Checkbox.Group
													className={`checkboxStyle flex max-h-[200px] flex-col justify-start overflow-y-scroll tracking-[0.01em] ${poppins.className} ${poppins.variable}`}
													onChange={(list) => setSelectedGov1Tracks(list)}
													value={selectedGov1Tracks}
												>
													{gov1Tracks &&
														gov1Tracks?.map((track) => (
															<Checkbox
																key={track}
																value={track}
																className={`ml-0 py-1.5 text-xs font-normal ${selectedGov1Tracks.includes(track) ? 'text-bodyBlue dark:text-blue-dark-high' : 'text-[#667589]'}`}
															>
																<div className='mt-[2px] capitalize'>{track?.split('_')?.join(' ')}</div>
															</Checkbox>
														))}
												</Checkbox.Group>
											</Collapse.Panel>
											{isOpenGovSupported(network) && (
												<Collapse.Panel
													key={2}
													header='OpenGov'
													className='cursor-pointer'
												>
													<Checkbox.Group
														className={`checkboxStyle flex max-h-[200px] flex-col justify-start overflow-y-scroll tracking-[0.01em] ${poppins.className} ${poppins.variable}`}
														onChange={(list) => setSelectedOpengovTracks(list)}
														value={selectedOpengovTracks}
													>
														{openGovTracks &&
															openGovTracks?.map((track) => (
																<Checkbox
																	key={track?.name}
																	value={track?.trackId}
																	className={`ml-0 py-1.5 text-xs font-normal ${
																		selectedOpengovTracks.includes(track?.name) ? 'text-bodyBlue dark:text-blue-dark-high' : 'text-[#667589]'
																	}`}
																>
																	<div className='mt-[2px] capitalize'>{track?.name?.split('_')?.join(' ')}</div>
																</Checkbox>
															))}
													</Checkbox.Group>
												</Collapse.Panel>
											)}
										</Collapse>
									}
									placement='bottomLeft'
								>
									<div
										className={`flex items-center justify-center text-xs ${openFilter.track && 'text-pink_primary'} ${
											finalSearchInput.length === 0 ? 'cursor-not-allowed text-[#B5BFCC]' : 'cursor-pointer'
										} max-sm:text-[10px]`}
									>
										Tracks
										<span className='text-[#96A4B6]'>
											{openFilter.track ? <HighlightDownOutlined className='max-md-ml-1 ml-2.5 mt-1' /> : <DownOutlined className='max-md-ml-1 ml-2.5 mt-1' />}
										</span>
									</div>
								</Popover>
							)}

							<Popover
								zIndex={1055}
								open={openFilter.topic}
								onOpenChange={() => finalSearchInput.length > 0 && setOpenFilter({ ...openFilter, topic: !openFilter.topic })}
								content={
									<Checkbox.Group
										className={`checkboxStyle flex flex-col justify-start tracking-[0.01em] ${poppins.className} ${poppins.variable}`}
										onChange={(list) => setSelectedTopics(list)}
										value={selectedTopics}
									>
										{topicOptions &&
											topicOptions?.map((topic) => (
												<Checkbox
													key={topic}
													value={topic}
													className={`ml-0 py-1.5 text-xs font-normal ${selectedTopics.includes(topic) ? 'text-bodyBlue dark:text-blue-dark-high' : 'text-[#667589]'}`}
												>
													<div className='mt-[2px]'>{topic}</div>
												</Checkbox>
											))}
									</Checkbox.Group>
								}
								placement='bottomLeft'
							>
								<div
									className={`flex items-center justify-center text-xs ${openFilter.topic && 'text-pink_primary'} ${
										finalSearchInput.length === 0 ? 'cursor-not-allowed text-[#B5BFCC]' : 'cursor-pointer'
									} max-sm:text-[10px]`}
								>
									Topic
									<span className='text-[#96A4B6]'>
										{openFilter.topic ? <HighlightDownOutlined className='max-md-ml-1 ml-2.5 mt-1' /> : <DownOutlined className='max-md-ml-1 ml-2.5 mt-1' />}
									</span>
								</div>
							</Popover>
						</div>
					)}
				</div>

				{filterBy !== EFilterBy.People && isFilter && (
					<div className='mt-3 flex flex-wrap justify-between text-xs font-medium text-bodyBlue dark:text-blue-dark-high max-xs:flex-wrap'>
						<div className='flex gap-1 max-sm:mb-2 max-sm:flex-wrap'>
							{isSuperSearch && selectedNetworks.length > 0 && (
								<div className='flex gap-1 rounded-[4px] bg-[#FEF2F8] px-2 py-1 dark:bg-[#33071E]'>
									<span className='text-pink_primary'>Network:</span>
									<span>
										{selectedNetworks?.map((network, index) => (
											<span key={index}>
												{network[0] + network.slice(1).toLowerCase()}
												{index !== selectedNetworks.length - 1 && ', '}
											</span>
										))}
									</span>
								</div>
							)}
							{dateFilter && (
								<div className='flex gap-1 rounded-[4px] bg-[#FEF2F8] px-2 py-1 font-medium dark:bg-[#33071E]'>
									<span className='text-pink_primary'>Date:</span>
									<span className='capitalize'>{dateFilter?.split('_')?.join(' ')}</span>
								</div>
							)}
							{selectedTags.length > 0 && (
								<div className='flex gap-1 rounded-[4px] bg-[#FEF2F8] px-2 py-1 dark:bg-[#33071E]'>
									<span className='text-pink_primary'>Tags:</span>
									<span className='capitalize'>{selectedTags?.join(', ')}</span>
								</div>
							)}
							{(selectedOpengovTracks.length > 0 || selectedGov1Tracks.length > 0) && filterBy !== EFilterBy.Discussions && (
								<div className='flex gap-1 rounded-[4px] bg-[#FEF2F8] px-2 py-1 dark:bg-[#33071E]'>
									<span className='text-pink_primary'>Tracks:</span>
									<span className='flex flex-wrap'>
										{selectedOpengovTracks?.map((trackId, index) => (
											<span
												key={index}
												className='capitalize'
											>
												{getTrackNameFromId(network, Number(trackId))?.split('_')?.join(' ')}
												{index !== selectedOpengovTracks.length - 1 && ', '}{' '}
											</span>
										))}
										{selectedGov1Tracks.map((track, index) => (
											<span
												key={index}
												className='flex flex-shrink-0 capitalize'
											>
												{' '}
												{selectedOpengovTracks.length > 0 && ', '}
												{(track as string)?.split('_')?.join(' ')}
												{index !== selectedGov1Tracks.length - 1 && ', '}{' '}
											</span>
										))}
									</span>
								</div>
							)}
							{selectedTopics.length > 0 && (
								<div className='flex gap-1 rounded-[4px] bg-[#FEF2F8] px-2 py-1 dark:bg-[#33071E]'>
									<span className='text-pink_primary'>Topics:</span>
									<span className='flex flex-wrap'>
										{selectedTopics.map((topic, index) => (
											<span
												key={index}
												className='flex flex-shrink-0 capitalize'
											>
												{' '}
												{topic}
												{selectedTopics.length - 1 !== index && ', '}
											</span>
										))}
									</span>
								</div>
							)}
						</div>
						{finalSearchInput.length > 0 && (
							<span
								className={`${
									!isFilter ? 'cursor-default text-[#667589]' : 'cursor-pointer text-pink_primary'
								} flex items-center max-sm:border-[1px] max-sm:border-solid max-sm:border-pink_primary max-sm:p-1`}
								onClick={() => handleClearFilters()}
							>
								Clear All Filters
							</span>
						)}
					</div>
				)}
				{(finalSearchInput.length > 2 || searchInputErr.err) && (
					<div className={`${loading && 'hidden'} z-10`}>
						{(filterBy === EFilterBy.Referenda || filterBy === EFilterBy.Discussions) && !searchInputErr.err && (onchainPostResults || offchainPostResults) && (
							<ResultPosts
								setOpenModal={setOpenModal}
								isSuperSearch={isSuperSearch}
								postsData={filterBy === EFilterBy.Referenda ? onchainPostResults?.data || [] : offchainPostResults?.data || []}
								totalPage={filterBy === EFilterBy.Discussions ? offchainPostResults?.total || 0 : onchainPostResults?.total || 0}
								className='mt-3'
								postsPage={postsPage}
								setPostsPage={setPostsPage}
							/>
						)}

						{filterBy === EFilterBy.People && !searchInputErr.err && peopleResults && (
							<ResultPeople
								searchInput={finalSearchInput}
								setOpenModal={setOpenModal}
								peopleData={peopleResults}
								peoplePage={peoplePage}
								setPeoplePage={setPeoplePage}
							/>
						)}

						{!loading && (searchInputErr.err || onchainPostResults || offchainPostResults || peopleResults) && (
							<SearchErrorsCard
								isSearchErr={searchInput?.trim().length <= 2 && searchInputErr.clicked ? true : searchInputErr?.err}
								filterBy={filterBy}
								setFilterBy={setFilterBy}
								setOpenModal={setOpenModal}
								setIsSuperSearch={setIsSuperSearch}
								setPeoplePage={setPeoplePage}
								setPostsPage={setPostsPage}
								postResultsCounts={filterBy === EFilterBy.Discussions ? offchainPostResults?.total || 0 : onchainPostResults?.total || 0}
								peopleResultsCounts={peoplePage.totalPeople || 0}
								isSuperSearch={isSuperSearch}
							/>
						)}
					</div>
				)}

				<div className={`flex flex-col items-center justify-center gap-4 pb-8 pt-10 ${!loading && 'hidden'}`}>
					<Image
						src={SearchLoader}
						alt=''
						height={150}
						width={150}
					/>
					<span className='text-center text-sm font-medium tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high'>
						{isSuperSearch ? 'Looking for results across the Polkassembly Universe.' : 'Looking for results.'}
					</span>
				</div>

				{finalSearchInput.length === 0 && justStart && (
					<div className='flex h-[360px] flex-col items-center justify-center text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
						<StartSearchIcon />
						<span className='mt-8 text-center tracking-[0.01em]'>Welcome to the all new & supercharged search!</span>
						<div className='mt-2 flex items-center gap-1 text-xs font-medium tracking-[0.01em]'>
							powered by
							<PaLogo className='h-[30px] w-[99px]' />
						</div>
					</div>
				)}
			</div>
		</Modal>
	);
};

export default styled(NewSearch)`
	.placeholderColor .ant-input-group-addon {
		background: var(--pink_primary);
		color: white !important;
		font-size: 12px;
		border: 1px solid var(--pink_primary);
	}
	.ant-modal-close {
		margin-top: 6px;
	}
	.checkboxStyle .ant-checkbox-wrapper + .ant-checkbox-wrapper {
		margin-inline-start: 0px !important;
	}
	.ant-input-affix-wrapper {
		border-width: 1px !important;
		border-radius: 4px 0px 0px 4px !important;
		border: 1px solid var(--pink_primary);
		height: 38px !important;
		color: red !important;
		background: ${(props) => (props.theme == 'dark' ? '#0D0D0D' : 'white')} !important;
	}
	.ant-input {
		background: ${(props) => (props.theme == 'dark' ? '#0D0D0D' : 'white')} !important;
		color: ${(props) => (props.theme == 'dark' ? 'white' : '#7788a0')} !important;
	}
	input::placeholder {
		font-weight: 400 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
		color: ${(props) => (props.theme == 'dark' ? 'white' : '#7788a0')} !important;
	}
	.listing .ant-spin-nested-loading .ant-spin-container .ant-list-items .ant-list-item {
		padding: 0px 18px !important;
	}
	.track-popover .ant-popover-content .ant-popover-inner {
		padding: 0px !important;
		border-radius: 4px !important;
	}
	.track-popover .ant-popover-content .ant-popover-inner .ant-collapse {
		padding: 0px !important;
		border-radius: 4px !important;
		border: none !important;
		cursor: pointer !important;
	}
	.supersearch:hover {
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	}
`;
