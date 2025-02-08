// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export enum ParamType {
	BALANCE = 'Balance',
	BOOL = 'bool',
	BYTES = 'Bytes',
	STRING = 'String',
	VEC = 'Vec',
	OPTION = 'Option',
	TUPLE = 'Tuple',
	FIXED_VEC = 'VecFixed',
	ACCOUNT_ID = 'AccountId',
	ACCOUNT_ID_20 = 'AccountId20',
	ACCOUNT_ID_32 = 'AccountId32',
	ACCOUNT_INDEX = 'AccountIndex',
	ADDRESS = 'Address',
	I8 = 'i8',
	I16 = 'i16',
	I32 = 'i32',
	I64 = 'i64',
	I128 = 'i128',
	U8 = 'u8',
	U16 = 'u16',
	U32 = 'u32',
	U64 = 'u64',
	U128 = 'u128',
	U256 = 'u256',
	HASH = 'Hash',
	H160 = 'H160',
	H256 = 'H256',
	H512 = 'H512',
	CALL = 'Call',
	PROPOSAL = 'Proposal',
	RUNTIME_CALL = 'RuntimeCall',
	OPAQUE_CALL = 'OpaqueCall',
	VOTE = 'Vote',
	VOTE_THRESHOLD = 'VoteThreshold',
	KEY_VALUE = 'KeyValue',
	MOMENT = 'Moment',
	NULL = 'Null',
	RAW = 'Raw',
	ENUM = 'Enum',
	STRUCT = 'Struct',
	XCM_VERSIONED_ASSETS = 'XcmVersionedAssets',
	XCM_VERSION = 'XcmVersion',
	XCM_V2 = 'V2',
	XCM_V3 = 'V3',
	VERSIONED_ASSETS = 'VersionedAssets'
}

export interface IParseResult {
	type: ParamType | 'tuple';
	components?: string[];
	innerType?: string;
}

export const parseParamType = (type: string): IParseResult => {
	// Handle XCM types first
	if (type.includes('XcmVersionedAssets') || type.includes('VersionedAssets')) {
		return { type: ParamType.XCM_VERSIONED_ASSETS };
	}

	if (type.includes('XcmVersion')) {
		return { type: ParamType.XCM_VERSION };
	}

	// Handle special cases first
	if (type.includes('AccountId') || type.includes('Address') || type.includes('MultiAddress')) {
		return { type: ParamType.ACCOUNT_ID };
	}

	if (type.includes('Balance') || type.includes('Amount')) {
		return { type: ParamType.BALANCE };
	}

	if (type.includes('Call') || type.includes('Proposal') || type.includes('RuntimeCall')) {
		return { type: ParamType.CALL };
	}

	// Handle Vec types
	if (type.startsWith('Vec<')) {
		const innerType = type.slice(4, -1);
		if (innerType === 'KeyValue') {
			return { type: ParamType.KEY_VALUE };
		}
		return {
			innerType,
			type: ParamType.VEC
		};
	}

	// Handle Option types
	if (type.startsWith('Option<')) {
		const innerType = type.slice(7, -1);
		return {
			innerType,
			type: ParamType.OPTION
		};
	}

	// Handle tuple types
	if (type.startsWith('(') && type.endsWith(')')) {
		return {
			components: type
				.slice(1, -1)
				.split(',')
				.map((t) => t.trim()),
			type: 'tuple'
		};
	}

	// Handle fixed-length vectors
	if (type.startsWith('[') && type.endsWith(']')) {
		const innerType = type.slice(1, -1).split(';')[0];
		return {
			innerType,
			type: ParamType.FIXED_VEC
		};
	}

	// Handle number types
	const numberMatch = type.match(/^[iu]\d+$/);
	if (numberMatch) {
		return { type: type as ParamType };
	}

	// Handle hash types
	if (type.startsWith('H') && type.length > 1) {
		const size = type.slice(1);
		switch (size) {
			case '160':
				return { type: ParamType.H160 };
			case '256':
				return { type: ParamType.H256 };
			case '512':
				return { type: ParamType.H512 };
		}
	}

	return { type: ParamType.STRING };
};
