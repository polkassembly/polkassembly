// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined } from '@ant-design/icons';
import { Collapse, Space } from 'antd';
import {
    IPostsByAddressListingResponse,
    IProposalsObj,
} from 'pages/api/v1/listing/posts-by-address';
import React, { FC, useEffect, useState } from 'react';
import Address from 'src/ui-components/Address';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import { LoadingLatestActivity } from 'src/ui-components/LatestActivityStates';
import StatusTag from 'src/ui-components/StatusTag';
import { PostEmptyState } from 'src/ui-components/UIStates';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';

import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

const { Panel } = Collapse;

interface IOtherProposalsProps {
    className?: string;
    proposerAddress: string;
    currPostOnchainID: number;
    closeSidebar: () => void;
}

const OtherProposals: FC<IOtherProposalsProps> = ({
    className,
    closeSidebar,
    currPostOnchainID,
    proposerAddress,
}) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [proposals, setProposals] = useState<IProposalsObj>({
        democracy: [],
        treasury: [],
    });

    useEffect(() => {
        setLoading(true);
        let substrate_address;
        if (!proposerAddress.startsWith('0x')) {
            substrate_address = getSubstrateAddress(proposerAddress);
            if (!substrate_address) return console.error('Invalid address');
        } else {
            substrate_address = proposerAddress;
        }

        nextApiClientFetch<IPostsByAddressListingResponse>(
            `api/v1/listing/posts-by-address?proposerAddress=${substrate_address}`,
        )
            .then((res) => {
                setLoading(false);
                if (res.data?.proposals) {
                    setProposals(res.data.proposals);
                } else if (res.error) {
                    setError(res.error);
                }
            })
            .catch((err) => {
                setLoading(false);
                setError(err.message);
            });
    }, [proposerAddress]);
    return (
        <div className={className}>
            <h4 className="dashboard-heading flex items-center mb-6">
                Other Proposals by{' '}
                <span className="ml-2">
                    <Address
                        className="text-navBlue"
                        address={proposerAddress}
                        displayInline={false}
                        identiconSize={20}
                        shortenAddressLength={6}
                    />
                </span>
            </h4>

            {!loading && error && (
                <ErrorAlert className="mb-6" errorMsg={error} />
            )}

            {loading && <LoadingLatestActivity />}

            {!loading && !error && proposals && (
                <Space direction="vertical" className="w-full">
                    {proposals.democracy.length > 0 && (
                        <Collapse collapsible="header" defaultActiveKey={['1']}>
                            <Panel header="Democracy Proposals" key="1">
                                {proposals.democracy.map((post) => {
                                    return (
                                        <>
                                            {post?.index !=
                                                currPostOnchainID && (
                                                <a
                                                    key={post.id}
                                                    href={`/proposal/${post?.index}`}
                                                    className="hover:text-sidebarBlue bg-transparent outline-none border-none w-full cursor-pointer"
                                                    onClick={closeSidebar}
                                                >
                                                    <div className="my-4 border-solid border-2 border-grey_light hover:border-pink_primary hover:shadow-xl transition-all duration-200 rounded-md p-2 md:p-4">
                                                        <div className="flex justify-between gap-x-2">
                                                            <div>
                                                                <h5 className="text-sidebarBlue font-medium text-sm">
                                                                    {post.title ||
                                                                        `#${post.index} Untitled`}
                                                                </h5>
                                                                <div className="flex items-center text-pink_primary font-normal text-sm">
                                                                    {' '}
                                                                    <ClockCircleOutlined className="mr-2" />{' '}
                                                                    {getRelativeCreatedAt(
                                                                        post.createdAt,
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {post.status && (
                                                                <StatusTag
                                                                    className="statusTag"
                                                                    status={
                                                                        post.status
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </a>
                                            )}
                                        </>
                                    );
                                })}
                            </Panel>
                        </Collapse>
                    )}

                    {proposals.treasury.length > 0 && (
                        <Collapse collapsible="header" defaultActiveKey={['1']}>
                            <Panel header="Treasury Proposals" key="1">
                                {proposals.treasury.map((post) => {
                                    return (
                                        <>
                                            {post.index !=
                                                currPostOnchainID && (
                                                <a
                                                    key={post.id}
                                                    href={`/treasury/${post.index}`}
                                                    className="hover:text-sidebarBlue bg-transparent outline-none border-none w-full cursor-pointer"
                                                    onClick={closeSidebar}
                                                >
                                                    <div className="my-4 border-solid border-2 border-grey_light hover:border-pink_primary hover:shadow-xl transition-all duration-200 rounded-md p-2 md:p-4">
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <h5>
                                                                    {post.title ||
                                                                        `#${post.index} Untitled`}
                                                                </h5>
                                                                <div className="flex items-center">
                                                                    {' '}
                                                                    <ClockCircleOutlined className="mr-2" />{' '}
                                                                    {getRelativeCreatedAt(
                                                                        post.createdAt,
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {post.status && (
                                                                <StatusTag
                                                                    className="statusTag"
                                                                    status={
                                                                        post.status
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </a>
                                            )}
                                        </>
                                    );
                                })}
                            </Panel>
                        </Collapse>
                    )}
                </Space>
            )}

            {!loading &&
                !error &&
                proposals &&
                proposals.treasury.length === 0 &&
                proposals.democracy.length === 0 && (
                    <div className="flex justify-center items-center mt-36">
                        <PostEmptyState description="No other proposals found" />
                    </div>
                )}
        </div>
    );
};

export default OtherProposals;
