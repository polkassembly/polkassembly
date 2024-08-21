// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import { NextResponse } from 'next/server';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { firebaseStorageBucket } from '~src/services/firebaseInit';

export const maxDuration = 30;

// const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const handler: NextApiHandler<any | MessageType> = async (req, res) => {
	console.log(req);
	console.log('req body --> ', req.body);
	const file = req.body.media;
	console.log(file);
	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	const fileName = `${Date.now()}-${file.name}`;
	const filePath = `user-uploads/${user?.id}/${fileName}`;
	const bucketFile = firebaseStorageBucket.file(filePath);

	const buffer = Buffer.from(await file.arrayBuffer());

	await bucketFile
		.save(buffer, {
			metadata: {
				contentType: file.type
			},
			public: true
		})
		.catch(() => {
			return res.status(500).json({ message: 'Error uploading data' });
		});

	return NextResponse.json({ displayUrl: bucketFile.publicUrl() });
};
export default withErrorHandling(handler);
