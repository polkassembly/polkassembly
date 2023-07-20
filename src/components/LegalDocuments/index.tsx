// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Markdown from 'src/ui-components/Markdown';

import getPrivacyPolicy from '~assets/privacy-policy';
import getTermsAndConditions from '~assets/terms-and-conditions';
import TOW from '~assets/terms-of-website';
import { useNetworkContext } from '~src/context';

interface Props {
  md: string;
}

const MdScreen = ({ md }: Props) => {
  return (
    <section>
      <article className="bg-white p-12 rounded-md shadow-md">
        <Markdown className="markdown" md={md} />
      </article>
    </section>
  );
};

const StyledMdScreen = MdScreen;

export const TermsAndConditions = () => {
  const { network } = useNetworkContext();
  return <StyledMdScreen md={getTermsAndConditions(network)} />;
};
export const PrivacyPolicy = () => {
  const { network } = useNetworkContext();
  return <StyledMdScreen md={getPrivacyPolicy(network)} />;
};
export const TermsOfWebsite = () => <StyledMdScreen md={TOW} />;
