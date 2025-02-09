// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Image from 'next/image';
import { Divider, Modal, Spin } from 'antd';
import { dmSans } from 'pages/_app';
import RedirectingIcon from '~assets/treasury/redirecting-icon.svg';
import styled from 'styled-components';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import Link from 'next/link';
import useFetchTreasuryStats from '~src/hooks/treasury/useTreasuryStats';

interface TreasuryDetailsModalProps {
	visible: boolean;
	onClose: () => void;
	unit: string;
	currentTokenPrice: string;
}

const TreasuryDetailsModal = ({ visible, onClose, unit, currentTokenPrice }: TreasuryDetailsModalProps) => {
	const { data: treasuryData, loading: treasuryLoading } = useFetchTreasuryStats();

	const availableValue = parseFloat(String(treasuryData?.relayChain?.dot));
	const tokenPrice = currentTokenPrice && currentTokenPrice !== 'N/A' ? parseFloat(currentTokenPrice) : 0;
	const assetValueNum = parseFloat(treasuryData?.assetHub?.dot || '0');
	const assetValueUSDCNum = parseFloat(treasuryData?.assetHub?.usdc || '0');
	const assetValueUSDTNum = parseFloat(treasuryData?.assetHub?.usdt || '0');
	const hydrationValueNum = parseFloat(treasuryData?.hydration?.dot || '0');
	const hydrationValueUSDCNum = parseFloat(treasuryData?.hydration?.usdc || '0');
	const hydrationValueUSDTNum = parseFloat(treasuryData?.hydration?.usdt || '0');

	const relayChainUSDValue = formatUSDWithUnits(String(availableValue * Number(tokenPrice)));
	const assetHubValue = formatUSDWithUnits(String(assetValueNum * Number(tokenPrice) + assetValueUSDCNum + assetValueUSDTNum));
	const hydrationValueTotal = formatUSDWithUnits(String(hydrationValueNum * Number(tokenPrice) + hydrationValueUSDCNum + hydrationValueUSDTNum));

	const bountyTotal = formatUSDWithUnits(String(Number(treasuryData?.bounties?.dot) * Number(tokenPrice)));

	const loansValue = treasuryData?.loans?.dot && formatUSDWithUnits(String(parseFloat(treasuryData?.loans?.dot) * tokenPrice + parseFloat(treasuryData?.loans?.usdc)));
	const fellowshipValues =
		treasuryData?.fellowship?.dot && formatUSDWithUnits(String(parseFloat(treasuryData?.fellowship?.dot) * tokenPrice + parseFloat(treasuryData?.fellowship?.usdt)));

	return (
		<Modal
			title={
				<div className=''>
					<div className={`${dmSans.className} ${dmSans.variable} text-xl font-semibold text-blue-light-high dark:text-blue-dark-high`}>Treasury Distribution</div>
					<Divider className='m-0 mt-2 bg-section-light-container p-0 dark:bg-separatorDark' />
				</div>
			}
			open={visible}
			className='w-fit p-0 px-0'
			onCancel={onClose}
			footer={null}
		>
			<Spin spinning={treasuryLoading}>
				<div className=''>
					<div className={` ${dmSans.className} ${dmSans.variable} mb-[10px] mt-4 text-sm font-medium text-[#485F7DB2] dark:text-blue-dark-medium`}>Across Networks:</div>
					<div className='flex flex-col font-medium'>
						<div className={`${dmSans.className} ${dmSans.variable} mb-[6px] items-start gap-[6px] text-blue-light-high dark:text-blue-dark-high sm:flex`}>
							<div className='flex w-[106px] gap-[6px]'>
								<Image
									alt='relay icon'
									width={20}
									height={20}
									src={'/assets/treasury/relay-chain-icon.svg'}
									className='-mt-[1px]'
								/>
								<span className={`${dmSans.className} ${dmSans.variable} text-sm font-medium `}>Relay Chain</span>
							</div>
							<div className={`${dmSans.className} ${dmSans.variable} -mt-[2px] ml-6 flex flex-col sm:ml-0`}>
								{relayChainUSDValue && <span className='ml-1 text-base font-semibold'>~ ${relayChainUSDValue}</span>}
								<div className='ml-1 flex items-center gap-[6px] text-sm'>
									<Image
										alt='relay icon'
										width={16}
										height={16}
										src={'/assets/treasury/dot-icon.svg'}
										className='-mt-[2px]'
									/>
									<span className='font-medium'>{formatUSDWithUnits(String(treasuryData?.relayChain?.dot))} </span>
									{unit}
								</div>
							</div>
						</div>

						{treasuryData?.assetHub?.dot && (
							<div className={`${dmSans.className} ${dmSans.variable} mb-[6px] items-start gap-[6px] text-blue-light-high dark:text-blue-dark-high sm:flex`}>
								<div className='flex w-[106px] gap-[6px]'>
									<Image
										alt='relay icon'
										width={20}
										height={20}
										src={'/assets/icons/asset-hub-icon.svg'}
										className='-mt-[0px]'
									/>
									<span className='text-sm font-medium '>Asset Hub</span>
								</div>
								<div className='ml-6 flex flex-col sm:ml-0'>
									{assetHubValue && (
										<span className='ml-1 text-base font-semibold'>
											~ ${assetHubValue}{' '}
											<Link
												href={'https://assethub-polkadot.subscan.io/account/14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk'}
												className=' cursor-pointer sm:hidden'
												target='_blank'
											>
												<RedirectingIcon />
											</Link>
										</span>
									)}
									<div className='items-center gap-1 sm:flex'>
										<div className='ml-1 flex items-center gap-[6px] text-sm'>
											<Image
												alt='relay icon'
												width={16}
												height={16}
												src={'/assets/treasury/dot-icon.svg'}
												className='-mt-[2px]'
											/>
											<span className='font-medium'>{formatUSDWithUnits(treasuryData?.assetHub?.dot)}</span>
											{unit}
										</div>

										<Divider
											type='vertical'
											className='border-l-1 mx-0 ml-[2px] mt-[2px] border-[#90A0B7] dark:border-icon-dark-inactive max-sm:hidden'
										/>
										<div className='flex'>
											<div className='ml-1 flex items-center gap-[6px] text-sm'>
												<Image
													alt='relay icon'
													width={16}
													height={16}
													src={'/assets/treasury/usdc-icon.svg'}
													className='-mt-[2px]'
												/>
												<span className='font-medium'>{formatUSDWithUnits(treasuryData?.assetHub?.usdc)}</span>
												USDC
											</div>
											<Divider
												type='vertical'
												className='border-l-1 mx-0 ml-[5px] mt-[4px] border-[#90A0B7] dark:border-icon-dark-inactive'
											/>
											<div className='ml-1 flex items-center gap-[6px] text-sm'>
												<Image
													alt='relay icon'
													width={16}
													height={16}
													src={'/assets/treasury/usdt-icon.svg'}
													className='-mt-[2px]'
												/>
												<span className='font-medium'>{formatUSDWithUnits(treasuryData?.assetHub?.usdt)}</span>
												USDt
											</div>
											<Link
												href={'https://assethub-polkadot.subscan.io/account/14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk'}
												className='-mb-1 hidden cursor-pointer sm:ml-[2px] sm:flex'
												target='_blank'
											>
												<RedirectingIcon />
											</Link>
										</div>
									</div>
								</div>
							</div>
						)}

						{treasuryData?.hydration?.dot && (
							<div className={`${dmSans.className} ${dmSans.variable} items-start gap-[6px] text-blue-light-high dark:text-blue-dark-high sm:flex`}>
								<div className='flex w-[106px] gap-[6px]'>
									<Image
										alt='relay icon'
										width={20}
										height={20}
										src={'/assets/icons/hydration-icon.svg'}
										className='-mt-[0px]'
									/>
									<span className='text-sm font-medium '>Hydration</span>
								</div>
								<div className='ml-6 flex flex-col sm:ml-0'>
									{hydrationValueTotal && <span className='ml-1 text-base font-semibold'>~ ${hydrationValueTotal}</span>}
									<div className='items-center gap-1 sm:flex'>
										<div className='flex'>
											<div className='ml-1 flex items-center gap-[6px] text-sm'>
												<Image
													alt='relay icon'
													width={16}
													height={16}
													src={'/assets/treasury/dot-icon.svg'}
													className='-mt-[2px]'
												/>
												<span className='font-medium'>{formatUSDWithUnits(treasuryData?.hydration?.dot)}</span>
												{unit}
											</div>
											<Divider
												type='vertical'
												className='border-l-1 mx-0 ml-[5px] mt-[4px] border-[#90A0B7] dark:border-icon-dark-inactive'
											/>
											<div className='ml-1 flex items-center gap-[4px] text-sm'>
												<Image
													alt='relay icon'
													width={16}
													height={16}
													src={'/assets/treasury/usdc-icon.svg'}
													className='-mt-[2px]'
												/>
												<span className='font-medium'>{formatUSDWithUnits(treasuryData?.hydration?.usdc)}</span>
												USDC
											</div>
										</div>
										<Divider
											type='vertical'
											className='border-l-1 mx-0 ml-[2px] mt-[2px] border-[#90A0B7] dark:border-icon-dark-inactive max-sm:hidden'
										/>
										<div className='flex gap-[4px] max-sm:flex-wrap'>
											<div className='ml-1 flex items-center gap-[4px] text-sm'>
												<Image
													alt='relay icon'
													width={16}
													height={16}
													src={'/assets/treasury/usdt-icon.svg'}
													className='-mt-[2px]'
												/>
												<span className='font-medium'>{formatUSDWithUnits(treasuryData?.hydration?.usdt)}</span>
												USDt
											</div>

											<div className='flex gap-1 text-xs text-pink_primary'>
												<Link
													href={'https://hydration.subscan.io/account/7LcF8b5GSvajXkSChhoMFcGDxF9Yn9unRDceZj1Q6NYox8HY'}
													className='flex flex-shrink-0  items-center gap-1 font-medium'
													target='_blank'
												>
													Address #1 <RedirectingIcon />
												</Link>
												<Link
													href={'https://hydration.subscan.io/account/7KCp4eenFS4CowF9SpQE5BBCj5MtoBA3K811tNyRmhLfH1aV'}
													className='flex flex-shrink-0  items-center gap-1 font-medium'
													target='_blank'
												>
													Address #2 <RedirectingIcon />
												</Link>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
					<Divider className='my-3 bg-section-light-container p-0 dark:bg-separatorDark' />

					<div>
						<div className={`${dmSans.className} ${dmSans.variable} items-baseline gap-[6px] text-blue-light-high dark:text-blue-dark-high sm:flex`}>
							<div className='flex w-[80px] gap-[6px]'>
								<span className='text-sm font-medium '>Bounties</span>
							</div>
							<div className='flex flex-col'>
								{bountyTotal && <span className='ml-1 text-base font-semibold'>~ ${bountyTotal}</span>}
								<div className='ml-1 flex items-center gap-[6px] text-sm'>
									<Image
										alt='relay icon'
										width={16}
										height={16}
										src={'/assets/treasury/dot-icon.svg'}
										className='-mt-[2px]'
									/>
									{treasuryData?.bounties?.dot && <span className='font-medium'>~ {formatUSDWithUnits(treasuryData?.bounties?.dot, 2)}</span>}
									{unit}
									<Link
										href={'https://polkadot.polkassembly.io/bounty-dashboard'}
										className='flex cursor-pointer items-center gap-1 text-xs font-medium text-pink_primary'
										target='_blank'
									>
										<RedirectingIcon />
									</Link>
								</div>
							</div>
						</div>
						{treasuryData?.ambassador?.usdt && (
							<div className={`${dmSans.className} ${dmSans.variable} mt-2 items-baseline gap-[6px] text-blue-light-high dark:text-blue-dark-high sm:flex`}>
								<div className='flex w-[80px] gap-[6px]'>
									<span className='text-sm font-medium '>Ambassador</span>
								</div>
								<div className='flex flex-col'>
									{treasuryData?.ambassador?.usdt && <span className='ml-1 text-base font-semibold'>~ ${formatUSDWithUnits(treasuryData?.ambassador?.usdt, 2)}</span>}
									<div className='ml-1 flex items-center gap-[6px] text-sm'>
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={'/assets/treasury/dot-icon.svg'}
											className='-mt-[2px]'
										/>
										{treasuryData?.ambassador?.usdt && <span className='font-medium'>~ {formatUSDWithUnits(treasuryData?.ambassador?.usdt, 2)}</span>}
										{unit}
										<Link
											href={'https://assethub-polkadot.subscan.io/account/13wa8ddUNUhXnGeTrjYH8hYXF2jNdCJvgcADJakNvtNdGozX'}
											className='flex cursor-pointer items-center gap-1 text-xs font-medium text-pink_primary'
											target='_blank'
										>
											<RedirectingIcon />
										</Link>
									</div>
								</div>
							</div>
						)}

						<div className={`${dmSans.className} ${dmSans.variable} mt-[6px] items-baseline gap-[6px] text-blue-light-high dark:text-blue-dark-high sm:flex`}>
							<div className='flex w-[80px] gap-[6px]'>
								<span className='text-sm font-medium '>Fellowships</span>
							</div>
							<div className='flex flex-col'>
								{fellowshipValues && <span className='ml-1 text-base font-semibold'>~ ${fellowshipValues}</span>}
								<div className='items-center gap-1 sm:flex'>
									<div className='ml-1 flex items-center gap-[6px] text-sm'>
										<Link
											href={'https://assethub-polkadot.subscan.io/account/16VcQSRcMFy6ZHVjBvosKmo7FKqTb8ZATChDYo8ibutzLnos'}
											className='flex cursor-pointer items-center gap-1 text-xs font-medium text-pink_primary'
											target='_blank'
										>
											Treasury <RedirectingIcon />
										</Link>
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={'/assets/treasury/dot-icon.svg'}
											className='-mt-[2px]'
										/>
										<span className='font-medium'>{formatUSDWithUnits(String(treasuryData?.fellowship?.dot))} </span>
										{unit}
									</div>
									<Divider
										type='vertical'
										className='border-l-1 mx-0 ml-[2px] mt-1 border-[#90A0B7] dark:border-icon-dark-inactive max-sm:hidden'
									/>
									<div className='ml-1 flex items-center gap-[6px] text-sm'>
										<Link
											href={'https://assethub-polkadot.subscan.io/account/13w7NdvSR1Af8xsQTArDtZmVvjE8XhWNdL4yed3iFHrUNCnS'}
											className='flex cursor-pointer items-center gap-1 text-xs font-medium text-pink_primary'
											target='_blank'
										>
											Salary <RedirectingIcon />
										</Link>
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={'/assets/treasury/usdt-icon.svg'}
											className='-mt-[2px]'
										/>
										<span className='font-medium'>{formatUSDWithUnits(String(treasuryData?.fellowship?.usdt))} USDt</span>
									</div>
								</div>
							</div>
						</div>

						<div className={`${dmSans.className} ${dmSans.variable} mt-[6px] items-baseline gap-[6px] text-blue-light-high dark:text-blue-dark-high sm:flex`}>
							<div className='flex w-[80px] gap-[6px]'>
								<span className='text-sm font-medium '>Loans</span>
							</div>
							<div className='flex flex-col'>
								{loansValue && <span className='ml-1 text-base font-semibold'>~ ${loansValue}</span>}
								<div className='items-center gap-1 md:flex'>
									<div className='ml-1 flex items-center gap-[6px] text-sm'>
										<Link
											href={'https://polkadot.polkassembly.io/referenda/432'}
											className='flex cursor-pointer items-center gap-1 text-xs font-medium text-pink_primary'
											target='_blank'
										>
											Bifrost <RedirectingIcon />
										</Link>
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={'/assets/treasury/dot-icon.svg'}
											className='-mt-[2px]'
										/>
										<span className='font-medium'>500.0K</span>
										{unit}
									</div>
									<Divider
										type='vertical'
										className='border-l-1 mx-0 ml-[2px] mt-1 border-[#90A0B7] dark:border-icon-dark-inactive max-md:hidden'
									/>
									<div className='ml-1 flex items-center gap-[6px] text-sm'>
										<Link
											href={'https://polkadot.polkassembly.io/referenda/748'}
											className='flex cursor-pointer items-center gap-1 text-xs font-medium text-pink_primary'
											target='_blank'
										>
											Pendulum <RedirectingIcon />
										</Link>
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={'/assets/treasury/dot-icon.svg'}
											className='-mt-[2px]'
										/>
										<span className='font-medium'>50.0K</span>
										{unit}
									</div>
									<Divider
										type='vertical'
										className='border-l-1 mx-0 ml-[2px] mt-1 border-[#90A0B7] dark:border-icon-dark-inactive max-md:hidden'
									/>

									<div className='ml-1 flex items-center gap-[6px] text-sm'>
										<Link
											href={'https://polkadot.polkassembly.io/referenda/560'}
											className='flex cursor-pointer items-center gap-1 text-xs font-medium text-pink_primary'
											target='_blank'
										>
											Hydration <RedirectingIcon />
										</Link>
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={'/assets/treasury/dot-icon.svg'}
											className='-mt-[2px]'
										/>
										<span className='font-medium'>1M </span>
										{unit}
									</div>
									<Divider
										type='vertical'
										className='border-l-1 mx-0 ml-[2px] mt-1 border-[#90A0B7] dark:border-icon-dark-inactive max-md:hidden'
									/>

									<div className='ml-1 flex items-center gap-[6px] text-sm'>
										<Link
											href={'https://polkadot.polkassembly.io/referenda/1122'}
											className='flex cursor-pointer items-center gap-1 text-xs font-medium text-pink_primary'
											target='_blank'
										>
											Centrifuge <RedirectingIcon />
										</Link>
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={'/assets/treasury/usdc-icon.svg'}
											className='-mt-[2px]'
										/>
										<span className='font-medium'>1.5M USDC</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Spin>
		</Modal>
	);
};

export default styled(TreasuryDetailsModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px !important;
	}
`;
