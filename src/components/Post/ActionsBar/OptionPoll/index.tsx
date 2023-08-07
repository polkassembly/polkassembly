// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IOptionPollsResponse } from "pages/api/v1/polls";
import React, { useCallback, useEffect, useState } from "react";

import { usePostDataContext } from "~src/context";
import POLL_TYPE from "~src/global/pollTypes";
import { ProposalType } from "~src/global/proposalType";
import nextApiClientFetch from "~src/util/nextApiClientFetch";

import OptionPoll from "./OptionPoll";

interface Props {
    className?: string;
    postId: number;
    canEdit: boolean;
    proposalType: ProposalType;
}

export default function OptionPollComponent({
    className,
    postId,
    canEdit,
    proposalType
}: Props) {
    const [error, setError] = useState("");
    const {
        postData: { optionPolls },
        setPostData
    } = usePostDataContext();

    const getOptionPolls = useCallback(async () => {
        const { data: fetchData, error: fetchError } =
            await nextApiClientFetch<IOptionPollsResponse>(
                `api/v1/polls?postId=${postId}&pollType=${POLL_TYPE.OPTION}&proposalType=${proposalType}`
            );

        if (fetchError) {
            setError(fetchError);
            console.error(fetchError);
            return;
        }

        if (fetchData && fetchData.optionPolls) {
            setError("");
            setPostData((prev) => {
                return {
                    ...prev,
                    optionPolls: fetchData.optionPolls
                };
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId, proposalType]);

    useEffect(() => {
        getOptionPolls();
    }, [getOptionPolls]);
    if (error && (!optionPolls || optionPolls.length === 0)) return null;

    return (
        <div className={className}>
            {optionPolls?.map((poll) => (
                <OptionPoll
                    key={poll.id}
                    optionPollId={poll.id}
                    question={poll.question}
                    options={poll.options}
                    endAt={poll.end_at}
                    canEdit={canEdit}
                    votes={poll.option_poll_votes}
                    proposalType={proposalType}
                />
            ))}
        </div>
    );
}
