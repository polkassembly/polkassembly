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

<<<<<<< HEAD
	return tags.length > 0 ? <div className='flex flex-wrap items-center xs:px-1 sm:px-2 sm:pb-4'>
		<span className='rounded-xl text-blue-light-high dark:text-blue-dark-high font-medium text-sm' >Filters: &nbsp;</span>
		{tags.map((tag, index) => (
			<div className='rounded-xl text-lightBlue text-sm font-normal xs:flex xs:flex-wrap' key= {index}>
				{tag.charAt(0).toUpperCase()+tag.slice(1)} {tags.length === index+1 ? null :','}
			</div>
		))}
	</div>:null;
=======
	return tags.length > 0 ? (
		<div className='flex flex-wrap items-center xs:px-1 sm:px-2 sm:pb-4'>
			<span className='rounded-xl text-sm font-medium text-bodyBlue'>Filters: &nbsp;</span>
			{tags.map((tag, index) => (
				<div
					className='rounded-xl text-sm font-normal text-lightBlue xs:flex xs:flex-wrap'
					key={index}
				>
					{tag.charAt(0).toUpperCase() + tag.slice(1)} {tags.length === index + 1 ? null : ','}
				</div>
			))}
		</div>
	) : null;
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
};
export default FilteredTags;
