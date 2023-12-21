// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, PropsWithChildren } from 'react';
import { Card as ANTDCards } from 'antd';

interface ICard {
	className?: string;
}
const Card: FC<PropsWithChildren<ICard>> = (props) => {
	const { className } = props;
	return (
		<ANTDCards
			{...props}
			className={`${className}`}
		/>
	);
};

export default Card;
