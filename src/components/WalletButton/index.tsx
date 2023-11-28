// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Tooltip } from 'antd';
import styled from 'styled-components';

interface Props {
	onClick: React.MouseEventHandler<HTMLAnchorElement> & React.MouseEventHandler<HTMLButtonElement>;
	icon?: JSX.Element;
	name: string;
	disabled?: boolean;
	className?: string;
	text?: string;
	isOptionalLogin?: boolean;
	isAvailable?: boolean;
	isloginFlow?: boolean;
}

const WalletButton = ({ isloginFlow, disabled, onClick, icon, className, text, name, isOptionalLogin, isAvailable }: Props) => {
	return (
		<>
			{!isOptionalLogin && isloginFlow && (
				<Tooltip
					title={`${text} wallet ${isAvailable ? '' : 'not'} installed`}
					placement='top'
				>
					<Button
						className={`flex ${isOptionalLogin ? 'border_grey_stroke w-full' : 'border-borderColor justify-center'} ${
							isAvailable ? 'bg-white dark:bg-inactiveIconDark' : 'dark:bg-greyColor bg-lightWhite cursor-not-allowed'
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
			{isOptionalLogin && isloginFlow && (
				<Button
					className={`flex ${isOptionalLogin ? 'border_grey_stroke w-full' : 'border-borderColor justify-center'} ${
						isAvailable ? 'text- bg-white dark:bg-inactiveIconDark' : 'dark:bg-greyColor bg-lightWhite'
					} border-grey_stroke items-center rounded-[7px] dark:border-section-dark-container ${name !== 'Polkasafe' ? 'px-5 py-6' : 'px-3 py-5'} ${className}`}
					onClick={onClick}
					disabled={!isAvailable}
				>
					<span className={name !== 'Polkasafe' ? 'mt-1.5' : 'mt-3'}>{icon}</span>
					{text && isOptionalLogin && <p className={`wallet-text-container m-0 ml-4 p-0 ${!isAvailable ? 'text-disableText' : 'text-lightBlue'} dark:text-white`}>{text}</p>}
					{isOptionalLogin && !isAvailable && <p className='not-installed-container text-disableText dark:text-lightGreyTextColor m-0 ml-auto p-0 text-xs'>Not Installed</p>}
				</Button>
			)}
			{!isloginFlow && (
				<Button
					className={`border-borderColor flex items-center justify-center rounded-[7px] dark:border-section-dark-container dark:bg-inactiveIconDark ${
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
