// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Slider as AntdSlider } from 'antd';
import { SliderRangeProps } from 'antd/es/slider';
import { useTheme } from 'next-themes';
import React, { FC } from 'react';
import { styled } from 'styled-components';

interface Props extends SliderRangeProps {
	className?: string;
	theme?: string;
}

const StyledSlider = styled(AntdSlider)`
	&.ant-slider-handle .ant-slider-handle-1 {
		border-color: grey !important;
		background-color: grey;
	}
	&:hover .ant-slider-track {
		background-color: ${(props: any) => (props.theme == 'dark' ? '#3B444F' : '#d2d8e0')} !important;
	}
	.ant-slider-track {
		background-color: ${(props: any) => (props.theme == 'dark' ? '#3B444F' : '#d2d8e0')} !important;
	}
	&:hover .ant-slider-rail {
		background-color: ${(props: any) => (props.theme == 'dark' ? '#24292f' : '#f4f0f0')} !important;
	}
	.ant-slider-rail {
		background-color: ${(props: any) => (props.theme == 'dark' ? '#24292f' : '#f4f0f0')} !important;
	}
	.ant-slider-dot {
		display: ${(props: any) => (props.theme == 'dark' ? 'none' : '')} !important;
		background-color: ${(props: any) => (props.theme == 'dark' ? '#24292f' : '#f4f0f0')} !important;
	}
	.ant-slider-mark-text {
		font-family: 'Poppins', sans-serif;
		font-size: 12px;
		font-weight: 400;
		line-height: 17.89px;
		letter-spacing: -0.03em;
		text-align: left;
		color: ${(props: any) => (props.theme == 'dark' ? '#747474' : '#485F7D')} !important;
		margin-top: 6px;
	}
	.ant-slider .ant-slider-handle:focus::after {
		box-shadow: none;
	}

	.ant-slider-handle.ant-slider-handle::after {
		height: 33px;
		margin-top: -7px;
		width: 33px;
		background-image: url(${(props: any) => (props.theme == 'dark' ? '/assets/icons/analytics/slider-button-dark.svg' : '/assets/icons/analytics/slider-button.svg')}) !important;
		background-repeat: no-repeat !important;
		box-shadow: none;
		background-color: transparent;
		margin-left: -7px;
	}
`;

const Slider: FC<Props> = (props) => {
	const { resolvedTheme: theme } = useTheme();
	const { className } = props;

	return (
		<StyledSlider
			{...props}
			theme={theme as any}
			className={`${className}`}
		/>
	);
};

export default Slider;
