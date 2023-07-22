// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import dayjs from 'dayjs';
import Image from 'next/image';
import React from 'react';

const futureDate = dayjs('2023-06-15 17:35:30');

export function getTime() {
	const currentDate = dayjs();
	const countdownDuration = dayjs.duration(futureDate.diff(currentDate));
	let days: any = countdownDuration.days();
	let hours: any = countdownDuration.hours();
	let minutes: any = countdownDuration.minutes();
	let seconds: any = countdownDuration.seconds();
	if (days < 10) days = '0' + days;
	if (hours < 10) hours = '0' + hours;
	if (minutes < 10) minutes = '0' + minutes;
	if (seconds < 10) seconds = '0' + seconds;
	return [days, hours, minutes, seconds];
}

const OpenGovHeaderBanner = () => {
	return (
		<section
			className='opengov_banner rounded-b-[20px] flex flex-col items-center justify-center gap-x-2 py-[10px] px-4 md:py-6 md:px-9 lg:flex-row lg:ml-[80px]'
		>
			<h2
				className='m-0 p-0 text-white flex items-center gap-x-2 font-medium font-poppins text-sm md:text-[24px] leading-[21px] md:leading-[36px]'
			>
				<Image alt='party image' src='/assets/confetti.png' width={30} height={30} />
				<span>OpenGov is now LIVE on Moonbeam and Moonriver</span>
			</h2>
		</section>
	);
};

export default OpenGovHeaderBanner;