// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Parachain from './Parachain';
import Proposals from './Proposals';
import SubscribedPosts from './SubscribedPosts';
import OverallPost from './OverallPost';

export default function Notifications() {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
			<Parachain/>
			<Proposals/>
			<SubscribedPosts/>
			<OverallPost/>
		</div>
	);
}
