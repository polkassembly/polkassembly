// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined } from '@ant-design/icons';
import React from 'react';
import styled from 'styled-components';

const TipsPostCard = ({ className } : { className?: string }) => {
	return (
		<div className={className}>
			<div className="tip-history tipped/not-tipped">
				Not Tipped
			</div>

			<h5>Talisman Proposal: Cross-Chain Transaction</h5>
			<p>Working on finishing up the tickets for the bigger project files. Working on finishing up the tickets for</p>

			<div className="info-bar">
				<div className="tip-post-status opened/rewarded">
					Opened
				</div>

				<div className="right-info d-flex">
					<div className="time">
						<ClockCircleOutlined/>
						20h ago
					</div>
				</div>
			</div>
		</div>
	);
};

export default styled(TipsPostCard)`
	background: #FFFFFF;
	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.16);
	border-radius: 8px;
	padding: 15px 20px;

	h5 {
		font-size: 16px;
	}

	p {
		font-size: 14px;
		margin: 12px auto;
	}

	.tip-history {
		font-weight: 500;
		font-size: 12px;
		margin-bottom: 6px;

		&.tipped {
			color: #5BC044;
		}

		&.not-tipped {
			color: #FF0000;
		}
	}

	.info-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.tip-post-status {
			font-size: 14px;
			padding: 4px 8px;
			background: #B6B6B6;
			border-radius: 4px;
			color: #FFFFFF;

			&.opened {
				background: #B6B6B6;
			}

			&.rewarded {
				background: #D6AD1D;
			}
		}

		.right-info {
			.time {
				margin-left: 24px;
			}
		}
	}
`;
