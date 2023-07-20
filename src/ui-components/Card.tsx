// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactNode } from 'react';

interface Props {
	className?: string;
	children: ReactNode;
}

const Card = ({ className, children }: Props) => {
	return (
		<div
			className={`${className} bg-white py-[2rem] px-[2rem] md:px-[3rem] drop-shadow-md rounded-md mb-[1rem] text-sm`}
		>
			{children}
		</div>
	);
};

export default Card;
