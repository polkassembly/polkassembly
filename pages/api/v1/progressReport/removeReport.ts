// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import authServiceInstance from '~src/auth/auth';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { firebaseStorageBucket } from '~src/services/firebaseInit';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const token = getTokenFromReq(req);
		if (!token) {
			return res.status(401).json({ message: messages.UNAUTHORISED });
		}

		const user = await authServiceInstance.GetUser(token);
		if (!user) {
			return res.status(401).json({ message: messages.UNAUTHORISED });
		}

		const userId = user?.id;
		const userFolderPath = `user-uploads/${userId}`;

		const [files] = await firebaseStorageBucket.getFiles({
			prefix: userFolderPath
		});

		if (!files || files.length === 0) {
			return res.status(404).json({ message: 'No uploaded files found' });
		}

		const lastUploadedFile = files.filter((file) => file.metadata?.timeCreated).sort((a, b) => (b.metadata?.timeCreated || '')!.localeCompare(a.metadata?.timeCreated || ''))[0];

		if (!lastUploadedFile) {
			return res.status(404).json({ message: 'No valid last uploaded file found' });
		}

		await lastUploadedFile.delete();
		return res.status(200).json({ message: 'Last uploaded file successfully deleted' });
	} catch (error) {
		console.error('Error removing last uploaded file:', error);
		return res.status(500).json({ error: error.message, message: 'Error removing last uploaded file' });
	}
};

export default withErrorHandling(handler);
