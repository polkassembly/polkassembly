// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import { useCommunityTabSelector, useNetworkSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { User } from '~src/auth/types';
import { UsersResponse } from 'pages/api/v1/auth/data/getAllUsers';
import MemberInfoCard from './MemberInfoCard';
import { Pagination } from '~src/ui-components/Pagination';
import Image from 'next/image';
import { Spin } from 'antd';
import { defaultIdentityInfo } from '../../utils';

const MembersTab = () => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { searchedUserName } = useCommunityTabSelector();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const [userData, setUserData] = useState<User[]>();
	const [loading, setLoading] = useState<boolean>(false);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalUsers, setTotalUsers] = useState<number>(0);

	const handleBeneficiaryIdentityInfo = async (user: User) => {
		if (!api || !apiReady || !user?.addresses?.length) return;

		const promiseArr = user?.addresses?.map((address) => getIdentityInformation({ address, api: peopleChainApi ?? api, network }));

		try {
			const resolved = await Promise?.all(promiseArr);
			user.identityInfo = resolved[0] || defaultIdentityInfo;
		} catch (err) {
			console?.error('Error fetching identity info:', err);
			user.identityInfo = defaultIdentityInfo;
		}
	};

	const getData = async () => {
		if (!(api && peopleChainApiReady) || !network) return;
		setLoading(true);
		let body = {};
		if (searchedUserName) {
			body = {
				username: searchedUserName
			};
		} else {
			body = {
				page: currentPage || 1
			};
		}

		const { data, error } = await nextApiClientFetch<UsersResponse>('api/v1/auth/data/getAllUsers', body);
		if (data) {
			console?.log(data);
			const updatedUserData = [...data.data];
			for (const user of updatedUserData) {
				await handleBeneficiaryIdentityInfo(user);
			}
			console?.log(updatedUserData);
			setUserData(updatedUserData);
			setTotalUsers(data?.count);
			setLoading(false);
		} else {
			console?.log(error);
			setLoading(false);
		}
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
							src='/assets/Gifs/search?.gif'
							alt='empty-state'
							width={150}
							height={150}
						/>
						<p>No User Found</p>
					</div>
				) : (
					<>
						<div className='mt-3 grid grid-cols-2 items-end gap-6 max-lg:grid-cols-1 sm:mt-6'>
							{userData?.map((user: User, index: number) => (
								<MemberInfoCard
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

export default MembersTab;
