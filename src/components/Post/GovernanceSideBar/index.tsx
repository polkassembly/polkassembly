// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import { Signer } from '@polkadot/api/types';
import { isWeb3Injected, web3Enable } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Form } from 'antd';
import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useEffect, useState } from 'react';
import { APPNAME } from 'src/global/appName';
import { Wallet } from 'src/types';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import getEncodedAddress from 'src/util/getEncodedAddress';
import styled from 'styled-components';

import { useApiContext, useNetworkContext, useUserDetailsContext } from '~src/context';
import { ProposalType, VoteType } from '~src/global/proposalType';
import { gov2ReferendumStatus, motionStatus, proposalStatus, referendumStatus } from '~src/global/statuses';
import useHandleMetaMask from '~src/hooks/useHandleMetaMask';

import ExtensionNotDetected from '../../ExtensionNotDetected';
import { tipStatus } from '../Tabs/PostOnChainInfo';
import BountyChildBounties from './Bounty/BountyChildBounties';
import MotionVoteInfo from './Motions/MotionVoteInfo';
import VoteMotion from './Motions/VoteMotion';
import ProposalDisplay from './Proposals';
import FellowshipReferendumVotingStatus from './Referenda/FellowshipReferendumVotingStatus';
import ReferendumV2VoteInfo from './Referenda/ReferendumV2VoteInfo';
import ReferendumV2VotingStatus from './Referenda/ReferendumV2VotingStatus';
import ReferendumVoteInfo from './Referenda/ReferendumVoteInfo';
import VoteReferendum from './Referenda/VoteReferendum';
import VoteReferendumEth from './Referenda/VoteReferendumEth';
import VoteReferendumEthV2 from './Referenda/VoteReferendumEthV2';
import EndorseTip from './Tips/EndorseTip';
import TipInfo from './Tips/TipInfo';
import EditProposalStatus from './TreasuryProposals/EditProposalStatus';

interface IGovernanceSidebarProps {
	canEdit?: boolean | '' | undefined
	className?: string
	proposalType: ProposalType;
	onchainId?: string | number | null
	status?: string
	startTime: string
	tally?: any;
	post: IPostResponse;
}

const GovernanceSideBar: FC<IGovernanceSidebarProps> = (props) => {
	const { network } = useNetworkContext();
	const { canEdit, className, onchainId, proposalType, startTime, status, tally, post } = props;
	const [address, setAddress] = useState<string>('');
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [extensionNotFound, setExtensionNotFound] = useState(false);
	const [accountsNotFound, setAccountsNotFound] = useState(false);
	const [accountsMap, setAccountsMap] = useState<{[key:string]:string}>({});
	const [signersMap, setSignersMap] = useState<{[key:string]: Signer}>({});

	const { api, apiReady } = useApiContext();
	const [lastVote, setLastVote] = useState<string | null | undefined>(undefined);

	const { walletConnectProvider } = useUserDetailsContext();

	const metaMaskError = useHandleMetaMask();

	const canVote =  !!post.status && !![proposalStatus.PROPOSED, referendumStatus.STARTED, motionStatus.PROPOSED, tipStatus.OPENED, gov2ReferendumStatus.SUBMITTED, gov2ReferendumStatus.DECIDING, gov2ReferendumStatus.SUBMITTED, gov2ReferendumStatus.CONFIRM_STARTED].includes(post.status);

	const onAccountChange = (address: string) => {
		setAddress(address);
	};

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		const signer: Signer = signersMap[accountsMap[address]];
		api?.setSigner(signer);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	const getWalletAccounts = async (chosenWallet: Wallet): Promise<InjectedAccount[] | undefined> => {
		const injectedWindow = window as Window & InjectedWindow;

		let wallet = isWeb3Injected
			? injectedWindow.injectedWeb3[chosenWallet]
			: null;

		if (!wallet) {
			wallet = Object.values(injectedWindow.injectedWeb3)[0];
		}

		if (!wallet) {
			return;
		}

		let injected: Injected | undefined;

		try {
			injected = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Wallet Timeout'));
				}, 60000); // wait 60 sec

				if(wallet && wallet.enable) {
					wallet!.enable(APPNAME).then(value => {
						clearTimeout(timeoutId);
						resolve(value);
					}).catch(error => {
						reject(error);
					});
				}
			});
		} catch (err) {
			console.log('Error fetching wallet accounts : ', err);
		}

		if(!injected) {
			return;
		}

		const accounts = await injected.accounts.get();

		if (accounts.length === 0) return;

		accounts.forEach((account) => {
			account.address = getEncodedAddress(account.address, network) || account.address;
		});

		return accounts;
	};

	const getAccounts = async (): Promise<undefined> => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		const extensions = await web3Enable(APPNAME);

		if (extensions.length === 0) {
			setExtensionNotFound(true);
			return;
		} else {
			setExtensionNotFound(false);
		}

		let accounts: InjectedAccount[] = [];
		let polakadotJSAccounts : InjectedAccount[] | undefined;
		let polywalletJSAccounts : InjectedAccount[] | undefined;
		let subwalletAccounts: InjectedAccount[] | undefined;
		let talismanAccounts: InjectedAccount[] | undefined;

		const signersMapLocal = signersMap as {[key:string]: Signer};
		const accountsMapLocal = accountsMap as {[key:string]: string};

		for (const extObj of extensions) {
			if(extObj.name == 'polkadot-js') {
				signersMapLocal['polkadot-js'] = extObj.signer;
				polakadotJSAccounts = await getWalletAccounts(Wallet.POLKADOT);
			} else if(extObj.name == 'subwallet-js') {
				signersMapLocal['subwallet-js'] = extObj.signer;
				subwalletAccounts = await getWalletAccounts(Wallet.SUBWALLET);
			} else if(extObj.name == 'talisman') {
				signersMapLocal['talisman'] = extObj.signer;
				talismanAccounts = await getWalletAccounts(Wallet.TALISMAN);
			} else if (['polymesh'].includes(network) && extObj.name === 'polywallet') {
				signersMapLocal['polywallet'] = extObj.signer;
				polywalletJSAccounts = await getWalletAccounts(Wallet.POLYWALLET);
			}
		}

		if( polakadotJSAccounts) {
			accounts = accounts.concat(polakadotJSAccounts);
			polakadotJSAccounts.forEach((acc: InjectedAccount) => {
				accountsMapLocal[acc.address] = 'polkadot-js';
			});
		}

		if( polywalletJSAccounts) {
			accounts = accounts.concat(polywalletJSAccounts);
			polywalletJSAccounts.forEach((acc: InjectedAccount) => {
				accountsMapLocal[acc.address] = 'polywallet';
			});
		}

		if(subwalletAccounts) {
			accounts = accounts.concat(subwalletAccounts);
			subwalletAccounts.forEach((acc: InjectedAccount) => {
				accountsMapLocal[acc.address] = 'subwallet-js';
			});
		}

		if(talismanAccounts) {
			accounts = accounts.concat(talismanAccounts);
			talismanAccounts.forEach((acc: InjectedAccount) => {
				accountsMapLocal[acc.address] = 'talisman';
			});
		}
		if (accounts.length === 0) {
			setAccountsNotFound(true);
			return;
		} else {
			setAccountsNotFound(false);
			setAccountsMap(accountsMapLocal);
			setSignersMap(signersMapLocal);
		}

		setAccounts(accounts);
		if (accounts.length > 0) {
			setAddress(accounts[0].address);
			const signer: Signer = signersMapLocal[accountsMapLocal[accounts[0].address]];
			api.setSigner(signer);
		}

		return;
	};

	if (extensionNotFound) {
		return (
			<div className={className}>
				<GovSidebarCard>
					<ExtensionNotDetected />
				</GovSidebarCard>
			</div>
		);
	}

	if (accountsNotFound) {
		return (
			<GovSidebarCard>
				<div className='mb-4'>You need at least one account in Polkadot-js extenstion to use this feature.</div>
				<div className='text-muted'>Please reload this page after adding accounts.</div>
			</GovSidebarCard>
		);
	}
	return (
		<>
			{<div className={className}>
				<Form>
					{proposalType === ProposalType.COUNCIL_MOTIONS && <>
						{canVote &&
							<VoteMotion
								accounts={accounts}
								address={address}
								getAccounts={getAccounts}
								motionId={onchainId as number}
								motionProposalHash={post.proposer}
								onAccountChange={onAccountChange}
							/>
						}

						{(post.motion_votes) &&
							<MotionVoteInfo
								councilVotes={post.motion_votes}
							/>
						}
					</>}

					{proposalType === ProposalType.DEMOCRACY_PROPOSALS &&
						<ProposalDisplay
							seconds={post?.seconds}
							accounts={accounts}
							address={address}
							canVote={canVote}
							getAccounts={getAccounts}
							onAccountChange={onAccountChange}
							status={status}
							proposalId={onchainId  as number}
						/>
					}

					{proposalType === ProposalType.TREASURY_PROPOSALS &&
						<EditProposalStatus
							proposalId={onchainId  as number}
							canEdit={canEdit}
							startTime={startTime}
						/>
					}

					{proposalType === ProposalType.REFERENDUMS &&
						<>
							{canVote &&
							<>
								{['moonbase', 'moonbeam', 'moonriver'].includes(network) ?
									<>
										{metaMaskError && !walletConnectProvider?.wc.connected && <GovSidebarCard>{metaMaskError}</GovSidebarCard>}

										{(!metaMaskError || walletConnectProvider?.wc.connected) &&

									<GovSidebarCard>
										<h6 className="dashboard-heading mb-6">Cast your Vote!</h6>
										<VoteReferendumEth
											referendumId={onchainId as number}
											onAccountChange={onAccountChange}
											setLastVote={setLastVote}
											lastVote={lastVote} />
									</GovSidebarCard>

										}
									</> : <GovSidebarCard>
										<h6 className="dashboard-heading mb-6">Cast your Vote!</h6>
										<VoteReferendum
											lastVote={lastVote}
											setLastVote={setLastVote}
											onAccountChange={onAccountChange}
											referendumId={onchainId  as number}
											proposalType={proposalType}
										/>
									</GovSidebarCard>
								}
							</>
							}

							{(onchainId || onchainId === 0) &&
								<div className={className}>
									<ReferendumVoteInfo
										referendumId={onchainId as number}
									/>
								</div>
							}

							<div>
								{lastVote != undefined ? lastVote == null ?
									<GovSidebarCard>
										You haven&apos;t voted yet, vote now and do your bit for the community
									</GovSidebarCard>
									:
									<GovSidebarCard className='flex items-center'>
										You Voted: { lastVote == 'aye' ? <LikeFilled className='text-aye_green ml-2' /> : <DislikeFilled className='text-nay_red ml-2' /> }
										<span className={`last-vote-text ${lastVote == 'aye' ? 'green-text' : 'red-text'}`}>{lastVote}</span>
									</GovSidebarCard>
									: <></>
								}
							</div>
						</>
					}

					{[ProposalType.OPEN_GOV, ProposalType.FELLOWSHIP_REFERENDUMS].includes(proposalType) &&
						<>
							{canVote &&
							<>
								{['moonbase', 'moonbeam', 'moonriver'].includes(network) ?
									<>
										{metaMaskError && !walletConnectProvider?.wc.connected && <GovSidebarCard>{metaMaskError}</GovSidebarCard>}

										{(!metaMaskError || walletConnectProvider?.wc.connected) &&

									<GovSidebarCard>
										<h6 className="dashboard-heading mb-6">Cast your Vote!</h6>
										<VoteReferendumEthV2
											referendumId={onchainId as number}
											onAccountChange={onAccountChange}
											setLastVote={setLastVote}
											lastVote={lastVote} />
									</GovSidebarCard>

										}
									</> : <GovSidebarCard>
										<h6 className="dashboard-heading mb-6">Cast your Vote!</h6>
										<VoteReferendum
											lastVote={lastVote}
											setLastVote={setLastVote}
											onAccountChange={onAccountChange}
											referendumId={onchainId  as number}
											proposalType={proposalType}
										/>
									</GovSidebarCard>}
							</>
							}

							{(onchainId || onchainId === 0) &&
								<>
									{
										proposalType === ProposalType.OPEN_GOV &&
										<div className={className}>
											<ReferendumV2VotingStatus
												referendumId={onchainId as number}
												tally={tally}
											/>
										</div>
									}
									{
										proposalType === ProposalType.FELLOWSHIP_REFERENDUMS &&
										<div className={className}>
											<FellowshipReferendumVotingStatus
												tally={tally}
											/>
										</div>
									}
									<div className={className}>
										<ReferendumV2VoteInfo
											voteType={proposalType === ProposalType.FELLOWSHIP_REFERENDUMS? VoteType.FELLOWSHIP: VoteType.REFERENDUM_V2}
											referendumId={onchainId as number}
										/>
									</div>
								</>
							}

							<div>
								{lastVote != undefined ? lastVote == null ?
									<GovSidebarCard>
										You haven&apos;t voted yet, vote now and do your bit for the community
									</GovSidebarCard>
									:
									<GovSidebarCard className='flex items-center'>
										You Voted: { lastVote == 'aye' ? <LikeFilled className='text-aye_green ml-2' /> : <DislikeFilled className='text-nay_red ml-2' /> }
										<span className={`last-vote-text ${lastVote == 'aye' ? 'green-text' : 'red-text'}`}>{lastVote}</span>
									</GovSidebarCard>
									: <></>
								}
							</div>
						</>
					}

					{proposalType === ProposalType.TIPS &&
					<GovSidebarCard>
						{
							canVote && <EndorseTip
								className='mb-8'
								accounts={accounts}
								address={address}
								getAccounts={getAccounts}
								tipHash={onchainId as string}
								onAccountChange={onAccountChange}
							/>
						}

						<TipInfo
							status={post.status}
							onChainId={post.hash}
							proposer={post.proposer}
							receiver={post.payee || post.proposer}
							tippers={post.tippers}
						/>
					</GovSidebarCard>
					}

					{proposalType === ProposalType.BOUNTIES && <>
						<BountyChildBounties
							childBounties={post.child_bounties}
							childBountiesCount={post.child_bounties_count}
						/>
					</>
					}
				</Form>
			</div>
			}
		</>
	);
};

export default styled(GovernanceSideBar)`
	.edit-icon-wrapper{
		transition: all 0.5s;
	}
	.edit-icon-wrapper .edit-icon{
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		right: 20px;
		display: none;
	}
	.edit-icon-wrapper:hover{
		background-image: linear-gradient(to left, #E5007A, #ffffff);
	}
	.edit-icon-wrapper:hover .edit-icon{
		display: block;
	}
`;
