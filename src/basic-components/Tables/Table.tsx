// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Table as AntdTable } from 'antd';
import { TableProps } from 'antd/lib/table/InternalTable';
import { FC, PropsWithChildren } from 'react';
import styled from 'styled-components';
interface ITable extends TableProps<any> {
	className?: string;
	theme?: string;
}
const Table: FC<PropsWithChildren<ITable>> = (props) => {
	const { className } = props;
	return (
		<AntdTable
			{...props}
			className={`${className}`}
		/>
	);
};

export default styled(Table)`
	.ant-table-thead > tr > th {
		background: ${(props: any) => (props.theme === 'dark' ? '#1C1D1F' : '#fafafa')} !important;
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : 'black')} !important;
		font-weight: 500 !important;
		border-bottom: ${(props: any) => (props.theme === 'dark' ? '1px solid #323232' : '')} !important;
	}
	.ant-table-thead > tr > th::before {
		background: none !important;
	}
	.ant-table-tbody > tr {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : 'white')} !important;
	}
	.ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before,
	.ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before {
		background-color: none !important;
	}
	td {
		background: ${(props: any) => (props.theme === 'dark' ? '#0D0D0D' : 'white')} !important;
		border-bottom: ${(props: any) => (props.theme === 'dark' ? '1px solid #323232' : '')} !important;
	}
`;
