// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { useNetworkSelector } from '~src/redux/selectors';
import { LoadingOutlined } from '@ant-design/icons';
import TabNavigation from './TabNavigation';
import PostList from './PostList';
import { fetchVoterProfileImage, fetchUserProfile } from './utils/utils';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IPostData } from './utils/types';

interface LatestActivityExploreProps {
	currentUserdata?: any;
}

const LatestActivityExplore: React.FC<LatestActivityExploreProps> = ({ currentUserdata }) => {
	const [currentTab, setCurrentTab] = useState<string | null>('all');
	const [postData, setPostData] = useState<IPostData[]>([]);
	const { network } = useNetworkSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);

			// Fetch the post details from the API
			const { data: responseData } = await nextApiClientFetch<any>(`/api/v1/activity-feed/explore-posts?network=${network}`);

			// Ensure the response contains an array of posts
			const posts = Array.isArray(responseData?.data) ? responseData.data : [];

			// Process each post in parallel
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

	// useEffect(() => {
	// 	fetchData();
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [currentTab, network]);

	const filteredPosts =
		currentTab === 'all'
			? postData
			: postData.filter((post) => {
					const formattedTrackName = post.trackName
						?.replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase to hyphen-separated
						.replace(/_/g, '-') // Replace underscores with hyphens if any
						.toLowerCase(); // Ensure it's lowercase

					return formattedTrackName === currentTab;
			  });

	if (error) {
		return <div className='text-red-500'>{error}</div>;
	}

	return (
		<div className=''>
			<TabNavigation
				currentTab={currentTab}
				setCurrentTab={setCurrentTab}
				gov2LatestPosts={postData}
				network={network}
			/>

			{loading ? (
				<div className='flex min-h-[50px] w-full items-center justify-center'>
					<LoadingOutlined />
				</div>
			) : (
				<PostList
					postData={filteredPosts}
					currentUserdata={currentUserdata}
				/>
			)}
		</div>
	);
};

export default React.memo(LatestActivityExplore);
