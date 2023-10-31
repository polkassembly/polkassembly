// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IPostTag } from '~src/types';

const handleFilterResults = (defaultTags: IPostTag[], setDefaultTag: (string: IPostTag[]) => void, selectedTags: string[], searchInput: string) => {
	const keyword = searchInput.toLowerCase();
	const filteredData = defaultTags.filter((tag: IPostTag) => {
		const item = tag.name.toLowerCase();
		return item.indexOf(keyword) > -1;
	});

	const data = filteredData.filter((item: IPostTag) => {
		let count = 0;
		selectedTags.map((tag: string) => {
			if (item.name === tag) count++;
		});
		if (count === 0) return item;
	});
	setDefaultTag(data);
};
export default handleFilterResults;
