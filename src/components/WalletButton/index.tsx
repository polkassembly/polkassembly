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
					// color='#E5007A'
					title={`${text} wallet ${isAvailable ? '' : 'not'} installed`}
					placement='top'
				>
					<Button
						className={`flex ${isOptionalLogin ? 'border_grey_stroke w-full' : 'justify-center border-[#F8E3EE]'} ${
							isAvailable ? 'bg-white' : 'bg-grey_stroke bg-[#F6F7F9] dark:bg-[#3d3d3d]'
						} items-center rounded-[7px] border-[#F8E3EE] dark:border-section-dark-container dark:bg-[#222222] ${name !== 'Polkasafe' ? 'px-5 py-6' : 'px-3 py-5'} ${className}`}
						onClick={onClick}
						disabled={disabled}
					>
						<span className={name !== 'Polkasafe' ? 'mt-1.5' : 'mt-3'}>{icon}</span>
					</Button>
				</Tooltip>
			)}
			{isOptionalLogin && isloginFlow && (
				<Button
					className={`flex ${isOptionalLogin ? 'border_grey_stroke w-full' : 'justify-center border-[#F8E3EE]'} ${
						isAvailable ? 'text- bg-white' : 'bg-[#F6F7F9] dark:bg-[#3d3d3d]'
					} items-center rounded-[7px] border-[#F8E3EE] dark:border-section-dark-container dark:bg-[#222222] ${name !== 'Polkasafe' ? 'px-5 py-6' : 'px-3 py-5'} ${className}`}
					onClick={onClick}
					disabled={!isAvailable}
				>
					<span className={name !== 'Polkasafe' ? 'mt-1.5' : 'mt-3'}>{icon}</span>
					{text && isOptionalLogin && <p className={`wallet-text-container m-0 ml-4 p-0 ${!isAvailable ? 'text-disableText' : 'text-lightBlue'} dark:text-white`}>{text}</p>}
					{isOptionalLogin && !isAvailable && <p className='not-installed-container text-disableText m-0 ml-auto p-0 text-xs dark:text-[#909090]'>Not Installed</p>}
				</Button>
			)}
			{!isloginFlow && (
				<Button
					className={`flex items-center justify-center rounded-[7px] border-[#F8E3EE] dark:border-section-dark-container dark:bg-[#222222] ${
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
