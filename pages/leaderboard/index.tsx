// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import TrophyIcon from '~assets/TrophyCup.svg';
import { useTheme } from 'next-themes';
import { GetServerSideProps } from 'next';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import { useRouter } from 'next/router';
import { LeaderboardResponse } from 'pages/api/v1/leaderboard';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import styled from 'styled-components';
import Skeleton from '~src/basic-components/Skeleton';
import dynamic from 'next/dynamic';
import { dmSans } from 'pages/_app';
import { isOpenGovSupported } from '~src/global/openGovNetworks';

const LeaderBoardTable = dynamic(() => import('src/components/Leaderboard/LeaderBoardTable'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const RankCard = dynamic(() => import('src/components/Leaderboard/RankCard'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface Props {
	className?: string;
	network: string;
}

const Leaderboard = ({ network, className }: Props) => {
	const dispatch = useDispatch();
	const [leaderboardData, setLeaderboardData] = useState<any>([]);
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();

	useEffect(() => {
		const fetchAndSetNetwork = async () => {
			dispatch(setNetwork(network));

			if (router.isReady) {
				const { data, error } = await nextApiClientFetch<LeaderboardResponse>('api/v1/leaderboard', { page: 1 });
				if (data) {
					setLeaderboardData(data?.data.slice(0, 3));
				}
				if (error) {
					console.log(error);
				}
			}
		};

		fetchAndSetNetwork();
	}, [dispatch, network, router.isReady]);

	return (
		<section className={`${className}`}>
			<div
				className='h-[122px] w-full rounded-[20px] py-6'
				style={{ background: 'var(--Blue-Linear, linear-gradient(358deg, #262323 31.71%, #1D2182 136.54%))' }}
			>
				<div className='-ml-[236px] flex justify-center px-4'>
					<TrophyIcon className='trophy-icon -mt-[92px] ml-[190px] md:ml-0' />
					<div className={`${dmSans.className} ${dmSans.variable} relative ml-auto flex flex-col items-start md:ml-0 md:mt-2 md:items-center`}>
						<h1 className=' m-0 flex items-center justify-center p-0 text-2xl font-semibold text-white md:text-[40px]'>Leaderboard</h1>
						<p className='m-0 mt-2 flex items-center justify-center p-0 text-sm text-white md:text-base'>
							Find your rank in {network?.charAt(0)?.toUpperCase() + network?.slice(1)} ecosystem
						</p>
					</div>
				</div>
			</div>
			<div className='rank-cards-desktop -ml-1.5 mt-8 flex w-full items-center justify-center'>
				{leaderboardData[1] && (
					<RankCard
						key={2}
						place={2}
						data={leaderboardData[1]}
						theme={theme}
						type='secondary'
					/>
				)}

				{leaderboardData[0] && (
					<RankCard
						key={1}
						place={1}
						data={leaderboardData[0]}
						theme={theme}
						type='primary'
					/>
				)}

				{leaderboardData[2] && (
					<RankCard
						key={3}
						place={3}
						data={leaderboardData[2]}
						theme={theme}
						type='secondary'
					/>
				)}
			</div>
			<div className='rank-cards-mobile hidden w-full items-center justify-center'>
				{leaderboardData[0] && (
					<RankCard
						key={1}
						place={1}
						data={leaderboardData[0]}
						theme={theme}
						type='primary'
						className='primary-rank-card'
					/>
				)}
				{leaderboardData[1] && (
					<RankCard
						key={2}
						place={2}
						data={leaderboardData[1]}
						theme={theme}
						type='secondary'
						className='secondary-rank-card'
					/>
				)}

				{leaderboardData[2] && (
					<RankCard
						key={3}
						place={3}
						data={leaderboardData[2]}
						theme={theme}
						type='secondary'
						className='secondary-rank-card'
					/>
				)}
			</div>

			<LeaderBoardTable
				theme={theme}
				className='mt-5'
			/>
		</section>
	);
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);
	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	if (network != 'polkadot') {
		return {
			props: {},
			redirect: {
				destination: isOpenGovSupported(network) ? '/opengov' : '/'
			}
		};
	}

	return { props: { network } };
};

export default styled(Leaderboard)`
	@media (max-width: 1290px) and (min-width: 768px) {
		.rank-cards-mobile {
			display: flex !important;
			flex-direction: column !important;
			transform: scale(1.2) !important;
			margin-top: 100px !important;
			margin-bottom: 60px !important;
			margin-left: -4px !important;
		}
		.secondary-rank-card {
			transform: scale(1.15) !important;
			margin-bottom: 40px !important;
			margin-left: 0px !important;
		}
		.primary-rank-card {
			margin-left: 0px !important;
			margin-bottom: 24px !important;
		}
		.rank-cards-desktop {
			display: none !important;
		}
	}
	@media (max-width: 767px) and (min-width: 319px) {
		.trophy-icon {
			transform: scale(0.7);
			// margin-left: 180px !important;
		}
		.rank-cards-mobile {
			display: flex !important;
			flex-direction: column !important;
			transform: scale(0.75) !important;
			margin-top: -64px !important;
			margin-bottom: 36px !important;
			margin-left: -4px !important;
		}
		.secondary-rank-card {
			transform: scale(1.15) !important;
			margin-bottom: 40px !important;
			margin-left: 0px !important;
		}
		.primary-rank-card {
			margin-left: 0px !important;
			margin-bottom: 24px !important;
		}
		.rank-cards-desktop {
			display: none !important;
		}
	}
`;
