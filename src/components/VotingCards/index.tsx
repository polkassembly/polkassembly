// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useMemo, useRef, useState } from 'react';
import TinderCard from 'react-tinder-card';
import { StopOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import LikeWhite from '~assets/icons/like-white.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';

interface IVotingCards {
	trackPosts?: any;
}

const VotingCards: FC<IVotingCards> = (props) => {
	const { trackPosts } = props;
	console.log(trackPosts);
	const [currentIndex, setCurrentIndex] = useState(trackPosts?.posts?.length - 1);
	const currentIndexRef = useRef(currentIndex);

	const childRefs: any = useMemo(
		() =>
			Array(trackPosts?.posts?.length)
				.fill(0)
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				.map((i) => React.createRef()),
		[trackPosts?.posts?.length]
	);

	const updateCurrentIndex = (val: any) => {
		setCurrentIndex(val);
		currentIndexRef.current = val;
	};

	const canGoBack = currentIndex < trackPosts?.posts?.length - 1;

	const canSwipe = currentIndex >= 0;

	const swiped = (direction: string, index: number) => {
		console.log(direction);
		updateCurrentIndex(index - 1);
	};

	const outOfFrame = (name: string, idx: number) => {
		console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current);
		currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
	};

	const swipe = async (dir: any) => {
		if (canSwipe && currentIndex < trackPosts?.posts?.length) {
			await childRefs[currentIndex].current.swipe(dir);
		}
	};

	const goBack = async () => {
		if (!canGoBack) return;
		const newIndex = currentIndex + 1;
		updateCurrentIndex(newIndex);
		await childRefs[newIndex].current.restoreCard();
	};

	return (
		<div className='flex h-screen w-full flex-col items-center'>
			<div className='mb-4 flex w-full justify-between'>
				<button
					className='mr-auto flex h-[24px] w-[24px] items-center justify-center rounded-full border-none bg-[#ffffff] drop-shadow-2xl'
					onClick={() => goBack()}
				>
					<LeftOutlined className='text-black' />
				</button>
				<p className='m-0 p-0 text-base font-semibold text-bodyBlue'>Active Proposals</p>
				<button
					className='ml-auto flex h-[24px] w-[24px] items-center justify-center rounded-full border-none bg-[#ffffff] drop-shadow-2xl'
					onClick={() => goBack()}
				>
					<RightOutlined className='text-black' />
				</button>
			</div>
			<div className='relative h-full w-full max-w-sm'>
				{trackPosts?.posts?.map((character: any, index: number) => (
					<TinderCard
						ref={childRefs[index]}
						className='absolute h-full w-full'
						key={character.name}
						onSwipe={(dir) => swiped(dir, index)}
						onCardLeftScreen={() => outOfFrame(character.name, index)}
						preventSwipe={['down']}
					>
						<div className='flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-white p-4 shadow-lg'>
							<div className='h-full overflow-y-auto'>
								<h3 className='text-xl font-bold'>{character.title}</h3>
								<p>
									Overview DOT Play Project Name: Dot Play: Accelerate Gaming Adoption of Polkadot Following our successful application to the DFF as the specialized business
									development arm for Polkadot gaming, along with the establishment of Dot Play as curators of the Games Bounty, we are submitting a new proposal herein. The
									details are identical to the original Dot Play bounty, except that we have adjusted the amount requested to 400k DOT from 1 million DOT. This accounts for the
									100k DOT that previously existed in the Games Bounty, and provides an opportunity to demonstrate our abilities as responsible stewards of Treasury capital. Below
									please find our ambitious road map to create a games accelerator for the Polkadot ecosystem, using our resources and IP relationships, game studio talent, and
									tools. Background and Teams Game Master Partners The team has deep experience and expertise both in the gaming industry and in Polkadot. Nicholas Douzinas is
									Co-Founder of Ajuna Network and Angela Dalton, CEO & Founder of Signum Growth, has a 20-year history in the gaming vertical as an analyst, investor, and board
									member, including as a seed round investor in Mythical and as board member of the largest esports org, FaZe Clan. She also served as Lead Advisor to the Web3
									Foundation on the launch of the Polkadot network. Overview DOT Play Project Name: Dot Play: Accelerate Gaming Adoption of Polkadot Following our successful
									application to the DFF as the specialized business development arm for Polkadot gaming, along with the establishment of Dot Play as curators of the Games Bounty,
									we are submitting a new proposal herein. The details are identical to the original Dot Play bounty, except that we have adjusted the amount requested to 400k DOT
									from 1 million DOT. This accounts for the 100k DOT that previously existed in the Games Bounty, and provides an opportunity to demonstrate our abilities as
									responsible stewards of Treasury capital. Below please find our ambitious road map to create a games accelerator for the Polkadot ecosystem, using our resources
									and IP relationships, game studio talent, and tools. Background and Teams Game Master Partners The team has deep experience and expertise both in the gaming
									industry and in Polkadot. Nicholas Douzinas is Co-Founder of Ajuna Network and Angela Dalton, CEO & Founder of Signum Growth, has a 20-year history in the gaming
									vertical as an analyst, investor, and board member, including as a seed round investor in Mythical and as board member of the largest esports org, FaZe Clan. She
									also served as Lead Advisor to the Web3 Foundation on the launch of the Polkadot network.
								</p>
							</div>
							<div className='bg-custom-gradient absolute bottom-0 left-0 h-24 w-full'></div>
						</div>
					</TinderCard>
				))}
			</div>
			<div className='sticky bottom-[48px] z-10 flex w-full items-center justify-center gap-x-6 p-4'>
				<button
					className='flex h-[46px] w-[46px] items-center justify-center rounded-full border-none bg-[#F53C3C] drop-shadow-2xl'
					onClick={() => swipe('left')}
				>
					<DislikeWhite className='' />
				</button>
				<button
					className='flex h-[60px] w-[60px] items-center justify-center rounded-full border-none bg-[#ffffff] drop-shadow-2xl'
					onClick={() => swipe('up')}
				>
					<StopOutlined className={'text-2xl text-lightBlue'} />
				</button>
				<button
					className='flex h-[46px] w-[46px] items-center justify-center rounded-full border-none bg-[#2ED47A] drop-shadow-2xl'
					onClick={() => swipe('right')}
				>
					<LikeWhite className='' />
				</button>
			</div>
		</div>
	);
};

export default VotingCards;
