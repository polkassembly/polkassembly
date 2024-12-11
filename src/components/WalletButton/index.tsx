// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import styled from 'styled-components';
import { InfoCircleOutlined } from '@ant-design/icons';
import Tooltip from '~src/basic-components/Tooltip';
import { useTranslation } from 'next-i18next';

interface Props {
	onClick: React.MouseEventHandler<HTMLAnchorElement> & React.MouseEventHandler<HTMLButtonElement>;
	icon?: JSX.Element;
	name: string;
	disabled?: boolean;
	className?: string;
	text?: string;
	isOptionalLogin?: boolean;
	isAvailable?: boolean;
	isLoginFlow?: boolean;
}

const WalletButton = ({ isLoginFlow, disabled, onClick, icon, className, text, name, isOptionalLogin, isAvailable }: Props) => {
	const { t } = useTranslation('common');

	return (
		<>
			{!isOptionalLogin && isLoginFlow && (
				<Tooltip
					title={`${text === 'Polkasafe (Multisig)' && !isAvailable ? t('please_install_any_wallet_to_access_polkasafe') : `${text} ${isAvailable ? '' : t('not_installed')}`}`}
					placement='top'
				>
					<Button
						className={`flex ${isOptionalLogin ? 'border_grey_stroke w-full' : 'justify-center border-borderColor'} ${
							isAvailable ? 'bg-white dark:bg-disabledGreyColor ' : 'cursor-not-allowed bg-lightWhite dark:bg-inactiveIconDark'
						} border-grey_stroke items-center rounded-[7px] dark:border-section-dark-container ${name !== 'Polkasafe' ? 'px-5 py-6' : 'px-3 py-5'} ${className}`}
						onClick={(e) => {
							if (!isAvailable) return;
							onClick(e as any);
						}}
						disabled={disabled}
					>
						<span className={name !== 'Polkasafe' ? 'mt-1.5' : 'mt-3'}>{icon}</span>
					</Button>
				</Tooltip>
			)}
			{isOptionalLogin && isLoginFlow && (
				<Button
					className={`flex ${isOptionalLogin ? 'border_grey_stroke w-full' : 'justify-center border-borderColor'} ${
						isAvailable ? 'text- bg-white dark:bg-disabledGreyColor' : 'bg-lightWhite dark:bg-inactiveIconDark'
					} border-grey_stroke items-center rounded-[7px] dark:border-section-dark-container ${name !== 'Polkasafe' ? 'px-5 py-6' : 'px-3 py-5'} ${className}`}
					onClick={onClick}
					disabled={!isAvailable}
				>
					<span className={name !== 'Polkasafe' ? 'mt-1.5' : 'mt-3'}>{icon}</span>
					{text && isOptionalLogin && <p className={`wallet-text-container m-0 ml-4 p-0 ${!isAvailable ? 'text-disableText' : 'text-lightBlue'} dark:text-white`}>{text}</p>}
					{isOptionalLogin && !isAvailable && text !== 'Polkasafe (Multisig)' && (
						<p className='not-installed-container text-disableText m-0 ml-auto p-0 text-xs dark:text-lightGreyTextColor'>{t('not_installed')}</p>
					)}
					{isOptionalLogin && !isAvailable && text === 'Polkasafe (Multisig)' && (
						<Tooltip
							title={t('please_install_any_wallet_to_access_polkasafe')}
							placement='top'
						>
							<InfoCircleOutlined className='not-installed-container text-disableText m-0 ml-auto p-0 text-xs dark:text-lightGreyTextColor' />
						</Tooltip>
					)}
				</Button>
			)}
			{!isLoginFlow && (
				<Button
					className={`flex items-center justify-center rounded-[7px] border-borderColor dark:border-section-dark-container dark:bg-inactiveIconDark ${
						name !== 'Polkasafe' ? 'px-5 py-6' : 'px-3 py-5'
					} ${className}`}
					onClick={onClick}
					disabled={disabled}
				>
					<span className={name !== 'Polkasafe' ? 'mt-1.5' : 'mt-3'}>{icon}</span>
				</Button>
			)}
		</>
	);
};

export default styled(WalletButton)`
	@media (max-width: 428px) and (min-width: 319px) {
		.wallet-text-container {
			width: 100px !important;
			text-overflow: ellipsis;
			overflow-x: hidden;
		}
	}
	@media (max-width: 544px) and (min-width: 319px) {
		.not-installed-container {
			display: none;
		}
	}
`;
