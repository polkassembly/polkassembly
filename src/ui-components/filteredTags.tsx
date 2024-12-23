// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useRouter } from 'next/router';
import React, { FC, useEffect, useState } from 'react';

interface IFilteredTags {
	statusItem?: any[];
	count?: number;
}

const FilteredTags: FC<IFilteredTags> = (props) => {
	const { statusItem, count } = props;
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

	return (
		<div className='flex items-center gap-x-2'>
			{tags.length > 0 ? (
				<div className='flex flex-wrap items-center sm:pb-4'>
					<div className='flex h-[30px] items-center rounded-lg bg-[#FDF0F7] px-2 py-1 dark:bg-pink-dark-primary'>
						<span className='rounded-xl text-xs font-medium text-pink_primary dark:text-icon-dark-inactive'>Tags: &nbsp;</span>
						{tags.map((tag, index) => (
							<div
								className='traking-2 mr-1 flex h-[22px] items-center rounded-full border-[1px] border-solid border-navBlue px-[14px] text-[10px] text-lightBlue hover:border-pink_primary hover:text-pink_primary dark:text-white'
								key={index}
							>
								{tag.charAt(0).toUpperCase() + tag.slice(1)}
							</div>
						))}
						<p className='m-0 ml-1 p-0 text-xs'>({count})</p>
					</div>
				</div>
			) : null}
			{statusItem && statusItem?.length > 0 ? (
				<div className='flex flex-wrap items-center sm:pb-4'>
					<div className='flex h-[30px] items-center rounded bg-[#FDF0F7] px-2 py-1 dark:bg-[#33071E]'>
						<span className='rounded-xl text-xs font-medium text-pink_primary dark:text-icon-dark-inactive'>Status: &nbsp;</span>
						<div className='traking-2 mr-1 flex text-[12px] text-bodyBlue hover:border-pink_primary hover:text-pink_primary dark:text-white'>
							{statusItem.map((status, index) => (
								<div
									className='traking-2 mr-1 flex text-[12px] text-lightBlue hover:border-pink_primary hover:text-pink_primary dark:text-white'
									key={index}
								>
									{status.charAt(0).toUpperCase() + status.slice(1)}
									{statusItem?.length > 1 && index < statusItem.length - 1 ? ', ' : ''}
								</div>
							))}
							<p className='m-0 ml-1 p-0'>({count})</p>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
};
export default FilteredTags;
