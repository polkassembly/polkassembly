// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { ProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';
import { getNetworkFromReqHeaders } from '~src/api-utils';

const DOMAIN = 'polkassembly.io';
const PROPOSAL_TYPES = [
  ProposalType.DISCUSSIONS,
  ProposalType.DEMOCRACY_PROPOSALS,
  ProposalType.TECH_COMMITTEE_PROPOSALS,
  ProposalType.TREASURY_PROPOSALS,
  ProposalType.REFERENDUMS,
  ProposalType.FELLOWSHIP_REFERENDUMS,
  ProposalType.COUNCIL_MOTIONS,
  ProposalType.BOUNTIES,
  ProposalType.TIPS,
  ProposalType.CHILD_BOUNTIES,
  ProposalType.OPEN_GOV,
  ProposalType.REFERENDUM_V2,
  ProposalType.GRANTS,
  ProposalType.ANNOUNCEMENT,
  ProposalType.ALLIANCE_MOTION,
];

const SLUG: { [key: string]: string } = {
  [ProposalType.DISCUSSIONS]: 'post',
  [ProposalType.DEMOCRACY_PROPOSALS]: 'proposal',
  [ProposalType.TECH_COMMITTEE_PROPOSALS]: 'tech',
  [ProposalType.TREASURY_PROPOSALS]: 'treasury',
  [ProposalType.REFERENDUMS]: 'referendum',
  [ProposalType.FELLOWSHIP_REFERENDUMS]: 'member-referenda',
  [ProposalType.COUNCIL_MOTIONS]: 'motion',
  [ProposalType.BOUNTIES]: 'bounty',
  [ProposalType.CHILD_BOUNTIES]: 'child_bounty',
  [ProposalType.TIPS]: 'tip',
  [ProposalType.REFERENDUM_V2]: 'referenda',
  [ProposalType.GRANTS]: 'grant',
};

const GOV2: { [key: string]: boolean } = {
  kusama: true,
};

const generateSiteMap = (network: string, urls: string[]): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
		<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
			<url>
				<loc>https://${network}.${DOMAIN}</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/discussions</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/calendar</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/proposals</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/referenda</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/treasury-proposals</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/bounties</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/child_bounties</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/tips</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/motions</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/council</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/tech-comm-proposals</loc>
			</url>
			${
        GOV2[network]
          ? `
			<url>
				<loc>https://${network}.${DOMAIN}/opengov</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/delegation</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/preimages</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/root</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/staking-admin</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/auction-admin</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/lease-admin</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/general-admin</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/referendum-canceller</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/referendum-killer</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/treasurer</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/small-tipper</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/big-tipper</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/small-spender</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/medium-spender</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/big-spender</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/fellowship</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/member-referenda</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/whitelisted-caller</loc>
			</url>
			<url>
				<loc>https://${network}.${DOMAIN}/fellowship-admin</loc>
			</url>
			`
          : ''
      }
			${urls.map((url) => `<url><loc>${url}</loc></url>`).join('\n')}
	 </urlset>
 `;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const network = getNetworkFromReqHeaders(req.headers);

  const allUrls = [];

  for (const proposalType of PROPOSAL_TYPES) {
    const docs = await firestore_db
      .collection('networks')
      .doc(network)
      .collection('post_types')
      .doc(proposalType)
      .collection('posts')
      .listDocuments();
    const urls = docs.map(
      (doc) => `https://${network}.${DOMAIN}/${SLUG[proposalType]}/${doc.id}`,
    );
    allUrls.push(...urls);
  }

  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap(network, allUrls);

  // we set the response to be compressed and have a specific header
  res.setHeader('Content-Type', 'text/xml');
  // we send the XML to the browser
  res.write(sitemap);
  res.end();
  return { props: {} };
};

const Sitemap = () => {};

export default Sitemap;
