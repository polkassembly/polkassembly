// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import Image from 'next/image';
import { spaceGrotesk } from 'pages/_app';
import React from 'react';
import { BountyCriteriaIcon, CuratorIcon } from '~src/ui-components/CustomIcons';
import ImageIcon from '~src/ui-components/ImageIcon';
import TrackTag from '~src/ui-components/TrackTag';

const BountyCard = ({ isUsedInBountyProposals }: { isUsedInBountyProposals?: boolean }) => {
	return (
		<main className=' w-[383px] '>
			<div className=' w-[383px]'>
				<div className=' flex '>
					<div className='flex h-[56px] w-full items-center justify-between rounded-t-3xl border-b-0 border-l border-r border-t border-solid border-section-light-container bg-white px-3 pt-5 dark:border-section-dark-container dark:bg-section-light-overlay'>
						<h2 className=' mt-4 text-[35px] font-normal text-pink_primary'>$504</h2>
						<Divider
							type='vertical'
							className='h-[30px] bg-section-light-container dark:bg-section-dark-container'
						/>
						<h2 className=' mt-3 text-[22px] font-normal'>
							{isUsedInBountyProposals ? '52%' : '48%'}
							{/* Add chart here */}
						</h2>
					</div>
					<div className='mb-2 ml-2 flex w-full  items-center'>
						<Image
							src={'assets/bounty-icons/redirect-icon.svg'}
							width={45}
							height={45}
							alt='redirect link'
							className='-mr-[2px] cursor-pointer rounded-full bg-black'
						/>
						<div className='h-2 w-[10px] bg-black'></div>
						<button
							className={`${spaceGrotesk.className} ${spaceGrotesk.variable} -ml-[2px] h-[44px] w-[100px] cursor-pointer rounded-3xl border-none bg-black text-lg font-bold text-white`}
						>
							{isUsedInBountyProposals ? 'Vote' : 'Apply'}
						</button>
					</div>
				</div>
				<div
					className={`rounded-tr-2xl bg-white px-3 py-1 dark:bg-section-light-overlay ${
						!isUsedInBountyProposals ? '' : 'rounded-b-3xl '
					} border-b border-l border-r border-t-0 border-solid border-section-light-container dark:border-section-dark-container`}
				>
					<ImageIcon
						src='/assets/bounty-icons/bounty-image.svg'
						alt='bounty icon'
						imgClassName='mt-5 mb-3'
						imgWrapperClassName=''
					/>
					<div className={`${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
						<span className='mr-1 text-base font-medium text-blue-light-medium dark:text-blue-dark-medium'>#123</span>
						<span className='text-lg font-bold text-blue-light-high dark:text-blue-dark-high'>Ut vestibulum efficitur mois maena eget ligula vitae enim posuere</span>
					</div>
					<span className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-sm font-normal`}>
						Maecenas eget ligula vitae enim posuere volutpat. Pellentesque sed tellus pretium, pelentesque risu...
					</span>
					{isUsedInBountyProposals ? (
						<TrackTag
							className='mt-2'
							track='Big Spender'
						/>
					) : (
						<TrackTag
							className='mt-2'
							track='Tags'
						/>
					)}
					<div className={`flex cursor-pointer items-center ${isUsedInBountyProposals && 'mt-1 pb-1'}`}>
						{!isUsedInBountyProposals && (
							<>
								<div className='flex items-center rounded-md p-1 hover:bg-[#f5f5f5] dark:hover:bg-section-dark-garyBackground'>
									<CuratorIcon className='-mt-[2px] text-blue-light-medium dark:text-blue-dark-medium ' />
									<button
										className={`cursor-pointer ${spaceGrotesk.className} ${spaceGrotesk.variable} border-none bg-transparent px-[5px] py-[2px] text-[13px] font-medium text-blue-light-medium dark:text-blue-dark-medium `}
									>
										Curator
									</button>
								</div>
								<div className='mr-1 h-[5px] w-[5px] rounded-full bg-blue-light-medium dark:bg-blue-dark-medium'></div>
								<div className='flex items-center rounded-md p-1 hover:bg-[#f5f5f5]  dark:hover:bg-section-dark-garyBackground'>
									<BountyCriteriaIcon className='-mt-[2px] text-blue-light-medium dark:text-blue-dark-medium ' />
									<button
										className={`cursor-pointer ${spaceGrotesk.className} ${spaceGrotesk.variable} border-none bg-transparent px-[5px] py-[2px] text-[13px] font-medium text-blue-light-medium dark:text-blue-dark-medium`}
									>
										Criteria
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
			{!isUsedInBountyProposals && (
				<div className='flex w-full items-center justify-between rounded-b-3xl bg-[#343434] p-4 text-white'>
					<div className={`${spaceGrotesk.className} ${spaceGrotesk.variable} -ml-1 flex cursor-pointer items-center gap-2 `}>
						<Image
							src={'assets/bounty-icons/child-bounty-icon.svg'}
							width={16}
							height={16}
							alt='curator'
						/>
						<span className='text-[13px] font-medium text-white'>Child Bounties:</span>
						<span className='text-[13px] font-medium text-white'>5</span>
					</div>
					<div className='cursor-pointer '>
						<Image
							src={'assets/bounty-icons/arrow-icon.svg'}
							width={16}
							height={16}
							alt='curator'
						/>
					</div>
				</div>
			)}
		</main>
	);
};

export default BountyCard;