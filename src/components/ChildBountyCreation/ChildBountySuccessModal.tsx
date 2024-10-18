// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Modal, Tag } from 'antd';
import { BN } from 'bn.js';
import classNames from 'classnames';
import Link from 'next/link';
import { poppins } from 'pages/_app';
import { useDispatch } from 'react-redux';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useChildBountyCreationSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';

import { parseBalance } from '../Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import Image from 'next/image';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { EChildBountySteps } from './types';
import { childBountyCreationActions } from '~src/redux/childBountyCreation';
import Address from '~src/ui-components/Address';
import Alert from '~src/basic-components/Alert';

interface Props {
	open: boolean;
	setOpen: (pre: boolean) => void;
	setStep: (pre: EChildBountySteps) => void;
	multisigData: { signatories: string[]; threshold: number };
}

const ZERO_BN = new BN(0);
const ChildBountySuccessModal = ({ open, setOpen, setStep, multisigData }: Props) => {
	const { childBountyIndex, reqAmount, curator, parentBountyIndex } = useChildBountyCreationSelector();
	const { loginAddress } = useUserDetailsSelector();
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const bnRequestedAmount = new BN(reqAmount);

	return (
		<Modal
			open={open}
			onCancel={() => {
				setOpen(false);
				dispatch(childBountyCreationActions.resetChildBountyCreationStore());
				setStep(EChildBountySteps.WRITE_CHILDBOUNTY);
			}}
			className={classNames(poppins.className, poppins.variable, 'w-[620px] dark:[&>.ant-modal-content]:bg-section-dark-overlay')}
			maskClosable={false}
			closeIcon={<CloseIcon />}
			wrapClassName={'dark:bg-modalOverlayDark antSteps'}
			centered
			footer={
				!multisigData?.threshold ? (
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
				) : (
					false
				)
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

				<label className='mt-0 text-xl font-semibold text-bodyBlue dark:text-blue-dark-high'>Child Bounty creation initiated for</label>
				{!bnRequestedAmount?.eq(ZERO_BN) && <span className='mt-2 text-2xl font-semibold text-pink_primary'>{parseBalance(bnRequestedAmount.toString(), 2, true, network)}</span>}
				{
					<div className='my-2 flex'>
						<div className='mt-[10px] flex flex-col gap-1.5 text-sm text-lightBlue dark:text-blue-dark-medium'>
							<span className='flex'>
								<span className='w-[172px]'>Proposer:</span>
								<div className='flex gap-3'>
									<Address
										addressClassName='text-bodyBlue dark:text-blue-dark-high font-semibold text-sm'
										address={loginAddress}
										isTruncateUsername={false}
										iconSize={18}
										displayInline
										disableTooltip
									/>
									{/* multisig Tag */}
									{multisigData?.threshold > 0 && <Tag className={'rounded-full bg-[#EFF0F1] px-3 py-0.5 text-xs text-[#F4970B] dark:bg-[#EFF0F1]'}>Multisig Address</Tag>}
								</div>
							</span>
							{!!curator?.length && (
								<span className='flex'>
									<span className='w-[172px]'>Child Bounty Curator:</span>
									<div className='flex flex-col'>
										<Address
											address={curator}
											displayInline
											iconSize={18}
											isTruncateUsername={false}
											disableTooltip
										/>
									</div>
								</span>
							)}

							{!bnRequestedAmount?.eq(ZERO_BN) && (
								<span className='flex'>
									<span className='w-[172px]'>Child Bounty Amount:</span>
									<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>{parseBalance(bnRequestedAmount.toString(), 2, true, network)}</span>
								</span>
							)}

							{parentBountyIndex && !isNaN(parentBountyIndex) && (
								<span className='flex'>
									<span className='w-[172px]'>Link to parent bounty:</span>
									<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
										<Link
											onClick={() => dispatch(childBountyCreationActions.resetChildBountyCreationStore())}
											href={`https://${network}.polkassembly.io/bounty/${parentBountyIndex}`}
											className='mb-2 flex items-center gap-x-1 text-pink_primary'
											target='_blank'
											rel='noopener noreferrer'
										>
											Link
											<Image
												src='/assets/icons/redirect.svg'
												height={16}
												width={16}
												alt=''
											/>
										</Link>
									</span>
								</span>
							)}
						</div>
					</div>
				}
				{multisigData?.threshold > 0 && (
					<Alert
						showIcon
						className='mb-6 mt-4'
						message={
							<div className='text-xs'>
								An approval request has been sent to signatories to confirm transaction.{' '}
								<Link
									href={'https://app.polkasafe.xyz'}
									className='text-xs text-pink_primary'
								>
									View Details
								</Link>
							</div>
						}
					/>
				)}
			</div>
		</Modal>
	);
};

export default ChildBountySuccessModal;
