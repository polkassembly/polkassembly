// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import StarIcon from '~assets/icons/StarIcon.svg';
import { poppins } from 'pages/_app';

interface Props {
	score: number;
	className?: string;
	iconWrapperClassName?: string;
	scale?: number;
}

const ScoreTag = ({ score, className, iconWrapperClassName, scale }: Props) => {
	return (
		<div
			className={`${poppins.className} ${poppins.variable} flex items-center justify-start gap-x-0.5 rounded-md px-1 ${className}`}
			style={{ background: 'linear-gradient(0deg, #FFD669 0%, #FFD669 100%), #FCC636' }}
		>
			<span className={`${iconWrapperClassName}`}>
				<StarIcon className={`scale-[${scale}]'`} />
			</span>
			<p className='m-0 ml-1 p-0 text-sm font-medium text-[#534930]'>{score}</p>
		</div>
	);
};

export default ScoreTag;
