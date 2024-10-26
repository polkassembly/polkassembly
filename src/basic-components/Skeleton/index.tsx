// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import styled from 'styled-components';
import { Skeleton as AntdSkeleton, SkeletonProps } from 'antd';
import { FC } from 'react';
import { useTheme } from 'next-themes';

interface Props extends SkeletonProps {
	className?: string;
}

const StyledSkeleton = styled(({ ...rest }) => <AntdSkeleton {...rest} />)`
	.ant-skeleton-content > .ant-skeleton-paragraph > li {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#5959599E' : '#E6E6E6')};
	}
	.ant-skeleton-content > .ant-skeleton-title {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#5959599E' : '#E6E6E6')};
	}
`;

const Skeleton: FC<Props> = (props) => {
	const { className } = props;
	const { resolvedTheme: theme } = useTheme();
	return (
		<StyledSkeleton
			{...props}
			theme={theme}
			className={`${className}`}
		/>
	);
};

export default Skeleton;
