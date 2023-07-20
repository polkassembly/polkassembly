// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Select } from 'antd';
import { IUserPost } from 'pages/api/v1/listing/user-posts';
import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { ArrowDownIcon } from '~src/ui-components/CustomIcons';
import PostTab from '../User/PostTab';

export const getLabel = (str: string) => {
  const newStr = str.split('_').join(' ');
  return newStr.charAt(0).toUpperCase() + newStr.slice(1);
};

interface IGovTabProps {
  className?: string;
  posts:
    | {
        discussions: {
          posts: IUserPost[];
        };
        root: IUserPost[];
        staking_admin: IUserPost[];
        auction_admin: IUserPost[];
        governance: {
          lease_admin: IUserPost[];
          general_admin: IUserPost[];
          referendum_canceller: IUserPost[];
          referendum_killer: IUserPost[];
        };
        treasury: {
          treasurer: IUserPost[];
          small_tipper: IUserPost[];
          big_tipper: IUserPost[];
          small_spender: IUserPost[];
          medium_spender: IUserPost[];
          big_spender: IUserPost[];
        };
        fellowship: {
          member_referenda: IUserPost[];
          whitelisted_caller: IUserPost[];
          fellowship_admin: IUserPost[];
        };
      }
    | {
        discussions: {
          posts: IUserPost[];
        };
        democracy: {
          referenda: IUserPost[];
          proposals: IUserPost[];
        };
        treasury: {
          treasury_proposals: IUserPost[];
          bounties: IUserPost[];
          tips: IUserPost[];
        };
        collective: {
          council_motions: IUserPost[];
          tech_comm_proposals: IUserPost[];
        };
      };
}

const GovTab: FC<IGovTabProps> = (props) => {
  const { posts, className } = props;
  const [selectedPostsType, setSelectedPostsType] = useState('discussions');
  const [selectedPost, setSelectedPost] = useState('posts');
  return (
    <div className={className}>
      <Select
        suffixIcon={<ArrowDownIcon className="text-[#90A0B7]" />}
        value={selectedPostsType}
        className="select"
        onChange={(v) => {
          setSelectedPostsType(v);
          const obj = (posts as any)?.[v];
          if (obj && !Array.isArray(obj)) {
            const objKeys = Object.keys(obj);
            if (objKeys && objKeys.length > 0) {
              setSelectedPost(objKeys[0]);
            }
          }
        }}
        options={Object.keys(posts).map((key) => ({
          label: getLabel(key),
          value: key,
        }))}
      />
      <div className="my-5 flex items-center gap-x-2 max-w-full overflow-x-auto scroll-hidden">
        {(posts as any)?.[selectedPostsType] &&
          !Array.isArray((posts as any)?.[selectedPostsType]) &&
          Object.keys((posts as any)?.[selectedPostsType]).map((key) => {
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedPost(key);
                }}
                className={`flex items-center justify-center whitespace-nowrap font-medium text-xs leading-[18px] border border-solid outline-none rounded-[50px] px-3 py-1 ${
                  selectedPost === key
                    ? 'bg-pink_primary text-white border-pink_primary'
                    : 'bg-transparent border-[#90A0B7] text-[#90A0B7]'
                }`}
              >
                {getLabel(key)}
              </button>
            );
          })}
      </div>
      <div>
        {(posts as any)?.[selectedPostsType] &&
        Array.isArray((posts as any)?.[selectedPostsType]) ? (
          <PostTab posts={(posts as any)?.[selectedPostsType]} />
        ) : (
          (posts as any)?.[selectedPostsType]?.[selectedPost] &&
          Array.isArray(
            (posts as any)?.[selectedPostsType]?.[selectedPost],
          ) && (
            <PostTab
              posts={(posts as any)?.[selectedPostsType]?.[selectedPost]}
            />
          )
        )}
      </div>
    </div>
  );
};

export default styled(GovTab)`
  .select .ant-select-selector {
    border: none !important;
  }
  .select .ant-select-selection-item {
    font-style: normal !important;
    font-weight: 600 !important;
    font-size: 20px !important;
    line-height: 30px !important;
    letter-spacing: 0.0015em !important;
    color: #334d6e !important;
  }
`;
