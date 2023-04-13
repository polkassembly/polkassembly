// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const FilteredTags = () => {

	const [tags, setTags] = useState<string[]>([]);
	const router = useRouter();

	useEffect(() => {
		if(router.query.filterBy){
			const filterBy=router.query.filterBy;
			setTags(JSON.parse(decodeURIComponent(String(filterBy))) || []);
		}else{
			setTags([]);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router]);

	return tags.length > 0 ? <div className='flex items-center'>
		<span className='rounded-xl text-sidebarBlue py-[4px] pr-[16px] font-medium flex items-center text-sm' >Filters :</span>
		{tags.map((tag, index) => (
			<div className='rounded-xl text-navBlue py-[4px] px-[2px] text-xs tracking-wide font-normal' key= {index}>
				{tag} {tags.length === index+1 ? null :','}
			</div>
		))}
	</div>:null;
};
export default FilteredTags;