// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface Props {
	className?: string;
	isPassing: boolean | null;
	status?: string;
}

const PassingInfoTag = ({ className, isPassing, status }:Props ) => {
	const NO_INFO_TEXT = '-';

	let text = NO_INFO_TEXT;
	if (isPassing !== null){
		text = isPassing ? 'Passed' : 'Failed';
	}

	return (
		<Spin spinning={text === NO_INFO_TEXT} indicator={<LoadingOutlined />}>
			<div className={`${className} ${text === NO_INFO_TEXT ? null : text.toLowerCase()} ml-auto text-white border-0 border-solid text-xs rounded-full px-3 py-1 whitespace-nowrap truncate h-min w-min`}>
				{(text === 'Failed' && status)? status === 'Cancelled'? 'Cancelled': status === 'TimedOut'? 'Timed Out': status === 'Killed'? 'Killed': 'Failed': text}
			</div>
		</Spin>
	);
};

export default styled(PassingInfoTag)`
	&.passed {
		background-color: #4DD18F;
	}

	&.failed {
		background-color: #FF5A47;
	}
`;
