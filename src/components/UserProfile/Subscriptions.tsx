// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

const Subscriptions = () => {
	const [userData, setUserData] = useState({});
	const fetchSubscriptions = async () => {
		const { data, error } = await nextApiClientFetch('/api/v1/users/user-subscriptions', { proposalType: 'referendums_v2' });

		if (data) {
			setUserData(data);
		}
		console.log(error);
	};

	useEffect(() => {
		fetchSubscriptions();
	}, []);
	console.log('DATA', userData);

	return (
		<div
			className={
				'mt-6 flex min-h-[280px] flex-col gap-5 rounded-[14px] border-[1px] border-solid border-[#D2D8E0] bg-white px-6 pt-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
			}
		>
			<div>Hello world</div>
		</div>
	);
};

export default Subscriptions;
