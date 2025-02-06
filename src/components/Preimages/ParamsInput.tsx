// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Form, Input, Tooltip, Switch, Select, Button, InputNumber } from 'antd';
import { InfoCircleOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { IPreimageArgument } from '~src/types';
import styled from 'styled-components';
import { parseParamType, ParamType, ITupleType } from './types';
import BN from 'bn.js';
import { formatBalance } from '@polkadot/util';
import { ApiPromise } from '@polkadot/api';

/* eslint-disable sort-keys */

interface Props {
	api: ApiPromise;
	params: IPreimageArgument[];
	form: any;
	className?: string;
	basePath?: (string | number)[];
}

const ParamsInput = ({ api, params, form, className, basePath = ['params'] }: Props) => {
	const renderNestedParam = (type: string, param: IPreimageArgument, paramBasePath: (string | number)[]) => {
		const parseResult = parseParamType(type);

		switch (parseResult.type) {
			case 'tuple':
				return (
					<div className='nested-tuple-param'>
						{parseResult.components?.map((componentType, index) => (
							<Form.Item
								key={index}
								name={[...paramBasePath, index]}
								rules={[{ required: true, message: `Please input component ${index + 1}` }]}
							>
								{renderNestedParam(
									componentType,
									{
										...param,
										name: `${param.name}[${index}]`
									},
									[...paramBasePath, index]
								)}
							</Form.Item>
						))}
					</div>
				);
			case ParamType.OPTION:
				return parseResult.innerType ? (
					<div className='nested-option-param'>
						<Form.Item
							name={[...paramBasePath, 'include']}
							valuePropName='checked'
							initialValue={false}
						>
							<Switch
								checkedChildren='Include'
								unCheckedChildren='Exclude'
							/>
						</Form.Item>
						<Form.Item
							noStyle
							shouldUpdate={(prevValues, currentValues) => {
								const prevInclude = prevValues?.params?.[param.name]?.include;
								const currInclude = currentValues?.params?.[param.name]?.include;
								return prevInclude !== currInclude;
							}}
						>
							{({ getFieldValue }) => {
								const include = getFieldValue([...paramBasePath, 'include']);
								if (!include) return null;

								return (
									<Form.Item
										name={[...paramBasePath, 'value']}
										rules={[{ required: true, message: `Please input ${param.name}` }]}
									>
										{renderNestedParam(parseResult.innerType!, param, [...paramBasePath, 'value'])}
									</Form.Item>
								);
							}}
						</Form.Item>
					</div>
				) : null;
			case ParamType.VEC:
				return parseResult.innerType ? (
					<Form.List name={paramBasePath}>
						{(fields, { add, remove }) => (
							<div className='nested-vec-param'>
								{fields.map((field, index) => (
									<div
										key={field.key}
										className='vec-item'
									>
										<Form.Item {...field}>{renderNestedParam(parseResult.innerType!, param, [...paramBasePath, index])}</Form.Item>
										<Button
											type='text'
											onClick={() => remove(index)}
											icon={<MinusCircleOutlined />}
										/>
									</div>
								))}
								<Button
									type='dashed'
									onClick={() => add()}
									icon={<PlusOutlined />}
								>
									Add {param.name}
								</Button>
							</div>
						)}
					</Form.List>
				) : null;
			case ParamType.CALL:
				return (
					<div className='nested-call-param'>
						<Form.Item
							name={[...paramBasePath, 'section']}
							label='Pallet Section'
							rules={[{ required: true, message: 'Please select a section' }]}
						>
							<Select
								placeholder='Select a pallet section'
								onChange={(section) => {
									// Clear method when section changes
									form.setFields([
										{ name: [...paramBasePath, 'method'], value: undefined },
										{ name: [...paramBasePath, 'params'], value: {} }
									]);
								}}
								options={Object.entries(api.tx)
									.map(([name, section]) => ({
										label: `${name} (${Object.keys(section).length})`,
										value: name
									}))
									.filter(({ value }) => value !== 'system')
									.sort((a, b) => a.label.localeCompare(b.label))}
								showSearch
								optionFilterProp='label'
							/>
						</Form.Item>

						<Form.Item
							dependencies={[[...paramBasePath, 'section']]}
							noStyle
						>
							{({ getFieldValue }) => {
								const section = getFieldValue([...paramBasePath, 'section']);
								if (!section) return null;

								return (
									<Form.Item
										name={[...paramBasePath, 'method']}
										label='Method'
										rules={[{ required: true, message: 'Please select a method' }]}
									>
										<Select
											placeholder='Select a method'
											onChange={() => {
												form.setFields([{ name: [...paramBasePath, 'params'], value: {} }]);
											}}
											options={Object.entries(api.tx[section])
												.map(([name, method]) => ({
													label: `${name}(${method.meta.args.map((arg) => `${arg.name}: ${arg.type}`).join(', ')})`,
													value: name
												}))
												.sort((a, b) => a.label.localeCompare(b.label))}
											showSearch
											optionFilterProp='label'
										/>
									</Form.Item>
								);
							}}
						</Form.Item>

						<Form.Item
							dependencies={[[...paramBasePath, 'method']]}
							noStyle
						>
							{({ getFieldValue }) => {
								const section = getFieldValue([...paramBasePath, 'section']);
								const method = getFieldValue([...paramBasePath, 'method']);
								if (!section || !method) return null;

								const methodObj = api.tx[section][method];
								const params = methodObj.meta.args.map((arg) => ({
									docs: methodObj.meta.docs.map((d) => d.toString()).join(' '),
									name: arg.name.toString(),
									type: arg.type.toString()
								}));

								return params.length > 0 ? (
									<div className='nested-call-params'>
										<ParamsInput
											api={api}
											params={params}
											form={form}
											basePath={[...paramBasePath, 'params']}
										/>
									</div>
								) : null;
							}}
						</Form.Item>
					</div>
				);
			default:
				return renderInputByType(type, param);
		}
	};

	const renderParam = (param: IPreimageArgument) => {
		return renderNestedParam(param.type, param, [...basePath, param.name]);
	};

	const renderInputByType = (type: string, param: IPreimageArgument) => {
		const parseResult = parseParamType(type);

		switch (parseResult.type) {
			// Account types
			case ParamType.ACCOUNT_ID:
			case ParamType.ACCOUNT_ID_20:
			case ParamType.ACCOUNT_ID_32:
			case ParamType.ADDRESS:
				return (
					<Input
						className='param-input'
						placeholder='Enter account address'
						pattern='^[0-9a-zA-Z]{48}$'
					/>
				);

			// Balance types
			case ParamType.BALANCE:
			case ParamType.MOMENT:
				return (
					<InputNumber
						className='param-input'
						placeholder={`Enter ${param.name} in tokens`}
						formatter={(value) => formatBalance(new BN(value || 0))}
						parser={(value) => value?.replace(/[^\d]/g, '') || ''}
					/>
				);

			// Integer types
			case ParamType.I8:
			case ParamType.I16:
			case ParamType.I32:
			case ParamType.I64:
			case ParamType.I128:
			case ParamType.U8:
			case ParamType.U16:
			case ParamType.U32:
			case ParamType.U64:
			case ParamType.U128:
			case ParamType.U256:
				return (
					<InputNumber
						className='param-input'
						placeholder={`Enter ${param.name} (${type})`}
						min={type.startsWith('u') ? 0 : undefined}
					/>
				);

			// Hash types
			case ParamType.HASH:
			case ParamType.H160:
			case ParamType.H256:
			case ParamType.H512:
				return (
					<Input
						className='param-input'
						placeholder={`Enter ${type} hash`}
						pattern='^0x[a-fA-F0-9]+$'
					/>
				);

			// Boolean
			case ParamType.BOOL:
				return (
					<Select>
						<Select.Option value={true}>True</Select.Option>
						<Select.Option value={false}>False</Select.Option>
					</Select>
				);

			// Bytes
			case ParamType.BYTES:
				return (
					<Input.TextArea
						className='param-input'
						placeholder='Enter hex-encoded bytes'
						rows={4}
					/>
				);

			// Vote types
			case ParamType.VOTE:
				return (
					<Select>
						<Select.Option value='aye'>Aye</Select.Option>
						<Select.Option value='nay'>Nay</Select.Option>
					</Select>
				);

			case ParamType.VOTE_THRESHOLD:
				return (
					<Select>
						<Select.Option value='SuperMajorityApprove'>Super Majority Approve</Select.Option>
						<Select.Option value='SuperMajorityAgainst'>Super Majority Against</Select.Option>
						<Select.Option value='SimpleMajority'>Simple Majority</Select.Option>
					</Select>
				);

			// Null type
			case ParamType.NULL:
				return (
					<Input
						disabled
						placeholder='Null value'
					/>
				);

			// XCM types
			case ParamType.XCM_VERSIONED_ASSETS:
				return (
					<Select>
						<Select.Option value="V2">V2</Select.Option>
						<Select.Option value="V3">V3</Select.Option>
					</Select>
				);

			case ParamType.XCM_VERSION:
				return (
					<Select>
						<Select.Option value="V2">Version 2</Select.Option>
						<Select.Option value="V3">Version 3</Select.Option>
					</Select>
				);

			// Default text input for unknown types
			default:
				return (
					<Input
						placeholder={`Enter ${param.name}`}
						className='param-input'
					/>
				);
		}
	};

	return (
		<div className={className}>
			{params?.map((param, index) => (
				<div
					key={index}
					className='param-container'
				>
					<div className='param-header'>
						<span className='param-name'>{param.name}</span>
						<span className='param-type'>: {param.type}</span>
						{param.docs && (
							<Tooltip
								title={
									<>
										{param.docs && (
											<div className='param-docs'>
												<strong>Parameter:</strong> {param.docs}
											</div>
										)}
									</>
								}
							>
								<InfoCircleOutlined className='info-icon' />
							</Tooltip>
						)}
					</div>
					{renderParam(param)}
				</div>
			))}
		</div>
	);
};

export default styled(ParamsInput)`
	.param-container {
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: var(--background-secondary);
		border-radius: 4px;
	}

	.param-header {
		display: flex;
		align-items: center;
		margin-bottom: 0.5rem;
		gap: 0.5rem;
	}

	.param-name {
		font-weight: 600;
		color: var(--text-color-primary);
	}

	.param-type {
		color: var(--text-color-secondary);
	}

	.info-icon {
		color: var(--text-color-secondary);
		cursor: help;
	}

	.param-docs {
		font-size: 0.9rem;
		color: var(--text-color-secondary);
		margin-top: 0.5rem;
		line-height: 1.4;
	}

	.param-input {
		border: 1px solid var(--border-primary-color);
		border-radius: 4px;

		&:focus {
			border-color: var(--primary-color);
			box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
		}
	}

	.option-param {
		margin-top: 0.5rem;
	}

	.vec-param {
		margin-top: 0.5rem;

		.vec-item {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			margin-bottom: 0.5rem;
		}
	}

	.tuple-param {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.nested-tuple-param {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		width: 100%;

		.ant-form-item {
			flex: 1;
		}
	}

	.nested-call-param {
		border: 1px solid var(--border-primary-color);
		padding: 1rem;
		border-radius: 4px;

		.ant-form-item {
			margin-bottom: 1rem;
		}
	}

	.nested-call-params {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border-secondary-color);
	}
`;
