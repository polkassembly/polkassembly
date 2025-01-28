// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import { useTheme } from 'next-themes';
import React from 'react';
import { useNetworkSelector } from '~src/redux/selectors';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import ImageIcon from '~src/ui-components/ImageIcon';
import { LoadingOutlined } from '@ant-design/icons';
import { chainProperties } from '~src/global/networkConstants';

interface Props {
	nextBurn: {
		isLoading: boolean;
		value: string;
		valueUSD: string;
	};
}

const NextBurn = ({ nextBurn }: Props) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	return (
		<>
			{!['moonbeam', 'kilt', 'moonbase', 'moonriver', 'polymesh', 'polymesh-test', 'polimec', 'rolimec'].includes(network) && (
				<div className='flex w-full flex-1 rounded-xxl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay sm:my-0 lg:px-6 lg:py-3'>
					<div className='w-full flex-col gap-x-0 lg:flex'>
						<div className='mb-1.5 flex w-full items-center justify-center lg:hidden'>
							{theme === 'dark' ? (
								<ImageIcon
									src='/assets/icons/NextBurnDark.svg'
									alt='next burn dark icon'
									imgClassName='lg:hidden'
								/>
							) : (
								<ImageIcon
									src='/assets/icons/nextburn.svg'
									alt='next burn icon'
									imgClassName='lg:hidden'
								/>
							)}
						</div>
						{!nextBurn.isLoading ? (
							<>
								<div className='mb-4'>
									<div className='my-1 flex items-center text-xs text-lightBlue dark:text-blue-dark-medium'>
										<span className='mr-2 text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'>Next Burn</span>

										<HelperTooltip text='If the Treasury ends a spend period without spending all of its funds, it suffers a burn of a percentage of its funds.' />
									</div>

									<div className='flex justify-between text-lg font-medium text-bodyBlue dark:text-blue-dark-high'>
										{nextBurn.value ? (
											<span>
												{nextBurn.value} <span className='text-sm text-lightBlue dark:text-blue-dark-high'>{chainProperties[network]?.tokenSymbol}</span>
											</span>
										) : null}
									</div>
								</div>
								<div className='flex flex-col justify-center gap-y-3 font-medium text-sidebarBlue'>
									<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
									<span className='mr-2 w-full text-xs font-medium text-lightBlue dark:text-blue-dark-high'>{nextBurn.valueUSD ? `~ $${nextBurn.valueUSD}` : 'N/A'}</span>
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
								src='/assets/icons/NextBurnDark.svg'
								alt='next burn dark icon'
								imgClassName='xs:hidden lg:block w-full'
							/>
						) : (
							<ImageIcon
								src='/assets/icons/nextburn.svg'
								alt='next burn icon'
								imgClassName='xs:hidden lg:block w-full'
							/>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default NextBurn;
