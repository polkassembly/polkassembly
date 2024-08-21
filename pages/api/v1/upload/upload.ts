// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
// import { NextResponse } from 'next/server';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { firebaseStorageBucket } from '~src/services/firebaseInit';
import { IncomingMessage } from 'http';
import { Buffer } from 'buffer';

export const config = {
	api: {
		bodyParser: false // Disables Next.js's default body parsing
	}
};

// Helper function to parse the form data
const parseFormData = async (req: IncomingMessage) => {
	return new Promise<{ fields: Record<string, string>; file: { filename: string; type: string; content: Buffer } }>((resolve, reject) => {
		const boundary = req.headers['content-type']?.split('boundary=')?.[1];
		if (!boundary) {
			return reject(new Error('No boundary found in Content-Type header.'));
		}

		const chunks: Uint8Array[] = [];
		req.on('data', (chunk) => {
			chunks.push(chunk as Uint8Array); // Type assertion to ensure Uint8Array[]
		});

		req.on('end', () => {
			const buffer = Buffer.concat(chunks); // No error because chunks is now Uint8Array[]
			const parts = buffer.toString().split(`--${boundary}`);

			const fields: Record<string, string> = {};
			let file: { filename: string; type: string; content: Buffer } | undefined;

			for (const part of parts) {
				if (part.includes('Content-Disposition: form-data;')) {
					const nameMatch = /name="([^"]+)"/.exec(part);
					const name = nameMatch?.[1];

					if (name) {
						if (part.includes('filename="')) {
							// It's a file
							const filenameMatch = /filename="([^"]+)"/.exec(part);
							const filename = filenameMatch?.[1] || 'unknown';
							const contentTypeMatch = /Content-Type: ([^;]+);?/.exec(part);
							const type = contentTypeMatch?.[1] || 'application/octet-stream';

							const fileContentMatch = /\r\n\r\n([\s\S]*)\r\n--/.exec(part);
							const content = fileContentMatch ? Buffer.from(fileContentMatch[1], 'binary') : Buffer.alloc(0);

							file = { content, filename, type };
						} else {
							// It's a field
							const valueMatch = /\r\n\r\n([\s\S]*)\r\n--/.exec(part);
							const value = valueMatch?.[1] || '';
							fields[name] = value;
						}
					}
				}
			}

			if (file) {
				resolve({ fields, file });
			} else {
				reject(new Error('No file found in form data.'));
			}
		});

		req.on('error', (err) => {
			reject(err);
		});
	});
};

const handler: NextApiHandler<any | MessageType> = async (req, res) => {
	try {
		const { file } = await parseFormData(req);
		const token = getTokenFromReq(req);
		if (!token) return res.status(400).json({ message: 'Invalid token' });

		const user = await authServiceInstance.GetUser(token);

		const fileName = `${Date.now()}-${file.filename}`;
		const filePath = `user-uploads/${user?.id}/${fileName}`;
		const bucketFile = firebaseStorageBucket.file(filePath);

		await bucketFile
			.save(file.content, {
				metadata: {
					contentType: 'application/pdf'
				},
				public: true
			})
			.catch((e) => {
				return res.status(500).json({ error: e.message, message: 'Error uploading data' });
			});
		return res.status(200).json({ displayUrl: bucketFile.publicUrl() });
	} catch (error) {
		return res.status(500).json({ error: error.message, message: 'Error processing request' });
	}
};
export default withErrorHandling(handler);
