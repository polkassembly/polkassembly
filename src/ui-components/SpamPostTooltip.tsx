// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tooltip } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

const SpamPostTooltip = ({ title }: { title?: string }) => {
	return (
		<Tooltip
			color='#E5007A'
			title={title || 'This post could be a spam.'}
		>
			<div className='flex items-center gap-1 rounded-md bg-[#FBEFEF] px-2 py-1 dark:bg-[#431A1C]'>
				<WarningOutlined className='text-sm text-[#EC2603] dark:text-[#FF8772]' />
				<span className='text-xs font-medium text-[#EC2603] dark:text-[#FF8772]'>Spam</span>
			</div>
		</Tooltip>
	);
};

export default SpamPostTooltip;
