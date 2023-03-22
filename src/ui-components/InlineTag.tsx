// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Tag } from 'antd';
import React from 'react';

interface Props {
	className?: string
	topic: string
}

const InlineTag = ({ className, topic } : Props) => <Tag className={`${ className }`}>{topic}</Tag>;

export default InlineTag;