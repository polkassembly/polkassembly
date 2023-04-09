// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

import CubeSVG from '~assets/icons/cube.svg';
import DiscordSVG from '~assets/icons/discord.svg';
import GithubSVG from '~assets/icons/github.svg';
import RedditSVG from '~assets/icons/reddit.svg';
import TelegramSVG from '~assets/icons/telegram.svg';
import TwitterSVG from '~assets/icons/twitter.svg';
import WalletSVG from '~assets/icons/wallet.svg';
import IdentitySVG from '~assets/icons/identity.svg';
import ProfileSVG from '~assets/icons/profile.svg';
import EmailSVG from '~assets/icons/email.svg';
import RiotSVG from '~assets/icons/riot.svg';
import SignalTowerSVG from '~assets/icons/signal-tower.svg';
import EditSVG from '~assets/icons/edit.svg';
import SyncSVG from '~assets/icons/sync.svg';
import PreparePeriodSVG from '~assets/icons/prepare.svg';
import DecisionPeriodSVG from '~assets/icons/decision.svg';
import EnactmentPeriodSVG from '~assets/icons/enactment.svg';
import ArrowDownSVG from '~assets/icons/arrow-down.svg';
import VotingHistorySVG from '~assets/icons/voting-history.svg';
import ThresholdGraphSVG from '~assets/icons/threshold-graph.svg';
import BountiesSVG from '~assets/sidebar/bounties.svg';
import CalendarSVG from '~assets/sidebar/calendar.svg';
import DemocracyProposalsSVG from '~assets/sidebar/democracy_proposals.svg';
import DiscussionsSVG from '~assets/sidebar/discussions.svg';
import AuctionAdminSVG from '~assets/sidebar/gov2_auction_admin.svg';
import FellowshipGroupSVG from '~assets/sidebar/gov2_fellowship_group.svg';
import GovernanceGroupSVG from '~assets/sidebar/gov2_governance_group.svg';
import PreimagesSVG from '~assets/sidebar/gov2_preimages.svg';
import RootSVG from '~assets/sidebar/gov2_root.svg';
import StakingAdminSVG from '~assets/sidebar/gov2_staking_admin.svg';
import TreasuryGroupSVG from '~assets/sidebar/gov2_treasury_group.svg';
import MembersSVG from '~assets/sidebar/members.svg';
import MotionsSVG from '~assets/sidebar/motions.svg';
import NewsSVG from '~assets/sidebar/news.svg';
import OverviewSVG from '~assets/sidebar/overview.svg';
import ParachainsSVG from '~assets/sidebar/parachains.svg';
import ReferendaSVG from '~assets/sidebar/referenda.svg';
import TipsSVG from '~assets/sidebar/tips.svg';
import TreasuryProposalsSVG from '~assets/sidebar/treasury_proposals.svg';
import AgainstSVG from '~assets/icons/against.svg';
import SlightlyAgainstSVG from '~assets/icons/slightly-against.svg';
import NeutralSVG from '~assets/icons/neutral.svg';
import SlightlyForSVG from '~assets/icons/slightly-for.svg';
import ForSVG from '~assets/icons/for.svg';
import AgainstUnfilledSVG from '~assets/icons/against-unfilled.svg';
import SlightlyAgainstUnfilledSVG from '~assets/icons/slightly-against-unfilled.svg';
import NeutralUnfilledSVG from '~assets/icons/neutral-unfilled.svg';
import SlightlyForUnfilledSVG from '~assets/icons/slightly-for-unfilled.svg';
import ForUnfilleSVG from '~assets/icons/for-unfilled.svg';

export const OverviewIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={OverviewSVG} {...props} />
);

export const DiscussionsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={DiscussionsSVG} {...props} />
);

export const NewsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={NewsSVG} {...props} />
);

export const TreasuryProposalsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={TreasuryProposalsSVG} {...props} />
);

export const BountiesIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={BountiesSVG} {...props} />
);

export const TipsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={TipsSVG} {...props} />
);

export const DemocracyProposalsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={DemocracyProposalsSVG} {...props} />
);

export const MembersIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={MembersSVG} {...props} />
);

export const MotionsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={MotionsSVG} {...props} />
);

export const ParachainsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={ParachainsSVG} {...props} />
);

export const ReferendaIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={ReferendaSVG} {...props} />
);

export const CalendarIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={CalendarSVG} {...props} />
);

export const DiscordIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={DiscordSVG} {...props} />
);

export const GithubIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={GithubSVG} {...props} />
);

export const CubeIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={CubeSVG} {...props} />
);

export const RedditIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={RedditSVG} {...props} />
);

export const TelegramIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={TelegramSVG} {...props} />
);

export const TwitterIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={TwitterSVG} {...props} />
);

export const WalletIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={WalletSVG} {...props} />
);

export const IdentityIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={IdentitySVG} {...props} />
);

export const ProfileIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={ProfileSVG} {...props} />
);

export const EmailIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={EmailSVG} {...props} />
);

export const RiotIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={RiotSVG} {...props} />
);

export const SignalTowerIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={SignalTowerSVG} {...props} />
);

export const EditIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={EditSVG} {...props} />
);

export const SyncIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={SyncSVG} {...props} />
);

export const PreparePeriodIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={PreparePeriodSVG} {...props} />
);

export const DecisionPeriodIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={DecisionPeriodSVG} {...props} />
);

export const EnactmentPeriodIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={EnactmentPeriodSVG} {...props} />
);

export const ArrowDownIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={ArrowDownSVG} {...props} />
);

export const ThresholdGraphIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={ThresholdGraphSVG} {...props} />
);

export const VotingHistoryIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={VotingHistorySVG} {...props} />
);

export const RootIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={RootSVG} {...props} />
);

export const AuctionAdminIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={AuctionAdminSVG} {...props} />
);

export const StakingAdminIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={StakingAdminSVG} {...props} />
);

export const GovernanceGroupIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={GovernanceGroupSVG} {...props} />
);

export const TreasuryGroupIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={TreasuryGroupSVG} {...props} />
);

export const FellowshipGroupIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={FellowshipGroupSVG} {...props} />
);
export const PreimagesIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={PreimagesSVG} {...props} />
);
export const AgainstIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={AgainstSVG} {...props} />
);
export const AgainstUnfilledIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={AgainstUnfilledSVG} {...props} />
);
export const SlightlyAgainstIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={SlightlyAgainstSVG} {...props} />
);
export const SlightlyAgainstUnfilledIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={SlightlyAgainstUnfilledSVG} {...props} />
);
export const NeutralIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={NeutralSVG} {...props} />
);
export const NeutralUnfilledIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={NeutralUnfilledSVG} {...props} />
);
export const SlightlyForIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={SlightlyForSVG} {...props} />
);
export const SlightlyForUnfilledIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={SlightlyForUnfilledSVG} {...props} />
);
export const ForIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={ForSVG} {...props} />
);
export const ForUnfilledIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={ForUnfilleSVG} {...props} />
);
