// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Form, Select, Button, Spin } from 'antd';
import { useApiContext } from '~src/context';
import { LoadingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { blake2AsHex } from '@polkadot/util-crypto';
import { HexString } from '@polkadot/util/types';
import ParamsInput from './ParamsInput';
import { IPreimageArgument } from '~src/types';
import { createPreimage } from '~src/util/preimages';

interface Props {
	className?: string;
	onPreimageCreated: (preimageHash: string) => void;
}

const CreatePreimage = ({ className, onPreimageCreated }: Props) => {
	const { api, apiReady } = useApiContext();
	const [loading, setLoading] = useState(false);
	const [sections, setSections] = useState<Array<{ label: string; value: string; description?: string }>>([]);
	const [methods, setMethods] = useState<Array<{ label: string; value: string; description?: string }>>([]);
	const [params, setParams] = useState<IPreimageArgument[]>([]);
	const [form] = Form.useForm();

	// Load available sections when API is ready
	useEffect(() => {
		if (!api || !apiReady) return;

		try {
			const sections = Object.entries(api.tx)
				.map(([name, section]) => {
					const methodsCount = Object.keys(section).length;
					let description = '';

					try {
						// Get the section description from the first method's docs
						const firstMethod = Object.values(section)[0];
						if (firstMethod?.meta?.docs) {
							description = firstMethod.meta.docs.map((doc: any) => doc.toString()).join(' ');
						}
					} catch (err) {
						console.error('Error getting section description:', err);
					}

					return {
						description,
						label: `${name} (${methodsCount})`,
						value: name
					};
				})
				.filter(({ value }) => value !== 'system') // Filter out system calls
				.sort((a, b) => a.label.localeCompare(b.label));

			setSections(sections);
		} catch (err) {
			console.error('Error loading sections:', err);
		}
	}, [api, apiReady]);

	// Update methods when section changes
	const handleSectionChange = (section: string) => {
		if (!api) return;

		try {
			const methods = Object.entries(api.tx[section])
				.map(([name, method]) => {
					const args = method.meta.args.map((arg) => `${arg.name.toString()}: ${arg.type.toString()}`).join(', ');

					return {
						description: method.meta.docs.map((doc) => doc.toString()).join(' '),
						label: `${name}(${args})`,
						value: name
					};
				})
				.sort((a, b) => a.label.localeCompare(b.label));

			setMethods(methods);
			form.setFieldsValue({ method: undefined, params: undefined });
			setParams([]);
		} catch (err) {
			console.error('Error loading methods:', err);
		}
	};

	// Update params when method changes
	const handleMethodChange = (method: string) => {
		if (!api || !form.getFieldValue('section')) return;

		try {
			const section = form.getFieldValue('section');
			const methodObj = api.tx[section][method];
			const methodDocs = methodObj.meta.docs?.map((doc) => doc.toString()).join(' ') || '';

			const params = methodObj.meta.args.map((arg) => ({
				docs: methodDocs,
				name: arg.name.toString(),
				type: arg.type.toString()
			}));

			console.log('Setting params:', params);
			setParams(params);
			form.setFieldsValue({ params: {} });
		} catch (err) {
			console.error('Error loading parameters:', err);
		}
	};

	const handleSubmit = async (values: any) => {
		if (!api || !apiReady) return;

		try {
			setLoading(true);
			const { section, method, params: paramValues } = values;

			console.log('Raw form values:', values);

			// Process parameters in order of the params array
			const processedParams = params
				.map((param) => {
					const value = paramValues[param.name];
					console.log(`Processing param ${param.name}:`, value);

					if (!value) return null;

					// Handle Option types
					if (value && typeof value === 'object' && 'include' in value) {
						return value.include ? value.value : null;
					}

					// Handle tuple types
					if (Array.isArray(value) || (typeof value === 'object' && !('include' in value))) {
						return Object.values(value);
					}

					// Handle simple values
					return value;
				})
				.flat();

			console.log('Processed params:', processedParams);

			// Create the extrinsic with all parameters
			const tx = api.tx[section][method](...processedParams);

			// Generate preimage
			const preimage = createPreimage(api, tx);

			onPreimageCreated(preimage.preimageHash);
		} catch (error) {
			console.error('Failed to create preimage:', error);
		} finally {
			setLoading(false);
		}
	};

	if (!api || !apiReady) {
		return <div>Please wait for the API to be ready...</div>;
	}

	return (
		<Spin
			spinning={loading}
			indicator={<LoadingOutlined />}
		>
			<Form
				className={className}
				form={form}
				onFinish={handleSubmit}
				layout='vertical'
			>
				<Form.Item
					label='Pallet Section'
					name='section'
					rules={[{ required: true, message: 'Please select a section' }]}
				>
					<Select
						placeholder='Select a pallet section'
						onChange={handleSectionChange}
						options={sections}
						showSearch
						optionFilterProp='label'
					/>
				</Form.Item>

				<Form.Item
					label='Method'
					name='method'
					rules={[{ required: true, message: 'Please select a method' }]}
				>
					<Select
						placeholder='Select a method'
						onChange={handleMethodChange}
						disabled={!form.getFieldValue('section')}
						options={methods}
						showSearch
						optionFilterProp='label'
					/>
				</Form.Item>

				{params.length > 0 && (
					<>
						<ParamsInput
							api={api}
							params={params}
							form={form}
						/>
					</>
				)}

				<Form.Item>
					<Button
						type='primary'
						htmlType='submit'
						loading={loading}
						className='w-full'
					>
						Create Preimage
					</Button>
				</Form.Item>
			</Form>
		</Spin>
	);
};

export default styled(CreatePreimage)`
	.ant-form-item {
		margin-bottom: 1rem;
	}

	.ant-select-selection-item {
		white-space: normal;
		line-height: 1.4;
	}

	.ant-select-item-option-content {
		white-space: normal;
	}
`;
