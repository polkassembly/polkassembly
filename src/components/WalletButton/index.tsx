// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import { InjectedWindow } from '@polkadot/extension-inject/types';
import { useEffect, useState } from 'react';

interface Props {
	onClick: React.MouseEventHandler<HTMLAnchorElement> & React.MouseEventHandler<HTMLButtonElement>;
	icon?: JSX.Element;
	name: string;
	disabled?: boolean;
	className?: string;
	text?: string;
	optionalLogin?: boolean;
}

const WalletButton = ({ disabled, onClick, icon, className, text, name, optionalLogin }: Props) => {
	const [availableWallets, setAvailableWallets] = useState<any>({});

	const getWallet = () => {
		const injectedWindow = window as Window & InjectedWindow;
		setAvailableWallets(injectedWindow.injectedWeb3);
	};

	useEffect(() => {
		getWallet();
	}, []);

	return (
		<Button
			className={`flex ${optionalLogin ? `border-grey w-full ${availableWallets ? 'bg-white' : 'bg-grey_light'}` : 'justify-center border-[#F8E3EE]'} items-center rounded-[7px] ${
				name !== 'Polkasafe' ? 'px-5 py-6' : 'px-3 py-5'
			} ${className}`}
			onClick={onClick}
			disabled={disabled}
		>
			<span className={name !== 'Polkasafe' ? 'mt-1.5' : 'mt-3'}>{icon}</span>
			{text && optionalLogin && <p className='wallet-text-container m-0 ml-4 p-0 text-lightBlue'>{text}</p>}
			{optionalLogin && !availableWallets && <p className='m-0 ml-auto p-0 text-xs text-grey_primary'>Not Installed</p>}
		</Button>
	);
};

export default WalletButton;
