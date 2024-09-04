import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import React from 'react'
import SwipableVotingCards from './SwipableVotingCards';
const VoteCart = dynamic(() => import('~src/components/TinderStyleVoting/VoteCart'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const VotingOptions = () => {
  return (
    <section className='flex gap-x-4 w-full mb-[200px]'>
        <article className='h-[557px] w-[70%] items-center justify-start gap-x-3 rounded-xl bg-white dark:bg-black'>
          <div className='p-5 h-[557px] bg-transparent w-full drop-shadow-lg'>
            <SwipableVotingCards />
          </div>
        </article>

        {/* add confirm batch vote CTA inside voteCard component and fix max-h-[662px] to 557px */}
        <article className='h-[557px] w-[30%] items-center justify-start gap-x-3 rounded-xl bg-white dark:bg-black'><VoteCart isUsedInWebView={true}/></article>
    </section>
  )
}

export default VotingOptions