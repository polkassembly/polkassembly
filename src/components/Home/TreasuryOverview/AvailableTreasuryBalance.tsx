// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import { useTheme } from 'next-themes';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { useNetworkSelector } from '~src/redux/selectors';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import ImageIcon from '~src/ui-components/ImageIcon';
import { LoadingOutlined } from '@ant-design/icons';
import { chainProperties } from '~src/global/networkConstants';

interface Props {
	available: {
		isLoading: boolean;
		value: string;
		valueUSD: string;
	};
}

const AvailableTreasuryBalance = ({ available }: Props) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common');

	return (
		<>
			<div className='flex w-full flex-1 rounded-xxl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay sm:my-0 lg:px-6 lg:py-3'>
				<div className='w-full flex-col gap-x-0 lg:flex'>
					<div className='mb-1.5 flex w-full items-center justify-center lg:hidden'>
						{theme === 'dark' ? (
							<ImageIcon
								src='/assets/icons/AvailableDark.svg'
								alt={t('available_dark_icon')}
								imgClassName='lg:hidden'
							/>
						) : (
							<ImageIcon
								src='/assets/icons/available.svg'
								alt={t('available_icon')}
								imgClassName='lg:hidden'
							/>
						)}
					</div>
					{!available.isLoading ? (
						<>
							<div className='mb-4'>
								<div className='my-1 flex items-center'>
									<span className='mr-2 p-0 text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'>{t('available')}</span>
									<HelperTooltip
										text={t('funds_tooltip')}
										className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'
									/>
								</div>
								<div className='flex justify-between font-medium'>
									{available.value ? (
										<span className='text-lg font-medium text-bodyBlue dark:text-blue-dark-high'>
											{available.value} <span className='text-sm text-lightBlue dark:text-blue-dark-high'>{chainProperties[network]?.tokenSymbol}</span>
										</span>
									) : (
										<span>{t('na')}</span>
									)}
								</div>
							</div>
							{!['polymesh', 'polymesh-test'].includes(network) && (
								<>
									<div className='flex flex-col justify-center gap-y-3 font-medium text-bodyBlue dark:text-blue-dark-high'>
										<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
										<span className='flex flex-col justify-center text-xs font-medium text-lightBlue dark:text-blue-dark-high'>
											{available.valueUSD ? `~ $${available.valueUSD}` : t('na')}
										</span>
									</div>
								</>
							)}
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
							src='/assets/icons/AvailableDark.svg'
							alt={t('available_dark_icon')}
							imgClassName='xs:hidden lg:block w-full'
						/>
					) : (
						<ImageIcon
							src='/assets/icons/available.svg'
							alt={t('available_icon')}
							imgClassName='xs:hidden lg:block w-full'
						/>
					)}
				</div>
			</div>
		</>
	);
};

export default AvailableTreasuryBalance;
