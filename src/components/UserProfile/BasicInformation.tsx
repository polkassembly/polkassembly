// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CloseOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Input, Skeleton, Tag } from 'antd';
import dynamic from 'next/dynamic';
import React, { FC, useState } from 'react';
import { ProfileDetails } from '~src/auth/types';

const ImageComponent = dynamic(() => import('src/components/ImageComponent'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});

interface IBasicInformationProps {
    profile?: ProfileDetails;
	setProfile: React.Dispatch<React.SetStateAction<ProfileDetails>>
    loading: boolean;
    setUsername: (pre: string) => void;
    username: string;
}

const BasicInformation: FC<IBasicInformationProps> = (props) => {
	const { profile, loading, setProfile, setUsername, username } = props;
	const [newBadge, setNewBadge] = useState<string>('');

	const addNewBadge = () => {
		if(!newBadge || loading){
			return;
		}
		const badges = profile?.badges || [];
		if(!(badges.includes(newBadge.toLowerCase()))) {
			setProfile((prev) => {
				return {
					...prev,
					badges: [...badges, newBadge.toLowerCase()]
				};
			});
			setNewBadge('');
		}
	};

	function removeBadge(badge: string) {
		const badges = profile?.badges;
		const badgesArr = [...(badges && Array.isArray(badges)? badges: [])];
		const index = badgesArr.indexOf(badge);
		if (index !== -1) {
			badgesArr.splice(index, 1);
			setProfile((prev) => {
				return {
					...prev,
					badges: badgesArr
				};
			});
		}
	}

	function handleNewBadgeKeyPress(e:any) {
		if(e.key === 'Enter'){
			e.preventDefault();
			addNewBadge();
		}
	}
	return (
		<div className='flex flex-col justify-between max-h-[552px] overscroll-y-scroll'>
			<article className='flex flex-col md:flex-row gap-x-6 items-center'>
				<div className='relative flex items-center justify-center'>
					<ImageComponent
						src={profile?.image}
						alt='User Picture'
						className='bg-white flex items-center justify-center w-[103px] h-[103px]'
						iconClassName='flex items-center justify-center text-[#A0A6AE] text-5xl w-full h-full border-4 border-solid rounded-full'
					/>
				</div>
				<div
					className='flex flex-col'
				>
					<h4 className='font-semibold text-sm text-[#485F7D]'>Profile Image</h4>
					<p className='font-normal text-xs'>
						Please provide a url of your profile photo using a service such as
						<a href='https://postimages.org/' target='_blank' rel="noreferrer">
							{' '}postimages.org{' '}
						</a>
							to upload and generate a direct link.
					</p>
					<Input
						className='rounded-[4px] border border-solid border-[rgba(72,95,125,0.2)] text-[#1D2632] h-10'
						size='large'
						type='url'
						prefix={<LinkOutlined className='text-[rgba(72,95,125,0.2)] mr-1.5 text-base' />}
						placeholder='Profile Picture URL'
						onChange={(e) => setProfile((prev) => {
							return {
								...prev,
								image: e.target.value
							};
						})}
						value={profile?.image}
						disabled={loading}
					/>
				</div>
			</article>
			<div className='flex gap-x-6'>
				<div className='hidden md:block max-w-[103px] w-full'></div>
				<div className='flex-1'>
					<Divider className='my-6' />
					<article>
						<label
							className='text-sm cursor-pointer font-normal text-[#485F7D]'
							htmlFor='title'
						>
							Job Title
						</label>
						<Input
							id='title'
							value={profile?.title}
							placeholder='eg. Manager'
							onChange={(e) => setProfile((prev) => {
								return {
									...prev,
									title: e.target.value
								};
							})}
							disabled={loading}
							className="border border-solid rounded-[4px] border-[rgba(72,95,125,0.2)] h-10 px-[14px]"
						/>
					</article>
					<div className='text-sm cursor-pointer mt-6 text-[#485F7D]'>
						<h4 className='text-sm text-[#485F7D] font-normal '>User Name</h4>
						<Input
							className='rounded-[4px] border border-solid border-[rgba(72,95,125,0.2)] text-[#1D2632] h-10'
							size='large'
							type='text'
							onChange={(e) => setUsername(e.target.value)}
							value={username}
						/>
					</div>
					<article className='mt-4'>
						<label
							className='text-sm cursor-pointer font-normal text-[#485F7D]'
							htmlFor='bio'
						>
							Bio
						</label>
						<Input.TextArea
							id='bio'
							value={profile?.bio}
							placeholder='eg. I am a Web Developer'
							onChange={(e) => setProfile((prev) => {
								return {
									...prev,
									bio: e.target.value
								};
							})}
							disabled={loading}
							className="border border-solid rounded-[4px] border-[rgba(72,95,125,0.2)] px-[14px] py-[10px]"
						/>
					</article>
					<article className='mt-4'>
						<label
							className='text-sm cursor-pointer font-normal text-[#485F7D]'
							htmlFor='badges'
						>
							Badges
						</label>
						<p className='text-xs font-normal text-[#485F7D] m-0 mb-1 leading-[18px]'>
							Badges indicate individual successes, abilities, skills and/or interests
						</p>
						<div className='flex gap-x-2 items-center'>
							<Input
								id='badges'
								value={newBadge}
								placeholder='eg. Council Member, Voter, etc.'
								onChange={(e) => setNewBadge(e.target.value)}
								onKeyPress={(e: any) => handleNewBadgeKeyPress(e)}
								className="border border-solid rounded-[4px] border-[rgba(72,95,125,0.2)] h-10 px-[14px]"
								disabled={loading}
							/>
							<Button
								className='bg-transparent border border-solid rounded border-pink_primary text-pink_primary h-10 font-medium text-sm'
								icon={<PlusOutlined />}
								onClick={() => addNewBadge()}
								disabled={loading}
							>
								Add Badge
							</Button>
						</div>
						{
							profile && profile?.badges && Array.isArray(profile?.badges) && profile?.badges.length >= 0 ?
								<div>
									{
										profile?.badges.map((badge) => {
											return (
												<Tag
													closeIcon={
														<CloseOutlined
															className={`m-0 p-0 flex text-white ${loading? 'cursor-not-allowed': ''}`}
														/>
													}
													className={`capitalize rounded-full inline-flex font-medium outline-none border-none shadow-none px-3 py-0.5 gap-x-1 items-center bg-pink_primary text-white m-0 mt-2 mr-2 ${loading? 'cursor-not-allowed': ''}`}
													key={badge}
													closable
													onClose={(e) => {
														e.preventDefault();
														if (!loading) {
															removeBadge(badge);
														}
													}}
												>
													{badge}
												</Tag>
											);
										})
									}
								</div>
								: null
						}
					</article>
				</div>
			</div>
		</div>
	);
};

export default BasicInformation;