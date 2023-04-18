// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { getNetworkSocials } from 'pages/api/v1/network-socials';
import React, { FC, useEffect } from 'react';
import { TwitterTimelineEmbed } from 'react-twitter-embed';

import kusamaLogo from '~assets/kusama-logo.gif';
import polkadotLogo from '~assets/parachain-logos/polkadot-logo.jpg';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useNetworkContext } from '~src/context';
import SEOHead from '~src/global/SEOHead';
import { NetworkSocials } from '~src/types';
import { ErrorState, PostEmptyState } from '~src/ui-components/UIStates';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);
	const { data, error } = await getNetworkSocials({ network });
	return { props: { data, error, network } };
};

interface Props {
	network: string;
	data: NetworkSocials;
	error: string;
}

enum Profile {
	Polkadot='polkadot',
	Kusama='kusamanetwork'
}

const News: FC<Props> = ({ data, error, network }) => {
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if(error) return <ErrorState errorMessage={error} />;

	if(!data?.twitter) return <PostEmptyState />;

	const profile = data?.twitter.split('/')[3] || Profile.Polkadot;
	const isPolkadotOrKusama = profile === Profile.Kusama || profile === Profile.Polkadot;
	const profile2 = profile === Profile.Kusama? Profile.Polkadot: Profile.Kusama;

	const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

	return (
		<>
			<SEOHead title='News' network={network}/>
			<div className='w-full h-full'>
				<h3 className='font-medium text-lg tracking-wide leading-7 text-sidebarBlue'>
					News
				</h3>
				<section className='mt-6 w-full flex flex-col md:flex-row gap-5 justify-center'>
					<article className='flex-1 max-w-[720px] justify-center'>
						{isPolkadotOrKusama && <div className='flex items-center mb-2'>
							<Image src={profile === Profile.Kusama? kusamaLogo : polkadotLogo} className='rounded-full' height={28} width={28} alt={`${profile === Profile.Kusama? 'Kusama': 'Polkadot'} Logo`} />
							<h4 className='text-[18px] font-medium text-sidebarBlue ml-2'>{profile === Profile.Kusama? 'Kusama': 'Polkadot'}</h4>
						</div>}
						<TwitterTimelineEmbed
							sourceType="profile"
							screenName={profile}
							autoHeight={false}
							noHeader={true}
							options={
								{ height: vh - 250 }
							}
						/>
					</article>
					{isPolkadotOrKusama && (<article className='flex-1'>
						{isPolkadotOrKusama && <div className='flex items-center mb-2'>
							<Image src={profile2 === Profile.Kusama? kusamaLogo : polkadotLogo} className='rounded-full' height={28} width={28} alt={`${profile2 === Profile.Kusama? 'Kusama': 'Polkadot'} Logo`} />
							<h4 className='text-[18px] font-medium text-sidebarBlue ml-2'>{profile2 === Profile.Kusama? 'Kusama': 'Polkadot'}</h4>
						</div>}
						<TwitterTimelineEmbed
							sourceType="profile"
							screenName={profile2}
							autoHeight={false}
							noHeader={true}
							options={
								{ height: vh - 250 }
							}
						/>
					</article>)}
				</section>
			</div>
		</>
	);

};

export default News;