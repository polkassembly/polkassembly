// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal } from 'antd';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import React from 'react';
import styled from 'styled-components'; // Fixed styled import
import { CloseIcon } from '~src/ui-components/CustomIcons';
import Image from 'next/image';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import { userDetailsActions } from '~src/redux/userDetails';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { useDispatch } from 'react-redux';

interface BalanceItem {
	icon: string;
	label: string;
	value: string;
}

const ProfileBalanceModal = ({
	className,
	setOpen,
	open,
	balancesArr = [],
	setOpenModal,
	accounts,
	delegationDashboardAddress,
	defaultAddress,
	setAddress
}: {
	className: string;
	delegationDashboardAddress: string;
	defaultAddress: string;
	setOpen: (pre: boolean) => void;
	open: boolean;
	balancesArr: BalanceItem[];
	setOpenModal: (pre: boolean) => void;
	setAddress: (pre: string) => void;
	accounts: InjectedAccount[];
}) => {
	const { network } = useNetworkSelector();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const dispatch = useDispatch();

	if (balancesArr.length < 1) return null;

	return (
		<Modal
			open={open}
			onCancel={() => setOpen(false)}
			className={classNames('max-md:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay', poppins.className, poppins.variable)}
			footer={
				<div>
					<div className='-mt-4 mb-[14px]'>
						{!!accounts && accounts?.length > 0 && (
							<AccountSelectionForm
								linkAddressTextDisabled
								addressTextClassName='text-white'
								accounts={accounts}
								title='Your Address'
								address={delegationDashboardAddress || defaultAddress}
								withBalance={false}
								className='cursor-pointer text-sm text-[#788698]'
								onAccountChange={(address) => {
									setAddress(address);
									dispatch(userDetailsActions.updateDelegationDashboardAddress(address));
								}}
								inputClassName='text-white border-[1.5px] border-section-light-container dark:border-separatorDark bg-transparent text-sm border-solid px-3 rounded-[8px] py-[6px]'
								isSwitchButton={true}
								setSwitchModalOpen={setOpenModal}
								withoutInfo={true}
								isTruncateUsername
							/>
						)}
					</div>

					<div className='items-center gap-2 sm:hidden'>
						{balancesArr.slice(1, 3).map((balance: BalanceItem) => (
							<div
								key={balance?.label}
								className='mt-1 flex h-full gap-1'
							>
								<div className={`${poppins.variable} ${poppins.className} flex items-center justify-start gap-1`}>
									<Image
										className='h-5 w-5 rounded-full object-contain'
										src={balance.icon}
										alt='Logo'
										width={20}
										height={20}
									/>
									<span className='text-sm font-medium tracking-[0.01em] text-blue-light-medium dark:text-blue-dark-high '>{balance.label}</span>
									<div className={'ml-1 flex items-baseline text-xl font-semibold tracking-[0.0015em] text-blue-light-high dark:text-blue-dark-high '}>
										{formatedBalance(balance.value, unit, 2)}
										<span className='ml-1 text-sm font-medium tracking-[0.015em] '>{unit}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			}
			title={
				<div className='items-center gap-2 sm:hidden'>
					{balancesArr.slice(0, 1).map((balance: BalanceItem) => (
						<div
							key={balance?.label}
							className='flex h-full gap-1'
						>
							<div className={`${poppins.variable} ${poppins.className} flex items-center justify-start gap-1`}>
								<Image
									src={'/assets/icons/polkadot-logo.svg'}
									height={20}
									width={20}
									alt=''
									className={'mr-[2px] sm:hidden'}
								/>
								<span className='text-sm font-medium tracking-[0.01em] text-white'>{balance.label}</span>
								<div className={'ml-1 flex items-baseline text-xl font-semibold tracking-[0.0015em] text-white'}>
									{formatedBalance(balance.value, unit, 2)}
									<span className='ml-1 text-sm font-medium tracking-[0.015em] '>{unit}</span>
								</div>
							</div>
						</div>
					))}
				</div>
			}
			wrapClassName={`${className} mt-14 p-0 dark:bg-modalOverlayDark`}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<div></div>
		</Modal>
	);
};

export default styled(ProfileBalanceModal)`
	.ant-modal-header {
		padding: 12px 16px !important;
		margin: -20px -24px !important;
		background: radial-gradient(99.69% 25520% at 1.22% 0%, #42122c 0%, #a6075c 32.81%, #952863 77.08%, #e5007a 100%) !important;
		height: 56px !important;
		border-top-left-radius: 20px !important;
		border-top-right-radius: 20px !important;
	}
	.ant-modal-content {
		margin-top: 20px !important;
		border-radius: 20px !important;
		overflow: hidden;
	}
	.ant-modal-content .ant-modal-close {
		margin-top: -2px !important;
	}
	.ant-modal-footer {
		margin-top: 36px !important;
		margin-left: -8px !important;
		border-bottom-left-radius: 20px !important;
		border-bottom-right-radius: 20px !important;
	}
`;
