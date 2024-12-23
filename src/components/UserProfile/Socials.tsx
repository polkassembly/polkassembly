// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import { ESocialType, ProfileDetails } from '~src/auth/types';
import { SocialIcon } from '~src/ui-components/SocialLinks';
import styled from 'styled-components';
import { LinkOutlined } from '@ant-design/icons';
import Input from '~src/basic-components/Input';
import Alert from '~src/basic-components/Alert';

interface ISocialsProps {
	loading: boolean;
	setProfile: React.Dispatch<React.SetStateAction<ProfileDetails>>;
	profile: ProfileDetails;
	errorCheck?: string | undefined;
	theme?: string;
}

export const socialLinks = [ESocialType.EMAIL, ESocialType.TWITTER, ESocialType.TELEGRAM, ESocialType.RIOT, ESocialType.DISCORD];

const getPlaceholder = (socialLink: string) => {
	switch (socialLink) {
		case 'Email':
			return 'Enter your email address';
		case 'Riot':
			return 'eg: https://riot.im/app/#/user/@handle:matrix.org';
		case 'Twitter':
			return 'eg: https://twitter.com/handle';
		case 'Telegram':
			return 'eg: https://t.me/handle';
		case 'Discord':
			return 'eg: https://discordapp.com/users/handle';
		default:
			return `Enter ${socialLink} URL`;
	}
};

const Socials: FC<ISocialsProps> = (props) => {
	const { loading, profile, setProfile, errorCheck } = props;

	return (
		<div className='flex max-h-[552px] flex-col gap-6'>
			{socialLinks.map((socialLink) => {
				const strLink = socialLink.toString();
				return (
					<article
						key={strLink}
						className='flex gap-2'
					>
						<label
							className='mb-0.5 flex w-[160px] cursor-pointer items-center gap-1.5 text-sm font-medium text-lightBlue dark:text-blue-dark-medium'
							htmlFor={strLink}
						>
							<div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#eceff3] text-textGreyColor dark:bg-[#dee3ea]'>
								<SocialIcon
									className='text-xl'
									type={socialLink}
								/>
							</div>
							<span>{strLink}</span>
						</label>
						<Input
							className='h-10 rounded-[4px] border-[1px] border-solid border-[rgba(72,95,125,0.2)] text-sm text-bodyBlue dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
							size='large'
							type='url'
							classNames={{
								input: 'dark:bg-transparent dark:placeholder:text-borderColorDark dark:text-white'
							}}
							prefix={strLink === 'Email' ? '' : <LinkOutlined className='mr-1.5 text-base text-[rgba(72,95,125,0.2)] dark:text-borderColorDark' />}
							placeholder={getPlaceholder(strLink)}
							onChange={(e) => {
								const value = e.target.value.trim();
								setProfile((prev) => {
									let isUpdated = false;
									const social_links =
										prev?.social_links?.map((link) => {
											if (link.type === strLink) {
												isUpdated = true;
												return {
													...link,
													link: value
												};
											}
											return {
												...link
											};
										}) || [];
									if (!isUpdated) {
										social_links.push({
											link: value,
											type: socialLink
										});
									}
									return {
										...prev,
										social_links
									};
								});
							}}
							value={profile?.social_links?.find((link) => link.type === strLink)?.link}
							disabled={loading}
						/>
					</article>
				);
			})}
			{errorCheck && (
				<Alert
					className='mt-4 h-[40px] rounded-[4px] border-none px-5 py-2 text-sm text-bodyBlue outline-none  '
					message={<span className='dark:text-blue-dark-high'>{errorCheck}</span>}
					type='info'
					showIcon
				/>
			)}
		</div>
	);
};

export default styled(Socials)`
	.ant-input .ant-input-lg {
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
