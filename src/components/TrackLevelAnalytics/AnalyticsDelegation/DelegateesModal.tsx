// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Modal } from 'antd';
import React, { useState } from 'react';
import { CapitalIcon, CloseIcon, ConvictionIcon, EmailIconNew, VoterIcon } from '~src/ui-components/CustomIcons';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { useNetworkSelector } from '~src/redux/selectors';
import Address from '~src/ui-components/Address';
import { IDelegateesModal } from '../types';
import { styled } from 'styled-components';
import { useTranslation } from 'next-i18next';

const StyledModal = styled(Modal)`
	@media (max-width: 640px) {
		&.modal {
			width: 725px;
			max-width: 100%;
		}
		.ant-modal-content {
			padding: 6px !important;
			border-radius: 14px !important;
			box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.08) !important;
		}
	}
`;

const DelegateesModal = ({ className, open, setOpen, delegateesData, index }: IDelegateesModal) => {
	const { network } = useNetworkSelector();
	const { t } = useTranslation('common');
	const delegateeData = delegateesData[index];
	const totalData = {
		capital: delegateeData?.data.reduce((acc, curr) => acc + BigInt(curr.capital), BigInt(0)).toString(),
		count: delegateeData?.count,
		from: index,
		votingPower: delegateeData?.data.reduce((acc, curr) => acc + BigInt(curr.votingPower), BigInt(0)).toString()
	};
	const convictionPower = Number(totalData.votingPower) / Number(totalData.capital);
	const [showAll, setShowAll] = useState(false);

	return (
		<StyledModal
			open={open}
			onCancel={() => setOpen(false)}
			className={'modal w-[725px] max-md:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay'}
			footer={false}
			title={
				<div className='-mx-6 mb-6 flex items-center border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-4 text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
					{t('vote_details')}
				</div>
			}
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<main className='dark:bg-section-dark-overlay'>
				<div className=' dark:bg-section-dark-overlay '>
					<p className='mb-3 text-sm font-medium text-blue-light-high dark:text-blue-dark-high'>{t('delegation_detail')}</p>
				</div>
				<div className='my-3 flex justify-between dark:bg-section-dark-overlay'>
					<div className='flex w-[200px] flex-col gap-1'>
						<div className='mb-1 text-xs font-medium text-lightBlue dark:text-blue-dark-medium'>{t('self_votes')}</div>
						<div className='flex justify-between'>
							<span className='flex items-center gap-1 text-xs text-blue-light-helper dark:text-blue-dark-medium'>
								<VoterIcon className='text-lightBlue dark:text-blue-dark-medium' /> {t('voting_power')}
							</span>
							<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>{parseBalance((totalData.votingPower || 0).toString(), 2, true, network)}</span>
						</div>
						<div className='flex justify-between'>
							<span className='flex items-center gap-1 text-xs text-blue-light-helper dark:text-blue-dark-medium'>
								<ConvictionIcon className='text-lightBlue dark:text-blue-dark-medium' /> {t('conviction')}
							</span>
							<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>{Number(convictionPower.toFixed(1))}x</span>
						</div>
						<div className='flex justify-between'>
							<span className='flex items-center gap-1 text-xs text-blue-light-helper dark:text-blue-dark-medium'>
								<CapitalIcon className='text-lightBlue dark:text-blue-dark-medium' /> {t('capital')}
							</span>
							<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>{parseBalance((totalData.capital || 0).toString(), 2, true, network)}</span>
						</div>
					</div>
					{delegateeData?.count && (
						<>
							<div className='border-y-0 border-l-2 border-r-0 border-dashed border-section-light-container dark:border-[#3B444F] dark:border-separatorDark'></div>
							<div className='mr-3 flex w-[200px] flex-col gap-1'>
								<div className='mb-1 text-xs font-medium text-lightBlue dark:text-blue-dark-medium'>{t('delegated_votes')}</div>
								<div className='flex justify-between'>
									<span className='flex items-center gap-1 text-xs text-blue-light-helper dark:text-blue-dark-medium'>
										<VoterIcon className='text-lightBlue dark:text-blue-dark-medium' /> {t('voting_power')}
									</span>
									<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>{parseBalance((totalData?.votingPower || '0').toString(), 2, true, network)}</span>
								</div>
								<div className='flex justify-between'>
									<span className='flex items-center gap-1 text-xs text-blue-light-helper dark:text-blue-dark-medium'>
										<EmailIconNew className='text-lightBlue dark:text-blue-dark-medium' /> {t('delegators')}
									</span>
									<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>{totalData?.count}</span>
								</div>
								<div className='flex justify-between'>
									<span className='flex items-center gap-1 text-xs text-blue-light-helper dark:text-blue-dark-medium'>
										<CapitalIcon className='text-lightBlue dark:text-blue-dark-medium' /> {t('capital')}
									</span>
									<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>{parseBalance((totalData?.capital || '0').toString(), 2, true, network)}</span>
								</div>
							</div>
						</>
					)}
				</div>
				<Divider
					dashed
					className='mt-6 border-[2px] border-x-0 border-b-0 border-section-light-container dark:border-[#3B444F] dark:border-separatorDark'
				/>
				<div className='flex flex-col gap-4 dark:bg-section-dark-overlay'>
					{totalData?.count > 1 && (
						<>
							<div>
								<p className='mb-4 text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>{t('delegation_list')}</p>
								<div className='mb-2 flex items-start justify-between text-xs font-semibold'>
									<div className='w-[200px] text-lightBlue dark:text-blue-dark-medium'>{t('delegators')}</div>
									<div className='w-[110px] items-center text-lightBlue dark:text-blue-dark-medium'>{t('amount')}</div>
									<div className='ml-1 w-[110px] items-center text-lightBlue dark:text-blue-dark-medium'>{t('conviction')}</div>
									<div className='w-[100px] items-center text-lightBlue dark:text-blue-dark-medium'>{t('voting_power')}</div>
								</div>
								{delegateeData.data.slice(0, showAll ? delegateeData.data.length : 3).map((item, index) => (
									<div
										key={index}
										className='flex items-start justify-between text-xs'
									>
										<div className='my-1 w-[200px] text-lightBlue dark:text-blue-dark-medium'>
											<Address
												address={item.from}
												isTruncateUsername={false}
												displayInline
											/>
										</div>
										<div className='my-1 w-[110px] items-center text-lightBlue dark:text-blue-dark-medium'>{parseBalance((item?.capital || '0').toString(), 2, true, network)}</div>
										<div className='my-1 ml-1 w-[110px] items-center text-lightBlue dark:text-blue-dark-medium'>{item.lockedPeriod}x/d</div>
										<div className='my-1 w-[100px] items-center text-lightBlue dark:text-blue-dark-medium'>
											{parseBalance((item.votingPower || '0').toString(), 2, true, network)}
										</div>
									</div>
								))}
								{totalData?.count > 3 && (
									<span
										className='cursor-pointer text-xs font-medium text-pink_primary'
										onClick={() => setShowAll(!showAll)}
									>
										{showAll ? t('show_less') : t('show_all')}
									</span>
								)}
							</div>
						</>
					)}
				</div>
			</main>
		</StyledModal>
	);
};

export default DelegateesModal;
