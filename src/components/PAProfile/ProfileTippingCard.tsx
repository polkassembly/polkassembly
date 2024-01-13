// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { ProfileDetailsResponse } from '~src/auth/types';
import { TIPS } from '../Tipping';
import { Segmented } from 'antd';
import Address from '~src/ui-components/Address';
// import { formatedBalance } from '~src/util/formatedBalance';
import { useNetworkSelector } from '~src/redux/selectors';
import { chainProperties } from '~src/global/networkConstants';
import { formatBalance } from '@polkadot/util';
import dayjs from 'dayjs';
import { useApiContext } from '~src/context';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ITip } from 'pages/api/v1/tipping';

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
	selectedAddresses: string[];
}
export enum ETipType {
	GIVEN = 'Given',
	RECEIVED = 'Received'
}
const ProfileTippingCard = ({ className, theme, addressWithIdentity, selectedAddresses }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const [tipType, setTipType] = useState<ETipType>(ETipType.GIVEN);
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [loading, setLoading] = useState<boolean>(false);

	const getData = async () => {
		if (!api || !apiReady) return;
		setLoading(true);
		const { data, error } = await nextApiClientFetch<ITip[]>('api/v1/tipping/get-user-tips', {
			addresses: selectedAddresses || [],
			tipStatus: tipType
		});
		if (data) {
			console.log(data);
			setLoading(false);
		} else {
			console.log(error);
		}
	};
	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: unit
		});
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, api, apiReady, selectedAddresses]);

	return (
		<div
			className={classNames(
				className,
				theme,
				'flex flex-col gap-5 rounded-[14px] border-[1px] border-solid border-[#D2D8E0] bg-white px-4 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col max-md:overflow-x-auto'
			)}
		>
			<div className='flex justify-between'>
				<span className='flex items-center gap-1.5 text-xl font-semibold dark:text-blue-dark-medium'>
					<Image
						src='/assets/profile/profile-tips.svg'
						alt=''
						width={24}
						height={24}
					/>
					Tipping
				</span>
				<span className={theme}>
					<Segmented
						options={['Given', 'Received']}
						className={'dark:bg-section-dark-background'}
						onChange={(e) => setTipType(e as ETipType)}
						value={tipType}
					/>
				</span>
			</div>
			<div className='flex items-center justify-between text-sm font-medium text-bodyBlue dark:text-blue-dark-medium  max-md:gap-2'>
				{TIPS.map((tip) => {
					return (
						<span
							className={`flex h-[36px] cursor-pointer items-center justify-center gap-1 rounded-[28px] border-[1px] border-solid px-4
              `}
							key={tip.key}
							onClick={() => {
								// form.setFieldValue('balance', '');
								// setTipAmount(tipBlance);
								// setTipInput(String(Number(dollarToTokenBalance[tip.key]).toFixed(2)));
								// form.setFieldValue('balance', Number(dollarToTokenBalance[tip.key]).toFixed(2));
							}}
						>
							<Image
								src={tip?.src}
								alt=''
								width={20}
								height={20}
							/>
							<span>${tip.value}</span>
						</span>
					);
				})}
				<span
					className={'flex h-[36px] cursor-pointer items-center justify-center gap-1 rounded-[28px] border-[1px] border-solid px-3'}
					key={'custom'}
					onClick={() => {
						// form.setFieldValue('balance', '');
						// setTipAmount(tipBlance);
						// setTipInput(String(Number(dollarToTokenBalance[tip.key]).toFixed(2)));
						// form.setFieldValue('balance', Number(dollarToTokenBalance[tip.key]).toFixed(2));
					}}
				>
					<Image
						src={'/assets/profile/dollar.svg'}
						alt=''
						width={20}
						height={20}
					/>
					Custom
				</span>
			</div>
			{/* Tipping info */}
			<div
				className='flex w-full items-center justify-between font-normal'
				key={addressWithIdentity}
			>
				{addressWithIdentity && (
					<Address
						address={addressWithIdentity}
						displayInline
						disableTooltip
						isTruncateUsername={false}
					/>
				)}
				<div className='flex '>hellofdfdfsdfd this is for you</div>
				{/* <div>
						{formatedBalance('100', unit, 2)} {unit}
					</div> */}
				<div>{dayjs(new Date()).format('DD MMM YY')}</div>
			</div>
		</div>
	);
};

export default ProfileTippingCard;
