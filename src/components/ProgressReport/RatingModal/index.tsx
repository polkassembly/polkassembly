// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Divider, Rate } from 'antd';

const desc = ['terrible', 'bad', 'normal', 'good', 'wonderful'];

const RatingModal = () => {
	const [value, setValue] = useState(3);

	return (
		<>
			<section className='flex flex-col gap-y-2'>
				<h1 className='text-normal text-lg text-bodyBlue dark:text-section-dark-overlay'>Summary of Progress Report</h1>
				<Divider
					dashed={true}
					className='my-4'
				/>
				<div className='flex flex-col items-center justify-center gap-y-2'>
					<h1 className='text-normal text-lg text-bodyBlue dark:text-section-dark-overlay'>Rate Delievery</h1>
					<>
						<Rate
							tooltips={desc}
							onChange={setValue}
							value={value}
							className='-mt-3 scale-[3]'
						/>
						<p className='mt-4 text-xs text-sidebarBlue dark:text-section-light-overlay'>24 users have already rated the progress report.</p>
					</>
				</div>
			</section>
		</>
	);
};

export default RatingModal;
