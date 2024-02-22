// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import messages from '~src/auth/utils/messages';
import { EUserActivityType } from '~src/components/UserProfile/ProfileUserActivity';
import { ProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';

interface IComment {
	userId: number;
	commentId: string;
	network: string;
	postId: number | string;
	postType: ProposalType;
	content: any;
	postAuthorId: number;
	commentAuthorId: number;
}
interface IReply {
	userId: number;
	commentId: string;
	replyId: string;
	replyAuthorId: number;
	commentAuthorId: number;
	network: string;
	postId: number | string;
	postType: ProposalType;
	content: any;
	postAuthorId: number;
}
interface IDeletedCommentReply {
	id: string;
	type: EUserActivityType;
	network: string;
	userId: number;
}
interface IPost {
	content: any;
	postId: number;
	userId: number;
	postAuthorId: number;
	network: string;
	postType: ProposalType;
}

interface IReaction {
	userId: number;
	network: string;
	postAuthorId: number;
	postId: number | string;
	postType: ProposalType;
	commentAuthorId?: number;
	replyAuthorId?: number | null;
	reactionAuthorId: number;
	reactionId: string;
	commentId?: string;
	replyId?: string;
}

const getMentionsUserIds = async (content: any) => {
	const htmlCheck = /<[^>]+>/;
	const regex = /\[@([^\]]+)\]/g;
	// eslint-disable-next-line no-useless-escape
	const htmlContentRegex = /user\/([^"\/]+)/g;

	const matches = [...(content?.match(htmlCheck) ? content.matchAll(htmlContentRegex) : content.matchAll(regex))].map((item) => item[1]);
	if (matches.length) {
		const usernameToId: any = {};
		const idToUsername: any = {};
		const usersDocs = (await firestore_db.collection('users').get()).docs;

		for (const userDoc of usersDocs) {
			const user = userDoc.data();
			const userId = user?.id;
			idToUsername[userId] = user.username;
			usernameToId[user?.username] = userId;
		}
		const mentions = [];
		for (const match of matches) {
			if (usernameToId[match]) {
				mentions.push(usernameToId[match]);
			}
		}
		return mentions;
	}
};
const createCommentActivity = async ({ userId, commentAuthorId, commentId, content, postAuthorId, postId, postType, network }: IComment) => {
	if (isNaN(postAuthorId) || !content || !commentId || isNaN(commentAuthorId) || !postId || !network || isNaN(userId)) {
		console.log(messages.INVALID_PARAMS);
	} else {
		const payloads = [];

		const mentions = await getMentionsUserIds(content);

		if (mentions?.length) {
			payloads.push({
				by: userId || null,
				comment_author_id: commentAuthorId || null,
				comment_id: commentId || null,
				mentions: mentions || [],
				network,
				post_author_id: postAuthorId,
				post_id: postId || null,
				post_type: postType as ProposalType,
				type: EUserActivityType.MENTIONED
			});
		}
		payloads.push({
			by: userId || null,
			comment_author_id: userId || null,
			comment_id: commentId || null,
			network,
			post_author_id: postAuthorId || null,
			post_id: postId || null,
			post_type: postType as ProposalType,
			type: EUserActivityType.COMMENTED
		});
		try {
			const batch = firestore_db.batch();
			if (payloads?.length) {
				for (const payload of payloads) {
					const activityRef = firestore_db.collection('user_activities').doc();
					batch.set(activityRef, payload, { merge: true });
				}
			}
			await batch.commit();
			console.log('Success');
		} catch (err) {
			console.log(err);
		}
	}
};
const createReplyActivity = async ({ commentAuthorId, commentId, content, network, postAuthorId, postId, postType, replyAuthorId, replyId, userId }: IReply) => {
	if (isNaN(postAuthorId) || !content || !commentId || isNaN(commentAuthorId) || !postId || !network || isNaN(userId) || isNaN(replyAuthorId) || !replyId) {
		console.log(messages.INVALID_PARAMS);
	} else {
		const batch = firestore_db.batch();

		const payloads = [];

		const mentions = (await getMentionsUserIds(content)) || [];

		if (mentions.length) {
			payloads.push({
				by: userId || null,
				comment_author_id: commentAuthorId || null,
				comment_id: commentId || null,
				mentions: mentions || [],
				network,
				post_author_id: postAuthorId,
				post_id: postId || null,
				post_type: postType as ProposalType,
				reply_author_id: replyAuthorId,
				reply_id: replyId || null,
				type: EUserActivityType.MENTIONED
			});
		}

		payloads.push({
			by: userId || null,
			comment_author_id: commentAuthorId || null,
			comment_id: commentId || null,
			network,
			post_author_id: postAuthorId || null,
			post_id: postId || null,
			post_type: postType as ProposalType,
			reply_author_id: replyAuthorId,
			reply_id: replyId || null,
			type: EUserActivityType.REPLIED
		});

		if (payloads?.length) {
			for (const payload of payloads) {
				const activityRef = firestore_db.collection('user_activities').doc();

				batch.set(activityRef, payload, { merge: true });
			}
		}
		try {
			await batch.commit();
			console.log('Success');
		} catch (err) {
			console.log(err);
		}
	}
};
const deleteCommentOrReply = async ({ id, type, network, userId }: IDeletedCommentReply) => {
	if (!network || isNaN(userId) || !id || !type) {
		console.log(messages.INVALID_PARAMS);
	} else {
		let snapshot = firestore_db.collection('user_activities').where('network', '==', network).where('by', '==', userId);
		let mentionsDocs = firestore_db.collection('user_activities').where('network', '==', network).where('type', '==', EUserActivityType.MENTIONED);
		let reactionDocs = firestore_db.collection('user_activities').where('network', '==', network).where('type', '==', EUserActivityType.REACTED);
		if (type === EUserActivityType.COMMENTED) {
			snapshot = snapshot.where('comment_id', '==', id).where('type', '==', EUserActivityType.COMMENTED);
			mentionsDocs = mentionsDocs.where('comment_id', '==', id).where('comment_author_id', '==', userId);
			reactionDocs = reactionDocs.where('comment_id', '==', id).where('comment_author_id', '==', userId);
		} else {
			snapshot = snapshot.where('reply_id', '==', id).where('type', '==', EUserActivityType.REPLIED);
			mentionsDocs = mentionsDocs.where('reply_id', '==', id).where('reply_author_id', '==', userId);
			reactionDocs = reactionDocs.where('reply_id', '==', id).where('reply_author_id', '==', userId);
		}
		const commentOrReplyrefs = await snapshot.get();
		const mentionRefs = await mentionsDocs.get();
		const reactionRefs = await reactionDocs.get();
		try {
			const batch = firestore_db.batch();

			if (!commentOrReplyrefs.empty) {
				commentOrReplyrefs.forEach((commentOrReplyref) => {
					batch.delete(commentOrReplyref.ref);
				});
			}
			if (!mentionRefs.empty) {
				mentionRefs.forEach((mentionRef) => {
					batch.delete(mentionRef.ref);
				});
			}
			if (!reactionRefs.empty) {
				commentOrReplyrefs.forEach((reactionRef) => {
					batch.delete(reactionRef.ref);
				});
			}
			await batch.commit();
			console.log('Success');
		} catch (err) {
			console.log(err);
		}
	}
};
const editPostMentionsActivity = async ({ content, network, postAuthorId, postId, postType, userId }: IPost) => {
	if (!network || isNaN(postAuthorId) || !postType || !postId || isNaN(userId)) {
		console.log(messages.INVALID_PARAMS);
	} else {
		const batch = firestore_db.batch();
		const payloads = [];
		const mentions = await getMentionsUserIds(content);

		if (mentions?.length) {
			payloads.push({
				by: userId || null,
				mentions: mentions || [],
				network,
				post_author_id: postAuthorId,
				post_id: postId || null,
				post_type: postType as ProposalType,
				type: EUserActivityType.MENTIONED
			});
		}

		const snapshot = firestore_db.collection('user_activities');
		const toBeDeletedDocs = await snapshot
			.where('network', '==', network)
			.where('type', '==', EUserActivityType.MENTIONED)
			.where('post_id', '==', postId)
			.where('post_author_id', '==', postAuthorId)
			.where('by', '==', postAuthorId)
			.get();

		if (!toBeDeletedDocs.empty) {
			toBeDeletedDocs.forEach((doc) => {
				batch.delete(doc.ref);
			});
		}
		if (payloads?.length) {
			for (const payload of payloads) {
				const activityRef = snapshot.doc();
				batch.set(activityRef, payload, { merge: true });
			}
		}
		try {
			await batch.commit();
			console.log('Success');
		} catch (err) {
			console.log(err);
		}
	}
};
const postCreatingActivity = async ({ content, network, postAuthorId, postId, postType, userId }: IPost) => {
	if (isNaN(postAuthorId) || !content || !postType || !postId || !network || isNaN(userId)) {
		console.log(messages.INVALID_PARAMS);
	} else {
		const payloads = [];
		const batch = firestore_db.batch();
		const snapshot = firestore_db.collection('user_activities');

		const mentions = await getMentionsUserIds(content);

		if (mentions?.length) {
			payloads.push({
				by: userId || null,
				mentions: mentions || [],
				network,
				post_author_id: postAuthorId,
				post_id: postId || null,
				post_type: postType as ProposalType,
				type: EUserActivityType.MENTIONED
			});
		}

		if (payloads?.length) {
			for (const payload of payloads) {
				const activityRef = snapshot.doc();
				batch.set(activityRef, payload, { merge: true });
			}
		}
		try {
			await batch.commit();
			console.log('Success');
		} catch (err) {
			console.log(err);
		}
	}
};
const editCommentActivity = async ({ commentAuthorId, commentId, content, network, postAuthorId, postId, postType, userId }: IComment) => {
	if (isNaN(postAuthorId) || !content || !commentId || isNaN(commentAuthorId) || !postId || !network || isNaN(userId)) {
		console.log(messages.INVALID_PARAMS);
	} else {
		const oldActivitiesRefs = await firestore_db
			.collection('user_activities')
			.where('comment_id', '==', commentId)
			.where('type', '==', EUserActivityType.MENTIONED)
			.where('comment_author_id', '==', userId)
			.get();

		const batch = firestore_db.batch();
		const payloads = [];

		const mentions = await getMentionsUserIds(content);
		if (mentions?.length) {
			payloads.push({
				by: userId || null,
				comment_author_id: commentAuthorId || null,
				comment_id: commentId || null,
				mentions: mentions || [],
				network,
				post_author_id: postAuthorId || null,
				post_id: postId || null,
				post_type: postType as ProposalType,
				type: EUserActivityType.MENTIONED
			});
		}

		payloads.push({
			by: userId || null,
			comment_author_id: userId || null,
			comment_id: commentId || null,
			network,
			post_author_id: postAuthorId || null,
			post_id: postId || null,
			post_type: postType as ProposalType,
			type: EUserActivityType.COMMENTED
		});

		if (payloads?.length) {
			for (const payload of payloads) {
				const activityRef = firestore_db.collection('user_activities').doc();
				batch.set(activityRef, payload, { merge: true });
			}
		}
		if (!oldActivitiesRefs.empty) {
			oldActivitiesRefs.forEach((activity) => {
				batch.delete(activity.ref);
			});
		}

		try {
			await batch.commit();
			console.log('Success');
		} catch (err) {
			console.log(err);
		}
	}
};
const editReplyActivity = async (
	userId: number,
	commentId: string,
	replyId: string,
	replyAuthorId: number,
	commentAuthorId: number,
	network: string,
	postId: number | string,
	postType: ProposalType,
	content: any,
	postAuthorId: number
) => {
	if (isNaN(postAuthorId) || !content || !commentId || isNaN(commentAuthorId) || !postId || !network || isNaN(userId) || !replyId || isNaN(replyAuthorId)) {
		console.log(messages.INVALID_PARAMS);
	} else {
		const oldActivitiesRefs = await firestore_db
			.collection('user_activities')
			.where('reply_id', '==', replyId)
			.where('type', '==', EUserActivityType.MENTIONED)
			.where('reply_author_id', '==', replyAuthorId)
			.get();

		const batch = firestore_db.batch();

		const payloads = [];
		const mentions = await getMentionsUserIds(content);
		if (mentions?.length) {
			payloads.push({
				by: userId || null,
				comment_author_id: commentAuthorId || null,
				comment_id: commentId || null,
				mentions: mentions || [],
				network,
				post_author_id: postAuthorId || null,
				post_id: postId || null,
				post_type: postType as ProposalType,
				reply_author_id: replyAuthorId || null,
				reply_id: replyId || null,
				type: EUserActivityType.MENTIONED
			});
		}

		payloads.push({
			by: userId || null,
			comment_author_id: commentAuthorId || null,
			comment_id: commentId || null,
			network,
			post_author_id: postAuthorId || null,
			post_id: postId || null,
			post_type: postType as ProposalType,
			reply_author_id: replyAuthorId,
			reply_id: replyId || null,
			type: EUserActivityType.REPLIED
		});

		if (payloads?.length) {
			for (const payload of payloads) {
				const activityRef = firestore_db.collection('user_activities').doc();
				batch.set(activityRef, payload, { merge: true });
			}
		}
		if (!oldActivitiesRefs.empty) {
			oldActivitiesRefs.forEach((activity) => {
				batch.delete(activity.ref);
			});
		}
		try {
			await batch.commit();
			console.log('Success');
		} catch (err) {
			console.log(err);
		}
	}
};
const createReactionsActivity = async ({
	commentAuthorId,
	network,
	postAuthorId,
	postId,
	postType,
	reactionAuthorId,
	reactionId,
	replyAuthorId,
	userId,
	commentId,
	replyId
}: IReaction) => {
	if (!postId || !network || isNaN(userId) || isNaN(postAuthorId) || !reactionId || !reactionAuthorId) {
		console.log(messages.INVALID_PARAMS);
	} else {
		let activityPayload: any = {
			by: userId || null,
			network,
			post_author_id: postAuthorId || null,
			post_id: postId || null,
			post_type: postType as ProposalType,
			reaction_author_id: reactionAuthorId || null,
			reaction_id: reactionId || null,
			type: EUserActivityType.REACTED
		};
		if (commentAuthorId && commentId) {
			activityPayload = { ...activityPayload, commentAuthorId: commentAuthorId || null, commentId: commentId };
		}
		if (replyAuthorId && replyId && commentAuthorId && commentId) {
			activityPayload = { ...activityPayload, replyAuthorId: replyAuthorId, replyId: replyId };
		}
		const ref = firestore_db.collection('user_activities').doc();
		try {
			await ref.set(activityPayload, { merge: true });
			console.log('Success');
		} catch (err) {
			console.log(err);
		}
	}
};
const removeReactionActivity = async ({ network, reactionId, userId }: { network: string; reactionId: string; userId: number }) => {
	if (!network || !reactionId || !userId) {
		console.log(messages.INVALID_PARAMS);
	} else {
		console.log('heree');
		const batch = firestore_db.batch();

		const refs = await firestore_db
			.collection('user_activities')
			.where('network', '==', network)
			.where('type', '==', EUserActivityType.REACTED)
			.where('reaction_author_id', '==', userId)
			.where('reaction_id', '==', reactionId)
			.where('by', '==', userId)
			.get();

		if (!refs.empty) {
			refs.forEach((ref) => {
				batch.delete(ref.ref);
			});
		}
		try {
			await batch.commit();
			console.log('Success');
		} catch (err) {
			console.log(err);
		}
	}
};

export {
	createCommentActivity,
	createReplyActivity,
	editPostMentionsActivity,
	editCommentActivity,
	editReplyActivity,
	createReactionsActivity,
	deleteCommentOrReply,
	removeReactionActivity,
	postCreatingActivity
};
