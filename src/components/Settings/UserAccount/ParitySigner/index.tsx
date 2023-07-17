// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { QrcodeOutlined } from '@ant-design/icons';
import { QrScanAddress } from '@polkadot/react-qr';
import { HexString } from '@polkadot/util/types';
import { Button, Input, Modal } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useApiContext, useNetworkContext } from '~src/context';
import Address from '~src/ui-components/Address';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import { Collapse } from '../../Notifications/common-ui/Collapse';
import { InjectedAccount } from '@polkadot/extension-inject/types';
const { Panel } = Collapse;

interface Scanned {
    content: string;
    isAddress: boolean;
    genesisHash: HexString | null;
    name?: string;
}

interface Address {
    address: string;
    isAddress: boolean;
    scanned: Scanned | null;
    warning?: string | null;
}

export const getPolkadotVaultAccounts = () => {
	let accounts: InjectedAccount[] = JSON.parse(localStorage.getItem('polkadotVaultAccounts') || '[]');
	if (!accounts || !Array.isArray(accounts)) {
		accounts = [];
	}
	return accounts;
};

const ParitySigner = () => {
	const [open, setOpen] = useState(false);
	const { network } = useNetworkContext();
	const isEthereum = ['moonbeam', 'moonriver', 'moonbase'].includes(network || '');
	const { api } = useApiContext();
	const [{ isNameValid, name }, setName] = useState({ isNameValid: false, name: '' });
	const [{ address, isAddress, scanned }, setAddress] = useState<Address>({ address: '', isAddress: false, scanned: null });

	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);

	const isValid = !!address && isNameValid && isAddress;

	const _onNameChange = useCallback(
		(name: string) => setName({ isNameValid: !!name.trim(), name }),
		[]
	);

	useEffect(() => {
		setAccounts(getPolkadotVaultAccounts());
	}, []);

	const _onScan = useCallback(
		(scanned: Scanned): void => {
			setAddress({
				address: scanned.content,
				isAddress: scanned.isAddress,
				scanned
			});

			if (scanned.name) {
				_onNameChange(scanned.name);
			}
		},
		[_onNameChange]
	);

	const _onError = useCallback(
		(err: Error): void => {
			setAddress({
				address: '',
				isAddress: false,
				scanned: null,
				warning: err.message
			});
		},
		[]
	);

	const _onSave = useCallback(
		(): void => {
			if (!scanned || !isValid) {
				return;
			}

			const injectedAccount: InjectedAccount = {
				address: scanned.content,
				genesisHash: scanned.genesisHash || api?.genesisHash.toHex(),
				name: name.trim(),
				type: isEthereum ? 'ethereum' : 'ed25519'
			};

			const accounts = getPolkadotVaultAccounts();
			accounts.push(injectedAccount);
			localStorage.setItem('polkadotVaultAccounts', JSON.stringify(accounts));
			setAccounts(accounts);
			setOpen(false);
		},
		[api, isValid, name, scanned, isEthereum]
	);

	return (
		<>
			<Collapse
				size='large'
				className='bg-white'
				expandIconPosition='end'
				expandIcon={({ isActive }) => {
					return isActive ? <CollapseIcon /> : <ExpandIcon />;
				}}
			>
				<Panel
					header={
						<div className='flex items-center gap-[6px] channel-header'>
							<QrcodeOutlined />
							<h3 className='font-semibold text-[16px] text-[#243A57] md:text-[18px] tracking-wide leading-[21px] mb-0 mt-[2px]'>
                            Polkadot Vault Accounts
							</h3>
						</div>
					}
					key='1'
				>
					<section className='w-full'>
						<Button className='bg-pink_primary text-white font-medium' onClick={() => setOpen(true)}>
                            Add Via QR
						</Button>
						{
							accounts && Array.isArray(accounts) && accounts.length > 0?
								<div className='flex flex-col gap-y-3 mt-5'>
									{
										accounts.map((account, index) => {
											return (
												<article key={account.address + index} className='flex items-center'>
													<Address extensionName={account.name} address={account.address} />
												</article>
											);
										})
									}
								</div>
								: null
						}
						<Modal
							title="Parity Signer"
							open={open}
							onCancel={() => setOpen(false)}
							footer={null}
						>
							{
								scanned?
									<div className='flex flex-col gap-y-5'>
										<Address address={scanned.content} />
										<Input
											value={name}
											onChange={(e) => _onNameChange(e.target.value)}
											placeholder='Name'
											onPressEnter={() => {
												_onSave();
											}}
										/>
									</div>
									: (
										<QrScanAddress
											isEthereum={isEthereum}
											onError={_onError}
											onScan={_onScan}
										/>
									)
							}
						</Modal>
					</section>
				</Panel>
			</Collapse>
		</>
	);
};

export default ParitySigner;