import { encodeAddress } from '@polkadot/util-crypto';

export default function getSubstrateAddress(address: string): string | null {
	if (address?.startsWith?.('0x') || !address?.length) return address;

	try {
		if (address?.startsWith?.('0x') || !address.length) return address;
		return encodeAddress(address, 42);
	} catch (e) {
		// console.error('getSubstrateAddress error', e);
		return null;
	}
}
