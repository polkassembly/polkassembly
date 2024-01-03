// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import NavigateNextIcon from '~assets/icons/navigate-next.svg';
import NavigatePrevIcon from '~assets/icons/navigate-prev.svg';
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
	ADD_DEADLINE = 'add',
	LINK_DISCUSSION = 'link',
	DECISION_DEPOSIT = 'pay',
	ADD_DESCRIPTION = 'add',
	ADD_TAGS = 'add'
}

type props = { canEdit: any; showDecisionDeposit: any; trackName: string; toggleEdit: (() => void) | null };
const RHSCardSlides = ({ canEdit, showDecisionDeposit, trackName, toggleEdit }: props) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [RHSCards, setRHSCards] = useState<card[]>([]);
	const [openDecisionDeposit, setOpenDecisionDeposit] = useState(false);
	const [linkingAndEditingOpen, setLinkingAndEditingOpen] = useState(false);
	const [openLinkCta, setOpenLinkCta] = useState(false);

	const {
		postData: { post_link, tags, postType, content }
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

	useEffect(() => {
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
				if (isOnchainPost) {
					newCards.push({
						clickHandler: () => setOpenLinkCta(true),
						description: 'Please add contextual info for voters to make an informed decision',
						icon: '/assets/icons/rhs-card-icons/Doc.png',
						tag: cardTags.LINK_DISCUSSION,
						title: 'Link Discussion'
					});
					if (!content?.length) {
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
	}, [canEdit, post_link, showDecisionDeposit, tags, toggleEdit, isOnchainPost, content]);

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
			<div className='card relative mx-auto mb-9 h-32 w-full max-w-sm overflow-hidden rounded-3xl rounded-tr-none bg-[#f5f6f8] font-poppins shadow-lg dark:bg-section-dark-background'>
				<div className='box relative h-full w-full'>
					<div className='slide relative flex h-3/4'>
						{RHSCards.map((card, index) => (
							<div
								key={card.title}
								className={`${index === currentIndex ? 'flex' : 'hidden'} transition-all`}
							>
								<div className='absolute right-0 top-0 h-[45px] w-[90px] cursor-pointer rounded-bl-3xl bg-[#f5f6f8] before:absolute before:-bottom-6 before:right-0 before:aspect-square before:w-6 before:rounded-tr-2xl before:shadow-[6px_-6px_0_4px] before:shadow-[#f5f6f8] before:content-[""] after:absolute after:-left-6 after:top-0 after:aspect-square after:w-6 after:rounded-tr-2xl after:shadow-[6px_-6px_0_4px_black] after:shadow-[#f5f6f8] after:outline-none after:content-[""] dark:bg-section-dark-background before:dark:shadow-section-dark-background after:dark:shadow-section-dark-background'>
									<div
										className='navigation-btn absolute bottom-2 left-2 right-0 top-0 z-10 flex items-center justify-center  rounded-full bg-pink_primary p-1 text-base font-medium capitalize text-white shadow-md'
										onClick={card.clickHandler}
									>
										{card.tag}
									</div>
								</div>
								<div className='card-slide flex h-full w-full  items-center justify-center gap-2 bg-rhs-card-gradient p-3'>
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
							</div>
						))}
					</div>
					<div className='slide-indicator flex h-1/4 w-full items-center justify-center gap-2 bg-white dark:bg-section-dark-overlay'>
						{RHSCards.length > 1 && (
							<span
								className='mr-8 px-2'
								onClick={prevSlide}
							>
								<NavigatePrevIcon className='fill-current text-black dark:text-white' />
							</span>
						)}
						{RHSCards.map((_, index) => (
							<div
								key={index}
								className={`indicator h-2 w-2 rounded-full  ${index === currentIndex ? 'bg-rhs-indicator-gradient' : 'bg-[#D2D8E0]'}`}
							></div>
						))}
						{RHSCards.length > 1 && (
							<span
								className='ml-8 px-2'
								onClick={nextSlide}
							>
								<NavigateNextIcon className='fill-current text-black dark:text-white' />
							</span>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default RHSCardSlides;
