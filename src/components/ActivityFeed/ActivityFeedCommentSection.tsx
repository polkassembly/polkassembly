// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState, useRef } from 'react';
import { Alert, Modal } from 'antd';
import { useTheme } from 'next-themes';
import { useUserDetailsSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import { ActivityFeedCommentModal } from './ActivityFeedCommentModal';
import { PostType } from '~src/auth/types';
const FIRST_VOTER_PROFILE_IMG_FALLBACK = '/assets/rankcard3.svg';
const COMMENT_PLACEHOLDER = 'Type your comment here';
const POST_LABEL = 'Post';

interface IPostCommentSectionProps {
	post: PostType;
	reasonForNoComment: string;
	isUserNotAllowedToComment: boolean;
}
const ActivityFeedCommentSection: React.FC<IPostCommentSectionProps> = ({
	post,
	reasonForNoComment,
	isUserNotAllowedToComment
}: {
	post: PostType;
	reasonForNoComment: string;
	isUserNotAllowedToComment: boolean;
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const currentUserdata = useUserDetailsSelector();
	const userid = currentUserdata?.id;
	const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const commentKey = () => `comment:${typeof window !== 'undefined' ? window.location.href : ''}`;
	const modalWrapperRef = useRef<HTMLDivElement>(null);
	const { resolvedTheme: theme } = useTheme();
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1024;
	const openModal = () => {
		if (userid) {
			setIsModalOpen(true);
		} else {
			setOpenLoginModal(true);
		}
	};

	const closeModal = () => {
		global.window.localStorage.removeItem(commentKey());
		setIsModalOpen(false);
	};

	return (
		<div className='mt-1 flex items-center'>
			{isUserNotAllowedToComment ? (
				<Alert
					message={<span className='mb-10 dark:text-blue-dark-high'>{reasonForNoComment}</span>}
					type='info'
					showIcon
				/>
			) : (
				<>
					{!isMobile && (
						<ImageIcon
							src={`${currentUserdata?.picture ? currentUserdata?.picture : FIRST_VOTER_PROFILE_IMG_FALLBACK}`}
							alt=''
							className='h-6 w-6 rounded-full lg:h-10 lg:w-10'
						/>
					)}

					<div
						ref={inputRef}
						className={
							'h-9 w-full rounded-l-lg border-y border-l border-r-0 border-solid border-[#D2D8E0] p-2 outline-none dark:border dark:border-solid dark:border-[#4B4B4B] md:p-2 lg:ml-4 xl:ml-3 '
						}
						onClick={openModal}
					>
						{COMMENT_PLACEHOLDER}{' '}
					</div>
					<button
						onClick={openModal}
						className='h-9 w-28 cursor-pointer rounded-r-lg  border border-solid border-[#D2D8E0] bg-[#485F7D] bg-opacity-[5%] p-2 text-[#243A57] dark:border dark:border-solid dark:border-[#4B4B4B] dark:bg-[#262627] dark:text-white'
					>
						{POST_LABEL}
					</button>

					<ReferendaLoginPrompts
						theme={theme}
						modalOpen={openLoginModal}
						setModalOpen={setOpenLoginModal}
						image='/assets/Gifs/login-discussion.gif'
						title='Join Polkassembly to Comment on this proposal.'
						subtitle='Discuss, contribute and get regular updates from Polkassembly.'
					/>

					{isModalOpen && (
						<>
							<div
								className='fixed inset-0 z-40 bg-black bg-opacity-30'
								onClick={closeModal}
							/>
							<Modal
								visible={isModalOpen}
								onCancel={closeModal}
								maskClosable={true}
								footer={null}
								centered
								className='z-50 w-[90%] lg:w-[650px]'
							>
								<div
									className='w-[90%] lg:w-[600px]'
									ref={modalWrapperRef}
								>
									<ActivityFeedCommentModal
										post={post}
										onclose={closeModal}
										currentUserdata={currentUserdata}
									/>
								</div>
							</Modal>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default ActivityFeedCommentSection;
