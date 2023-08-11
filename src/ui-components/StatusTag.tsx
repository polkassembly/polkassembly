// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactNode } from 'react';
import { announcementStatus, bountyStatus, bountyStatusMap, childBountyStatus, childBountyStatusMap, gov2ReferendumStatus, motionStatus, proposalStatus, referendumStatus, tipStatus, tipStatusMap } from 'src/global/statuses';
import styled from 'styled-components';

interface Props{
	children?: ReactNode;
	className?: string;
	content?: string;
	status: string | undefined;
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
		<div className={`${className} ${status} ${colorInverted && 'bg-white inverted'} text-xs rounded-full  px-3 py-1 whitespace-nowrap h-min`}>
			{content?.split(/(?=[A-Z])/).join(' ')}
		</div>
	);
};

export default styled(StatusTag).attrs(( { status }: Props) => ({
	className: status,
	content: status
}))`
	
	max-width: min-content;
	background: #666;
	color: #fff;

	&.inverted {
		color: #666;
		background: transparent;
	}

	&.${gov2ReferendumStatus.DECIDING},
	&.${gov2ReferendumStatus.DECISION_DEPOSIT_PLACED},
	&.${bountyStatus.ACTIVE},
	&.${bountyStatus.EXTENDED},
	&.${tipStatus.CLOSING} {
		color: #fff;
		border:2px solid #FF6700;
		background: #FF6700;

		&.inverted {
			color: #CA5CDD;
			border-color: #CA5CDD;
		}
	}

	&.${gov2ReferendumStatus.CREATED},
	&.${gov2ReferendumStatus.SUBMITTED},
	&.${gov2ReferendumStatus.CONFIRM_STARTED},
	&.${referendumStatus.STARTED},
  &.${referendumStatus.SCHEDULED},
	&.${proposalStatus.PROPOSED},
	&.${motionStatus.PROPOSED},
	&.${bountyStatus.PROPOSED},
	&.${tipStatus.OPENED},
	&.${childBountyStatus.ADDED} {
		color: #fff;
		border:2px solid #407AFC;
		background: #407AFC;

		&.inverted {
			color: #6495ED;
		}
	}
	&.${gov2ReferendumStatus.KILLED},
	&.${gov2ReferendumStatus.REJECTED},
	&.${gov2ReferendumStatus.TIMEDOUT},
	&.${proposalStatus.CLEARED},
	&.${referendumStatus.CANCELLED},
  &.${referendumStatus.EXPIRED},
	&.${referendumStatus.VETOED},
	&.${motionStatus.DISAPPROVED},
	&.${tipStatus.RETRACTED},
	&.${bountyStatus.CANCELED},
	&.${bountyStatus.REJECTED},
	&.${gov2ReferendumStatus.EXECUTION_FAILED},
	&.${childBountyStatus.CANCELED},
	&.${gov2ReferendumStatus.CONFIRM_ABORTED} {
		color: #fff;
		border:2px solid #FF0000 !important;
		background: #FF0000 !important;

		&.inverted {
			color: #FF0000 ;
			background: #fff !important;
		}
	}
	&.${referendumStatus.NOTPASSED}{
		color: #fff;
		border:2px solid #FF0000 !important;
		background: #FF0000 !important;
		&.inverted {
			color: #FF0000 !important;
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
	&.${childBountyStatus.AWARDED},
	&.${bountyStatus.AWARDED},
	&.${announcementStatus.Announced} {
		color: #fff;
		border:2px solid #5BC044;
		background: #5BC044;

		&.inverted {
			color: #5BC044;
		}
	}

	&.${childBountyStatus.CLAIMED},
	&.prime, &.Prime {
		color: #fff;
		border:2px solid var(--green_primary);
		background-color: var(--green_primary);

		&.inverted {
			color: var(--green_primary);
		}
	}
`;
