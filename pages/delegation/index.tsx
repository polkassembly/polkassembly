// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import React, { useEffect } from 'react';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import DelegationDashboard from '~src/components/DelegationDashboard';
import DelegationDashboardEmptyState from '~assets/icons/delegation-empty-state.svg';
import CopyContentIcon from '~assets/icons/content-copy.svg';
import copyToClipboard from 'src/util/copyToClipboard';
import { message } from 'antd';
import { useNetworkContext } from '~src/context';
import SEOHead from '~src/global/SEOHead';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const network = getNetworkFromReqHeaders(req.headers);
  return { props: { network } };
};

const Delegation = (props: { network: string }) => {
  const { setNetwork } = useNetworkContext();
  const { asPath } = useRouter();

  const handleCopylink = () => {
    const url = `https://${props.network}.polkassembly.io${
      asPath.split('#')[0]
    }`;

    copyToClipboard(url);

    message.success('Link copied to clipboard');
  };

  useEffect(() => {
    setNetwork(props.network);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SEOHead title="Delegation Dashboard" network={props.network} />
      <div className="hidden sm:block">
        <DelegationDashboard />
      </div>
      <div className="sm:hidden w-full">
        <h1 className="text-bodyBlue text-center text-2xl font-semibold">
          Delegation Dashboard
        </h1>
        <div className="flex flex-col justify-center items-center mt-12">
          <DelegationDashboardEmptyState />
          <p className="text-center text-bodyBlue text-base mt-6">
            Please visit Delegation Dashboard from your Dekstop computer
          </p>
          <button
            className="mt-5 px-3.5 py-1.5 rounded-full text-bodyBlue bg-transparent border border-[#D2D8E0] border-solid flex justify-center items-center"
            onClick={() => {
              handleCopylink();
            }}
          >
            Copy Page Link <CopyContentIcon className="ml-1" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Delegation;
