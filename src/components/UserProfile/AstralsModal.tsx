// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, message } from 'antd';
import Image from 'next/image';
import React from 'react';
import useImagePreloader from '~src/hooks/useImagePreloader';
import { useGlobalSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';

interface ProfileChange {
	label: string;
	points: number;
	isChanged: boolean | undefined;
}

const AstralsModal = () => {
	const { is_bio_changed, is_profile_changed, is_tag_changed, is_title_changed } = useGlobalSelector();

	const isGifLoaded = useImagePreloader('/assets/Gifs/voted.gif');

	const handleCopyClicked = () => {
		navigator.clipboard.writeText(window.location.href);
		message.success('Post link copied');
	};

	const onShareTwitter = () => {
		const text = `${encodeURIComponent("I've just updated my profile at Polkassembly. Do check that out at")}%0A%0A${encodeURIComponent(
			`Check out the my profile ${window.location.href || ''}`
		)}%0A%0A`;

		const url = `https://twitter.com/intent/tweet?text=${text}`;
		window.open(url, '_blank')?.focus();
	};

	const profileChangesList: ProfileChange[] = [
		{
			isChanged: is_profile_changed,
			label: 'Added Profile Picture',
			points: 0.5
		},
		{
			isChanged: is_tag_changed,
			label: 'Added Tags',
			points: 0.25
		},
		{
			isChanged: is_title_changed,
			label: 'Added Bio',
			points: 0.5
		},
		{
			isChanged: is_bio_changed,
			label: 'Added Description',
			points: 0.5
		}
	];

	return (
		<section className='flex flex-col items-center justify-center gap-y-3'>
			<div className='-mt-[248px]'>
				<Image
					src={!isGifLoaded ? '/assets/Gifs/voted.svg' : '/assets/Gifs/voted.gif'}
					alt='Voted successfully'
					width={363}
					height={347}
					priority={true}
				/>
			</div>
			<h1 className='m-0 -mt-8 p-0 text-2xl font-semibold text-bodyBlue dark:text-white'>Congratulations</h1>
			<p className='m-0 -mt-1 p-0 font-normal text-sidebarBlue dark:text-blue-dark-medium'>You Earned</p>

			{profileChangesList.map(
				({ label, points, isChanged }, index) =>
					isChanged && (
						<div
							key={index}
							className='flex w-full items-center justify-between rounded-lg bg-[#F7F7F7] px-3 py-2 dark:bg-inactiveIconDark'
						>
							<div className='flex items-center gap-x-0.5'>
								<p className='m-0 p-0 text-base font-semibold text-[#FFBA03]'>{points}</p>
								<ImageIcon
									src='/assets/icons/astral-star-icon.svg'
									alt='astral-star-icon'
									imgClassName='scale-[75%]'
								/>
							</div>
							<div className='flex items-center gap-x-2'>
								<p className='m-0 p-0 text-[12px] font-normal text-bodyBlue dark:text-white md:text-sm'>{label}</p>
							</div>
						</div>
					)
			)}

			<Divider
				style={{ background: '#D2D8E0', flexGrow: 1 }}
				className='mt-2 dark:bg-separatorDark'
			/>

			<div className='-mt-3 mb-2 flex items-center justify-center gap-x-3'>
				<Button
					className='flex h-[40px] w-[40px] items-center justify-center border-none bg-transparent'
					onClick={onShareTwitter}
				>
					<ImageIcon
						src='/assets/icons/x_black_icon.svg'
						alt='twitter-icon'
					/>
				</Button>
				<Button
					className='flex h-[40px] w-[40px] items-center justify-center border-none bg-transparent'
					onClick={handleCopyClicked}
				>
					<ImageIcon
						src='/assets/icons/copy_purple_icon.svg'
						alt='copy-icon'
					/>
				</Button>
			</div>
		</section>
	);
};

export default AstralsModal;
