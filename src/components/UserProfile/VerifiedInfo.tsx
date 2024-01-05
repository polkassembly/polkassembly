// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { VerifiedIcon } from '~src/ui-components/CustomIcons';
import { poppins } from 'pages/_app';
import ImageIcon from '~src/ui-components/ImageIcon';
// import SetIdentityNudge from '~src/ui-components/SetIdentityNudge';

const VerifiedInfo = () => {
	return (
		<div className={`p-4 ${poppins.className} ${poppins.variable}`}>
			<div className='flex items-center gap-x-1'>
				<VerifiedIcon className='scale-125' />
				<p className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>Verified Account</p>
			</div>
			<div className='mt-2'>
				<div className='m-0 flex h-[18px] items-center gap-x-1 whitespace-nowrap p-0 text-xs font-normal text-bodyBlue'>
					This account is verified
					<span className='m-0 flex cursor-pointer gap-x-1 whitespace-nowrap p-0 font-normal text-pink_primary underline'>
						Learn More
						<ImageIcon
							src='/assets/icons/redirect.svg'
							alt='calenderIcon'
							className=''
						/>
					</span>
				</div>
			</div>
			<div className='mt-2'>
				<div className='m-0 flex items-center whitespace-nowrap p-0 text-xs font-normal text-lightBlue'>
					Verified Since:
					<ImageIcon
						src='/assets/icons/greyCalendar.svg'
						alt='calenderIcon'
						className='-mt-0.5 ml-1'
					/>
					<p className='m-0 ml-1 p-0'>27th Jun 2024</p>
				</div>
			</div>
			<div className='mt-2 flex h-[34px] w-full items-center justify-center rounded-md bg-[#F7F8F9] px-[10px] py-4'>
				<div className='m-0 p-0 text-xs font-normal text-lightBlue'>To get a tick on your profile</div>
			</div>
		</div>
	);
};

export default VerifiedInfo;
