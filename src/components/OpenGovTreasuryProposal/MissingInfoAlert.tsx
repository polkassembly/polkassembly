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

interface Props {
	showMultisigInfoCard: boolean;
	showIdentityInfoCard: boolean;
	isDiscussionLinked: boolean;
	className?: string;
	theme: string;
}
const CanNotChange = () => {
	return (
		<div className='flex gap-1 text-xs font-medium'>
			<Image
				width={14}
				height={14}
				src='/assets/icons/warning-icon.svg'
				alt='warning'
				className='icon-color'
			/>
			<span>Cannot be changed</span>
		</div>
	);
};
const IdentityList = () => {
	return (
		<li>
			Onchain Identity not set.
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
		</li>
	);
};
const MissingInfoAlert = ({ className, showIdentityInfoCard, showMultisigInfoCard, isDiscussionLinked, theme }: Props) => {
	const { network } = useNetworkSelector();
	const [showWarnings, setShowWarning] = useState<boolean>(true);
	const [showCompletedActions, setShowCompletedActions] = useState<boolean>(true);
	const leftAction = (showIdentityInfoCard && network === 'polkadot' ? 1 : 0) + (showMultisigInfoCard ? 1 : 0) + (isDiscussionLinked ? 0 : 1);

	return (
		<Alert
			type='warning'
			className={`mt-5 rounded-[4px] text-bodyBlue dark:border-warningAlertBorderDark dark:bg-warningAlertBgDark ${poppins.variable} ${poppins.className} ${className}`}
			showIcon
			message={
				<div className='mt-0.5 text-xs dark:text-blue-dark-high'>
					<span>
						{leftAction} of {network === 'polkadot' ? 3 : 2} suggestions regarding proposal creation have not been incorporated. The community will have visibility about this.
					</span>
				</div>
			}
			description={
				<div className='flex flex-col gap-2 text-xs dark:text-blue-dark-high'>
					<span
						onClick={() => setShowWarning(!showWarnings)}
						className='flex items-center gap-1 font-medium text-pink_primary'
					>
						View warnings
						<DownArrowIcon className={`${showWarnings ? 'rotate-180 cursor-pointer' : 'cursor-pointer'} ${theme === 'dark' && 'icon-color'}`} />
					</span>
					{showWarnings && (
						<ul className='flex flex-col gap-1 text-bodyBlue dark:text-blue-dark-high'>
							<li>
								<div className='flex gap-1'>
									<span>Beneficiary Address is not a multisig. </span>
									<CanNotChange />
								</div>
							</li>
							<li>
								<div className='flex items-start gap-1'>
									<span className='w-[420px]'>Discussion post was not created to gather feedback before proposal creation.</span>
									<CanNotChange />
								</div>
							</li>
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

							{network === 'polkadot' && <IdentityList />}
						</ul>
					)}
					<span
						onClick={() => setShowCompletedActions(!showCompletedActions)}
						className='flex items-center gap-1 font-medium text-pink_primary'
					>
						Completed Actions
						<DownArrowIcon className={`${showCompletedActions ? 'rotate-180 cursor-pointer' : 'cursor-pointer'} ${theme === 'dark' && 'icon-color'}`} />
					</span>
					{showCompletedActions && (
						<ul className='flex flex-col gap-1 text-bodyBlue dark:text-blue-dark-high'>
							{showMultisigInfoCard && <li>Beneficiary Address is not a multisig.</li>}
							{!isDiscussionLinked && <li>Discussion post was not created to gather feedback before proposal creation.</li>}
							{network === 'polkadot' && <IdentityList />}
						</ul>
					)}
				</div>
			}
		/>
	);
};
export default styled(MissingInfoAlert)`
	.icon-color {
		filter: brightness(100%) saturate(0%) contrast(3.5) invert(100%) !important;
	}
`;
