// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';

interface Props {
    heading?: string;
    subHeading?: string;
}

const Header: FC<Props> = ({ heading, subHeading }) => {
	return (
		<div>
			<h3 className='font-medium text-lg tracking-wide leading-7 text-sidebarBlue'>
				{heading}
			</h3>
			<p className='text-sm leading-6 tracking-wide mt-2 text-navBlue'>
				{subHeading}
			</p>
		</div>
	);
};

export default Header;