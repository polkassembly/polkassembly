// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useEffect, useState } from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import { StarFilled } from '@ant-design/icons';
import { useProgressReportSelector } from '~src/redux/selectors';
import { usePostDataContext } from '~src/context';
import { IProgressReport, IRating } from '~src/types';

interface IRatingSuccessModal {
	reportId?: string | null;
}

const RatingSuccessModal: FC<IRatingSuccessModal> = (props) => {
	const { reportId } = props;
	const { report_rating } = useProgressReportSelector();
	const { postData } = usePostDataContext();
	const [averageRating, setAverageRating] = useState<number>();
	const [reportData, setReportData] = useState<IProgressReport>();

	useEffect(() => {
		if (postData?.progress_report) {
			Object.values(postData.progress_report).some((report: any) => {
				if (report.id === reportId) {
					setReportData(report as IProgressReport);
					return true;
				}
				return false;
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reportId]);

	const getRatingInfo = () => {
		if (reportData?.ratings) {
			setAverageRating(reportData?.ratings?.reduce((sum: number, current: IRating) => sum + current.rating, 0) / reportData?.ratings?.length);
		}
	};

	useEffect(() => {
		getRatingInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postData?.progress_report]);
	return (
		<section className='h-[200px] p-6'>
			<ImageIcon
				src='/assets/icons/success-icon.svg'
				alt='success-icon'
				imgWrapperClassName='mx-auto relative -top-[152px] left-[150px]'
			/>
			<div className='-mt-[136px] flex flex-col items-center justify-center gap-y-4'>
				<h1 className='m-0 p-0 text-xl font-semibold text-bodyBlue dark:text-white'>Rated successfully </h1>
				<div className='flex justify-center gap-x-1'>
					{Array.from({ length: report_rating }).map((_, index) => (
						<StarFilled
							key={index}
							className='text-[40px] text-[#FFBF60]'
						/>
					))}{' '}
				</div>
				<p className='m-0 p-0 text-xs text-sidebarBlue dark:text-icon-dark-inactive'>
					{reportData?.ratings?.length} user(s) rated and the Average Delivery rating is {averageRating}/5
				</p>
			</div>
		</section>
	);
};

export default RatingSuccessModal;
