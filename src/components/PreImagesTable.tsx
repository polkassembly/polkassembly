// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { ProfileOutlined } from '@ant-design/icons';
import { Button, Modal, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { IPreimagesListing } from 'pages/api/v1/listing/preimages';
import React, { FC, useState } from 'react';
import ReactJson from 'react-json-view';
import NameLabel from 'src/ui-components/NameLabel';
import { LoadingState, PostEmptyState } from 'src/ui-components/UIStates';
import formatBnBalance from 'src/util/formatBnBalance';

import { useNetworkContext } from '~src/context';

interface IPreImagesTableProps {
    preimages: IPreimagesListing[];
}

const PreImagesTable: FC<IPreImagesTableProps> = (props) => {
    const { network } = useNetworkContext();

    const { preimages } = props;
    const [modalArgs, setModalArgs] = useState<any>(null);

    const columns: ColumnsType<any> = [
        {
            title: 'Hash',
            dataIndex: 'hash',
            key: 'hash',
            width: 350,
            render: (hash) => (
                <span className="text-sidebarBlue font-medium">{hash}</span>
            ),
        },
        {
            title: 'Author',
            dataIndex: 'proposer',
            key: 'author',
            width: 200,
            render: (proposer) => <NameLabel defaultAddress={proposer} />,
        },
        {
            title: 'Deposit',
            dataIndex: 'deposit',
            key: 'deposit',
            width: 120,
            render: (deposit) => (
                <span className="text-sidebarBlue font-medium whitespace-pre">
                    {deposit &&
                        formatBnBalance(
                            deposit,
                            { numberAfterComma: 2, withUnit: true },
                            network,
                        )}
                </span>
            ),
        },
        {
            title: 'Arguments',
            dataIndex: 'proposedCall',
            key: 'proposedCall',
            width: 265,
            render: (proposedCall) =>
                proposedCall &&
                proposedCall.section &&
                proposedCall.method && (
                    <div className="flex items-center">
                        <code className="px-2 rounded-md">
                            {proposedCall.section}.{proposedCall.method}
                        </code>
                        {proposedCall.args && (
                            <ProfileOutlined
                                className="ml-2 p-1 text-base rounded-md hover:text-pink_primary cursor-pointer"
                                onClick={() => setModalArgs(proposedCall.args)}
                            />
                        )}
                    </div>
                ),
        },
        {
            title: 'Size',
            dataIndex: 'length',
            key: 'length',
            width: 65,
            render: (length) => (
                <span className="text-sidebarBlue font-medium">{length}</span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 135,
            render: (status) => (
                <span className="text-sidebarBlue font-medium">{status}</span>
            ),
        },
    ];

    if (preimages) {
        if (!preimages || !preimages.length) return <PostEmptyState />;

        const tableData: any[] = [];

        preimages.forEach((preImageObj: any, index: number) => {
            tableData.push({ key: index, ...preImageObj });
        });

        return (
            <div>
                <Table
                    columns={columns}
                    dataSource={tableData}
                    pagination={false}
                    scroll={{ x: 1000 }}
                />

                <Modal
                    open={Boolean(modalArgs)}
                    title={'Arguments'}
                    onOk={() => setModalArgs(null)}
                    onCancel={() => setModalArgs(null)}
                    footer={[
                        <Button key="back" onClick={() => setModalArgs(null)}>
                            {' '}
                            Close{' '}
                        </Button>,
                    ]}
                >
                    {modalArgs && (
                        <div className="w-full max-h-[60vh] overflow-auto">
                            <ReactJson
                                src={modalArgs}
                                iconStyle="circle"
                                enableClipboard={false}
                                displayDataTypes={false}
                            />
                        </div>
                    )}
                </Modal>
            </div>
        );
    }

    // Loading state
    return <LoadingState />;
};

export default React.memo(PreImagesTable);
