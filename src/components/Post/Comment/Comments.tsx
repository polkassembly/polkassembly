import React, { FC, useState } from 'react';
import CommentCard from './CommentsContainer/CommentCard';
import { IComment } from './Comment';
import { poppins } from 'pages/_app';
import LoadMoreicon from '~assets/icons/load-more-icon.svg'
import LoadMoreiconDark from '~assets/icons/load-more-icon-dark.svg'
import { useTheme } from 'next-themes';

interface ICommentsProps {
	className?: string;
	disableEdit?: boolean;
	comments: IComment[];
}

const handleUniqueReplies = (repliesArr: any[]) => {
	if (repliesArr.length < 2) return repliesArr;
	const uniqueReplies: Array<{ id: string }> = Object.values(
		repliesArr.reduce((acc: any, obj) => {
			acc[obj.id] = obj;
			return acc;
		}, {})
	);
	return uniqueReplies;
};

const Comments: FC<ICommentsProps> = (props) => {
	const { className, comments } = props;
	const [visibleCommentsCount, setVisibleCommentsCount] = useState<number>(4);
	const { resolvedTheme: theme } = useTheme();
	
	// Filter unique comments
	const uniqueComments: Array<IComment> = Object.values(
		comments.reduce((acc: any, obj) => {
			const repliesArr = handleUniqueReplies([...(obj?.replies || []), ...(acc?.[obj?.id]?.replies || [])]) || [];
			acc[obj.id] = { ...obj, replies: repliesArr };
			return acc;
		}, {})
	);

	const handleShowMoreComments = () => {
		setVisibleCommentsCount(uniqueComments.length);
	};

	const visibleComments = uniqueComments.slice(0, visibleCommentsCount);

	return (
		<div className={className}>
			{visibleComments.map((comment, index) => (
				<CommentCard
					disableEdit={props.disableEdit}
					comment={comment}
					key={comment.id}
					className={`${index !== visibleComments.length - 1 ? 'border border-t-0 border-r-0 border-l-0 pb-4 border-solid border-[#D2D8E0B2] dark:border-[#4B4B4BB2]' : ''}`}
				/>
			))}

			{uniqueComments.length > 4 && visibleCommentsCount < uniqueComments.length && (
				<div onClick={handleShowMoreComments} className={`${poppins.variable} ${poppins.className} cursor-pointer flex items-center gap-[10px] justify-center mx-auto p-4 w-[230px] rounded-full bg-[#F6F7F9] text-sm text-blue-light-medium dark:text-blue-dark-medium`}>
						Load more comments {theme == 'dark' ? <LoadMoreiconDark /> : <LoadMoreicon />}
				</div>
			)}
		</div>
	);
};

export default Comments;
