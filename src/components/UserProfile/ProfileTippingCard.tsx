// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import Image from 'next/image';
import { ClockCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { ProfileDetailsResponse } from '~src/auth/types';
import { TIPS } from '../Tipping';
import { Divider, Segmented, Spin, Tooltip, message } from 'antd';
import Address from '~src/ui-components/Address';
import { useCurrentTokenDataSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { chainProperties } from '~src/global/networkConstants';
import { useApiContext } from '~src/context';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ITip } from 'pages/api/v1/tipping';
import { inputToBn } from '~src/util/inputToBn';
import BN from 'bn.js';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import styled from 'styled-components';
import { setReceiver } from '~src/redux/tipping';
import { useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';
import { TippingUnavailableNetworks } from '~src/ui-components/QuickView';
import copyToClipboard from '~src/util/copyToClipboard';
import { CopyIcon } from '~src/ui-components/CustomIcons';
import { useTheme } from 'next-themes';
import ImageIcon from '~src/ui-components/ImageIcon';

const Tipping = dynamic(() => import('~src/components/Tipping'), {
	ssr: false
});

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity: string;
	userProfile: ProfileDetailsResponse;
	selectedAddresses: string[];
}
export enum ETipType {
	GIVEN = 'Given',
	RECEIVED = 'Received'
}
const ZERO_BN = new BN(0);
const ProfileTippingCard = ({ className, selectedAddresses, userProfile, addressWithIdentity }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const { id: loginId, username } = useUserDetailsSelector();
	const { api, apiReady } = useApiContext();
	const { currentTokenPrice } = useCurrentTokenDataSelector();
	const dispatch = useDispatch();
	const [tipType, setTipType] = useState<ETipType>(ETipType.GIVEN);
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [loading, setLoading] = useState<boolean>(false);
	const [tipAmount, setTipAmount] = useState<string | null>(null);
	const [tipBn, setTipBn] = useState<BN>(ZERO_BN);
	const [tipsData, setTipsData] = useState<ITip[]>([]);
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;
	const [openTipModal, setOpenTipModal] = useState<boolean>(false);
	const [openAddressChangeModal, setOpenAddressChangeModal] = useState<boolean>(false);
	const [messageApi, contextHolder] = message.useMessage();

	const [dollarToTokenBalance, setDollarToTokenBalance] = useState<{ threeDollar: string; fiveDollar: string; tenDollar: string; fifteenDollar: string }>({
		fifteenDollar: '0',
		fiveDollar: '0',
		tenDollar: '0',
		threeDollar: '0'
	});

	const handleCopyAddress = () => {
		messageApi.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};
	const handleTipChangeToDollar = (value: number) => {
		const tip = value / Number(currentTokenPrice || 1);
		return String(tip.toFixed(2));
	};

	const getData = async () => {
		if (!api || !apiReady || !selectedAddresses.length) {
			setTipsData([]);
			return;
		}
		setTipsData([]);
		setLoading(true);
		const { data, error } = await nextApiClientFetch<ITip[]>('api/v1/tipping/get-user-tips', {
			addresses: selectedAddresses || [],
			amount: Number(tipAmount || 0) || 0,
			tipStatus: tipType
		});
		if (data) {
			setTipsData(data);
			setLoading(false);
		} else {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		setDollarToTokenBalance({
			fifteenDollar: handleTipChangeToDollar(15),
			fiveDollar: handleTipChangeToDollar(5),
			tenDollar: handleTipChangeToDollar(10),
			threeDollar: handleTipChangeToDollar(3)
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, currentTokenPrice]);

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedAddresses, tipAmount, tipType, userProfile, network, api, apiReady]);

	return (
		<Spin spinning={loading}>
			<div
				className={classNames(
					className,
					theme,
					'flex flex-col gap-5 rounded-[14px] border-[1px] border-solid border-section-light-container bg-white px-4 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-lg:overflow-x-auto max-md:flex-col'
				)}
			>
				<div className='flex justify-between'>
					<span className='flex items-center gap-1 text-xl font-semibold dark:text-blue-dark-high'>
						<Image
							src='/assets/profile/profile-tips.svg'
							alt=''
							width={24}
							height={24}
						/>
						Tipping
					</span>

					<div className={classNames(theme, 'flex items-center gap-2')}>
						{userProfile?.user_id !== loginId && !!username?.length && (
							<CustomButton
								className='delegation-buttons border-none shadow-none'
								variant='default'
								buttonsize='xs'
								onClick={() => {
									setOpenTipModal(true);
									dispatch(setReceiver(addressWithIdentity || ''));
								}}
							>
								<Image
									src='/assets/profile/white-dollar.svg'
									className='pink-color mr-1 rounded-full'
									height={20}
									width={20}
									alt='edit logo'
								/>
								<span className=''>Tip User</span>
							</CustomButton>
						)}
						<Segmented
							options={['Given', 'Received']}
							className={'dark:bg-section-dark-background'}
							onChange={(e) => setTipType(e as ETipType)}
							value={tipType}
						/>
					</div>
				</div>
				<div className='flex items-center justify-between text-sm font-medium text-bodyBlue dark:text-blue-dark-medium max-md:gap-2'>
					{TIPS.map((tip) => {
						const [tipBalance] = inputToBn(String(Number(dollarToTokenBalance[tip.key]).toFixed(2)), network, false);
						return (
							<span
								className={`flex h-9 cursor-pointer items-center justify-center gap-1 rounded-[28px] border-[1px] border-solid max-md:px-5 md:px-8 ${
									tipBalance.eq(tipBn) ? 'border-pink_primary bg-[#FAE7EF] dark:bg-pink-dark-primary' : 'border-section-light-container dark:border-[#3B444F]'
								}
              `}
								key={tip.key}
								onClick={() => {
									setTipAmount(String(Number(dollarToTokenBalance[tip.key]).toFixed(2)));
									setTipBn(tipBalance);
								}}
							>
								<Image
									src={tip?.src}
									alt=''
									width={26}
									height={26}
								/>
								<span>${tip.value}</span>
							</span>
						);
					})}
					<span
						className={`flex h-[36px] cursor-pointer items-center justify-center gap-1 rounded-[28px] border-[1px] border-solid px-3 ${
							tipAmount === null ? 'border-pink_primary bg-[#FAE7EF] dark:bg-pink-dark-primary' : 'border-section-light-container dark:border-[#3B444F]'
						}`}
						key={'custom'}
						onClick={() => {
							setTipAmount(null);
							setTipBn(ZERO_BN);
						}}
					>
						<Image
							src={theme === 'dark' ? '/assets/profile/white-dollar.svg' : '/assets/profile/dollar.svg'}
							alt=''
							width={20}
							height={20}
						/>
						Custom
					</span>
				</div>
				{/* Tipping info */}
				<div className='flex flex-col gap-2'>
					{!!tipsData.length && !loading ? (
						tipsData.map((tip, index) => (
							<div
								className={`flex w-full gap-2 border-0 border-b-[1px] border-solid border-section-light-container py-2 font-normal dark:border-separatorDark ${
									tipsData.length - 1 === index && 'border-none'
								} ${isMobile ? 'flex-col items-start justify-start' : 'items-center'}`}
								key={index}
							>
								<div className={`w-[30%] ${isMobile && 'flex w-[100%] items-start justify-start gap-2'}`}>
									<Address
										address={tipType === ETipType.GIVEN ? tip?.tip_to : tip?.tip_from}
										displayInline
										isTruncateUsername
										usernameMaxLength={16}
									/>
									{isMobile && (
										<div className='flex h-full flex-shrink-0 items-center gap-2'>
											<Divider
												type='vertical'
												className=' bg-section-light-container dark:bg-separatorDark'
											/>
											<div className='flex gap-1'>
												<ClockCircleOutlined />
												{getRelativeCreatedAt(tip?.created_at)}
											</div>
										</div>
									)}
								</div>

								<Tooltip
									title={
										<div
											className='flex items-center gap-1'
											onClick={() => {
												if (!tip?.remark.length) return;
												copyToClipboard(tip?.remark);
												handleCopyAddress();
											}}
										>
											{contextHolder}
											Copy
											<CopyIcon className='cursor-pointer text-xl text-lightBlue dark:text-icon-dark-inactive' />
										</div>
									}
								>
									<div className={`w-[30%] ${isMobile && 'w-full'} ${tip?.remark.length && 'cursor-copy'}`}>
										{contextHolder}
										{tip?.remark || '-'}
									</div>
								</Tooltip>

								{tipAmount === null && (
									<div className={`w-[20%] ${isMobile && 'w-full'}`}>
										{tip?.amount} {unit}
									</div>
								)}
								{!isMobile && (
									<div className='flex gap-1'>
										<ClockCircleOutlined />
										{getRelativeCreatedAt(tip?.created_at)}
									</div>
								)}
							</div>
						))
					) : (
						<div className='my-[60px] flex flex-col items-center gap-6'>
							<ImageIcon
								src={theme == 'light' ? '/assets/EmptyStateLight.svg' : '/assets/EmptyStateDark.svg '}
								alt='Empty Icon'
								imgClassName='w-[225px] h-[225px]'
							/>
							<h3 className='text-blue-light-high dark:text-blue-dark-high'>No tip found</h3>
						</div>
					)}
				</div>
			</div>
			{!TippingUnavailableNetworks.includes(network) && (
				<Tipping
					open={openTipModal}
					setOpen={setOpenTipModal}
					paUsername={userProfile.username}
					setOpenAddressChangeModal={setOpenAddressChangeModal}
					openAddressChangeModal={openAddressChangeModal}
					username={userProfile.username || ''}
				/>
			)}
		</Spin>
	);
};

export default styled(ProfileTippingCard)`
	.pink-color {
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	}
`;
