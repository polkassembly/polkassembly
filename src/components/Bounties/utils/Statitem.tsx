// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export const StatItem = ({ label, value }: { label: string; value: string }) => (
	<div className='flex flex-col'>
		<span className='font-pixelify text-[18px] font-semibold text-[#2D2D2D] dark:text-[#737373]'>{label}</span>
		<span className='font-pixeboy text-[28px] font-medium'>{value}</span>
	</div>
);
