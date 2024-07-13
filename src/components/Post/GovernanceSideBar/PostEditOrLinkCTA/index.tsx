// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useState } from 'react';
import { usePostDataContext } from '~src/context';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { Modal } from 'antd';
import ContinueWithLinking from './ContinueWithLinking';
import LinkingAndEditing from './LinkingAndEditing';
import { checkIsOnChainPost } from '~src/global/proposalType';
import { poppins } from 'pages/_app';
import ImageIcon from '~src/ui-components/ImageIcon';

interface IPostEditOrLinkCTA {
	className?: string;
	open: boolean;
	setOpen: (state: boolean) => void;
	linkingAndEditingOpen: boolean;
	setLinkingAndEditingOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PostEditOrLinkCTA: FC<IPostEditOrLinkCTA> = ({ open, setOpen, linkingAndEditingOpen, setLinkingAndEditingOpen }) => {
	const {
		postData: { postType }
	} = usePostDataContext();
	const [linkingModalOpen, setLinkingModalOpen] = useState(false);
	const isOnchainPost = checkIsOnChainPost(postType);
	return (
		<>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				open={open}
				onCancel={() => setOpen(false)}
				footer={[]}
				className={`${poppins.className} ${poppins.variable} dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			>
				<section className='flex flex-col items-center justify-center p-3'>
					<ImageIcon
						src='/assets/icons/post-edit-linking.svg'
						alt='post edit linking icon'
					/>
					<article className='mb-[35px] mt-[28px] flex flex-col items-center text-center text-xl leading-[30px] tracking-[0.01em] text-sidebarBlue dark:text-blue-dark-high'>
						<h3 className='m-0 p-0 text-lg font-medium'>Link discussion</h3>
						<p className='m-0 mt-2 text-sm'>Please add contextual info for voters to make an informed decision</p>
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
								// setEditModalOpen(true);
							}}
						>
							Continue Without Linking
						</button>
					</article>
				</section>
			</Modal>
			<ContinueWithLinking
				linkingModalOpen={linkingModalOpen}
				setLinkingModalOpen={setLinkingModalOpen}
			/>
			<LinkingAndEditing
				isOnchainPost={isOnchainPost}
				linkingAndEditingOpen={linkingAndEditingOpen}
				setLinkingAndEditingOpen={setLinkingAndEditingOpen}
			/>
		</>
	);
};

export default PostEditOrLinkCTA;
