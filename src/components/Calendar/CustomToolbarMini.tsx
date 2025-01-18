// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import 'react-big-calendar/lib/css/react-big-calendar.css';

import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { dayjs } from 'dayjs-init';
import React, { useEffect } from 'react';

function CustomToolbarMini(props: any) {
	function addMonths(date: any, months: any) {
		const d = date.getDate();
		date.setMonth(date.getMonth() + months);
		if (date.getDate() != d) {
			date.setDate(0);
		}
		return date;
	}

	const goToBack = () => {
		props.onNavigate('prev', addMonths(props.date, -1));
		props.date.setYear(props.date?.getFullYear());
		props.setSelectedDate(props?.date);
	};

	const goToNext = () => {
		props.onNavigate('next', addMonths(props.date, +1));
		props.date.setYear(props.date?.getFullYear());
		props.setSelectedDate(props?.date);
	};

	useEffect(() => {
		props.date.setMonth(props.date.getMonth());
		props.date.setYear(props.date.getFullYear());
		props.onNavigate('current');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		props.date && (
			<div className='flex items-center justify-between gap-5'>
				<div className='mb-3 flex items-center justify-between px-3 '>
					<LeftOutlined
						onClick={goToBack}
						className='text-md cursor-pointer font-medium hover:font-bold hover:text-sidebarBlue dark:text-icon-dark-inactive'
					/>
					<span className=' mx-3 text-xl font-semibold text-sidebarBlue dark:text-blue-dark-medium'>{dayjs(props.date).format('MMMM YYYY')}</span>
					<RightOutlined
						onClick={goToNext}
						className='text-md cursor-pointer font-medium hover:font-bold  hover:text-sidebarBlue dark:text-icon-dark-inactive'
					/>
				</div>
			</div>
		)
	);
}

export default CustomToolbarMini;
