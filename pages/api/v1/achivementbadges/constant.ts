import { MessageType } from '~src/auth/types';
import { IDelegationStats } from '../delegations/get-delegation-stats';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import BN from 'bn.js';
import { getWSProvider } from '~src/global/achievementbadges';
import { ApiPromise, WsProvider } from '@polkadot/api';

export const GET_ACTIVE_VOTER = `query ActiveVoterQuery($voterAddresses: [String!], $startDate: DateTime!) {
        flattenedConvictionVotes(
            where: { voter_in: $voterAddresses, removedAtBlock_isNull: true, createdAt_gte: $startDate }
        ) {
            balance {
                ... on StandardVoteBalance {
                    value
                }
                ... on SplitVoteBalance {
                    aye
                    nay
                    abstain
                }
            }
            lockPeriod
            proposalIndex
            createdAt
        }
    }`;

export const GET_POPULAR_DELEGATE = `query PopularDelegateQuery($delegateAddresses: [String!]) {
        votingDelegations(where: { to_in: $delegateAddresses}) {
            to
            type
            balance
        }
    }`;

export const GET_PROPOSAL_COUNT = `query ProposalCountQuery($startDate: DateTime!) {
    proposalsConnection(where: { createdAt_gte: $startDate, type_in: [ReferendumV2, Referendum] }, orderBy: id_DESC) {
        totalCount
    }
}`;

export async function getDelegationStats(network: string): Promise<{ data: IDelegationStats }> {
	const { data, error } = await nextApiClientFetch<IDelegationStats | MessageType>(`/api/v1/delegations/get-delegation-stats?network=${network}`);
	if (error) {
		throw new Error(error);
	}
	return { data: data as IDelegationStats };
}

export const badgeNames = ['Decentralised Voice', 'Fellow', 'Council Member', 'Active Voter', 'Whale', 'Steadfast Commentor', 'GM Voter', 'Popular Delegate'];

export async function getTotalSupply(network: string): Promise<BN> {
	const wsProviderUrl = getWSProvider(network);

	if (!wsProviderUrl) {
		throw new Error(`WebSocket provider URL not found for network: ${network}`);
	}

	const wsProvider = new WsProvider(wsProviderUrl);
	const api = await ApiPromise.create({ provider: wsProvider });

	try {
		const totalIssuance = await api.query.balances.totalIssuance();
		const inactiveIssuance = await api.query.balances.inactiveIssuance();
		return new BN(totalIssuance.toString()).sub(new BN(inactiveIssuance.toString()));
	} catch (error) {
		console.error('Failed to fetch total supply:', error);
		throw error;
	} finally {
		await api.disconnect();
	}
}
