// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export interface IGlobalStore {
	is_sidebar_collapsed: boolean;
	current_astral_info_tab: EAstralInfoTab;
}

export enum EAstralInfoTab {
	ALL_INFO = 'all_info',
	ON_CHAIN_ACTIVITY = 'on_chain_activity',
	OFF_CHAIN_ACTIVITY = 'off_chain_activity'
}
