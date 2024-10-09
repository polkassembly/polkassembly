// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { HomeFilled, TwitterOutlined, YoutubeFilled } from '@ant-design/icons';
import { Space } from 'antd';
import React from 'react';
import { CubeIcon, DiscordIcon, GithubIcon, RedditIcon, TelegramIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';
import Tooltip from '~src/basic-components/Tooltip';
import { NetworkSocials } from '~src/types';

export const socialLinks = (blockchain_socials: NetworkSocials) => {
	if (!blockchain_socials) {
		return null;
	}

	return (
		<Space
			size={19}
			className='mt-3 flex flex-wrap items-center'
		>
			{blockchain_socials.homepage ? (
				<Tooltip
					title='Homepage'
					color='#E5007A'
				>
					<a
						href={blockchain_socials.homepage}
						target='_blank'
						rel='noreferrer'
					>
						<HomeFilled className='text-sm text-lightBlue dark:text-icon-dark-inactive md:mr-1 md:text-lg' />
					</a>
				</Tooltip>
			) : null}
			{blockchain_socials.twitter ? (
				<Tooltip
					title='Twitter'
					color='#E5007A'
				>
					<a
						href={blockchain_socials.twitter}
						target='_blank'
						rel='noreferrer'
					>
						<TwitterOutlined className='text-sm text-lightBlue dark:text-icon-dark-inactive md:mr-1 md:text-lg' />
					</a>
				</Tooltip>
			) : null}
			{blockchain_socials.discord ? (
				<Tooltip
					title='Discord'
					color='#E5007A'
				>
					<a
						href={blockchain_socials.discord}
						target='_blank'
						rel='noreferrer'
					>
						<DiscordIcon className='text-sm text-lightBlue dark:text-icon-dark-inactive md:mr-1 md:text-lg' />
					</a>
				</Tooltip>
			) : null}
			{blockchain_socials.github ? (
				<Tooltip
					title='Github'
					color='#E5007A'
				>
					<a
						href={blockchain_socials.github}
						target='_blank'
						rel='noreferrer'
					>
						<GithubIcon className='text-sm text-lightBlue dark:text-icon-dark-inactive md:mr-1 md:text-lg' />
					</a>
				</Tooltip>
			) : null}
			{blockchain_socials.youtube ? (
				<Tooltip
					title='Youtube'
					color='#E5007A'
				>
					<a
						href={blockchain_socials.youtube}
						target='_blank'
						rel='noreferrer'
					>
						<YoutubeFilled className='text-sm text-lightBlue dark:text-icon-dark-inactive md:mr-1 md:text-lg' />
					</a>
				</Tooltip>
			) : null}
			{blockchain_socials.reddit ? (
				<Tooltip
					title='Reddit'
					color='#E5007A'
				>
					<a
						href={blockchain_socials.reddit}
						target='_blank'
						rel='noreferrer'
					>
						<RedditIcon className='text-sm text-lightBlue dark:text-icon-dark-inactive md:mr-1 md:text-lg' />
					</a>
				</Tooltip>
			) : null}
			{blockchain_socials.telegram ? (
				<Tooltip
					title='Telegram'
					color='#E5007A'
				>
					<a
						href={blockchain_socials.telegram}
						target='_blank'
						rel='noreferrer'
					>
						<TelegramIcon className='text-sm text-lightBlue dark:text-icon-dark-inactive md:mr-1 md:text-lg' />
					</a>
				</Tooltip>
			) : null}
			{blockchain_socials.block_explorer ? (
				<Tooltip
					title='Block Explorer'
					color='#E5007A'
				>
					<a
						href={blockchain_socials.block_explorer}
						target='_blank'
						rel='noreferrer'
					>
						<CubeIcon className='text-sm text-lightBlue dark:text-icon-dark-inactive md:mr-1 md:text-lg' />
					</a>
				</Tooltip>
			) : null}
		</Space>
	);
};

interface IAboutActivityProps {
	className?: string;
	networkSocialsData: NetworkSocials | null;
	showGov2Links?: boolean;
	knowMoreLink?: string;
	knowMoreText?: string;
}

const ActivityFeedAbout: React.FC<IAboutActivityProps> = ({ className, networkSocialsData, knowMoreLink = '#', knowMoreText = 'Know More' }) => {
	return (
		<section className={`${className} rounded-xxl border-[0.6px] border-solid border-[#D2D8E0] bg-white p-5 dark:border-[#4B4B4B] dark:bg-section-dark-overlay md:p-6`}>
			{' '}
			<h2 className='text-xl font-medium leading-8 text-bodyBlue dark:text-blue-dark-high'>About</h2>{' '}
			<p className='medium items-center text-sm text-bodyBlue dark:text-blue-dark-high'>
				{' '}
				Polkadot is the all-in-one DeFi hub of Polkadot.{' '}
				<a
					href={knowMoreLink}
					className='m-0 cursor-pointer pl-1 text-xs font-semibold text-pink_primary'
					aria-label={`${knowMoreText} about Polkadot`}
				>
					{' '}
					{knowMoreText}{' '}
				</a>{' '}
				<div className='hidden lg:inline-block'>{networkSocialsData && socialLinks(networkSocialsData)}</div>{' '}
			</p>{' '}
			<div className='mt-5 flex lg:hidden'>{networkSocialsData && socialLinks(networkSocialsData)}</div>{' '}
		</section>
	);
};

export default styled(ActivityFeedAbout)`
	.anticon:hover {
		path {
			fill: var(--pink_primary) !important;
		}
	}
`;
