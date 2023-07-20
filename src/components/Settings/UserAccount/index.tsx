// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import OldAccount from '~src/components/Settings/Account';
import Delete from '~src/components/Settings/Delete';
import Unlock from '~src/components/Settings/Unlock';
import ProfileSettings from './Profile';

export default function UserAccount({ network }: { network: string }) {
  return (
    <div className="flex flex-col gap-6">
      <ProfileSettings />
      <OldAccount />
      <Unlock network={network} />
      <Delete />
    </div>
  );
}
