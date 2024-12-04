// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import { useTheme } from 'next-themes';
import React from 'react';
import ProgressBar from '~src/basic-components/ProgressBar/ProgressBar';
import { useNetworkSelector } from '~src/redux/selectors';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import ImageIcon from '~src/ui-components/ImageIcon';
import { LoadingOutlined } from '@ant-design/icons';
import { dmSans } from 'pages/_app';

interface Props {
	spendPeriod: {
		isLoading: boolean;
		percentage: number;
		value: {
			days: number;
			hours: number;
			minutes: number;
			total: number;
		};
	};
	inTreasuryProposals?: boolean;
}

const SpendPeriod = ({ spendPeriod, inTreasuryProposals }: Props) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const trailColor = theme === 'dark' ? '#1E262D' : '#E5E5E5';
	return (
		<>
			{!['polymesh', 'polymesh-test', 'mythos'].includes(network) && (
				<>
					{!inTreasuryProposals && (
						<div className='flex w-full flex-1 rounded-xxl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay sm:my-0 lg:px-6 lg:py-3'>
							<div className='w-full flex-col gap-x-0 lg:flex'>
								<div className='mb-1.5 flex w-full items-center justify-center lg:hidden'>
									{theme === 'dark' ? (
										<ImageIcon
											src='/assets/icons/SpendPeriodDark.svg'
											alt='spend period dark icon'
											imgClassName='lg:hidden'
										/>
									) : (
										<ImageIcon
											src='/assets/icons/spendperiod.svg'
											alt='spend period icon'
											imgClassName='lg:hidden'
										/>
									)}
								</div>
								{!spendPeriod.isLoading ? (
									<>
										<div className='mb-5 sm:mb-4'>
											<div className='my-1 flex items-center'>
												<span className='mr-2 mt-1 text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium lg:mt-0'>Spend Period</span>

												<HelperTooltip
													text='Funds requested from the treasury are periodically distributed at the end of the spend period.'
													className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'
												/>
											</div>

											<div className='mt-1 flex items-baseline whitespace-pre font-medium text-bodyBlue dark:text-blue-dark-high sm:mt-0'>
												{spendPeriod.value?.total ? (
													<>
														{spendPeriod.value?.days ? (
															<>
																<span className='text-base sm:text-lg'>{spendPeriod.value.days}&nbsp;</span>
																<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>days&nbsp;</span>
															</>
														) : null}
														<>
															<span className='text-base sm:text-lg'>{spendPeriod.value.hours}&nbsp;</span>
															<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>hrs&nbsp;</span>
														</>
														{!spendPeriod.value?.days ? (
															<>
																<span className='text-base sm:text-lg'>{spendPeriod.value.minutes}&nbsp;</span>
																<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>mins&nbsp;</span>
															</>
														) : null}
														<span className='text-[10px] text-lightBlue dark:text-blue-dark-medium sm:text-xs'>/ {spendPeriod.value.total} days </span>
													</>
												) : (
													'N/A'
												)}
											</div>
										</div>
										{
											<div className='flex flex-col justify-center gap-y-3 font-medium'>
												<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
												<span className='flex items-center gap-2'>
													<ProgressBar
														className='m-0 flex items-center p-0'
														percent={!isNaN(Number(spendPeriod.percentage)) ? spendPeriod.percentage : 0}
														trailColor={trailColor}
														strokeColor='#E5007A'
														size='small'
														showInfo={false}
													/>
													<span className={`${dmSans.className} ${dmSans.variable} text-xs font-medium text-blue-light-high dark:text-blue-dark-high`}>
														{!isNaN(Number(spendPeriod.percentage)) ? spendPeriod.percentage : 0}%
													</span>
												</span>
											</div>
										}
									</>
								) : (
									<div className='flex min-h-[89px] w-full items-center justify-center'>
										<LoadingOutlined />
									</div>
								)}
							</div>
							<div>
								{theme === 'dark' ? (
									<ImageIcon
										src='/assets/icons/SpendPeriodDark.svg'
										alt='spend period dark icon'
										imgClassName='mt-2 xs:hidden lg:block w-full'
									/>
								) : (
									<ImageIcon
										src='/assets/icons/spendperiod.svg'
										alt='spend period icon'
										imgClassName='mt-2 xs:hidden lg:block w-full'
									/>
								)}
							</div>
						</div>
					)}
				</>
			)}
		</>
	);
};

export default SpendPeriod;
