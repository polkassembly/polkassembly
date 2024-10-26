// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Select } from 'antd';
import { poppins } from 'pages/_app';
import React from 'react';
import styled from 'styled-components';
import DownArrow from '~assets/icons/down-icon.svg';

interface Props {
	tracksArr?: string[];
	className?: string;
	onTrackChange: (pre: string) => void;
	selectedTrack: string;
}
const SelectTracks = ({ tracksArr, className, onTrackChange, selectedTrack }: Props) => {
	return (
		<div className={className}>
			<Select
				placeholder='Select a track'
				suffixIcon={<DownArrow />}
				className={`flex h-[40px] w-full flex-col items-center rounded-[4px] ${poppins.className} ${poppins.variable} dark:bg-section-dark-overlaydark dark:border-separatorDark`}
				value={selectedTrack.length > 0 ? selectedTrack : null}
				onChange={onTrackChange}
				options={
					tracksArr?.map((track) => {
						return { label: track.split(/(?=[A-Z])/).join(' '), value: track };
					}) || []
				}
				popupClassName={`${poppins.className} ${poppins.variable} z-[2000] dark:bg-section-dark-overlay dark:[&>.ant-select-item-option-content]:text-blue-dark-high`}
			/>
		</div>
	);
};
export default styled(SelectTracks)`
	.ant-select .ant-select-selector {
		height: 40px !important;
		display: flex;
		align-items: center;
		color: var(--bodyBlue) !important;
		border-radius: 4px !important;
	}
	.select .ant-select .ant-select-selector .ant-select-selection-item {
		display: flex;
		align-items: center;
		color: var(--bodyBlue);
		font-size: 14px;
	}
	.ant-select .ant-select-selection-placeholder {
		font-weight: 400;
		color: #7c899b;
	}
`;
