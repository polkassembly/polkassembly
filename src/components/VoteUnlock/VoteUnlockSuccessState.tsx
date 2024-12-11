// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { Modal } from 'antd';
import { dmSans } from 'pages/_app';
// import UnlockSuccessIcon from '~assets/icons/unlock-success-box.svg';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import { useEffect } from 'react';
import { formatBalance } from '@polkadot/util';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import ImageIcon from '~src/ui-components/ImageIcon';
import { useTranslation } from 'next-i18next';

interface Props {
	className?: string;
	open: boolean;
	setOpen: (pre: boolean) => void;
	unlockedBalance: BN;
	lockedBalance: BN;
}

const VoteUnlockSuccessState = ({ className, open, setOpen, unlockedBalance }: Props) => {
	const { t } = useTranslation('common');
	const { network } = useNetworkSelector();
	const unit = chainProperties[network]?.tokenSymbol;

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network]?.tokenDecimals,
			unit
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return (
		<Modal
			open={open}
			onCancel={() => setOpen(false)}
			footer={false}
			className={`${className} ${dmSans.className} ${dmSans.variable} dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			centered
		>
			<div className='mb-6'>
				<div className='-mt-[150px] flex items-center justify-center'>
					<ImageIcon
						src='/assets/icons/unlock-success-box.svg'
						alt={t('unlock_success_box_icon')}
					/>
				</div>
				<div className='my-4 flex items-center justify-center text-xl font-semibold tracking-[0.15%] dark:text-white'>{t('tokens_unlocked_successfully')}</div>
				<div className='mb-6 flex items-center justify-center text-2xl font-semibold tracking-[0.15%] text-pink_primary dark:text-blue-dark-helper'>
					{formatedBalance((unlockedBalance.toString() || '0').toString(), unit, 2)} {unit}
				</div>
			</div>
		</Modal>
	);
};

export default VoteUnlockSuccessState;
