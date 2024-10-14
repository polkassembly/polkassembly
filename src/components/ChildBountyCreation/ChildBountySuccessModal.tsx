// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Modal } from 'antd';
import { BN } from 'bn.js';
import classNames from 'classnames';
import Link from 'next/link';
import { poppins } from 'pages/_app';
import { useDispatch } from 'react-redux';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { resetGov1TreasuryProposal } from '~src/redux/gov1TreasuryProposal';
import { useChildBountyCreationSelector, useNetworkSelector } from '~src/redux/selectors';

import { parseBalance } from '../Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import Image from 'next/image';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { EChildBountySteps } from './types';

interface Props {
	open: boolean;
	setOpen: (pre: boolean) => void;
	setStep: (pre: EChildBountySteps) => void;
}
const ChildBountySuccessModal = ({ open, setOpen, setStep }: Props) => {
	const { childBountyIndex, reqAmount } = useChildBountyCreationSelector();
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const bnFundingAmount = new BN(reqAmount);

	return (
		<Modal
			open={open}
			onCancel={() => {
				setOpen(false);
				dispatch(resetGov1TreasuryProposal());
				setStep(EChildBountySteps.WRITE_CHILDBOUNTY);
			}}
			className={classNames(poppins.className, poppins.variable)}
			maskClosable={false}
			closeIcon={<CloseIcon />}
			footer={
				<Link
					href={`https://${network}.polkassembly.io/childBounty/${childBountyIndex}`}
					className='mb-2 flex items-center'
					target='_blank'
					rel='noopener noreferrer'
				>
					<CustomButton
						height={40}
						className='w-full'
						variant='primary'
						text='View Child Bounty'
					/>
				</Link>
			}
		>
			<div className='flex flex-col items-center justify-center'>
				{/* <SuccessIcon /> */}
				<div className='-mt-[232px]'>
					<Image
						src={'/assets/Gifs/voted.gif'}
						alt='success delegate icon'
						width={363}
						height={347}
					/>
				</div>

				<label className='mt-2 text-xl font-semibold text-bodyBlue dark:text-blue-dark-high'>Child Bounty creation initiated for</label>
				{!!bnFundingAmount && <span className='mt-2 text-2xl font-semibold text-pink_primary'>{parseBalance(bnFundingAmount.toString(), 2, true, network)}</span>}
				{/* {!!(proposer || loginAddress)?.length && (
					<div className='my-2 flex'>
						<div className='mt-[10px] flex flex-col gap-1.5 text-sm text-lightBlue dark:text-blue-dark-medium'>
							<span className='flex'>
								<span className='w-[172px]'>Proposer Address:</span>
								<Address
									addressClassName='text-bodyBlue dark:text-blue-dark-high font-semibold text-sm'
									address={proposer || loginAddress}
									isTruncateUsername={false}
									iconSize={18}
									displayInline
								/>
							</span>
							{curator?.length && (
								<span className='flex'>
									<span className='w-[172px]'>Curator Address:</span>
									<div className='flex flex-col gap-2'>
										<Address
											address={curator}
											displayInline
											iconSize={18}
											isTruncateUsername={false}
										/>
									</div>
								</span>
							)}

							<span className='flex'>
								<span className='w-[172px]'>Funding Amount:</span>
								<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
									{reqAmount && formatedBalance(reqAmount.toString(), unit)} {unit}
								</span>
							</span>
						</div>
					</div>
				)} */}
			</div>
		</Modal>
	);
};

export default ChildBountySuccessModal;
