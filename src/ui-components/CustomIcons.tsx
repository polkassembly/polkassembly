// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';
import MailSVG from '~assets/icons/mailIcon.svg';
import WhiteMailSVG from '~assets/icons/mailIconWhite.svg';
import PolkasafeWhiteIconSVG from '~assets/polkasafe-white-logo.svg';
import CautionIcon from '~assets/icons/Caution 2.svg';
import SignupIcon from '~assets/icons/userSignup.svg';
import RetrySVG from '~assets/icons/Refresh.svg';
import OpenAiSVG from '~assets/icons/openai.svg';
import AiStarSVG from '~assets/icons/ai-star.svg';
import SummaryModalCloseSVG from '~assets/icons/summary-modal-close.svg';
import CloseSVG from '~assets/icons/close.svg';
import OpenGovBannerSVG from '~assets/icons/opengov_banner.svg';
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
import SignalTowerSVG from '~assets/icons/signal-tower.svg';
import EditSVG from '~assets/profile/profile-edit.svg';
import SyncSVG from '~assets/icons/sync.svg';
import PreparePeriodSVG from '~assets/icons/prepare.svg';
import DecisionPeriodSVG from '~assets/icons/decision.svg';
import EnactmentPeriodSVG from '~assets/icons/enactment.svg';
import RightArrowSVG from '~assets/icons/right-arrow.svg';
import CastVoteSVG from '~assets/icons/cast-vote.svg';
import VoteCalculationSVG from '~assets/icons/vote-calculation.svg';
import VoteAmountSVG from '~assets/icons/vote-amount.svg';
import ConvictionPeriodSVG from '~assets/icons/conviction-period.svg';
import LikeDislikeSVG from '~assets/icons/like-dislike.svg';
import ArrowDownSVG from '~assets/icons/arrow-down.svg';
import VotingHistorySVG from '~assets/icons/voting-history.svg';
import ThresholdGraphSVG from '~assets/icons/threshold-graph.svg';
import PostEditSVG from '~assets/icons/post-edit.svg';
import PostLinkingSVG from '~assets/icons/post-linking.svg';
import WarningMessageSVG from '~assets/icons/warning-message.svg';
import BountiesSVG from '~assets/sidebar/treasury-bounties-icon.svg';
import ChildBountiesSVG from '~assets/sidebar/treasury-child-bounties-icon.svg';
import TechCommProposalSVG from '~assets/sidebar/tech-comm-proposals-icon.svg';
import CalendarSVG from '~assets/sidebar/calendar-icon.svg';
import BatchVotingSVG from '~assets/sidebar/batch-voting.svg';
import DemocracyProposalsSVG from '~assets/sidebar/democracy-proposal-icon.svg';
import DiscussionsSVG from '~assets/sidebar/discussion-icon.svg';
import AuctionAdminSVG from '~assets/sidebar/auction.svg';
import FellowshipGroupSVG from '~assets/sidebar/gov2_fellowship_group.svg';
import GovernanceGroupSVG from '~assets/sidebar/gov2_governance_group.svg';
import PreimagesSVG from '~assets/sidebar/gov2_preimages.svg';
import RootSVG from '~assets/sidebar/root-icon-gov2.svg';
import WishForChangeSVG from '~assets/sidebar/wish-for-change.svg';
import StakingAdminSVG from '~assets/sidebar/staking-admin-gov2.svg';
import TreasuryGroupSVG from '~assets/sidebar/treasury-groupicon-gov2.svg';
import MembersSVG from '~assets/sidebar/council-members-icon.svg';
import MotionsSVG from '~assets/sidebar/council-motion-icon.svg';
import NewsSVG from '~assets/sidebar/news-icon.svg';
import OverviewSVG from '~assets/sidebar/overview-icon.svg';
import ParachainsSVG from '~assets/sidebar/parachains-icon.svg';
import ReferendaSVG from '~assets/sidebar/democracy-referenda-icon.svg';
import TipsSVG from '~assets/sidebar/tips-icon.svg';
import TreasuryProposalsSVG from '~assets/sidebar/treasury-proposal-icon.svg';
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
import DelegatedSVG from '~assets/sidebar/delegate-icon-gov2.svg';
import DelegatedSVGDelegation from '~assets/icons/delegated.svg';
import UndelegatedSVG from '~assets/icons/undelegated.svg';
import ReceivedDelegationSVG from '~assets/icons/received-delegation.svg';
import FilterSVG from '~assets/icons/filter-icon.svg';
import FilterUnfilledSVG from '~assets/icons/filter-unfilled.svg';
import SearchSVG from '~assets/icons/search.svg';
import CheckedSVG from '~assets/icons/checked.svg';
import CheckedOutlinedSVG from '~assets/icons/check-outline.svg';
import TrendingSVG from '~assets/icons/trending.svg';
import RootTrackSVG from '~assets/delegation-tracks/root.svg';
import FellowshipAdminSVG from '~assets/delegation-tracks/fellowship-admin.svg';
import GeneralAdminSVG from '~assets/delegation-tracks/genral-admin.svg';
import LeaseAdminSVG from '~assets/delegation-tracks/lease-admin.svg';
import SmallTipperSVG from '~assets/delegation-tracks/small-tipper.svg';
import WhitelistedCallerSVG from '~assets/delegation-tracks/whitelisted-caller.svg';
import MediumSpenderSVG from '~assets/delegation-tracks/medium-spender.svg';
import StakingAdminTrackSVG from '~assets/delegation-tracks/staking-admin.svg';
import TreasurerSVG from '~assets/delegation-tracks/treasurer.svg';
import AuctionAdminTrackSVG from '~assets/delegation-tracks/auction-admin.svg';
import ReferendumCancellerSVG from '~assets/delegation-tracks/referendum-cancellor.svg';
import ReferendumKillerSVG from '~assets/delegation-tracks/referendum-killer.svg';
import BigSpenderSVG from '~assets/delegation-tracks/big-spender.svg';
import BigTipperSVG from '~assets/delegation-tracks/big-tipper.svg';
import SmallSpenderSVG from '~assets/delegation-tracks/small-spender.svg';
import DelegationSVG from '~assets/sidebar/delegation-icon.svg';
import Dislike from '~assets/icons/dislike.svg';
import UpgradeCommitteePIPsSVG from '~assets/icons/upgrade-community-pips.svg';
import CommunityPIPsSVG from '~assets/icons/community-pips.svg';
import CopySVG from '~assets/icons/content-copy.svg';
import CreatePropoosalSVG from '~assets/icons/create-proposal-filled.svg';
import DashboardSVG from '~assets/icons/dashboard.svg';
import PolkassemblyLogo from '~assets/icons/polkaIcon.svg';
import optionsLogo from '~assets/icons/optionIcon.svg';
import SetIdentitySVG from '~assets/icons/identity-icon.svg';
import ApplayoutIdentitySVG from '~assets/icons/layout-identity.svg';
import profileSVG from '~assets/icons/userDropdown/profile.svg';
import settingsIcon from '~assets/icons/userDropdown/setting.svg';
import logoutSVG from '~assets/icons/userDropdown/logout.svg';
import VoteHistoryIcon from '~assets/icons/history.svg';
// import AmountBreakdownModalSVG from '~assets/icons/amount-breakdown-identity.svg';
import ArchivedSVG from '~assets/icons/archived.svg';
import NoTagsFoundSVG from '~assets/icons/no-tag.svg';
import Comments from '~assets/icons/chat-icon.svg';
import ForumComments from '~assets/icons/forum-chat-icon.svg';
import MatrixSVG from '~assets/icons/riot.svg';
import LegalSVG from '~assets/icons/legal-icon.svg';
import JudgementSVG from '~assets/icons/judgement-icon.svg';
import WebSVG from '~assets/profile/web-icon.svg';
import ShareScreenSVG from '~assets/icons/screen-share-icon.svg';
import PgpSVG from '~assets/icons/pgp-icon.svg';
import RedirectSVG from '~assets/icons/redirect-icon.svg';
import ProposalsIconSVG from '~assets/icons/proposals-icon.svg';
import TechComIconSVG from '~assets/icons/tech-com-icon.svg';
import DelegateProfileGreyIcon from '~assets/icons/delegate-title.svg';
import VoteDataSVG from '~assets/icons/vote-data-icon.svg';
import DeleteIconSVG from '~assets/icons/deleteIcon.svg';
import WhiteDeleteIconSVG from '~assets/icons/deleteWhiteIcon.svg';
import PolkaverseSVG from '~assets/icons/SubsocialIcon.svg';
import VerifiedSVG from '~assets/icons/verified-tick.svg';
import BeneficiarySVG from '~assets/icons/Beneficiary.svg';
import BeneficiaryGreySVG from '~assets/icons/BeneficiaryGrey.svg';
import DropdownGreyIconSVG from '~assets/icons/dropdown-grey.svg';
import DownArrowSVG from '~assets/icons/down-arrow.svg';
import DollarSVG from '~assets/profile/dollar.svg';
import RemoveVoteSVG from '~assets/profile/remove-vote.svg';
import ClipboardSVG from '~assets/profile/profile-clipboard.svg';
import AstralSVG from '~assets/profile/profile-astrals.svg';
import VotesSVG from '~assets/profile/profile-votes.svg';
import ViewVoteSVG from '~assets/profile/view-votes.svg';
import SubscanSVG from '~assets/profile/profile-subscan.svg';
import ProfileOverviewSVG from '~assets/profile/profile-overview.svg';
import LeaderboardSVG from '~assets/sidebar/LeaderboardSelected.svg';
import AnalyticsSVG from '~assets/sidebar/AnalyticsSelected.svg';
import ExpandSVG from '~assets/icons/expand-small-icon.svg';
import EqualSVG from '~assets/profile/equal.svg';
import MyActivitySVG from '~assets/profile/myactivity.svg';
import ProfileMentionsSVG from '~assets/profile/profile-mentions.svg';
import ProfileReactionsSVG from '~assets/profile/profile-reactions.svg';
import OnChainIdentitySVG from '~assets/icons/onchain-identity.svg';
import MailFilled from '~assets/icons/email-notification.svg';
import SlackIconSVG from '~assets/icons/slack.svg';
import ElementIconSVG from '~assets/icons/element.svg';
import TelegramIconSVG from '~assets/icons/telegram-notification.svg';
import DiscordIconSVG from '~assets/icons/discord-notification.svg';
import TipIconSVG from '~assets/icons/tip-title.svg';
import InfoIconSVG from '~assets/info.svg';
import DollarIconSVG from '~assets/icons/dollar-icon.svg';
import ReferandumSVG from '~assets/icons/referendum-canceller.svg';
import AuctionAdminIconSVG from '~assets/icons/action-admin.svg';
import FellowshipSVG from '~assets/icons/fellowship-admin.svg';
import StackingAdminSVG from '~assets/icons/stacking-admin.svg';
import ReferendumsSVG from '~assets/icons/referndums.svg';
import ClearIdentityOutlinedSVG from '~assets/icons/outlined-clear-identity.svg';
import ClearIdentityFilledSVG from '~assets/icons/filled-clear-identity.svg';
import CalenderIconSVG from '~assets/icons/calender-icon.svg';
import PowerIconSVG from '~assets/icons/body-part-muscle.svg';
import VoterIconSVG from '~assets/icons/vote-small-icon.svg';
import ConvictionIconSVG from '~assets/icons/conviction-small-icon.svg';
import CapitalIconSVG from '~assets/icons/capital-small-icom.svg';
import EmailIconSVG from '~assets/icons/email_icon.svg';
import CuratorSVG from '~assets/bounty-icons/curator-icon.svg';
import BountyCriteriaSVG from '~assets/bounty-icons/bounty-criteria.svg';

import SelectedDiscussionsIcon from '~assets/selected-icons/Discussions.svg';
import SelectedGovernanceIcon from '~assets/selected-icons/Governance.svg';
import SelectedOverviewIcon from '~assets/selected-icons/Overview.svg';
import SelectedPreimagesIcon from '~assets/selected-icons/Preimages.svg';
import SelectedRootIcon from '~assets/selected-icons/Root.svg';
import SelectedTreasuryIcon from '~assets/selected-icons/Treasury.svg';
import SelectedWhitelistIcon from '~assets/selected-icons/Whitelist.svg';
import SelectedWishForChangeIcon from '~assets/selected-icons/Wish For Change.svg';
import AllpostIcon from '~assets/allpost.svg';
import AstralSidebarSVG from '~assets/sidebar/astral-points.svg';
import GovernanceIcon from '~assets/governance.svg';
import FellowshipIconnew from '~assets/members.svg';
import TreasuryIcon from '~assets/treasury.svg';
import DetailsIconSVG from '~assets/icons/details-icons.svg';

export const PolkasafeWhiteIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PolkasafeWhiteIconSVG}
		{...props}
	/>
);

export const DeleteBlueIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DeleteIconSVG}
		{...props}
	/>
);

export const DeleteWhiteIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={WhiteDeleteIconSVG}
		{...props}
	/>
);

export const MailIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={MailSVG}
		{...props}
	/>
);
export const WhiteMailIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={WhiteMailSVG}
		{...props}
	/>
);

export const Caution = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CautionIcon}
		{...props}
	/>
);

export const IconSignup = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SignupIcon}
		{...props}
	/>
);

export const IconLogout = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={logoutSVG}
		{...props}
	/>
);

export const ProposalsIconListing = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ProposalsIconSVG}
		{...props}
	/>
);

export const VoteDataIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={VoteDataSVG}
		{...props}
	/>
);

export const TechComIconListing = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TechComIconSVG}
		{...props}
	/>
);

export const CloseIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CloseSVG}
		{...props}
	/>
);

export const IconSettings = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={settingsIcon}
		{...props}
	/>
);

export const IconProfile = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={profileSVG}
		{...props}
	/>
);

export const OptionMenu = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={optionsLogo}
		{...props}
	/>
);

export const PolkassemblyIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PolkassemblyLogo}
		{...props}
	/>
);

export const DelegateModalIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DelegateProfileGreyIcon}
		{...props}
	/>
);

export const JudgementIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={JudgementSVG}
		{...props}
	/>
);

export const PgpIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PgpSVG}
		{...props}
	/>
);

export const ShareScreenIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ShareScreenSVG}
		{...props}
	/>
);

export const LegalIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={LegalSVG}
		{...props}
	/>
);

export const Dashboard = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DashboardSVG}
		{...props}
	/>
);

export const IconRetry = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={RetrySVG}
		{...props}
	/>
);

export const IconVoteHistory = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={VoteHistoryIcon}
		{...props}
	/>
);

export const IconCaution = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={VoteHistoryIcon}
		{...props}
	/>
);

export const DislikeIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={Dislike}
		{...props}
	/>
);

export const OpenAiIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={OpenAiSVG}
		{...props}
	/>
);

export const AiStarIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AiStarSVG}
		{...props}
	/>
);

export const SummaryModalClose = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SummaryModalCloseSVG}
		{...props}
	/>
);

export const OpenGovBannerIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={OpenGovBannerSVG}
		{...props}
	/>
);

export const RedirectIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={RedirectSVG}
		{...props}
	/>
);

export const OverviewIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={OverviewSVG}
		{...props}
	/>
);

export const DiscussionsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DiscussionsSVG}
		{...props}
	/>
);

export const NewsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={NewsSVG}
		{...props}
	/>
);

export const TreasuryProposalsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TreasuryProposalsSVG}
		{...props}
	/>
);

export const BountiesIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={BountiesSVG}
		{...props}
	/>
);

export const ChildBountiesIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ChildBountiesSVG}
		{...props}
	/>
);

export const TipsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TipsSVG}
		{...props}
	/>
);

export const DemocracyProposalsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DemocracyProposalsSVG}
		{...props}
	/>
);

export const MembersIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={MembersSVG}
		{...props}
	/>
);

export const MotionsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={MotionsSVG}
		{...props}
	/>
);

export const TechComProposalIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TechCommProposalSVG}
		{...props}
	/>
);

export const ParachainsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ParachainsSVG}
		{...props}
	/>
);

export const ReferendaIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ReferendaSVG}
		{...props}
	/>
);

export const CalendarIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CalendarSVG}
		{...props}
	/>
);

export const BatchVotingIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={BatchVotingSVG}
		{...props}
	/>
);

export const DiscordIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DiscordSVG}
		{...props}
	/>
);

export const GithubIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={GithubSVG}
		{...props}
	/>
);

export const CubeIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CubeSVG}
		{...props}
	/>
);

export const RedditIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={RedditSVG}
		{...props}
	/>
);

export const TelegramIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TelegramSVG}
		{...props}
	/>
);

export const TwitterIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TwitterSVG}
		{...props}
	/>
);

export const WalletIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={WalletSVG}
		{...props}
	/>
);

export const IdentityIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={IdentitySVG}
		{...props}
	/>
);

export const ProfileIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ProfileSVG}
		{...props}
	/>
);

export const EmailIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={EmailSVG}
		{...props}
	/>
);

export const MatrixIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={MatrixSVG}
		{...props}
	/>
);

export const SignalTowerIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SignalTowerSVG}
		{...props}
	/>
);

export const EditIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={EditSVG}
		{...props}
	/>
);

export const SyncIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SyncSVG}
		{...props}
	/>
);

export const PreparePeriodIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PreparePeriodSVG}
		{...props}
	/>
);

export const DecisionPeriodIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DecisionPeriodSVG}
		{...props}
	/>
);

export const EnactmentPeriodIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={EnactmentPeriodSVG}
		{...props}
	/>
);

export const RightArrowIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={RightArrowSVG}
		{...props}
	/>
);

export const CastVoteIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CastVoteSVG}
		{...props}
	/>
);

export const VoteCalculationIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={VoteCalculationSVG}
		{...props}
	/>
);

export const VoteAmountIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={VoteAmountSVG}
		{...props}
	/>
);

export const ConvictionPeriodIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ConvictionPeriodSVG}
		{...props}
	/>
);

export const LikeDislikeIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={LikeDislikeSVG}
		{...props}
	/>
);

export const CommentsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={Comments}
		{...props}
	/>
);
export const ForumCommentsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ForumComments}
		{...props}
	/>
);

export const ArrowDownIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ArrowDownSVG}
		{...props}
	/>
);

export const ThresholdGraphIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ThresholdGraphSVG}
		{...props}
	/>
);

export const PostEditIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PostEditSVG}
		{...props}
	/>
);

export const PostLinkingIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PostLinkingSVG}
		{...props}
	/>
);

export const WarningMessageIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={WarningMessageSVG}
		{...props}
	/>
);

export const VotingHistoryIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={VotingHistorySVG}
		{...props}
	/>
);

export const RootIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={RootSVG}
		{...props}
	/>
);
export const WishForChangeIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={WishForChangeSVG}
		{...props}
	/>
);

export const AuctionAdminIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AuctionAdminSVG}
		{...props}
	/>
);

export const StakingAdminIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={StakingAdminSVG}
		{...props}
	/>
);

export const GovernanceGroupIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={GovernanceGroupSVG}
		{...props}
	/>
);

export const TreasuryGroupIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TreasuryGroupSVG}
		{...props}
	/>
);

export const FellowshipGroupIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={FellowshipGroupSVG}
		{...props}
	/>
);
export const PreimagesIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PreimagesSVG}
		{...props}
	/>
);
export const AgainstIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AgainstSVG}
		{...props}
	/>
);
export const AgainstUnfilledIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AgainstUnfilledSVG}
		{...props}
	/>
);
export const SlightlyAgainstIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SlightlyAgainstSVG}
		{...props}
	/>
);
export const SlightlyAgainstUnfilledIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SlightlyAgainstUnfilledSVG}
		{...props}
	/>
);
export const NeutralIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={NeutralSVG}
		{...props}
	/>
);
export const NeutralUnfilledIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={NeutralUnfilledSVG}
		{...props}
	/>
);
export const SlightlyForIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SlightlyForSVG}
		{...props}
	/>
);
export const SlightlyForUnfilledIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SlightlyForUnfilledSVG}
		{...props}
	/>
);
export const ForIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ForSVG}
		{...props}
	/>
);
export const ForUnfilledIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ForUnfilleSVG}
		{...props}
	/>
);
export const DelegatedIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DelegatedSVG}
		{...props}
	/>
);

export const DelegateDelegationIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DelegatedSVGDelegation}
		{...props}
	/>
);

export const UnDelegatedIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={UndelegatedSVG}
		{...props}
	/>
);
export const ReceivedDelegationIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ReceivedDelegationSVG}
		{...props}
	/>
);
export const FilterIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={FilterSVG}
		{...props}
	/>
);
export const FilterUnfilledIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={FilterUnfilledSVG}
		{...props}
	/>
);

export const SearchIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SearchSVG}
		{...props}
	/>
);
export const CheckOutlineIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CheckedOutlinedSVG}
		{...props}
	/>
);
export const CheckedIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CheckedSVG}
		{...props}
	/>
);
export const TrendingIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TrendingSVG}
		{...props}
	/>
);
export const RootTrackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={RootTrackSVG}
		{...props}
	/>
);
export const AuctionAdminTrackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AuctionAdminTrackSVG}
		{...props}
	/>
);
export const WhitelistedCallerTrackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={WhitelistedCallerSVG}
		{...props}
	/>
);
export const GeneralAdminTrackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={GeneralAdminSVG}
		{...props}
	/>
);
export const LeaseAdminTrackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={LeaseAdminSVG}
		{...props}
	/>
);
export const SmallTipperTrackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SmallTipperSVG}
		{...props}
	/>
);
export const MediumSpenderTrackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={MediumSpenderSVG}
		{...props}
	/>
);
export const StakingAdminTrackTrackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={StakingAdminTrackSVG}
		{...props}
	/>
);
export const TreasurerTrackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TreasurerSVG}
		{...props}
	/>
);
export const FellowshipAdminTrackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={FellowshipAdminSVG}
		{...props}
	/>
);
export const ReferendumKillerTrackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ReferendumKillerSVG}
		{...props}
	/>
);
export const BigSpenderTrackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={BigSpenderSVG}
		{...props}
	/>
);
export const BigTipperTrackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={BigTipperSVG}
		{...props}
	/>
);

export const ReferendumCancellerTrackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ReferendumCancellerSVG}
		{...props}
	/>
);
export const SmallSpenderTrackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SmallSpenderSVG}
		{...props}
	/>
);
export const DelegationSidebarIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DelegationSVG}
		{...props}
	/>
);
export const WebIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={WebSVG}
		{...props}
	/>
);

export const CopyIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CopySVG}
		{...props}
	/>
);
export const CreatePropoosalIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CreatePropoosalSVG}
		{...props}
	/>
);
export const UpgradeCommitteePIPsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={UpgradeCommitteePIPsSVG}
		{...props}
	/>
);
export const CommunityPIPsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CommunityPIPsSVG}
		{...props}
	/>
);

export const SetIdentityIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SetIdentitySVG}
		{...props}
	/>
);

// export const AmountBreakdownModalIcon = (props: Partial<CustomIconComponentProps>) => (
// <Icon
// component={AmountBreakdownModalSVG}
// {...props}
// />
// );

export const ApplayoutIdentityIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ApplayoutIdentitySVG}
		{...props}
	/>
);

export const ArchivedIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ArchivedSVG}
		{...props}
	/>
);

export const NoTagFoundIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={NoTagsFoundSVG}
		{...props}
	/>
);

export const PolkaverseIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PolkaverseSVG}
		{...props}
	/>
);

export const VerifiedIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={VerifiedSVG}
		{...props}
	/>
);

export const BeneficiaryIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={BeneficiarySVG}
		{...props}
	/>
);

export const BeneficiaryGreyIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={BeneficiaryGreySVG}
		{...props}
	/>
);

export const DropdownGreyIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DropdownGreyIconSVG}
		{...props}
	/>
);

export const DownArrowIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DownArrowSVG}
		{...props}
	/>
);

export const DollarIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DollarSVG}
		{...props}
	/>
);
export const RemoveVoteIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={RemoveVoteSVG}
		{...props}
	/>
);

export const ClipboardIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ClipboardSVG}
		{...props}
	/>
);

export const AstralSidebarIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AstralSidebarSVG}
		{...props}
	/>
);

export const VotesIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={VotesSVG}
		{...props}
	/>
);
export const ViewVoteIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ViewVoteSVG}
		{...props}
	/>
);
export const SubscanIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SubscanSVG}
		{...props}
	/>
);
export const ProfileOverviewIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ProfileOverviewSVG}
		{...props}
	/>
);
export const LeaderboardOverviewIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={LeaderboardSVG}
		{...props}
	/>
);
export const ExpandIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ExpandSVG}
		{...props}
	/>
);

export const EqualIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={EqualSVG}
		{...props}
	/>
);

export const MyActivityIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={MyActivitySVG}
		{...props}
	/>
);

export const ProfileMentionsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ProfileMentionsSVG}
		{...props}
	/>
);

export const ProfileReactionsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ProfileReactionsSVG}
		{...props}
	/>
);

export const OnChainIdentityIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={OnChainIdentitySVG}
		{...props}
	/>
);
export const MailFilledIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={MailFilled}
		{...props}
	/>
);
export const SlackIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SlackIconSVG}
		{...props}
	/>
);
export const TelegramFilledIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TelegramIconSVG}
		{...props}
	/>
);
export const ElementIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ElementIconSVG}
		{...props}
	/>
);
export const DiscordFilledIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DiscordIconSVG}
		{...props}
	/>
);
export const TipIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TipIconSVG}
		{...props}
	/>
);
export const InfoIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={InfoIconSVG}
		{...props}
	/>
);
export const RoundedDollarIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DollarIconSVG}
		{...props}
	/>
);

export const ReferandumCancellorIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ReferandumSVG}
		{...props}
	/>
);
export const AuctionAdminSVGIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AuctionAdminIconSVG}
		{...props}
	/>
);
export const FellowshipIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={FellowshipSVG}
		{...props}
	/>
);
export const StackingAdminIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={StackingAdminSVG}
		{...props}
	/>
);
export const ReferendumsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ReferendumsSVG}
		{...props}
	/>
);

export const ClearIdentityOutlinedIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ClearIdentityOutlinedSVG}
		{...props}
	/>
);

export const ClearIdentityFilledIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ClearIdentityFilledSVG}
		{...props}
	/>
);

export const CalenderIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CalenderIconSVG}
		{...props}
	/>
);
export const PowerIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={PowerIconSVG}
		{...props}
	/>
);
export const VoterIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={VoterIconSVG}
		{...props}
	/>
);
export const ConvictionIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={ConvictionIconSVG}
		{...props}
	/>
);
export const CapitalIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CapitalIconSVG}
		{...props}
	/>
);
export const EmailIconNew = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={EmailIconSVG}
		{...props}
	/>
);
export const CuratorIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={CuratorSVG}
		{...props}
	/>
);

export const BountyCriteriaIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={BountyCriteriaSVG}
		{...props}
	/>
);

export const SelectedDiscussions = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SelectedDiscussionsIcon}
		{...props}
	/>
);

export const SelectedGovernance = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SelectedGovernanceIcon}
		{...props}
	/>
);

export const SelectedOverview = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SelectedOverviewIcon}
		{...props}
	/>
);

export const SelectedPreimages = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SelectedPreimagesIcon}
		{...props}
	/>
);

export const SelectedRoot = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SelectedRootIcon}
		{...props}
	/>
);

export const SelectedTreasury = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SelectedTreasuryIcon}
		{...props}
	/>
);

export const SelectedWhitelist = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SelectedWhitelistIcon}
		{...props}
	/>
);

export const SelectedWishForChange = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={SelectedWishForChangeIcon}
		{...props}
	/>
);

export const AllPostIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AllpostIcon}
		{...props}
	/>
);

export const AstralIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AstralSVG}
		{...props}
	/>
);

export const GovernanceIconNew = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={GovernanceIcon}
		{...props}
	/>
);

export const FellowshipIconNew = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={FellowshipIconnew}
		{...props}
	/>
);

export const TreasuryIconNew = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={TreasuryIcon}
		{...props}
	/>
);

export const AnalyticsSVGIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={AnalyticsSVG}
		{...props}
	/>
);

export const DetailsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon
		component={DetailsIconSVG}
		{...props}
	/>
);
