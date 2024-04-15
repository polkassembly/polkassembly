// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// of the Apache-2.0 license. See the LICENSE file for details.
import { PointTooltipProps } from '@nivo/line';
export const CustomTooltip = ({ point }: PointTooltipProps) => {
	return (
		<div className='rounded-md bg-white p-4 shadow-md dark:bg-[#1E2126]'>
			<div className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Referenda #{point.data.xFormatted}</div>
			<div className='text-xl font-medium dark:text-blue-dark-high'>{Number(point.data.yFormatted).toFixed(1)}%</div>
		</div>
	);
};
