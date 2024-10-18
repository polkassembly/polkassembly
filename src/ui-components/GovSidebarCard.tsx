// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { ReactNode } from 'react-markdown/lib/ast-to-react';

interface Props {
	className?: string;
	children?: ReactNode;
	isUsedInTinderWebView?: boolean;
}

const GovSidebarCard = ({ className, children, isUsedInTinderWebView }: Props) => {
	return (
		<div
			className={`${
				isUsedInTinderWebView ? 'w-full' : 'lg:max-w-[512px] xl:drop-shadow-md'
			} mx-auto mb-9 max-h-[500px] overflow-y-auto rounded-xxl bg-white dark:bg-section-dark-overlay max-[770px]:rounded-none md:px-6 md:py-6 xl:max-h-full ${className} `}
		>
			{children}
		</div>
	);
};

export default GovSidebarCard;
