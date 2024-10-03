// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export interface IProgressReportStore {
	add_progress_report_modal_open: boolean;
	report_uploaded: boolean;
	add_summary_cta_clicked: boolean;
	summary_content: string;
	open_rating_success_modal: boolean;
	open_success_modal: boolean;
	open_rating_modal: boolean;
	progress_report_link: string;
	show_nudge: boolean;
	report_rating: number;
	is_summary_edited: boolean;
}
