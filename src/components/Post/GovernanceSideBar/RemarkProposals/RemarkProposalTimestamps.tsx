// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from 'dayjs-init';
import React from 'react';
import { usePostDataContext } from '~src/context';
import GovSidebarCard from '~src/ui-components/GovSidebarCard';

interface Props {
	className: string;
	startBlock: number;
	endBlock: number;
}

const RemarkProposalTimestamps = ({ className, startBlock, endBlock }: Props) => {
	const { postData: { created_at } } = usePostDataContext();
	return (
		<GovSidebarCard className={className}>
			<div className="dashboard-heading mb-4">Timestamps</div>
			<div className="flex flex-col gap-y-2">
				<div className="flex justify-between">
					<span className='text-md text-gray-600 font-medium'>Created</span>
					<span className='text-pink-400 font-medium'>{ dayjs(created_at).format('D-MM-YY | hh:mm') }</span>
				</div>

				<div className="flex justify-between">
					<span className='text-md text-gray-600 font-medium'>Start Block</span>
					<span className='text-pink-400 font-medium'> {startBlock} </span>
				</div>

				<div className="flex justify-between">
					<span className='text-md text-gray-600 font-medium'>End Block</span>
					<span className='text-pink-400 font-medium'> { endBlock } </span>
				</div>
			</div>
		</GovSidebarCard>
	);
};

export default RemarkProposalTimestamps;