// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
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
}

const WalletButton = ({ disabled, onClick, icon, className, text, name, isOptionalLogin, isAvailable }: Props) => {
	return (
		<Button
			className={`flex ${isOptionalLogin ? 'border_grey_stroke w-full' : 'justify-center border-[#F8E3EE]'} ${
				isAvailable ? 'bg-white' : 'bg-grey_stroke dark:bg-[#3d3d3d]'
			} items-center rounded-[7px] border-[#F8E3EE] dark:border-section-dark-container dark:bg-[#222222] ${name !== 'Polkasafe' ? 'px-5 py-6' : 'px-3 py-5'} ${className}`}
			onClick={onClick}
			disabled={disabled}
		>
			<span className={name !== 'Polkasafe' ? 'mt-1.5' : 'mt-3'}>{icon}</span>
			{text && isOptionalLogin && <p className='wallet-text-container m-0 ml-4 p-0 text-lightBlue dark:text-white'>{text}</p>}
			{isOptionalLogin && !isAvailable && <p className='m-0 ml-auto p-0 text-xs text-grey_primary'>Not Installed</p>}
		</Button>
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
`;
