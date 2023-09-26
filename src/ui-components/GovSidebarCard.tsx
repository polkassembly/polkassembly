// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { ReactNode } from 'react-markdown/lib/ast-to-react';

interface Props {
	className?: string;
	children?: ReactNode;
}

const GovSidebarCard = ({ className, children }: Props) => {
	return (
		<div className={`${className} mx-auto  mb-9 max-h-[500px] rounded-xxl bg-white max-[770px]:rounded-none md:px-6 md:py-6 lg:max-w-[512px] xl:max-h-full xl:drop-shadow-md`}>
			{children}
		</div>
	);
};

export default React.memo(GovSidebarCard);
