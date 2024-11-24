// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Divider } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
interface TreasuryAssetDisplayProps {
	title: string;
	icon: React.ReactNode;
	value: string;
	unit: string;
	valueUSDT?: string;
	valueUSDC?: string;
	isLoading: boolean;
	supportedAssets: any;
}

const TreasuryAssetDisplay: React.FC<TreasuryAssetDisplayProps> = ({ title, icon, value, unit, valueUSDT, valueUSDC, isLoading, supportedAssets }) => {
	if (isLoading) {
		return (
			<div className='flex min-h-[50px] w-full items-center justify-center'>
				<LoadingOutlined />
			</div>
		);
	}

	return (
		<div className={`flex flex-col xl:items-end`}>
			<div className='flex items-center'>
				<span className='flex items-center gap-1 text-xs font-medium text-blue-light-medium dark:text-blue-dark-medium'>
					{icon}
					{title}
				</span>
				<div className='ml-2 flex gap-1 text-[11px] font-medium text-blue-light-high dark:text-blue-dark-high'>
					<div className='text-xs'>
						{formatUSDWithUnits(value)} <span className='ml-[2px] font-normal'>{unit}</span>
					</div>
					{supportedAssets?.[1] && valueUSDT && (
						<>
							<Divider
								className='mx-[1px] bg-section-light-container p-0 dark:bg-separatorDark'
								type='vertical'
							/>
							<div className='text-xs'>
								{valueUSDT}
								<span className='ml-[3px] font-normal'>USDT</span>
							</div>
						</>
					)}
					{supportedAssets?.[2] && valueUSDC && (
						<>
							<Divider
								className='mx-[1px] bg-section-light-container p-0 dark:bg-separatorDark'
								type='vertical'
							/>
							<div className='text-xs'>
								{valueUSDC}
								<span className='ml-[3px] font-normal'>USDC</span>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default TreasuryAssetDisplay;
