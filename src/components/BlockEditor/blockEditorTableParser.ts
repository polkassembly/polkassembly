// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const blockEditorTableParser = (block: any) => {
	const { data } = block;
	let html = '<table class="table">';

	// Add header row if it exists
	if (data.withHeadings) {
		html += '<thead><tr>';
		data.content[0].forEach((cell: string) => {
			html += `<th>${cell}</th>`;
		});
		html += '</tr></thead>';
		data.content.shift(); // Remove header row from content
	}

	// Add body rows
	html += '<tbody>';
	data.content.forEach((row: string[]) => {
		html += '<tr>';
		row.forEach((cell: string) => {
			html += `<td>${cell}</td>`;
		});
		html += '</tr>';
	});
	html += '</tbody></table>';

	return html;
};
