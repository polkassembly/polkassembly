// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { Button, Modal, Spin } from 'antd';
import React, { useContext, useState } from 'react';
import { ApiContext } from 'src/context/ApiContext';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';

import { LoadingStatusType, NotificationStatus } from '../../../../types';
import { NetworkContext } from '~src/context/NetworkContext';
import ReferendaLoginPrompts from '~src/ui-components/RefendaLoginPrompts';
import { useUserDetailsContext } from '~src/context';
import executeTx from '~src/util/executeTx';

export interface SecondProposalProps {
    accounts: InjectedAccount[];
    address: string;
    className?: string;
    proposalId?: number | null | undefined;
    getAccounts: () => Promise<undefined>;
    onAccountChange: (address: string) => void;
}

const SecondProposal = ({
    className,
    proposalId,
    address,
    accounts,
    onAccountChange,
    getAccounts,
}: SecondProposalProps) => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({
        isLoading: false,
        message: '',
    });
    const { api, apiReady } = useContext(ApiContext);
    const { network } = useContext(NetworkContext);
    const [modalOpen, setModalOpen] = useState(false);
    const [seconds, setSeconds] = useState<number>(0);
    const { id } = useUserDetailsContext();

    const onSuccess = () => {
        setLoadingStatus({ isLoading: false, message: '' });
        queueNotification({
            header: 'Success!',
            message: `Vote on proposal #${proposalId} successful.`,
            status: NotificationStatus.SUCCESS,
        });
    };

    const onFailed = (message: string) => {
        setLoadingStatus({ isLoading: false, message: '' });
        queueNotification({
            header: 'Failed!',
            message,
            status: NotificationStatus.ERROR,
        });
    };
    const secondProposal = async () => {
        if (!proposalId && proposalId !== 0) {
            console.error('proposalId not set');
            return;
        }

        if (!api) {
            return;
        }

        if (!apiReady) {
            return;
        }

        setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });
        let second = null;
        if (network == 'cere') {
            api.query.democracy.depositOf(proposalId).then((result: any) => {
                setSeconds(result.toHuman()[0].length);
            });
            // @ts-ignore
            second = api.tx.democracy.second(proposalId, seconds);
        } else {
            second = api.tx.democracy.second(proposalId);
        }

        await executeTx({
            address,
            api,
            errorMessageFallback: 'Transaction failed.',
            network,
            onBroadcast: () =>
                setLoadingStatus({
                    isLoading: true,
                    message: 'Broadcasting the vote',
                }),
            onFailed,
            onSuccess,
            params: network == 'equilibrium' ? { nonce: -1 } : {},
            tx: second,
        });
    };

    const openModal = () => {
        if (!id) {
            setModalOpen(true);
        } else if (accounts.length === 0) {
            getAccounts();
        } else if (id && accounts.length > 0) {
            setShowModal(true);
        }
    };

    return (
        <div className={className}>
            <Button
                className="bg-pink_primary hover:bg-pink_secondary mb-10 text-lg text-white border-pink_primary hover:border-pink_primary rounded-lg flex items-center justify-center p-7 w-[90%] mx-auto"
                onClick={openModal}
            >
                Second
            </Button>
            <Modal
                title="Second Proposal"
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={[
                    <Button
                        className="bg-pink_primary text-white border-pink_primary hover:bg-pink_secondary my-1"
                        key="second"
                        loading={loadingStatus.isLoading}
                        disabled={!apiReady}
                        onClick={secondProposal}
                    >
                        Second
                    </Button>,
                ]}
            >
                <Spin
                    spinning={loadingStatus.isLoading}
                    indicator={<LoadingOutlined />}
                >
                    <AccountSelectionForm
                        title="Endorse with account"
                        accounts={accounts}
                        address={address}
                        withBalance
                        onAccountChange={onAccountChange}
                    />
                </Spin>
            </Modal>
            <ReferendaLoginPrompts
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
                image="/assets/referenda-endorse.png"
                title="Join Polkassembly to Endorse this proposal."
                subtitle="Discuss, contribute and get regular updates from Polkassembly."
            />
        </div>
    );
};

export default styled(SecondProposal)`
    .LoaderWrapper {
        height: 15rem;
        position: absolute;
        width: 100%;
    }
`;
