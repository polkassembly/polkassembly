// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Pagination } from "antd";
import React from "react";
import styled from "styled-components";
import { noTitle } from "~src/global/noTitle";
import chainLogo from "~assets/parachain-logos/chain-logo.jpg";
import { ClockCircleOutlined } from "@ant-design/icons";
import Address from "~src/ui-components/Address";
import Markdown from "~src/ui-components/Markdown";
import { chainProperties } from "~src/global/networkConstants";
import Image from "next/image";
import TopicTag from "~src/ui-components/TopicTag";
import { getTopicNameFromTopicId } from "~src/util/getTopicFromType";
import {
    ProposalType,
    getSinglePostLinkFromProposalType
} from "~src/global/proposalType";
import { getTopicFromType } from "~src/util/getTopicFromType";
import { LISTING_LIMIT } from "~src/global/listingLimit";
import getRelativeCreatedAt from "~src/util/getRelativeCreatedAt";
import LikeIcon from "~assets/search/search-like.svg";
import DislikeIcon from "~assets/search/search-dislike.svg";
import CommentIcon from "~assets/search/search-comment.svg";
import dayjs from "dayjs";

interface Props {
    className?: string;
    postsData: any[];
    setOpenModal: (pre: boolean) => void;
    isSuperSearch: boolean;
    setPostsPage: (postsPage: any) => void;
    postsPage: number;
    totalPage: number;
}
const ResultPosts = ({
    className,
    postsData,
    isSuperSearch,
    postsPage,
    setPostsPage,
    totalPage
}: Props) => {
    return postsData.length > 0 ? (
        <>
            <div
                className={`${className} mt-4 -mx-6 h-[400px] ${
                    postsData.length > 1 && "overflow-y-scroll"
                }`}
            >
                {postsData.map((post, index: number) => {
                    let titleString = post?.title || noTitle;

                    const titleTrimmed =
                        titleString.match(/.{1,80}(\s|$)/g)![0];
                    titleString = `${titleTrimmed} ${
                        titleTrimmed.length != titleString.length ? "..." : ""
                    }`;

                    return (
                        <a
                            rel="noreferrer"
                            href={`https://${post?.network}.polkassembly.io/${getSinglePostLinkFromProposalType(
                                post?.post_type
                            )}/${post?.id}`}
                            key={index}
                            target="_blank"
                        >
                            <div
                                className={`py-8 px-9 max-sm:p-5 border-[#f3f4f5] border-solid flex-col border-[1px] shadow-[0px 22px 40px -4px rgba(235, 235, 235, 0.8)] rounded-none border-b-[0px] hover:border-pink_primary hover:border-b-[1px] cursor-pointer min-h-[200px] ${
                                    index % 2 === 1 && "bg-[#fafafb]"
                                } ${
                                    index === postsData.length - 1 &&
                                    "border-b-[1px]"
                                } max-md:flex-wrap`}
                            >
                                <div className="flex gap-2 items-center">
                                    {post?.proposer_address ? (
                                        <Address
                                            address={post?.proposer_address}
                                            displayInline
                                            textClassName="text-xs text-lightBlue"
                                        />
                                    ) : (
                                        <div className="text-xs text-lightBlue font-medium mb-1">
                                            {post?.username}
                                        </div>
                                    )}
                                    <div className="flex gap-2 items-center text-xs text-lightBlue md:hidden">
                                        <Divider
                                            style={{
                                                border: "1px solid var(--lightBlue)"
                                            }}
                                            type="vertical"
                                        />
                                        <ClockCircleOutlined className="-mr-1" />
                                        {getRelativeCreatedAt(
                                            dayjs
                                                .unix(post?.created_at)
                                                .toDate()
                                        )}
                                    </div>
                                </div>
                                <span className="text-[#243A57] text-sm font-medium mt-2">
                                    {titleString}
                                </span>
                                <Markdown
                                    imgHidden={true}
                                    md={post?.content?.slice(0, 250) + " ....."}
                                    className="text-[#8696a9] text-sm font-normal my-2 tracking-[0.01em] expand-content"
                                />
                                <div className="my-2 flex flex-shrink-0 gap-1 flex-wrap max-sm:mt-2">
                                    <div className="flex gap-2 items-center text-xs text-lightBlue max-sm:hidden">
                                        <div className="flex gap-1 items-center text-xs text-lightBlue">
                                            <LikeIcon />
                                            <span>
                                                {post?.reaction_count?.["👍"] ||
                                                    0}
                                            </span>
                                        </div>
                                        <div className="flex gap-1 items-center text-xs text-lightBlue">
                                            <DislikeIcon />
                                            <span>
                                                {post?.reaction_count?.["👎"] ||
                                                    0}
                                            </span>
                                        </div>
                                        <div className="flex gap-1 items-center text-xs text-lightBlue">
                                            <CommentIcon />
                                            <span>
                                                {post?.comments_count || 0}
                                            </span>
                                        </div>
                                        <Divider
                                            style={{
                                                border: "1px solid var(--lightBlue)"
                                            }}
                                            type="vertical"
                                        />
                                    </div>
                                    {post?.tags && post?.tags.length > 0 && (
                                        <div className="flex gap-1 items-center">
                                            {post?.tags
                                                ?.slice(0, 2)
                                                .map(
                                                    (
                                                        tag: string,
                                                        index: number
                                                    ) => (
                                                        <div
                                                            key={index}
                                                            className="rounded-[50px] px-[14px] py-1 border-[#D2D8E0] bg-white border-solid border-[1px] font-medium text-lightBlue text-[10px]"
                                                        >
                                                            {tag}
                                                        </div>
                                                    )
                                                )}
                                            {post?.tags.length > 2 && (
                                                <span className="text-[10px] font-medium text-[#243A57] px-2 py-1 bg-[#e7e9ee] rounded-[50px]">
                                                    +{post?.tags.length - 2}
                                                </span>
                                            )}
                                            <Divider
                                                style={{
                                                    border: "1px solid var(--lightBlue)"
                                                }}
                                                type="vertical"
                                            />
                                        </div>
                                    )}
                                    <div className="flex gap-2 items-center text-xs text-lightBlue max-sm:hidden">
                                        <ClockCircleOutlined className="-mr-1" />
                                        {getRelativeCreatedAt(
                                            dayjs
                                                .unix(post?.created_at)
                                                .toDate()
                                        )}
                                        <Divider
                                            style={{
                                                border: "1px solid var(--lightBlue)"
                                            }}
                                            type="vertical"
                                        />
                                    </div>
                                    {(post?.topic || post?.topic_id) && (
                                        <div className="flex items-center">
                                            <TopicTag
                                                className="ml-1"
                                                topic={
                                                    post?.topic
                                                        ? post?.topic?.name
                                                        : getTopicNameFromTopicId(
                                                              (post?.topic_id ||
                                                                  getTopicFromType(
                                                                      post?.postType as ProposalType
                                                                  )?.id) as any
                                                          )
                                                }
                                            />
                                            <Divider
                                                style={{
                                                    border: "1px solid var(--lightBlue)"
                                                }}
                                                type="vertical"
                                            />
                                        </div>
                                    )}
                                    {!!isSuperSearch && (
                                        <div className="flex justify-center items-center mr-2">
                                            <Image
                                                className="w-4 h-4 object-contain rounded-full"
                                                src={
                                                    chainProperties[
                                                        post?.network
                                                    ]?.logo
                                                        ? chainProperties[
                                                              post?.network
                                                          ].logo
                                                        : chainLogo
                                                }
                                                alt="Logo"
                                            />
                                        </div>
                                    )}
                                    <div className="flex gap-2 items-center text-xs text-lightBlue">
                                        in{" "}
                                        <span className="text-pink_primary capitalize">
                                            {post?.post_type ===
                                            "referendums_v2"
                                                ? "Opengov referenda"
                                                : (
                                                      post?.post_type as ProposalType
                                                  )
                                                      ?.split("_")
                                                      ?.join(" ")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
            <div className="flex justify-center items-center py-4 px-4">
                <Pagination
                    defaultCurrent={1}
                    current={postsPage}
                    pageSize={LISTING_LIMIT}
                    total={totalPage}
                    showSizeChanger={false}
                    hideOnSinglePage={true}
                    onChange={(page: number) => setPostsPage(page)}
                    responsive={true}
                />
            </div>
        </>
    ) : null;
};
export default styled(ResultPosts)`
    .expand-content {
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        width: 100%;
        overflow: hidden !important;
    }
`;
