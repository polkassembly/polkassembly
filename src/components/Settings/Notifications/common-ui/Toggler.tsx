// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Switch } from 'antd';
import React from 'react';
import styled from 'styled-components';

type Props = {
    selected: boolean;
    label: string;
};

const Toggle = styled(Switch)`
    // &.ant-switch.ant-switch-small{
    //     max-width:18px;
    //     height:10px;
    // }
    // $.ant-switch.ant-switch-small.ant-switch-checked .ant-switch-handle{
    //     inset-inline-start: calc(100% - 8px);
    // }
    // &.ant-switch.ant-switch-small .ant-switch-handle{
    //     width:5px;
    //     height:5px;
    // }
`;

export default function Toggler({ label }: Props) {
	return (
		<span className='flex gap-[8px] items-center'>
			<Toggle size='small' id='postParticipated' onClick={(checked, e) => e.stopPropagation()}/>
			<p className='m-0 text-[#243A57B2]'>{label}</p>
		</span>
	);
}
