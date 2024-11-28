// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import { CaretDownOutlined, CaretUpOutlined, LoadingOutlined } from '@ant-design/icons';
import { useTheme } from 'next-themes';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';

interface Props {
	currentTokenPrice: {
		isLoading: boolean;
		value: string;
	};
	priceWeeklyChange: {
		isLoading: boolean;
		value: string;
	};
}

const CurrentPrice = ({ currentTokenPrice, priceWeeklyChange }: Props) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common');

	return (
		<>
			{!['moonbase', 'polimec', 'rolimec', 'westend', 'laos-sigma'].includes(network) && (
				<div className='flex w-full flex-1 rounded-xxl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay sm:my-0 lg:px-6 lg:py-3'>
					<div className='w-full flex-col gap-x-0 lg:flex'>
						<div className='mb-1.5 flex w-full items-center justify-center lg:hidden'>
							{theme === 'dark' ? (
								<ImageIcon
									src='/assets/icons/CurrentPriceDark.svg'
									alt={t('current_price_dark_icon')}
									imgClassName='lg:hidden'
								/>
							) : (
								<ImageIcon
									src='/assets/icons/currentprice.svg'
									alt={t('current_price_icon')}
									imgClassName='lg:hidden'
								/>
							)}
						</div>
						{!(currentTokenPrice.isLoading || priceWeeklyChange.isLoading) ? (
							<>
								<div className='mb-4'>
									<div className='my-1 flex items-center'>
										<span className='mr-2 hidden text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium md:flex'>
											{t('current_price_of', { token: chainProperties[network]?.tokenSymbol })}
										</span>
										<span className='flex text-xs font-medium text-lightBlue dark:text-blue-dark-medium md:hidden'>
											{t('price_token', { token: chainProperties[network]?.tokenSymbol })}
										</span>
									</div>
									<div className='text-lg font-medium'>
										{currentTokenPrice.value === 'N/A' ? (
											<span>{t('na')}</span>
										) : currentTokenPrice.value && !isNaN(Number(currentTokenPrice.value)) ? (
											<>
												<span className='text-lightBlue dark:text-blue-dark-high'>$ </span>
												<span className='text-bodyBlue dark:text-blue-dark-high'>{currentTokenPrice.value}</span>
											</>
										) : null}
									</div>
								</div>
								<div className='flex flex-col justify-center gap-y-3 overflow-hidden font-medium text-bodyBlue dark:text-blue-dark-high'>
									<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
									<div className='flex items-center text-xs text-lightBlue dark:text-blue-dark-high md:whitespace-pre'>
										{priceWeeklyChange.value === 'N/A' ? (
											t('na')
										) : priceWeeklyChange.value ? (
											<>
												<span className='mr-1 sm:mr-2'>{t('weekly_change')}</span>
												<div className='flex items-center'>
													<span className='font-semibold'>{Math.abs(Number(priceWeeklyChange.value))}%</span>
													{Number(priceWeeklyChange.value) < 0 ? (
														<CaretDownOutlined style={{ color: 'red', marginLeft: '1.5px' }} />
													) : (
														<CaretUpOutlined style={{ color: '#52C41A', marginLeft: '1.5px' }} />
													)}
												</div>
											</>
										) : null}
									</div>
								</div>
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
								src='/assets/icons/CurrentPriceDark.svg'
								alt={t('current_price_dark_icon')}
								imgClassName='xs:hidden lg:block w-full'
							/>
						) : (
							<ImageIcon
								src='/assets/icons/currentprice.svg'
								alt={t('current_price_icon')}
								imgClassName='xs:hidden lg:block w-full'
							/>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default CurrentPrice;
