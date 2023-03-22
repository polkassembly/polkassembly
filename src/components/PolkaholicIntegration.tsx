// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import React, { FC, useEffect, useState } from 'react';
import { useNetworkContext } from '~src/context';

const ArgumentsTableJSONView = dynamic(() => import('./Post/Tabs/PostOnChainInfo/ArgumentsTableJSONView'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

interface IPolkaholicIntegration {
    blockNumber?: number;
}

const PolkaholicIntegration: FC<IPolkaholicIntegration> = (props) => {
	const { blockNumber } = props;
	const { network } = useNetworkContext();
	const [info, setInfo] = useState({});

	useEffect(() => {
		if (network && blockNumber !== undefined) {
			fetch(`https://api.polkaholic.io/block/${network}/${blockNumber}`)
				.then(async (res) => {
					const info = await res.json();
					setInfo(info);
				})
				.catch((err) => {
					console.error(err);
				});
		}
	}, [network, blockNumber]);
	return (
		<div className='mt-5'>
			<h3 className='font-bold text-base'>Chain Info</h3>
			<ArgumentsTableJSONView
				postArguments={info || {}}
				showAccountArguments={true}
			/>
		</div>
	);
};

export default PolkaholicIntegration;