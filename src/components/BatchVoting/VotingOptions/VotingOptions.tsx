import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import React from 'react'
import VotingCards from '~src/components/TinderStyleVoting';
const VoteCart = dynamic(() => import('~src/components/TinderStyleVoting/VoteCart'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const VotingOptions = () => {
  return (
    <section className='flex gap-x-4 w-full'>
        <article className='h-full w-[70%] items-center justify-start gap-x-3 rounded-xl bg-white dark:bg-black'><VotingCards /></article>

        {/* add confirm batch vote CTA inside voteCard component */}
        <article className='h-full w-[30%] items-center justify-start gap-x-3 rounded-xl bg-white dark:bg-black'><VoteCart isUsedInWebView={true}/></article>
    </section>
  )
}

export default VotingOptions