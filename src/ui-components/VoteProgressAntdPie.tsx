// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-tabs */
// import { Pie } from '@ant-design/plots';
// import BN from 'bn.js';
// import { FC } from 'react';
// import styled from 'styled-components';
// import { useNetworkContext } from '~src/context';
// import formatBnBalance from '~src/util/formatBnBalance';

// interface IVoteProgressProps {
// 	ayeVotes?: BN;
// 	className?: string;
// 	nayVotes?: BN;
// 	ayesNum?: number;
// 	naysNum?: number;
// 	turnoutPercentage?: number;
// }

// const ZERO = new BN(0);

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const VoteProgress: FC<IVoteProgressProps> = ({ ayeVotes, className, nayVotes, ayesNum, naysNum, turnoutPercentage }) => {
// 	const { network } = useNetworkContext();

// 	const bnToIntBalance = function (bn: BN): number{
// 		return  Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
// 	};

// 	const ayeVotesNumber = ayesNum === undefined ? bnToIntBalance(ayeVotes || ZERO) : Number(ayesNum);
// 	const totalVotesNumber = (ayesNum === undefined || naysNum === undefined) ? bnToIntBalance(ayeVotes?.add(nayVotes|| ZERO) || ZERO) : (Number(ayesNum) + Number(naysNum));
// 	const ayePercent = ayeVotesNumber/totalVotesNumber*100;
// 	const nayPercent = 100 - ayePercent;
// 	return (
// 		<div className={`${className} flex justify-center items-end gap-x-2 relative`}>
// 			<div className='mb-12 flex flex-col justify-center'>
// 				<span className='text-[#2ED47A] text-[20px] leading-6 font-semibold'>{ayePercent.toFixed(1)}%</span>
// 				<span className='text-[#485F7D] font-medium text-xs leading-[18px] tracking-[0.01em]'>Aye</span>
// 			</div>
// 			{/* {
// 				turnoutPercentage?
// 					<div className='absolute top-6 z-50 w-full flex items-center justify-center flex-col'>
// 						<p className='m-0 p-0 text-[#485F7D] font-medium text-xs leading-[22px]'>
// 					Threshold {turnoutPercentage?.toFixed(1)}%
// 						</p>
// 						<div className='h-[43px] border border-dashed border-navBlue'></div>
// 					</div>
// 					: null
// 			} */}
// 			<div className='w-[200px] h-[200px] flex items-center justify-center pie'>
// 				<Pie
// 					angleField='value'
// 					colorField='type'
// 					className='w-full h-full'
// 					color={['#6DE1A2', '#FF778F']}
// 					radius={1}
// 					innerRadius={0.75}
// 					startAngle={Math.PI}
// 					endAngle={0}
// 					annotations={[]}
// 					interactions={[
// 						{
// 							enable: false,
// 							type: ''
// 						}
// 					]}
// 					label={false}
// 					legend={false}
// 					tooltip={{
// 						customContent: (title, data) => {
// 							if (!title || !data) return null;
// 							return <div className='flex items-center justify-between gap-x-2 py-2'>
// 								<p className='m-0 font-medium text-xs'>{title}:</p>
// 								<p className='m-0'>{data[0].data.value.toFixed(1)}%</p>
// 							</div>;
// 						}
// 					}}
// 					statistic={
// 						{
// 							content: false,
// 							title: false
// 						}
// 					}
// 					data={[
// 						{ type: 'Aye', value: ayePercent },
// 						{ type: 'Nay', value: nayPercent }
// 					]}
// 				/>
// 			</div>
// 			<div className='mb-12 flex flex-col justify-center'>
// 				<span className='text-[#E84865] text-[20px] leading-6 font-semibold'>{nayPercent.toFixed(1)}%</span>
// 				<span className='text-[#485F7D] font-medium text-xs leading-[18px] tracking-[0.01em]'>Nay</span>
// 			</div>
// 		</div>
// 	);
// };

// export default styled(VoteProgress)`
// 	.pie .g2-tooltip-list-item {
// 		display: flex !important;
// 		align-items: center !important;
// 	}
// `;

import React from 'react';

const VoteProgressAntdPie = () => {
	return <div>VoteProgressAntdPie</div>;
};

export default VoteProgressAntdPie;
