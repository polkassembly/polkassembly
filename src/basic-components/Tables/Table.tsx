// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Table as AntdTable } from 'antd';
import { FC, PropsWithChildren } from 'react';
interface ITable {
	className?: string;
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

export default Table;
