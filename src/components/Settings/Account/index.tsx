// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Row, Skeleton } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import dynamic from 'next/dynamic';
import React, { FC, useState } from 'react';
import styled from 'styled-components';
import AccountIcon from '~assets/icons/account-icon.svg';
import { Collapse } from '../Notifications/common-ui/Collapse';

const { Panel } = Collapse;

const Address = dynamic(() => import('./Address'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const MultiSignatureAddress = dynamic(() => import('./MultiSignatureAddress'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const Proxy = dynamic(() => import('./Proxy'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface IAddressHeaderProps {
  header?: string;
  id?: string;
  checked?: boolean;
  onChange?: React.Dispatch<React.SetStateAction<boolean>>;
  modal?: React.ReactNode;
  subHeading?: string;
}

const AddressHeader: FC<IAddressHeaderProps> = ({
	checked,
	header,
	id,
	onChange,
	modal,
	subHeading
}) => {
	return (
		<>
			<article className="flex items-center gap-1 text-xs font-normal tracking-wide leading-6 align-center">
				<label
					className="cursor-pointer text-pink_primary font-medium text-sm"
					htmlFor={id}
					onClick={(e: any) => onChange?.(e)}
				>
					{header}
				</label>
				<span>{subHeading}</span>
			</article>
			{checked ? modal : null}
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
	const [active, setActive] = useState(false);
	return (
		<Collapse
			size="large"
			className="bg-white"
			expandIconPosition="end"
			expandIcon={({ isActive }) => {
				setActive(isActive || false);
				return isActive ? <CollapseIcon /> : <ExpandIcon />;
			}}
		>
			<Panel
				header={
					<div className="flex items-center gap-[6px] channel-header">
						<AccountIcon />
						<h3 className="font-semibold text-[16px] text-[#243A57] md:text-[18px] tracking-wide leading-[21px] mb-0 mt-[2px]">
              Account Settings{' '}
							{active && (
								<span className="text-[#243A57] text-sm font-normal">
                  Update your account settings here
								</span>
							)}
						</h3>
					</div>
				}
				key="1"
			>
				<Row className={`${className} flex flex-col w-full`}>
					<div className="flex flex-col gap-4">
						<section>
							<AddressHeader
								checked={isLinkAddress}
								header="Link Address"
								id="link_address"
								onChange={setIsLinkAddress}
								subHeading="For participating in governance activities with your multisig"
								modal={
									<Address
										open={isLinkAddress}
										dismissModal={() => setIsLinkAddress(false)}
									/>
								}
							/>
						</section>
						<Divider className="m-0 text-[#D2D8E0]" />
						<section>
							<AddressHeader
								checked={isMultiSigAddress}
								header="Link Multi Signature Address"
								id="link_multi_address"
								onChange={setIsMultiSigAddress}
								subHeading="For participating in governance activities with your proxy account"
								modal={
									<MultiSignatureAddress
										open={isMultiSigAddress}
										dismissModal={() => setIsMultiSigAddress(false)}
									/>
								}
							/>
						</section>
						<Divider className="m-0 text-[#D2D8E0]" />
						<section>
							<AddressHeader
								checked={isLinkProxy}
								header="Link Proxy Address"
								id="link_proxy"
								onChange={setIsLinkProxy}
								subHeading="For participating in governance activities with your wallet address"
								modal={
									<Proxy
										open={isLinkProxy}
										dismissModal={() => setIsLinkProxy(false)}
									/>
								}
							/>
						</section>
					</div>
				</Row>
			</Panel>
		</Collapse>
	);
};

export default styled(Account)`
  .ant-switch-checked {
    background-color: green_primary !important;
  }
`;
