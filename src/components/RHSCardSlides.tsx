// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import NavigateNextIcon from '~assets/icons/navigate-next.svg';
import NavigatePrevIcon from '~assets/icons/navigate-prev.svg';
import CloseCardIcon from '~assets/icons/rhs-card-icons/close-card.svg';
import { usePostDataContext } from '~src/context';
import PostEditOrLinkCTA from './Post/GovernanceSideBar/PostEditOrLinkCTA';
import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import { checkIsOnChainPost } from '~src/global/proposalType';

const DecisionDepositCard = dynamic(() => import('~src/components/OpenGovTreasuryProposal/DecisionDepositCard'), {
	loading: () => <Skeleton active />,
	ssr: false
});

type card = { title: string; description: string; icon: string; tag: string; clickHandler?: (() => void) | ((prop: any) => void) };

enum cardTags {
	ADD_DEADLINE = 'add-deadline',
	LINK_DISCUSSION = 'link-discussion',
	DECISION_DEPOSIT = 'decision-deposit',
	ADD_TAGS = 'add-tags'
}

type props = { canEdit: any; showDecisionDeposit: any; trackName: string; toggleEdit: (() => void) | undefined };
const RHSCardSlides = ({ canEdit, showDecisionDeposit, trackName, toggleEdit }: props) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isReversed, setIsReversed] = useState(false);
	const [RHSCards, setRHSCards] = useState<card[]>([]);
	const [openDecisionDeposit, setOpenDecisionDeposit] = useState(false);
	const [linkingAndEditingOpen, setLinkingAndEditingOpen] = useState(false);
	const [openLinkCta, setOpenLinkCta] = useState(false);

	const {
		postData: { post_link, tags, postType }
	} = usePostDataContext();

	const isOnchainPost = checkIsOnChainPost(postType);

	const nextSlide = () => {
		setCurrentIndex((prevIndex) => {
			const newIndex = prevIndex === RHSCards.length - 1 ? 0 : prevIndex + 1;
			return isReversed && newIndex === 0 ? prevIndex : newIndex;
		});
	};

	const prevSlide = () => {
		setCurrentIndex((prevIndex) => {
			const newIndex = prevIndex === 0 ? RHSCards.length - 1 : prevIndex - 1;
			return !isReversed && newIndex === RHSCards.length - 1 ? prevIndex : newIndex;
		});
	};

	const closeCardSlides = () => {
		setRHSCards([]);
	};

	useEffect(() => {
		if (canEdit && !(tags && Array.isArray(tags) && tags.length > 0)) {
			setRHSCards((prevCards) => {
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
				newCards.push({
					clickHandler: () => (isOnchainPost ? setOpenLinkCta(true) : setLinkingAndEditingOpen(true)),
					description: 'Please add contextual info for voters to make an informed decision',
					icon: '/assets/icons/rhs-card-icons/Doc.png',
					tag: cardTags.LINK_DISCUSSION,
					title: isOnchainPost ? 'Link Discussion' : 'Link Onchain Post'
				});

				return newCards;
			});
		}

		if (showDecisionDeposit) {
			setRHSCards((prevCards) => {
				const newCards = [...prevCards];
				newCards.push({
					clickHandler: () => setOpenDecisionDeposit(true),
					description: 'To be paid before completion of decision period; payable by anyone',
					icon: '/assets/icons/rhs-card-icons/Crystal.png',
					tag: cardTags.DECISION_DEPOSIT,
					title: 'Decision Deposit'
				});

				return newCards;
			});
		}

		return () => {
			setRHSCards([]);
		};
	}, [canEdit, post_link, showDecisionDeposit, tags, toggleEdit, isOnchainPost]);

	useEffect(() => {
		if (RHSCards.length <= 1) {
			return;
		}
		if (currentIndex === RHSCards.length - 1 && !isReversed) {
			setIsReversed(true);
		} else if (currentIndex === 0 && isReversed) {
			setIsReversed(false);
		}
	}, [currentIndex, isReversed, RHSCards]);

	const handleTransitionButtonClick = () => {
		if (!isReversed) {
			nextSlide();
		} else {
			prevSlide();
		}
	};

	if (!RHSCards || RHSCards.length === 0) return null;

	return (
		<>
			<DecisionDepositCard
				trackName={trackName}
				openModal={openDecisionDeposit}
				setOpenModal={setOpenDecisionDeposit}
			/>
			<PostEditOrLinkCTA
				open={openLinkCta}
				setOpen={setOpenLinkCta}
				linkingAndEditingOpen={linkingAndEditingOpen}
				setLinkingAndEditingOpen={setLinkingAndEditingOpen}
			/>
			<div className='card relative mb-9 h-32 w-full max-w-sm overflow-hidden rounded-3xl bg-[#f5f6f8] font-poppins shadow-lg dark:bg-section-dark-background'>
				<div className='box relative h-full w-full'>
					<div className='absolute right-0 top-0 aspect-square w-16 rounded-bl-[50%] bg-[#f5f6f8] before:absolute before:-bottom-6 before:right-0 before:aspect-square before:w-6 before:rounded-tr-2xl before:shadow-[6px_-6px_0_4px] before:shadow-[#f5f6f8] before:content-[""] after:absolute after:-left-6 after:top-0 after:aspect-square after:w-6 after:rounded-tr-2xl after:shadow-[6px_-6px_0_4px_black] after:shadow-[#f5f6f8] after:outline-none after:content-[""] dark:bg-section-dark-background before:dark:shadow-section-dark-background after:dark:shadow-section-dark-background'>
						<div
							className='navigation-btn absolute inset-2 z-10 flex items-center justify-center rounded-full bg-white shadow-md dark:bg-section-dark-overlay'
							onClick={RHSCards.length === 1 ? closeCardSlides : handleTransitionButtonClick}
						>
							{RHSCards.length === 1 ? (
								<CloseCardIcon className='fill-current text-black dark:text-white' />
							) : !isReversed ? (
								<NavigateNextIcon className='fill-current text-black dark:text-white' />
							) : (
								<NavigatePrevIcon className='fill-current text-black dark:text-white' />
							)}
						</div>
					</div>
					<div className='card-slide h-3/4'>
						{RHSCards.map((card, index) => (
							<div
								className={`slide flex h-full w-full cursor-pointer items-center justify-center gap-2 bg-rhs-card-gradient p-3 ${index === currentIndex ? 'flex' : 'hidden'}`}
								key={card.title}
								onClick={card.clickHandler}
							>
								<Image
									src={card.icon}
									alt={card.title}
									width={60}
									height={60}
								/>
								<div className='content mr-14 text-white'>
									<h5 className='mb-1 text-base font-semibold tracking-wide'>{card.title}</h5>
									<p className='mb-0 break-words text-xs leading-tight'>{card.description}</p>
								</div>
							</div>
						))}
					</div>
					<div className='slide-indicator flex h-1/4 w-full items-center justify-center gap-2 bg-white dark:bg-section-dark-overlay'>
						{RHSCards.map((_, index) => (
							<div
								key={index}
								className={`indicator h-2 w-2 rounded-full  ${index === currentIndex ? 'bg-rhs-indicator-gradient' : 'bg-[#D2D8E0]'}`}
							></div>
						))}
					</div>
				</div>
			</div>
		</>
	);
};

export default RHSCardSlides;
