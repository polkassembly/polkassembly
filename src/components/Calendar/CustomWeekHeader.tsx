// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import 'react-big-calendar/lib/css/react-big-calendar.css';

import React from 'react';

function CustomWeekHeader({ date, localizer, small }: any): JSX.Element {
	return (
		<div className="week-header-text">
			<div className="day-of-week">
				{small
					? localizer.format(date, 'dd')[0]
					: localizer.format(date, 'ddd')}
			</div>
			<div className="day-num">{localizer.format(date, 'D')}</div>
		</div>
	);
}

export function TimeGutterHeader({
	localizer,
	date,
	selectedView
}: any): JSX.Element {
	return (
		<span className="time-gutter-header-text">
			{selectedView == 'day' ? (
				<div className="week-header-text">
					<div className="day-of-week">
						{localizer.format(date, 'dd')[0]}
					</div>
					<div className="day-num">{localizer.format(date, 'D')}</div>
				</div>
			) : (
				'UTC'
			)}
		</span>
	);
}

export default CustomWeekHeader;
