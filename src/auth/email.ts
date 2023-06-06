// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import sgMail from '@sendgrid/mail';
import ejs from 'ejs';
import MarkdownIt from 'markdown-it';

import { PostType, PostTypeEnum } from '~src/auth/types';
import {
	commentMentionEmailTemplate,
	commentReplyEmailTemplate,
	newGovernanceV2CreatedEmailTemplate,
	newProposalCreatedEmailTemplate,
	ownGovernanceV2ReferendaCreatedEmailTemplate,
	ownProposalCreatedEmailTemplate,
	postSubscriptionMailTemplate,
	reportContentEmailTemplate,
	resetPasswordEmailTemplate,
	spamCommentReportTemplate,
	spamPostReportTemplate,
	spamReplyReportTemplate,
	transferNoticeEmailTemplate,
	transferNoticeMistakeEmailTemplate,
	undoEmailChangeEmailTemplate,
	verificationEmailTemplate
} from '~src/auth/utils/emailTemplates';
import shortenHash from '~src/auth/utils/shortenHash';

import { UndoEmailChangeToken, User } from './types';

const apiKey = process.env.SENDGRID_API_KEY;
const FROM = {
	email: 'noreply@polkassembly.io',
	name: 'Polkassembly'
};
const REPORT = 'contact@premiurly.in';

if (apiKey) {
	sgMail.setApiKey(apiKey);
}

export const sendVerificationEmail = (user: User, token: string, network: string): void => {
	if (!apiKey) {
		console.warn('Verification Email not sent due to missing API key');
		return;
	}

	const verifyUrl = `https://${network}.polkassembly.io/verify-email?token=${token}`;
	const text = ejs.render(verificationEmailTemplate, { username: user.username || '', verifyUrl });
	const msg = {
		from: FROM,
		html: text,
		subject: 'Verify your email address',
		text,
		to: user.email
	};

	sgMail.send(msg).catch(e =>
		console.error('Verification Email not sent', e));
};

export const sendResetPasswordEmail = (user: User, token: string, network: string): void => {
	if (!apiKey) {
		console.warn('Password reset Email not sent due to missing API key');
		return;
	}

	const resetUrl = `https://${network}.polkassembly.io/reset-password?token=${token}&userId=${user.id}`;
	const text = ejs.render(resetPasswordEmailTemplate, { resetUrl, username: user.username || '' });

	const msg = {
		from: FROM,
		html: text,
		subject: 'Username or password reset request',
		text,
		to: user.email
	};

	sgMail.send(msg).catch(e =>
		console.error('Password reset email not sent', e));
};

// triggered on a new comment on a post
export const sendPostSubscriptionMail = (user: User, author: User, content: string, postId: string, commentUrl: string, network:string): void => {
	if (!apiKey) {
		console.warn('Post Subscription Email not sent due to missing API key');
		return;
	}

	if (!user.email_verified) {
		return;
	}

	const md = new MarkdownIt();
	const text = ejs.render(postSubscriptionMailTemplate, {
		authorUsername: author.username,
		commentUrl,
		content: md.render(content),
		domain: `https://${network}.polkassembly.io`,
		username: user.username || ''
	});

	const msg = {
		from: FROM,
		html: text,
		subject: `Update on post #${postId}: ${content.substring(0, 40)} ...`,
		text,
		to: user.email
	};

	sgMail.send(msg).catch(e =>
		console.error('Post subscription email not sent', e));
};

export const sendCommentReplyMail = (user: User, author: User, content: string, postId: string, commentUrl: string, network:string): void => {
	if (!apiKey) {
		console.warn('Comment reply email not sent due to missing API key');
		return;
	}

	if (!user.email_verified) {
		return;
	}

	const md = new MarkdownIt();
	const text = ejs.render(commentReplyEmailTemplate, {
		authorUsername: author.username,
		commentUrl,
		content: md.render(content),
		domain: `https://${network}.polkassembly.io`,
		username: user.username || ''
	});

	const msg = {
		from: FROM,
		html: text,
		subject: `Reply on your comment on post #${postId}: ${content.substring(0, 40)} ...`,
		text,
		to: user.email
	};

	sgMail.send(msg).catch(e =>
		console.error('Comment reply email not sent', e));
};

export const sendCommentMentionMail = (user: User, author: User, content: string, postId: string, commentUrl: string, network: string): void => {
	if (!apiKey) {
		console.warn('Comment Mention Email not sent due to missing API key');
		return;
	}

	if (!user.email_verified) {
		return;
	}

	const md = new MarkdownIt();
	const text = ejs.render(commentMentionEmailTemplate, {
		authorUsername: author.username,
		commentUrl,
		content: md.render(content),
		domain: `https://${network}.polkassembly.io`,
		username: user.username || ''
	});

	const msg = {
		from: FROM,
		html: text,
		subject: `You are mentioned in post #${postId} comment`,
		text,
		to: user.email
	};

	sgMail.send(msg).catch(e =>
		console.error('Post subscription email not sent', e));
};

export const sendCommentReportMail = (
	postType: string,
	postId: string,
	commentId: string,
	commentUrl:string,
	network:string,
	spam_users_count:number ): void => {
	if (!apiKey) {
		console.warn('Comment Spam Report Email not sent due to missing API key');
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
		to: ['hello@polkassembly.io','parambir@polkassembly.io']
	};

	sgMail.sendMultiple(msg).catch(e =>
		console.error('Comment Spam Report not sent', e));
};
export const sendReplyReportMail = (
	postType: string,
	postId: string,
	commentId: string,
	replyId:string,
	commentUrl:string,
	network:string,
	spam_users_count:number ): void => {
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
		to: ['hello@polkassembly.io','parambir@polkassembly.io']
	};

	sgMail.sendMultiple(msg).catch(e =>
		console.error('Reply Spam Report not sent', e));
};

export const sendPostSpamReportMail = (
	postType: string,
	postId: string,
	postUrl:string,
	network:string,
	spam_users_count:number ): void => {
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
		to: ['hello@polkassembly.io','parambir@polkassembly.io']
	};

	sgMail.sendMultiple(msg).catch(e =>
		console.error(' Spam Report not sent', e));
	console.log('mail sent');
};

export const sendUndoEmailChangeEmail = (user: User, undoToken: UndoEmailChangeToken, network: string): void => {
	if (!apiKey) {
		console.warn('Email undo token email not sent due to missing API key');
		return;
	}

	const undoUrl = `https://${network}.polkassembly.io/undo-email-change/${undoToken.token}`;
	const text = ejs.render(undoEmailChangeEmailTemplate, {
		undoEmail: undoToken.email,
		undoUrl,
		userEmail: user.email,
		username: user.username || ''
	});
	const msg = {
		from: FROM,
		html: text,
		subject: 'Your Polkassembly email was changed',
		text,
		to: undoToken.email
	};

	sgMail.send(msg).catch(e =>
		console.error('Email undo email not sent', e));
};

// Below two should be done triggred in subsquid subscription server
export const sendOwnProposalCreatedEmail = (user: User, type: PostType, url: string, id: number | string, network: string): void => {
	if (!apiKey) {
		console.warn('Own proposal created email not sent due to missing API key');
		return;
	}

	if (!user.email_verified) {
		return;
	}

	const text = ejs.render(type === PostTypeEnum.REFERENDA ? ownGovernanceV2ReferendaCreatedEmailTemplate : ownProposalCreatedEmailTemplate, {
		domain: `https://${network}.polkassembly.io`,
		postUrl: url,
		type,
		username: user.username || ''
	});

	const subjectId = type === PostTypeEnum.TIP
		? shortenHash(id as string)
		: `#${id}`;

	const msg = {
		from: FROM,
		html: text,
		subject: `You have submitted a new ${type} ${subjectId} on chain`,
		text,
		to: user.email
	};

	sgMail.send(msg).catch(e =>
		console.error('Proposal created email not sent', e));
};

export const sendNewProposalCreatedEmail = (user: User, type: PostType, url: string, id: number | string, network: string): void => {
	if (!apiKey) {
		console.warn('New proposal created email not sent due to missing API key');
		return;
	}

	if (!user.email_verified) {
		return;
	}

	const text = ejs.render(type === PostTypeEnum.REFERENDA ? newGovernanceV2CreatedEmailTemplate : newProposalCreatedEmailTemplate, {
		domain: `https://${network}.polkassembly.io`,
		postUrl: url,
		type,
		username: user.username || ''
	});

	const subjectId = type === PostTypeEnum.TIP
		? shortenHash(id as string)
		: `#${id}`;

	const msg = {
		from: FROM,
		html: text,
		subject: `New ${type} ${subjectId} created on chain`,
		text,
		to: user.email
	};

	sgMail.send(msg).catch(e =>
		console.error('Proposal created email not sent', e));
};

// TODO: check when to send
export const sendReportContentEmail = (username: string, network: string, reportType: string, contentId: string, reason: string, comments: string): void => {
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

	sgMail.send(msg).catch(e =>
		console.error('Report Content Email not sent', e));
};

export const sendTransferNoticeEmail = (network: string | undefined, email: string, mistake: boolean): void => {
	if (!apiKey) {
		console.warn('Report Content Email not sent due to missing API key');
		return;
	}

	const text = ejs.render(mistake ? transferNoticeMistakeEmailTemplate : transferNoticeEmailTemplate, {
		email,
		network
	});

	const msg = {
		from: FROM,
		html: text,
		reply_to: REPORT,
		subject: 'Polkassembly Acquisition Notice',
		text,
		to: email
	};

	sgMail.send(msg).catch(e =>
		console.error('Polkassembly Acquisition Notice Email not sent', e));
};
