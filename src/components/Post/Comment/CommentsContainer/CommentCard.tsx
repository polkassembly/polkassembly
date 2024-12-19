// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import { useRouter } from 'next/router';
import { IReactions } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useEffect, useRef, useState } from 'react';
import UpdateLabel from 'src/ui-components/UpdateLabel';
import { usePostDataContext } from '~src/context';
import { ICommentHistory } from '~src/types';
import CommentHistoryModal from '~src/ui-components/CommentHistoryModal';
import Replies from '../Replies';
import EditableCommentContent from '../EditableCommentContent';
import CreationLabelForComments from './CreationLabelForComments';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import ImageIcon from '~src/ui-components/ImageIcon';

export interface IComment {
	user_id: number;
	content: string;
	created_at: Date;
	id: string;
	isError: boolean;
	updated_at: Date;
	replies: any[];
	comment_reactions: IReactions;
	username: string;
	proposer?: string;
	sentiment?: number;
	comment_source?: 'polkassembly' | 'subsquare';
	history?: ICommentHistory[];
	spam_users_count?: number;
	is_custom_username?: boolean;
	profile?: any;
	post_index?: number;
	post_type?: string;
	vote?: string | null;
	votes?: any[];
	isRow?: boolean;
	isDeleted?: boolean;
}

interface ICommentProps {
	className?: string;
	comment: IComment;
	disableEdit?: boolean;
}

const CommentCard: FC<ICommentProps> = (props) => {
	const { className, comment } = props;
	const { user_id, content, created_at, id, replies, updated_at, sentiment, comment_source = 'polkassembly', history, spam_users_count, vote = null } = comment;
	const { asPath } = useRouter();
	const commentScrollRef = useRef<HTMLDivElement>(null);
	const [newSentiment, setNewSentiment] = useState<number>(sentiment || 0);
	const {
		postData: { postIndex, postType }
	} = usePostDataContext();
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [profileDetails, setProfileDetails] = useState({
		image: '',
		username: ''
	});

	const getData = async () => {
		try {
			const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${comment.proposer}`, undefined, 'GET');
			if (error || !data || !data.username || !data.user_id) {
				return;
			}
			setProfileDetails({
				image: data?.profile?.image || '',
				username: data?.username
			});
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (!comment.proposer) return;
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comment.proposer]);

	useEffect(() => {
		if (typeof window == 'undefined') return;
		const hashArr = asPath.split('#');
		const hash = hashArr[hashArr.length - 1];
		if (commentScrollRef && commentScrollRef.current && hash === `${id}`) {
			commentScrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [asPath, id]);
	if (!user_id || !content)
		return (
			<div className={`${className} mb-5`}>
				<Avatar
					className='bg-gray-300'
					size='large'
					icon={<UserOutlined />}
				/>
				<div className='comment-content'>Comment not available</div>
			</div>
		);

	function modifyQuoteComment(content: string) {
		// Regular expression to match disabled input tag and extract value
		const inputRegex = /<input\s+(?:[^>]*\s+)?disabled(?:\s+[^>]*)?\s+value="([^"]+)"/;
		const match = inputRegex.exec(content);
		if (!match) return content; // Return original HTML if no match found

		// Extract value
		const value = match[1];

		const modifiedContent = content.replace(
			match[0],
			`<div id="quote-box" style="border-left: 2px solid #E5007A; position: relative; border-radius: 5px;">
		<p contenteditable="false" style="width: 90%; padding: 5px 10px;  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${value}
		</p>
		</div><br><br>`
		);
		return modifiedContent;
	}

	const modifiedContent = modifyQuoteComment(comment.content);

	return (
		<div className={`${className} mb-3 flex gap-x-4 `}>
			<div className='w-full overflow-hidden '>
				<div className='flex items-center gap-2'>
					<ImageIcon
						alt='user'
						src={profileDetails?.image ? profileDetails.image : '/assets/icons/user-profile.png'}
						imgClassName=' h-8 w-8 rounded-full'
						imgWrapperClassName='rounded-full h-8 w-8 mt-1 mr-[2px]'
					/>

					<CreationLabelForComments
						className=' rounded-t-md py-2'
						created_at={created_at}
						defaultAddress={comment.proposer}
						voterAddress={comment?.votes?.[0]?.voter}
						username={comment.username}
						sentiment={newSentiment}
						commentSource={comment_source}
						spam_users_count={spam_users_count}
						vote={vote}
						votesArr={comment?.votes}
						isRow={true}
					>
						{history && history.length > 0 && (
							<div
								className='cursor-pointer'
								onClick={() => setOpenModal(true)}
							>
								<UpdateLabel
									className='-ml-[2px]'
									created_at={created_at}
									updated_at={updated_at}
									isHistory={history && history?.length > 0}
									isUsedInComments={true}
								/>
							</div>
						)}
					</CreationLabelForComments>
				</div>
				<div className='pl-10 pr-7'>
					<EditableCommentContent
						userId={user_id}
						created_at={created_at}
						className={''}
						comment={comment}
						commentId={id}
						content={modifiedContent || content}
						postId={postIndex}
						proposalType={postType}
						disableEdit={props.disableEdit}
						sentiment={newSentiment}
						setSentiment={setNewSentiment}
						prevSentiment={sentiment || 0}
						isSubsquareUser={comment_source === 'subsquare'}
						userName={comment?.username}
						proposer={comment?.proposer}
						is_custom_username={comment?.is_custom_username}
					/>
					{replies && replies.length > 0 && (
						<Replies
							className='comment-content'
							commentId={id}
							repliesArr={replies}
							comment={comment}
							isSubsquareUser={comment_source === 'subsquare'}
							isReactionOnReply={true}
						/>
					)}
				</div>
			</div>
			{history && history.length > 0 && (
				<CommentHistoryModal
					open={openModal}
					setOpen={setOpenModal}
					history={[{ content: content, created_at: updated_at, sentiment: newSentiment || sentiment || 0 }, ...history]}
					defaultAddress={comment?.proposer}
					username={comment?.username}
					user_id={comment?.user_id}
				/>
			)}
		</div>
	);
};

export default CommentCard;
