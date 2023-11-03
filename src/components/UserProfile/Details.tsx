// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider, Skeleton, Tabs } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { CheckCircleFilled } from '@ant-design/icons';
import { ESocialType, ProfileDetailsResponse } from '~src/auth/types';
import { useApiContext } from '~src/context';
import Addresses from './Addresses';
import EditProfile from './EditProfile';

import { DeriveAccountRegistration } from '@polkadot/api-derive/accounts/types';

const ImageComponent = dynamic(() => import('src/components/ImageComponent'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});

import dynamic from 'next/dynamic';
import About from './About';
import GovTab from './GovTab';
import { IUserPostsListingResponse } from 'pages/api/v1/listing/user-posts';
import OnChainIdentity from './OnChainIdentity';
import SocialLink from '~src/ui-components/SocialLinks';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { EProfileHistory, votesHistoryUnavailableNetworks } from 'pages/user/[username]';
import { trackEvent } from 'analytics';

export const socialLinks = [ESocialType.EMAIL, ESocialType.RIOT, ESocialType.TWITTER, ESocialType.TELEGRAM, ESocialType.DISCORD];

interface IDetailsProps {
	userProfile: {
		data: ProfileDetailsResponse;
		error: string | null;
	};
	userPosts: IUserPostsListingResponse;
}

interface ITitleBioProps {
	title?: string;
	bio?: string;
	titleClassName?: string;
	bioClassName?: string;
}

export const TitleBio: FC<ITitleBioProps> = (props) => {
	const { title, bio, titleClassName, bioClassName } = props;
	const [showFullBio, setShowFullBio] = useState(false);

	const toggleBio = () => {
		setShowFullBio(!showFullBio);
	};

	const truncateBio = (text: string | undefined, limit: number) => {
		if (!text) return '';
		const words = text.split(' ');
		return words.slice(0, limit).join(' ') + (words.length > limit ? ' ...' : '');
	};

	const displayedBio = showFullBio ? bio : truncateBio(bio, 15);

	return (
		<>
			{title && (
				<p
					className={`mt-[10px] text-sm font-normal leading-[22px] text-white ${titleClassName}`}
					title={title}
				>
					{title}
				</p>
			)}

			{bio && (
				<>
					<p
						className={`mt-[10px] w-[296px] break-words text-center text-sm font-normal leading-[22px] text-white ${bioClassName}`}
						title={bio}
					>
						{showFullBio ? bio : displayedBio}
					</p>
					{bio.split(' ').length > 15 && (
						<span
							className='read-more-button cursor-pointer text-xs text-white underline'
							onClick={toggleBio}
						>
							{showFullBio ? 'See Less' : 'See More'}
						</span>
					)}
				</>
			)}
		</>
	);
};

export type TOnChainIdentity = { nickname: string } & DeriveAccountRegistration;

const Details: FC<IDetailsProps> = (props) => {
	const { userProfile, userPosts } = props;
	const userDetails = useUserDetailsSelector();
	const { api, apiReady } = useApiContext();

	const [onChainIdentity, setOnChainIdentity] = useState<TOnChainIdentity>({
		judgements: [],
		nickname: ''
	});

	const [profileDetails, setProfileDetails] = useState<ProfileDetailsResponse>({
		addresses: [],
		badges: [],
		bio: '',
		image: '',
		social_links: [],
		title: '',
		user_id: 0,
		username: ''
	});

	const { bio, title, badges, username, image, social_links, addresses } = profileDetails;

	useEffect(() => {
		if (userProfile && userProfile.data) {
			setProfileDetails(userProfile.data);
		}
	}, [userProfile]);

	useEffect(() => {
		if (onChainIdentity) {
			const { email, twitter, riot } = onChainIdentity;
			const social_links = userProfile.data.social_links || [];
			let isEmailAvailable = false;
			let isTwitterAvailable = false;
			let isRiotAvailable = false;
			social_links.forEach((v) => {
				switch (v.type) {
					case ESocialType.EMAIL:
						isEmailAvailable = true;
						break;
					case ESocialType.TWITTER:
						isTwitterAvailable = true;
						break;
					case ESocialType.RIOT:
						isRiotAvailable = true;
				}
			});
			if (email && !isEmailAvailable) {
				social_links.push({
					link: email,
					type: ESocialType.EMAIL
				});
			}
			if (twitter && !isTwitterAvailable) {
				social_links.push({
					link: `https://twitter.com/${twitter.substring(1)}`,
					type: ESocialType.TWITTER
				});
			}
			if (riot && !isRiotAvailable) {
				social_links.push({
					link: `https://matrix.to/#/${riot}`,
					type: ESocialType.RIOT
				});
			}
			setProfileDetails((prev) => {
				return {
					...prev,
					social_links: social_links
				};
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onChainIdentity, userProfile]);

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		let unsubscribes: (() => void)[];
		const onChainIdentity: TOnChainIdentity = {
			judgements: [],
			nickname: ''
		};
		const resolved: any[] = [];
		addresses.forEach((address) => {
			api.derive.accounts
				.info(`${address}`, (info) => {
					const { identity } = info;
					if (info.nickname && !onChainIdentity.nickname) {
						onChainIdentity.nickname = info.nickname;
					}
					Object.entries(identity).forEach(([key, value]) => {
						if (value) {
							if (Array.isArray(value) && value.length > 0 && (onChainIdentity as any)?.[key]?.length === 0) {
								(onChainIdentity as any)[key] = value;
							} else if (!(onChainIdentity as any)?.[key]) {
								(onChainIdentity as any)[key] = value;
							}
						}
					});
					resolved.push(true);
					if (resolved.length === addresses.length) {
						setOnChainIdentity(onChainIdentity);
					}
				})
				.then((unsub) => {
					unsubscribes?.push(unsub);
				})
				.catch((e) => console.error(e));
		});

		return () => {
			unsubscribes && unsubscribes.length > 0 && unsubscribes.forEach((unsub) => unsub && unsub());
		};
	}, [addresses, api, apiReady]);
	const { nickname, display, legal } = onChainIdentity;
	const newUsername = display || legal || nickname || username;
	const judgements = onChainIdentity.judgements.filter(([, judgement]): boolean => !judgement.isFeePaid);
	const isGood = judgements.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();

	useEffect(() => {
		//GAEvent for profile viewed
		trackEvent('user_profile_viewed', 'profile_viewed', {
			isVisitedProfileVerified: isGood && onChainIdentity.judgements.length > 0 ? true : false,
			userId: currentUser?.id || '',
			userName: currentUser?.username || '',
			visitedUserProfile: newUsername
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addresses]);

	const items = [
		{
			children: (
				<About
					title={title}
					bio={bio}
					addresses={addresses}
				/>
			),
			key: 'about',
			label: 'About'
		},
		{
			children: (
				<GovTab
					posts={userPosts}
					historyType={EProfileHistory.POSTS}
					userAddresses={userProfile.data?.addresses || []}
				/>
			),
			key: 'posts',
			label: 'Posts'
		}
	];

	if (!votesHistoryUnavailableNetworks.includes(network)) {
		items.splice(1, 0, {
			children: (
				<GovTab
					userAddresses={userProfile.data?.addresses || []}
					historyType={EProfileHistory.VOTES}
				/>
			),
			key: 'votes',
			label: 'Votes'
		});
	}
	return (
		<div className='flex h-full w-full flex-col gap-y-5 bg-[#F5F5F5] md:w-auto'>
			<article className='rounded-l-[4px] bg-[#910365] px-4 py-[22px] md:w-[330px] md:flex-1 md:py-8'>
				<div className='flex w-full flex-col items-center'>
					<div className='grid w-full grid-cols-3'>
						<div className='col-span-1'></div>
						<div className='col-span-1 flex items-center justify-center'>
							<ImageComponent
								src={image}
								alt='User Picture'
								className='flex h-[95px] w-[95px] items-center justify-center bg-transparent '
								iconClassName='flex items-center justify-center text-[#FCE5F2] text-5xl w-full h-full rounded-full'
							/>
						</div>
						<div className='col-span-1 flex justify-end'>
							{userDetails.username === username ? (
								<EditProfile
									setProfileDetails={setProfileDetails}
									data={profileDetails}
								/>
							) : null}
						</div>
					</div>
					<div className='flex items-center justify-center gap-2 text-xl'>
						<h2
							title={newUsername}
							className='mt-[18px] max-w-[200px] truncate text-xl font-semibold text-white'
						>
							{newUsername}
						</h2>
						{isGood && onChainIdentity.judgements.length > 0 && (
							<CheckCircleFilled
								style={{ color: 'green' }}
								className='mt-[7px] h-[20px] rounded-[50%] border-solid border-[#910365] bg-white'
							/>
						)}
					</div>
					<div className='mt- flex items-center gap-x-5 text-xl text-navBlue md:gap-x-3'>
						{socialLinks?.map((social, index) => {
							const link = social_links && Array.isArray(social_links) ? social_links?.find((s) => s.type === social)?.link || '' : '';
							return (
								<SocialLink
									className='flex items-center justify-center text-2xl text-[#FCE5F2] hover:text-[#FCE5F2] md:text-base'
									key={index}
									link={link}
									disable={!link}
									type={social}
								/>
							);
						})}
					</div>
					{badges && Array.isArray(badges) && badges.length > 0 ? (
						<p className='mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-2'>
							{badges?.map((badge) => {
								return (
									<span
										key={badge}
										className='rounded-[50px] border border-solid border-[#FCE5F2] px-[14px] py-1 text-[10px] font-medium text-[#FCE5F2]'
									>
										{badge}
									</span>
								);
							})}
						</p>
					) : null}
					<TitleBio
						bio={bio}
						title={title}
						titleClassName='hidden md:block'
						bioClassName='hidden md:block'
					/>
				</div>
				<div className='hidden md:block'>
					<Divider className='mb-6 mt-2 border-0 border-t-[0.5px] bg-[#FCE5F2]' />
					<Addresses addresses={addresses} />
					{onChainIdentity && addresses && addresses.length > 0 ? (
						<>
							<Divider className='my-6 border-0 border-t-[0.5px] bg-[#FCE5F2]' />
							<OnChainIdentity
								onChainIdentity={onChainIdentity}
								addresses={addresses}
							/>
						</>
					) : null}
				</div>
			</article>
			<div className='flex-1 rounded-[4px] bg-white px-4 md:hidden'>
				<Tabs
					type='card'
					className='ant-tabs-tab-bg-white my-4 font-medium text-sidebarBlue'
					items={items}
				/>
			</div>
		</div>
	);
};

export default Details;
