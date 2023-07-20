// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CloseOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import React, { FC, useState } from 'react';
import Address from '~src/ui-components/Address';
import { WalletIcon } from '~src/ui-components/CustomIcons';

interface IAddressesProps {
  addresses: string[];
}

const Addresses: FC<IAddressesProps> = (props) => {
  const { addresses } = props;
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen((prev) => !prev);
  if (addresses.length === 0) return null;
  return (
    <>
      <div>
        <div className="flex items-center gap-x-[6.5px] font-semibold text-sm text-white">
          <WalletIcon className="text-[#FFBF60] text-base" />
          <span>View addresses</span>
          {addresses.length > 5 ? (
            <button
              onClick={toggleOpen}
              className="flex items-center justify-center ml-auto underline underline-offset-1 text-[#FFbF60] bg-transparent border-none outline-none font-medium text-xs cursor-pointer"
            >
              View All
            </button>
          ) : null}
        </div>
        <div className="flex flex-col gap-y-4 mt-[17px]">
          {addresses &&
            Array.isArray(addresses) &&
            addresses.slice(0, 5).map((address) => {
              return (
                <Address
                  disableAddressClick={true}
                  disableHeader={true}
                  identiconSize={20}
                  ethIdenticonSize={28}
                  shortenAddressLength={10}
                  key={address}
                  className="text-white"
                  address={address}
                />
              );
            })}
        </div>
        <Modal
          title={
            <h3 className="font-semibold text-xl text-[#1D2632]">Addresses</h3>
          }
          closeIcon={<CloseOutlined className="text-[#485F7D] text-sm" />}
          onCancel={toggleOpen}
          open={open}
          footer={[]}
        >
          <div>
            <p className="mt-4">Accounts</p>
            <div className="flex flex-col gap-y-5 px-3">
              {addresses &&
                Array.isArray(addresses) &&
                addresses.slice(0, 5).map((address) => {
                  return (
                    <Address
                      identiconSize={28}
                      ethIdenticonSize={34}
                      key={address}
                      isShortenAddressLength={false}
                      className="text-[#1D2632] text-sm"
                      address={address}
                    />
                  );
                })}
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Addresses;
