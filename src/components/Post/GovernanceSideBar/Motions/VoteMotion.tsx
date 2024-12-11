// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Modal, Spin } from 'antd';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { EDecision, IVotesHistoryResponse, LoadingStatusType, NotificationStatus } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import AyeNayButtons from 'src/ui-components/AyeNayButtons';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';
import { useApiContext } from '~src/context';
import LoginToVote from '../LoginToVoteOrEndorse';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { chainProperties, network } from '~src/global/networkConstants';
import { ProposalType } from '~src/global/proposalType';
import AyeGreen from '~assets/icons/aye-green-icon.svg';
import { DislikeIcon } from '~src/ui-components/CustomIcons';
import dayjs from 'dayjs';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { InjectedTypeWithCouncilBoolean } from '~src/ui-components/AddressDropdown';
import executeTx from '~src/util/executeTx';
import { formatBalance } from '@polkadot/util';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Tooltip from '~src/basic-components/Tooltip';
import Alert from '~src/basic-components/Alert';
import _ from 'lodash';
import { useTranslation } from 'next-i18next';

interface Props {
	accounts: InjectedTypeWithCouncilBoolean[];
	address: string;
	className?: string;
	getAccounts: () => Promise<undefined>;
	motionId?: number | null;
	motionProposalHash?: string;
	onAccountChange: (address: string) => void;
	proposalType?: ProposalType;
	setAccounts: React.Dispatch<React.SetStateAction<InjectedTypeWithCouncilBoolean[]>>;
}

const VoteMotion = ({ accounts, address, className, getAccounts, motionId, motionProposalHash, onAccountChange, proposalType, setAccounts }: Props) => {
	const [showModal, setShowModal] = useState<boolean>(false);
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: '' });
	const { t } = useTranslation('common');
	const [isCouncil, setIsCouncil] = useState(false);
	const [forceVote, setForceVote] = useState(false);
	const [currentCouncil, setCurrentCouncil] = useState<string[]>([]);
	const { api, apiReady } = useApiContext();
	const { id } = useUserDetailsSelector();
	const { network: Network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const [vote, setVote] = useState<{
		timestamp: string | undefined;
		decision: EDecision;
	}>({
		decision: EDecision.YES,
		timestamp: ''
	});
	const [voteCount, setVoteCount] = useState<number>(0);

	useEffect(() => {
		if (!api || !apiReady) return;
		if (accounts.length === 0) {
			getAccounts();
		}

		if (proposalType === ProposalType.TECH_COMMITTEE_PROPOSALS) {
			api.query.technicalCommittee
				.members()
				.then((members) => {
					let membersArr: string[] = [];

					if (!members.length) {
						return;
					}

					members.forEach((m: any) => {
						membersArr.push(m.toString());
					});

					membersArr = _.orderBy(membersArr, ['rank'], ['asc']);

					setCurrentCouncil(membersArr.filter((member) => !!member));
				})
				.catch((err) => {
					console.log(err, 'err');
				});
		} else {
			if (api?.query?.council) {
				api.query.council
					.members()
					.then((memberAccounts) => {
						const members = memberAccounts.map((member) => member.toString());
						setCurrentCouncil(members.filter((member) => !!member) as string[]);
					})
					.catch((error) => {
						console.error(t('error_fetching_council_members'), error);
						setCurrentCouncil([]);
						queueNotification({
							header: 'Failed!',
							message: t('error_fetching_council_members'),
							status: NotificationStatus.ERROR
						});
					});
			} else {
				console.error(t('council_pallet_not_available'));
				queueNotification({
					header: 'Notice',
					message: t('council_pallet_not_available'),
					status: NotificationStatus.WARNING
				});
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	useEffect(() => {
		// it will iterate through all accounts
		if (accounts && Array.isArray(accounts)) {
			const index = accounts.findIndex((account) => {
				const substrateAddress = getSubstrateAddress(account.address);
				return currentCouncil.some((council) => getSubstrateAddress(council) === substrateAddress);
			});
			if (index >= 0) {
				const account = accounts[index];
				setIsCouncil(true);
				accounts.splice(index, 1);
				accounts.unshift({
					...account,
					isCouncil: true
				});
				setAccounts(accounts);
				onAccountChange(account.address);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentCouncil, accounts]);

	useEffect(() => {
		if (!Network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[Network].tokenDecimals,
			unit: chainProperties[Network].tokenSymbol
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}
		nextApiClientFetch<IVotesHistoryResponse>('api/v1/votes/history', {
			listingLimit: 1,
			network: network,
			page: 1,
			proposalIndex: motionId,
			proposalType: proposalType,
			voterAddress: address
		})
			.then((res) => {
				if (res.error) {
					console.log('error');
				} else {
					if (res.data?.count) {
						setVoteCount(res.data?.count);
						setVote({
							decision: res.data?.votes[0].decision,
							timestamp: res.data?.votes[0].timestamp
						});
					}
				}
			})
			.catch((err) => {
				console.error(err);
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady, network, proposalType, motionId]);

	const onSuccess = () => {
		queueNotification({
			header: 'Success!',
			message: `Vote on motion #${motionId} successful.`,
			status: NotificationStatus.SUCCESS
		});
		setLoadingStatus({ isLoading: false, message: '' });
	};

	const onFailed = (message: string) => {
		setLoadingStatus({ isLoading: false, message: '' });
		queueNotification({
			header: 'Failed!',
			message,
			status: NotificationStatus.ERROR
		});
	};

	const voteMotion = async (aye: boolean) => {
		if (!motionId && motionId !== 0) {
			console.error('motionId not set');
			return;
		}

		if (!motionProposalHash) {
			console.error('motionProposalHash not set');
			return;
		}

		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });

		const vote = api.tx.council.vote(motionProposalHash, motionId, aye);

		await executeTx({
			address,
			api,
			apiReady,
			errorMessageFallback: 'Transaction failed.',
			network: Network,
			onBroadcast: () => setLoadingStatus({ isLoading: true, message: 'Broadcasting the vote' }),
			onFailed,
			onSuccess,
			tx: vote
		});
	};

	if (!id) {
		return <LoginToVote />;
	}
	const openModal = () => {
		setShowModal(true);
		if (accounts.length === 0) {
			getAccounts();
		}
	};

	const VotingForm = () => (
		<GovSidebarCard>
			<h3 className='mb-6 text-xl font-semibold leading-6 tracking-[0.0015em] text-blue-light-high dark:text-blue-dark-high'>{t('cast_your_vote')}</h3>
			<CustomButton
				variant='primary'
				text={t('cast_vote')}
				onClick={openModal}
				fontSize='lg'
				className='mx-auto my-3 w-[95%] p-7'
			/>

			<Modal
				className='dark:[&>.ant-modal-content]:bg-section-dark-overlay'
				wrapClassName='dark:bg-modalOverlayDark'
				open={showModal}
				onCancel={() => setShowModal(false)}
				footer={null}
			>
				<Spin
					spinning={loadingStatus.isLoading}
					indicator={<LoadingOutlined />}
				>
					<h4 className='mb-7 text-xl font-semibold leading-6 tracking-[0.0015em] text-blue-light-high dark:text-blue-dark-high'>{t('cast_your_vote')}</h4>

					<AccountSelectionForm
						title={t('vote_with_account')}
						accounts={accounts}
						address={address}
						withBalance
						onAccountChange={onAccountChange}
						theme={theme}
						isVoting
					/>

					<AyeNayButtons
						className='mt-6 max-w-[156px]'
						size='large'
						disabled={!apiReady}
						onClickAye={() => voteMotion(true)}
						onClickNay={() => voteMotion(false)}
					/>
				</Spin>
			</Modal>
			{voteCount ? (
				<div>
					<p className='mb-[5px] text-[12px] font-medium leading-6 text-blue-light-high dark:text-blue-dark-high'>{t('last_vote')}</p>
					<div className='mb-[-5px] flex text-[12px] font-normal leading-6 text-blue-light-high dark:text-blue-dark-high'>
						<Tooltip
							placement='bottom'
							title='Decision'
							color={'#E5007A'}
							className='w-[20%] max-[345px]:w-auto'
						>
							<span className='h-[25px]'>
								{vote.decision == 'yes' ? (
									<p>
										<AyeGreen /> <span className='font-medium capitalize text-[#2ED47A]'>{'Aye'}</span>
									</p>
								) : vote.decision == 'no' ? (
									<div>
										<DislikeIcon className='text-[#F53C3C]' /> <span className='mb-[5px] font-medium capitalize text-[#F53C3C]'>{'Nay'}</span>
									</div>
								) : null}
							</span>
						</Tooltip>
						<Tooltip
							placement='bottom'
							title='Time'
							color={'#E5007A'}
							className='w-[30%] max-[345px]:w-auto'
						>
							<span className=''>
								<ClockCircleOutlined className='mr-1' />
								{dayjs(vote.timestamp, 'YYYY-MM-DD').format("Do MMM'YY")}
							</span>
						</Tooltip>
					</div>
				</div>
			) : null}
		</GovSidebarCard>
	);

	const NotCouncil = () => (
		<GovSidebarCard>
			<h3 className='dashboard-heading mb-6 dark:text-white'>{t('cast_your_vote')}</h3>
			<Alert
				className='mb-6 '
				type='warning'
				message={
					<div className='flex items-center gap-x-2 dark:text-blue-dark-high'>
						<span>{t('no_account_found_from_the_council')}</span>
						<Image
							width={25}
							height={25}
							src='/assets/frowning-face.png'
							alt='frowning face'
						/>
					</div>
				}
			/>
			<CustomButton
				variant='default'
				onClick={() => setForceVote(true)}
				text={t('let_me_try_still')}
				className='border-none'
			/>
		</GovSidebarCard>
	);

	return <div className={className}>{isCouncil || forceVote ? <VotingForm /> : <NotCouncil />}</div>;
};

export default styled(VoteMotion)`
	.LoaderWrapper {
		height: 15rem;
		position: absolute;
		width: 100%;
	}
`;
