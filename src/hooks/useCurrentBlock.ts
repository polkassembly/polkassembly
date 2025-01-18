// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import BN from 'bn.js';
import { useContext, useEffect, useState } from 'react';
import { ApiContext } from 'src/context/ApiContext';

export default function useCurrentBlock() {
	const [currentBlock, setCurrentBlock] = useState<BN | undefined>(undefined);
	const { api, apiReady } = useContext(ApiContext);

	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}

		let unsubscribe: (() => void) | undefined;

		(async () => {
			try {
				await api?.isReady;

				if (!api?.derive || !api?.derive?.chain) {
					return;
				}

				unsubscribe = await api?.derive?.chain?.bestNumber((number) => {
					setCurrentBlock(number);
				});
			} catch (error) {
				console.error('Error initializing current block:', error);
			}
		})();

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, [api, apiReady]);

	return currentBlock;
}
