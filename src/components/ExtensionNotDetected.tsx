// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import * as React from 'react';
import getExtensionUrl from 'src/util/getExtensionUrl';
import Alert from '~src/basic-components/Alert';
import { Wallet } from '~src/types';
import { useTranslation } from 'next-i18next';

interface Props {
	chosenWallet?: string;
}

const ExtensionNotDetected: React.FC<Props> = ({ chosenWallet }) => {
	const { t } = useTranslation('common');

	return (
		<Alert
			message={
				<div className='flex gap-x-2 dark:text-blue-dark-high'>
					<span className='capitalize'>{chosenWallet === Wallet.SUBWALLET ? chosenWallet.split('-')[0] : chosenWallet || t('wallet')}</span>
					<span>{t('extension_not_detected')}</span>
				</div>
			}
			description={
				getExtensionUrl() ? (
					<div className='max-w-md dark:text-blue-dark-high'>{t('no_web3_account_integration')}</div>
				) : (
					<div className='max-w-md dark:text-blue-dark-high'>{t('install_browser')}</div>
				)
			}
			type='info'
			showIcon
			className='changeColor'
		/>
	);
};

export default ExtensionNotDetected;
