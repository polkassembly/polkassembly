// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal } from 'antd';
import { BN } from 'bn.js';
import classNames from 'classnames';
import Link from 'next/link';
import { dmSans } from 'pages/_app';
import React from 'react';
import { useDispatch } from 'react-redux';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { chainProperties } from '~src/global/networkConstants';
import { resetGov1TreasuryProposal } from '~src/redux/gov1TreasuryProposal';
import { useGov1treasuryProposal, useNetworkSelector } from '~src/redux/selectors';
import Address from '~src/ui-components/Address';
import ImageIcon from '~src/ui-components/ImageIcon';
import { formatedBalance } from '~src/util/formatedBalance';

interface Props {
	open: boolean;
	setOpen: (pre: boolean) => void;
	setStep: (pre: number) => void;
}
const Gov1TreasuryProposalSuccess = ({ open, setOpen, setStep }: Props) => {
	const { proposalIndex, beneficiary, proposer, fundingAmount } = useGov1treasuryProposal();
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const unit = network ? chainProperties[network].tokenSymbol : '';
	const bnFundingAmount = new BN(fundingAmount);

	return (
		<Modal
			open={open}
			onCancel={() => {
				setOpen(false);
				dispatch(resetGov1TreasuryProposal());
				setStep(0);
			}}
			className={classNames(dmSans.className, dmSans.variable)}
			maskClosable={false}
			footer={
				<Link
					href={`https://${network}.polkassembly.io/treasury/${proposalIndex}`}
					className='mb-2 flex items-center'
					target='_blank'
					rel='noopener noreferrer'
				>
					<CustomButton
						height={40}
						className='w-full'
						type='primary'
						text='View Proposal'
					/>
				</Link>
			}
		>
			<div className='-mt-[132px] flex flex-col items-center justify-center'>
				{/* <SuccessIcon /> */}
				<ImageIcon
					src='/assets/delegation-tracks/success-delegate.svg'
					alt='success delegate icon'
				/>
				<label className='mt-2 text-xl font-semibold text-bodyBlue dark:text-blue-dark-high'>Proposal created successfully for</label>
				{!!bnFundingAmount && (
					<span className='mt-2 text-2xl font-semibold text-pink_primary'>
						{formatedBalance(bnFundingAmount.toString(), unit)} {unit}
					</span>
				)}
				{!!proposer?.length && !!beneficiary?.length && (
					<div className='my-2 flex'>
						<div className='mt-[10px] flex flex-col gap-1.5 text-sm text-lightBlue dark:text-blue-dark-medium'>
							<span className='flex'>
								<span className='w-[172px]'>Proposer Address:</span>
								<Address
									addressClassName='text-bodyBlue dark:text-blue-dark-high font-semibold text-sm'
									address={proposer}
									isTruncateUsername={false}
									iconSize={18}
									displayInline
								/>
							</span>
							<span className='flex'>
								<span className='w-[172px]'>Beneficiary Address:</span>
								<div className='flex flex-col gap-2'>
									<Address
										address={beneficiary}
										displayInline
										iconSize={18}
										isTruncateUsername={false}
									/>
								</div>
							</span>

							<span className='flex'>
								<span className='w-[172px]'>Funding Amount:</span>
								<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
									{fundingAmount && formatedBalance(fundingAmount.toString(), unit)} {unit}
								</span>
							</span>
						</div>
					</div>
				)}
			</div>
		</Modal>
	);
};

export default Gov1TreasuryProposalSuccess;
