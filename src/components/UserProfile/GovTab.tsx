// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Select } from 'antd';
import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { ArrowDownIcon } from '~src/ui-components/CustomIcons';
import PostTab from '../User/PostTab';
import { EGovType } from '~src/global/proposalType';
import VotesHistory from '~src/ui-components/VotesHistory';
import { EProfileHistory, votesHistoryUnavailableNetworks } from 'pages/user/[username]';
import { useNetworkContext } from '~src/context';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { IUserPostsListingResponse } from 'pages/api/v1/listing/user-posts';

export const getLabel = (str: string) => {
	const newStr = str.split('_').join(' ');
	return newStr.charAt(0).toUpperCase() + newStr.slice(1);
};

interface IGovTabProps {
	className?: string;
	userAddresses?: string[];
	posts?: IUserPostsListingResponse;
	historyType?: EProfileHistory;
}

const GovTab: FC<IGovTabProps> = (props) => {
	const { posts, className, userAddresses, historyType: profileHistory } = props;
	const { network } = useNetworkContext();
	const [govType, setGovType] = useState<EGovType>(!votesHistoryUnavailableNetworks.includes(network) ? EGovType.OPEN_GOV : EGovType.GOV1);

	const [selectedPostsType, setSelectedPostsType] = useState('discussions');
	const [selectedPost, setSelectedPost] = useState('posts');

	return (
		<div className={className}>
			<div className='mb-6'>
				{isOpenGovSupported(network) && (profileHistory === EProfileHistory.VOTES || profileHistory === EProfileHistory.POSTS) && (
					<Select
						value={govType}
						style={{
							width: 120
						}}
						onChange={(v) => {
							setGovType(v);
						}}
						options={[
							{
								label: 'Gov1',
								value: 'gov1'
							},
							{
								label: 'OpenGov',
								value: 'open_gov'
							}
						]}
					/>
				)}
			</div>
			{profileHistory === EProfileHistory.POSTS && (
				<>
					<Select
						suffixIcon={<ArrowDownIcon className='text-[#90A0B7]' />}
						value={selectedPostsType}
						className='select'
						onChange={(v) => {
							setSelectedPostsType(v);
							const obj = ((EGovType.GOV1 === govType ? posts?.gov1 : posts?.open_gov) as any)?.[v];
							if (obj && !Array.isArray(obj)) {
								const objKeys = Object.keys(obj);
								if (objKeys && objKeys.length > 0) {
									setSelectedPost(objKeys[0]);
								}
							}
						}}
						options={Object.keys((EGovType.GOV1 === govType ? posts?.gov1 : posts?.open_gov) as any).map((key) => ({
							label: getLabel(key),
							value: key
						}))}
					/>
					<div className='scroll-hidden my-5 flex max-w-full items-center gap-x-2 overflow-x-auto'>
						{((EGovType.GOV1 === govType ? posts?.gov1 : posts?.open_gov) as any)?.[selectedPostsType] &&
							!Array.isArray(((EGovType.GOV1 === govType ? posts?.gov1 : posts?.open_gov) as any)?.[selectedPostsType]) &&
							Object.keys(((EGovType.GOV1 === govType ? posts?.gov1 : posts?.open_gov) as any)?.[selectedPostsType]).map((key) => {
								return (
									<button
										key={key}
										onClick={() => {
											setSelectedPost(key);
										}}
										className={`flex items-center justify-center whitespace-nowrap rounded-[50px] border border-solid px-3 py-1 text-xs font-medium leading-[18px] outline-none ${
											selectedPost === key ? 'border-pink_primary bg-pink_primary text-white' : 'border-[#90A0B7] bg-transparent text-[#90A0B7]'
										}`}
									>
										{getLabel(key)}
									</button>
								);
							})}
					</div>
					<div>
						{((EGovType.GOV1 === govType ? posts?.gov1 : posts?.open_gov) as any)?.[selectedPostsType] && Array.isArray((posts as any)?.[selectedPostsType]) ? (
							<PostTab posts={((EGovType.GOV1 === govType ? posts?.gov1 : posts?.open_gov) as any)?.[selectedPostsType]} />
						) : (
							((EGovType.GOV1 === govType ? posts?.gov1 : posts?.open_gov) as any)?.[selectedPostsType]?.[selectedPost] &&
							Array.isArray(((EGovType.GOV1 === govType ? posts?.gov1 : posts?.open_gov) as any)?.[selectedPostsType]?.[selectedPost]) && (
								<PostTab posts={((EGovType.GOV1 === govType ? posts?.gov1 : posts?.open_gov) as any)?.[selectedPostsType]?.[selectedPost]} />
							)
						)}
					</div>
				</>
			)}
			{profileHistory === EProfileHistory.VOTES && !votesHistoryUnavailableNetworks.includes(network) && (
				<VotesHistory
					govType={govType}
					userAddresses={userAddresses || []}
				/>
			)}
		</div>
	);
};

export default styled(GovTab)`
	.select .ant-select-selector {
		border: none !important;
	}
	.select .ant-select-selection-item {
		font-style: normal !important;
		font-weight: 600 !important;
		font-size: 20px !important;
		line-height: 30px !important;
		letter-spacing: 0.0015em !important;
		color: #334d6e !important;
	}
`;
