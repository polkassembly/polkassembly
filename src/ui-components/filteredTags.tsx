// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const FilteredTags = () => {
	const [tags, setTags] = useState<string[]>([]);
	const router = useRouter();

	useEffect(() => {
		if (router.query.filterBy) {
			const filterBy = router.query.filterBy;
			setTags(JSON.parse(decodeURIComponent(String(filterBy))) || []);
		} else {
			setTags([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router]);

	return tags.length > 0 ? (
		<div className='flex flex-wrap items-center xs:px-1 sm:px-2 sm:pb-4'>
			<div className='flex items-center rounded bg-[#FDF0F7] px-2 py-1'>
				<span className='rounded-xl text-xs font-medium text-pink_primary'>Tags: &nbsp;</span>
				{tags.map((tag, index) => (
					<div
						className='traking-2 mr-1 h-[22px] rounded-full border-[1px] border-solid border-navBlue px-[14px] text-[10px] text-lightBlue hover:border-pink_primary hover:text-pink_primary'
						key={index}
					>
						{tag.charAt(0).toUpperCase() + tag.slice(1)}
					</div>
				))}
			</div>
		</div>
	) : null;
};
export default FilteredTags;
