// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckCircleFilled, DownOutlined, UpOutlined } from '@ant-design/icons';
import {
    web3Accounts,
    web3Enable,
    web3FromSource,
} from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import Identicon from '@polkadot/react-identicon';
import type { Data, Option } from '@polkadot/types';
import type { Registration } from '@polkadot/types/interfaces';
import { u8aToString } from '@polkadot/util';
import { checkAddress } from '@polkadot/util-crypto';
import { Button, Form, Input, Modal, Tooltip } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { ApiContext } from 'src/context/ApiContext';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import { APPNAME } from 'src/global/appName';
import { addressPrefix } from 'src/global/networkConstants';
import { chainProperties } from 'src/global/networkConstants';
import { LoadingStatusType, NotificationStatus } from 'src/types';
import Card from 'src/ui-components/Card';
import HelperTooltip from 'src/ui-components/HelperTooltip';
import Loader from 'src/ui-components/Loader';
import queueNotification from 'src/ui-components/QueueNotification';
import getEncodedAddress from 'src/util/getEncodedAddress';
import styled from 'styled-components';

import { NetworkContext } from '~src/context/NetworkContext';
import EthIdenticon from '~src/ui-components/EthIdenticon';

import AddressComponent from '../../ui-components/Address';
import executeTx from '~src/util/executeTx';

interface Props {
    className?: string;
    // setTipModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

enum AvailableAccountsInput {
    submitWithAccount,
}
interface ValueState {
    info: Record<string, unknown>;
    okAll: boolean;
    okDisplay?: boolean;
    okEmail?: boolean;
    okLegal?: boolean;
    okRiot?: boolean;
    okTwitter?: boolean;
    okWeb?: boolean;
}

const WHITESPACE = [' ', '\t'];

const DEPOSIT: Record<string, number> = {
    kusama: 33.3333,
    moonbeam: 12.58,
    moonriver: 1.0258,
    polkadot: 20.258,
};

function setHasVal(
    val: string,
    setActive: null | ((isActive: boolean) => void),
): void {
    if (val) {
        setActive && setActive(true);
    } else {
        setActive && setActive(false);
    }
}

function setData(
    data: Data,
    setActive: null | ((isActive: boolean) => void),
    setVal: (val: string) => void,
): void {
    if (data.asRaw.length != 0) {
        setActive && setActive(true);
        setVal(u8aToString(data.asRaw.toU8a(true)));
    }
}

function checkValue(
    hasValue: boolean,
    value: string | null | undefined,
    minLength: number,
    includes: string[],
    excludes: string[],
    starting: string[],
    notStarting: string[] = WHITESPACE,
    notEnding: string[] = WHITESPACE,
): boolean {
    return (
        !hasValue ||
        (!!value &&
            value.length >= minLength &&
            includes.reduce(
                (hasIncludes: boolean, check) =>
                    hasIncludes && value.includes(check),
                true,
            ) &&
            (!starting.length ||
                starting.some((check) => value.startsWith(check))) &&
            !excludes.some((check) => value.includes(check)) &&
            !notStarting.some((check) => value.startsWith(check)) &&
            !notEnding.some((check) => value.endsWith(check)))
    );
}

const SetOnChainIdentityButton = ({
    className, // setTipModalOpen,
}: Props) => {
    const { id } = useContext(UserDetailsContext);
    const { network } = useContext(NetworkContext);

    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [validAddress, setValidAddress] = useState<boolean>(false);

    const [displayName, setDisplayName] = useState<string>('');
    const [legalName, setLegalName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [website, setWebsite] = useState<string>('');
    const [twitter, setTwitter] = useState<string>('');
    const [availableAccounts, setAvailableAccounts] = useState<
        InjectedAccountWithMeta[]
    >([]);
    const [riotName, setRiotName] = useState<string>('');
    const [identityOpt, setidentityOpt] = useState<Option<Registration>>();
    const [
        { info, okAll, okDisplay, okEmail, okLegal, okRiot, okTwitter, okWeb },
        setInfo,
    ] = useState<ValueState>({ info: {}, okAll: false });
    const [hasEmail, setHasEmail] = useState(false);
    const [hasLegal, setHasLegal] = useState(false);
    const [hasRiot, setHasRiot] = useState(false);
    const [hasTwitter, setHasTwitter] = useState(false);
    const [hasWeb, setHasWeb] = useState(false);
    const { api, apiReady } = useContext(ApiContext);
    const [extensionNotAvailable, setExtensionNotAvailable] = useState(false);
    const [showAvailableAccountsObj, setShowAvailableAccountsObj] = useState<{
        [key: string]: boolean;
    }>({
        submitWithAccount: false,
    });
    const [submitWithAccount, setSubmitWithAccount] = useState<string>('');

    const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({
        isLoading: false,
        message: '',
    });

    const [, setErrorsFound] = useState<string[]>([]);
    const isFormValid = () => {
        const errorsFound: string[] = [];

        if (!displayName) {
            errorsFound.push('displayName');
        }

        if (errorsFound.length > 0) {
            setErrorsFound(errorsFound);
            return false;
        } else {
            setErrorsFound([]);
        }

        return true;
    };

    const handleDetect = async (updateForInput: AvailableAccountsInput) => {
        const extensions = await web3Enable(APPNAME);
        if (extensions.length === 0) {
            setExtensionNotAvailable(true);
            return;
        } else {
            setExtensionNotAvailable(false);
        }

        const allAccounts = await web3Accounts();
        setAvailableAccounts(allAccounts);

        const availableAccountsObj: { [key: string]: boolean } = {
            submitWithAccount: false,
        };

        switch (updateForInput) {
            case AvailableAccountsInput.submitWithAccount:
                availableAccountsObj.submitWithAccount =
                    !showAvailableAccountsObj['submitWithAccount'];
                break;
        }

        setShowAvailableAccountsObj(availableAccountsObj);
    };

    const isSelected = (
        updateForInput: AvailableAccountsInput,
        address: string,
    ) => {
        switch (updateForInput) {
            case AvailableAccountsInput.submitWithAccount:
                return submitWithAccount === address;
        }
    };

    const handleSelectAvailableAccount = (
        updateForInput: AvailableAccountsInput,
        address: string,
    ) => {
        switch (updateForInput) {
            case AvailableAccountsInput.submitWithAccount:
                setSubmitWithAccount(address);
                break;
        }

        // Close dropdown on select
        const availableAccountsObj: { [key: string]: boolean } = {
            submitWithAccount: false,
        };
        setShowAvailableAccountsObj(availableAccountsObj);
    };

    const onSubmitWithAccountChange = (address: string) => {
        setSubmitWithAccount(address);
    };

    const getAvailableAccounts = (updateForInput: AvailableAccountsInput) => {
        return (
            <div className=" w-full pl-[1.5em] pr-[1em]">
                {availableAccounts.map((account) => {
                    const address = getEncodedAddress(account.address, network);

                    return (
                        address && (
                            <div
                                key={address}
                                onClick={() =>
                                    handleSelectAvailableAccount(
                                        updateForInput,
                                        address,
                                    )
                                }
                                className=" mb-[10px] flex justify-between items-center cursor-pointer"
                            >
                                <div className="item">
                                    <AddressComponent
                                        className="item"
                                        address={address}
                                        extensionName={account.meta.name}
                                    />
                                </div>
                                {isSelected(updateForInput, address) ? (
                                    <CheckCircleFilled
                                        style={{ color: 'green' }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            border: '1px solid grey',
                                            borderRadius: '50%',
                                            height: '1em',
                                            width: '1em',
                                        }}
                                    ></div>
                                )}
                            </div>
                        )
                    );
                })}
            </div>
        );
    };

    useEffect(() => {
        if (!api) {
            return;
        }

        if (!apiReady) {
            return;
        }

        const [validAddress] = checkAddress(
            submitWithAccount,
            addressPrefix[network],
        );

        setValidAddress(validAddress);

        if (validAddress) {
            try {
                api.query.identity.identityOf(submitWithAccount, (data: any) =>
                    setidentityOpt(data),
                );
            } catch (e) {
                setidentityOpt(undefined);
            }

            if (identityOpt && identityOpt.isSome) {
                const { info } = identityOpt.unwrap();
                setData(info.display, null, setDisplayName);
                setData(info.email, setHasEmail, setEmail);
                setData(info.legal, setHasLegal, setLegalName);
                setData(info.riot, setHasRiot, setRiotName);
                setData(info.twitter, setHasTwitter, setTwitter);
                setData(info.web, setHasWeb, setWebsite);

                [
                    info.display,
                    info.email,
                    info.legal,
                    info.riot,
                    info.twitter,
                    info.web,
                ].some((info: Data) => {
                    if (info.isRaw) {
                        return true;
                    } else {
                        return false;
                    }
                });
            } else {
                setDisplayName('');
                setHasEmail(false);
                setEmail('');
                setHasLegal(false);
                setLegalName('');
                setHasRiot(false);
                setRiotName('');
                setHasTwitter(false);
                setTwitter('');
                setHasWeb(false);
                setWebsite('');
            }
        } else {
            setDisplayName('');
            setHasEmail(false);
            setEmail('');
            setHasLegal(false);
            setLegalName('');
            setHasRiot(false);
            setRiotName('');
            setHasTwitter(false);
            setTwitter('');
            setHasWeb(false);
            setWebsite('');
        }
    }, [api, apiReady, submitWithAccount, identityOpt, network]);

    useEffect((): void => {
        const okDisplay = checkValue(true, displayName, 1, [], [], []);
        setHasVal(email, setHasEmail);
        const okEmail = checkValue(hasEmail, email, 3, ['@'], WHITESPACE, []);
        setHasVal(legalName, setHasLegal);
        const okLegal = checkValue(hasLegal, legalName, 1, [], [], []);
        setHasVal(riotName, setHasRiot);
        const okRiot = checkValue(hasRiot, riotName, 6, [':'], WHITESPACE, [
            '@',
            '~',
        ]);
        setHasVal(twitter, setHasTwitter);
        const okTwitter = checkValue(hasTwitter, twitter, 3, [], WHITESPACE, [
            '@',
        ]);
        setHasVal(website, setHasWeb);
        const okWeb = checkValue(hasWeb, website, 8, ['.'], WHITESPACE, [
            'https://',
            'http://',
        ]);

        setInfo({
            info: {
                display: { [okDisplay ? 'raw' : 'none']: displayName || null },
                email: {
                    [okEmail && hasEmail ? 'raw' : 'none']:
                        okEmail && hasEmail ? email : null,
                },
                legal: {
                    [okLegal && hasLegal ? 'raw' : 'none']:
                        okLegal && hasLegal ? legalName : null,
                },
                riot: {
                    [okRiot && hasRiot ? 'raw' : 'none']:
                        okRiot && hasRiot ? riotName : null,
                },
                twitter: {
                    [okTwitter && hasTwitter ? 'raw' : 'none']:
                        okTwitter && hasTwitter ? twitter : null,
                },
                web: {
                    [okWeb && hasWeb ? 'raw' : 'none']:
                        okWeb && hasWeb ? website : null,
                },
            },
            okAll:
                okDisplay && okEmail && okLegal && okRiot && okTwitter && okWeb,
            okDisplay,
            okEmail,
            okLegal,
            okRiot,
            okTwitter,
            okWeb,
        });
    }, [
        hasEmail,
        hasLegal,
        hasRiot,
        hasTwitter,
        hasWeb,
        displayName,
        email,
        legalName,
        riotName,
        twitter,
        website,
    ]);

    const handleSignAndSubmit = async () => {
        if (!isFormValid()) return;

        if (!api) {
            return;
        }

        if (!apiReady) {
            return;
        }

        setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });

        const injected = await web3FromSource(availableAccounts[0].meta.source);

        api.setSigner(injected.signer);

        const identity = api.tx.identity.setIdentity(info);

        const onSuccess = () => {
            queueNotification({
                header: 'Success!',
                message: `Identity credentials submitted for verification, you will recieve an email from registrar shortly. Txn hash ${identity.hash}`,
                status: NotificationStatus.SUCCESS,
            });
            setLoadingStatus({ isLoading: false, message: '' });
            setModalOpen(false);
        };
        const onFailed = (message: string) => {
            queueNotification({
                header: 'Failed!',
                message,
                status: NotificationStatus.ERROR,
            });
        };

        await executeTx({
            address: submitWithAccount,
            api,
            errorMessageFallback: 'Transaction failed.',
            network,
            onFailed,
            onSuccess,
            tx: identity,
        });
    };
    const triggerBtn = (
        <div>
            <Button
                disabled={!id}
                className="h-[40px] md:h-[69px] bg-pink_primary rounded-md  hover:bg-pink_secondary text-white transition-colors duration-300"
                onClick={() => setModalOpen(true)}
            >
                {' '}
                Set On-Chain Identity
            </Button>
        </div>
    );
    const triggerBtnLoginDisabled = (
        <Tooltip
            color="#E5007A"
            title="Please signup/login to set on-chain identity"
        >
            {' '}
            <Button
                type="primary"
                disabled={true}
                className="w-full h-[40px] md:h-[69px] rounded-md"
            >
                {' '}
                Set On-Chain Identity
            </Button>
        </Tooltip>
    );

    return loadingStatus.isLoading ? (
        <Card className={'LoaderWrapper'}>
            <Loader text={loadingStatus.message} />
        </Card>
    ) : (
        <>
            {!id ? triggerBtnLoginDisabled : triggerBtn}

            <Modal
                className={className}
                title={'Set On-Chain Identity'}
                open={modalOpen}
                centered
                footer={[
                    <Button key="close" onClick={() => setModalOpen(false)}>
                        Close
                    </Button>,
                    <Button
                        key="submit"
                        disabled={!okAll}
                        className="submitBtn"
                        onClick={handleSignAndSubmit}
                    >
                        Set Identity
                    </Button>,
                ]}
                onCancel={() => setModalOpen(false)}
            >
                <div>
                    <div className="modal-desc">
                        <Form className="identity-form">
                            {/* Select account */}
                            <div className=" mb-[1.5em]">
                                <div className=" flex justify-between mb-[0.5em] px-[0.5em]">
                                    <label className="font-bold text-sidebarBlue">
                                        Submit with account
                                        <HelperTooltip
                                            className="ml-1 align-middle"
                                            text="Set identity for account"
                                        />
                                    </label>
                                </div>

                                <div className="accountInputDiv flex items-center">
                                    {submitWithAccount.startsWith('0x') ? (
                                        <EthIdenticon
                                            size={26}
                                            address={submitWithAccount}
                                        />
                                    ) : (
                                        <Identicon
                                            className="z-10 absolute left-8"
                                            value={submitWithAccount}
                                            size={26}
                                            theme={'polkadot'}
                                        />
                                    )}
                                    <Form.Item
                                        className=" mb-0 w-full"
                                        validateStatus={
                                            !validAddress ? 'error' : ''
                                        }
                                    >
                                        <Input
                                            value={submitWithAccount}
                                            className={`${
                                                submitWithAccount === ''
                                                    ? 'px-[0.5em]'
                                                    : 'pl-10'
                                            }`}
                                            onChange={(e) =>
                                                onSubmitWithAccountChange(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Account Address"
                                        />
                                    </Form.Item>
                                </div>

                                {!extensionNotAvailable && (
                                    <div className=" flex justify-between mb-[1em]">
                                        <div
                                            onClick={() =>
                                                handleDetect(
                                                    AvailableAccountsInput.submitWithAccount,
                                                )
                                            }
                                            className=" text-pink_primary cursor-pointer ml-[1.5em] mt-[0.25em]"
                                        >
                                            or choose from available addresses
                                            {showAvailableAccountsObj[
                                                'submitWithAccount'
                                            ] ? (
                                                <UpOutlined className="ml-1 align-middle" />
                                            ) : (
                                                <DownOutlined className="ml-1 align-middle" />
                                            )}
                                        </div>
                                    </div>
                                )}
                                {extensionNotAvailable && (
                                    <div className="error">
                                        Please install polkadot.js extension
                                    </div>
                                )}
                                {showAvailableAccountsObj[
                                    'submitWithAccount'
                                ] &&
                                    availableAccounts.length > 0 &&
                                    getAvailableAccounts(
                                        AvailableAccountsInput.submitWithAccount,
                                    )}
                            </div>
                            {/* Display Name */}
                            <div className=" mb-[1.5em]">
                                <div className=" flex justify-between mb-[0.5em] px-[0.5em]">
                                    <label className="font-bold text-sidebarBlue">
                                        Display Name
                                    </label>
                                </div>
                                <Form.Item
                                    name="Name"
                                    rules={[{ required: true }]}
                                    className=" mb-0"
                                    validateStatus={!okDisplay ? 'error' : ''}
                                >
                                    <Input
                                        className="px-[0.5em]"
                                        value={displayName}
                                        placeholder="My On-Chain Name"
                                        onChange={(e) =>
                                            setDisplayName(e.target.value)
                                        }
                                        // error={!okDisplay}
                                    />
                                </Form.Item>
                            </div>

                            {/* Legal Name */}
                            <div className=" mb-[1.5em]">
                                <div className=" flex justify-between mb-[0.5em] px-[0.5em]">
                                    <label className="font-bold text-sidebarBlue">
                                        Legal Name
                                    </label>
                                    <span>*Optional</span>
                                </div>
                                <Form.Item
                                    name="Legal name"
                                    className=" mb-0"
                                    validateStatus={!okLegal ? 'error' : ''}
                                >
                                    <Input
                                        className="px-[0.5em]"
                                        placeholder="Full Legal Name"
                                        value={legalName}
                                        onChange={(e) =>
                                            setLegalName(e.target.value)
                                        }
                                    />
                                </Form.Item>
                            </div>

                            {/* Email */}
                            <div className=" mb-[1.5em]">
                                <div className=" flex justify-between mb-[0.5em] px-[0.5em]">
                                    <label className="font-bold text-sidebarBlue">
                                        Email
                                    </label>
                                    <span>*Optional</span>
                                </div>
                                <Form.Item
                                    name="Email"
                                    className=" mb-0"
                                    validateStatus={!okEmail ? 'error' : ''}
                                >
                                    <Input
                                        className="px-[0.5em]"
                                        value={email}
                                        placeholder="somebody@example.com"
                                        onChange={(e) =>
                                            setEmail(
                                                e.target.value.toLowerCase(),
                                            )
                                        }
                                    />
                                </Form.Item>
                            </div>

                            {/* Website */}
                            <div className=" mb-[1.5em]">
                                <div className=" flex justify-between mb-[0.5em] px-[0.5em]">
                                    <label className="font-bold text-sidebarBlue">
                                        Website
                                    </label>
                                    <span>*Optional</span>
                                </div>
                                <Form.Item
                                    name="Website"
                                    className=" mb-0"
                                    validateStatus={!okWeb ? 'error' : ''}
                                >
                                    <Input
                                        className="px-[0.5em]"
                                        value={website}
                                        placeholder="https://example.com"
                                        onChange={(e) =>
                                            setWebsite(e.target.value)
                                        }
                                        // error={!okWeb}
                                    />
                                </Form.Item>
                            </div>

                            {/* Twitter */}
                            <div className=" mb-[1.5em]">
                                <div className=" flex justify-between mb-[0.5em] px-[0.5em]">
                                    <label className="font-bold text-sidebarBlue">
                                        Twitter
                                    </label>
                                    <span>*Optional</span>
                                </div>
                                <Form.Item
                                    name="Twitter"
                                    className=" mb-0"
                                    validateStatus={!okTwitter ? 'error' : ''}
                                >
                                    <Input
                                        className="px-[0.5em]"
                                        value={twitter}
                                        placeholder="@YourTwitterName"
                                        onChange={(e) =>
                                            setTwitter(e.target.value)
                                        }
                                    />
                                </Form.Item>
                            </div>

                            {/* Riot Name */}
                            <div className=" mb-[1.5em]">
                                <div className=" flex justify-between mb-[0.5em] px-[0.5em]">
                                    <label className="font-bold text-sidebarBlue">
                                        Riot Name
                                    </label>
                                    <span>*Optional</span>
                                </div>
                                <Form.Item
                                    name="Riot"
                                    className=" mb-0"
                                    validateStatus={!okRiot ? 'error' : ''}
                                >
                                    <Input
                                        className="px-[0.5em]"
                                        value={riotName}
                                        placeholder="@yourname:matrix.org"
                                        onChange={(e) =>
                                            setRiotName(e.target.value)
                                        }
                                    />
                                </Form.Item>
                            </div>

                            {/* Total Deposit */}
                            <div className=" mb-[1.5em]">
                                <div className=" flex justify-between mb-[0.5em] px-[0.5em]">
                                    <label className="font-bold text-sidebarBlue">
                                        Total Deposit
                                    </label>
                                </div>

                                <div className="balance-input flex items-center">
                                    <Form.Item
                                        className="flex-1 mb-0"
                                        name="Deposit"
                                        rules={[{ required: true }]}
                                    >
                                        <Input
                                            type="number"
                                            placeholder={'0'}
                                            className="px-[0.5em]"
                                            // onChange={onBalanceChange}
                                            value={DEPOSIT[network]}
                                        />
                                    </Form.Item>
                                    <span className="ml-1">
                                        {chainProperties[network]?.tokenSymbol}
                                    </span>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default styled(SetOnChainIdentityButton)`
    /* Hides Increment Arrows in number input */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type='number'] {
        -moz-appearance: textfield;
    }
    .submitBtn {
        background-color: pink_primary;
        color: #fff;
    }
`;
