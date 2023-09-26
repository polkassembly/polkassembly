// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import 'dayjs-init';

import { Skeleton } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { FC, useEffect, useState } from 'react';
import SEOHead from 'src/global/SEOHead';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import AboutNetwork from '~src/components/Home/AboutNetwork';
import LatestActivity from '~src/components/Home/LatestActivity';
import News from '~src/components/Home/News';
import UpcomingEvents from '~src/components/Home/UpcomingEvents';
import { useApiContext, useNetworkContext, useUserDetailsContext } from '~src/context';
import { isGrantsSupported } from '~src/global/grantsNetworks';
import { LATEST_POSTS_LIMIT } from '~src/global/listingLimit';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
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
import getEncodedAddress from '~src/util/getEncodedAddress';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';

// @ts-ignore
import IdentityCaution from '~assets/icons/identity-caution.svg';
import { useRouter } from 'next/router';
import { onchainIdentitySupportedNetwork } from '~src/components/AppLayout';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

const OnChainIdentity = dynamic(() => import('~src/components/OnchainIdentity'), {
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

	// if (isOpenGovSupported(network) && !req.headers.referer) {
	// return {
	// props: {},
	// redirect: {
	// destination: '/opengov'
	// }
	// };
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

	if (chainProperties[network]?.subsquidUrl && network !== AllNetworks.COLLECTIVES && network !== AllNetworks.WESTENDCOLLECTIVES && network !== AllNetworks.POLYMESH) {
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

	if (chainProperties[network]?.subsquidUrl && network === AllNetworks.POLYMESH) {
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

const TreasuryOverview = dynamic(() => import('~src/components/Home/TreasuryOverview'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const Home: FC<IHomeProps> = ({ latestPosts, network, networkSocialsData }) => {
	const { setNetwork } = useNetworkContext();
	const { api, apiReady } = useApiContext();
	const { id: userId } = useUserDetailsContext();
	const router = useRouter();
	const [isIdentityUnverified, setIsIdentityUnverified] = useState<boolean>(false);
	const [openContinuingModal, setOpenContinuingModal] = useState<boolean>(Boolean(router.query.identityVerification) || false);

	useEffect(() => {
		setNetwork(network);
		if (!api || !apiReady) return;
		let unsubscribe: () => void;
		const address = localStorage.getItem('identityAddress');
		const identityForm = localStorage.getItem('identityForm');
		const encoded_addr = address ? getEncodedAddress(address, network) : '';
		if (!identityForm || !JSON.parse(identityForm)?.setIdentity) return;

		api.derive.accounts
			.info(encoded_addr, (info: DeriveAccountInfo) => {
				const infoCall = info.identity?.judgements.filter(([, judgement]): boolean => judgement.isFeePaid);
				const judgementProvided = infoCall?.some(([, judgement]): boolean => judgement.isFeePaid);

				setIsIdentityUnverified(judgementProvided || !info?.identity?.judgements?.length);
				if (!(judgementProvided || !info?.identity?.judgements?.length)) {
					localStorage.removeItem('identityForm');
				}
			})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => console.error(e));

		return () => unsubscribe && unsubscribe();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, api, apiReady, userId]);

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

					gtag('config', ${chainProperties[network].gTag});
				`}
					</Script>
				</>
			) : null}

			<SEOHead
				title='Home'
				desc='Democratizing governance for substrate blockchains'
				network={network}
			/>
			<main>
				<div className='mr-2 flex justify-between'>
					<h1 className='mx-2 text-2xl font-semibold leading-9 text-bodyBlue'>Overview</h1>
					{isIdentityUnverified && onchainIdentitySupportedNetwork.includes(network) && (
						<div className='flex  items-center rounded-md border-[1px] border-solid border-[#FFACAC] bg-[#FFF1EF] py-2 pl-3 pr-8 text-sm text-[#E91C26] max-sm:hidden '>
							<IdentityCaution />
							<span className='ml-2'>Social verification incomplete</span>
						</div>
					)}
				</div>
				<div className='mx-1 mt-6'>{networkSocialsData && <AboutNetwork networkSocialsData={networkSocialsData.data} />}</div>
				{network !== AllNetworks.COLLECTIVES && network !== AllNetworks.WESTENDCOLLECTIVES && (
					<div className='mx-1 mt-8'>
						<TreasuryOverview />
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
			<OnChainIdentity
				open={openContinuingModal}
				setOpen={setOpenContinuingModal}
			/>
		</>
	);
};

export default Home;
