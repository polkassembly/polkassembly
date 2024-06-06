// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import sgMail from '@sendgrid/mail';

const apiKey = process.env.SENDGRID_API_KEY;
const FROM = {
	email: 'noreply@polkassembly.io',
	name: 'Polkassembly'
};

if (apiKey) {
	sgMail.setApiKey(apiKey);
}

const sendSpamNotificationEmail = async (content: string, network: string, newID: number) => {
	const msg = {
		from: FROM.email,
		subject: 'Spam Detected',
		text: `Spam content detected:\n\n $ Click on the link -> https://${network}.polkassembly.io/post/${newID} \n\n
        content is -> {content}`,
		to: ['manish@polkassembly.io', 'paras@polkassembly.io']
	};

	try {
		await sgMail.send(msg);
	} catch (error) {
		console.error('Error sending spam notification email:', error);
	}
};

export default sendSpamNotificationEmail;
