// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tag } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface Props{
	className?: string,
	topic: string
}

const TopicTag = ({ className, topic }: Props) => {

	return (
		<Tag className={`${className} ${topic} text-[10px] py-[0.1em] px-2 m-0`}>{topic}</Tag>
	);
};

export default styled(TopicTag)`
	font-weight: 500;
	background-color: var(--grey_primary);
	color: white;
	border-style: solid;
	border-width: 1px;
	border-radius: 0.2rem;
	letter-spacing: 0.05rem;
	text-transform: capitalize;

	@media only screen and (max-width: 576px) {
		padding: 0.2rem 0.4rem;
	}

	&.Democracy {
		background-color: var(--blue_primary) !important;
		color: white;
	}
	&.Council {
		background-color: var(--pink_secondary) !important;
		color: white;
	}
	&.Treasury {
		background-color: var(--pink_primary) !important;
		color: white;
	}
	&.Technical, &.Tech {
		background-color: var(--pink_primary) !important;
		color: white;
	}
`;
