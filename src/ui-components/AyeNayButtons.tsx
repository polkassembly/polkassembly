// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import { Button } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useTheme } from 'next-themes';
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useUserDetailsSelector } from '~src/redux/selectors';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';

interface Props {
	className?: string;
	disabled?: boolean;
	size?: SizeType;
	onClickAye: () => void;
	onClickNay: () => void;
	customWidth?: string;
}

const AyeNayButton = ({ className, disabled, onClickAye, onClickNay, size, customWidth }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const { id } = useUserDetailsSelector();
	const { t } = useTranslation('common');
	const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);

	const openModal = () => {
		setOpenLoginModal(true);
	};

	return (
		<div>
			<div className={`${className} flex max-w-[256px] items-center justify-between`}>
				<Button
					name='aye'
					htmlType='button'
					className={`mr-7 flex items-center justify-center rounded-md border-aye_green bg-aye_green text-white hover:border-green-600 hover:bg-green-600 dark:border-aye_green_Dark dark:bg-aye_green_Dark ${customWidth} max-[370px]:w-[120px]`}
					disabled={disabled}
					size={size}
					onClick={!id ? openModal : onClickAye}
				>
					<LikeFilled className='mr-1' />
					{t('aye')}
				</Button>
				<Button
					name='nay'
					htmlType='button'
					className={`flex items-center justify-center rounded-md border-nay_red bg-nay_red text-white hover:bg-red_primary hover:text-white dark:border-nay_red_Dark dark:bg-nay_red_Dark ${customWidth} max-[370px]:w-[120px]`}
					disabled={disabled}
					size={size}
					onClick={!id ? openModal : onClickNay}
				>
					<DislikeFilled className='mr-1' />
					{t('nay')}
				</Button>
			</div>
			<ReferendaLoginPrompts
				theme={theme}
				modalOpen={openLoginModal}
				setModalOpen={setOpenLoginModal}
				image='/assets/Gifs/login-discussion.gif'
				title='Join Polkassembly to Comment on this proposal.'
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>
		</div>
	);
};

export default AyeNayButton;
