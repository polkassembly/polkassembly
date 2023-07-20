// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import dayjs from 'dayjs';
import { ILinkPostStartResponse } from 'pages/api/v1/auth/actions/linkPostStart';
import React, { FC } from 'react';
import CreationLabel from '~src/ui-components/CreationLabel';
import Markdown from '~src/ui-components/Markdown';
import UpdateLabel from '~src/ui-components/UpdateLabel';

const LinkPostPreview: FC<{
    post?: ILinkPostStartResponse;
    className?: string;
}> = (props) => {
    const { post, className } = props;
    if (!post) return null;
    const { tags } = post;
    return (
        <section
            className={`border border-solid border-[rgba(72,95,125,0.2)] rounded-[4px] p-4 ${className}`}
        >
            <h3 className=" font-medium text-sm leading-[21px] tracking-[0.01em] text-sidebarBlue">
                {post.title}
            </h3>
            <div className="my-3">
                <CreationLabel
                    className="md"
                    created_at={dayjs(post.created_at).toDate()}
                    defaultAddress={post.proposer}
                    username={post.username}
                    topic={post.topic && post.topic?.name}
                >
                    <UpdateLabel
                        className="md"
                        created_at={post.created_at}
                        updated_at={post.last_edited_at}
                    />
                </CreationLabel>
            </div>
            {tags && Array.isArray(tags) && tags.length > 0 && (
                <div className="flex my-3 gap-[8px]">
                    {tags?.map((tag, index) => {
                        return (
                            <div
                                className="rounded-[11.5px] px-4 py-0 border-navBlue border-solid border text-navBlue text-xs tracking-[0.01em] hover:border-pink_primary hover:text-pink_primary leading-[20px] flex items-center justify-center"
                                key={index}
                            >
                                {tag}
                            </div>
                        );
                    })}
                </div>
            )}
            <div>
                <Markdown
                    className="text-xs font-normal text-navBlue leading-[20px]"
                    md={post.description.slice(0, 400) + '...'}
                />
            </div>
        </section>
    );
};

export default LinkPostPreview;
