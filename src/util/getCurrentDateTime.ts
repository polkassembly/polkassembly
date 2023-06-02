// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export function getCurrentDateTime() {
	const currentDatetime = new Date();

	// Function to add the appropriate suffix to the day
	function getDaySuffix(day:any) {
		if (day === 1 || day === 21 || day === 31) {
			return 'st';
		} else if (day === 2 || day === 22) {
			return 'nd';
		} else if (day === 3 || day === 23) {
			return 'rd';
		} else {
			return 'th';
		}
	}

	// Function to get the month name
	function getMonthName(month:any) {
		const monthNames = [
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		];
		return monthNames[month];
	}

	// Function to pad a single digit number with leading zero
	function padZero(number:any) {
		return (number < 10 ? '0' : '') + number;
	}

	// Format the date
	const formattedDate = currentDatetime.getDate() + getDaySuffix(currentDatetime.getDate()) + ' ' + getMonthName(currentDatetime.getMonth()) + ' ' + currentDatetime.getFullYear();

	// Format the time
	const formattedTime = currentDatetime.getHours() + ':' + padZero(currentDatetime.getMinutes());

	// Combine the formatted date and time
	const formattedDatetime = formattedTime + ', ' + formattedDate;

	return formattedDatetime;
}