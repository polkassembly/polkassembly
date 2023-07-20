// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Result } from 'antd';
import Link from 'next/link';
import React from 'react';

import NothingFoundSVG from '~assets/nothing-found.svg';

const NotFound = () => {
  return (
    <Result
      icon={
        <div className="w-1/2 h-auto mx-auto max-w-[900px]">
          <NothingFoundSVG />
        </div>
      }
      title="Uh oh, it seems this route doesn't exist."
      extra={
        <Link
          href="/"
          className="py-2 px-6 bg-pink_primary text-white border-white hover:bg-pink_secondary rounded-md text-lg h-[50px] w-[215px]"
        >
          Go To Home
        </Link>
      }
    />
  );
};

export default NotFound;
