// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const useGetFilterByFromUrl = () => {
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
	}, []);
	return tags;
};

export default useGetFilterByFromUrl;
