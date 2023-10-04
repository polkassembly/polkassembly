// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { OpenGovBannerIcon } from '~src/ui-components/CustomIcons';
import { getTime } from './OpenGovHeaderBanner';
import Link from 'next/link';

const OpenGovOverviewBanner = () => {
	const [[days, hrs, mins, secs], setTime] = useState(getTime());
	useEffect(() => {
		const timer = setInterval(() => {
			setTime(() => {
				return getTime();
			});
		}, 1000);
		return () => clearInterval(timer);
	}, []);
	return (
		<div className='flex h-full items-center justify-center'>
			<section className='relative flex flex-col items-center justify-center rounded-[24px] bg-[#FFF3FA] px-[21.5px] pb-[20.8px] pt-[62.5px] md:mt-20 md:px-[53px] md:pb-[33.66px] md:pt-[102.34px]'>
				<div className='absolute bottom-56 flex items-center justify-center md:bottom-96 lg:bottom-80'>
					<OpenGovBannerIcon className='text-[134px] md:text-[300px]' />
				</div>
<<<<<<< HEAD
				<h2 className='m-0 p-0 font-medium text-[18px] leading-[27px] md:text-[32px] md:leading-[48px] text-blue-light-high dark:text-blue-dark-high mb-3 md:mb-8 flex flex-col lg:flex-row items-center justify-center text-center gap-x-2'>
					<span>OpenGov expected to go live on</span> {' '} <span>Polkadot in</span>
=======
				<h2 className='m-0 mb-3 flex flex-col items-center justify-center gap-x-2 p-0 text-center text-[18px] font-medium leading-[27px] text-[#243A57] md:mb-8 md:text-[32px] md:leading-[48px] lg:flex-row'>
					<span>OpenGov expected to go live on</span> <span>Polkadot in</span>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
				</h2>
				<div className='opengov_banner flex items-center justify-center gap-x-2 rounded-[14px] px-[35px] py-[9px] md:gap-x-[38px] md:rounded-[20px] md:px-[70px] md:py-[19px]'>
					<p className='m-0 flex flex-col items-center justify-center'>
						<span className='text-6  font-medium leading-9 text-white md:text-5xl md:leading-[72px]'>{days}</span>
						<span className='text-xs font-medium leading-[18px] text-[rgba(255,255,255,0.8)] md:text-[18px] md:leading-[27px]'>Days</span>
					</p>
					<span className='flex h-[46px] w-[0.75px] items-center justify-center bg-[#D2D8E0]'></span>
					<p className='m-0 flex flex-col items-center justify-center'>
						<span className='text-6  font-medium leading-9 text-white md:text-5xl md:leading-[72px]'>{hrs}</span>
						<span className='text-xs font-medium leading-[18px] text-[rgba(255,255,255,0.8)] md:text-[18px] md:leading-[27px]'>Hours</span>
					</p>
					<span className='flex h-[46px] w-[0.75px] items-center justify-center bg-[#D2D8E0]'></span>
					<p className='m-0 flex flex-col items-center justify-center'>
						<span className='text-6  font-medium leading-9 text-white md:text-5xl md:leading-[72px]'>{mins}</span>
						<span className='text-xs font-medium leading-[18px] text-[rgba(255,255,255,0.8)] md:text-[18px] md:leading-[27px]'>Minutes</span>
					</p>
					<span className='flex h-[46px] w-[0.75px] items-center justify-center bg-[#D2D8E0]'></span>
					<p className='m-0 flex flex-col items-center justify-center'>
						<span className='text-6  font-medium leading-9 text-white md:text-5xl md:leading-[72px]'>{secs}</span>
						<span className='text-xs font-medium leading-[18px] text-[rgba(255,255,255,0.8)] md:text-[18px] md:leading-[27px]'>Seconds</span>
					</p>
				</div>
<<<<<<< HEAD
				<div className='flex items-center gap-x-2 mt-4 md:mt-8 text-blue-light-high dark:text-blue-dark-high font-medium text-xs leading-[18px] md:text-2xl md:leading-[36px]'>
=======
				<div className='mt-4 flex items-center gap-x-2 text-xs font-medium leading-[18px] text-[#243A57] md:mt-8 md:text-2xl md:leading-[36px]'>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
					<p className='m-0'>Vote on proposal </p>
					<Link
						href={'/referendum/121'}
						className='text-pink_primary'
					>
						here
					</Link>
				</div>
			</section>
		</div>
	);
};

export default OpenGovOverviewBanner;
