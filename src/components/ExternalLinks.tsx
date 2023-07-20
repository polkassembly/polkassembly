// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import { useNetworkContext } from '~src/context';
import { chainProperties } from '~src/global/networkConstants';

import { ProposalType } from '~src/global/proposalType';
import {
  isCereSupport,
  isExplorerSupport,
  isPolkaholicSupport,
  isSubscanSupport,
} from '~src/util/subscanCheck';

interface IExternalLinksProps {
  className?: string;
  proposalType: ProposalType;
  onchainId?: string | number | null | undefined;
  blockNumber?: number;
}

enum EService {
  EXPLORER = 'explorer',
  SUBSCAN = 'subscan',
  POLKAHOLIC = 'polkaholic',
  CERE = 'cere',
}

const getService = (network: string) => {
  if (isSubscanSupport(network)) {
    return EService.SUBSCAN;
  } else if (isExplorerSupport(network)) {
    return EService.EXPLORER;
  } else if (isPolkaholicSupport(network)) {
    return EService.POLKAHOLIC;
  } else if (isCereSupport(network)) {
    return EService.CERE;
  }
};

const ExternalLinks: FC<IExternalLinksProps> = (props) => {
  const { className, onchainId, proposalType, blockNumber } = props;
  const { network } = useNetworkContext();

  const serviceMap = {
    [EService.SUBSCAN]: (network: string) => {
      let url = '';
      let host = chainProperties[network].externalLinks;

      if (host.includes('subscan')) {
        host = host.replace('.api', '');
      }

      if (proposalType === ProposalType.REFERENDUMS) {
        url = `${host}/referenda/${onchainId}`;
      }
      if (proposalType === ProposalType.DEMOCRACY_PROPOSALS) {
        url = `${host}/democracy_proposal/${onchainId}`;
      }
      if (proposalType === ProposalType.COUNCIL_MOTIONS) {
        url = `${host}/council/${onchainId}`;
      }
      if (proposalType === ProposalType.TREASURY_PROPOSALS) {
        url = `${host}/treasury/${onchainId}`;
      }
      if (proposalType === ProposalType.TECH_COMMITTEE_PROPOSALS) {
        url = `${host}/tech/${onchainId}`;
      }
      if (
        [
          ProposalType.REFERENDUM_V2.toString(),
          ProposalType.OPEN_GOV.toString(),
        ].includes(proposalType)
      ) {
        url = `${host}/referenda_v2/${onchainId}`;
      } else if (
        ProposalType.FELLOWSHIP_REFERENDUMS.toString() === proposalType
      ) {
        url = `${host}/fellowship/${onchainId}`;
      }

      return {
        label: 'Show in Subscan',
        url,
      };
    },
    [EService.EXPLORER]: (network: string) => {
      let url = '';
      const host = chainProperties[network].externalLinks + '/blocks';

      if (blockNumber !== undefined && host) {
        url = `${host}/${blockNumber}`;
      }

      return {
        label: 'Show in Explorer',
        url,
      };
    },
    [EService.POLKAHOLIC]: (network: string) => {
      let url = '';
      const host = chainProperties[network].externalLinks + '/block/' + network;

      if (blockNumber !== undefined && host) {
        url = `${host}/${blockNumber}`;
      }

      return {
        label: 'Show in Polkaholic',
        url,
      };
    },
    [EService.CERE]: (network: string) => {
      let url = '';
      const host = chainProperties[network].externalLinks + '/block';

      if (blockNumber !== undefined && host) {
        url = `${host}?blockNumber=${blockNumber}`;
      }

      return {
        label: 'Show in Cere',
        url,
      };
    },
  };

  const getUrlAndLabel = (
    service: EService,
  ):
    | {
        label: string;
        url: string;
      }
    | undefined => {
    return (serviceMap as any)[service](network);
  };

  const service = getService(network);
  if (!service) return null;
  const urlAndLabel = getUrlAndLabel(service);
  if (!urlAndLabel || !urlAndLabel.url) return null;

  const { label, url } = urlAndLabel;
  return (
    <div className={className}>
      <div>
        <a
          href={url}
          rel="noopener noreferrer"
          target="_blank"
          className="text-pink_primary"
        >{`-> ${label}`}</a>
      </div>
    </div>
  );
};

export default ExternalLinks;
