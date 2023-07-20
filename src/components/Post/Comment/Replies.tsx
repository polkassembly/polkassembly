// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DownOutlined, UpOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

import Reply from './Reply';

interface Props {
    className?: string;
    repliesArr: any[];
    commentId: string;
}

const Replies = ({ className, commentId, repliesArr }: Props) => {
    const [showReplies, setShowReplies] = useState<boolean>(true);
    const toggleShowReplies = () => setShowReplies(!showReplies);
    return (
        <div className={className}>
            {repliesArr.length > 0 ? (
                !showReplies ? (
                    <div
                        className="text-sidebarBlue font-medium text-sm border-none cursor-pointer flex items-center"
                        onClick={toggleShowReplies}
                    >
                        {repliesArr.length} replies{' '}
                        <DownOutlined className="ml-1" />
                    </div>
                ) : (
                    <div
                        className="text-sidebarBlue font-medium text-sm border-none cursor-pointer flex items-center"
                        onClick={toggleShowReplies}
                    >
                        Hide replies <UpOutlined className="ml-1" />
                    </div>
                )
            ) : null}
            {showReplies &&
                repliesArr.map((reply: any) => {
                    return (
                        <div key={reply.id}>
                            <Reply
                                reply={reply}
                                key={reply.id}
                                commentId={commentId}
                                userName={reply.username}
                            />
                        </div>
                    );
                })}
        </div>
    );
};

export default Replies;
