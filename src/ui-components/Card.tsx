// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactNode } from 'react';

interface Props {
	className?: string;
	children: ReactNode;
}

<<<<<<< HEAD
const Card = ({ className, children }:Props ) => {
	return (
		<div className={`${className} bg-white dark:bg-section-dark-overlay py-[2rem] px-[2rem] md:px-[3rem] drop-shadow-md rounded-md mb-[1rem] text-sm`}>{children}</div>
	);
=======
const Card = ({ className, children }: Props) => {
	return <div className={`${className} mb-[1rem] rounded-md bg-white px-[2rem] py-[2rem] text-sm drop-shadow-md md:px-[3rem]`}>{children}</div>;
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
};

export default Card;
