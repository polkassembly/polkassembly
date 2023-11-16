// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Tooltip } from 'antd';
import dayjs from 'dayjs';
import React, { memo, useEffect, useState } from 'react';
import { blocksToRelevantTime, getTrackData } from '~src/components/Listing/Tracks/AboutTrackCard';
import { usePostDataContext } from '~src/context';
import { useCurvesInformationSelector, useNetworkSelector } from '~src/redux/selectors';

const getDays = (hrs: number) => {
	const days = Math.floor(hrs / 24);
	return days;
};

const getExtraHrs = (hrs: number) => {
	const days = Math.floor(hrs / 24);
	return hrs - days * 24;
};

const futurePoint = (data: any[], value: number) => {
	const futureIdx = data.findIndex((data) => data && data?.y <= value);
	if (futureIdx < 0) {
		return;
	}
	const currentFuture = data[futureIdx];
	const prevFuture = data[futureIdx - 1];
	let fP = currentFuture;
	const a = Math.abs(value - (currentFuture?.y || 0));
	const b = Math.abs(value - (prevFuture?.y || 0));
	if (a > b) {
		fP = prevFuture;
	} else {
		fP = currentFuture;
	}
	return fP;
};

const ConfirmMessage = () => {
	const curvesInformation = useCurvesInformationSelector();
	const {
		postData: { statusHistory, track_name, track_number }
	} = usePostDataContext();
	const { network } = useNetworkSelector();
	const { approval, approvalData, supportData, support, supportThreshold, approvalThreshold } = curvesInformation;
	const [estimateHour, setEstimateHour] = useState(0);

	useEffect(() => {
		const trackInfo = getTrackData(network, track_name, track_number);
		const statusObj = statusHistory?.find((s) => s?.status === 'Deciding');
		const confirmedStartedStatus = statusHistory?.find((s) => s?.status === 'ConfirmStarted');
		const blockVisibleStatus = (statusHistory || [])?.find((v: any) => ['Deciding', 'ConfirmStarted', 'ConfirmAborted'].includes(v?.status || ''));
		if (!statusObj || !blockVisibleStatus) {
			return;
		}
		if (support >= supportThreshold && approval >= approvalThreshold) {
			return;
		}
		const futureSupport = futurePoint(supportData, support);
		const futureApproval = futurePoint(approvalData, approval);
		if (!futureSupport || !futureApproval) {
			return;
		}

		const hour = dayjs().diff(statusObj?.timestamp, 'hour');
		const estimateSupportHour = (futureSupport?.x || 0) - hour;
		const estimateApprovalHour = (futureApproval?.x || 0) - hour;
		let estimateHour = 0;
		if (support < supportThreshold && approval < approvalThreshold) {
			estimateHour = Math.max(estimateSupportHour, estimateApprovalHour);
		} else if (support < supportThreshold) {
			estimateHour = estimateSupportHour;
		} else {
			estimateHour = estimateApprovalHour;
		}
		if (trackInfo?.confirmPeriod) {
			const timeStr = blocksToRelevantTime(network, Number(trackInfo?.confirmPeriod));
			const time = timeStr.split(' ')[0];
			const units = timeStr.split(' ')[1];
			const confirmedStartedHour = confirmedStartedStatus && confirmedStartedStatus?.timestamp ? dayjs().diff(confirmedStartedStatus?.timestamp, 'hour') : 0;
			if (units === 'days') {
				estimateHour = estimateHour + Number(time) * 24 - confirmedStartedHour;
			} else if (units === 'hrs') {
				estimateHour = estimateHour + Number(time) - confirmedStartedHour;
			}
		}
		if (estimateHour < 0) {
			return;
		}
		setEstimateHour(estimateHour);
	}, [approval, approvalData, approvalThreshold, network, statusHistory, support, supportData, supportThreshold, track_name, track_number]);

	if (!estimateHour) {
		return null;
	}

	return (
		<Tooltip title={<div>Estimated Date: {dayjs().add(estimateHour, 'hour').format('YYYY-MM-DD HH:MM')}, based on current tally</div>}>
			<div className='mt-4 h-[62px] rounded-lg bg-[#F5F5FD] p-3 hover:h-[62px] dark:bg-[#2C2C3E]'>
				<p className='m-0 text-sm font-normal leading-[21px] tracking-[0.035px] text-[#485F7D] dark:text-[#A4A4A4]'>
					Proposal estimated to pass in
					<span className='ml-1 text-sm font-semibold leading-[21px] tracking-[0.28px] text-[#e5007a] dark:text-[#FF60B5]'>
						{getDays(estimateHour) ? `${getDays(estimateHour)} days` : ''} {getExtraHrs(estimateHour) ? `, ${getExtraHrs(estimateHour)} hrs` : ''}
					</span>
				</p>
			</div>
		</Tooltip>
	);
};

export default memo(ConfirmMessage);
