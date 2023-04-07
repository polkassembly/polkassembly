// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { networkDocRef } from '~src/api-utils/firestore_refs';

export interface IGraphPoint {
	approval_percent: number;
	support_percent: number;
    time: Date | string;
}

export interface ICurvePointsResponse {
    graph_points: IGraphPoint[];
}

const handler: NextApiHandler<ICurvePointsResponse | { error: string }> = async (req, res) => {
	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) res.status(400).json({ error: 'Invalid network in request header' });

	const { postId } = req.body;
	if(isNaN(postId)) return res.status(400).json({ error: 'Missing postId in request body' });

	const curvePointPostDocRef = await networkDocRef(network).collection('post_types').doc('referendums_v2').collection('curve_points').doc(String(postId)).get();

	const data = curvePointPostDocRef.data();

	if (!curvePointPostDocRef.exists || !data) {
		return res.status(404).json({ error: 'Post curve point not found' });
	}

	const graph_points: IGraphPoint[] = [];

	data.graph_points.forEach((graphPoint: any) => {
		graph_points.push({
			approval_percent: graphPoint.approval_percent,
			support_percent: graphPoint.support_percent,
			time: graphPoint.time.toDate()
		});
	});
	res.status(200).json({ graph_points });
};

export default withErrorHandling(handler);