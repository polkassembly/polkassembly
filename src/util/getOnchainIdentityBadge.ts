// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import getEncodedAddress from './getEncodedAddress';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';

interface Props{
  network: string;
  api: ApiPromise;
}

const getIsOnchainIdentity = ({ network, api }: Props) => {

  const address = localStorage.getItem('identityAddress');
  const identityForm = localStorage.getItem('identityForm');
  const encoded_addr = address ? getEncodedAddress(address, network) : '';
  console.log(identityForm, address)
  if(!identityForm || !address) return false;

  api.derive.accounts.info(encoded_addr, (info: DeriveAccountInfo):any => {
    console.log(info.identity?.judgements.length === 0);
    return Boolean(info.identity?.judgements.length === 0);
  })
    .catch(() => false);

};
export default getIsOnchainIdentity;