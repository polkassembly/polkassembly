// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import styled from 'styled-components';

// import TipsPostCard from './TipsPostCard';

interface Props {
  className?: string;
  openSidebar: (postID: number) => void;
}

const TipsBoard = ({ className }: Props) => {
  return (
    <div className={className}>
      <h3>
        Tips <span className="card-count"></span>
      </h3>
      <p>Coming Soon...</p>

      {/* {[1,2,3,4].map(item => (
				<div key={item} className='post-card-div' onClick={() => openSidebar(item)}>
					<TipsPostCard />
				</div>
			))} */}
    </div>
  );
};

export default styled(TipsBoard)`
  p {
    font-size: 16px;
    margin-bottom: 40px;
  }
`;
