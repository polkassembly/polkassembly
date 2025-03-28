// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal } from 'antd';
import Image from 'next/image';
import { dmSans } from 'pages/_app';
import Address from '~src/ui-components/Address';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';

interface IDecentralizedVotes {
	voter: string;
	balance: number;
	votingPower: number;
	color: string;
	lockPeriod?: string;
	decision: string;
	delegators?: number;
}

interface IDecentralizedVoicesModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	totalVotingPower: number;
	decentralizedVotes: IDecentralizedVotes[];
	decentralizedVotingPower: number;
	decentralizedAyeVotes: number;
	decentralizedNayVotes: number;
	decentralizedVotingPowerPercentage: number;
	decentralizedAyeVotesPercentage: number;
	decentralizedNayVotesPercentage: number;
}

const DecentralizedVoicesModal = ({
	open,
	setOpen,
	totalVotingPower,
	decentralizedVotes,
	decentralizedVotingPower,
	decentralizedAyeVotes,
	decentralizedNayVotes,
	decentralizedVotingPowerPercentage,
	decentralizedAyeVotesPercentage,
	decentralizedNayVotesPercentage
}: IDecentralizedVoicesModalProps) => {
	return (
		<Modal
			title={
				<div className='-mx-6 flex items-center gap-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-2 text-lg tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
					<Image
						src='/assets/icons/user-group.svg'
						alt='User group'
						width={24}
						height={24}
						className='filter dark:brightness-0 dark:contrast-100 dark:grayscale dark:invert'
					/>
					Decentralized Voices Detail
				</div>
			}
			open={open}
			onCancel={() => setOpen(false)}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			footer={false}
			className={`${dmSans.variable} ${dmSans.className} [&>.ant-modal-content]:backdrop-blur-[7px]`}
			wrapClassName={'bg-modalOverlayDark backdrop-blur-[7px] [&>.ant-modal-content]:backdrop-blur-[7px]'}
		>
			<div className='mt-6 flex w-full flex-col items-center justify-center gap-5 text-sm font-semibold capitalize text-bodyBlue dark:text-blue-dark-high'>
				<div className='flex w-full items-center justify-between gap-2 rounded-md bg-[#F6F8FB] px-2 py-1 dark:bg-[#353535]'>
					<span>Decentralized Voices</span> <span>{decentralizedVotingPowerPercentage}%</span>
					<span>(~{formatUSDWithUnits(decentralizedVotingPower.toString() || '0', 2)})</span>
				</div>
				<div className='flex w-full items-center justify-between gap-6'>
					<div className='flex flex-1 items-center gap-2 rounded-md bg-[#E1F9EC] px-2 py-1 text-[#009B46]'>
						Aye {decentralizedAyeVotesPercentage}% <span className='ml-auto'>(~{formatUSDWithUnits(decentralizedAyeVotes.toString() || '0', 2)})</span>
					</div>
					<div className='flex flex-1 items-center gap-2 rounded-md bg-[#FFE0E5] px-2 py-1 text-[#E84865]'>
						Nay {decentralizedNayVotesPercentage}% <span className='ml-auto'>(~{formatUSDWithUnits(decentralizedNayVotes.toString() || '0', 2)})</span>
					</div>
				</div>

				<hr className='w-full border-[#D2D8E0] dark:border-separatorDark' />

				<div className='flex w-full flex-col gap-2'>
					<h3 className='text-lg font-bold'>
						Delegates{' '}
						<span className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>
							{decentralizedVotes?.length > 9 ? decentralizedVotes.length : `0${decentralizedVotes.length}`}
						</span>
					</h3>
					<div className='flex w-full flex-col gap-2'>
						{decentralizedVotes.map((vote) => (
							<div
								key={vote.voter}
								className={`flex w-full items-center justify-between rounded-md bg-[#F6F8FB] px-2 py-1 ${
									vote.decision === 'aye' ? 'bg-[#E1F9EC] text-[#009B46]' : vote.decision === 'nay' ? 'bg-[#FFE0E5] text-[#E84865]' : 'dark:bg-[#353535]'
								}`}
							>
								<Address
									address={vote.voter}
									isTruncateUsername={true}
									displayInline
									disableAddressClick
									showProxyTitle={false}
									usernameClassName={vote.decision === 'abstain' ? '' : 'dark:text-bodyBlue'}
								/>
								<div>
									{vote.decision} {((vote.votingPower / totalVotingPower) * 100).toFixed(2)}%
								</div>
								<div>(~{formatUSDWithUnits(vote.votingPower.toString() || vote.balance.toString() || '0', 2)})</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default DecentralizedVoicesModal;
