// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { firebaseStorageBucket } from '~src/services/firebaseInit';

// Disable default body parser
export const config = {
	api: {
		bodyParser: false
	}
};

const handler: NextApiHandler<any | MessageType> = async (req: NextApiRequest, res: NextApiResponse) => {
	const form = new IncomingForm(); // Use IncomingForm directly

	form.parse(req, async (err, fields, files) => {
		if (err) {
			return res.status(500).json({ error: err.message, message: 'Error parsing form data' });
		}

		try {
			let file: File | undefined;
			if (Array.isArray(files.media)) {
				file = files.media[0];
			} else {
				file = files.media;
			}

			if (!file) {
				return res.status(400).json({ message: 'No file uploaded' });
			}

			const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
			if (file.size > MAX_FILE_SIZE) {
				return res.status(400).json({ message: 'File size exceeds the limit' });
			}

			// Allow only PDF files
			const allowedTypes = ['application/pdf'];
			if (!allowedTypes.includes(file.mimetype || '')) {
				return res.status(400).json({ message: 'Unsupported file type. Only PDF files are allowed.' });
			}

			const token = getTokenFromReq(req);
			if (!token) return res.status(400).json({ message: 'Invalid token' });

			const user = await authServiceInstance.GetUser(token);

			const fileName = `${Date.now()}-${file.originalFilename}`;
			const filePath = `user-uploads/${user?.id}/${fileName}`;
			const bucketFile = firebaseStorageBucket.file(filePath);

			const fileBuffer = await fs.promises.readFile(file.filepath);

			await bucketFile
				.save(fileBuffer, {
					metadata: {
						contentType: file.mimetype || 'application/pdf'
					},
					public: true
				})
				.catch((error) => {
					console.error('Error uploading file:', error);
					return res.status(500).json({ error: error.message, message: 'Error uploading data' });
				});

			return res.status(200).json({ displayUrl: bucketFile.publicUrl() });
		} catch (error) {
			return res.status(500).json({ error: error.message, message: 'Error processing request' });
		}
	});
};

export default withErrorHandling(handler);
