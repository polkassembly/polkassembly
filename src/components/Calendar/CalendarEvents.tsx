// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider, Spin } from 'antd';
import BN from 'bn.js';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useApiContext } from '~src/context';
import { getSinglePostLinkFromProposalType, ProposalType } from '~src/global/proposalType';
import { useNetworkSelector } from '~src/redux/selectors';
import { ICalendarEvent } from '~src/types';
import Address from '~src/ui-components/Address';
import StatusTag from '~src/ui-components/StatusTag';
import { PostEmptyState } from '~src/ui-components/UIStates';
import dateToBlockNo from '~src/util/dateToBlockNo';
import getCurrentBlock from '~src/util/getCurrentBlock';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { getTrackNameFromId } from '~src/util/trackNameFromId';

interface Props {
	selectedDate: Date;
	setCalendarEvents?: (pre: ICalendarEvent[]) => void;
	setCalendarLoading?: (pre: boolean) => void;
}
interface IEventsWithTimeStamps {
	[key: string]: {
		blockNo: number;
		events: ICalendarEvent[];
		nearbyLast: string;
		nearbyStart: string;
	};
}

const updateEventsWithTimeStamps = (events: ICalendarEvent[], blockNo: number): IEventsWithTimeStamps | null => {
	if (!events?.length) return null;
	const obj: IEventsWithTimeStamps = {};

	events?.map((item) => {
		const timelineDetails = item?.statusHistory?.filter((status) => status?.block >= blockNo)?.sort((a, b) => a?.block - b?.block);
		timelineDetails?.map((timeline) => {
			const nearbyStart = dayjs(timeline?.timestamp).startOf('hour');
			const nearbyLast = nearbyStart.add(1, 'hour');

			const key = `${nearbyStart.format('h:mm a')} - ${nearbyLast.format('h:mm a')}`;

			obj[key] = {
				blockNo: timeline?.block,
				events: obj?.[key]
					? [...(obj?.[key]?.events || []), { ...item, blockNo: timeline?.block, createdAt: timeline?.timestamp, status: timeline?.status }]
					: [{ ...item, blockNo: timeline?.block, createdAt: timeline?.timestamp, status: timeline?.status }],
				nearbyLast: nearbyLast.format('h:mm a'),
				nearbyStart: nearbyStart.format('h:mm a')
			};
		});
	});
	//sort by blockNo
	const newObj = obj ? Object.fromEntries(Object.entries(obj).sort((a, b) => a[1]?.blockNo - b[1]?.blockNo)) : null;
	return newObj;
};

const CalendarEvents = ({ selectedDate, setCalendarEvents, setCalendarLoading }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const [currentBlock, setCurrentBlock] = useState<BN | null>(null);
	const [formatedEvents, setformatedEvents] = useState<IEventsWithTimeStamps | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [selectedMonth, setSelectedMonth] = useState('');
	const [allEvents, setAllEvents] = useState<ICalendarEvent[]>([]);

	const fetchCurrentBlock = useCallback(async () => {
		if (!api || !apiReady) return;
		const currentBlock = await getCurrentBlock({ api, apiReady });
		setCurrentBlock(currentBlock || null);
	}, [api, apiReady]);

	useEffect(() => {
		fetchCurrentBlock();
	}, [fetchCurrentBlock]);

	const getAllEvents = async () => {
		setLoading(true);
		setCalendarLoading?.(true);

		const startDateOfMonth = dayjs(selectedDate).startOf('month').toDate();
		const endDateOfMonth = dayjs(selectedDate).endOf('month').toDate();

		const startBlockNo = dateToBlockNo({ currentBlockNumber: currentBlock?.toNumber() || 0, date: startDateOfMonth, network });
		const endBlockNo = dateToBlockNo({ currentBlockNumber: currentBlock?.toNumber() || 0, date: endDateOfMonth, network });

		if (startBlockNo && currentBlock && startBlockNo > currentBlock?.toNumber()) {
			setLoading(false);
			setformatedEvents(null);
			setCalendarLoading?.(false);
			return;
		}

		const { data, error } = await nextApiClientFetch<ICalendarEvent[]>('/api/v1/calendar/getEventsByDate', {
			endBlockNo,
			startBlockNo
		});

		if (error) {
			console.error(error);
		}
		setAllEvents(data || []);
		setCalendarEvents?.(data || []);

		handleSelectedDateChange(data || []);
		setLoading(false);
		setCalendarLoading?.(false);
	};

	const handleSelectedDateChange = (data: ICalendarEvent[]) => {
		setLoading(true);
		setCalendarLoading?.(true);
		const startBlockNo = dateToBlockNo({ currentBlockNumber: currentBlock?.toNumber() || 0, date: selectedDate, network }) || 0;
		const endBlockNo = dateToBlockNo({ currentBlockNumber: currentBlock?.toNumber() || 0, date: dayjs(selectedDate)?.add(24, 'hours').toDate(), network }) || 0;

		const filteredEvents = data?.filter((event) => event?.statusHistory?.map((item) => item?.block >= startBlockNo && item?.block < endBlockNo));

		const updatedEvents = updateEventsWithTimeStamps(filteredEvents || [], startBlockNo || 0);
		setformatedEvents(updatedEvents || null);
		setLoading(false);
		setCalendarLoading?.(false);
	};

	useEffect(() => {
		if (!network || !selectedDate || !currentBlock) return;

		handleSelectedDateChange(allEvents || []);

		const newMonth = dayjs(selectedDate)?.format('MMM YYYY');
		if (selectedMonth === newMonth && allEvents?.length) return;

		setCalendarEvents?.([]);
		setSelectedMonth(newMonth);

		getAllEvents();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, selectedDate, currentBlock]);

	return (
		<Spin spinning={loading}>
			<div className='px-4'>
				<main className='mt-6 flex items-center gap-2 text-bodyBlue dark:text-blue-dark-high'>
					<span className='text-xl font-semibold'>Events</span>
					<span className='mt-0.5 text-lg font-normal'>({dayjs(selectedDate).format('MMM DD, YYYY')})</span>
				</main>
				<div className='mt-4 flex min-h-40 flex-col gap-4'>
					{formatedEvents && Object.keys(formatedEvents)?.length
						? Object.entries(formatedEvents).map(([key, value], index) => {
								return (
									<div
										key={key}
										className='flex flex-col'
									>
										{value?.nearbyStart !== formatedEvents[Object.keys(formatedEvents)[index - 1]]?.nearbyLast && (
											<div className='flex items-center gap-2'>
												<div className='flex flex-shrink-0'>{value.nearbyStart}</div>
												<div className='w-full'>
													<Divider
														className='bg-section-light-container dark:bg-separatorDark'
														type='horizontal'
													/>
												</div>
											</div>
										)}
										<div className='flex flex-col gap-4'>
											{value.events
												?.sort((a, b) => (a.blockNo || 0) - (b?.blockNo || 0))
												.map((event) => {
													return (
														<div
															key={event?.blockNo}
															className='flex w-full flex-col gap-4 rounded-md border-[1px] border-solid border-section-light-container py-4 dark:border-separatorDark'
														>
															<div className='flex gap-2 border-0 border-b-[1px] border-solid border-section-light-container px-5 pb-4 text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high max-md:flex-col md:justify-between'>
																<div className='flex gap-1 max-md:flex-col md:items-center'>
																	<div className='flex items-center gap-2'>
																		<span className='font-normal text-lightBlue dark:text-icon-dark-inactive'>[{dayjs(event?.createdAt).format('h: mm a')}]</span>
																		{event?.status && (
																			<StatusTag
																				status={event?.status}
																				className='md:hidden'
																			/>
																		)}
																	</div>
																	<Link
																		className='gap-2 text-base font-medium hover:underline max-md:text-sm'
																		href={`/${getSinglePostLinkFromProposalType(event.proposalType)}/${event.index}`}
																	>
																		{event?.title?.length > 80 ? `${event?.title?.slice(0, 80)}...` : event?.title}
																	</Link>
																	{event?.status && (
																		<StatusTag
																			status={event?.status}
																			className='max-md:hidden'
																		/>
																	)}
																</div>
																<div className='py-1 capitalize'>{event?.proposalType == ProposalType.OPEN_GOV ? 'OpenGov' : event?.proposalType.split('_').join(' ')}</div>
															</div>
															<div className='flex flex-col gap-1 px-5'>
																<div className='flex items-center gap-1 max-md:text-xs '>
																	<span className='text-lightBlue dark:text-icon-dark-inactive'>Index:</span>
																	<Link
																		className='hover:underline'
																		href={`/${getSinglePostLinkFromProposalType(event.proposalType)}/${event.index}`}
																	>
																		#{event?.index}
																	</Link>
																</div>
																{!!event?.parentBountyIndex && (
																	<div className='flex items-center gap-2 max-md:text-xs'>
																		<span className='text-lightBlue dark:text-icon-dark-inactive'>Parent Bounty Index:</span>
																		<Link
																			className='hover:underline'
																			href={`/${getSinglePostLinkFromProposalType(ProposalType.BOUNTIES)}/${event.parentBountyIndex}`}
																		>
																			#{event?.parentBountyIndex}
																		</Link>
																	</div>
																)}

																{!!event?.proposer && (
																	<div className='flex items-center gap-2 max-md:text-xs'>
																		<span className='text-lightBlue dark:text-icon-dark-inactive'>Proposer:</span>
																		<Address
																			address={event?.proposer}
																			displayInline
																			iconSize={16}
																			addressClassName='items-center font-normal'
																			className='items-center font-normal'
																			isTruncateUsername={false}
																		/>
																	</div>
																)}
																{event?.trackNo && !isNaN(event?.trackNo) && (
																	<div className='flex items-center gap-2 capitalize max-md:text-xs'>
																		<span className='text-lightBlue dark:text-icon-dark-inactive'>Track:</span>
																		<Link
																			className='hover:underline'
																			href={`/${getTrackNameFromId(network, event?.trackNo).split('_').join('-')}`}
																		>
																			{getTrackNameFromId(network, event?.trackNo)?.split('_').join(' ')}
																		</Link>
																	</div>
																)}
															</div>
														</div>
													);
												})}
										</div>
										{value?.nearbyLast !== formatedEvents[Object.keys(formatedEvents)[index - 1]]?.nearbyStart && (
											<div className='flex items-center gap-2'>
												<div className='flex flex-shrink-0'>{value.nearbyLast}</div>
												<div className='w-full'>
													<Divider
														className='bg-section-light-container dark:bg-separatorDark'
														type='horizontal'
													/>{' '}
												</div>
											</div>
										)}
									</div>
								);
							})
						: !loading && (
								<PostEmptyState
									className='my-0'
									text='No Calendar Event Found!'
								/>
							)}
				</div>
			</div>
		</Spin>
	);
};
export default CalendarEvents;
