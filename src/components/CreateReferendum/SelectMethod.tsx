// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useMemo } from 'react';
import Select from '~src/basic-components/Select';
import { useApiContext } from '~src/context';

const SelectMethod = ({ sectionName, methodName, setMethodName }: { sectionName: string; methodName: string; setMethodName: (value: string) => void }) => {
	const { api, apiReady } = useApiContext();

	const allSections = useMemo(() => {
		if (!api || !apiReady || !api?.tx) return [];

		const section = api.tx?.[sectionName];

		if (!section || !Object.keys(section || {}).length) {
			return [];
		}

		return Object.keys(section)
			.sort()
			.filter((name) => !name.startsWith('$'))
			.map((item) => {
				const method = section[item];
				const inputs = method.meta.args.map((arg) => arg.name.toString()).join(', ');

				return {
					key: `${sectionName}_${item}`,
					label: (
						<div className='flex flex-col overflow-hidden'>
							<div
								key={`${sectionName}_${item}:call`}
								className='text-sm text-lightBlue dark:text-blue-dark-medium'
							>
								{item}({inputs})
							</div>
							<div
								key={`${sectionName}_${item}:text`}
								className='text-sm text-lightBlue dark:text-blue-dark-medium'
							>
								{(method.meta.docs[0] || item).toString()}
							</div>
						</div>
					),
					text: `${item}(${inputs})`,
					value: item
				};
			});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, sectionName]);

	useEffect(() => {
		if (!allSections || allSections.length === 0) return;

		const defaultValue = allSections.find((option) => option.value === methodName);
		if (!defaultValue) {
			setMethodName(allSections[0].value);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allSections]);
	return (
		<div className='w-full'>
			<Select
				labelInValue
				value={methodName}
				filterOption={false}
				options={allSections}
				onChange={(value) => setMethodName(value)}
				className='w-full'
			/>
		</div>
	);
};

export default SelectMethod;
