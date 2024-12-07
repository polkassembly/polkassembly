// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Image from 'next/image';
import CautionIcon from '~assets/icons/caution-icon.svg';
import { dmSans } from 'pages/_app';
import Link from 'next/link';
import React from 'react';
import { useTheme } from 'next-themes';

export const SidebarFoot1 = () => {
	const { resolvedTheme: theme } = useTheme();

	return (
		<div className='fixed bottom-0 left-0 z-[100] w-full bg-white pb-4 before:pointer-events-none before:absolute before:left-0 before:right-0 before:top-0 before:z-[1] before:h-[3px] before:shadow-[0px_-2px_6px_rgba(0,0,0,0.08)] before:content-[""] dark:bg-section-dark-overlay md:pb-0 lg:pb-[10px] xl:h-[8.5vw]'>
			<Link
				href='https://polkassembly.hellonext.co/'
				target='_blank'
				rel='noreferrer'
			>
				<div className='mx-3 mt-3 flex cursor-pointer items-center justify-center gap-[6px] rounded-xl border border-solid border-[#D2D8E0] bg-[#F8F9FC] px-[6px] py-2 dark:border-separatorDark dark:bg-section-dark-background'>
					<CautionIcon />
					<div className={`${dmSans.className} ${dmSans.variable} flex flex-col`}>
						<span className='text-sm font-semibold text-blue-light-high dark:text-blue-dark-high'>Report an issue</span>
						<span className='text-[11px] text-blue-light-medium dark:text-blue-dark-medium'>Need help with something?</span>
					</div>
				</div>
			</Link>
			<div className='mt-3 flex items-center justify-center gap-[15px]'>
				<div className='group relative'>
					<Link
						href='https://townhallgov.com/'
						target='_blank'
					>
						<Image
							src={theme === 'dark' ? '/assets/darkfoot1.svg' : '/assets/foot1.svg'}
							alt='Foot1'
							className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
							width={40}
							height={40}
						/>
						<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
							Townhall
							<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
						</div>
					</Link>
				</div>
				<div className='group relative'>
					<Link
						href='https://polkasafe.xyz/'
						target='_blank'
					>
						<Image
							src={theme === 'dark' ? '/assets/darkfoot2.svg' : '/assets/foot2.svg'}
							alt='Foot2'
							width={40}
							height={40}
							className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
						/>
						<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
							Polkasafe
							<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
						</div>
					</Link>
				</div>
				<div className='group relative'>
					<Link
						href='https://collectives.polkassembly.io/'
						target='_blank'
					>
						<Image
							src={theme === 'dark' ? '/assets/darkfoot3.svg' : '/assets/foot3.svg'}
							alt='Foot3'
							width={40}
							height={40}
							className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
						/>
						<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
							Fellowship
							<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
						</div>
					</Link>
				</div>
				<div className='group relative'>
					<Link
						href='https://staking.polkadot.cloud/#/overview'
						target='_blank'
					>
						<Image
							src={theme === 'dark' ? '/assets/darkfoot4.svg' : '/assets/foot4.svg'}
							alt='Foot4'
							width={40}
							height={40}
							className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
						/>
						<div className='absolute -left-0 bottom-full mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-3 py-[6px] text-xs font-semibold text-white group-hover:block'>
							Staking
							<div className='absolute left-12  top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
						</div>
					</Link>
				</div>
			</div>
		</div>
	);
};

export const SidebarFoot2 = () => {
	const { resolvedTheme: theme } = useTheme();

	return (
		<div className='fixed  bottom-0 left-0 z-[1000] h-[14vw] w-full bg-white py-3 before:pointer-events-none before:absolute before:left-0 before:right-0 before:top-0 before:z-[1] before:h-[3px] before:shadow-[0px_-2px_6px_rgba(0,0,0,0.08)] before:content-[""] dark:bg-section-dark-overlay'>
			<div className='flex flex-col items-center justify-center gap-2'>
				<div className='group relative'>
					<Link href='https://townhallgov.com/'>
						<Image
							src={theme === 'dark' ? '/assets/darkfoot1.svg' : '/assets/foot1.svg'}
							alt='Foot1'
							width={40}
							height={40}
							className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
						/>
						<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
							Townhall
							<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
						</div>
					</Link>
				</div>
				<div className='group relative'>
					<Link href='https://polkasafe.xyz/'>
						<Image
							src={theme === 'dark' ? '/assets/darkfoot2.svg' : '/assets/foot2.svg'}
							alt='Foot2'
							width={40}
							height={40}
							className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
						/>
						<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
							Polkasafe
							<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
						</div>
					</Link>
				</div>
				<div className='group relative'>
					<Link href='https://collectives.polkassembly.io/'>
						<Image
							src={theme === 'dark' ? '/assets/darkfoot3.svg' : '/assets/foot3.svg'}
							alt='Foot3'
							width={40}
							height={40}
							className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
						/>
						<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
							Fellowship
							<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
						</div>
					</Link>
				</div>
				<div className='group relative'>
					<Link href='https://staking.polkadot.cloud/#/overview'>
						<Image
							src={theme === 'dark' ? '/assets/darkfoot4.svg' : '/assets/foot4.svg'}
							alt='Foot4'
							width={40}
							height={40}
							className='h-10 w-10 cursor-pointer rounded-xl bg-[#F3F4F6] p-2 hover:bg-gray-200 dark:bg-[#272727]'
						/>
						<div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-[#363636] px-2 py-[6px] text-xs font-semibold text-white group-hover:block'>
							Staking
							<div className='absolute left-1/2 top-3 -z-10 h-4 w-4 -translate-x-1/2 rotate-45 transform bg-[#363636]'></div>
						</div>
					</Link>
				</div>
			</div>
		</div>
	);
};
