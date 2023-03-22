// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactNode } from 'react';
import { bountyStatus, bountyStatusMap, childBountyStatus, childBountyStatusMap, gov2ReferendumStatus, motionStatus, proposalStatus, referendumStatus, tipStatus, tipStatusMap } from 'src/global/statuses';
import styled from 'styled-components';

interface Props{
	children?: ReactNode;
	className?: string;
	content?: string;
	status: string;
	colorInverted?: boolean;
	type?: string;
}

const StatusTag = ({ className, content, status, colorInverted, type }: Props) => {

	if (content && type === 'Tip' && tipStatusMap[content]) {
		content = tipStatusMap[content];
	}

	if (content && type === 'Bounty' && bountyStatusMap[content]) {
		content = bountyStatusMap[content];
	}

	if (content && type === 'ChildBounty' && childBountyStatusMap[content]) {
		content = childBountyStatusMap[content];
	}

	return (
		<div className={`${className} ${status} ${colorInverted && 'bg-white inverted'} text-xs rounded-full border-solid border-2 px-3 py-1 whitespace-nowrap h-min`}>
			{content}
		</div>
	);
};

export default styled(StatusTag).attrs(( { status }: Props) => ({
	className: status,
	content: status
}))`
	color: #fff;
	max-width: min-content;
	background: #666;
	border-color: #666;

	&.inverted {
		color: #666;
	}

	&.${gov2ReferendumStatus.DECIDING},
	&.${gov2ReferendumStatus.DECISION_DEPOSIT_PLACED} {
		border-color: #CA5CDD;
		background: #CA5CDD;

		&.inverted {
			color: #CA5CDD;
		}
	}

	&.${gov2ReferendumStatus.SUBMITTED},
	&.${referendumStatus.STARTED},
	&.${proposalStatus.PROPOSED},
	&.${motionStatus.PROPOSED},
	&.${bountyStatus.PROPOSED} {
		border-color: #6495ED;
		background: #6495ED;

		&.inverted {
			color: #6495ED;
		}
	}

	&.${tipStatus.OPENED},
	&.${tipStatus.CLOSING},
	&.${bountyStatus.AWARDED},
	&.${bountyStatus.ACTIVE},
	&.${bountyStatus.EXTENDED},
	&.${childBountyStatus.ADDED}
	&.${gov2ReferendumStatus.CONFIRM_STARTED} {
		border-color: #6495ED;
		background: #6495ED;

		&.inverted {
			color: #6495ED;
		}
	}

	&.${gov2ReferendumStatus.CONFIRMED},
	&.${proposalStatus.TABLED},
	&.${referendumStatus.PASSED},
	&.${referendumStatus.EXECUTED},
	&.${motionStatus.EXECUTED},
	&.${motionStatus.APPROVED},
	&.${motionStatus.CLOSED},
	&.${tipStatus.CLOSED},
	&.${bountyStatus.AWARDED},
	&.${bountyStatus.CLAIMED},
	&.${childBountyStatus.AWARDED} {
		border-color: #5BC044;
		background: #5BC044;

		&.inverted {
			color: #5BC044;
		}
	}
	&.${childBountyStatus.CLAIMED},
	&.prime, &.Prime {
		border-color: var(--green_primary);
		background-color: var(--green_primary);

		&.inverted {
			color: var(--green_primary);
		}
	}

	&.${gov2ReferendumStatus.KILLED},
	&.${gov2ReferendumStatus.REJECTED},
	&.${gov2ReferendumStatus.TIMEDOUT},
	&.${proposalStatus.CLEARED},
	&.${referendumStatus.CANCELLED},
	&.${referendumStatus.NOTPASSED},
	&.${referendumStatus.VETOED},
	&.${motionStatus.DISAPPROVED},
	&.${tipStatus.RETRACTED},
	&.${bountyStatus.CANCELED},
	&.${bountyStatus.REJECTED},
	&.${childBountyStatus.CANCELED} {
		border-color: #FF0000;
		background: #FF0000;

		&.inverted {
			color: #FF0000;
		}
	}
`;
