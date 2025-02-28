// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useGlobalSelector } from '~src/redux/selectors';
import { WarningOutlined } from '@ant-design/icons';
import useIsMobile from '~src/hooks/useIsMobile';

const SpamPostBanner = () => {
	const { is_sidebar_collapsed } = useGlobalSelector();
	const isMobile = useIsMobile();

	return (
		<div
			className={`${!isMobile ? 'absolute top-0' : 'relative'} left-0  z-10 w-full items-center gap-1 bg-[#FBEFEF] p-3 dark:bg-[#431A1C] ${
				is_sidebar_collapsed ? 'pl-28 max-sm:pl-5' : 'pl-[265px] max-sm:pl-5'
			}`}
		>
			<WarningOutlined className='text-base text-[#EC2603] dark:text-[#FF8772]' />
			<span className='text-sm font-medium text-[#EC2603] dark:text-[#FF8772]'> This post is flagged as spam!</span>
		</div>
	);
};

export default SpamPostBanner;
