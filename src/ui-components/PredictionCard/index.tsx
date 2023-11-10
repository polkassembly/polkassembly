// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { Avatar } from 'antd';
import React from 'react';
import styled from 'styled-components';
import InfoIcon from '~assets/info.svg';

interface Props {
	predictCount: number;
}

const Container = styled.div`
	border-radius: 14px;
	width: 350px;
	height: 100px;
	padding: 20px;
	bottom: 20px;
	right: 140px;
	position: fixed;
	background: linear-gradient(92deg, #ff9494 2.08%, #ffc471 97.09%);
	color: #243a57;
	display: flex;
	flex-direction: column;
	gap: 12px;
	h1 {
		font-size: 20px;
		font-style: normal;
		font-weight: 600;
		line-height: 24px;
		letter-spacing: 0.03px;
		margin: 0;
	}
	p {
		font-size: 14px;
		font-style: normal;
		font-weight: 400;
		line-height: 21px; /* 150% */
		letter-spacing: 0.07px;
		margin: 0;
	}
	svg {
		color: #243a57;
	}
	@media (max-width: 500px) {
		bottom: 100px;
		right: 26px;
	}
`;

const PredictionCard = ({ predictCount }: Props) => {
	if (predictCount === 0) {
		return <></>;
	}
	return (
		<Container>
			<div className='flex items-center justify-between'>
				<h1 className='relative'>
					Prediction
					<span className='absolute '>
						<InfoIcon />
					</span>
				</h1>
				{/* TODO:Aleem ==> Will uncomment this when get the pridiction count from API */}
				{/* <p className='text-xs'>
					<Avatar.Group size='small'>
						<Avatar style={{ backgroundColor: '#87d068', border: 'none', height: 20, width: 20 }}>G</Avatar>
						<Avatar style={{ backgroundColor: '#1677ff', border: 'none', height: 20, width: 20 }}>+{predictCount}</Avatar>
					</Avatar.Group>
					predictions
				</p> */}
			</div>
			<div className='flex items-center justify-between'>
				<p>Will this proposal pass or fail?</p>
				<a
					className='rounded-2xl bg-white px-2 py-1 text-xs text-[#F02A4E]'
					href='https://app.zeitgeist.pm/markets/307'
					target='_blank'
					rel='noreferrer'
				>
					Predict
				</a>
			</div>
		</Container>
	);
};
export default PredictionCard;
