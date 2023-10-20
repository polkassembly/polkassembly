// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactNode } from 'react';

interface Props {
	className?: string;
	children: ReactNode;
}

const Card = ({ className, children }: Props) => {
	return <div className={`${className} mb-[1rem] rounded-md bg-white dark:bg-section-dark-overlay px-[2rem] py-[2rem] text-sm drop-shadow-md md:px-[3rem]`}>{children}</div>;
};

export default Card;
