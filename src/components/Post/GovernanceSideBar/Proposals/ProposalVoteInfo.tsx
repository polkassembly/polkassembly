// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import BN from 'bn.js';
import React, { useContext } from 'react';
import { chainProperties } from 'src/global/networkConstants';
import { LoadingStatusType } from 'src/types';

import { NetworkContext } from '~src/context/NetworkContext';
import formatBnBalance from '~src/util/formatBnBalance';

interface Props {
	className?: string;
	deposit: string;
	loadingStatus: LoadingStatusType;
	seconds: number;
}

const ProposalVoteInfo = ({
	className,
	deposit,
	loadingStatus,
	seconds,
}: Props) => {
	const { network } = useContext(NetworkContext);

	return (
		<Spin
			spinning={loadingStatus.isLoading}
			indicator={<LoadingOutlined />}
		>
			<div className={className}>
				<div className="font-medium text-sidebarBlue">
					<div className="flex justify-between mb-5">
						<h4>Deposit</h4>
						<div className="text-navBlue">
							{formatBnBalance(
								deposit,
								{
									numberAfterComma: 2,
									withUnit: true,
								},
								network,
							)}
						</div>
					</div>

					<div className="flex justify-between mb-5">
						<h4>Endorsed by</h4>
						<div className="text-navBlue">
							{seconds || seconds === 0 ? (
								<div>{seconds} addresses</div>
							) : null}
						</div>
					</div>

					<div className="flex justify-between mb-5">
						<h4>Locked {chainProperties[network]?.tokenSymbol}</h4>
						<div className="text-navBlue">
							{formatBnBalance(
								new BN(deposit).mul(new BN(seconds)),
								{
									numberAfterComma: 2,
									withUnit: true,
								},
								network,
							)}
						</div>
					</div>
				</div>
			</div>
		</Spin>
	);
};

export default ProposalVoteInfo;
