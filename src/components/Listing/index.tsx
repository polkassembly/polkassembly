// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import React, { FC } from 'react';
import { poppins } from 'pages/_app';
import GovernanceCard from 'src/components/GovernanceCard';
import { PostEmptyState } from 'src/ui-components/UIStates';

import {
  getSinglePostLinkFromProposalType,
  ProposalType,
} from '~src/global/proposalType';

interface IListingProps {
  className?: string;
  posts?: any[];
  proposalType: ProposalType;
  isTip?: boolean;
  tipStartedIndex?: number;
}

const Listing: FC<IListingProps> = (props) => {
  const { className, posts, proposalType, isTip, tipStartedIndex } = props;

  if (!posts || !posts.length) {
    return (
      <div className={className}>
        <PostEmptyState postCategory={proposalType} />
      </div>
    );
  }

  return (
    <div className={`${className} proposals__list`}>
      {posts.map((post, index) => {
        const {
          cid,
          curator,
          post_id,
          post_reactions,
          proposer,
          comments_count,
          status,
          title,
          topic,
          created_at,
          hash,
          description,
          method,
          end,
          tags,
          spam_users_count,
        } = post;
        const id = isTip ? hash : post_id;
        return (
          <div key={id} className="my-0">
            {
              <Link
                href={`/${getSinglePostLinkFromProposalType(
                  proposalType,
                )}/${id}`}
              >
                <GovernanceCard
                  className={`${(index + 1) % 2 !== 0 && 'bg-[#FBFBFC]'} ${
                    poppins.variable
                  } ${poppins.className}`}
                  cid={cid}
                  postReactionCount={post_reactions}
                  address={proposer || curator}
                  commentsCount={comments_count || 0}
                  end={end}
                  method={method}
                  tipReason={isTip && description}
                  onchainId={id}
                  status={status}
                  title={title || description}
                  topic={topic && topic?.name ? topic.name : ''}
                  created_at={created_at}
                  tip_index={tipStartedIndex ? tipStartedIndex - index : null}
                  isTip={isTip}
                  tags={tags}
                  spam_users_count={spam_users_count}
                />
              </Link>
            }
          </div>
        );
      })}
    </div>
  );
};

export default Listing;
