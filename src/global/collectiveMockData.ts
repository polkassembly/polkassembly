// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const allianceAllPost = {
	data: {
		count: 2,
		posts: [
			{
				created_at: '2023-04-17T06:46:48.000000Z',
				description: null,
				hash: null,
				origin: null,
				parent_bounty_index: null,
				post_id: 298,
				proposer: 'GqC37KSFFeGAoL7YxSeP1YDwr85WJvLmDDQiSaprTDAm8Jj',
				status: 'Approved',
				title: '',
				track_number: null,
				type: 'Alliance'
			},
			{
				created_at: '2023-04-17T06:46:48.000000Z',
				description: null,
				hash: null,
				origin: null,
				parent_bounty_index: null,
				post_id: 298,
				proposer: 'GqC37KSFFeGAoL7YxSeP1YDwr85WJvLmDDQiSaprTDAm8Jj',
				status: 'Approved',
				title: '',
				track_number: null,
				type: 'Discussion'
			}
		]
	},
	error: null,
	status: 200
};

export const allianceDiscussionsPost = {
	data: {
		count: 1,
		posts: [
			{
				created_at: '2023-04-17T06:46:48.000000Z',
				description: null,
				hash: null,
				origin: null,
				parent_bounty_index: null,
				post_id: 298,
				proposer: 'GqC37KSFFeGAoL7YxSeP1YDwr85WJvLmDDQiSaprTDAm8Jj',
				status: 'Approved',
				title: '',
				track_number: null,
				type: 'TreasuryProposal'
			}
		]
	},
	error: null,
	status: 200
};

export const announcements = [
	{
		codec: '13Z6...pH9u',
		comments_count: 0,
		created_at: '2022-11-22T22:03:24.020000Z',
		curator: null,
		description: null,
		end: null,
		hash: {
			code: '0x25023305e62674493',
			digest:
				'0x25023305e626744936706039a8b800933dbf08ea4dea9a44c28003103239c536'
		},
		method: 'batch_all',
		parent_bounty_index: null,
		post_id: 114,
		post_reactions: {
			'👍': 0,
			'👎': 0
		},
		proposer: 'GkjwoJReFDDG9NoZyJt7U18PUv28fbTgyRSJ5gLKiaFg3dG',
		status: 'Tabled',
		title: null,
		topic: { id: 1, name: 'Democracy' },
		type: 'Announcements',
		user_id: 2067,
		version: 'V2'
	}
];

export const motions = [
	{
		comments_count: 0,
		created_at: '2022-11-16T14:16:06.011000Z',
		curator: null,
		description: null,
		end: null,
		hash: '0x73b171097105d957e2daa1416053e227c5f3f968ae4e5ddf33e03704b0534caa',
		parent_bounty_index: null,
		post_id: 577,
		post_reactions: {
			'👍': 0,
			'👎': 0
		},
		proposer: 'HqRcfhH8VXMhuCk5JXe28WMgDDuW9MVDVNofe1nnTcefVZn',
		status: 'Executed',
		title:
			'Statemine Collator Update - Reduce invulnerables from four to two and increase public collators from four to eight',
		topic: { id: 1, name: 'Democracy' },
		type: 'CouncilMotion',
		user_id: 427
	}
];

export const allianceMotion = {
	count: 2,
	post: [{
		'comments_count': 0,
		'created_at': '2022-12-07T08:57:36.014000Z',
		'curator': null,
		'description': null,
		'end': null,
		'hash': '0xec00824f22f2432d0bb2ce5c6f380356a4202842da23e0ab458c34d49235ed87',
		'parent_bounty_index': null,
		'post_id': 583,
		'post_reactions': {
			'👍': 0,
			'👎': 0
		},
		'proposer': 'GLVeryFRbg5hEKvQZcAnLvXZEXhiYaBjzSDwrXBXrfPF7wj',
		'status': 'Executed',
		'title': 'Runtime v9340 Upgrade On Kusama: Fixing OpenGov Parameters and more!',
		'topic': {
			'id': 2,
			'name': 'Council'
		},
		'type': 'CouncilMotion',
		'user_id': 78
	}, {
		'comments_count': 0,
		'created_at': '2022-12-07T08:57:36.014000Z',
		'curator': null,
		'description': null,
		'end': null,
		'hash': '0xec00824f22f2432d0bb2ce5c6f380356a4202842da23e0ab458c34d49235ed87',
		'parent_bounty_index': null,
		'post_id': 583,
		'post_reactions': {
			'👍': 0,
			'👎': 0
		},
		'proposer': 'GLVeryFRbg5hEKvQZcAnLvXZEXhiYaBjzSDwrXBXrfPF7wj',
		'status': 'Executed',
		'title': 'Runtime v9340 Upgrade On Kusama: Fixing OpenGov Parameters and more!',
		'topic': {
			'id': 2,
			'name': 'Council'
		},
		'type': 'CouncilMotion',
		'user_id': 78
	}]
};

export const allianceMotionPost = {
	'bond': null,
	'comments': [],
	'content': "The proposal aims to upgrade Kusama's runtime to [v9340](https://github.com/paritytech/polkadot/releases/tag/v0.9.34): more information about Gov2 can be found in the release notes.\n\n**Runtime**\n\n\\[S\\] ✅ audited [#12310](https://github.com/paritytech/substrate/pull/12310) Low - Asset pallet: support repeated destroys to safely destroy large assets\n\n\\[S\\] ⏳ pending non-critical audit [#12730](https://github.com/paritytech/substrate/pull/12730) Low - Allow alliance fellows to give up voting rights\n\n\\[P\\] ✅ trivial [#6326](https://github.com/paritytech/polkadot/pull/6326) Low - Add collectives as trusted teleporter\n\n\\[P\\] ✅ trivial [#6366](https://github.com/paritytech/polkadot/pull/6366) Low - OpenGov: Proxy definitions\n\n\\[S\\] ✅ trivial [#12808](https://github.com/paritytech/substrate/pull/12808) Low - Bounties use SpendOrigin\n\n\\[S\\] ✅ trivial [#12610](https://github.com/paritytech/substrate/pull/12610) Low - Non-interactive staking\n\n\\[S\\] ✅ trivial [#12842](https://github.com/paritytech/substrate/pull/12842) Low - OpenGov: abstentions\n\n\\[P\\] ✅ trivial [#6390](https://github.com/paritytech/polkadot/pull/6390) Low - Allow Root with OpenGov origins\n\n\\[S\\] [#12848](https://github.com/paritytech/substrate/pull/12848) Low - Add `with_weight` extrinsic\n\n\\[P\\] ✅ trivial [#6372](https://github.com/paritytech/polkadot/pull/6372) Low - OpenGov: Kusama tweaks\n\n\nProposal hash: `0x0debc0e862468363f53cf1ea4d451ec2fdfc4aeb37a3189354df9597636c55b9`\n\nNote this proposal is submitted with `set_storage` call, not `set_code` call (more info on why `set_code` won't work can be found on [this post](https://polkadot.polkassembly.io/motion/306)).\n\nPreimage:\n\n![](https://i.ibb.co/bbKw1tx/Screenshot-2022-12-07-at-09-53-08.png)\n\nYou can review the hash and changes in the release notes and use `SRTool` to verify the proposal hash - make sure to vote at your convenience! This proposal is submitted as an **external motion**: meaning after the Council vote, the community will need to vote on the proposal in the referenda queue.",
	'created_at': '2022-12-07T08:57:36.014000Z',
	'curator': null,
	'curator_deposit': null,
	'deciding': null,
	'delay': null,
	'deposit': null,
	'description': null,
	'enactment_after_block': null,
	'enactment_at_block': null,
	'end': null,
	'ended_at': '2022-12-07T12:20:48.014000Z',
	'fee': null,
	'hash': '0xec00824f22f2432d0bb2ce5c6f380356a4202842da23e0ab458c34d49235ed87',
	'last_edited_at': '2022-12-07T17:28:31.619Z',
	'member_count': 10,
	'method': 'external_propose_majority',
	'motion_method': 'external_propose_majority',
	'origin': null,
	'payee': null,
	'post_id': 583,
	'post_reactions': {
		'👍': {
			'count': 0,
			'usernames': []
		},
		'👎': {
			'count': 0,
			'usernames': []
		}
	},
	'proposal_arguments': {
		'args': {
			'proposal': {
				'hash': '0x0debc0e862468363f53cf1ea4d451ec2fdfc4aeb37a3189354df9597636c55b9',
				'len': 0
			},
			'method': 'external_propose_majority'
		},
		'description': 'Schedule a majority-carries referendum to be tabled next once it is legal to schedule\nan external referendum.\n\nThe dispatch of this call must be `ExternalMajorityOrigin`.\n\n- `proposal_hash`: The preimage hash of the proposal.\n\nUnlike `external_propose`, blacklisting has no effect on this and it may replace a\npre-scheduled `external_propose` call.\n\nWeight: `O(1)`',
		'section': 'Democracy'
	},
	'proposer': 'GLVeryFRbg5hEKvQZcAnLvXZEXhiYaBjzSDwrXBXrfPF7wj',
	'reward': null,
	'status': 'Executed',
	'statusHistory': [{
		'block': 15652065,
		'status': 'Proposed',
		'timestamp': '2022-12-07T08:57:36.014000Z'
	}, {
		'block': 15654088,
		'timestamp': '2022-12-07T12:20:48.014000Z',
		'status': 'Closed'
	}, {
		'block': 15654088,
		'timestamp': '2022-12-07T12:20:48.014000Z',
		'status': 'Approved'
	}, {
		'block': 15654088,
		'timestamp': '2022-12-07T12:20:48.014000Z',
		'status': 'Executed'
	}],
	'tally': null,
	'timeline': [{
		'created_at': '2022-12-07T08:57:36.014000Z',
		'hash': '0xec00824f22f2432d0bb2ce5c6f380356a4202842da23e0ab458c34d49235ed87',
		'index': 583,
		'statuses': [{
			'status': 'Proposed',
			'timestamp': '2022-12-07T08:57:36.014000Z',
			'block': 15652065
		}, {
			'status': 'Closed',
			'timestamp': '2022-12-07T12:20:48.014000Z',
			'block': 15654088
		}, {
			'status': 'Approved',
			'timestamp': '2022-12-07T12:20:48.014000Z',
			'block': 15654088
		}, {
			'status': 'Executed',
			'timestamp': '2022-12-07T12:20:48.014000Z',
			'block': 15654088
		}],
		'type': 'CouncilMotion'
	}, {
		'created_at': '2022-12-07T13:11:42.018000Z',
		'hash': '0xf2259c7602ce03781a9fb184ebeccf00f0c91a28da24c2d9f29355786c681c0a',
		'index': 169,
		'statuses': [{
			'status': 'Proposed',
			'timestamp': '2022-12-07T13:11:42.018000Z',
			'block': 15654597
		}, {
			'status': 'Closed',
			'timestamp': '2022-12-07T13:42:42.012000Z',
			'block': 15654906
		}, {
			'status': 'Approved',
			'timestamp': '2022-12-07T13:42:42.012000Z',
			'block': 15654906
		}, {
			'status': 'Executed',
			'timestamp': '2022-12-07T13:42:42.012000Z',
			'block': 15654906
		}],
		'type': 'TechCommitteeProposal'
	}, {
		'created_at': '2022-12-07T13:42:42.012000Z',
		'hash': '0x0debc0e862468363f53cf1ea4d451ec2fdfc4aeb37a3189354df9597636c55b9',
		'index': 254,
		'statuses': [{
			'status': 'Started',
			'timestamp': '2022-12-07T13:42:42.012000Z',
			'block': 15654906
		}, {
			'status': 'Passed',
			'timestamp': '2022-12-07T16:42:54.013000Z',
			'block': 15656706
		}],
		'type': 'Referendum'
	}],
	'topic': {
		'name': 'Council',
		'id': 2
	},
	'track_number': null,
	'type': 'CouncilMotion',
	'motion_votes': [{
		'voter': 'Hh6rSbzWy7Qni97XMnN7p42Hf4G2UpZohiEwsJKoYTr8BmL',
		'decision': 'yes'
	}, {
		'voter': 'DAUrb4UVvwpYxbx6jTVqMquCW2QuafKcFCkgEpnYBcbwaRQ',
		'decision': 'yes'
	}, {
		'voter': 'Etj64GQ5Mzm98HijdnvqjxMyK8xemPtLTpWdnwEiEvFygJa',
		'decision': 'yes'
	}, {
		'voter': 'FcxNWVy5RESDsErjwyZmPCW6Z8Y3fbfLzmou34YZTrbcraL',
		'decision': 'yes'
	}, {
		'voter': 'HqRcfhH8VXMhuCk5JXe28WMgDDuW9MVDVNofe1nnTcefVZn',
		'decision': 'yes'
	}, {
		'voter': 'Gth5jQA6v9EFbpqSPgXcsvpGSrbTdWwmBADnqa36ptjs5m5',
		'decision': 'yes'
	}, {
		'voter': 'JFArxqV6rqPSwBok3zQDnj5jL6vwsZQDwYXXqb1cFygnYVt',
		'decision': 'yes'
	}, {
		'voter': 'DbF59HrqrrPh9L2Fi4EBd7gn4xFUSXmrE6zyMzf3pETXLvg',
		'decision': 'yes'
	}, {
		'voter': 'J9nD3s7zssCX7bion1xctAF6xcVexcpy2uwy4jTm9JL8yuK',
		'decision': 'yes'
	}, {
		'voter': 'GLVeryFRbg5hEKvQZcAnLvXZEXhiYaBjzSDwrXBXrfPF7wj',
		'decision': 'yes'
	}],
	'title': 'Runtime v9340 Upgrade On Kusama: Fixing OpenGov Parameters and more!',
	'user_id': 78
};