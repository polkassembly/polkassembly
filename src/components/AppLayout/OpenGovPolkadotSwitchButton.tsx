// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal } from 'antd';
import dayjs from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import { SyncIcon } from '~src/ui-components/CustomIcons';
import OpenGovBannerSVG from '~assets/icons/opengov_banner.svg';

interface IOpenGovPolkadotSwitchButtonProps {
    className?: string;
}

const OpenGovPolkadotSwitchButton: FC<IOpenGovPolkadotSwitchButtonProps> = (props) => {
	const { className } = props;
	const [open, setOpen] = useState(false);
	const [[days, hrs, mins, secs], setTime] = useState([0, 0, 0, 0]);
	useEffect(() => {
		const futureDate = dayjs('2023-06-15 17:35:30');
		const timer = setInterval(() => {
			setTime(() => {
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
			});
		}, 1000);
		return () => clearInterval(timer);
	}, []);
	return (
		<>
			<Modal
				open={open}
				onCancel={() => setOpen(false)}
				footer={null}
				closeIcon={<></>}
				className='min-w-fit opengov_modal mt-32'
			>
				<section className='flex flex-col items-center justify-center px-[57.5px] pt-[96.5px] pb-1 relative'>
					<div className='absolute bottom-60 flex items-center justify-center'>
						<OpenGovBannerSVG />
					</div>
					<h2 className='m-0 p-0 font-medium text-5xl leading-[72px] text-[#243A57] mb-8'>
                        OpenGov going LIVE on Polkadot in
					</h2>
					<div className='flex items-center justify-center gap-x-[38px] opengov_banner px-[105px] py-[21px] rounded-[20px]'>
						<p className='m-0 flex flex-col justify-center items-center'>
							<span className='w-[95px] font-medium text-[60px] leading-[90px] text-white'>{days}</span>
							<span className='font-medium text-[18px] leading-[27px] text-[rgba(255,255,255,0.8)]'>
								Days
							</span>
						</p>
						<span className='h-[46px] w-[0.75px] bg-[#D2D8E0] flex items-center justify-center'></span>
						<p className='m-0 flex flex-col justify-center items-center'>
							<span className='w-[95px] font-medium text-[60px] leading-[90px] text-white'>{hrs}</span>
							<span className='font-medium text-[18px] leading-[27px] text-[rgba(255,255,255,0.8)]'>
								Hours
							</span>
						</p>
						<span className='h-[46px] w-[0.75px] bg-[#D2D8E0] flex items-center justify-center'></span>
						<p className='m-0 flex flex-col justify-center items-center'>
							<span className='w-[95px] font-medium text-[60px] leading-[90px] text-white'>{mins}</span>
							<span className='font-medium text-[18px] leading-[27px] text-[rgba(255,255,255,0.8)]'>
								Minutes
							</span>
						</p>
						<span className='h-[46px] w-[0.75px] bg-[#D2D8E0] flex items-center justify-center'></span>
						<p className='m-0 flex flex-col justify-center items-center'>
							<span className='w-[95px] font-medium text-[60px] leading-[90px] text-white'>{secs}</span>
							<span className='font-medium text-[18px] leading-[27px] text-[rgba(255,255,255,0.8)]'>
								Seconds
							</span>
						</p>
					</div>
				</section>
			</Modal>
			<div className={className}>
				<button
					onClick={() => setOpen(true)}
					className='cursor-pointer outline-none bg-transparent m-0 border border-solid border-[rgba(72,95,125,0.2)] rounded-full flex items-center justify-center min-w-[200px] p-2 py-1'>
					<p className='text-sidebarBlue font-normal text-[10px] leading-[15px] tracking-[0.02em] m-0'>Switch to</p>
					<p className='font-poppins ml-[6px] mr-[11px] text-sidebarBlue text-xs font-semibold leading-[18px] tracking-[0.02em] m-0'>
                        OpenGov
					</p>
					<p className='flex items-center justify-center text-navBlue text-base m-0'><SyncIcon /></p>
				</button>
			</div>
		</>
	);
};

export default OpenGovPolkadotSwitchButton;