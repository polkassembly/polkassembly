// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { LoadingOutlined } from '@ant-design/icons';
import { ApiPromise } from '@polkadot/api';
import { QrDisplayPayload, QrScanSignature } from '@polkadot/react-qr';
import { Modal, Spin } from 'antd';
import React, { FC } from 'react';

interface IAuthorizeTransactionUsingQrProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    api?: ApiPromise;
    apiReady: boolean;
    qrAddress: string | null;
    isScanned: boolean;
    isQrHashed: boolean;
    qrPayload: Uint8Array;
    onScan: (scanned: any) => void;
}

const AuthorizeTransactionUsingQr: FC<IAuthorizeTransactionUsingQrProps> = (props) => {
	const { open, setOpen, api, apiReady, qrAddress, isScanned, isQrHashed, qrPayload, onScan } = props;
	return (
		<Modal
			open={open}
			onCancel={() => setOpen(false)}
			title='Authorize Transaction'
			footer={null}
			className='min-w-[800px] min-h-[375px]'
		>
			<Spin spinning={isScanned || !(api && apiReady && qrAddress)} indicator={<LoadingOutlined />}>
				<section className='grid grid-cols-2 gap-x-5 min-h-[375px]'>
					{
						api && apiReady && qrAddress?
							<>
								<article>
									<QrDisplayPayload
										address={qrAddress}
										cmd={
											isQrHashed
												? 1
												: 2
										}
										genesisHash={api?.genesisHash || ''}
										payload={qrPayload}
									/>
								</article>
								<article>
									<QrScanSignature onScan={onScan} />
								</article>
							</>
							: null
					}
				</section>
			</Spin>
		</Modal>
	);
};

export default AuthorizeTransactionUsingQr;