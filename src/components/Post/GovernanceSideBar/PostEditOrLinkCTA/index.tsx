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

interface IPostEditOrLinkCTA {
    className?: string;
}

const PostEditOrLinkCTA: FC<IPostEditOrLinkCTA> = () => {
    const {
        postData: { created_at, last_edited_at, postType },
    } = usePostDataContext();
    const isEditCTA = last_edited_at
        ? dayjs(last_edited_at).diff(dayjs(created_at)) < 0
        : true;
    const [open, setOpen] = useState(false);
    const [linkingAndEditingOpen, setLinkingAndEditingOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [linkingModalOpen, setLinkingModalOpen] = useState(false);
    const isOnchainPost = checkIsOnChainPost(postType);
    return (
        <GovSidebarCard>
            <div className="flex flex-col items-center py-3">
                <div>{isEditCTA ? <PostEditIcon /> : <PostLinkingIcon />}</div>
                <button
                    className="border-none outline-none flex items-center justify-center gap-x-2 font-medium text-lg leading-[27px] w-full mt-5 text-white bg-pink_primary rounded-[4px] py-1 px-9 shadow-[0px_6px_18px_rgba(0,0,0,0.06)] cursor-pointer"
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
                            <span>Edit Proposal Details</span>
                        </>
                    ) : (
                        <>
                            <LinkOutlined />
                            <span>
                                Link {!isOnchainPost ? 'Onchain' : 'Discussion'}{' '}
                                Post
                            </span>
                        </>
                    )}
                </button>
            </div>
            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                footer={[]}
                className="md:min-w-[674px]"
            >
                <section className="flex flex-col items-center justify-center p-3">
                    <PostEditLinkingIcon />
                    <article className="text-sidebarBlue flex flex-col items-center mt-[28px] mb-[35px] text-xl leading-[30px] tracking-[0.01em]">
                        <h3 className="font-medium m-0 p-0">Welcome Text</h3>
                        <p className="m-0 p-0">
                            Based on the income to the treasuries, the amounts
                            getting burned and the amounts going to proposals.
                        </p>
                    </article>
                    <article className="flex flex-col gap-y-4 items-center">
                        <button
                            className="md:min-w-[314px] outline-none rounded-[4px] border border-solid border-pink_primary py-1 px-4 bg-pink_primary text-white cursor-pointer font-medium text-sm leading-[21px] tracking-[0.0125em]"
                            onClick={() => {
                                setOpen(false);
                                setLinkingModalOpen(true);
                            }}
                        >
                            + Link Existing Discussion Post
                        </button>
                        <button
                            className="md:min-w-[314px] outline-none rounded-[4px] border border-solid border-pink_primary py-1 px-4 bg-white text-pink_primary cursor-pointer font-medium text-sm leading-[21px] tracking-[0.0125em]"
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
