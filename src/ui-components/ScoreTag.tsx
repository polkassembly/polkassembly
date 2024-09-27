// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import StarIcon from '~assets/icons/StarIcon.svg';
import { poppins } from 'pages/_app';
import { Tooltip } from 'antd';
import Image from 'next/image';
import classNames from 'classnames';
import { useTheme } from 'next-themes';
import styled from 'styled-components';

interface Props {
	score: number;
	className?: string;
	iconWrapperClassName?: string;
	scale?: number;
}

const ScoreTag = ({ score, className, iconWrapperClassName, scale }: Props) => {
	const { resolvedTheme: theme } = useTheme();

	return (
		<Tooltip
			color='#363636'
			className={`${className} max-w-[505px]`}
			title={
				<article className='max-w-[505px] whitespace-nowrap flex text-sm text-white items-center justify-center gap-x-2'>
					<div className='flex items-center justify-center gap-x-1'>
						<Image
							src='/assets/icons/onChain-icon.svg'
							alt='on-chain-icon'
							height={20}
							width={20}
							className={'cursor-pointer'}
						/>
						<p className='m-0 p-0 text-white text-sm'>On-chain activity:</p>
						<span className='m-0 p-0 text-[#2AE653] text-sm'>+300</span>
					</div>
					<div className='flex items-center justify-center gap-x-1'>
						<Image
							src='/assets/icons/onChain-icon.svg'
							alt='on-chain-icon'
							height={20}
							width={20}
							className={'cursor-pointer'}
						/>
						<p className='m-0 p-0 text-white text-sm'>On-chain activity:</p>
						<span className='m-0 p-0 text-[#2AE653] text-sm'>+300</span>
					</div>
					<div className='flex items-center justify-center gap-x-1'>
						<Image
							src='/assets/icons/onChain-icon.svg'
							alt='on-chain-icon'
							height={20}
							width={20}
							className={'cursor-pointer'}
						/>
						<p className='m-0 p-0 text-white text-sm'>On-chain activity:</p>
						<span className='m-0 p-0 text-[#2AE653] text-sm'>+300</span>
					</div>
				</article>
			}
		>
			<div
				className={`${poppins.className} ${poppins.variable} flex items-center justify-start gap-x-0.5 rounded-md px-1 cursor-pointer ${className}`}
				style={{ background: 'linear-gradient(0deg, #FFD669 0%, #FFD669 100%), #FCC636' }}
			>
				<span className={`${iconWrapperClassName}`}>
					<StarIcon className={`scale-[${scale}]'`} />
				</span>
				<p className='m-0 ml-1 p-0 text-sm font-medium text-[#534930]'>{score}</p>
			</div>
		</Tooltip>

	);
};

export default styled(ScoreTag)`
	.ant-tooltip {
		width: 505px !important;
		max-width: 505px !important;
	}
`;
