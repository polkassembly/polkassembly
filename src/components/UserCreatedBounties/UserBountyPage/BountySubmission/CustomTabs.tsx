// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import React from 'react';
import { ETabBountyStatuses } from '~src/types';

const CustomTabs = ({ onTabChange, activeTab }: { onTabChange: (tab: ETabBountyStatuses) => void; activeTab: ETabBountyStatuses }) => {
	const handleTabClick = (tab: ETabBountyStatuses) => {
		onTabChange(tab);
	};

	return (
		<div
			style={{ ...styles.parentDiv }}
			className='bg-[#F5F5F5] dark:bg-section-dark-background'
		>
			<div style={styles.tabsContainer}>
				<div
					style={{
						...styles.tab,
						backgroundColor: activeTab === ETabBountyStatuses.ALL ? 'white' : '#F5F5F5',
						fontWeight: activeTab === ETabBountyStatuses.ALL ? '600' : '400'
					}}
					className={`bg-white ${
						activeTab === ETabBountyStatuses.ALL ? 'text-pink_primary' : 'text-blue-light-high dark:text-blue-dark-high'
					} text-blue-dark-high dark:bg-section-dark-overlay `}
					onClick={() => handleTabClick(ETabBountyStatuses.ALL)}
				>
					All
				</div>
				<div
					style={{
						...styles.tab,
						backgroundColor: activeTab === ETabBountyStatuses.APPROVED ? 'white' : '#F5F5F5',
						fontWeight: activeTab === ETabBountyStatuses.APPROVED ? '600' : '400'
					}}
					className={`bg-white ${
						activeTab === ETabBountyStatuses.APPROVED ? 'text-pink_primary' : 'text-blue-light-high dark:text-blue-dark-high'
					} text-blue-dark-high dark:bg-section-dark-overlay `}
					onClick={() => handleTabClick(ETabBountyStatuses.APPROVED)}
				>
					Approved
				</div>
				<div
					style={{
						...styles.tab,
						backgroundColor: activeTab === ETabBountyStatuses.REJECTED ? 'white' : '#F5F5F5',
						fontWeight: activeTab === ETabBountyStatuses.REJECTED ? '600' : '400'
					}}
					className={`bg-white ${
						activeTab === ETabBountyStatuses.REJECTED ? 'text-pink_primary' : 'text-blue-light-high dark:text-blue-dark-high'
					} text-blue-dark-high dark:bg-section-dark-overlay `}
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
		padding: '4.5px',
		borderRadius: '8px',
		maxWidth: '302px',
		marginTop: '12px'
	},
	tabsContainer: {
		display: 'flex',
		gap: '8px',
		cursor: 'pointer',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	tab: {
		width: '94px',
		fontSize: '14px',
		fontWeight: '400',
		padding: '6px 10px',
		textAlign: 'center' as 'center',
		transition: 'background-color 0.3s ease, color 0.3s ease',
		borderRadius: '10px'
	}
};

export default CustomTabs;
