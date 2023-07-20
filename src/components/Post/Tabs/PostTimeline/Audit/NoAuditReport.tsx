// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import NoDataFound from '~assets/no-audits.svg';

const NoAuditReport = () => {
	return (
		<div className="flex flex-col gap-y-6 justify-center items-center">
			<div className="mt-[75px]">
				<NoDataFound />
			</div>
			<p className="m-0 text-sm font-medium leading-[21px] tracking-[0.01em] text-[#243A57]">
        No audit reports available
			</p>
		</div>
	);
};

export default NoAuditReport;
