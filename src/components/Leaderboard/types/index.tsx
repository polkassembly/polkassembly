// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export interface IRankCardProps {
	place: number;
	data: any;
	theme: string | undefined;
	type: string;
	className?: string;
}

export interface IleaderboardData {
	className: string;
	searchedUsername?: string;
}

export interface ILeaderboardTable {
	theme?: string;
	className?: string;
}
