// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import React from 'react';

interface Props {
	onClick: (React.MouseEventHandler<HTMLAnchorElement> & React.MouseEventHandler<HTMLButtonElement>)
	icon?: JSX.Element
	name: string
	disabled: boolean;
	className?: string;
	text?:string
}

const WalletButton = ({ disabled, onClick, icon, className, text }: Props) => {
	return (
		<Button className={`flex items-center py-6 px-5 justify-center rounded-[7px] border-[#F8E3EE]   ${className}`} onClick={onClick} disabled={disabled}>
			<span className='mt-1.5'>{icon}</span>
			{text && text}
		</Button>
	);
};

export default WalletButton;