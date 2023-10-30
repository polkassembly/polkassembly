// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Divider, Input, Skeleton, Tag } from 'antd';
import dynamic from 'next/dynamic';
import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { ProfileDetails } from '~src/auth/types';
import HelperTooltip from '~src/ui-components/HelperTooltip';

const ImageComponent = dynamic(() => import('src/components/ImageComponent'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});

interface IBasicInformationProps {
	profile?: ProfileDetails;
	setProfile: React.Dispatch<React.SetStateAction<ProfileDetails>>;
	loading: boolean;
	setUsername: (pre: string) => void;
	username: string;
	className?: string;
	errorCheck?: string | undefined;
}

const BasicInformation: FC<IBasicInformationProps> = (props) => {
	const { profile, loading, setProfile, setUsername, username, className, errorCheck } = props;
	const [newBadge, setNewBadge] = useState<string>('');

	const addNewBadge = () => {
		if (!newBadge || loading) {
			return;
		}
		const badges = profile?.badges || [];
		if (!badges.includes(newBadge.toLowerCase())) {
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
		const badgesArr = [...(badges && Array.isArray(badges) ? badges : [])];
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

	function handleNewBadgeKeyPress(e: any) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addNewBadge();
		}
	}
	return (
		<div className={`overscroll-y-scroll flex max-h-[552px] flex-col justify-between ${className}`}>
			<article className='flex flex-col items-center gap-x-6 md:flex-row'>
				<div className='relative flex items-center justify-center'>
					<ImageComponent
						src={profile?.image}
						alt='User Picture'
						className='flex h-[103px] w-[103px] items-center justify-center bg-white dark:bg-section-dark-overlay'
						iconClassName='flex items-center justify-center text-[#A0A6AE] text-5xl w-full h-full rounded-full'
					/>
				</div>
				<div className='flex flex-col'>
					<h4 className='text-sm font-medium text-[#485F7D] dark:text-blue-dark-medium '>Profile Image</h4>
					<p className='-mt-1 text-sm font-normal'>
						Please provide a url of your profile photo using a service such as
						<a
							href='https://postimages.org/'
							target='_blank'
							rel='noreferrer'
						>
							{' '}
							postimages.org{' '}
						</a>
						to upload and generate a direct link.
					</p>
					<Input
						placeholder='Profile Picture URL'
						className='-mt-2 h-10 rounded-[4px] border border-solid border-[#d2d8e0] text-sm text-[#7788a0] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
						size='large'
						type='url'
						onChange={(e) =>
							setProfile((prev) => {
								return {
									...prev,
									image: e.target.value
								};
							})
						}
						value={profile?.image}
						disabled={loading}
						classNames={{
							input: 'dark:placeholder:text-borderColorDark dark:text-white'
						}}
					/>
				</div>
			</article>
			<div className='flex gap-x-6'>
				<div className='hidden w-full max-w-[103px] md:block'></div>
				<div className='flex-1'>
					<Divider className='my-6 border-[#d2d8e0] dark:border-separatorDark' />
					<article>
						<label
							className='cursor-pointer text-sm font-medium text-[#485F7D] dark:text-blue-dark-medium'
							htmlFor='title'
						>
							Job Title
						</label>
						<Input
							id='title'
							value={profile?.title}
							placeholder='eg. Manager'
							onChange={(e) =>
								setProfile((prev) => {
									return {
										...prev,
										title: e.target.value
									};
								})
							}
							disabled={loading}
							className='h-10 rounded-[4px] border border-solid border-[#d2d8e0] px-[14px] text-[#7788a0] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
							classNames={{
								input: 'dark:placeholder:text-borderColorDark dark:text-white'
							}}
						/>
					</article>
					<article className='mt-4 cursor-pointer text-sm text-[#485F7D] dark:text-blue-dark-medium'>
						<label className='mb-0 text-sm font-medium text-[#485F7D] dark:text-blue-dark-medium'>Username</label>
						<Input
							className='h-10 rounded-[4px] border border-solid border-[#d2d8e0] px-[14px] py-1 text-sm text-[#7788a0] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
							placeholder='eg. John'
							size='large'
							type='text'
							onChange={(e) => setUsername(e.target.value)}
							value={username}
							disabled={loading}
							classNames={{
								input: 'dark:placeholder:text-borderColorDark dark:text-white'
							}}
						/>
					</article>
					<article className='mt-4'>
						<label
							className='cursor-pointer text-sm font-medium text-[#485F7D] dark:text-blue-dark-medium'
							htmlFor='bio'
						>
							Bio
						</label>
						<Input.TextArea
							id='bio'
							value={profile?.bio}
							placeholder='eg. I am a Web Developer'
							onChange={(e) =>
								setProfile((prev) => {
									return {
										...prev,
										bio: e.target.value
									};
								})
							}
							disabled={loading}
							className='rounded-[4px] border border-solid border-[#d2d8e0] px-[14px] py-[10px] text-[#7788a0] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
							classNames={{
								textarea: 'dark:placeholder:text-borderColorDark dark:text-white'
							}}
						/>
					</article>
					<article className='mt-4'>
						<label
							className='cursor-pointer text-sm font-medium text-[#485F7D] dark:text-blue-dark-medium'
							htmlFor='badges'
						>
							Badges
						</label>
						<HelperTooltip
							className='m-0 mb-1 ml-1 cursor-pointer text-xs font-normal leading-[18px] text-[#485F7D] dark:text-blue-dark-medium'
							text='Badges indicate individual successes, abilities, skills and/or interests'
						/>
						<div className='flex items-center gap-x-2'>
							<Input
								id='badges'
								value={newBadge}
								placeholder='eg. Council Member, Voter, etc.'
								onChange={(e) => setNewBadge(e.target.value)}
								onKeyPress={(e: any) => handleNewBadgeKeyPress(e)}
								className='mt-[2px] h-10 rounded-[4px] border border-solid border-[#d2d8e0] px-[14px] text-[#7788a0] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								disabled={loading}
								classNames={{
									input: 'dark:placeholder:text-borderColorDark dark:text-white'
								}}
							/>
							<Button
								className='h-10 rounded border border-solid border-pink_primary bg-transparent text-sm font-medium text-pink_primary'
								icon={<PlusOutlined />}
								onClick={() => addNewBadge()}
								disabled={loading}
							>
								Add Badge
							</Button>
						</div>
						{profile && profile?.badges && Array.isArray(profile?.badges) && profile?.badges.length >= 0 ? (
							<div>
								{profile?.badges.map((badge) => {
									return (
										<Tag
											closeIcon={<CloseOutlined className={`m-0 flex p-0 text-white ${loading ? 'cursor-not-allowed' : ''}`} />}
											className={`m-0 mr-2 mt-2 inline-flex items-center gap-x-1 rounded-full border-none bg-pink_primary px-3 py-0.5 font-medium capitalize text-white shadow-none outline-none ${
												loading ? 'cursor-not-allowed' : ''
											}`}
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
								})}
							</div>
						) : null}
					</article>
				</div>
			</div>
			{errorCheck && (
				<Alert
					className='mt-4 h-[40px] rounded-[4px] px-5 py-2 text-sm text-bodyBlue dark:text-blue-dark-high'
					message={errorCheck}
					type='info'
					showIcon
				/>
			)}
		</div>
	);
};

export default styled(BasicInformation)`
	.ant-input:placeholder-shown {
		// color: #7788a0 !important;
	}
`;
