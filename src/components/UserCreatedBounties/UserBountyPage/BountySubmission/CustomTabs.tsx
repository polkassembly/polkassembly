// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import React, { useState } from 'react';
import { ETabBountyStatuses } from '~src/types';

const CustomTabs = () => {
	const [activeTab, setActiveTab] = useState<ETabBountyStatuses>(ETabBountyStatuses.ALL);

	const handleTabClick = (tab: ETabBountyStatuses) => {
		setActiveTab(tab);
	};

	return (
		<div style={{ ...styles.parentDiv }}>
			<div style={styles.tabsContainer}>
				<div
					style={{
						...styles.tab,
						backgroundColor: activeTab === ETabBountyStatuses.ALL ? 'white' : '#F5F5F5',
						color: activeTab === ETabBountyStatuses.ALL ? '#E5007A' : '#333',
						fontWeight: activeTab === ETabBountyStatuses.ALL ? '600' : '400'
					}}
					onClick={() => handleTabClick(ETabBountyStatuses.ALL)}
				>
					All
				</div>
				<div
					style={{
						...styles.tab,
						backgroundColor: activeTab === ETabBountyStatuses.APPROVED ? 'white' : '#F5F5F5',
						color: activeTab === ETabBountyStatuses.APPROVED ? '#E5007A' : '#333',
						fontWeight: activeTab === ETabBountyStatuses.APPROVED ? '600' : '400'
					}}
					onClick={() => handleTabClick(ETabBountyStatuses.APPROVED)}
				>
					Approved
				</div>
				<div
					style={{
						...styles.tab,
						backgroundColor: activeTab === ETabBountyStatuses.REJECTED ? 'white' : '#F5F5F5',
						color: activeTab === ETabBountyStatuses.REJECTED ? '#E5007A' : '#333',
						fontWeight: activeTab === ETabBountyStatuses.REJECTED ? '600' : '400'
					}}
					onClick={() => handleTabClick(ETabBountyStatuses.REJECTED)}
				>
					Rejected
				</div>
			</div>
		</div>
	);
};

const styles = {
	parentDiv: {
		backgroundColor: '#F5F5F5',
		padding: '4px',
		borderRadius: '8px',
		maxWidth: '291px',
		marginTop: '12px'
	},
	tabsContainer: {
		display: 'flex',
		gap: '4px',
		cursor: 'pointer'
	},
	tab: {
		width: '97px',
		fontSize: '14px',
		fontWeight: '400',
		padding: '6px 10px',
		textAlign: 'center' as 'center',
		transition: 'background-color 0.3s ease, color 0.3s ease',
		borderRadius: '10px'
	}
};

export default CustomTabs;
