// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { atom, useAtom } from 'jotai';
import { IMultisig } from '../type';
import { IProxy } from '../type';

interface IMultisigAndProxy {
	[key: string]: {
		multisig: Array<IMultisig>;
		proxy: Array<IProxy>;
		proxiedBy: Array<IProxy>;
	};
}

const multisigAndProxyAtom = atom<IMultisigAndProxy | null>(null);

export const useMultisigAtom = () => {
	const [multisigAndProxy, setMultisigAndProxy] = useAtom(multisigAndProxyAtom);
	return { multisigAndProxy, setMultisigAndProxy };
};
