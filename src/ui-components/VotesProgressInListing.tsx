// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { formatBalance } from '@polkadot/util';
import { Progress, Skeleton, Tooltip } from 'antd';
import BN from 'bn.js';
import { poppins } from 'pages/_app';
import { useEffect, useState } from 'react';
import { useApiContext, useNetworkContext } from '~src/context';
import { chainProperties } from '~src/global/networkConstants';
import { ProposalType } from '~src/global/proposalType';
import { GET_TOTAL_VOTES_COUNT, GET_VOTES_WITH_LIMIT_IS_NULL_TRUE } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import formatBnBalance from '~src/util/formatBnBalance';
import { formatedBalance } from '~src/util/formatedBalance';
import debounceGetReferendumVotesFn from '~src/util/getReferendumVotes';

const ZERO = new BN(0);

interface Props{
tally: any;
onchainId?: number | string | null;
status?: string | null ;
proposalType?: ProposalType;
index:number;
}

const VotesProgressInListing = ({ tally, index, onchainId,status, proposalType }:Props) => {
	const { network } = useNetworkContext();
	const  { api, apiReady } = useApiContext();
	const unit =`${chainProperties[network]?.tokenSymbol}`;
	const [tallyData, setTallyData] = useState({
		ayes: ZERO || 0,
		nays: ZERO || 0
	});

	const [loading, setLoading] = useState<boolean>(true);
	const bnToIntBalance = function (bn: BN): number{
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const ayeVotesNumber =  bnToIntBalance(tallyData.ayes || ZERO);
	const totalVotesNumber = bnToIntBalance(tallyData.ayes?.add(tallyData.nays|| ZERO) || ZERO);
	const ayePercent = ayeVotesNumber/totalVotesNumber*100;
	const nayPercent = 100 - ayePercent;
	const isAyeNaN = isNaN(ayePercent);
	const isNayNaN = isNaN(nayPercent);

	const getReferendumVoteInfo = async() => {
		if(!onchainId) return;
		const referendumInfo = await debounceGetReferendumVotesFn(network, onchainId);
		if(!referendumInfo)return;
		setLoading(true);
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
		}else if(!referendumInfo.voteInfoError && referendumInfo.voteInfoData && referendumInfo.voteInfoData.data && referendumInfo.voteInfoData.data.info) {
			const info = referendumInfo.voteInfoData.data.info;

			const voteInfo = {
				ayes : ZERO,
				nays: ZERO
			};

			voteInfo.ayes = new BN(info.aye_amount);
			voteInfo.nays = new BN(info.nay_amount);

			setTallyData(voteInfo);
			setLoading(false);
		}
	};

	const getReferendumV2VoteInfo = () => {
		if( !api || !apiReady || !status || !network) return;
		setLoading(true);
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		if(['confirmed', 'executed', 'timedout', 'cancelled', 'rejected'].includes(status.toLowerCase())){
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
					ayes: typeof parsedReferendumInfo.ongoing.tally.ayes === 'string' ? new BN(parsedReferendumInfo.ongoing.tally.ayes.slice(2), 'hex') : new BN(parsedReferendumInfo.ongoing.tally.ayes),
					nays: typeof parsedReferendumInfo.ongoing.tally.nays === 'string' ? new BN(parsedReferendumInfo.ongoing.tally.nays.slice(2), 'hex') : new BN(parsedReferendumInfo.ongoing.tally.nays)
				});
			} else {
				setTallyData({
					ayes: new BN(tally?.ayes || 0, 'hex'),
					nays: new BN(tally?.nays || 0, 'hex')
				});
			}
			setLoading(false);
		})();
	};

	useEffect(() => {
		if(proposalType === ProposalType.REFERENDUMS){
			getReferendumVoteInfo();
		}
		else{
			getReferendumV2VoteInfo();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	return loading ? <Skeleton.Button active={loading}/>
		: <>
			<div className='max-xs:hidden'>
				<Tooltip color='#575255' overlayClassName='max-w-none' title={<div className={`flex flex-col whitespace-nowrap text-xs gap-1 p-1.5 ${poppins.className} ${poppins.variable}`}>
					<span>Aye = {formatedBalance(tallyData.ayes.toString() || '0', unit)} {unit} ({Math.round(isAyeNaN ? 50 : ayePercent)}%) </span>
					<span>Nay = {formatedBalance(tallyData.nays.toString() || '0', unit)} {unit} ({Math.round(isNayNaN ? 50 : nayPercent)}%) </span>
				</div>}>
					<div>
						<Progress size={30} percent={50} success={{ percent: Math.round((isAyeNaN? 50: ayePercent)/2) }} type="circle" className='progress-rotate mt-3' gapPosition='bottom' strokeWidth={16} trailColor={((index%2) === 0) ? '#fbfbfc' : 'white' } />
					</div>
				</Tooltip>
			</div>
			<div className='xs:hidden'>
				<Progress size={30} percent={50} success={{ percent: Math.round((isAyeNaN? 50: ayePercent)/2) }} type="circle" className='progress-rotate mt-3' gapPosition='bottom' strokeWidth={16} trailColor={((index%2) === 0) ? '#fbfbfc' : 'white' } />
			</div>
		</>
	;
};
export default VotesProgressInListing;