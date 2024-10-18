// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { BN } from 'bn.js';
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { bountyStatus } from '~src/global/statuses';
import { GET_ALL_BOUNTIES_WITHOUT_PAGINATION, GET_ALL_CHILD_BOUNTIES_BY_PARENT_INDEX } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { EBountiesStatuses, IBountyListing } from '~src/components/Bounties/BountiesListing/types/types';
import getEncodedAddress from '~src/util/getEncodedAddress';
import getBountiesCustomStatuses from '~src/util/getBountiesCustomStatuses';
import dayjs from 'dayjs';

interface ISubsquidBounty {
	proposer: string;
	index: number;
	status: string;
	reward: string;
	payee: string;
	curator: string;
	createdAt: string;
}

interface IRes {
	activeBounties: {
		amount: string;
		count: number;
	};
	allBounties: {
		amount: string;
		count: number;
	};
	childBounties: {
		count: number;
		totalAmount: string;
		unclaimedAmount: string;
	};

	lastSixMonthGraphData: { [key: string]: string } | null;
}

const ZERO_BN = new BN(0);

function sumRewardsByMonth(proposals: { createdAt: string; reward: string }[]) {
	const sixMonthsAgo = dayjs().subtract(6, 'month');

	const rewardsByMonth: { [key: string]: string } = {};

	proposals.forEach((proposal) => {
		const createdAt = dayjs(proposal?.createdAt);
		if (createdAt.isAfter(sixMonthsAgo)) {
			const month = dayjs(proposal.createdAt).format('YYYY-MM');
			const reward = new BN(proposal?.reward || '0');

			if (rewardsByMonth[month]) {
				rewardsByMonth[month] = reward.add(new BN(rewardsByMonth[month]) || ZERO_BN).toString();
			} else {
				rewardsByMonth[month] = reward.toString();
			}
		}
	});

	return rewardsByMonth;
}

const handler: NextApiHandler<IRes | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);

	const { userAddress } = req.body;

	try {
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		if (!userAddress?.length) return res.status(400).json({ message: messages.INVALID_PARAMS });

		const allChildBounties: { createdAt: string; reward: string }[] = [];

		const resObj: IRes = {
			activeBounties: {
				amount: '0',
				count: 0
			},
			allBounties: {
				amount: '0',
				count: 0
			},
			childBounties: {
				count: 0,
				totalAmount: '0',
				unclaimedAmount: '0'
			},
			lastSixMonthGraphData: null
		};

		const encodedCuratorAddress = getEncodedAddress(userAddress, network);

		const subsquidBountiesRes = await fetchSubsquid({
			network,
			query: GET_ALL_BOUNTIES_WITHOUT_PAGINATION,
			variables: {
				curator_eq: encodedCuratorAddress
			}
		});

		const subsquidBountiesData = subsquidBountiesRes?.data?.bounties || [];

		const bountiesPromises = subsquidBountiesData.map(async (subsquidBounty: ISubsquidBounty) => {
			const subsquidChildBountiesRes = await fetchSubsquid({
				network,
				query: GET_ALL_CHILD_BOUNTIES_BY_PARENT_INDEX,
				variables: {
					curator_eq: encodedCuratorAddress,
					parentBountyIndex_eq: subsquidBounty?.index
				}
			});

			const subsquidChildBountyData = subsquidChildBountiesRes?.data?.proposals || [];

			let claimedAmount = ZERO_BN;
			const totalChildBountiesCount = 0;

			subsquidChildBountyData.map((childBounty: { status: string; reward: string; curator: string; createdAt: string }) => {
				const amount = new BN(childBounty?.reward || 0);

				if ([bountyStatus.CLAIMED].includes(childBounty?.status)) {
					claimedAmount = claimedAmount.add(amount);
					if (subsquidBounty?.curator === childBounty?.curator) {
						allChildBounties?.push({ createdAt: childBounty?.createdAt, reward: childBounty?.reward || '0' });
					}
				} else {
					resObj.childBounties.unclaimedAmount = new BN(resObj?.activeBounties?.amount || '0').add(new BN(childBounty?.reward || '0')).toString();
				}
				resObj.childBounties.totalAmount = new BN(resObj?.activeBounties?.amount || '0').add(new BN(childBounty?.reward || '0')).toString();

				resObj.childBounties.count += 1;
			});

			const payload: IBountyListing = {
				categories: [],
				claimedAmount: claimedAmount.toString(),
				createdAt: subsquidBounty?.createdAt,
				curator: subsquidBounty?.curator,
				index: subsquidBounty.index,
				payee: subsquidBounty?.payee,
				proposer: subsquidBounty?.proposer,
				reward: subsquidBounty?.reward,
				source: 'polkassembly',
				status: subsquidBounty?.status,
				title: '',
				totalChildBountiesCount: totalChildBountiesCount || 0
			};

			return payload;
		});

		const bountiesResults = await Promise.allSettled(bountiesPromises);

		const bounties: IBountyListing[] = [];

		bountiesResults?.map((bounty) => {
			if (bounty.status == 'fulfilled') {
				bounties.push(bounty?.value);
			}
		});

		resObj.lastSixMonthGraphData = sumRewardsByMonth(allChildBounties) || null;

		bounties?.map((bounty) => {
			if (getBountiesCustomStatuses(EBountiesStatuses.ACTIVE).includes(bounty?.status)) {
				resObj.activeBounties.count += 1;
				resObj.activeBounties.amount = new BN(resObj?.activeBounties?.amount || '0').add(new BN(bounty?.reward || '0')).toString();
			}

			resObj.allBounties.count += 1;
			resObj.allBounties.amount = new BN(resObj?.allBounties?.amount || '0').add(new BN(bounty?.reward || '0')).toString();
		});

		return res.status(200).json(resObj);
	} catch (error) {
		return res.status(500).json({ message: error || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
