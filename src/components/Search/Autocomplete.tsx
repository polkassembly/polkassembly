// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import algoliasearch from 'algoliasearch/lite';
import { createAutocomplete } from '@algolia/autocomplete-core';
import { getAlgoliaResults } from '@algolia/autocomplete-preset-algolia';
import { useMemo, useState } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Post } from '~src/types';
import Markdown from '~src/ui-components/Markdown';
import _ from 'lodash';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;

const searchClient = algoliasearch(
	ALGOLIA_APP_ID || '',
	ALGOLIA_SEARCH_API_KEY || ''
);
interface IHightlighted{
  fullyHighlighted: boolean;
matchLevel: 'none' | 'full' | string;
matchedWords: string[];
value: HTMLElement | string | number | Date | any;
}

interface IUser{
  created_at:Date;
  email:string;
  objectId:string;
  profile:{
    badges: string[];
    bio: string;
    image: string;
    title: string
  };
  username: string;
  __autocomplete_indexName: string;
  _highlightResult:{
  created_at: IHightlighted;
  email: IHightlighted;
  objectId: IHightlighted;
  profile:{
    badges: IHightlighted;
    bio: IHightlighted;
    image: IHightlighted;
    title: IHightlighted
  };
  username: IHightlighted;
  }
}

interface IPost extends Post{
__autocomplete_indexName: string;
  _highlightResult:{
   user_id: IHightlighted,
  content: IHightlighted,
  created_at: IHightlighted;
  id: IHightlighted,
  last_edited_at: IHightlighted,
  last_comment_at: IHightlighted,
  title: IHightlighted,
  topic_id: IHightlighted,
  proposer_address: IHightlighted,
  post_link: IHightlighted ,
  username?: IHightlighted;
  gov_type?: IHightlighted
  tags?: IHightlighted
  history?: IHightlighted;

  }
}

function Autocomplete() {
	const [autocompleteState, setAutocompleteState] = useState<any>({});
	const autocomplete = useMemo(
		() => createAutocomplete({
			getSources() {
				return [
					// (3) Use an Algolia index source.
					{
						getItemInputValue({ item }) {
							return item.query as string;
						},
						getItemUrl({ item }) {
							return item.url as string;
						},
						getItems({ query }) {
							return getAlgoliaResults({
								queries: [
									{
										indexName: 'polkassembly_posts',
										params: {
											highlightPostTag: '</mark>',
											highlightPreTag: '<mark>',
											hitsPerPage: 5
										},
										query
									},
									{
										indexName: 'polkassembly_users',
										params: {
											highlightPostTag: '</mark>',
											highlightPreTag: '<mark>',
											hitsPerPage: 5
										},
										query
									}
								],
								searchClient
							});
						},
						sourceId: 'products'

					}
				];
			},
			onStateChange({ state }) {
				// (2) Synchronize the Autocomplete state with the React state.
				setAutocompleteState(state);
			}
		}),
		[]
	);

	const handleResults = (item: IPost | IUser | any ) => {
		if(item?.__autocomplete_indexName === 'polkassembly_users'){
			if(item._highlightResult?.username?.matchLevel !== 'none') return item._highlightResult?.username.value ;
			// if(item._highlightResult?.email.matchLevel !== 'none') return item._highlightResult?.email.value;
			if(item._highlightResult?.profile?.bio?.matchLevel !== 'none') return item._highlightResult?.profile?.bio?.value;
			if(item._highlightResult?.profile?.title?.matchLevel !== 'none') return item._highlightResult?.profile?.title?.value;
			if(item._highlightResult?.profile?.image?.matchLevel !== 'none') return item._highlightResult?.profile?.image.value;
			if(item._highlightResult?.created_at?.matchLevel !== 'none') return item._highlightResult?.created_at.value;
		}
		else{
			if(item?._highlightResult?.title?.matchLevel ! == 'none') return item?._highlightResult?.title?.value;
			if(item?._highlightResult?.content?.matchLevel ! == 'none') return item?._highlightResult?.con?.value;
			if(item?._highlightResult?.tags?.matchLevel ! == 'none') return item?._highlightResult?.tags?.value;
			if(item?._highlightResult?.gov_type?.matchLevel ! == 'none') return item?._highlightResult?.gov_type?.value;
			if(item?._highlightResult?.proposer_address?.matchLevel ! == 'none') return item?._highlightResult?.proposer_address?.value;
			if(item?._highlightResult?.username?.matchLevel ! == 'none') return item?._highlightResult?.username?.value;
			if(item?._highlightResult?.id?.matchLevel ! == 'none') return item?._highlightResult?.id?.value;
		}
	};
	return (<div className="aa-Autocomplete" {...autocomplete.getRootProps({})}>
		<Input className='placeholderColor mt-4 aa-Input text-[#7788A0]' {...autocomplete.getInputProps({} as any) as any}
			placeholder='Type here to search for something' addonAfter= {<SearchOutlined className='text-white text-[18px] tracking-[0.02em]'/>} allowClear/>
		<div className="aa-Panel" {...autocomplete.getPanelProps({} as any) as any}>
			{console.log(autocompleteState?.collections)}
			{autocompleteState?.isOpen && autocompleteState?.collections.map((collection: any, index: number) => {
				const { source, items } = collection;
				return (<div key={`source-${index}`} className="aa-Source border-solid py-1 border-[1px] -mt-1 rounded-b-[4px] border-[#D2D8E0]">
					{items && items?.length && items?.length > 0 && (
						<div className="aa-List flex flex-col gap-1 mt-2 px-1" {...autocomplete.getListProps()}>
							{items?.map((item: IUser | IPost | any  ) => (
								<div key={item.objectID}
									className="aa-Item px-2 text-[#485F7D] text-sm hover:bg-[#FEF2F8] rounded-[4px] cursor-pointer gap-4 flex items-center "
									{...autocomplete.getItemProps({
										item,
										source
									}) as any}>
									<Markdown md={handleResults(item) || 'ka'} isPreview className='flex items-center pt-2 text-sm leading-3 content'/>
									<span className='h-[5px] w-[5px] rounded-full bg-[#90A0B7]'/>
									<span className='text-sm font-normal text-[#90A0B7]'>{item?.__autocomplete_indexName === 'polkassembly_users' ? 'in People': 'in Posts'} </span>
									{/* {item._highlightResult?.created_at?.matchLevel !== 'none' && item._highlightResult?.created_at.value } */}
									{/* {item._highlightResult?.email.matchLevel !== 'none' && item._highlightResult?.email.value  } */}
									{/* {item._highlightResult?.username?.matchLevel !== 'none' && item._highlightResult?.username.value  } */}

								</div>
							))}
						</div>
					)}
				</div>
				);
			})}
		</div>
	</div>
	);
	// ...
}

export default styled(Autocomplete)`
.placeholderColor .ant-input-group-addon{
background: #E5007A;
color: white !important;
font-size:12px;
border: 1px solid #E5007A; 
}
.checkboxStyle .ant-checkbox-wrapper+.ant-checkbox-wrapper{
  margin-inline-start: 0px !important;
}
.content{
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical; 
  width: 250px;
  overflow: hidden;
}
`;