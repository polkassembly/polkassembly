// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Row, Skeleton, Switch } from 'antd';
import dynamic from 'next/dynamic';
import React, { FC, useState } from 'react';
import Header from 'src/components/Settings/Header';
import { useUserDetailsContext } from 'src/context';
import AddressComponent from 'src/ui-components/Address';
import styled from 'styled-components';

const Address = dynamic(() => import('./Address'),{
	loading: () => <Skeleton active />,
	ssr: false
});

const MultiSignatureAddress = dynamic(() => import('./MultiSignatureAddress'),{
	loading: () => <Skeleton active />,
	ssr: false
});

const Proxy = dynamic(() => import('./Proxy'),{
	loading: () => <Skeleton active />,
	ssr: false
});

interface IAddressHeaderProps {
    header?: string;
    id?: string;
    checked?: boolean;
    onChange?: React.Dispatch<React.SetStateAction<boolean>>;
	modal?: React.ReactNode;
}

const AddressHeader: FC<IAddressHeaderProps> = ({ checked, header, id, onChange, modal }) => {
	return (
		<>
			<article className='flex items-center gap-x-2 text-sm font-normal tracking-wide leading-6 mb-6'>
				<label className='cursor-pointer' htmlFor={id}>
					{header}
				</label>
				<Switch checked={checked} onChange={(e) => onChange? onChange(e): null} id={id} size='small' defaultChecked />
			</article>
			{checked? modal: null}
		</>
	);
};

interface Props {
	className?: string;
}

const Account: FC<Props> = ({ className }) => {
	const [isLinkAddress, setIsLinkAddress] = useState(false);
	const [isMultiSigAddress, setIsMultiSigAddress] = useState(false);
	const [isLinkProxy, setIsLinkProxy] = useState(false);
	const currentUser = useUserDetailsContext();

	return (
		<Row className={`${className} flex flex-col w-full`}>
			<Header heading='Account Settings' subHeading='Update your account settings' />
			<div className='mt-8'>
				<section>
					<AddressHeader
						checked={isLinkAddress}
						header='Link Address'
						id='link_address'
						onChange={setIsLinkAddress}
						modal={
							<Address
								open={isLinkAddress}
								dismissModal={() => setIsLinkAddress(false)}
							/>
						}
					/>
				</section>
				<section>
					<AddressHeader
						checked={isMultiSigAddress}
						header='Link Multi Signature Address'
						id='link_multi_address'
						onChange={setIsMultiSigAddress}
						modal={
							<MultiSignatureAddress
								open={isMultiSigAddress}
								dismissModal={() => setIsMultiSigAddress(false)}
							/>
						}
					/>
				</section>
				<section>
					<AddressHeader
						checked={isLinkProxy}
						header='Link Proxy Address'
						id='link_proxy'
						onChange={setIsLinkProxy}
						modal={
							<Proxy
								open={isLinkProxy}
								dismissModal={() => setIsLinkProxy(false)}
							/>
						}
					/>
				</section>
				{currentUser && currentUser.addresses && currentUser.addresses.length > 0? <section>
					<p className='text-sm font-normal tracking-wide leading-6'>
						Linked Addresses
					</p>
					<ul className='list-none flex flex-col gap-y-3 mt-3'>
						{currentUser.addresses?.map((address) => {
							return <li key={address}>
								<AddressComponent
									ethIdenticonSize={35}
									identiconSize={28}
									address={address}
								/>
							</li>;
						})}
					</ul>
				</section>: null}
			</div>
		</Row>
	);
};

export default styled(Account)`
	.ant-switch-checked {
		background-color: green_primary !important;
	}
`;