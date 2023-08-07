// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from "next/link";
import { EMembersType } from "pages/members";
import React from "react";

import WhitelistMemberCard from "./WhitelistMemberCard";
import { WhitelistMember } from "./WhitelistMembersContainer";

interface Props {
    className?: string;
    data: WhitelistMember[];
    membersType: EMembersType;
}

const WhitelistMembersListing = ({ className, data, membersType }: Props) => {
    return (
        <div className={`${className}`}>
            {data.map((member) => (
                <div key={member.accountId} className="my-5">
                    {
                        <Link
                            href={`/profile/${member.accountId}?membersType=${membersType}`}
                        >
                            <WhitelistMemberCard member={member} />
                        </Link>
                    }
                </div>
            ))}
        </div>
    );
};

export default WhitelistMembersListing;
