// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import messages from '~src/auth/utils/messages';
import { EUserActivityType } from '~src/components/UserProfile/ProfileUserActivity';
import { ProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';

export enum EActivityAction {
	CREATE = 'CREATE',
	EDIT = 'EDIT',
	DELETE = 'DELETE'
}
interface IDeletedCommentReply {
	id: string;
	type: EUserActivityType;
	network: string;
	userId: number;
}
interface Props {
	userId?: number;
	network: string;
	postAuthorId?: number;
	postId?: number | string;
	postType?: ProposalType;
	commentAuthorId?: number;
	commentId?: string;
	replyId?: string;
	replyAuthorId?: number | null;
	reactionId?: string;
	reactionAuthorId?: number;
	content?: any;
	action: EActivityAction;
	type?: EUserActivityType;
}

const getMentionsUserIds = async (content: any) => {
	const htmlCheck = /<[^>]+>/;
	const regex = /\[@([^\]]+)\]/g;
	const htmlContentRegex = /user\/([^"\\/]+)/g;

	function extractUserPaths(input: any, regex: any) {
		const safeInput = input.slice(0, 1000);

		const matches = [];

		let match;
		while ((match = regex.exec(safeInput)) !== null) {
			// Extracted value is in the first capturing group
			matches.push(match[1]);
		}

		return matches;
	}

	const matches = [...(content?.match(htmlCheck) ? extractUserPaths(content, htmlContentRegex) : extractUserPaths(content, regex))].map((item) => item[1]);
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
const createUserActivity = async ({
	network,
	postAuthorId,
	postId,
	postType,
	reactionAuthorId,
	reactionId,
	userId,
	commentAuthorId,
	commentId,
	content,
	replyAuthorId,
	replyId,
	action
}: Props) => {
	if (reactionId && reactionAuthorId && userId && !isNaN(userId)) {
		if (action === EActivityAction.CREATE) {
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
				activityPayload = { ...activityPayload, comment_author_id: commentAuthorId || null, comment_id: commentId };
			}
			if (replyAuthorId && replyId && commentAuthorId && commentId) {
				activityPayload = { ...activityPayload, reply_author_id: replyAuthorId, reply_id: replyId };
			}
			const ref = firestore_db.collection('user_activities').doc();
			try {
				await ref.set(activityPayload, { merge: true });
				console.log('Success');
			} catch (err) {
				console.log(err);
			}
		} else if (action === EActivityAction.DELETE) {
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
	}
	if (!commentId && !replyId && content && postId && postAuthorId && !isNaN(postAuthorId) && !reactionId) {
		if (action === EActivityAction.CREATE) {
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
		} else if (action === EActivityAction.EDIT) {
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
	}
	if (commentId && !replyId && postId && content && userId && !isNaN(userId)) {
		if (action === EActivityAction.CREATE) {
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
		} else if (action === EActivityAction.EDIT) {
			const oldActivitiesRefs = await firestore_db
				.collection('user_activities')
				.where('network', '==', network)
				.where('by', '==', userId)
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
		} else if (action === EActivityAction.DELETE) {
			await deleteCommentOrReply({ id: commentId, network, type: EUserActivityType.COMMENTED, userId: userId });
		}
	}
	if (commentId && replyId && postId && content) {
		if (action === EActivityAction.CREATE) {
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
		} else if (action === EActivityAction?.EDIT) {
			const oldActivitiesRefs = await firestore_db
				.collection('user_activities')
				.where('network', '==', network)
				.where('reply_id', '==', replyId)
				.where('type', '==', EUserActivityType.MENTIONED)
				.where('reply_author_id', '==', userId)
				.where('by', '==', userId)
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
	}
	if (replyId && !content && !reactionId && !postId && !commentId && userId && !isNaN(userId)) {
		if (action === EActivityAction.DELETE) {
			await deleteCommentOrReply({ id: replyId, network, type: EUserActivityType.REPLIED, userId: userId });
		}
	}
};

export default createUserActivity;
