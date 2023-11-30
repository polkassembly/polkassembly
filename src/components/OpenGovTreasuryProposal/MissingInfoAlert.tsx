// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Alert } from 'antd';
import { poppins } from 'pages/_app';
import Image from 'next/image';
import Link from 'next/link';
import DownArrowIcon from '~assets/icons/down-icon.svg';
import styled from 'styled-components';
import { useNetworkSelector } from '~src/redux/selectors';
import { onchainIdentitySupportedNetwork } from '../AppLayout';

interface Props {
	showMultisigInfoCard: boolean;
	showIdentityInfoCardForBeneficiary: boolean;
	showIdentityInfoCardForProposer: boolean;
	isDiscussionLinked: boolean;
	className?: string;
	theme: string;
}
const TOTAL_STEPS_WITH_IDENTITY_CHECK = 4;
const TOTAL_STEPS_WITHOUT_IDENTITY_CHECK = 2;

const CanNotChange = () => {
	return (
		<div className='flex gap-1 text-xs font-medium text-[#576D8B] dark:text-blue-dark-medium'>
			<Image
				width={14}
				height={14}
				src='/assets/icons/warning-icon.svg'
				alt='warning'
				className={'warning-color'}
			/>
			<span>Cannot be changed</span>
		</div>
	);
};
const IdentityList = ({ aleredySet, title }: { aleredySet: boolean; title: string }) => {
	return (
		<li>
			Onchain Identity {!aleredySet && 'not '}set for {title}.
			{!aleredySet && (
				<Link
					href={'?setidentity=true'}
					className='text-xs font-medium text-pink_primary'
					target='_blank'
				>
					<Image
						width={12}
						height={12}
						src='/assets/icons/redirect.svg'
						alt='polkasafe'
						className='mx-1'
					/>
					Set identity
				</Link>
			)}
		</li>
	);
};
const MissingInfoAlert = ({ className, showIdentityInfoCardForProposer, showIdentityInfoCardForBeneficiary, showMultisigInfoCard, isDiscussionLinked, theme }: Props) => {
	const { network } = useNetworkSelector();
	const [showWarnings, setShowWarning] = useState<boolean>(true);
	const [showCompletedActions, setShowCompletedActions] = useState<boolean>(true);
	const leftAction =
		(onchainIdentitySupportedNetwork.includes(network) ? (showIdentityInfoCardForProposer ? 1 : 0) + (showIdentityInfoCardForBeneficiary ? 1 : 0) : 0) +
		(showMultisigInfoCard ? 1 : 0) +
		(isDiscussionLinked ? 0 : 1);
	const TOTAL_ACTIONS = onchainIdentitySupportedNetwork.includes(network) ? TOTAL_STEPS_WITH_IDENTITY_CHECK : TOTAL_STEPS_WITHOUT_IDENTITY_CHECK;
	return (
		<Alert
			type='warning'
			className={`mt-5 rounded-[4px] text-bodyBlue dark:border-warningAlertBorderDark dark:bg-warningAlertBgDark ${poppins.variable} ${poppins.className} ${className}`}
			showIcon
			message={
				<div className='mt-0.5 text-xs leading-5 dark:text-blue-dark-high'>
					<span>
						{leftAction} of {TOTAL_ACTIONS} suggestions regarding proposal creation have not been incorporated. The community will have visibility about this.
					</span>
				</div>
			}
			description={
				<div className='flex flex-col gap-2 text-xs dark:text-blue-dark-high'>
					{!!leftAction && (
						<>
							<span
								onClick={() => setShowWarning(!showWarnings)}
								className='flex items-center gap-1 font-medium text-pink_primary'
							>
								View warnings
								<DownArrowIcon className={`${showWarnings ? 'rotate-180 cursor-pointer' : 'cursor-pointer'} ${theme === 'dark' && 'icon-color'}`} />
							</span>

							{showWarnings && (
								<ul className='flex flex-col gap-1 text-bodyBlue dark:text-blue-dark-high'>
									{showMultisigInfoCard && (
										<li>
											<div className='flex gap-1'>
												<span>Beneficiary Address is not a multisig. </span>
												<CanNotChange />
											</div>
										</li>
									)}
									{!isDiscussionLinked && (
										<li>
											<div className='flex flex-wrap items-start gap-1'>
												Discussion post was not created to gather feedback before proposal creation
												<CanNotChange />
											</div>
										</li>
									)}
									{/* {showMultisigInfoCard && (
								<li>
									Deadline not added.
									<span className='text-pink_primary'>
										<Image
											width={14}
											height={14}
											src='/assets/icons/add-deadline.svg'
											alt='polkasafe'
											className='mx-1'
										/>
										Add Deadline
									</span>
								</li>
							)} */}

									{onchainIdentitySupportedNetwork.includes(network) && showIdentityInfoCardForProposer && (
										<IdentityList
											aleredySet={false}
											title='Proposer Address'
										/>
									)}
									{onchainIdentitySupportedNetwork.includes(network) && showIdentityInfoCardForBeneficiary && (
										<IdentityList
											aleredySet={false}
											title='Beneficiary Address'
										/>
									)}
								</ul>
							)}
						</>
					)}
					{TOTAL_ACTIONS !== leftAction && (
						<>
							<span
								onClick={() => setShowCompletedActions(!showCompletedActions)}
								className='flex items-center gap-1 font-medium text-pink_primary'
							>
								Completed Actions
								<DownArrowIcon className={`${showCompletedActions ? 'rotate-180 cursor-pointer' : 'cursor-pointer'} ${theme === 'dark' && 'icon-color'}`} />
							</span>
							{showCompletedActions && (
								<ul className='flex flex-col gap-1 text-bodyBlue dark:text-blue-dark-high'>
									{!showMultisigInfoCard && <li>Beneficiary Address is multisig.</li>}
									{isDiscussionLinked && <li>Discussion post was created to gather feedback before proposal creation.</li>}
									{onchainIdentitySupportedNetwork.includes(network) && !showIdentityInfoCardForProposer && (
										<IdentityList
											aleredySet
											title='Proposer Address'
										/>
									)}
									{onchainIdentitySupportedNetwork.includes(network) && !showIdentityInfoCardForBeneficiary && (
										<IdentityList
											aleredySet
											title='Beneficiary Address'
										/>
									)}
								</ul>
							)}
						</>
					)}
				</div>
			}
		/>
	);
};
export default styled(MissingInfoAlert)`
	.icon-color {
		filter: brightness(100%) saturate(0%) contrast(4) invert(100%) !important;
	}
	.warning-color {
		filter: brightness(100%) saturate(0%) contrast(1) invert(100%) !important;
	}
`;
