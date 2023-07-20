// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { usePostDataContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';

interface Props {
    className?: string;
    isPassing: boolean | null;
    status?: string;
}

const PassingInfoTag = ({ className, isPassing }: Props) => {
    const NO_INFO_TEXT = '-';

    const [text, setText] = useState(NO_INFO_TEXT);
    const {
        postData: { status, postType },
    } = usePostDataContext();

    useEffect(() => {
        if (
            [
                ProposalType.REFERENDUM_V2,
                ProposalType.FELLOWSHIP_REFERENDUMS,
                ProposalType.OPEN_GOV,
            ].includes(postType)
        ) {
            if (isPassing !== null) {
                setText(isPassing ? 'Passed' : 'Failed');
            }
        } else {
            if (isPassing) {
                if (['Passed', 'Executed'].includes(status)) {
                    setText('Passed');
                } else {
                    setText('Passing');
                }
            } else {
                if (status === 'NotPassed') {
                    setText('Failed');
                } else {
                    setText('Failing');
                }
            }
        }
    }, [isPassing, status, postType]);

    return (
        <Spin spinning={text === NO_INFO_TEXT} indicator={<LoadingOutlined />}>
            <div
                className={`${className} ${
                    text === NO_INFO_TEXT ? null : text.toLowerCase()
                } ml-auto text-white border-0 border-solid text-xs rounded-full px-3 py-1 whitespace-nowrap truncate h-min w-min`}
            >
                {text === 'Failed' && status
                    ? status === 'Cancelled'
                        ? 'Cancelled'
                        : status === 'TimedOut'
                        ? 'Timed Out'
                        : status === 'Killed'
                        ? 'Killed'
                        : 'Failed'
                    : text}
            </div>
        </Spin>
    );
};

export default styled(PassingInfoTag)`
    &.passing {
        background-color: #5bc044;
    }

    &.failing {
        background-color: #ff0000;
    }
    &.passed {
        background-color: #5bc044;
    }

    &.failed {
        background-color: #ff0000;
    }
`;
