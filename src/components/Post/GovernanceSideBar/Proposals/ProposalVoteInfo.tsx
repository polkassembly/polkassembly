// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import BN from 'bn.js';
import React from 'react';
import { chainProperties } from 'src/global/networkConstants';
import { LoadingStatusType } from 'src/types';
import { useNetworkSelector } from '~src/redux/selectors';

import formatBnBalance from '~src/util/formatBnBalance';

interface Props {
	className?: string;
	deposit: string;
	loadingStatus: LoadingStatusType;
	seconds: number;
}

const ProposalVoteInfo = ({ className, deposit, loadingStatus, seconds }: Props) => {
	const { network } = useNetworkSelector();

	return (
		<Spin
			spinning={loadingStatus.isLoading}
			indicator={<LoadingOutlined />}
		>
			<div className={className}>
				<div className='font-medium text-sidebarBlue dark:text-white'>
					<div className='mb-5 flex justify-between'>
						<h4>Deposit</h4>
						<div className='text-navBlue dark:text-icon-dark-inactive'>
							{formatBnBalance(
								deposit,
								{
									numberAfterComma: 2,
									withUnit: true
								},
								network
							)}
						</div>
					</div>

					<div className='mb-5 flex justify-between'>
						<h4>Endorsed by</h4>
						<div className='text-navBlue dark:text-icon-dark-inactive'>{seconds || seconds === 0 ? <div>{seconds} addresses</div> : null}</div>
					</div>

					<div className='mb-5 flex justify-between'>
						<h4>Locked {chainProperties[network]?.tokenSymbol}</h4>
						<div className='text-navBlue dark:text-icon-dark-inactive'>
							{formatBnBalance(
								new BN(deposit).mul(new BN(seconds)),
								{
									numberAfterComma: 2,
									withUnit: true
								},
								network
							)}
						</div>
					</div>
				</div>
			</div>
		</Spin>
	);
};

export default ProposalVoteInfo;
