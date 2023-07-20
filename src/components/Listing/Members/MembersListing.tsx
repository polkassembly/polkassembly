// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import { EMembersType } from 'pages/members';
import React from 'react';
import CouncilMembersCard from 'src/components/CouncilMembersCard';
import { PostEmptyState } from '~src/ui-components/UIStates';

interface Props {
    className?: string;
    data: string[];
    prime: string;
}

const MembersListing = ({ className, data, prime }: Props) => {
    if (!data.length)
        return (
            <div className={className}>
                <PostEmptyState />
            </div>
        );

    return (
        <div className={`${className} motions__list`}>
            {data.map((member) => (
                <div key={member} className="my-5">
                    {
                        <Link
                            href={`/profile/${member}?membersType=${EMembersType.COUNCIL}`}
                        >
                            <CouncilMembersCard data={member} prime={prime} />
                        </Link>
                    }
                </div>
            ))}
        </div>
    );
};

export default MembersListing;
