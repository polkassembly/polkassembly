// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React from 'react';
import { useDispatch } from 'react-redux';
import StarIcon from '~assets/icons/StarIcon.svg';
import { GlobalActions } from '~src/redux/global';
import { EAstralInfoTab } from '~src/redux/global/@types';
import { useGlobalSelector } from '~src/redux/selectors';
import { AstralIcon } from '~src/ui-components/CustomIcons';

interface Props {
	className?: string;
	theme?: string;
}

const AstralPoints = ({ className }: Props) => {
	const { current_astral_info_tab } = useGlobalSelector();
	const { resolvedTheme: theme } = useTheme();
	const dispatch = useDispatch();

	console.log('currentAstralTab', current_astral_info_tab);
	return (
		<section
			className={classNames(
				className,
				'mt-6 flex flex-col gap-5 rounded-[14px] border-[1px] border-solid border-section-light-container bg-white px-6 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
			)}
		>
			<header className={'flex items-center justify-between gap-4 max-md:px-0 '}>
				<div className='flex w-full items-center gap-2 text-xl font-medium max-md:justify-start'>
					<AstralIcon className='text-[28px] text-lightBlue dark:text-[#9e9e9e]' />

					<div className='flex items-center gap-1 text-bodyBlue dark:text-white'>Astrals</div>
				</div>
			</header>
			<article className='flex justify-between'>
				<div
					className={`flex h-[74px] flex-col items-start justify-start gap-y-1 rounded-xl border border-solid ${
						current_astral_info_tab === EAstralInfoTab.ALL_INFO
							? 'dark:border[#FF0088] border-pink_primary bg-[#FEF2F8]'
							: 'border-[#D2D8E0] bg-transparent dark:border-separatorDark'
					} cursor-pointer px-5 py-3`}
					onClick={() => {
						dispatch(GlobalActions.setCurrentAstralTab(EAstralInfoTab.ALL_INFO));
					}}
					style={{ boxShadow: '0px 4px 6px 0px rgba(0, 0, 0, 0.08)' }}
				>
					<h1
						className={`m-0 flex items-center justify-start gap-x-1 p-0 text-[28px] font-bold  ${
							current_astral_info_tab === EAstralInfoTab.ALL_INFO ? 'text-bodyBlue' : 'text-bodyBlue dark:text-white'
						}`}
					>
						824 <span className='m-0 flex h-7 items-center justify-center rounded-md bg-abstainBlueColor p-0 px-2 text-sm font-semibold text-white'>Rank #49</span>
					</h1>
					<p className='m-0 flex items-center justify-start gap-x-1 p-0 text-xs font-medium text-[#98A2B3]  dark:text-blue-dark-medium'>
						Earned <span className='m-0 p-0 text-sm font-semibold text-[#FFBA03]'>+40</span>in last 90 days
					</p>
				</div>
				<div
					className={`flex h-[74px] items-center justify-start gap-x-2 rounded-xl border border-solid ${
						current_astral_info_tab === EAstralInfoTab.ON_CHAIN_ACTIVITY
							? 'dark:border[#FF0088] border-pink_primary bg-[#FEF2F8]'
							: 'border-[#D2D8E0] bg-transparent dark:border-separatorDark'
					} cursor-pointer px-5 py-3`}
					style={{ boxShadow: '0px 4px 6px 0px rgba(0, 0, 0, 0.08)' }}
					onClick={() => {
						dispatch(GlobalActions.setCurrentAstralTab(EAstralInfoTab.ON_CHAIN_ACTIVITY));
					}}
				>
					<div
						className={`flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-solid bg-transparent ${
							current_astral_info_tab === EAstralInfoTab.ON_CHAIN_ACTIVITY ? 'border-pink_primary' : 'border-[#D2D8E0] dark:border-separatorDark '
						}`}
					>
						<div
							className={`flex h-8 w-8 items-center justify-center rounded ${
								current_astral_info_tab === EAstralInfoTab.ON_CHAIN_ACTIVITY ? 'bg-[#FEF2F8]' : ' bg-[#F3F4F6] dark:bg-modalOverlayDark'
							}`}
						>
							<Image
								src='/assets/icons/on-chain-box-ixon.svg'
								alt='on-chain'
								height={20}
								width={20}
								className={theme === 'dark' ? `${current_astral_info_tab === EAstralInfoTab.ON_CHAIN_ACTIVITY ? '' : 'dark-icons'}` : 'text-lightBlue'}
							/>
						</div>
					</div>
					<p className='m-0 flex items-center justify-start gap-x-1 p-0 text-base font-semibold text-sidebarBlue  dark:text-blue-dark-medium'>On-chain activity</p>
					<div
						className={'flex h-[20px] cursor-pointer items-center justify-start gap-x-1 rounded-md px-1'}
						style={{ background: 'linear-gradient(0deg, #FFD669 0%, #FFD669 100%), #FCC636' }}
					>
						<StarIcon />
						<p className='m-0 p-0 text-sm font-medium text-[#534930]'>300</p>
					</div>
				</div>
				<div
					className={`flex h-[74px] items-center justify-start gap-x-2 rounded-xl border border-solid ${
						current_astral_info_tab === EAstralInfoTab.OFF_CHAIN_ACTIVITY
							? 'dark:border[#FF0088] border-pink_primary bg-[#FEF2F8]'
							: 'border-[#D2D8E0] bg-transparent dark:border-separatorDark'
					} cursor-pointer px-5 py-3`}
					style={{ boxShadow: '0px 4px 6px 0px rgba(0, 0, 0, 0.08)' }}
					onClick={() => {
						dispatch(GlobalActions.setCurrentAstralTab(EAstralInfoTab.OFF_CHAIN_ACTIVITY));
					}}
				>
					<div
						className={`flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-solid bg-transparent ${
							current_astral_info_tab === EAstralInfoTab.OFF_CHAIN_ACTIVITY ? 'border-pink_primary' : 'border-[#D2D8E0] dark:border-separatorDark '
						}`}
					>
						<div
							className={`flex h-8 w-8 items-center justify-center rounded ${
								current_astral_info_tab === EAstralInfoTab.OFF_CHAIN_ACTIVITY ? 'bg-[#FEF2F8]' : ' bg-[#F3F4F6] dark:bg-modalOverlayDark'
							}`}
						>
							<Image
								src='/assets/icons/off-chain-box-ixon.svg'
								alt='on-chain'
								height={20}
								width={20}
								className={theme === 'dark' ? `${current_astral_info_tab === EAstralInfoTab.OFF_CHAIN_ACTIVITY ? '' : 'dark-icons'}` : 'text-lightBlue'}
							/>
						</div>
					</div>
					<p className='m-0 flex items-center justify-start gap-x-1 p-0 text-base font-semibold text-sidebarBlue  dark:text-blue-dark-medium'>Off-chain activity</p>
					<div
						className={'flex h-[20px] cursor-pointer items-center justify-start gap-x-1 rounded-md px-1'}
						style={{ background: 'linear-gradient(0deg, #FFD669 0%, #FFD669 100%), #FCC636' }}
					>
						<StarIcon />
						<p className='m-0 p-0 text-sm font-medium text-[#534930]'>300</p>
					</div>
				</div>
				<div
					className={`flex h-[74px] items-center justify-start gap-x-2 rounded-xl border border-solid ${
						current_astral_info_tab === EAstralInfoTab.PROFILE
							? 'dark:border[#FF0088] border-pink_primary bg-[#FEF2F8]'
							: 'border-[#D2D8E0] bg-transparent dark:border-separatorDark'
					} cursor-pointer px-5 py-3`}
					style={{ boxShadow: '0px 4px 6px 0px rgba(0, 0, 0, 0.08)' }}
					onClick={() => {
						dispatch(GlobalActions.setCurrentAstralTab(EAstralInfoTab.PROFILE));
					}}
				>
					<div
						className={`flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-solid bg-transparent ${
							current_astral_info_tab === EAstralInfoTab.PROFILE ? 'border-pink_primary' : 'border-[#D2D8E0] dark:border-separatorDark '
						}`}
					>
						<div
							className={`flex h-8 w-8 items-center justify-center rounded ${
								current_astral_info_tab === EAstralInfoTab.PROFILE ? 'bg-[#FEF2F8]' : ' bg-[#F3F4F6] dark:bg-modalOverlayDark'
							}`}
						>
							<Image
								src='/assets/icons/profile-box-icon.svg'
								alt='on-chain'
								height={20}
								width={20}
								className={theme === 'dark' ? `${current_astral_info_tab === EAstralInfoTab.PROFILE ? '' : 'dark-icons'}` : 'text-lightBlue'}
							/>
						</div>
					</div>
					<p className='m-0 flex items-center justify-start gap-x-1 p-0 text-base font-semibold text-sidebarBlue  dark:text-blue-dark-medium'>Profile</p>
					<div
						className={'flex h-[20px] cursor-pointer items-center justify-start gap-x-1 rounded-md px-1'}
						style={{ background: 'linear-gradient(0deg, #FFD669 0%, #FFD669 100%), #FCC636' }}
					>
						<StarIcon />
						<p className='m-0 p-0 text-sm font-medium text-[#534930]'>300</p>
					</div>
				</div>
			</article>
		</section>
	);
};

export default AstralPoints;
