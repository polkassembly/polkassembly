// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { useCurvesInformationSelector } from '~src/redux/selectors';

const getDays = (hrs: number) => {
	const days = Math.floor(hrs / 24);
	return days;
};

const getExtraHrs = (hrs: number) => {
	const days = Math.floor(hrs / 24);
	return hrs - days * 24;
};

const ConfirmMessage = () => {
	const curvesInformation = useCurvesInformationSelector();
	const [estimateHour, setEstimateHour] = useState(0);

	useEffect(() => {
		if (!curvesInformation) return;
		const { currentSupportData, currentApprovalData, supportData, approvalData, support, approval, supportThreshold, approvalThreshold } = curvesInformation;
		const currentSupport = currentSupportData?.[currentSupportData.length - 1];
		const currentApproval = currentApprovalData?.[currentApprovalData.length - 1];
		// If the current support and approval is already above the threshold, no need to estimate
		if (!(support >= supportThreshold && approval >= approvalThreshold)) {
			const futureSupport = supportData.find((data) => data && data?.y <= support);
			const approvalPoint = approvalData.find((s) => s && futureSupport?.x && s.x >= futureSupport.x);
			if (approvalPoint) {
				if (approvalPoint.y <= 50) {
					return setEstimateHour(0);
				}
			}
			const futureApproval = approvalData.find((data) => data && data?.y <= approval);
			const estimateSupportHour = (futureSupport?.x || 0) - currentSupport.x;
			const estimateApprovalHour = (futureApproval?.x || 0) - currentApproval.x;
			let estimateHour = 0;
			if (support < supportThreshold && approval < approvalThreshold) {
				estimateHour = Math.max(estimateSupportHour, estimateApprovalHour);
			} else if (support < supportThreshold) {
				estimateHour = (futureSupport?.x || 0) - currentSupport.x;
			} else {
				estimateHour = (futureApproval?.x || 0) - currentApproval.x;
			}
			setEstimateHour(estimateHour);
		}
	}, [curvesInformation]);
	if (!estimateHour) {
		return null;
	}
	return (
		<p className='dark:text-white'>
			Confirm in {getDays(estimateHour) ? `${getDays(estimateHour)} days` : ''} {getExtraHrs(estimateHour) ? `${getExtraHrs(estimateHour)} hrs` : ''}
		</p>
	);
};

export default ConfirmMessage;
