// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import 'dayjs-init';

import { Skeleton } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { FC, useEffect } from 'react';
import SEOHead from 'src/global/SEOHead';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import AboutNetwork from '~src/components/Home/AboutNetwork';
import LatestActivity from '~src/components/Home/LatestActivity';
import News from '~src/components/Home/News';
import UpcomingEvents from '~src/components/Home/UpcomingEvents';
import { useNetworkContext } from '~src/context';
import { isGrantsSupported } from '~src/global/grantsNetworks';
import { LATEST_POSTS_LIMIT } from '~src/global/listingLimit';
//import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { OffChainProposalType, ProposalType } from '~src/global/proposalType';
import { IApiResponse, NetworkSocials } from '~src/types';

import { getLatestActivityAllPosts } from './api/v1/latest-activity/all-posts';
import { getLatestActivityOffChainPosts } from './api/v1/latest-activity/off-chain-posts';
import { getLatestActivityOnChainPosts, ILatestActivityPostsListingResponse } from './api/v1/latest-activity/on-chain-posts';
import { getNetworkSocials } from './api/v1/network-socials';
import { chainProperties } from '~src/global/networkConstants';
import { network as AllNetworks } from '~src/global/networkConstants';
import Gov2LatestActivity from '~src/components/Gov2Home/Gov2LatestActivity';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import Script from 'next/script';

export type ILatestActivityPosts = {
	[key in ProposalType]?: IApiResponse<ILatestActivityPostsListingResponse>;
}
interface IHomeProps {
	networkSocialsData?: IApiResponse<NetworkSocials>;
	latestPosts: {
		all?: IApiResponse<ILatestActivityPostsListingResponse>;
	} & ILatestActivityPosts;
	network: string;
}

export const getServerSideProps:GetServerSideProps = async ({ req }) => {

	const network = getNetworkFromReqHeaders(req.headers);
	// if(isOpenGovSupported(network) && !req.headers.referer) {
	// return {
	// props: {},
	// redirect: {
	// destination: '/opengov'
	//}
	//};
	// }

	const networkSocialsData = await getNetworkSocials({ network });

	let fetches = {
		all: getLatestActivityAllPosts({
			listingLimit: LATEST_POSTS_LIMIT,
			network
		}),
		discussions: getLatestActivityOffChainPosts({
			listingLimit: LATEST_POSTS_LIMIT,
			network,
			proposalType: OffChainProposalType.DISCUSSIONS
		})
	};

	if(chainProperties[network]?.subsquidUrl && network !== AllNetworks.COLLECTIVES && network !== AllNetworks.WESTENDCOLLECTIVES) {
		const onChainFetches = {
			bounties: getLatestActivityOnChainPosts({
				listingLimit: LATEST_POSTS_LIMIT,
				network,
				proposalType: ProposalType.BOUNTIES
			}),
			council_motions: getLatestActivityOnChainPosts({
				listingLimit: LATEST_POSTS_LIMIT,
				network,
				proposalType: ProposalType.COUNCIL_MOTIONS
			}),
			democracy_proposals: getLatestActivityOnChainPosts({
				listingLimit: LATEST_POSTS_LIMIT,
				network,
				proposalType: ProposalType.DEMOCRACY_PROPOSALS
			}),
			referendums: getLatestActivityOnChainPosts({
				listingLimit: LATEST_POSTS_LIMIT,
				network,
				proposalType: ProposalType.REFERENDUMS
			}),
			tips: getLatestActivityOnChainPosts({
				listingLimit: LATEST_POSTS_LIMIT,
				network,
				proposalType: ProposalType.TIPS
			}),
			treasury_proposals: getLatestActivityOnChainPosts({
				listingLimit: LATEST_POSTS_LIMIT,
				network,
				proposalType: ProposalType.TREASURY_PROPOSALS
			})
		};

		fetches = { ...fetches, ...onChainFetches };
	}

	if (isGrantsSupported(network)) {
		(fetches as any)['grants'] = getLatestActivityOffChainPosts({
			listingLimit: LATEST_POSTS_LIMIT,
			network,
			proposalType: OffChainProposalType.GRANTS
		});
	}

	if (network === 'collectives') {
		for (const trackName of Object.keys(networkTrackInfo[network])) {
			fetches [trackName as keyof typeof fetches] =  getLatestActivityOnChainPosts({
				listingLimit: LATEST_POSTS_LIMIT,
				network,
				proposalType: ProposalType.FELLOWSHIP_REFERENDUMS,
				trackNo: networkTrackInfo[network][trackName].trackId
			});
		}
	}

	const responseArr = await Promise.all(Object.values(fetches));
	const props: IHomeProps = {
		latestPosts: {},
		network,
		networkSocialsData
	};

	Object.keys(fetches).forEach((key, index) => {
		props.latestPosts[key as keyof typeof fetches] = responseArr[index];
	});

	return { props };
};

const TreasuryOverview = dynamic(() => import('~src/components/Home/TreasuryOverview'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

const Home: FC<IHomeProps> = ({ latestPosts, network, networkSocialsData }) => {
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return (
		<>
			{chainProperties[network]?.gTag ? <><Script
				src={`https://www.googletagmanager.com/gtag/js?id=${chainProperties[network].gTag}`}
				strategy="afterInteractive" /><Script id="google-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());

					gtag('config', ${chainProperties[network].gTag});
				`}
			</Script></> : null}

			<SEOHead title="Home" desc="Democratizing governance for substrate blockchains" network={network}/>
			<main>
				<h1 className='text-bodyBlue font-semibold text-2xl leading-9 mx-2'>Overview</h1>
				<div className="mt-6 mx-1">
					{networkSocialsData && <AboutNetwork networkSocialsData={networkSocialsData.data} />}
				</div>
				{ network !== AllNetworks.COLLECTIVES && network !== AllNetworks.WESTENDCOLLECTIVES &&
					<div className="mt-8 mx-1">
						<TreasuryOverview />
					</div>
				}
				<div className="mt-8 mx-1">
					{
						network !== AllNetworks.COLLECTIVES?
							<LatestActivity latestPosts={latestPosts} />
							: <Gov2LatestActivity gov2LatestPosts={{
								allGov2Posts: latestPosts.all,
								discussionPosts: latestPosts.discussions,
								...latestPosts
							}} />
					}
				</div>

				<div className="mt-8 mx-1 flex flex-col xl:flex-row items-center justify-between gap-4">

					<div className='w-full xl:w-[60%]'>
						<UpcomingEvents />
					</div>

					<div className='w-full xl:w-[40%]'>
						<News twitter={networkSocialsData?.data?.twitter || ''} />
					</div>
				</div>
				{/* <AiBot isAIChatBotOpen={isAIChatBotOpen} setIsAIChatBotOpen={setIsAIChatBotOpen} floatButtonOpen={floatButtonOpen} setFloatButtonOpen={setFloatButtonOpen} /> */}
			</main>
		</>
	);
};

export default Home;
