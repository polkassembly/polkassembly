// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import { useCommunityTabSelector, useNetworkSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ExpertsInfoTab from './ExpertsInfoTab';
import { Pagination } from '~src/ui-components/Pagination';
import Image from 'next/image';
import { Spin } from 'antd';
import { ExpertRequestResponse } from 'pages/api/v1/auth/data/getAllExperts';
import { FollowersResponse } from 'pages/api/v1/fetch-follows/followersAndFollowingInfo';

const ExpertsTab = () => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { searchedUserName } = useCommunityTabSelector();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const [userData, setUserData] = useState<any[]>();
	const [loading, setLoading] = useState<boolean>(false);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalUsers, setTotalUsers] = useState<number>(0);

	const getData = async () => {
		if (!(api && peopleChainApiReady) || !network) return;
		setLoading(true);
		let body = {};
		if (searchedUserName) {
			body = {
				username: searchedUserName
			};
		}
	
		const { data, error } = await nextApiClientFetch<ExpertRequestResponse>('api/v1/auth/data/getAllExperts', body);
		if (data) {
			const usersWithFollowers = await Promise.all(
				data.data.map(async (user) => {
					const followersData = await getFollowersData(user.userId);
					console.log('userdata in experts1', followersData);
					return { ...user, followers: followersData?.followers || 0, followings: followersData?.followings || 0 };
				})
			);
			setUserData(usersWithFollowers);
			setTotalUsers(data.count);
		} else {
			console?.log(error);
		}
		setLoading(false);
	};
	
	const getFollowersData = async (userId: number) => {
		const { data, error } = await nextApiClientFetch<FollowersResponse>('api/v1/fetch-follows/followersAndFollowingInfo', { userId });
		if (!data && error) {
			console?.log(error);
			return null;
		}
		return {followers: data?.followers?.length, followings: data?.following?.length};
	};
	
	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, peopleChainApi, peopleChainApiReady, apiReady, network, currentPage, searchedUserName]);
	return (
		<Spin spinning={loading}>
			<div className='min-h-[250px]'>
				{!userData?.length && !loading ? (
					<div className='mt-4 flex flex-col items-center justify-center gap-4'>
						<Image
							src='/assets/Gifs/search.gif'
							alt='empty-state'
							width={350}
							height={350}
						/>
						<p className='m-0 -mt-[48px] p-0 text-bodyBlue dark:text-white'>No User Found</p>
					</div>
				) : (
					<>
						<div className='mt-3 grid grid-cols-2 items-end gap-6 max-lg:grid-cols-1 sm:mt-6'>
							{userData?.map((user: any, index: number) => (
								<ExpertsInfoTab
									user={user}
									key={index}
								/>
							))}
						</div>
						<div className='mt-6 flex justify-end'>
							<Pagination
								size='large'
								current={currentPage}
								onChange={(page: number) => setCurrentPage(page)}
								total={totalUsers}
								pageSize={10}
								showSizeChanger={false}
								hideOnSinglePage={true}
							/>
						</div>
					</>
				)}
			</div>
		</Spin>
	);
};

export default ExpertsTab;
