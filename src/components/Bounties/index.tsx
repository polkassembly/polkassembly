import React from 'react';
import BountiesHeader from './BountiesHeader';
import ImageIcon from '~src/ui-components/ImageIcon';
import BountyCard from './BountyCard';
import Image from 'next/image';
import BountyActivities from './BountyActivities';

const BountiesContainer = () => {
	return (
		<div>
			<div className='flex items-center justify-between'>
				<h2 className='font-pixelify text-[32px] font-bold text-blue-light-high dark:text-blue-dark-high'>Bounties</h2>
				<button className='bounty-button rounded-[20px] border-none px-[22px] py-[11px] font-bold text-white'>Create Bounty Proposal</button>
			</div>
			<BountiesHeader />

			{/* // Hot Bounties */}
			<div className='mt-7 flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<ImageIcon
						src='/assets/bounty-icons/fire-icon.svg'
						alt='bounty icon'
						imgClassName='-mt-[18px]'
					/>
					<h2 className='font-pixelify text-[32px] font-bold text-blue-light-high dark:text-blue-dark-high'>Hot Bounties</h2>
				</div>
				<button className='rounded-[20px] border-none bg-transparent text-[26px] font-bold text-pink_primary'>View All</button>
			</div>

			<div className='grid grid-cols-3 justify-between'>
				<BountyCard />
				<BountyCard />
				<BountyCard />
			</div>

			{/* Bounty Proposals */}
			<div className='mt-8 flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<ImageIcon
						src='/assets/bounty-icons/bounty-proposals.svg'
						alt='bounty icon'
						imgClassName='-mt-[18px]'
					/>
					<h2 className='font-pixelify text-[32px] font-bold text-blue-light-high dark:text-blue-dark-high'>Bounty Proposals</h2>
				</div>
				<button className='rounded-[20px] border-none bg-transparent text-[26px] font-bold text-pink_primary'>View All</button>
			</div>
			<div className='grid grid-cols-3 justify-between'>
				<BountyCard isUsedInBountyProposals={true} />
				<BountyCard isUsedInBountyProposals={true} />
				<BountyCard isUsedInBountyProposals={true} />
			</div>

			{/* Footer */}
			<div className='mt-10 flex items-center gap-8'>
				<Image
					src={'assets/bounty-icons/bounty-coming-soon.svg'}
					width={753}
					height={400}
					alt='curator'
				/>
				<BountyActivities />
			</div>
		</div>
	);
};

export default BountiesContainer;
