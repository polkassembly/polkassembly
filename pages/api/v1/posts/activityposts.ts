import { NextApiRequest, NextApiResponse } from 'next';
import { getOnChainPost, IPostResponse } from './on-chain-post';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { postId, network, proposalType } = req.query;

	if (!postId || !network || !proposalType) {
		return res.status(400).json({ error: 'Missing required parameters' });
	}

	try {
		const result = await getOnChainPost({
			network: network as string,
			postId: postId as string,
			proposalType: proposalType as string
		});

		res.status(200).json(result);
	} catch (error) {
		console.error('Error fetching on-chain post:', error);
		res.status(500).json({ error: 'Failed to fetch on-chain post' });
	}
}
