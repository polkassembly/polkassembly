// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import sgMail from '@sendgrid/mail';
import ejs from 'ejs';
import {
	reportContentEmailTemplate,
	spamCommentReportTemplate,
	spamPostReportTemplate,
	spamReplyReportTemplate
} from '~src/auth/utils/emailTemplates';

import { UndoEmailChangeToken, User } from './types';
import { FIREBASE_FUNCTIONS_URL } from '~src/components/Settings/Notifications/utils';

const apiKey = process.env.SENDGRID_API_KEY;
const FROM = {
	email: 'noreply@polkassembly.io',
	name: 'Polkassembly'
};
const REPORT = 'contact@premiurly.in';

if (apiKey) {
	sgMail.setApiKey(apiKey);
}

export const sendVerificationEmail = (
	user: User,
	token: string,
	network: string
): void => {
	if (!apiKey) {
		console.warn('Verification Email not sent due to missing API key');
		return;
	}
	const verifyUrl = `https://${network}.polkassembly.io/verify-email?token=${token}`;

	fetch(`${FIREBASE_FUNCTIONS_URL}/notify`, {
		body: JSON.stringify({
			args: {
				email: user.email,
				username: user.username,
				verifyUrl
			},
			trigger: 'verifyEmail'
		}),
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			'x-api-key': '47c058d8-2ddc-421e-aeb5-e2aa99001949',
			'x-source': 'polkassembly'
		},
		method: 'POST'
	}).catch((e) => console.error('Verification Email not sent', e));
};

export const sendResetPasswordEmail = (
	user: User,
	token: string,
	network: string
): void => {
	if (!apiKey) {
		console.warn('Password reset Email not sent due to missing API key');
		return;
	}

	const resetUrl = `https://${network}.polkassembly.io/reset-password?token=${token}&userId=${user.id}`;

	fetch(`${FIREBASE_FUNCTIONS_URL}/notify`, {
		body: JSON.stringify({
			args: {
				email: user.email,
				resetUrl,
				username: user.username
			},
			trigger: 'resetPassword'
		}),
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			'x-api-key': '47c058d8-2ddc-421e-aeb5-e2aa99001949',
			'x-source': 'polkassembly'
		},
		method: 'POST'
	}).catch((e) => console.error('Verification Email not sent', e));
};

export const sendCommentReportMail = (
	postType: string,
	postId: string,
	commentId: string,
	commentUrl: string,
	network: string,
	spam_users_count: number
): void => {
	if (!apiKey) {
		console.warn(
			'Comment Spam Report Email not sent due to missing API key'
		);
		return;
	}

	const text = ejs.render(spamCommentReportTemplate, {
		commentId,
		commentUrl,
		network,
		postId,
		postType,
		spam_users_count
	});
	const msg = {
		from: FROM,
		html: text,
		subject: 'Comment Spam Report',
		text,
		to: ['hello@polkassembly.io', 'parambir@polkassembly.io']
	};

	sgMail
		.sendMultiple(msg)
		.catch((e) => console.error('Comment Spam Report not sent', e));
};

export const sendReplyReportMail = (
	postType: string,
	postId: string,
	commentId: string,
	replyId: string,
	commentUrl: string,
	network: string,
	spam_users_count: number
): void => {
	if (!apiKey) {
		console.warn('Reply Spam Report Email not sent due to missing API key');
		return;
	}

	const text = ejs.render(spamReplyReportTemplate, {
		commentId,
		commentUrl,
		network,
		postId,
		postType,
		replyId,
		spam_users_count
	});
	const msg = {
		from: FROM,
		html: text,
		subject: 'Reply Spam Report',
		text,
		to: ['hello@polkassembly.io', 'parambir@polkassembly.io']
	};

	sgMail
		.sendMultiple(msg)
		.catch((e) => console.error('Reply Spam Report not sent', e));
};

export const sendPostSpamReportMail = (
	postType: string,
	postId: string,
	postUrl: string,
	network: string,
	spam_users_count: number
): void => {
	if (!apiKey) {
		console.warn('Post Spam Report Email not sent due to missing API key');
		return;
	}

	const text = ejs.render(spamPostReportTemplate, {
		network,
		postId,
		postType,
		postUrl,
		spam_users_count
	});
	const msg = {
		from: FROM,
		html: text,
		subject: 'Post Spam Report',
		text,
		to: ['hello@polkassembly.io', 'parambir@polkassembly.io']
	};

	sgMail
		.sendMultiple(msg)
		.catch((e) => console.error(' Spam Report not sent', e));
	console.log('mail sent');
};

export const sendUndoEmailChangeEmail = (
	user: User,
	undoToken: UndoEmailChangeToken,
	network: string
): void => {
	if (!apiKey) {
		console.warn('Email undo token email not sent due to missing API key');
		return;
	}

	const undoUrl = `https://${network}.polkassembly.io/undo-email-change/${undoToken.token}`;
	fetch(`${FIREBASE_FUNCTIONS_URL}/notify`, {
		body: JSON.stringify({
			args: {
				email: user.email,
				undoEmail: undoToken.email,
				undoUrl,
				username: user.username
			},
			trigger: 'undoEmailChange'
		}),
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			'x-api-key': '47c058d8-2ddc-421e-aeb5-e2aa99001949',
			'x-source': 'polkassembly'
		},
		method: 'POST'
	}).catch((e) => console.error('Verification Email not sent', e));
};

// TODO: check when to send
export const sendReportContentEmail = (
	username: string,
	network: string,
	reportType: string,
	contentId: string,
	reason: string,
	comments: string
): void => {
	if (!apiKey) {
		console.warn('Report Content Email not sent due to missing API key');
		return;
	}

	const text = ejs.render(reportContentEmailTemplate, {
		comments,
		contentId,
		network,
		reason,
		reportType,
		username
	});
	const msg = {
		from: FROM,
		html: text,
		subject: 'Content reported',
		text,
		to: REPORT
	};

	sgMail
		.send(msg)
		.catch((e) => console.error('Report Content Email not sent', e));
};
