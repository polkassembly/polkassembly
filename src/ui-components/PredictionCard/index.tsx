// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { trackEvent } from 'analytics';
import { Tooltip, Avatar } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { InfoIcon } from '../CustomIcons';

const Container = styled.div`
	border-radius: 14px;
	max-width: 360px;
	width: 100%;
	height: auto;
	padding: 20px;
	margin-bottom: 20px;
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
	@media (min-width: 1280px) {
		position: ${(props) => (props['aria-expanded'] ? 'fixed' : 'static')};
		max-width: ${(props) => (props['aria-expanded'] ? '' : '100%')};
		bottom: 80px;
		right: auto;
		z-index: 999;
	}
`;

const PredictionCard = () => {
	const currentUser = useUserDetailsSelector();

	const [YesPercentage, setYesPercentage] = useState(0);
	const [predictCount, setPredictCount] = useState(0);
	const [yesCount, setyesCount] = useState(0);
	const [endDate, setEndDate] = useState('');
	const [hasEnded, setHasEnded] = useState(false);

	const [isFixed, setIsFixed] = useState(true);
	const govSideBarRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		const handleScroll = () => {
			govSideBarRef.current = document.getElementById('gov-side-bar');
			if (!govSideBarRef.current) {
				return;
			}

			const sideBar = govSideBarRef.current.getBoundingClientRect();

			const isBottom = window.scrollY + window.innerHeight >= sideBar.bottom;

			setIsFixed(!isBottom);
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, [isFixed]);

	useEffect(() => {
		async function getPredictionsData() {
			const data = await fetch('https://zeitgeist-squid-mainnet.stellate.sh', {
				body: JSON.stringify({
					query: `
						query MarketDetails($marketId: Int = 415) {
							markets(where: {marketId_eq: $marketId}) {
								period {
									end
								}
								assets {
									assetId
									price
								}
							}
							marketStats(marketId: [$marketId]) {
								participants
							}
						}
					`
				}),
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'POST',
				next: { revalidate: 10 }
			})
				.then((res) => res.json())
				.then((res) => res.data);

			const timestamp = Number(data.markets[0].period.end);

			setHasEnded(timestamp < Date.now());

			setEndDate(convertTimestampToDate(timestamp));
			setPredictCount(data.marketStats[0].participants);
			setyesCount(data.markets[0].assets[1].price);
		}
		getPredictionsData();
	}, []);

	function convertTimestampToDate(timestamp: number): string {
		const date = new Date(timestamp);
		const day = String(date.getDate()).padStart(2, '0');
		const month = date.toLocaleString('en-us', { month: 'short' });
		const year = String(date.getFullYear()).slice(-2);
		return `${day} ${month} ‘${year}`;
	}

	useEffect(() => {
		setYesPercentage(Math.round((yesCount / 1) * 100));
	}, [yesCount, predictCount]);

	return (
		<Container aria-expanded={isFixed}>
			<div className='flex items-center justify-between font-poppins'>
				<h1 className='flex items-center gap-1 text-xl font-semibold leading-6'>
					Prediction
					<Tooltip
						color='#243A57'
						title='Will this proposal pass or fail?'
					>
						<InfoIcon className='text-2xl text-lightBlue dark:text-icon-dark-inactive' />
					</Tooltip>
				</h1>
				<a
					className='font-mediums inline-block rounded-2xl border border-solid border-[#F02A4E] bg-white/40 px-3 py-1 text-xs text-[#F02A4E]'
					href='https://app.zeitgeist.pm/markets/415'
					target='_blank'
					rel='noreferrer noopener'
					onClick={() =>
						trackEvent('prediction_button_clicked', 'clicked_post_prediction_button', {
							userId: currentUser?.id || '',
							userName: currentUser?.username || ''
						})
					}
				>
					Predict
				</a>
			</div>
			<div className='w-full'>
				<div className='relative h-5 w-full bg-white/40 transition-all'>
					<div className='absolute flex h-full w-full items-center justify-between px-3.5 text-xs font-medium text-bodyBlue'>
						<span>yes</span>
						<span className='transition-all'>{YesPercentage}%</span>
					</div>
					<div
						className='h-full bg-white transition-all'
						style={{ width: YesPercentage.toString() + '%' }}
					></div>
				</div>
			</div>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-0.5 text-xs text-lightBlue'>
					{hasEnded ? 'Ended' : 'Ends'}: <span className='font-medium text-bodyBlue'>{endDate}</span>
				</div>
				<p className='flex items-center gap-1 text-xs font-medium text-lightBlue'>
					<Avatar.Group size='small'>
						<Avatar
							style={{
								backgroundImage: 'url(/assets/icons/avatars/avatar-eth.png)',
								backgroundRepeat: 'no-repeat',
								backgroundSize: 'cover',
								border: '1px solid #fff',
								height: 20,
								width: 20
							}}
						></Avatar>
						<Avatar
							style={{
								backgroundImage: 'url(/assets/icons/avatars/avatar-polkadot.png)',
								backgroundRepeat: 'no-repeat',
								backgroundSize: 'cover',
								border: '1px solid #fff',
								height: 20,
								width: 20
							}}
						></Avatar>
					</Avatar.Group>
					{predictCount} predictions
				</p>
			</div>
		</Container>
	);
};
export default PredictionCard;
