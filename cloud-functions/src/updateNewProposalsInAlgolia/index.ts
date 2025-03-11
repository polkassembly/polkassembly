import fetchSubsquid from '../utils/fetchSubsquid';
import { GET_NEW_OPENGOV_PROPOSALS } from '../queries';
import dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import { htmlOrMarkdownToText } from '../utils/htmlOrMarkdownToText';
import algoliasearch from 'algoliasearch';
import getSubstrateAddress from '../utils/getSubstrateAddress';
import { firestoreDB } from '..';

const logger = functions.logger;
const algoliaSupportedNetworks = ['kusama', 'polkadot', 'polkadex', 'cere', 'moonbeam', 'moonriver', 'moonbase'];

interface ProposalPayload {
	objectID: string;
	network: string;
	created_at: number;
	post_type: string;
	id: string;
	proposer: string;
	track_number: number;
	title?: string;
	parsed_content?: string;
	tags?: string[];
    content?: string;
}

async function fetchSubsquareData(network: string, proposalIndex: string) {
	try {
		logger.info(`Fetching Subsquare data for network: ${network}, proposal: ${proposalIndex}`);
		const response = await fetch(`https://${network}.subsquare.io/api/gov2/referendums/${proposalIndex}`);
		const data = await response.json();

		if (!data?.title && !data?.content) {
			logger.warn(`No title or content found in Subsquare data for ${network} proposal #${proposalIndex}`);
			return null;
		}

		let title = data.title || '';
		if (title.includes('[Root] Referendum #')) {
			title = title.replace(/\[Root\] Referendum #\d+: /, '');
		}

		return {
			title,
			content: data.content || '',
			parsed_content: htmlOrMarkdownToText(data.content || '') || data.content || ''
		};
	} catch (error) {
		logger.error(`Error fetching Subsquare data for ${network} proposal #${proposalIndex}:`, error);
		return null;
	}
}

async function updateFirestoreProposal(network: string, proposalIndex: string, data: any) {
	try {
		const docRef = firestoreDB
			.collection('networks')
			.doc(network)
			.collection('post_types')
			.doc('referendums_v2')
			.collection('posts')
			.doc(proposalIndex);

		await docRef.update({
			title: data.title || '',
			content: data.content || '',
			id: proposalIndex,
			proposer: getSubstrateAddress(data.proposer) || '',
			updated_at: new Date()
		});

		logger.info(`Successfully updated Firestore for ${network} proposal #${proposalIndex}`);
	} catch (error) {
		logger.error(`Error updating Firestore for ${network} proposal #${proposalIndex}:`, error);
		throw error;
	}
}

async function updateAlgoliaIndex(payload: ProposalPayload) {
	try {
		const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || '';
		const ALGOLIA_WRITE_API_KEY = process.env.ALGOLIA_WRITE_API_KEY || '';

		if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) {
			throw new Error('Algolia credentials not found');
		}

		const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
		const index = algoliaClient.initIndex('polkassembly_posts');

		// Remove content field before indexing
		if (payload.content) {
			delete payload.content;
		}

		await index.saveObject(payload);
		logger.info(`Successfully indexed in Algolia: ${payload.network} ${payload.post_type} #${payload.id}`);
	} catch (error) {
		logger.error(`Error indexing in Algolia: ${payload.network} ${payload.post_type} #${payload.id}:`, error);
		throw error;
	}
}

async function processProposal(network: string, proposal: any) {
	try {
		logger.info(`Processing proposal for ${network} #${proposal.index}`);

		const payload: ProposalPayload = {
			objectID: `${network}_${proposal.type}_${proposal.index}`,
			network,
			created_at: dayjs(proposal?.createdAt?.toDate?.() || new Date()).unix(),
			post_type: proposal.type,
			id: proposal.index,
			proposer: proposal.proposer,
			track_number: proposal.trackNumber
		};

		// Check Firestore first
		const firebaseDoc = await firestoreDB
			.collection('networks')
			.doc(network)
			.collection('post_types')
			.doc('referendums_v2')
			.collection('posts')
			.doc(String(proposal.index))
			.get();

		if (firebaseDoc.exists) {
			const firebaseData = firebaseDoc.data();
			payload.parsed_content = htmlOrMarkdownToText(firebaseData?.content || '');
			payload.content = firebaseData?.content || '';
			payload.title = firebaseData?.title || '';
			payload.tags = firebaseData?.tags || [];
			logger.info(`Found existing Firestore data for ${network} #${proposal.index}`);
		}

		// If no title, fetch from Subsquare
		if (!payload.title || !payload.content) {
			logger.info(`No title found, fetching from Subsquare for ${network} #${proposal.index}`);
			const subsquareData = await fetchSubsquareData(network, proposal.index);

			if (subsquareData) {
				payload.title = subsquareData.title;
				payload.content = subsquareData.content;
				payload.parsed_content = subsquareData.parsed_content;
				await updateFirestoreProposal(network, proposal.index, {
					...subsquareData,
					proposer: proposal.proposer
				});
			}
		}

		await updateAlgoliaIndex(payload);
		logger.info(`Successfully processed proposal ${network} #${proposal.index}`);
	} catch (error) {
		logger.error(`Error processing proposal ${network} #${proposal.index}:`, error);
	}
}

const updateNewProposalsInAlgolia = async () => {
	logger.info('Starting updateNewProposalsInAlgolia function');

	try {
		const proposalsPromises = algoliaSupportedNetworks.map(async (network: string) => {
			logger.info(`Processing network: ${network}`);

			const latestIndexDoc = await firestoreDB
				.collection('networks')
				.doc(network)
				.collection('post_types')
				.doc('referendums_v2')
				.collection('posts')
				.orderBy('id', 'desc') // Get the latest index
				.limit(1)
				.get();

			let latestIndex: null | number = null;
			if (!latestIndexDoc.empty) {
				latestIndex = Number(latestIndexDoc.docs[0].data().id) || null;
			}

			if (latestIndex === null) return;

			logger.info(`Latest stored index for ${network}: ${latestIndex}`);

			const subsquidRes = await fetchSubsquid({
				network,
				query: GET_NEW_OPENGOV_PROPOSALS,
				variables: {
					index_gt: latestIndex
				}
			});

			const proposals = subsquidRes?.data?.proposals || [];
			logger.info(`Found ${proposals.length} new proposals for ${network}`);

			return Promise.all(proposals.map((proposal: any) => processProposal(network, proposal)));
		});

		await Promise.all(proposalsPromises);
		logger.info('Successfully completed updateNewProposalsInAlgolia function');
	} catch (error) {
		logger.error('Error in updateNewProposalsInAlgolia:', error);
		throw error;
	}
};

export default updateNewProposalsInAlgolia;
