// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import 'react-big-calendar/lib/css/react-big-calendar.css';

import React from 'react';
import { dayjs } from 'dayjs-init';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Tooltip from '~src/basic-components/Tooltip';

function CustomToolbar(props: any) {
	function createEventButton(disabled: boolean = false) {
		return (
			<div>
				<CustomButton
					variant='primary'
					disabled={disabled}
					onClick={() => {
						if (!disabled) props.setSidebarCreateEvent(true);
					}}
					className='ml-2 rounded-md border-pink_primary text-white'
					buttonsize='xs'
					text='Create Event'
				/>
			</div>
		);
	}

	return (
		props.date && (
			<div className='custom-calendar-toolbar'>
				<div className='flex flex-col md:flex-row md:items-center md:gap-2'>
					<h1 className='text-xl font-semibold'> Event </h1>
					<p className='mb-2 text-sm font-medium text-sidebarBlue dark:text-white'>{dayjs(props.date).format('MMMM Do, YYYY')} </p>
				</div>

				<div className='ml-auto'>
					{!props.isLoggedIn ? (
						<Tooltip
							color='#E5007A'
							title='Please login to create an event'
							placement='top'
						>
							{createEventButton(true)}
						</Tooltip>
					) : (
						createEventButton()
					)}
				</div>
			</div>
		)
	);
}

export default CustomToolbar;
