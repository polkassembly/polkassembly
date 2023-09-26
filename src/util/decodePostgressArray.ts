// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/**
 * Returns an array of addresses or null
 *
 * @param pgArray A postgres encode array
 *
 * Examples:
 *
 * decodePostgresArray("{\"5Ev8deqBc5bXB2pq2C9RWCBXM1kuS6wjqbZJiSRTA8kLZfTu\",\"5ChscJFxEt9KWevt5aLV6SMGARFVyH8fz2LZKjGBHV7MgfDq\"}")
 * => [ "5Ev8deqBc5bXB2pq2C9RWCBXM1kuS6wjqbZJiSRTA8kLZfTu", "5ChscJFxEt9KWevt5aLV6SMGARFVyH8fz2LZKjGBHV7MgfDq" ]
 *
 * decodePostgresArray("{\"5Ev8deqBc5bXB2pq2C9RWCBXM1kuS6wjqbZJiSRTA8kLZfTu\"}")
 * => [ "5Ev8deqBc5bXB2pq2C9RWCBXM1kuS6wjqbZJiSRTA8kLZfTu" ]
 *
 * decodePostgresArray("{}")
 * => null
 */

export function decodePostgresArray(pgArray: string): string[] {
	const addressArray = pgArray.replace(/"|{|}/g, '');
	const addresses = addressArray.length > 1 || !!addressArray[0] ? addressArray.split(',') : [];
	return addresses;
}
