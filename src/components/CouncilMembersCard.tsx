// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Address from 'src/ui-components/Address';
import StatusTag from 'src/ui-components/StatusTag';

interface Props {
    className?: string;
    data: string;
    prime: string;
}

const CouncilMembersCard = function ({ className, data, prime }: Props) {
    return (
        <div
            className={`${className} border-2 border-solid border-grey_light hover:border-pink_primary hover:shadow-xl transition-all duration-200 rounded-md p-3 md:p-4`}
        >
            <div className="flex justify-between">
                <div className="content">
                    <Address address={data} />
                </div>
                {data === prime && <StatusTag status={'Prime'} />}
            </div>
        </div>
    );
};

export default CouncilMembersCard;
