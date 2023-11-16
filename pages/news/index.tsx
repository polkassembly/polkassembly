// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { getNetworkSocials } from 'pages/api/v1/network-socials';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { TwitterTimelineEmbed } from 'react-twitter-embed';

import kusamaLogo from '~assets/kusama-logo.gif';
import polkadotLogo from '~assets/parachain-logos/polkadot-logo.jpg';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import { NetworkSocials } from '~src/types';
import { ErrorState, PostEmptyState } from '~src/ui-components/UIStates';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { data, error } = await getNetworkSocials({ network });
	return { props: { data, error, network } };
};

interface Props {
	network: string;
	data: NetworkSocials;
	error: string;
}

enum Profile {
	Polkadot = 'polkadot',
	Kusama = 'kusamanetwork'
}

const News: FC<Props> = ({ data, error, network }) => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) return <ErrorState errorMessage={error} />;

	if (!data?.twitter) return <PostEmptyState />;

	const profile = data?.twitter.split('/')[3] || Profile.Polkadot;
	const isPolkadotOrKusama = profile === Profile.Kusama || profile === Profile.Polkadot;
	const profile2 = profile === Profile.Kusama ? Profile.Polkadot : Profile.Kusama;

	const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

	return (
		<>
			<SEOHead
				title='News'
				network={network}
			/>
			<div className='h-full w-full'>
				<h3 className='text-lg font-medium leading-7 tracking-wide text-sidebarBlue'>News</h3>
				<section className='mt-6 flex w-full flex-col justify-center gap-5 md:flex-row'>
					<article className='max-w-[720px] flex-1 justify-center'>
						{isPolkadotOrKusama && (
							<div className='mb-2 flex items-center'>
								<Image
									src={profile === Profile.Kusama ? kusamaLogo : polkadotLogo}
									className='rounded-full'
									height={28}
									width={28}
									alt={`${profile === Profile.Kusama ? 'Kusama' : 'Polkadot'} Logo`}
								/>
								<h4 className='ml-2 text-[18px] font-medium text-sidebarBlue'>{profile === Profile.Kusama ? 'Kusama' : 'Polkadot'}</h4>
							</div>
						)}
						<TwitterTimelineEmbed
							sourceType='profile'
							screenName={profile}
							autoHeight={false}
							noHeader={true}
							options={{ height: vh - 250 }}
						/>
					</article>
					{isPolkadotOrKusama && (
						<article className='flex-1'>
							{isPolkadotOrKusama && (
								<div className='mb-2 flex items-center'>
									<Image
										src={profile2 === Profile.Kusama ? kusamaLogo : polkadotLogo}
										className='rounded-full'
										height={28}
										width={28}
										alt={`${profile2 === Profile.Kusama ? 'Kusama' : 'Polkadot'} Logo`}
									/>
									<h4 className='ml-2 text-[18px] font-medium text-sidebarBlue'>{profile2 === Profile.Kusama ? 'Kusama' : 'Polkadot'}</h4>
								</div>
							)}
							<TwitterTimelineEmbed
								sourceType='profile'
								screenName={profile2}
								autoHeight={false}
								noHeader={true}
								options={{ height: vh - 250 }}
							/>
						</article>
					)}
				</section>
			</div>
		</>
	);
};

export default News;
