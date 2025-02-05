// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import NavigateNextIcon from '~assets/icons/navigate-next.svg';
import NavigatePrevIcon from '~assets/icons/navigate-prev.svg';
import { useApiContext, usePostDataContext } from '~src/context';
import PostEditOrLinkCTA from './Post/GovernanceSideBar/PostEditOrLinkCTA';
import dynamic from 'next/dynamic';
import { checkIsOnChainPost } from '~src/global/proposalType';
import { gov2ReferendumStatus } from '~src/global/statuses';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import executeTx from '~src/util/executeTx';
import Link from 'next/link';
import { trackEvent } from 'analytics';
import { useDispatch } from 'react-redux';
import { progressReportActions } from '~src/redux/progressReport';
import UploadReport from './ProgressReport/UploadReport';
import { showProgressReportUploadFlow } from './ProgressReport/utils';
import LoginPopup from '~src/ui-components/loginPopup';
import SignupPopup from '~src/ui-components/SignupPopup';
import { useRouter } from 'next/router';

const DecisionDepositCard = dynamic(() => import('~src/components/OpenGovTreasuryProposal/DecisionDepositCard'), {
	ssr: false
});

interface card {
	title: string;
	description: string;
	icon: string;
	tag: string;
	clickHandler?: (() => void) | ((prop?: any) => void);
}

enum cardTags {
	ADD_DEADLINE = 'add',
	LINK_DISCUSSION = 'link',
	DECISION_DEPOSIT = 'pay',
	ADD_DESCRIPTION = 'add',
	ADD_TAGS = 'add',
	REFUND_DEPOSIT = 'refund',
	ADD_PROGRESS_REPORT = 'add',
	VIEW_PROGRESS_REPORT = 'view'
}

type props = { canEdit: any; showDecisionDeposit: any; trackName: string; toggleEdit: (() => void) | null };
const RHSCardSlides = ({ canEdit, showDecisionDeposit, trackName, toggleEdit }: props) => {
	const { api, apiReady } = useApiContext();
	const { postData } = usePostDataContext();
	const router = useRouter();
	const dispatch = useDispatch();
	// const { show_nudge } = useProgressReportSelector();
	const { network } = useNetworkSelector();
	const { loginAddress, id, username } = useUserDetailsSelector();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [RHSCards, setRHSCards] = useState<card[]>([]);
	const [openDecisionDeposit, setOpenDecisionDeposit] = useState(false);
	const [linkingAndEditingOpen, setLinkingAndEditingOpen] = useState(false);
	const [openLinkCta, setOpenLinkCta] = useState(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);

	const [showRefundDeposit, setShowRefundDeposit] = useState<{ show: boolean; decisionDeposit: boolean; submissionDeposit: boolean }>({
		decisionDeposit: false,
		show: false,
		submissionDeposit: false
	});

	const {
		postData: { post_link, tags, postType, content, statusHistory, postIndex, progress_report }
	} = usePostDataContext();

	const isOnchainPost = checkIsOnChainPost(postType);

	const nextSlide = () => {
		setCurrentIndex((prevIndex) => {
			const newIndex = prevIndex === RHSCards.length - 1 ? prevIndex : prevIndex + 1;
			return newIndex;
		});
	};

	const prevSlide = () => {
		setCurrentIndex((prevIndex) => {
			const newIndex = prevIndex === 0 ? prevIndex : prevIndex - 1;
			return newIndex;
		});
	};
	const handleRefundDepositClick = async () => {
		if (!api || !apiReady || !network || !loading) return;
		setLoading(true);
		const refundDecisionDepositTx = api?.tx.referenda.refundDecisionDeposit(postIndex);
		const refundSubmissionDepositTx = api?.tx.referenda.refundSubmissionDeposit(postIndex);
		let refundTx = refundDecisionDepositTx;

		if (showRefundDeposit?.decisionDeposit && showRefundDeposit.submissionDeposit) {
			refundTx = api.tx.utility.batchAll([refundDecisionDepositTx, refundSubmissionDepositTx]);
		} else if (showRefundDeposit.submissionDeposit && !showRefundDeposit?.decisionDeposit) {
			refundTx = refundSubmissionDepositTx;
		}

		const onSuccess = async () => {
			queueNotification({
				header: 'Success!',
				message: 'Refund successully proccessed',
				status: NotificationStatus.SUCCESS
			});
			setLoading(false);
			setRHSCards(RHSCards.slice(1));
		};
		const onFailed = () => {
			queueNotification({
				header: 'failed!',
				message: 'Transaction failed!',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		};
		await executeTx({
			address: loginAddress,
			api,
			apiReady,
			errorMessageFallback: 'failed.',
			network,
			onFailed,
			onSuccess,
			tx: refundTx
		});
	};
	useEffect(() => {
		if (!api || !apiReady || (Number(postIndex) !== 0 && !postIndex)) return;
		(async () => {
			if (
				!statusHistory?.filter((status) =>
					[gov2ReferendumStatus.CANCELLED, gov2ReferendumStatus.EXECUTED, gov2ReferendumStatus.CONFIRMED, gov2ReferendumStatus.EXECUTION_FAILED].includes(status?.status)
				)?.length
			)
				return;
			const isRefundExists: any = (await api?.query?.referenda?.referendumInfoFor(postIndex).then((e) => e.toHuman())) || null;
			if (isRefundExists) {
				const isDecisionDeposit = !!(isRefundExists?.Approved?.[2] || isRefundExists?.Cancelled?.[2] || isRefundExists.Rejected?.[2] || isRefundExists.TimedOut?.[2]);
				const isSubmissionDeposit = !!(isRefundExists?.Approved?.[1] || isRefundExists?.Cancelled?.[1]);
				setShowRefundDeposit({
					decisionDeposit: isDecisionDeposit,
					show: isDecisionDeposit || isSubmissionDeposit,
					submissionDeposit: isSubmissionDeposit
				});
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, postIndex, statusHistory]);

	const handleProgressReportClick = () => {
		router.replace({
			pathname: '',
			query: {
				...router.query,
				tab: 'evaluation'
			}
		});
	};

	useEffect(() => {
		if (Object.keys(progress_report).length) {
			setRHSCards((prevCards) => {
				const newCards = [...prevCards];
				newCards.push({
					clickHandler: () => handleProgressReportClick(),
					description: 'A new progress report was added by the proposal',
					icon: '/assets/icons/progressReport.svg',
					tag: cardTags.VIEW_PROGRESS_REPORT,
					title: 'Progress Report'
				});

				return newCards;
			});
		}
		if (showRefundDeposit?.show && postData?.status !== 'Executed') {
			trackEvent('refund_card_clicked', 'clicked_refund_card', {
				loginAddress: loginAddress || '',
				userId: id || '',
				userName: username || ''
			});
			setRHSCards((prevCards) => {
				const newCards = [...prevCards];
				newCards.push({
					clickHandler: () => handleRefundDepositClick(),
					description: 'Click here to refund the deposit for this proposal',
					icon: '/assets/icons/rhs-card-icons/Crystal.png',
					tag: cardTags.REFUND_DEPOSIT,
					title: 'Refund Deposit'
				});

				return newCards;
			});
		}
		if (showDecisionDeposit && postData?.status !== 'Executed') {
			trackEvent('decision_deposit_card_clicked', 'clicked_decision_deposit_card', {
				loginAddress: loginAddress || '',
				userId: id || '',
				userName: username || ''
			});
			setRHSCards((prevCards) => {
				const newCards = [...prevCards];
				newCards.push({
					clickHandler: () => setOpenDecisionDeposit(true),
					description: 'Place refundable deposit within 14 days to prevent proposal from timing out.',
					icon: '/assets/icons/rhs-card-icons/Crystal.png',
					tag: cardTags.DECISION_DEPOSIT,
					title: 'Decision Deposit'
				});

				return newCards;
			});
		}

		if (postData?.userId === id && showProgressReportUploadFlow(network, postData?.track_name, postData?.postType, postData)) {
			setRHSCards((prevCards) => {
				const newCards = [...prevCards];
				newCards.push({
					clickHandler: () => {
						if (loginAddress) {
							dispatch(progressReportActions.setAddProgressReportModalOpen(true));
						} else {
							setLoginOpen(true);
						}
					},
					description: 'Your proposal is past the deadline, pls add a progress report.',
					icon: '/assets/icons/progressReport.svg',
					tag: cardTags.ADD_PROGRESS_REPORT,
					title: 'Add Progress Report'
				});

				return newCards;
			});
		}

		if (canEdit && !(tags && Array.isArray(tags) && tags.length > 0)) {
			setRHSCards((prevCards) => {
				trackEvent('add_tags_card_clicked', 'clicked_add_tags_card', {
					loginAddress: loginAddress || '',
					userId: id || '',
					userName: username || ''
				});
				const newCards = [...prevCards];
				newCards.push({
					clickHandler: () => {
						toggleEdit && toggleEdit();
					},
					description: 'Please include relevant tags to enhance post discoverability.',
					icon: '/assets/icons/rhs-card-icons/Plus.png',
					tag: cardTags.ADD_TAGS,
					title: 'Add Tags'
				});

				return newCards;
			});
		}

		if (!post_link && canEdit) {
			setRHSCards((prevCards) => {
				const newCards = [...prevCards];
				if (isOnchainPost) {
					trackEvent('link_description_card_clicked', 'clicked_link_description_card', {
						loginAddress: loginAddress || '',
						userId: id || '',
						userName: username || ''
					});
					newCards.push({
						clickHandler: () => {
							setOpenLinkCta(true);
							setCurrentIndex(0);
						},
						description: 'Please add contextual info for voters to make an informed decision',
						icon: '/assets/icons/rhs-card-icons/Doc.png',
						tag: cardTags.LINK_DISCUSSION,
						title: 'Link Discussion'
					});
					if (!content?.length) {
						trackEvent('add_description_card_clicked', 'clicked_add_description_card', {
							loginAddress: loginAddress || '',
							userId: id || '',
							userName: username || ''
						});
						newCards.push({
							clickHandler: () => setLinkingAndEditingOpen(true),
							description: 'Please add contextual info for voters to make an informed decision',
							icon: '/assets/icons/rhs-card-icons/Doc.png',
							tag: cardTags.ADD_DESCRIPTION,
							title: 'Add Description'
						});
					}
				}

				return newCards;
			});
		}

		return () => {
			setRHSCards([]);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canEdit, post_link, showDecisionDeposit, tags, toggleEdit, isOnchainPost, content, showRefundDeposit]);

	if (!RHSCards || RHSCards.length === 0) return null;

	return (
		<>
			{showDecisionDeposit && (
				<DecisionDepositCard
					trackName={trackName}
					openModal={openDecisionDeposit}
					setOpenModal={setOpenDecisionDeposit}
				/>
			)}
			<PostEditOrLinkCTA
				open={openLinkCta}
				setOpen={setOpenLinkCta}
				linkingAndEditingOpen={linkingAndEditingOpen}
				setLinkingAndEditingOpen={setLinkingAndEditingOpen}
			/>
			<div className='card relative mx-auto mb-9 h-32 w-full max-w-sm overflow-hidden rounded-3xl rounded-tr-none bg-[#f5f6f8] font-dmSans shadow-lg dark:bg-section-dark-background'>
				<div className='box relative h-full w-full'>
					<div className='slide relative flex sm:h-3/4'>
						{RHSCards.map((card, index) => (
							<div
								key={card.title}
								className={`${index === currentIndex ? 'flex' : 'hidden'} transition-all`}
							>
								<div className='absolute right-0 top-0 h-[45px] w-[90px] cursor-pointer rounded-bl-3xl bg-[#f5f6f8] before:absolute before:-bottom-6 before:right-0 before:aspect-square before:w-6 before:rounded-tr-2xl before:shadow-[6px_-6px_0_4px] before:shadow-[#f5f6f8] before:content-[""] after:absolute after:-left-6 after:top-0 after:aspect-square after:w-6 after:rounded-tr-2xl after:shadow-[6px_-6px_0_4px_black] after:shadow-[#f5f6f8] after:outline-none after:content-[""] dark:bg-section-dark-background before:dark:shadow-section-dark-background after:dark:shadow-section-dark-background'>
									<div
										className={`navigation-btn absolute bottom-2 left-2 right-0 top-0 z-10 flex items-center justify-center rounded-full bg-pink_primary p-1 text-sm font-medium capitalize tracking-wide text-white shadow-md ${
											loading && card.tag === cardTags.REFUND_DEPOSIT && 'cursor-progress opacity-50'
										}`}
										onClick={() => {
											card.clickHandler?.();
										}}
									>
										{card.tag}
									</div>
								</div>
								<div
									className={`card-slide flex h-full w-full items-center justify-center bg-rhs-card-gradient ${
										!!loading && card.tag === cardTags.REFUND_DEPOSIT && 'cursor-progress'
									} ${showDecisionDeposit ? 'gap-1 p-1' : 'gap-2 p-3'}`}
									onClick={card.clickHandler}
								>
									<Image
										src={card.icon}
										alt={card.title}
										width={60}
										height={60}
									/>
									<div className={`content ${showDecisionDeposit ? 'mr-[44px] mt-3' : 'mr-18'} text-white`}>
										<h5 className='mb-1 text-base font-semibold tracking-wide'>{card.title}</h5>
										<p className=' mb-0 break-words text-xs leading-tight'>
											{card.description}
											{showDecisionDeposit && (
												<Link
													href='https://wiki.polkadot.network/docs/learn-guides-treasury#place-a-decision-deposit-for-the-treasury-track-referendum'
													className='ml-1 cursor-pointer font-normal'
													target='_blank'
													onClick={(e) => {
														e.stopPropagation();
														e.preventDefault();
														window.open('https://wiki.polkadot.network/docs/learn-guides-treasury#place-a-decision-deposit-for-the-treasury-track-referendum', '_blank');
													}}
												>
													Details
													<Image
														src='/assets/icons/redirect.svg'
														alt='redirection-icon'
														width={14}
														height={14}
														className='-mt-0.5'
													/>
												</Link>
											)}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
					<div className='slide-indicator flex h-1/4 w-full items-center justify-center gap-2 bg-white dark:bg-section-dark-overlay'>
						{RHSCards.length > 1 && (
							<span
								className='mr-8 px-2'
								onClick={() => {
									prevSlide();
									setLoading(false);
								}}
							>
								<NavigatePrevIcon className='fill-current text-black dark:text-white' />
							</span>
						)}
						{RHSCards.map((_, index) => (
							<div
								key={index}
								className={`indicator h-2 w-2 rounded-full  ${index === currentIndex ? 'bg-rhs-indicator-gradient' : 'bg-section-light-container'}`}
							></div>
						))}
						{RHSCards.length > 1 && (
							<span
								className='ml-8 px-2'
								onClick={() => {
									nextSlide();
									setLoading(false);
								}}
							>
								<NavigateNextIcon className='fill-current text-black dark:text-white' />
							</span>
						)}
					</div>
				</div>
			</div>
			<SignupPopup
				setLoginOpen={setLoginOpen}
				modalOpen={openSignup}
				setModalOpen={setSignupOpen}
				isModal={true}
			/>
			<LoginPopup
				setSignupOpen={setSignupOpen}
				modalOpen={openLogin}
				setModalOpen={setLoginOpen}
				isModal={true}
			/>
			{showProgressReportUploadFlow(network, postData?.track_name, postData?.postType, postData) && <UploadReport />}
		</>
	);
};

export default RHSCardSlides;
