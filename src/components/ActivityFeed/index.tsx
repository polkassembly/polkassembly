// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import ActivityFeedTabNavigation from './ActivityFeedTabNavigation';
import ActivityFeedPostList from './ActivityFeedPostList';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { EActivityFeedTab, IPostData } from './types/types';
import LoginPopup from '~src/ui-components/loginPopup';
import SignupPopup from '~src/ui-components/SignupPopup';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import Skeleton from '~src/basic-components/Skeleton';
import { useDispatch, useSelector } from 'react-redux';
import { setExplorePosts, setLoadingExplore, setLoadingSubscribed } from '~src/redux/activityFeed';

const fetchUserProfile = async (address: string): Promise<IGetProfileWithAddressResponse | { error: string }> => {
	try {
		const { data } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`/api/v1/auth/data/profileWithAddress?address=${address}`);
		if (data) {
			const { custom_username, user_id, username, web3Signup, profile } = data;
			return { custom_username, profile: { achievement_badges: [], image: profile?.image }, user_id, username, web3Signup };
		}
		return { error: 'User profile not found' };
	} catch (error) {
		console.error(`Error fetching user profile for address ${address}:`, error);
		return { error: 'Failed to fetch user profile' };
	}
};

const fetchVoterProfileImage = async (username: string): Promise<string | null> => {
	try {
		const { data, error } = await nextApiClientFetch<any>(`/api/v1/auth/data/userProfileWithUsername?username=${username}`);
		if (error || !data || !data?.image) {
			return null;
		}
		return data?.image;
	} catch (error) {
		console.error('Error fetching voter profile image:', error);
		return null;
	}
};

interface ILatestActivityProps {
	currentTab: string;
}

export const LatestActivity: React.FC<ILatestActivityProps> = ({ currentTab }) => {
	const renderTabContent = () => {
		switch (currentTab) {
			case EActivityFeedTab.EXPLORE:
				return <LatestActivityExplore />;
			case EActivityFeedTab.FOLLOWING:
				return <LatestActivityFollowing />;
			default:
				return <LatestActivityExplore />;
		}
	};

	return <div>{renderTabContent()}</div>;
};

const LatestActivityExplore: React.FC = () => {
	const { addresses } = useUserDetailsSelector();
	const dispatch = useDispatch();
	const [currentTab, setCurrentTab] = useState<string>('all');
	const { network } = useNetworkSelector();
	const { explorePosts, loadingExplore } = useSelector((state: any) => state.activityFeed);
	console.log('explorePosts', explorePosts);
	const fetchexploreposts = async () => {
		dispatch(setLoadingExplore(true));
		const { data: responseData } = await nextApiClientFetch<any>('/api/v1/activity-feed/explore-posts', {
			userAddresses: addresses || []
		});

		const posts = Array?.isArray(responseData?.data) ? responseData?.data : [];
		const detailedPosts = await Promise?.all(
			posts?.map(async (post: any) => {
				let firstVoterProfileImg = null;
				if (post?.post_reactions?.['👍']?.usernames?.[0]) {
					const username = post?.post_reactions['👍']?.usernames[0];
					firstVoterProfileImg = await fetchVoterProfileImage(username);
				}

				const proposerProfile = await fetchUserProfile(post.proposer || '');

				return {
					...post,
					firstVoterProfileImg,
					proposerProfile
				};
			})
		);

		dispatch(setExplorePosts(detailedPosts?.filter((post) => !post.error)));
		dispatch(setLoadingExplore(false));
	};

	useEffect(() => {
		fetchexploreposts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentTab, network]);

	const filteredPosts =
		currentTab === 'all'
			? explorePosts
			: explorePosts.filter((post: any) => {
					const networkInfo = networkTrackInfo[network] || {};
					const trackName = Object?.keys(networkInfo)?.find((key) => networkInfo[key]?.trackId === post?.track_no);

					const formattedTrackName = trackName
						?.replace(/([a-z])([A-Z])/g, '$1-$2')
						?.replace(/_/g, '-')
						?.toLowerCase();

					return formattedTrackName === currentTab;
			  });

	return (
		<div className=''>
			{!explorePosts && loadingExplore ? (
				<div className='flex min-h-[200px] w-full  items-center justify-center rounded-lg bg-white px-5 dark:bg-[#141414]'>
					<Skeleton active />{' '}
				</div>
			) : (
				<div className=''>
					<ActivityFeedTabNavigation
						currentTab={currentTab}
						setCurrentTab={setCurrentTab}
						gov2LatestPosts={explorePosts}
						network={network}
					/>
					<ActivityFeedPostList postData={filteredPosts} />
				</div>
			)}
		</div>
	);
};

const LoginButton = ({ onClick }: { onClick: () => void }) => (
	<p
		onClick={onClick}
		className='w-full cursor-pointer rounded-md bg-[#E5007A] px-4 py-2 text-center text-[14px] text-white lg:w-[400px]'
	>
		Log In
	</p>
);

const SignupButton = ({ onClick }: { onClick: () => void }) => (
	<p
		onClick={onClick}
		className='w-full cursor-pointer rounded-md border-[1px] border-solid border-[#E5007A] px-4 py-2 text-center text-[14px] text-pink_primary lg:w-[400px] lg:border'
	>
		Sign Up
	</p>
);

const LatestActivityFollowing: React.FC = () => {
	const currentuser = useUserDetailsSelector();
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);
	const [currentTab, setCurrentTab] = useState<string | null>('all');
	const { subscribedPosts, loadingSubscribed } = useSelector((state: any) => state.activityFeed);
	console.log('subscribedPosts', subscribedPosts);
	const { network } = useNetworkSelector();
	const dispatch = useDispatch();
	const fecthAllSubscribedPosts = async () => {
		dispatch(setLoadingSubscribed(true));
		const { data: responseData } = await nextApiClientFetch<any>('/api/v1/activity-feed/subscribed-posts');
		const posts = Array?.isArray(responseData?.data) ? responseData?.data : [];
		const detailedPosts = await Promise?.all(
			posts?.map(async (post: IPostData) => {
				try {
					let firstVoterProfileImg = null;
					if (post?.post_reactions?.['👍']?.usernames?.[0]) {
						const username = post?.post_reactions['👍']?.usernames[0];
						firstVoterProfileImg = await fetchVoterProfileImage(username);
					}
					const proposerProfile = await fetchUserProfile(post?.proposer || '');
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
		dispatch(setExplorePosts(detailedPosts?.filter((post) => !post?.error) || []));
		dispatch(setLoadingSubscribed(false));
	};

	const filteredPosts =
		currentTab === 'all'
			? subscribedPosts
			: subscribedPosts?.filter((post: any) => {
					const formattedTrackName = post.trackName
						?.replace(/([a-z])([A-Z])/g, '$1-$2')
						?.replace(/_/g, '-')
						?.toLowerCase();

					return formattedTrackName === currentTab;
			  });

	useEffect(() => {
		fecthAllSubscribedPosts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentTab, network]);
	return (
		<div className=''>
			{!subscribedPosts && loadingSubscribed ? (
				<div className='flex min-h-[200px]  items-center justify-center rounded-lg bg-white px-5 dark:bg-[#141414]'>
					<Skeleton active />
				</div>
			) : currentuser?.id && currentuser?.username ? (
				subscribedPosts?.length > 0 ? (
					<div>
						<div>
							<ActivityFeedTabNavigation
								currentTab={currentTab}
								setCurrentTab={setCurrentTab}
								gov2LatestPosts={subscribedPosts}
								network={network}
							/>
						</div>
						<div>
							{filteredPosts?.length > 0 ? (
								<ActivityFeedPostList postData={filteredPosts} />
							) : (
								<div
									className={
										'flex h-[900px] flex-col  items-center rounded-xl border border-solid border-[#D2D8E0] bg-white px-5 pt-5 dark:border-[#4B4B4B] dark:bg-[#0D0D0D] md:pt-10'
									}
								>
									<Image
										src='/assets/Gifs/login-like.gif'
										alt='empty state'
										className='h-80 w-80 p-0'
										width={320}
										height={320}
									/>
									<p className='p-0 text-xl font-medium text-[#243A57] dark:text-white'>You&apos;re all caught up!</p>
									<p
										className='p-0 text-center text-[#243A57] dark:text-white'
										style={{ lineHeight: '1.8' }}
									>
										Why not explore other categories or topics?
									</p>
								</div>
							)}
						</div>
					</div>
				) : (
					<div
						className={'flex h-[900px] flex-col  items-center rounded-xl border border-solid border-[#D2D8E0] bg-white px-5 pt-5 dark:border-[#4B4B4B] dark:bg-[#0D0D0D] md:pt-10'}
					>
						<Image
							src='/assets/Gifs/login-like.gif'
							alt='empty state'
							className='mb-5'
							width={320}
							height={320}
						/>

						<p className='p-0 text-xl font-medium text-[#243A57] dark:text-white'>No Activity Found</p>
						<p
							className='p-0 text-center text-[#243A57] dark:text-white'
							style={{ lineHeight: '1.8' }}
						>
							Follow or Subscribe to people and posts to view personalized <br />
							content on your feed!
						</p>
					</div>
				)
			) : (
				<div
					className={'flex h-[900px] flex-col  items-center rounded-xl border border-solid border-[#D2D8E0] bg-white px-5 pt-5 dark:border-[#4B4B4B] dark:bg-[#0D0D0D] md:pt-10'}
				>
					<Image
						src='/assets/Gifs/login-dislike.gif'
						alt='empty state'
						className='mb-5'
						width={320}
						height={320}
					/>

					<p className='p-0 text-xl font-medium text-[#243A57] dark:text-white'>Join Polkassembly to see your Following tab!</p>
					<p className='p-0 text-center text-[#243A57] dark:text-white'>Discuss, contribute and get regular updates from Polkassembly.</p>
					<div className='pt-3'>
						<LoginButton onClick={() => setLoginOpen(true)} />
						<SignupButton onClick={() => setSignupOpen(true)} />
					</div>
				</div>
			)}
			<SignupPopup
				setLoginOpen={setLoginOpen}
				modalOpen={openSignup}
				setModalOpen={setSignupOpen}
				isModal={true}
			/>
			<LoginPopup
				setSignupOpen={setSignupOpen}
				modalOpen={openLogin}
				setModalOpen={setLoginOpen}
				isModal={true}
			/>
		</div>
	);
};

export default React.memo(LatestActivity);
