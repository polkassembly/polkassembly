// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DesktopOutlined, FileTextOutlined, HomeFilled, PlayCircleFilled, TwitterOutlined, YoutubeFilled } from '@ant-design/icons';
import { Space } from 'antd';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
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
			className='flex flex-wrap items-center'
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

const gov2Link = ({ className, bgImage, icon, link, text, subText }: { className?: string; bgImage: any; icon?: any; link: string; text: string; subText: string }) => (
	<a
		href={link}
		target='_blank'
		rel='noreferrer'
		className={`${className} group flex min-w-[260px] max-w-[260px]`}
	>
		<div
			style={{
				backgroundImage: `url(${bgImage})`,
				backgroundPosition: 'center center',
				backgroundSize: 'cover'
			}}
			className='mr-3 flex h-[75px] min-w-[132px] items-center justify-center group-hover:text-pink_secondary'
		>
			{icon}
		</div>

		<div className='flex flex-col justify-between'>
			<div className='text-sm font-semibold leading-[150%] text-bodyBlue group-hover:text-pink_secondary dark:text-blue-dark-high'>{text}</div>
			<div className='text-xs font-medium text-lightBlue group-hover:text-pink_secondary dark:text-blue-dark-medium'>{subText}</div>
		</div>
	</a>
);

const AboutNetwork = ({ className, networkSocialsData, showGov2Links }: { className?: string; networkSocialsData: NetworkSocials | null; showGov2Links?: boolean }) => {
	const [showGallery, setShowGallery] = useState(false);
	const router = useRouter();
	return (
		<div className={`${className} rounded-xxl bg-white p-5 drop-shadow-md dark:bg-section-dark-overlay md:p-6`}>
			<div className='flex items-center justify-between'>
				<h2 className='text-xl font-semibold leading-8 tracking-tight text-bodyBlue dark:text-blue-dark-high'>About</h2>
				{router.pathname !== '/activity-feed' && <div className='hidden lg:inline-block'>{networkSocialsData && socialLinks(networkSocialsData)}</div>}
			</div>
			<p className='medium mt-1.5 items-center text-sm text-bodyBlue dark:text-blue-dark-high'>
				Join our Community to discuss, contribute and get regular updates from us!
				{showGallery && showGov2Links && (
					<span
						className={'m-0 ml-2 cursor-pointer p-0 text-xs text-pink_primary'}
						onClick={() => setShowGallery(false)}
					>
						Minimize Gallery
					</span>
				)}
				{!showGallery && showGov2Links && (
					<span
						className={'m-0 ml-2 cursor-pointer p-0 text-xs text-pink_primary'}
						onClick={() => setShowGallery(true)}
					>
						View Gallery
					</span>
				)}
			</p>

			<div className='mt-5 flex lg:hidden'>{networkSocialsData && socialLinks(networkSocialsData)}</div>
			{router.pathname === '/activity-feed' && <div className='mt-3 flex'>{networkSocialsData && socialLinks(networkSocialsData)}</div>}
			{showGallery && (
				<div>
					{showGov2Links && (
						<div className='mt-5 flex flex-wrap justify-between gap-3 overflow-x-auto pb-2 md:mt-10 md:flex-nowrap xl:w-[90%]'>
							{gov2Link({
								bgImage: '/assets/gavin-keynote.png',
								className: 'mr-12 lg:mr-9',
								icon: <PlayCircleFilled className='text-xl text-white' />,
								link: 'https://www.youtube.com/watch?v=FhC10CCw9Qg',
								subText: '1:40 hours',
								text: "Gavin's keynote @Decoded 2023"
							})}

							{gov2Link({
								bgImage: '/assets/gov2-info-bg-2.png',
								className: 'mr-12 lg:mr-9',
								icon: <DesktopOutlined className='text-xl text-white' />,
								link: 'https://medium.com/polkadot-network/gov2-polkadots-next-generation-of-decentralised-governance-4d9ef657d11b',
								subText: '17 min read',
								text: "Gavin's blog on Medium"
							})}

							{gov2Link({
								bgImage: '/assets/gov2-info-bg-3.png',
								className: 'mr-12 lg:mr-0',
								icon: <FileTextOutlined className='text-xl text-white' />,
								link: 'https://docs.polkassembly.io',
								subText: 'Wiki',
								text: 'Polkassembly user guide'
							})}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default styled(AboutNetwork)`
	.anticon:hover {
		path {
			fill: var(--pink_primary) !important;
		}
	}
`;
