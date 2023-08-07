// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tooltip } from "antd";
import { dayjs } from "dayjs-init";
import React from "react";
import styled from "styled-components";

interface Props {
    className?: string;
    created_at: Date | string;
    updated_at?: Date | string;
    isHistory?: boolean;
}

const UpdateLabel = ({
    className,
    created_at,
    updated_at,
    isHistory
}: Props) => {
    if (!updated_at) return null;
    const defaultTime = "a few minutes ago";
    const title =
        dayjs.utc(updated_at, "YYYY-MM-DDTHH:mm:ss.SSS").fromNow() !==
        "NaN years ago"
            ? dayjs.utc(updated_at, "YYYY-MM-DDTHH:mm:ss.SSS").fromNow()
            : defaultTime;
    return updated_at.toString() === created_at.toString() ? null : (
        <span className={className}>
            <Tooltip color="#E5007A" title={title}>
                <span
                    className={`text-navBlue text-xs leading-4 ${
                        isHistory && "text-pink_primary"
                    }`}
                >
                    (Edited)
                </span>
            </Tooltip>
        </span>
    );
};

export default styled(UpdateLabel)`
    margin-left: 0.5rem;
    font-size: sm;
    color: grey_secondary;
`;
