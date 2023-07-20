// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Jazzicon from '@metamask/jazzicon';
import { useEffect, useRef } from 'react';

const EthIdenticon = ({
	address,
	size,
	className,
}: {
	address: string;
	size: number;
	className?: string;
}) => {
	const ref = useRef<HTMLDivElement>();
	const numericAddress = parseInt(address.slice(2, 10), 16);

	useEffect(() => {
		if (numericAddress && ref.current) {
			ref.current.innerHTML = '';
			ref.current.appendChild(
				Jazzicon(size > 18 ? size - 8 : size, numericAddress),
			);
		}
	}, [numericAddress, size]);

	return (
		<div
			onClick={() => navigator.clipboard.writeText(address)}
			className={`cursor-copy ${className}`}
			ref={ref as any}
		/>
	);
};

export default EthIdenticon;
