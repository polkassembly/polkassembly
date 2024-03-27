// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CloseOutlined, PlusOutlined, LinkOutlined } from '@ant-design/icons';
import { Input, Tag } from 'antd';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { ProfileDetails } from '~src/auth/types';
import Alert from '~src/basic-components/Alert';
import SkeletonAvatar from '~src/basic-components/Skeleton/SkeletonAvatar';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useNetworkSelector } from '~src/redux/selectors';

const ImageComponent = dynamic(() => import('src/components/ImageComponent'), {
	loading: () => <SkeletonAvatar active />,
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
	theme?: string;
	isValidCoverImage?: boolean;
}

const BasicInformation: FC<IBasicInformationProps> = (props) => {
	const { network } = useNetworkSelector();
	const { profile, loading, setProfile, setUsername, username, className, errorCheck, isValidCoverImage } = props;
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
		<div className={`flex max-h-[479px] flex-col justify-between overflow-y-auto ${className}`}>
			<div className='mb-6 flex flex-col gap-1'>
				<label className='text-base text-bodyBlue dark:text-blue-dark-medium '>Cover Photo</label>
				<span>Choose from below or Upload a file with 1600px dimension or above</span>
				<div className='h-[150px]'>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={isValidCoverImage && !!profile?.cover_image?.length ? profile?.cover_image : '/assets/profile/cover-image1.svg'}
						width={900}
						className='h-full w-full rounded-xl object-cover'
						height={150}
						alt='loading ...'
					/>
				</div>
				<div className='mt-3 flex h-14 justify-between'>
					<div
						className={`w-[32%] ${
							profile?.cover_image?.split('.')?.[1] === '.polkassembly.io/assets/profile/cover-image1.svg' && 'rounded-xl border-[1px] border-solid border-pink-dark-primary'
						}`}
						onClick={() =>
							setProfile((prev) => {
								return {
									...prev,
									cover_image: `https://${network}.polkassembly.io/assets/profile/cover-image1.svg`
								};
							})
						}
					>
						<Image
							src={'/assets/profile/cover-image1.svg'}
							width={100}
							className='h-full w-full rounded-xl object-cover'
							height={150}
							alt='loading ...'
						/>
					</div>
					<div
						className={`w-[32%] ${
							profile?.cover_image?.split('.')?.[1] === '.polkassembly.io/assets/profile/cover-image2.svg' && 'rounded-xl border-[1px] border-solid border-pink-dark-primary'
						}`}
						onClick={() =>
							setProfile((prev) => {
								return {
									...prev,
									cover_image: `https://${network}.polkassembly.io/assets/profile/cover-image2.svg`
								};
							})
						}
					>
						<Image
							src={'/assets/profile/cover-image2.svg'}
							width={100}
							className='h-full w-full rounded-xl object-cover'
							height={150}
							alt='loading ...'
						/>
					</div>
					<div
						className={`w-[32%] ${
							profile?.cover_image?.split('.')?.[1] === '.polkassembly.io/assets/profile/cover-image3.svg' && 'rounded-xl border-[1px] border-solid border-pink-dark-primary'
						}`}
						onClick={() =>
							setProfile((prev) => {
								return {
									...prev,
									cover_image: `https://${network}.polkassembly.io/assets/profile/cover-image3.svg`
								};
							})
						}
					>
						<Image
							src={'/assets/profile/cover-image3.svg'}
							width={100}
							className='h-full w-full rounded-xl object-cover'
							height={150}
							alt='loading ...'
						/>
					</div>
				</div>
				<Input
					placeholder='Cover Photo URL'
					className='mt-2 h-10 w-full rounded-[4px] border border-solid border-[#d2d8e0] text-sm text-[#7788a0] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
					size='large'
					type='url'
					prefix={<LinkOutlined className='mr-1.5 text-base text-[rgba(72,95,125,0.2)] dark:text-borderColorDark' />}
					onChange={(e) =>
						setProfile((prev) => {
							return {
								...prev,
								cover_image: e.target.value
							};
						})
					}
					value={profile?.cover_image}
					disabled={loading}
					classNames={{
						input: 'dark:placeholder:text-borderColorDark dark:text-white'
					}}
				/>
			</div>
			<div className='flex flex-col items-start gap-x-6 pr-2'>
				<h4 className='text-base font-medium text-lightBlue dark:text-blue-dark-medium '>Profile Image</h4>
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
				<div className='flex w-full items-center gap-4'>
					<div className='relative flex items-center justify-center'>
						<ImageComponent
							src={profile?.image}
							alt='User Picture'
							className='flex h-[90px] w-[90px] items-center justify-center bg-white dark:bg-section-dark-overlay'
							iconClassName='flex items-center justify-center text-[#A0A6AE] text-5xl w-full h-full rounded-full'
						/>
					</div>
					<Input
						placeholder='Profile Picture URL'
						className='mt-2 h-10 w-full rounded-[4px] border border-solid border-[#d2d8e0] text-sm text-[#7788a0] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
						size='large'
						type='url'
						prefix={<LinkOutlined className='mr-1.5 text-base text-[rgba(72,95,125,0.2)] dark:text-borderColorDark' />}
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
			</div>
			<div className='mt-4 flex flex-col gap-6 pr-2'>
				<div className='cursor-pointer text-sm text-lightBlue dark:text-blue-dark-medium'>
					<label className='mb-0 text-sm font-medium text-lightBlue dark:text-blue-dark-medium'>Display Name</label>
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
				</div>
				<div>
					<label
						className='cursor-pointer text-sm font-medium text-lightBlue dark:text-blue-dark-medium'
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
				</div>

				<div>
					<label
						className='cursor-pointer text-sm font-medium text-lightBlue dark:text-blue-dark-medium'
						htmlFor='bio'
					>
						About
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
						className='rounded-[4px] border border-solid border-[#d2d8e0] px-3.5 py-2.5 text-[#7788a0] dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
						classNames={{
							textarea: 'dark:placeholder:text-borderColorDark dark:text-white'
						}}
					/>
				</div>
				<div>
					<label
						className='cursor-pointer text-sm font-medium text-lightBlue dark:text-blue-dark-medium'
						htmlFor='badges'
					>
						Tags
					</label>
					<p className='mb-1 mt-1 text-xs text-lightBlue dark:text-white'>Tags indicate individual successes, abilities, skills and/or interests</p>
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
						<CustomButton
							variant='default'
							onClick={() => addNewBadge()}
							className='font-medium'
							icon={<PlusOutlined />}
							disabled={loading}
							text='Add Tags'
						/>
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
				</div>
			</div>
			{errorCheck && (
				<Alert
					className='mt-4 h-[40px] rounded-[4px] px-5 py-2 text-sm text-bodyBlue'
					message={<span className='dark:text-blue-dark-high'>{errorCheck}</span>}
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
	.ant-input {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#0d0d0d' : '#fff')} !important;
		color: ${(props: any) => (props.theme === 'dark' ? '#fff' : '#1D2632')} !important;
	}
	input::placeholder {
		font-weight: 300 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
		color: ${(props: any) => (props.theme === 'dark' ? '#909090' : '#243A57')} !important;
	}
`;
