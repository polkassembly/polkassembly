// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Alert } from 'antd';
import { poppins } from 'pages/_app';
import Image from 'next/image';
import Link from 'next/link';
import DownArrowIcon from '~assets/icons/down-arrow.svg';

interface Props {
	showMultisigInfoCard: boolean;
	showIdentityInfoCard: boolean;
	isDiscussionLinked: boolean;
}
const MissingInfoAlert = ({ showIdentityInfoCard, showMultisigInfoCard, isDiscussionLinked }: Props) => {
	const [showWarnings, setShowWarning] = useState<boolean>(false);
	const leftAction = (showIdentityInfoCard ? 1 : 0) + (showMultisigInfoCard ? 1 : 0) + (isDiscussionLinked ? 0 : 1);

	return (
		<Alert
			type='warning'
			className={`mt-5 rounded-[4px] text-bodyBlue dark:border-warningAlertBorderDark dark:bg-warningAlertBgDark ${poppins.variable} ${poppins.className}`}
			showIcon
			message={
				<div className='mt-0.5 text-xs dark:text-blue-dark-high'>
					<span>
						{leftAction} of 3 actions items are not in line with expectation.The community will have visibility regarding these details. The other two can be rectified and done
						later.
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
						<DownArrowIcon className={showWarnings ? 'rotate-180 cursor-pointer' : 'cursor-pointer'} />
					</span>
					{showWarnings && (
						<ul className='ml-2.5 flex flex-col gap-1 text-bodyBlue dark:text-blue-dark-high'>
							{showMultisigInfoCard && <li>Beneficiary Address is not a multisig. </li>}
							{!isDiscussionLinked && <li>Discussion Post not added. </li>}
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
							{showIdentityInfoCard && (
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
							)}
						</ul>
					)}
				</div>
			}
		/>
	);
};
export default MissingInfoAlert;
