// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Col, Row } from 'antd';
import BN from 'bn.js';
import React, { FC, useContext, useEffect, useState } from 'react';
import { ApiContext } from 'src/context/ApiContext';
import HelperTooltip from 'src/ui-components/HelperTooltip';
import { PostEmptyState } from 'src/ui-components/UIStates';
import formatBnBalance from 'src/util/formatBnBalance';

import { useNetworkContext } from '~src/context';

import Address from '../../../../ui-components/Address';

interface ITippersInfo {
	tipper: string;
	value: number | string;
}

interface ITipInfoProps {
	onChainId: string;
	status: string;
	tippers?: ITippersInfo[];
	receiver?: string;
	proposer?: string;
}

const getMedian = (
	list: ITippersInfo[],
	members: string[],
	proposer?: string,
	receiver?: string,
): BN => {
	let median = new BN(0);
	if (list.length > 0) {
		const values: BN[] = list
			.map((info) => new BN(info.value))
			.sort((a, b) => new BN(a).cmp(new BN(b)));
		const midIndex = Math.floor(values.length / 2);
		median = values.length
			? values.length % 2
				? values[midIndex]
				: new BN(values[midIndex - 1])
						.add(new BN(values[midIndex]))
						.divn(2)
			: new BN(0);
		if (
			proposer &&
			receiver &&
			proposer !== receiver &&
			!members.includes(proposer) &&
			median != new BN(0)
		) {
			const findersFee = new BN(median).divn(5);
			median = new BN(median).sub(findersFee);
		}
	}
	return median;
};

const TipInfo: FC<ITipInfoProps> = (props) => {
	const { network } = useNetworkContext();

	const { tippers, receiver, proposer, status } = props;

	const { api, apiReady } = useContext(ApiContext);
	const [members, setMembers] = useState<string[]>([]);
	const [median, setMedian] = useState(new BN(0));

	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}
		let cancel = false;
		try {
			api.query.council.members().then((members) => {
				if (cancel) return;
				setMembers(members?.map((member) => member.toString()));
			});
		} catch (error) {
			// console.log(error);
		}
		return () => {
			cancel = true;
		};
	}, [api, apiReady]);

	useEffect(() => {
		if (tippers && members) {
			setMedian(getMedian(tippers, members, proposer, receiver));
		}
	}, [tippers, members, proposer, receiver]);

	if (!tippers) return <PostEmptyState />;

	const pendingTippers = members.filter(
		(item) => !tippers?.find((tip) => tip.tipper === item),
	);

	return (
		<>
			{tippers?.length > 0 ? (
				<div className="flex flex-col gap-y-7">
					<h3 className="flex items-center gap-x-2 text-lg tracking-wide text-sidebarBlue font-medium">
						Receiver of Final Tip
						<HelperTooltip
							className="text-sm"
							text="The final value of the tip is decided based on the median of all tips issued by the tippers"
						/>
					</h3>
					<Row className="flex items-center justify-between">
						<Col>
							<Address
								isSubVisible={false}
								address={receiver || ''}
							/>
						</Col>
						<Col>
							{formatBnBalance(
								median,
								{ numberAfterComma: 2, withUnit: true },
								network,
							)}
						</Col>
					</Row>
					<h3 className="flex items-center gap-x-2 text-lg tracking-wide text-sidebarBlue font-medium">
						Tippers{' '}
						<HelperTooltip
							className="text-sm"
							text="Amount tipped by an individual/organization"
						/>
					</h3>
					<div className="flex flex-col gap-y-5">
						{tippers.map((tip, i) => {
							const { tipper, value } = tip;
							return (
								<Row
									key={i}
									className="flex items-center justify-between"
								>
									<Col>
										<Address
											isSubVisible={false}
											address={tipper}
										/>
									</Col>
									<Col className="text-sm font-medium text-navBlue">
										{formatBnBalance(
											String(value),
											{
												numberAfterComma: 2,
												withUnit: true,
											},
											network,
										)}
									</Col>
								</Row>
							);
						})}
					</div>
					{status !== 'Closed' ? (
						<div className="flex flex-col gap-y-5">
							{pendingTippers.map((tip: string) => (
								<Row
									key={tip}
									className="flex items-center justify-between"
								>
									<Col>
										<Address
											isSubVisible={false}
											address={tip}
										/>
									</Col>
									<Col>Pending</Col>
								</Row>
							))}
						</div>
					) : null}
				</div>
			) : (
				<PostEmptyState />
			)}
		</>
	);
};

export default TipInfo;
