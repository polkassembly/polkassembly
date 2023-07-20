// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { ApiPromise } from '@polkadot/api';
import { chainProperties } from '~src/global/networkConstants';
import type { Option, u32 } from '@polkadot/types';
import type { ITuple } from '@polkadot/types/types';
import {
	BlockNumber,
	EraIndex,
	LeasePeriod,
	LeasePeriodOf,
	ReferendumStatus,
	Scheduled,
	UnappliedSlash,
} from '@polkadot/types/interfaces';
import { QueryableModuleConsts } from '@polkadot/api/types';
import type { DeriveCollectiveProposal } from '@polkadot/api-derive/types';
import { PjsCalendarItem, PjsCalendarItemDuration } from '~src/types';

function generateCalendarItemDuration(
	network: string,
	blockNumber: number,
	duration: number,
	offset = 0,
): PjsCalendarItemDuration | void {
	const blockTime = chainProperties[network].blockTime;

	if (blockNumber >= 0) {
		const modifiedBlockNumber = blockNumber - offset;
		const blocksSpent = modifiedBlockNumber % duration;
		const blocksLeft = duration - blocksSpent;
		const startBlockNumber = modifiedBlockNumber - blocksSpent;
		const endBlockNumber = modifiedBlockNumber + blocksLeft;
		const timeSpent = blocksSpent * blockTime;
		const timeLeft = blocksLeft * blockTime;
		const startTimestamp = +new Date() - timeSpent;
		const endTimestamp = +new Date() + timeLeft;

		return {
			startDate: new Date(startTimestamp),
			endDate: new Date(endTimestamp),
			startBlockNumber,
			endBlockNumber,
			duration,
		};
	}
}

export async function fetchAuctionInfo(
	api: ApiPromise,
	network: string,
): Promise<PjsCalendarItem[]> {
	// End of auction period and calculated start.
	// Jaco:  End of the current parachain auction
	const calendarItems = [];

	const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
	const blockTime = chainProperties[network].blockTime;
	const endingPeriod = api.consts.auctions?.endingPeriod as u32;
	const leasePeriodPerSlot = api.consts.auctions
		?.leasePeriodsPerSlot as BlockNumber;
	const auctionInfo = (await api.query.auctions?.auctionInfo()) as Option<
		ITuple<[LeasePeriodOf, BlockNumber]>
	>;

	if (auctionInfo && auctionInfo.isSome) {
		const [leasePeriod, endBlock] = auctionInfo.unwrap();

		const startBlockNumber = endBlock?.toJSON() - endingPeriod?.toJSON();
		const endBlockNumber = endBlock?.toJSON() as number;
		const startTimestamp =
			+new Date() + blockTime * (startBlockNumber - blockNumber);
		const endTimestamp =
			+new Date() + blockTime * (endBlockNumber - blockNumber);

		const auctionItem: PjsCalendarItem = {
			network,
			type: 'parachainAuction',
			startDate: new Date(startTimestamp),
			endDate: new Date(endTimestamp),
			startBlockNumber,
			endBlockNumber,
			data: {
				leasePeriod: leasePeriod?.toJSON() as number,
				leasePeriodPerSlot:
					(leasePeriodPerSlot?.toJSON() as number) || 3,
			},
		};

		calendarItems.push(auctionItem);
	}
	return calendarItems;
}

export async function fetchCouncilMotions(
	api: ApiPromise,
	network: string,
): Promise<PjsCalendarItem[]> {
	// Jaco:  Voting ends on council motion {{id}}
	const calendarItems: any[] = [];

	const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
	const blockTime = chainProperties[network].blockTime;
	const councilMotions: DeriveCollectiveProposal[] =
		await api.derive.council?.proposals();

	if (councilMotions) {
		councilMotions.forEach(({ hash, votes }) => {
			if (votes) {
				const endBlockNumber = votes.end?.toJSON() as number;
				const endTimestamp =
					+new Date() + blockTime * (endBlockNumber - blockNumber);

				const item: PjsCalendarItem = {
					network,
					type: 'councilMotion',
					endDate: new Date(endTimestamp),
					endBlockNumber,
					data: {
						hash: hash.toHex(),
						votes: votes,
					},
				};
				calendarItems.push(item);
			}
		});
	}

	return calendarItems;
}

export async function fetchDemocracyDispatches(
	api: ApiPromise,
	network: string,
): Promise<PjsCalendarItem[]> {
	// Jaco:  'Enactment of the result of referendum {{}}'

	const calendarItems: any[] = [];

	const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
	const blockTime = chainProperties[network].blockTime;
	const dispatches = await api.derive.democracy?.dispatchQueue();

	if (dispatches) {
		dispatches.forEach(({ at, index }) => {
			const endBlockNumber = at?.toJSON() as unknown as number;
			const endTimestamp =
				+new Date() + blockTime * (endBlockNumber - blockNumber);

			const item: PjsCalendarItem = {
				network,
				type: 'democracyDispatch',
				endDate: new Date(endTimestamp),
				endBlockNumber,
				data: {
					index: index?.toJSON() as number,
				},
			};
			calendarItems.push(item);
		});
	}

	return calendarItems;
}

export async function fetchReferendums(
	api: ApiPromise,
	network: string,
): Promise<PjsCalendarItem[]> {
	// JACO: referendumDispatch  'Potential dispatch of referendum (if passed)'
	// JACO: referendumVote  Voting ends for referendum'

	const calendarItems: any[] = [];

	const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
	const blockTime = chainProperties[network].blockTime;
	const referendums = await api.derive.democracy?.referendums();

	if (referendums) {
		referendums.forEach(({ index, status }) => {
			const endBlock = (
				status as ReferendumStatus
			).end?.toJSON() as number;

			const referendumEndTimestamp =
				+new Date() + blockTime * (endBlock - blockNumber);
			const enactEndBlock =
				endBlock +
				((status as ReferendumStatus).delay?.toJSON() as number);
			const enactEndTimestamp =
				+new Date() + blockTime * (enactEndBlock - blockNumber);
			const voteEndBlock = endBlock - 1;
			const voteEndTimestamp =
				+new Date() + blockTime * (voteEndBlock - blockNumber);

			const enactItem: PjsCalendarItem = {
				network,
				type: 'referendumDispatch',
				endBlockNumber: enactEndBlock,
				endDate: new Date(enactEndTimestamp),
				data: {
					index,
					referendum: {
						endDate: new Date(referendumEndTimestamp),
						endBlock: endBlock,
					},
				},
			};
			calendarItems.push(enactItem);

			const voteItem: PjsCalendarItem = {
				network,
				type: 'referendumVote',
				endBlockNumber: voteEndBlock,
				endDate: new Date(voteEndTimestamp),
				data: {
					index,
					isPending: true,
					referendum: {
						endDate: new Date(referendumEndTimestamp),
						endBlock: endBlock,
					},
				},
			};
			calendarItems.push(voteItem);
		});
	}
	return calendarItems;
}

export async function fetchStakingInfo(
	api: ApiPromise,
	network: string,
): Promise<PjsCalendarItem[]> {
	// JACO:  stakingEpoch   Start of a new staking session
	// JACO:  stakingEra     Start of a new staking era
	// JACO:  stakingSlash   Application of slashes from era

	const calendarItems: any[] = [];

	const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
	const blockTime = chainProperties[network].blockTime;
	const sessionInfo = await api.derive.session?.progress();

	if (sessionInfo) {
		const sessionLength = sessionInfo.sessionLength?.toJSON() as number;

		if (sessionLength > 1) {
			const activeEra = sessionInfo.activeEra?.toJSON() as number;
			const prevEra = activeEra - 1;
			const nextEra = activeEra + 1;
			const eraLength = sessionInfo.eraLength?.toJSON() as number;
			const eraProgress = sessionInfo.eraProgress?.toJSON() as number;
			const eraBlocksLeft = eraLength - eraProgress;
			const eraEndBlockNumber = eraBlocksLeft + blockNumber;
			const eraEndTimestamp = +new Date() + blockTime * eraBlocksLeft;

			const eraItem: PjsCalendarItem = {
				network,
				type: 'stakingEra',
				startBlockNumber: eraEndBlockNumber,
				startDate: new Date(eraEndTimestamp),
				data: {
					index: nextEra,
				},
			};

			calendarItems.push(eraItem);

			const sessionProgress =
				sessionInfo.sessionProgress?.toJSON() as number;
			const sessionBlocksLeft = sessionLength - sessionProgress;
			const sessionEndBlockNumber = sessionBlocksLeft + blockNumber;
			const sessionEndTimestamp =
				+new Date() + blockTime * sessionBlocksLeft;
			const nextSessionIndex =
				(sessionInfo.currentIndex?.toJSON() as number) + 1;

			const epochItem: PjsCalendarItem = {
				network,
				type: 'stakingEpoch',
				endBlockNumber: sessionEndBlockNumber,
				endDate: new Date(sessionEndTimestamp),
				data: {
					index: nextSessionIndex,
				},
			};

			calendarItems.push(epochItem);

			let slashDeferDuration: number | undefined;
			let slashDuration: number | undefined;

			try {
				slashDeferDuration = (
					(await Promise.resolve(
						api.consts.staking?.slashDeferDuration,
					)) as u32
				)?.toJSON() as number;

				if (slashDeferDuration) {
					slashDuration = slashDeferDuration * eraLength;
				}
			} catch (e) {
				console.error(e);
			}

			if (slashDuration !== undefined) {
				const unappliedSlashes =
					(await api.query.staking?.unappliedSlashes.entries()) as [
						{ args: [EraIndex] },
						UnappliedSlash[],
					][];
				if (unappliedSlashes) {
					unappliedSlashes.forEach(([{ args }, values]) => {
						if (values.length) {
							const slashEraIndex = args[0]?.toJSON() as number;
							const slashBlocksProgress =
								(prevEra - slashEraIndex) * eraLength +
								eraProgress;
							const slashBlocksLeft =
								(slashDuration as number) - slashBlocksProgress;
							const slashEndBlockNumber =
								slashBlocksLeft + blockNumber;
							const slashEndTimestamp =
								+new Date() + blockTime * slashBlocksLeft;

							const slashItem: PjsCalendarItem = {
								network,
								type: 'stakingSlash',
								endBlockNumber: slashEndBlockNumber,
								endDate: new Date(slashEndTimestamp),
								data: {
									index: slashEraIndex,
								},
							};
							calendarItems.push(slashItem);
						}
					});
				}
			}
		}
	}

	return calendarItems;
}

export async function fetchScheduled(
	api: ApiPromise,
	network: string,
): Promise<PjsCalendarItem[]> {
	const calendarItems: any[] = [];

	const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
	const blockTime = chainProperties[network].blockTime;

	const scheduled = (await api.query.scheduler?.agenda.entries()) as [
		{ args: [BlockNumber] },
		Option<Scheduled>[],
	][];

	if (scheduled) {
		scheduled.forEach(([key, scheduledOptions]) => {
			const scheduledBlockNumber = key.args[0]?.toJSON() as number;
			const blocksLeft = scheduledBlockNumber - blockNumber;
			const endTimestamp = +new Date() + blockTime * blocksLeft;

			scheduledOptions
				.map((scheduledOption) => scheduledOption.unwrap())
				.forEach(({ maybeId }) => {
					const idOrNull = maybeId.unwrapOr(null);
					const id = idOrNull
						? idOrNull.isAscii
							? idOrNull.toUtf8()
							: idOrNull.toHex()
						: null;

					const item: PjsCalendarItem = {
						network,
						type: 'scheduler',
						endBlockNumber: scheduledBlockNumber,
						endDate: new Date(endTimestamp),
						data: {
							id,
						},
					};
					calendarItems.push(item);
				});
		});
	}

	return calendarItems;
}

export async function fetchCouncilElection(
	api: ApiPromise,
	network: string,
): Promise<PjsCalendarItem[]> {
	const calendarItems: any[] = [];

	const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();

	const responses = await Promise.allSettled([
		api.consts.elections,
		api.consts.phragmenElection,
		api.consts.electionsPhragmen,
	]);
	const response = responses.find(
		(r) => r.status === 'fulfilled' && r.value,
	) as PromiseFulfilledResult<QueryableModuleConsts>;
	if (!response) {
		return [];
	}

	const duration = response.value?.termDuration as u32;

	const itemDuration = generateCalendarItemDuration(
		network,
		blockNumber,
		duration?.toJSON() as number,
	);

	if (itemDuration && itemDuration.endBlockNumber) {
		const item: PjsCalendarItem = Object.assign(
			{
				network,
				type: 'councilElection',
				data: {
					electionRound: Math.floor(
						(itemDuration.startBlockNumber as number) /
							(itemDuration.duration as number),
					),
				},
			},
			itemDuration,
		);

		calendarItems.push(item);
	}

	return calendarItems;
}

export async function fetchDemocracyLaunch(
	api: ApiPromise,
	network: string,
): Promise<PjsCalendarItem[]> {
	const calendarItems: any[] = [];

	const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();

	const duration = api.consts.democracy?.launchPeriod as u32;
	const itemDuration = generateCalendarItemDuration(
		network,
		blockNumber,
		duration?.toJSON() as number,
	);

	if (itemDuration && itemDuration.endBlockNumber) {
		const item: PjsCalendarItem = Object.assign(
			{
				network,
				type: 'democracyLaunch',
				data: {
					launchPeriod: Math.floor(
						(itemDuration.startBlockNumber as number) /
							(itemDuration.duration as number),
					),
				},
			},
			itemDuration,
		);

		calendarItems.push(item);
	}

	return calendarItems;
}

export async function fetchTreasurySpend(
	api: ApiPromise,
	network: string,
): Promise<PjsCalendarItem[]> {
	const calendarItems: any[] = [];

	const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
	const duration = api.consts.treasury?.spendPeriod as u32;
	const itemDuration = generateCalendarItemDuration(
		network,
		blockNumber,
		duration?.toJSON() as number,
	);

	if (itemDuration && itemDuration.endBlockNumber) {
		const item: PjsCalendarItem = Object.assign(
			{
				network,
				type: 'treasurySpend',
				data: {
					spendingPeriod: Math.floor(
						(itemDuration.startBlockNumber as number) /
							(itemDuration.duration as number),
					),
				},
			},
			itemDuration,
		);

		calendarItems.push(item);
	}

	return calendarItems;
}

export async function fetchSocietyRotate(
	api: ApiPromise,
	network: string,
): Promise<PjsCalendarItem[]> {
	const calendarItems: any[] = [];

	const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
	const duration = api.consts.society?.rotationPeriod as u32;
	if (!duration) return [];
	const itemDuration = generateCalendarItemDuration(
		network,
		blockNumber,
		duration?.toJSON() as number,
	);

	if (itemDuration) {
		const item: PjsCalendarItem = Object.assign(
			{
				network,
				type: 'societyRotate',
				data: {
					rotateRound: Math.floor(
						(itemDuration.startBlockNumber as number) /
							(itemDuration.duration as number),
					),
				},
			},
			itemDuration,
		);

		calendarItems.push(item);
	}

	return calendarItems;
}

export async function fetchSocietyChallenge(
	api: ApiPromise,
	network: string,
): Promise<PjsCalendarItem[]> {
	const calendarItems: any[] = [];

	const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
	const duration = api.consts.society?.challengePeriod as u32;
	const itemDuration = generateCalendarItemDuration(
		network,
		blockNumber,
		duration?.toJSON() as number,
	);

	if (itemDuration && itemDuration.endBlockNumber) {
		const item: PjsCalendarItem = Object.assign(
			{
				network,
				type: 'societyChallenge',
				data: {
					challengePeriod: Math.floor(
						(itemDuration.startBlockNumber as number) /
							(itemDuration.duration as number),
					),
				},
			},
			itemDuration,
		);

		calendarItems.push(item);
	}

	return calendarItems;
}

export async function fetchParachainLease(
	api: ApiPromise,
	network: string,
): Promise<PjsCalendarItem[]> {
	const calendarItems: any[] = [];

	const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
	const duration = api.consts.slots?.leasePeriod as LeasePeriod;
	const offset = api.consts.slots?.leaseOffset as u32;
	const itemDuration = generateCalendarItemDuration(
		network,
		blockNumber,
		duration?.toJSON() as number,
		offset?.toJSON() as number,
	);

	if (itemDuration && itemDuration.endBlockNumber) {
		const item: PjsCalendarItem = Object.assign(
			{
				network,
				type: 'parachainLease',
				data: {
					leasePeriod:
						Math.floor(
							(itemDuration.startBlockNumber as number) /
								(itemDuration.duration as number),
						) + 1,
				},
			},
			itemDuration,
		);

		calendarItems.push(item);
	}

	return calendarItems;
}
