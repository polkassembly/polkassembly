// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal, Spin } from 'antd';
import React, { useEffect } from 'react';
import { CalenderIcon, CapitalIcon, CloseIcon, ConvictionIcon, EmailIconNew, SubscanIcon, VoterIcon } from './CustomIcons';
import { dmSans } from 'pages/_app';
import Address from './Address';
import dayjs from 'dayjs';
import { IVotesData } from 'pages/api/v1/votesHistory/getVotesByVoter';
import { noTitle } from '~src/global/noTitle';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import { formatBalance } from '@polkadot/util';
import { useTranslation } from 'next-i18next';

interface Props {
	className?: string;
	open: boolean;
	setOpen: (pre: boolean) => void;
	expandViewVote: IVotesData | null;
	setExpandViewVote: (pre: IVotesData | null) => void;
	delegatorsLoading: boolean;
}

const VoteHistoryExpandModal = ({ className, open, setOpen, expandViewVote, setExpandViewVote, delegatorsLoading }: Props) => {
	const { network } = useNetworkSelector();
	const { t } = useTranslation('common');
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return (
		<Modal
			maskClosable={false}
			footer={false}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			className={`${dmSans.variable} ${dmSans.className} padding shadow-[0px 8px 18px rgba(0, 0, 0, 0.06)] w-[600px] max-md:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			title={
				<div className='-mx-6 mb-6 flex items-center gap-4 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-4 text-xl font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
					{expandViewVote?.proposal.title?.length ? `${expandViewVote?.proposal.title?.slice(0, 40)}${expandViewVote?.proposal.title?.length > 40 ? '...' : ''}` : noTitle}
					<span onClick={() => window.open(`https://polkadot.subscan.io/extrinsic/${expandViewVote?.extrinsicIndex}`, '_blank')}>
						<SubscanIcon className='cursor-pointer text-xl text-lightBlue dark:text-[#9E9E9E] max-md:hidden' />
					</span>
				</div>
			}
			open={open}
			onCancel={() => {
				setOpen(false);
				setExpandViewVote(null);
			}}
		>
			<Spin spinning={delegatorsLoading}>
				{!!expandViewVote && (
					<div>
						<span className='dark:text-white'>
							<span className='flex items-center gap-1 text-xs text-bodyBlue dark:text-blue-dark-high'>
								<CalenderIcon className='text-lightBlue dark:text-blue-dark-medium' />{' '}
								{dayjs(expandViewVote?.proposal?.createdAt)
									.format('MM/DD/YYYY h:mm A')
									.toString()}
							</span>
						</span>
						<div className='mt-4 border-0 border-t-[1px] border-dashed border-[#DCDFE3] pb-6 pt-4 text-sm text-lightBlue dark:border-separatorDark dark:text-blue-dark-medium max-md:bg-transparent'>
							<div className='flex flex-col gap-4'>
								<div className=' flex items-center gap-2 max-md:flex-col max-md:items-start'>
									<label className='flex items-center gap-2 font-medium'>{t('vote_details')}:</label>
									{!!expandViewVote?.isDelegatedVote && (
										<Address
											address={expandViewVote?.voter}
											iconSize={18}
											displayInline
											isTruncateUsername={false}
										/>
									)}
								</div>
								{!!expandViewVote?.isDelegatedVote && (
									<div className=' flex items-center gap-2 max-md:flex-col max-md:items-start'>
										<label className='flex items-center gap-2 font-medium'>
											{t('delegator')}:
											<Address
												address={expandViewVote?.voter}
												iconSize={18}
												displayInline
												isTruncateUsername={false}
											/>
										</label>
										<label className='flex items-center gap-2 font-medium'>
											{t('vote_casted_by')}:
											<Address
												address={expandViewVote?.delegatedTo || ''}
												iconSize={18}
												displayInline
												isTruncateUsername={false}
											/>
										</label>
									</div>
								)}
								<div className='flex justify-between max-md:flex-col max-md:gap-2'>
									<div className='w-[50%] border-0 border-r-[1px] border-dashed border-[#DCDFE3] dark:border-separatorDark max-md:w-[100%] max-md:border-0 max-md:border-b-[1px] max-md:pb-2'>
										<label className='font-semibold'>{t('self_votes')}</label>
										<div className='mt-2 flex flex-col gap-2 pr-6 max-md:pr-0'>
											<div className='flex justify-between'>
												<span className='flex items-center gap-1 text-sm text-[#576D8B] dark:text-icon-dark-inactive'>
													<VoterIcon className='text-lightBlue dark:text-blue-dark-medium' /> {t('voting_power')}
												</span>
												<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
													{Number(formatedBalance((expandViewVote?.balance?.toString() || '0').toString(), unit, 2).replaceAll(',', '')) *
														Number(expandViewVote?.lockPeriod || 0.1)}{' '}
													{unit}
												</span>
											</div>
											<div className='flex justify-between'>
												<span className='flex items-center gap-1 text-sm text-[#576D8B] dark:text-icon-dark-inactive'>
													<ConvictionIcon className='text-lightBlue dark:text-blue-dark-medium' /> {t('conviction')}
												</span>
												<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
													{expandViewVote?.lockPeriod || 0.1}x{expandViewVote?.isDelegatedVote && '/d'}
												</span>
											</div>
											<div className='flex justify-between'>
												<span className='flex items-center gap-1 text-sm text-[#576D8B] dark:text-icon-dark-inactive'>
													<CapitalIcon className='text-lightBlue dark:text-blue-dark-medium' /> {t('capital')}
												</span>
												<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
													{formatedBalance((expandViewVote?.balance?.toString() || '0').toString(), unit, 2)} {unit}
												</span>
											</div>
										</div>
									</div>
									<div className='w-[50%] justify-start max-md:w-[100%] md:pl-6'>
										<label className='font-semibold'>{t('delegation_votes')}</label>
										<div className='mt-2 flex flex-col gap-2 lg:pr-4'>
											<div className='flex justify-between'>
												<span className='flex items-center gap-1 text-sm text-[#576D8B] dark:text-icon-dark-inactive'>
													<VoterIcon className='text-lightBlue dark:text-blue-dark-medium' /> {t('votes')}
												</span>
												<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
													{formatedBalance((expandViewVote?.delegatedVotingPower || '0')?.toString(), unit, 2)} {unit}
												</span>
											</div>
											<div className='flex justify-between'>
												<span className='flex items-center gap-1 text-sm text-[#576D8B] dark:text-icon-dark-inactive'>
													<EmailIconNew className='text-lightBlue dark:text-blue-dark-medium' /> {t('delegators')}
												</span>
												<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>{expandViewVote?.delegatorsCount || 0}</span>
											</div>
											<div className='flex justify-between'>
												<span className='flex items-center gap-1 text-sm text-[#576D8B] dark:text-icon-dark-inactive'>
													<CapitalIcon className='text-lightBlue dark:text-blue-dark-medium' /> {t('capital')}
												</span>
												<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
													{formatedBalance((expandViewVote?.delegateCapital || '0')?.toString(), unit, 2)} {unit}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<p className='m-0 mb-4 text-xs text-bodyBlue dark:text-blue-dark-high'>
							d: {t('delegation')} s: {t('split')} sa: {t('split_abstain')}
						</p>
					</div>
				)}
			</Spin>
		</Modal>
	);
};

export default VoteHistoryExpandModal;
