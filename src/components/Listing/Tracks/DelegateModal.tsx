// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useContext, useEffect, useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Checkbox,
  Form,
  Modal,
  Popover,
  Slider,
  Spin,
} from 'antd';
import BN from 'bn.js';
import { poppins } from 'pages/_app';
import { ApiContext } from 'src/context/ApiContext';
import { ETrackDelegationStatus, NotificationStatus } from 'src/types';
import AddressInput from 'src/ui-components/AddressInput';
import BalanceInput from 'src/ui-components/BalanceInput';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';

import { NetworkContext } from '~src/context/NetworkContext';
import LockIcon from '~assets/icons/lock.svg';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { useUserDetailsContext } from '~src/context';

import DelegateProfileIcon from '~assets/icons/delegate-popup-profile.svg';
import CloseIcon from '~assets/icons/close.svg';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import { ITrackDelegation } from 'pages/api/v1/delegations';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import DelegationSuccessPopup from './DelegationSuccessPopup';
import Address from '~src/ui-components/Address';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import CrossIcon from '~assets/sidebar/delegation-close.svg';
import { formatBalance } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';
import { useRouter } from 'next/router';
import Web3 from 'web3';
import Balance from '~src/components/Balance';
import { formatedBalance } from '~src/components/DelegationDashboard/ProfileBalance';
import executeTx from '~src/util/executeTx';

const ZERO_BN = new BN(0);

interface Props {
  trackNum?: number;
  className?: string;
  defaultTarget?: string;
  open?: boolean;
  setOpen?: (pre: boolean) => void;
}

const DelegateModal = ({
  className,
  defaultTarget,
  open,
  setOpen,
  trackNum,
}: Props) => {
  const { api, apiReady } = useContext(ApiContext);
  const { network } = useContext(NetworkContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const { delegationDashboardAddress } = useUserDetailsContext();
  const [target, setTarget] = useState<string>('');
  const [bnBalance, setBnBalance] = useState<BN>(ZERO_BN);
  const [conviction, setConviction] = useState<number>(0);
  const [lock, setLockValue] = useState<number>(0);
  const [errorArr, setErrorArr] = useState<string[]>([]);
  const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
  const [checkedList, setCheckedList] = useState<CheckboxValueType[]>([]);
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(false);
  const [openSuccessPopup, setOpenSuccessPopup] = useState<boolean>(false);
  const [txFee, setTxFee] = useState(ZERO_BN);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [trackArr, setTrackArr] = useState<any[]>([]);
  const unit = `${chainProperties[network]?.tokenSymbol}`;
  const [defaultOpen, setDefaultOpen] = useState<boolean>(false);
  const [checkedTrack, setCheckedTrack] = useState<any>();
  const router = useRouter();
  const [checkedTrackArr, setCheckedTrackArr] = useState<string[]>([]);
  const [targetErr, setTargetErr] = useState<string>('');
  const [balanceErr, setBalanceErr] = useState<string>('');
  const [validationOn, setValidationOn] = useState<boolean>(false);
  const [addressAlert, setAddressAlert] = useState<boolean>(false);

  useEffect(() => {
    if (!network) return;
    formatBalance.setDefaults({
      decimals: chainProperties[network].tokenDecimals,
      unit: chainProperties[network].tokenSymbol,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    target &&
      (getEncodedAddress(target, network) || Web3.utils.isAddress(target)) &&
      target !== getEncodedAddress(target, network) &&
      setAddressAlert(true);
    setTimeout(() => {
      setAddressAlert(false);
    }, 5000);
  }, [network, target]);

  const handleClose = (removedTag: string) => {
    const newList = checkedList.filter((list) => list !== removedTag);
    setCheckedList(newList);
    setIndeterminate(!!newList.length && newList.length < trackArr.length);
    setCheckAll(newList.length === trackArr.length);
  };

  useEffect(() => {
    validationOn && validateForm();

    if (
      !delegationDashboardAddress ||
      !target ||
      !getEncodedAddress(target, network) ||
      isNaN(conviction) ||
      !api ||
      !apiReady ||
      !bnBalance ||
      bnBalance.lte(ZERO_BN) ||
      bnBalance.eq(ZERO_BN)
    )
      return;
    if (!checkedTrack && !checkedList) return;
    if (!checkedTrack && checkedList.length === 0) return;

    setLoading(true);
    const checkedArr =
      checkedTrack &&
      checkedTrack.name &&
      checkedList.filter((item) => item === checkedTrack?.name).length === 0
        ? [checkedTrack?.name, ...checkedList]
        : [...checkedList];

    setCheckedTrackArr(checkedArr);
    const txArr = checkedArr?.map((trackName) =>
      api.tx.convictionVoting.delegate(
        networkTrackInfo[network][trackName.toString()].trackId,
        target,
        conviction,
        bnBalance.toString(),
      ),
    );
    const delegateTxn = api.tx.utility.batchAll(txArr);

    (async () => {
      const info = await delegateTxn.paymentInfo(delegationDashboardAddress);
      setTxFee(new BN(info.partialFee.toString() || 0));
      setLoading(false);
      setShowAlert(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    delegationDashboardAddress,
    api,
    apiReady,
    bnBalance,
    checkedList,
    conviction,
    network,
    target,
    checkedTrack,
    validationOn,
  ]);

  const getData = async () => {
    if (!api || !apiReady) return;

    setLoading(true);

    const { data, error } = await nextApiClientFetch<ITrackDelegation[]>(
      `api/v1/delegations?address=${delegationDashboardAddress}`,
    );
    if (data) {
      const trackData = data.filter(
        (item) => !item.status.includes(ETrackDelegationStatus.Delegated),
      );
      if (network) {
        const tracks = trackData.map((item) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const values = Object.entries(networkTrackInfo?.[network]).find(
            ([key, value]) => {
              return value.trackId === item?.track;
            },
          );

          return values
            ? {
                name: values[0],
                trackId: values[1].trackId,
              }
            : null;
        });
        setTrackArr(tracks);
        const defaultCheck = tracks.filter(
          (item) => item?.trackId === trackNum,
        );
        defaultCheck.length > 0 &&
          defaultCheck?.[0] &&
          setCheckedTrack(defaultCheck[0]);
      }
    } else {
      console.log(error);
    }
    setLoading(false);
  };

  const onChange = (list: CheckboxValueType[]) => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < trackArr.length);
    setCheckAll(list.length === trackArr.length);
  };

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    setCheckedList(
      e.target.checked ? trackArr.map((track) => track?.name) : [],
    );
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  const validateForm = (): boolean => {
    const errors = [];
    setTargetErr('');
    setBalanceErr('');

    if (!target || !getEncodedAddress(target, network)) {
      setTargetErr('Please provide a valid target address.');
      errors.push('');
    }

    if (
      delegationDashboardAddress === target ||
      delegationDashboardAddress === getEncodedAddress(target, network)
    ) {
      setTargetErr(
        'You can not delegate to the same address. Please provide a different target address.',
      );
      errors.push('');
    }
    if (bnBalance.lte(ZERO_BN)) {
      setBalanceErr('Please provide a valid balance.');
      errors.push('');
    }

    if (bnBalance.eq(ZERO_BN)) {
      setBalanceErr('Balance must be greater than 0.');
      errors.push('');
    }

    if (availableBalance.lt(bnBalance)) {
      setBalanceErr('Insufficient balance.');
      errors.push('');
    }

    if (availableBalance.lte(txFee)) {
      errors.push('Available balance is not sufficient for transaction fee');
    }

    setErrorArr(errors);
    return errors.length === 0;
  };
  const onSuccess = () => {
    queueNotification({
      header: 'Success!',
      message: 'Delegation successful.',
      status: NotificationStatus.SUCCESS,
    });
    setOpenSuccessPopup(true);
    setLoading(false);
    setOpen ? setOpen?.(false) : setDefaultOpen(false);
  };
  const onFailed = (message: string) => {
    queueNotification({
      header: 'Failed!',
      message,
      status: NotificationStatus.ERROR,
    });
    setLoading(false);
    setOpen ? setOpen?.(false) : setDefaultOpen(false);
  };

  const handleSubmit = async () => {
    if (
      !api ||
      !apiReady ||
      !bnBalance ||
      bnBalance.lte(ZERO_BN) ||
      bnBalance.eq(ZERO_BN)
    )
      return;
    if (!checkedTrack && !checkedList) return;
    if (!checkedTrack && checkedList.length === 0) return;
    setLoading(true);

    const targetAddr = getEncodedAddress(target, network);

    if (!validateForm() || !targetAddr) {
      setLoading(false);
      return;
    }
    const checkedArr =
      checkedTrack &&
      checkedTrack.name &&
      checkedList.filter((item) => item === checkedTrack?.name).length === 0
        ? [checkedTrack?.name, ...checkedList]
        : [...checkedList];
    setCheckedTrackArr(checkedArr);

    const txArr = checkedArr?.map((trackName) =>
      api.tx.convictionVoting.delegate(
        networkTrackInfo[network][trackName.toString()].trackId,
        target,
        conviction,
        bnBalance.toString(),
      ),
    );
    const delegateTxn = api.tx.utility.batchAll(txArr);

    await executeTx({
      address: delegationDashboardAddress,
      api,
      errorMessageFallback: 'Delegation failed.',
      network,
      onFailed,
      onSuccess,
      tx: delegateTxn,
    });
  };

  const handleOnBalanceChange = (balanceStr: string) => {
    let balance = ZERO_BN;

    try {
      balance = new BN(balanceStr);
    } catch (err) {
      console.log(err);
    }

    setAvailableBalance(balance);
  };
  useEffect(() => {
    open && getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const content = (
    <div className="flex flex-col">
      <Checkbox.Group
        className="flex flex-col h-[200px] overflow-y-scroll"
        onChange={onChange}
        value={checkedList}
      >
        {trackArr
          ?.filter((item) => item?.trackId !== trackNum)
          ?.map((track, index) => (
            <div
              className={`${poppins.variable} ${poppins.className} text-sm tracking-[0.01em] text-bodyBlue flex gap-[13px] p-[8px]`}
              key={index}
            >
              <Checkbox className="text-pink_primary" value={track?.name} />
              {track.name === 'root'
                ? 'Root'
                : track.name?.split(/(?=[A-Z])/).join(' ')}
            </div>
          ))}
      </Checkbox.Group>
    </div>
  );

  return (
    <>
      {!open && !setOpen && (
        <Button
          onClick={() => {
            network === 'kusama'
              ? router.push('/delegation')
              : setDefaultOpen(true);
          }}
          className="border-pink_primary font-medium text-sm text-pink_primary hover:bg-pink_primary hover:text-white flex gap-0 items-center justify-center py-3 px-6 rounded-[4px]"
        >
          <PlusOutlined />
          <span>Delegate</span>
        </Button>
      )}

      <Modal
        maskClosable={false}
        closeIcon={<CloseIcon />}
        className={`${poppins.variable} ${poppins.className} padding shadow-[0px 8px 18px rgba(0, 0, 0, 0.06)] w-[600px] max-md:w-full`}
        wrapClassName={className}
        title={
          <div className="flex items-center text-bodyBlue text-[20px] font-semibold mb-6">
            <DelegateProfileIcon className="mr-2" />
            Delegate
          </div>
        }
        open={open ? open : defaultOpen}
        onOk={handleSubmit}
        confirmLoading={loading}
        onCancel={() => (setOpen ? setOpen?.(false) : setDefaultOpen(false))}
        footer={
          <div className="flex items-center justify-end">
            {[
              <Button
                key="back"
                disabled={loading}
                className="h-[40px] w-[134px]"
                onClick={() => setOpen?.(false)}
              >
                Cancel
              </Button>,
              <Button
                htmlType="submit"
                key="submit"
                className="w-[134px] bg-pink_primary text-white hover:bg-pink_secondary h-[40px] "
                disabled={loading}
                onClick={() => {
                  handleSubmit();
                  setValidationOn(true);
                }}
              >
                Delegate
              </Button>,
            ]}
          </div>
        }
      >
        <Spin spinning={loading} indicator={<LoadingOutlined />}>
          <div className="flex flex-col">
            {errorArr.length > 0 &&
              errorArr.map(
                (errorMsg) =>
                  errorMsg.length > 0 && (
                    <ErrorAlert
                      className="mb-6"
                      key={errorMsg}
                      errorMsg={errorMsg}
                    />
                  ),
              )}

            <Form form={form} disabled={loading}>
              <div className="">
                <label className="text-sm text-lightBlue mb-[2px]">
                  Your Address
                </label>
                <div className="px-[6px] py-[6px] border-solid rounded-[4px] border-[1px] cursor-not-allowed h-[40px] bg-[#f6f7f9] border-[#D2D8E0] text-[#7c899b] text-sm font-normal">
                  <Address
                    address={delegationDashboardAddress}
                    identiconSize={26}
                    disableAddressClick
                    addressClassName="text-[#7c899b] text-sm"
                    displayInline
                  />
                </div>
              </div>
              <AddressInput
                defaultAddress={defaultTarget}
                label={'Delegate to'}
                placeholder="Delegate Account Address"
                className="text-lightBlue text-sm font-normal"
                onChange={(address) => setTarget(address)}
                size="large"
                skipFormatCheck={true}
                inputClassName={`text-[#7c899b] font-normal text-sm ${
                  targetErr.length > 0 && 'border-red-500'
                }`}
              />
              {/* errors */}

              {targetErr.length > 0 && (
                <div className="-mt-1 text-sm text-red-500">{targetErr}</div>
              )}
              {addressAlert && (
                <Alert
                  className="mb mt-2"
                  showIcon
                  message="The substrate address has been changed to Kusama address."
                />
              )}

              <div className="flex justify-between items-center mt-6 cursor-pointer text-lightBlue">
                Balance
                <span
                  onClick={() => {
                    setBnBalance(availableBalance);
                    form.setFieldValue(
                      'balance',
                      Number(
                        formatedBalance(availableBalance.toString(), unit),
                      ),
                    );
                  }}
                >
                  <Balance
                    address={delegationDashboardAddress}
                    onChange={handleOnBalanceChange}
                  />
                </span>
              </div>

              <BalanceInput
                placeholder={'Enter balance'}
                className="text-lightBlue text-sm font-normal"
                address={delegationDashboardAddress}
                onAccountBalanceChange={handleOnBalanceChange}
                onChange={(balance) => setBnBalance(balance)}
                balance={bnBalance}
                size="middle"
                inputClassName={`text-[#7c899b] text-sm ${
                  balanceErr.length > 0 && 'border-red-500'
                }`}
                noRules={true}
              />
              {/* errors */}
              {balanceErr.length > 0 && (
                <div className="-mt-5 text-sm text-red-500">{balanceErr}</div>
              )}

              <div className="mb-2 border-solid border-white mt-4">
                <label className="text-lightBlue flex items-center text-sm">
                  Conviction
                  <span>
                    <HelperTooltip
                      className="ml-2"
                      text="You can multiply your votes by locking your tokens for longer periods of time."
                    />
                  </span>
                </label>

                <div className="px-[2px] mt-4">
                  <Slider
                    tooltip={{ open: false }}
                    className="text-[12px] mt-[9px]"
                    trackStyle={{ backgroundColor: '#FF49AA' }}
                    onChange={(value: number) => {
                      if (value === 1) {
                        setConviction(0);
                      } else if (value === 2) {
                        setConviction(1);
                        setLockValue(1);
                      } else {
                        setConviction(Number(value - 1));
                        setLockValue(Number(2 ** (value - 2)));
                      }
                    }}
                    step={7}
                    marks={{
                      1: {
                        label: <div>0.1x</div>,
                        style: {
                          color: 'var(--bodyBlue)',
                          fontSize: '12px',
                          marginTop: '16px',
                        },
                      },
                      2: {
                        label: <div>1x</div>,
                        style: {
                          color: 'var(--bodyBlue)',
                          fontSize: '12px',
                          marginTop: '16px',
                        },
                      },
                      3: {
                        label: <div>2x</div>,
                        style: {
                          color: 'var(--bodyBlue)',
                          fontSize: '12px',
                          marginTop: '16px',
                        },
                      },
                      4: {
                        label: <div>3x</div>,
                        style: {
                          color: 'var(--bodyBlue)',
                          fontSize: '12px',
                          marginTop: '16px',
                        },
                      },
                      5: {
                        label: <div>4x</div>,
                        style: {
                          color: 'var(--bodyBlue)',
                          fontSize: '12px',
                          marginTop: '16px',
                        },
                      },
                      6: {
                        label: <div>5x</div>,
                        style: {
                          color: 'var(--bodyBlue)',
                          fontSize: '12px',
                          marginTop: '16px',
                        },
                      },
                      7: {
                        label: <div>6x</div>,
                        style: {
                          color: 'var(--bodyBlue)',
                          fontSize: '12px',
                          marginTop: '16px',
                        },
                      },
                    }}
                    min={1}
                    max={7}
                    defaultValue={1}
                  />
                </div>
              </div>
              <div className="bg-[#F6F7F9] py-[13px] px-[17px] rounded-md flex items-center justify-between track-[0.0025em] mt-4">
                <div className="flex gap-[10px] items-center justify-center text-lightBlue text-sm">
                  {' '}
                  <LockIcon />
                  <span>Locking period</span>
                </div>
                <div className="text-bodyBlue font-medium text-sm flex justify-center items-center">
                  {conviction === 0
                    ? '0.1x voting balance, no lockup period'
                    : `${conviction}x voting balance, locked for ${lock} enactment period`}
                </div>
              </div>
              <div className="mt-6 mb-2 flex justify-between items-center">
                <span className="text-sm text-lightBlue">
                  Selected track(s)
                </span>
                <Popover content={content} placement="topLeft">
                  <Checkbox
                    indeterminate={indeterminate}
                    onChange={onCheckAllChange}
                    checked={checkAll}
                  >
                    Select available tracks
                  </Checkbox>
                </Popover>
              </div>
              {
                <div className="flex flex-wrap gap-2 mt-0 mb-6 ">
                  {checkedTrack && (
                    <div
                      key={checkedTrack?.trackId}
                      className="text-sm text-[#7c899b] py-2 px-3 border-[1px] border-solid border-[#D2D8E0] rounded-[20px] flex justify-center gap-2 items-center"
                    >
                      {checkedTrack?.name}
                    </div>
                  )}
                  {checkedList.length > 0 &&
                    checkedList
                      .filter((item) => item !== checkedTrack?.name)
                      .map((list, index) => (
                        <div
                          key={index}
                          className="text-sm text-[#7c899b] py-2 px-3 border-[1px] border-solid border-[#D2D8E0] rounded-[20px] flex justify-center gap-2 items-center"
                        >
                          {list}
                          <span
                            onClick={() => handleClose(String(list))}
                            className="flex justify-center items-center"
                          >
                            <CrossIcon />
                          </span>
                        </div>
                      ))}
                </div>
              }
            </Form>

            {showAlert && (
              <Alert
                showIcon
                type="info"
                className="mb-4 "
                message={`An approximate fees of ${formatBalance(
                  txFee.toString(),
                  { forceUnit: unit },
                )} will be applied to the transaction`}
              />
            )}
          </div>
        </Spin>
      </Modal>
      <DelegationSuccessPopup
        open={openSuccessPopup}
        setOpen={setOpenSuccessPopup}
        tracks={checkedTrackArr}
        address={target}
        isDelegate={true}
        balance={bnBalance}
        trackNum={trackNum}
        conviction={conviction}
      />
    </>
  );
};

export default styled(DelegateModal)`
  .padding .ant-modal-close {
    margin-top: 4px;
  }
  .padding .ant-modal-close:hover {
    margin-top: 4px;
  }
  .padding .ant-alert-message {
    color: var(--bodyBlue);
    font-size: 14px;
    font-weight: 400;
  }
  .padding .ant-slider-dot {
    height: 12px;
    width: 2px;
    border-radius: 0px !important;
    border-color: #d2d8e0;
    margin-top: -1px;
  }
  .padding .ant-slider-dot-active {
    border-color: var(--pink_primary) !important;
    width: 2px;
    height: 12px;
    border-radius: 0px !important;
    margin-top: -1px;
  }
  .padding .ant-tooltip-open {
    border-color: #d2d8e0 !important;
    margin-top: -1px;
  }
  .padding .ant-slider .ant-slider-rail {
    background-color: #d2d8e0;
    height: 5px;
  }
  .padding .ant-slider .ant-slider-track {
    height: 5px;
    background-color: var(--pink_primary) !important;
  }
  .padding .ant-slider .ant-slider-handle::after {
    height: 25px;
    margin-top: -7px;
    background: var(--pink_primary);
    width: 18px;
    border-radius: 8px !important;
    border: none !important;
    margin-left: -2px;
    box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
  }
  .padding .ant-slider .ant-slider-handle::before {
    border-radius: 8px !important;
    border: none !important;
    box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
  }
`;
