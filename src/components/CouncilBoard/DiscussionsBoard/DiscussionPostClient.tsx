// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IPostResponse } from "pages/api/v1/posts/on-chain-post";
import React, { FC, useEffect, useState } from "react";
import Post from "src/components/Post/Post";
import { PostCategory } from "src/global/post_categories";
import BackToListingView from "src/ui-components/BackToListingView";
import { ErrorState, LoadingState } from "src/ui-components/UIStates";

import { ProposalType } from "~src/global/proposalType";
import nextApiClientFetch from "~src/util/nextApiClientFetch";

interface IDiscussionPostClient {
    councilBoardSidebar: boolean;
    postID: string | number;
}

const DiscussionPostClient: FC<IDiscussionPostClient> = ({
    councilBoardSidebar = false,
    postID
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [post, setPost] = useState<IPostResponse>();
    useEffect(() => {
        setLoading(true);
        nextApiClientFetch<IPostResponse>(
            `api/v1/posts/discussion?postId=${postID}`
        )
            .then((res) => {
                if (res.data) {
                    setPost(res.data);
                } else if (res.error) {
                    setError(res.error);
                }
                setLoading(false);
            })
            .catch((err) => {
                setError(err?.message || err);
                setLoading(false);
            });
    }, [postID]);
    if (loading) return <p>loading...</p>;
    if (error) return <ErrorState errorMessage={error} />;

    if (post)
        return (
            <div>
                {!councilBoardSidebar && (
                    <BackToListingView postCategory={PostCategory.DISCUSSION} />
                )}

                <div className="mt-6">
                    <Post post={post} proposalType={ProposalType.DISCUSSIONS} />
                </div>
            </div>
        );

    return (
        <div className="mt-16">
            <LoadingState />
        </div>
    );
};

export default DiscussionPostClient;
