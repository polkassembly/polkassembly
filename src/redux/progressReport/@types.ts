// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export interface IProgressReportStore {
	add_progress_report_modal_open: boolean;
	report_uploaded: boolean;
	post_report_added: boolean;
	add_summary_cta_clicked: boolean;
	summary_content: string;
}
