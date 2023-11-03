// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { formatBalance } from '@polkadot/util';
import { Progress, Skeleton, Tooltip } from 'antd';
import BN from 'bn.js';
import { poppins } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import { useApiContext } from '~src/context';
import { chainProperties } from '~src/global/networkConstants';
import { ProposalType, TSubsquidProposalType, getSubsquidProposalType } from '~src/global/proposalType';
import { GET_TOTAL_VOTES_COUNT, GET_VOTES_WITH_LIMIT_IS_NULL_TRUE } from '~src/queries';
import { useNetworkSelector } from '~src/redux/selectors';
import fetchSubsquid from '~src/util/fetchSubsquid';
import formatBnBalance from '~src/util/formatBnBalance';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';

const ZERO = new BN(0);

interface Props {
	tally: any;
	onchainId?: number | string | null;
	status?: string | null;
	proposalType?: ProposalType | string;
	index: number;
	votesData: any;
}

const VotesProgressInListing = ({ tally, index, onchainId, status, proposalType, votesData }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const [tallyData, setTallyData] = useState({
		ayes: ZERO,
		nays: ZERO
	});

	const [loading, setLoading] = useState<boolean>(true);
	const [tallyAyeNayVotes, setTallyAyeNayVotes] = useState({
		ayes: 0,
		nays: 0
	});
	const { ayes, nays } = tallyAyeNayVotes;
	const bnToIntBalance = function (bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const usingTallyForAyeNayVotes = [getSubsquidProposalType(ProposalType.FELLOWSHIP_REFERENDUMS), ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(
		proposalType as TSubsquidProposalType
	);

	const ayeVotesNumber = usingTallyForAyeNayVotes ? ayes : bnToIntBalance(tallyData.ayes || ZERO);
	const totalVotesNumber = usingTallyForAyeNayVotes ? ayes + nays : bnToIntBalance(tallyData.ayes?.add(tallyData.nays || ZERO) || ZERO);
	const ayePercent = (ayeVotesNumber / totalVotesNumber) * 100;
	const nayPercent = 100 - ayePercent;
	const isAyeNaN = isNaN(ayePercent);
	const isNayNaN = isNaN(nayPercent);
	const getReferendumVoteInfo = async () => {
		if (!onchainId || !votesData) return;
		if (network === 'cere') {
			(async () => {
				const res = await fetchSubsquid({
					network,
					query: GET_TOTAL_VOTES_COUNT,
					variables: {
						index_eq: onchainId,
						type_eq: 'Referendum'
					}
				});
				const totalCount = res?.data?.votesConnection?.totalCount;
				if (totalCount) {
					const res = await fetchSubsquid({
						network,
						query: GET_VOTES_WITH_LIMIT_IS_NULL_TRUE,
						variables: {
							index_eq: onchainId,
							limit: totalCount,
							type_eq: 'Referendum'
						}
					});
					if (res && res.data && res.data.votes && Array.isArray(res.data.votes)) {
						const voteInfo = {
							ayes: ZERO,
							nays: ZERO
						};
						res.data.votes.forEach((vote: any) => {
							if (vote) {
								const { balance, lockPeriod, decision } = vote;
								if (decision === 'yes') {
									if (lockPeriod === 0) {
										voteInfo.ayes = voteInfo.ayes.add(new BN(balance.value).div(new BN(10)));
									} else {
										voteInfo.ayes = voteInfo.ayes.add(new BN(balance.value).mul(new BN(lockPeriod)));
									}
								} else {
									if (lockPeriod === 0) {
										voteInfo.nays = voteInfo.nays.add(new BN(balance.value).div(new BN(10)));
									} else {
										voteInfo.nays = voteInfo.nays.add(new BN(balance.value).mul(new BN(lockPeriod)));
									}
								}
							}
						});
						setTallyData(voteInfo);
					}
				}
			})();
			setLoading(false);
		} else if (votesData && !votesData.error && votesData.data) {
			setLoading(true);

			const info = votesData.data;

			const voteInfo = {
				ayes: ZERO,
				nays: ZERO
			};

			voteInfo.ayes = new BN(info.aye_amount);
			voteInfo.nays = new BN(info.nay_amount);

			setTallyData(voteInfo);
			setLoading(false);
		}
	};

	const getReferendumV2VoteInfo = async () => {
		if (!api || !apiReady || !status || !network) return;

		if (usingTallyForAyeNayVotes) {
			setLoading(false);
			setTallyAyeNayVotes({
				ayes: Number(tally?.ayes),
				nays: Number(tally?.nays)
			});
		} else if ([ProposalType.COMMUNITY_PIPS].includes(proposalType as ProposalType)) {
			const pipId = onchainId;
			const voteInfo: any = await api.query.pips.proposalResult(pipId).then((data) => data.toJSON());
			if (voteInfo) {
				setTallyData({
					ayes: new BN(voteInfo.ayesStake) || ZERO,
					nays: new BN(voteInfo.naysStake) || ZERO
				});
			}
			setLoading(false);
		} else {
			setLoading(true);
			formatBalance.setDefaults({
				decimals: chainProperties[network].tokenDecimals,
				unit: chainProperties[network].tokenSymbol
			});

			if (['confirmed', 'executed', 'timedout', 'cancelled', 'rejected'].includes(status.toLowerCase())) {
				setTallyData({
					ayes: String(tally?.ayes).startsWith('0x') ? new BN(tally?.ayes || 0, 'hex') : new BN(tally?.ayes || 0),
					nays: String(tally?.nays).startsWith('0x') ? new BN(tally?.nays || 0, 'hex') : new BN(tally?.nays || 0)
				});
				setLoading(false);
				return;
			}

			(async () => {
				const referendumInfoOf = await api.query.referenda.referendumInfoFor(onchainId);
				const parsedReferendumInfo: any = referendumInfoOf.toJSON();
				if (parsedReferendumInfo?.ongoing?.tally) {
					setTallyData({
						ayes:
							typeof parsedReferendumInfo.ongoing.tally.ayes === 'string'
								? new BN(parsedReferendumInfo.ongoing.tally.ayes.slice(2), 'hex')
								: new BN(parsedReferendumInfo.ongoing.tally.ayes),
						nays:
							typeof parsedReferendumInfo.ongoing.tally.nays === 'string'
								? new BN(parsedReferendumInfo.ongoing.tally.nays.slice(2), 'hex')
								: new BN(parsedReferendumInfo.ongoing.tally.nays)
					});
				} else {
					setTallyData({
						ayes: new BN(tally?.ayes || 0, 'hex'),
						nays: new BN(tally?.nays || 0, 'hex')
					});
				}
				setLoading(false);
			})();
		}
	};

	useEffect(() => {
		if (proposalType === ProposalType.REFERENDUMS && network !== 'polymesh') {
			getReferendumVoteInfo();
		} else {
			(async () => {
				await getReferendumV2VoteInfo();
			})();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, votesData, network]);

	return loading ? (
		<Skeleton.Button active={loading} />
	) : (
		<>
			<div className='max-sm:hidden'>
				<Tooltip
					color='#575255'
					overlayClassName='max-w-none'
					title={
						<div className={`flex flex-col gap-1 whitespace-nowrap p-1.5 text-xs ${poppins.className} ${poppins.variable}`}>
							<span>
								Aye ={' '}
								{usingTallyForAyeNayVotes
									? ayes
									: formatUSDWithUnits(formatBnBalance(tallyData.ayes || '', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}{' '}
								({(isAyeNaN ? 50 : ayePercent).toFixed(2)}%){' '}
							</span>
							<span>
								Nay ={' '}
								{usingTallyForAyeNayVotes
									? nays
									: formatUSDWithUnits(formatBnBalance(tallyData.nays || '', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}{' '}
								({(isNayNaN ? 50 : nayPercent).toFixed(2)}%){' '}
							</span>
						</div>
					}
				>
					<div>
						<Progress
							size={30}
							percent={50}
							success={{ percent: (isAyeNaN ? 50 : ayePercent) / 2 }}
							type='circle'
							className='progress-rotate mt-3'
							gapPosition='bottom'
							strokeWidth={16}
							trailColor={index % 2 === 0 ? '#fbfbfc' : 'white'}
						/>
					</div>
				</Tooltip>
			</div>
			<div className='sm:hidden'>
				<Progress
					size={30}
					percent={50}
					success={{ percent: (isAyeNaN ? 50 : ayePercent) / 2 }}
					type='circle'
					className='progress-rotate mt-3'
					gapPosition='bottom'
					strokeWidth={16}
					trailColor={index % 2 === 0 ? '#fbfbfc' : 'white'}
				/>
			</div>
		</>
	);
};
export default VotesProgressInListing;
