// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import { getActiveProposalsForTrack } from 'pages/api/v1/posts/active-proposals';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import VotingCards from '~src/components/VotingCards';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

interface IBatchVoting {
	data?: IPostsListingResponse;
	error?: string;
	network: string;
	trackDetails: any;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	// const { data, error = '' } = await getActiveProposalsForTrack({
	// 	isExternalApiCall: true,
	// 	network,
	// 	proposalType: ProposalType.OPEN_GOV
	// });

	return {
		props: {
			// data,
			// error,
			network
		}
	};
};

const BatchVoting: FC<IBatchVoting> = (props) => {
	const { network } = props;
	// const { network, data } = props;
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	// console.log(data);

	const random = [
		{
			allowedCommentors: 'all',
			assetId: '1984',
			beneficiaries: [{ address: [Object], amount: '176400000000' }],
			bond: null,
			comments: [],
			content:
				'After delivering the [milesone 1](https://polkadot.subsquare.io/referenda/631) successfully, we had discussions with fellowship members, got feedbacks, made some fixes and improvements. We are proposing to implement milestone 2 to support collectives(fellowship, ambassadors) on polkadot.\n' +
				'![img_v3_02cr_ced218ff-000d-4886-97fd-48a20d7cbabg](https://hackmd.io/_uploads/r1nxy9Xu0.png)\n' +
				'\n' +
				'\n' +
				'## 1. Features\n' +
				'\n' +
				'### Ambassador business support\n' +
				'\n' +
				'From a techinical view, most ambassador businesses is similar with that of fellowship. Both of them includes members mangement, salary management, decision process via referenda. In this proposal we will implement most features for fellowship on [referendum #631](https://polkadot.subsquare.io/referenda/631).\n' +
				'- Basic members information page.\n' +
				'- Members management including demotion/promotion status and various actions.\n' +
				'- Salary system including salary cycles view and various actions.\n' +
				'- Ambassador referenda for collective decision.\n' +
				'\n' +
				'We have to refactor and reorganize most implemented features for fellowship to make them work with multiple instances of collective.\n' +
				'\n' +
				'### Business warnings\n' +
				'\n' +
				'Collective members sumit evidences with expections to retain at their ranks or to be promoted to higher ranks. Failure to handle them may lead to members bumped to lower ranks accidently, or not to be promoted in time.\n' +
				'\n' +
				'Members themselves may forget or fail to check their demotion/promotion status which will lead them fail to submit evidences.\n' +
				'\n' +
				'We propose to implement some components warn:\n' +
				'1. Evidences to be handled for members management.\n' +
				'2. Conspicuous component to show demotion/promotion status to connected members.\n' +
				'3. Notifications when members demotion/promotion period is closed to end.\n' +
				"4. Salary cycle time points warnings. So members won't miss registration and claim.\n" +
				'\n' +
				'### Profile enhancement\n' +
				'\n' +
				"We will be able to see a fellowship/ambassador member's basic info and life cycle on his/her profile page.\n" +
				'\n' +
				'- Rank, activeness, salary status.\n' +
				'- Membership records including promotion, demotion, retain, induction, etc.\n' +
				'- History evidece records for promotion/retain.\n' +
				'- Related referda about this member.\n' +
				'- Salary registration and claim history.\n' +
				'- Statistics about total salary, promotion/demotion times.\n' +
				'\n' +
				'### Statistics\n' +
				'\n' +
				'With this feature we can get to know:\n' +
				'\n' +
				"- How much money totaly we spent for collectives' salary.\n" +
				'- Members ordered by total salary received.\n' +
				'- Members distribution by ranks, salary, etc.\n' +
				'- Promotion/Demotion times by ranks.\n' +
				'\n' +
				'### Sub treasury\n' +
				'\n' +
				'Currently sub treasury is implemented for either fellowship and ambassador. These treasuries will be controlled by fellowship/ambassador members through their referenda mechanism. In this proposal we will implement:\n' +
				'1. Basic status including balance, requesting amount, ongoing/all proposal numbers.\n' +
				'2. History and ongoing proposal list and detail page.\n' +
				'\n' +
				'### Referenda enhancement\n' +
				'\n' +
				'- Collective referenda templates. They can help fellowship/ambassador members quick create referenda.\n' +
				"- Show corresponding evidence info for a ongoing referendum to promote a member or to retain a member at his/her rank. So voters can check the target member's work for vote reference.\n" +
				'- Auto fill context for specified referenda including member rank management referendum and remark referendum.\n' +
				'- Show referenda which connected member is not yet voted.\n' +
				"- Show related referenda on collective member's info card.\n" +
				"- Add a panel to show connected member's vote of a referendum.\n" +
				'\n' +
				'## 2. Budget breakdown\n' +
				'\n' +
				'|  Work   | Estimated hours  | memo |\n' +
				'|  ----  | ----  |  ----  |\n' +
				'| Ambassador business support  | 360  | 3 FTE * 15days |\n' +
				'| Profile info enhancement  | 480 | 3 FTE * 20 days |\n' +
				'| Statistics  | 240 | 3 FTE * 10 days |\n' +
				'| Sub treasury  | 240 | 3 FTE * 10 days |\n' +
				'| Collective referenda enhancement  | 600 | 3 FTE * 25 days |\n' +
				'| Testing  | 40 | 1 FTE * 5 days |\n' +
				'| Total  | 1960 |  |\n' +
				'\n' +
				'- Hour rate $90, total request is $176,400.',
			created_at: '2024-07-16T16:13:30.000000Z',
			curator: null,
			curator_deposit: null,
			deciding: { confirming: null, since: 21676116 },
			decision_deposit_amount: '2000000000000',
			delay: null,
			deposit: null,
			description: null,
			enactment_after_block: null,
			enactment_at_block: 0,
			end: null,
			ended_at: null,
			fee: null,
			hash: '0xd6cb0cd455e4e962f7bdfc6f03096a761a129404d2008d1308d17cd378a42a43',
			history: [],
			identity: null,
			marketMetadata: null,
			method: 'spend',
			origin: 'MediumSpender',
			payee: null,
			pips_voters: [],
			post_id: 1001,
			post_reactions: {
				'👍': { count: 0, userIds: [], usernames: [] },
				'👎': { count: 0, userIds: [], usernames: [] }
			},
			preimageHash: '0xd6cb0cd455e4e962f7bdfc6f03096a761a129404d2008d1308d17cd378a42a43',
			proposalHashBlock: null,
			proposed_call: {
				method: 'spend',
				args: {
					amount: '176400000000',
					assetKind: [Object],
					beneficiary: [Object]
				},
				description: 'See [`Pallet::spend`].',
				section: 'Treasury'
			},
			proposer: '12sNU8BXivMj1xQmcd4T39ugCyHjmhir8jkPqfAw5ZDESrx4',
			requested: '176400000000',
			reward: null,
			status: 'Deciding',
			statusHistory: [
				{
					timestamp: '2024-07-16T16:13:30.000000Z',
					status: 'Submitted',
					block: 21673716
				},
				{
					timestamp: '2024-07-16T20:15:00.000000Z',
					status: 'Deciding',
					block: 21676116
				},
				{
					timestamp: '2024-07-16T16:26:18.001000Z',
					status: 'DecisionDepositPlaced',
					block: 21673841
				}
			],
			submission_deposit_amount: '10000000000',
			submitted_amount: '10000000000',
			subscribers: [],
			tally: { ayes: '0', bareAyes: null, nays: '100000000000', support: '0' },
			timeline: [
				{
					created_at: '2024-07-16T16:13:30.000000Z',
					hash: '0xd6cb0cd455e4e962f7bdfc6f03096a761a129404d2008d1308d17cd378a42a43',
					index: 1001,
					statuses: [Array],
					type: 'ReferendumV2',
					commentsCount: 0
				}
			],
			topic: { id: 1, name: 'Democracy' },
			track_number: 33,
			type: 'ReferendumV2',
			title: 'Subsquare polkadot collectives support milestone 2',
			isSpam: false,
			isSpamReportInvalid: false,
			currentTimeline: {
				commentsCount: 0,
				date: '2024-07-16T16:13:30.000Z',
				firstCommentId: '',
				id: 1,
				index: '1001',
				status: 'Referendum',
				type: 'ReferendumV2'
			},
			spam_users_count: 0
		}
	];

	return (
		<>
			<SEOHead
				title='Batch Voting'
				network={network}
			/>
			<VotingCards trackPosts={random} />
		</>
	);
};

export default BatchVoting;
