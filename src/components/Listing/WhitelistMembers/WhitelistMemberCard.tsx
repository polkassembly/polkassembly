// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Address from 'src/ui-components/Address';

import { WhitelistMember } from './WhitelistMembersContainer';

interface Props {
	className?: string;
	member: WhitelistMember;
}

const WhitelistMemberCard = ({ className, member }: Props) => {
	return (
		<div
			className={`${className} rounded-md border-2 border-solid border-grey_light p-3 transition-all duration-200 hover:border-pink_primary hover:shadow-xl dark:border-separatorDark md:p-4`}
		>
			<div className='flex items-center'>
				{member.rank && (
					<div className='mr-4 font-semibold text-navBlue'>
						<div>#{member.rank}</div>
					</div>
				)}

				<Address
					address={member.accountId}
					addressMaxLength={7}
				/>
			</div>
		</div>
	);
};

export default WhitelistMemberCard;
