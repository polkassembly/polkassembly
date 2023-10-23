// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LinkOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { FC, useState } from 'react';
import { usePostDataContext } from '~src/context';
import { EditIcon } from '~src/ui-components/CustomIcons';
import GovSidebarCard from '~src/ui-components/GovSidebarCard';
import PostEditIcon from 'public/assets/icons/post-edit.svg';
import PostLinkingIcon from 'public/assets/icons/post-linking.svg';
import PostEditLinkingIcon from 'public/assets/icons/post-edit-linking.svg';
import { Modal } from 'antd';
import ContinueWithoutLinking from './ContinueWithoutLinking';
import ContinueWithLinking from './ContinueWithLinking';
import LinkingAndEditing from './LinkingAndEditing';
import { checkIsOnChainPost } from '~src/global/proposalType';
import { poppins } from 'pages/_app';
import CloseIcon from '~assets/icons/close-icon.svg';

interface IPostEditOrLinkCTA {
	className?: string;
}

const PostEditOrLinkCTA: FC<IPostEditOrLinkCTA> = () => {
	const {
		postData: { created_at, last_edited_at, postType }
	} = usePostDataContext();
	const isEditCTA = last_edited_at ? dayjs(last_edited_at).diff(dayjs(created_at)) < 0 : true;
	const [open, setOpen] = useState(false);
	const [linkingAndEditingOpen, setLinkingAndEditingOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [linkingModalOpen, setLinkingModalOpen] = useState(false);
	const isOnchainPost = checkIsOnChainPost(postType);
	return (
		<GovSidebarCard>
			<div className='flex flex-col items-center py-3'>
				<div>{isEditCTA ? <PostEditIcon /> : <PostLinkingIcon />}</div>
				<span className='mt-4 text-center text-sm text-bodyBlue dark:text-blue-dark-high'>Please add contextual information for voters to make an informed decision.</span>
				<button
					className='mt-5 flex h-[40px] w-full cursor-pointer items-center justify-center gap-x-2 rounded-[4px] border-none bg-pink_primary px-9 py-1 text-lg leading-[27px] text-white shadow-[0px_6px_18px_rgba(0,0,0,0.06)] outline-none'
					onClick={() => {
						if (isEditCTA) {
							setOpen(true);
						} else {
							setLinkingAndEditingOpen(true);
						}
					}}
				>
					{isEditCTA ? (
						<>
							<EditIcon />
							<span className='text-base'>Edit Proposal Details</span>
						</>
					) : (
						<>
							<LinkOutlined />
							<span>Link {!isOnchainPost ? 'Onchain' : 'Discussion'} Post</span>
						</>
					)}
				</button>
			</div>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				open={open}
				onCancel={() => setOpen(false)}
				footer={[]}
				className={`${poppins.className} ${poppins.variable} dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				closeIcon={<CloseIcon />}
			>
				<section className='flex flex-col items-center justify-center p-3'>
					<PostEditLinkingIcon />
					<article className='mb-[35px] mt-[28px] flex flex-col items-center text-center text-xl leading-[30px] tracking-[0.01em] text-sidebarBlue'>
						<h3 className='m-0 p-0 text-lg font-medium'>Welcome Text</h3>
						<p className='m-0 mt-2 text-base'>Based on the income to the treasuries, the amounts getting burned and the amounts going to proposals.</p>
					</article>
					<article className='flex flex-col items-center gap-y-4'>
						<button
							className='h-[40px] cursor-pointer rounded-[4px] border border-solid border-pink_primary bg-pink_primary px-4 py-1 text-sm font-medium leading-[21px] tracking-[0.0125em] text-white outline-none md:min-w-[314px]'
							onClick={() => {
								setOpen(false);
								setLinkingModalOpen(true);
							}}
						>
							+ Link Existing Discussion Post
						</button>
						<button
							className='h-[40px] cursor-pointer rounded-[4px] border border-solid border-pink_primary bg-white px-4 py-1 text-sm font-medium leading-[21px] tracking-[0.0125em] text-pink_primary outline-none dark:bg-section-dark-overlay md:min-w-[314px]'
							onClick={() => {
								setOpen(false);
								setEditModalOpen(true);
							}}
						>
							Continue Without Linking
						</button>
					</article>
				</section>
			</Modal>
			<ContinueWithoutLinking
				editModalOpen={editModalOpen}
				setEditModalOpen={setEditModalOpen}
			/>
			<ContinueWithLinking
				linkingModalOpen={linkingModalOpen}
				setLinkingModalOpen={setLinkingModalOpen}
			/>
			<LinkingAndEditing
				isOnchainPost={isOnchainPost}
				linkingAndEditingOpen={linkingAndEditingOpen}
				setLinkingAndEditingOpen={setLinkingAndEditingOpen}
			/>
		</GovSidebarCard>
	);
};

export default PostEditOrLinkCTA;
