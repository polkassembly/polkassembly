// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { useNetworkSelector } from '~src/redux/selectors';
import PostList from './PostList';
import { fetchVoterProfileImage, fetchUserProfile } from './utils/utils';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import TabNavigation from './TabNavigation';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import Skeleton from '~src/basic-components/Skeleton';

const LatestActivityExplore: React.FC = () => {
	const [currentTab, setCurrentTab] = useState<string | null>('all');
	const [postData, setPostData] = useState<any[]>([]);
	const { network } = useNetworkSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			const { data: responseData } = await nextApiClientFetch<any>(`/api/v1/activity-feed/explore-posts?network=${network}`);

			const posts = Array.isArray(responseData?.data) ? responseData.data : [];
			const detailedPosts = await Promise.all(
				posts.map(async (post: any) => {
					try {
						let firstVoterProfileImg = null;
						if (post?.post_reactions?.['👍']?.usernames?.[0]) {
							const username = post.post_reactions['👍'].usernames[0];
							firstVoterProfileImg = await fetchVoterProfileImage(username);
						}

						const proposerProfile = await fetchUserProfile(post.proposer || '');

						return {
							...post,
							firstVoterProfileImg,
							proposerProfile
						};
					} catch (error) {
						console.error('Error processing post', error);
						return { ...post, error: true };
					}
				})
			);

			setPostData(detailedPosts.filter((post) => !post.error));
		} catch (err) {
			console.error('Failed to fetch posts:', err);
			setError('Failed to fetch posts. Please try again later.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentTab, network]);

	const filteredPosts =
		currentTab === 'all'
			? postData
			: postData.filter((post) => {
					const trackName = Object.keys(networkTrackInfo[network] || {}).find((key) => networkTrackInfo[network][key].trackId === post?.track_no);

					const formattedTrackName = trackName
						?.replace(/([a-z])([A-Z])/g, '$1-$2')
						.replace(/_/g, '-')
						.toLowerCase();

					return formattedTrackName === currentTab;
			  });

	if (error) {
		return (
			<div className='flex items-center justify-center py-4'>
				<div className='text-lg text-red-500'>⚠️ An error occurred: {error}. Please try again later.</div>
			</div>
		);
	}

	return (
		<div className=''>
			{loading ? (
				<div className='flex min-h-[200px] w-full  items-center justify-center rounded-lg bg-white px-5 dark:bg-[#0D0D0D]'>
					<Skeleton active />{' '}
				</div>
			) : (
				<div className=''>
					<TabNavigation
						currentTab={currentTab}
						setCurrentTab={setCurrentTab}
						gov2LatestPosts={postData}
						network={network}
					/>
					<PostList postData={filteredPosts} />
				</div>
			)}
		</div>
	);
};

export default React.memo(LatestActivityExplore);
