// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useMemo } from 'react';
import Select from '~src/basic-components/Select';
import { useApiContext } from '~src/context';

const SelectSection = ({ sectionName, setSectionName }: { sectionName: string; setSectionName: (value: string) => void }) => {
	const { api, apiReady } = useApiContext();
	const allSections = useMemo(() => {
		if (!apiReady || !apiReady || !api?.tx) return [];

		return Object.keys(api.tx || {})
			.sort()
			.filter((name) => !name.startsWith('$') || Object.keys(api.tx[name]).length)
			.map((name) => ({
				label: <span className='text-sm text-lightBlue dark:text-blue-dark-medium'>{name}</span>,
				text: name,
				value: name
			}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	return (
		<div className='w-full'>
			<Select
				labelInValue
				value={sectionName}
				filterOption={false}
				options={allSections}
				onChange={(value) => setSectionName(value?.value)}
				className='w-full'
			/>
		</div>
	);
};

export default SelectSection;
