// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Alert } from 'antd';
import * as React from 'react';
import getExtensionUrl from 'src/util/getExtensionUrl';
import { Wallet } from '~src/types';

interface Props {
	chosenWallet?: string;
}

const ExtensionNotDetected: React.FC<Props> = ({ chosenWallet }) => {
	return (
		<Alert
			message={
				<div className='flex gap-x-2 dark:text-blue-dark-high'>
					<span className='capitalize'>{chosenWallet === Wallet.SUBWALLET ? chosenWallet.split('-')[0] : chosenWallet || 'Wallet'}</span>
					<span>extension not detected.</span>
				</div>
			}
			description={
				getExtensionUrl() ? (
					<div className='max-w-md dark:text-blue-dark-high'>
						No web 3 account integration could be found. To be able to vote on-chain, visit this page on a computer with polkadot-js extension.
					</div>
				) : (
					<div className='max-w-md dark:text-blue-dark-high'>
						Please install <a href='https://www.mozilla.org/en-US/firefox/'>Firefox</a> or <a href='https://www.google.com/chrome/'>Chrome</a> browser to use this feature.
					</div>
				)
			}
			type='info'
			showIcon
			className='changeColor dark:border-infoAlertBorderDark dark:bg-infoAlertBgDark'
		/>
	);
};
export default ExtensionNotDetected;
