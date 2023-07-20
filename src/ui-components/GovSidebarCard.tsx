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
		<div
			className={`${className} bg-white overflow-y-auto mx-auto max-h-[500px] xl:max-h-full xl:drop-shadow-md md:py-6 md:px-6 rounded-xxl mb-9 lg:max-w-[512px] max-[770px]:rounded-none`}
		>
			{children}
		</div>
	);
};

export default GovSidebarCard;
