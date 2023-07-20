// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useEffect } from 'react';

interface INFTsProps {
  loading: boolean;
  onCancel: React.MutableRefObject<() => void>;
  onSave: React.MutableRefObject<() => Promise<void>>;
  open: boolean;
}

const NFTs: FC<INFTsProps> = (props) => {
  const { onCancel, onSave } = props;
  useEffect(() => {
    onCancel.current = () => {};
    onSave.current = async () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div>NFTs</div>;
};

export default NFTs;
