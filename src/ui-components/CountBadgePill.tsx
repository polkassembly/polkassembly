// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';

const CountBadgePill = ({
	className,
	label,
	count
}: {
  className?: string;
  label?: string;
  count?: number;
}) => (
	<div className={`${className} flex items-center gap-x-1 capitalize`}>
		{label && label}
		{count != null && count != undefined && (
			<span className="text-xs font-medium">({count})</span>
		)}
	</div>
);

export default CountBadgePill;
