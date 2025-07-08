// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { FC, useEffect, useState } from 'react';
import SEOHead from 'src/global/SEOHead';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import AboutNetwork from '~src/components/Home/AboutNetwork';
import LatestActivity from '~src/components/Home/LatestActivity';
import News from '~src/components/Home/News';
import { isGrantsSupported } from '~src/global/grantsNetworks';
import { LATEST_POSTS_LIMIT } from '~src/global/listingLimit';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { OffChainProposalType, ProposalType } from '~src/global/proposalType';
import { IApiResponse, NetworkSocials } from '~src/types';
import { getLatestActivityAllPosts } from './api/v1/latest-activity/all-posts';
import { getLatestActivityOffChainPosts } from './api/v1/latest-activity/off-chain-posts';
import { getLatestActivityOnChainPosts, ILatestActivityPostsListingResponse } from './api/v1/latest-activity/on-chain-posts';
import { getNetworkSocials } from './api/v1/network-socials';
import { chainProperties, v2SupportedNetworks } from '~src/global/networkConstants';
import { network as AllNetworks } from '~src/global/networkConstants';
import Gov2LatestActivity from '~src/components/Gov2Home/Gov2LatestActivity';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import Script from 'next/script';
// @ts-ignore
import { useRouter } from 'next/router';
import { onchainIdentitySupportedNetwork } from '~src/components/AppLayout';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { setNetwork } from '~src/redux/network';
import { useDispatch } from 'react-redux';
import { useTheme } from 'next-themes';
import Skeleton from '~src/basic-components/Skeleton';
import { isPolymesh } from '~src/util/isPolymeshNetwork';

const UpcomingEvents = dynamic(() => import('~src/components/Home/UpcomingEvents'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const OnchainIdentity = dynamic(() => import('~src/components/OnchainIdentity'), {
	loading: () => <Skeleton active />,
	ssr: false
});

export type ILatestActivityPosts = {
	[key in ProposalType]?: IApiResponse<ILatestActivityPostsListingResponse>;
};

interface IHomeProps {
	networkSocialsData?: IApiResponse<NetworkSocials>;
	latestPosts: {
		all?: IApiResponse<ILatestActivityPostsListingResponse>;
	} & ILatestActivityPosts;
	network: string;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	if (isOpenGovSupported(network) && !v2SupportedNetworks.includes(network) && !req.headers.referer) {
		return {
			props: {},
			redirect: {
				destination: '/opengov'
			}
		};
	}

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

	if (chainProperties[network]?.subsquidUrl && network === AllNetworks.ZEITGEIST) {
		const onChainFetches = {
			advisory_committee: getLatestActivityOnChainPosts({
				listingLimit: LATEST_POSTS_LIMIT,
				network,
				proposalType: ProposalType.ADVISORY_COMMITTEE
			})
		};
		fetches = { ...fetches, ...onChainFetches };
	}
	if (
		chainProperties[network]?.subsquidUrl &&
		![AllNetworks.COLLECTIVES, AllNetworks.POLIMEC, AllNetworks.ROLIMEC, AllNetworks.WESTENDCOLLECTIVES, AllNetworks.POLYMESH, AllNetworks.POLYMESHTEST].includes(network)
	) {
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

	if (chainProperties[network]?.subsquidUrl && isPolymesh(network)) {
		const onChainFetches = {
			community_pips: getLatestActivityOnChainPosts({
				listingLimit: LATEST_POSTS_LIMIT,
				network,
				proposalType: ProposalType.COMMUNITY_PIPS
			}),
			technical_pips: getLatestActivityOnChainPosts({
				listingLimit: LATEST_POSTS_LIMIT,
				network,
				proposalType: ProposalType.TECHNICAL_PIPS
			}),
			upgrade_pips: getLatestActivityOnChainPosts({
				listingLimit: LATEST_POSTS_LIMIT,
				network,
				proposalType: ProposalType.UPGRADE_PIPS
			})
		};

		fetches = { ...fetches, ...onChainFetches };
	}
	if (chainProperties[network]?.subsquidUrl && [AllNetworks.POLIMEC, AllNetworks.ROLIMEC].includes(network)) {
		const onChainFetches = {
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
			fetches[trackName as keyof typeof fetches] = getLatestActivityOnChainPosts({
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

const TreasuryOverview = dynamic(() => import('~src/components/Home/TreasuryOverview/index'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const Home: FC<IHomeProps> = ({ latestPosts, network, networkSocialsData }) => {
	const router = useRouter();
	const dispatch = useDispatch();
	const [openContinuingModal, setOpenContinuingModal] = useState<boolean>(Boolean(router.query.identityVerification) || false);
	const { resolvedTheme: theme } = useTheme();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return (
		<>
			{chainProperties[network]?.gTag ? (
				<>
					<Script
						src={`https://www.googletagmanager.com/gtag/js?id=${chainProperties[network].gTag}`}
						strategy='afterInteractive'
					/>
					<Script
						id='google-analytics'
						strategy='afterInteractive'
					>
						{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());

					gtag('config', '${chainProperties[network].gTag}');
				`}
					</Script>
				</>
			) : null}

			<SEOHead
				title='Home'
				desc={`Join the future of blockchain with ${network}'s revolutionary governance system on Polkassembly`}
				network={network}
			/>
			<main>
				<div className='mr-2 flex justify-between'>
					<h1 className='mx-2 text-2xl font-semibold leading-9 text-bodyBlue dark:text-blue-dark-high'>Overview</h1>
				</div>
				<div className='mx-1 mt-6'>{networkSocialsData && <AboutNetwork networkSocialsData={networkSocialsData.data} />}</div>
				{network !== AllNetworks.COLLECTIVES && network !== AllNetworks.WESTENDCOLLECTIVES && (
					<div className='mx-1 mt-8'>
						<TreasuryOverview theme={theme as any} />
					</div>
				)}
				<div className='mx-1 mt-8'>
					{network !== AllNetworks.COLLECTIVES ? (
						<LatestActivity latestPosts={latestPosts} />
					) : (
						<Gov2LatestActivity
							gov2LatestPosts={{
								allGov2Posts: latestPosts.all,
								discussionPosts: latestPosts.discussions,
								...latestPosts
							}}
						/>
					)}
				</div>

				<div className='mx-1 mt-8 flex flex-col items-center justify-between gap-4 xl:flex-row'>
					<div className='w-full xl:w-[60%]'>
						<UpcomingEvents />
					</div>

					<div className='w-full xl:w-[40%]'>
						<News twitter={networkSocialsData?.data?.twitter || ''} />
					</div>
				</div>
			</main>
			{onchainIdentitySupportedNetwork.includes(network) && (
				<OnchainIdentity
					open={openContinuingModal}
					setOpen={setOpenContinuingModal}
				/>
			)}
		</>
	);
};

export default Home;
