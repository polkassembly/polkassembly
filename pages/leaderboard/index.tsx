// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import TrophyIcon from '~assets/TrophyCup.svg';
import { useTheme } from 'next-themes';
import LeaderBoardTable from './LeaderBoardTable';
import { GetServerSideProps } from 'next';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import { useRouter } from 'next/router';
import { LeaderboardResponse } from 'pages/api/v1/leaderboard';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import RankCard from './RankCard';

interface Props {
	className?: string;
	network: string;
}

const Leaderboard = ({ network }: Props) => {
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
		<section>
			<div
				className='h-[122px] w-full rounded-[20px] py-6'
				style={{ background: 'var(--Blue-Linear, linear-gradient(358deg, #262323 31.71%, #1D2182 136.54%))' }}
			>
				<TrophyIcon className='absolute right-[764px] top-[56px] z-10' />
				<h1 className='m-0 flex items-center justify-center p-0 text-[40px] font-semibold text-white'>Leaderboard</h1>
				<p className='m-0 flex items-center justify-center p-0 text-sm text-white'>Find your rank in {network} ecosystem</p>
			</div>
			<div className='mt-8 flex w-full items-center justify-center'>
				{leaderboardData[1] && (
					<RankCard
						key={2}
						place={2}
						data={leaderboardData[1]}
						theme={theme}
						strokeWidth='336px'
						type='secondary'
					/>
				)}

				{leaderboardData[0] && (
					<RankCard
						key={1}
						place={1}
						data={leaderboardData[0]}
						theme={theme}
						strokeWidth='86px'
						type='primary'
					/>
				)}

				{leaderboardData[2] && (
					<RankCard
						key={3}
						place={3}
						data={leaderboardData[2]}
						theme={theme}
						strokeWidth='336px'
						type='secondary'
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

	return { props: { network } };
};

export default Leaderboard;
