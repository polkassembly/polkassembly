// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { GET_CALENDAR_EVENTS_BY_BLOCK } from '~src/queries';
import { ICalendarEvent } from '~src/types';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getSubSquareContentAndTitle } from '../posts/subsqaure/subsquare-content';
import { getFirestoreProposalType, getProposalTypeTitle, ProposalType } from '~src/global/proposalType';
import { redisGet, redisSetex } from '~src/auth/redis';
import { generateKey } from '~src/util/getRedisKeys';

const chunkArray = (arr: any[], chunkSize: number) => {
	const chunks = [];
	for (let i = 0; i < arr.length; i += chunkSize) {
		chunks.push(arr.slice(i, i + chunkSize));
	}
	return chunks;
};

const CHUNK_SIZE = 30;

const TTL_DURATION = 3600 * 1; // 1 Hours or 3600 seconds

const getSubSquareTitle = async (proposalType: string, network: string, index: number) => {
	const res: any = await getSubSquareContentAndTitle(proposalType, network, index);
	return res?.title || '';
};

const handler: NextApiHandler<ICalendarEvent[] | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const { startBlockNo, endBlockNo } = req.body;

		if (!startBlockNo || !endBlockNo) return res.status(400).json({ message: messages.INVALID_PARAMS });

		if (process.env.IS_CACHING_ALLOWED == '1') {
			const redisKey = generateKey({ endBlockNo, keyType: 'calendarEvents', network, startBlockNo });
			const redisData = await redisGet(redisKey);

			if (redisData) {
				return res.status(200).json(JSON.parse(redisData));
			}
		}

		const subsquidEvents = await fetchSubsquid({
			network,
			query: GET_CALENDAR_EVENTS_BY_BLOCK,
			variables: { block_gte: startBlockNo, block_lt: endBlockNo }
		});

		const eventsData = subsquidEvents?.data?.proposals || [];

		if (!eventsData?.length) {
			if (process.env.IS_CACHING_ALLOWED == '1') {
				await redisSetex(generateKey({ endBlockNo, keyType: 'calendarEvents', network, startBlockNo }), TTL_DURATION, JSON.stringify(eventsData));
			}
			return res.status(200).json(eventsData);
		}

		const eventsByProposalType: { [key: string]: any[] } = {};

		eventsData?.map((event: any) => {
			const firestoreProposalType = getFirestoreProposalType(event?.type);
			if (firestoreProposalType) {
				eventsByProposalType[firestoreProposalType] = [...(eventsByProposalType[firestoreProposalType] || []), event];
			}
		});

		const events: ICalendarEvent[] = [];

		const allPromises = Object.entries(eventsByProposalType).map(async ([key, value]) => {
			const chunks = chunkArray(value, CHUNK_SIZE);

			const chunksPromises = chunks.map(async (chunk) => {
				const postsIndexes = chunk?.map((item) => item?.index);

				const firebasePostsDetails = await postsByTypeRef(network, key as ProposalType)
					.where('id', 'in', postsIndexes)
					.get();

				const firebasePostsData = firebasePostsDetails.docs.map((doc) => doc.data());

				const chunkPromises = chunk.map(async (subsquidEvent) => {
					const payload: ICalendarEvent = {
						createdAt: subsquidEvent?.createdAt,
						index: subsquidEvent?.index,
						parentBountyIndex: subsquidEvent?.parentBountyIndex,
						proposalType: key as ProposalType,
						proposer: subsquidEvent?.proposer,
						source: 'polkasembly',
						status: subsquidEvent?.status,
						statusHistory: subsquidEvent?.statusHistory,
						title: '',
						trackNo: subsquidEvent?.trackNumber
					};
					const firebasePost = firebasePostsData.find((post) => post.index === subsquidEvent.index);

					if (firebasePost?.title) {
						payload.title = firebasePost.title;
					} else {
						const title = await getSubSquareTitle(key as ProposalType, network, subsquidEvent.index);
						if (title) {
							payload.title = title;
							payload.source = 'subsquare';
						}
					}
					if (!payload.title?.length) {
						payload.title = `${key == ProposalType.REFERENDUM_V2 ? 'Open Gov' : getProposalTypeTitle(key as ProposalType) || ''} Proposal`;
					}
					events?.push(payload);
				});

				await Promise.allSettled(chunkPromises);
			});
			await Promise.allSettled(chunksPromises);
		});

		await Promise.allSettled(allPromises);

		if (process.env.IS_CACHING_ALLOWED == '1') {
			await redisSetex(generateKey({ endBlockNo, keyType: 'calendarEvents', network, startBlockNo }), TTL_DURATION, JSON.stringify(events));
		}

		return res.status(200).json(events);
	} catch (err) {
		return res.status(500).json({ message: err || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
