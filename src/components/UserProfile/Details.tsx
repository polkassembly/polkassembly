// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider, Skeleton, Tabs } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { ESocialType, ISocial, ProfileDetailsResponse } from '~src/auth/types';
import { useApiContext, useUserDetailsContext } from '~src/context';
import Addresses from './Addresses';
import EditProfile from './EditProfile';

import { DeriveAccountRegistration } from '@polkadot/api-derive/accounts/types';

const ImageComponent = dynamic(() => import('src/components/ImageComponent'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});

import { DiscordIcon, EmailIcon, RiotIcon, TelegramIcon, TwitterIcon } from '~src/ui-components/CustomIcons';
import dynamic from 'next/dynamic';
import About from './About';
import GovTab from './GovTab';
import { IUserPostsListingResponse } from 'pages/api/v1/listing/user-posts';
import OnChainIdentity from './OnChainIdentity';

interface ISocialIconProps {
	type: ESocialType;
}

export const SocialIcon: FC<ISocialIconProps> = (props) => {
	switch(props.type) {
	case ESocialType.EMAIL:
		return <EmailIcon />;
	case ESocialType.RIOT:
		return <RiotIcon />;
	case ESocialType.TWITTER:
		return <TwitterIcon />;
	case ESocialType.TELEGRAM:
		return <TelegramIcon />;
	case ESocialType.DISCORD:
		return <DiscordIcon />;
	default:
		return <></>;
	}
};

interface ISocialLink extends ISocial {
	className?: string;
	disable?: boolean;
}

const SocialLink: FC<ISocialLink> = (props) => {
	const { link, className, type, disable } = props;
	return (
		<>
			{
				disable?
					<span className={`${className} cursor-not-allowed opacity-60`}>
						<SocialIcon type={type} />
					</span>
					: <a
						href={type === ESocialType.EMAIL? `mailto:${link}`: link} target='_blank'
						rel='noreferrer'
						className={className}
					>
						<SocialIcon type={type} />
					</a>
			}
		</>
	);
};

export const socialLinks = [ESocialType.EMAIL, ESocialType.RIOT, ESocialType.TWITTER, ESocialType.TELEGRAM, ESocialType.DISCORD];

interface IDetailsProps {
    userProfile: {
		data: ProfileDetailsResponse;
		error: string | null;
	}
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
	return (
		<>

			{
				title?
					<p
						className={`text-white font-normal text-sm leading-[22px] mt-[10px] ${titleClassName}`}
						title={title}
					>
						{
							title
						}
					</p>
					: null
			}
			{
				bio?
					<p
						className={`text-white font-normal text-sm leading-[22px] mt-[10px] ${bioClassName}`}
						title={bio}
					>
						{
							bio
						}
					</p>
					: null
			}
		</>
	);
};

export type TOnChainIdentity = { nickname: string } & DeriveAccountRegistration;

const Details: FC<IDetailsProps> = (props) => {
	const { userProfile, userPosts } = props;
	const userDetails = useUserDetailsContext();
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
			const social_links = profileDetails.social_links || [];
			let isEmailAvailable = false;
			let isTwitterAvailable = false;
			let isRiotAvailable = false;
			social_links.forEach((v) => {
				switch(v.type) {
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
	}, [onChainIdentity, profileDetails]);

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
			api.derive.accounts.info(`${address}`, (info) => {
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
				.then(unsub => { unsubscribes.push(unsub); })
				.catch(e => console.error(e));
		});

		return () => {
			unsubscribes && unsubscribes.length > 0 && unsubscribes.forEach((unsub) => unsub && unsub());
		};
	}, [addresses, api, apiReady]);
	const { nickname, display, legal } = onChainIdentity;
	const newUsername = legal || display || nickname || username;
	return (
		<div className='w-full md:w-auto h-full flex flex-col gap-y-5 bg-[#F5F5F5]'>
			<article className='md:w-[330px] bg-[#910365] rounded-l-[4px] md:flex-1 py-[22px] md:py-8 px-4'>
				<div
					className='flex flex-col items-center w-full'
				>
					<div className='grid grid-cols-3 w-full'>
						<div className='col-span-1'></div>
						<div className='col-span-1 flex items-center justify-center'>
							<ImageComponent
								src={image}
								alt='User Picture'
								className='bg-transparent flex items-center justify-center w-[95px] h-[95px] '
								iconClassName='flex items-center justify-center text-[#FCE5F2] text-5xl w-full h-full border-4 border-solid rounded-full'
							/>
						</div>
						<div className='col-span-1 flex justify-end'>
							{
								userDetails.username === username?
									<EditProfile setProfileDetails={setProfileDetails} data={profileDetails} />
									: null
							}
						</div>
					</div>
					<h2 title={newUsername} className='font-semibold text-xl text-white truncate max-w-[200px] mt-[18px]'>{newUsername}</h2>
					<div
						className='flex items-center text-xl text-navBlue gap-x-5 md:gap-x-3 mt-[10px]'
					>
						{
							socialLinks?.map((social, index) => {
								const link = (social_links && Array.isArray(social_links))? social_links?.find((s) => s.type === social)?.link || '': '';
								return (
									<SocialLink
										className='flex items-center justify-center text-2xl md:text-base text-[#FCE5F2] hover:text-[#FCE5F2]'
										key={index}
										link={link}
										disable={!link}
										type={social}
									/>
								);
							})
						}
					</div>
					{
						badges && Array.isArray(badges) && badges.length > 0 ?
							<p className='flex items-center justify-center gap-x-2 mt-5 flex-wrap gap-y-2'>
								{
									badges?.map((badge) => {
										return (
											<span
												key={badge}
												className='rounded-[50px] border border-solid border-[#FCE5F2] py-1 px-[14px] text-[#FCE5F2] font-medium text-[10px]'
											>
												{badge}
											</span>
										);
									})
								}
							</p>
							: null
					}
					<TitleBio bio={bio} title={title} titleClassName='hidden md:block' bioClassName='hidden md:block' />
				</div>
				<div className='hidden md:block'>
					<Divider className='bg-[#FCE5F2] my-6 border-0 border-t-[0.5px]' />
					<Addresses addresses={addresses} />
					{
						onChainIdentity && addresses && addresses.length > 0?
							<>
								<Divider className='bg-[#FCE5F2] my-6 border-0 border-t-[0.5px]' />
								<OnChainIdentity onChainIdentity={onChainIdentity} addresses={addresses} />
							</>
							: null
					}
				</div>
			</article>
			<div className='md:hidden flex-1 bg-white rounded-[4px] px-4'>
				<Tabs
					type="card"
					className='ant-tabs-tab-bg-white text-sidebarBlue font-medium my-4'
					items={[
						{
							children: (
								<About
									title={title}
									bio={bio}
									addresses={addresses}
								/>
							),
							key:'about',
							label: 'About'
						},
						{
							children: (
								<GovTab
									posts={userPosts.gov1}
								/>
							),
							key:'gov1',
							label: 'Gov 1'
						},
						{
							children: (
								<GovTab
									posts={userPosts.open_gov}
								/>
							),
							key:'open_gov',
							label: 'OpenGov'
						}
					]}
				/>
			</div>
		</div>
	);
};

export default Details;