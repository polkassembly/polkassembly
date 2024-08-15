import { ResponsivePie } from '@nivo/pie';
import { Card, Spin } from 'antd';
import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import { MessageType } from '~src/auth/types';
import { useNetworkSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { getTrackNameFromId } from '~src/util/trackNameFromId';

const StyledCard = styled(Card)`
	g[transform='translate(0,0)'] g:nth-child(even) {
		display: none !important;
	}
	div[style*='pointer-events: none;'] {
		visibility: hidden;
		animation: fadeIn 0.5s forwards;
	}

	@keyframes fadeIn {
		0% {
			visibility: hidden;
			opacity: 0;
		}
		100% {
			visibility: visible;
			opacity: 1;
		}
	}
	@media (max-width: 640px) {
		.ant-card-body {
			padding: 12px !important;
		}
	}
`;
interface TrackInfo {
	[key: string]: number;
}

const ReferendumCount = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [trackInfo, setTrackInfo] = useState<TrackInfo>();
    const { network } = useNetworkSelector();

    const getData = async () => {
		setLoading(true);
		try {
			const { data } = await nextApiClientFetch<any | MessageType>('/api/v1/govAnalytics/ReferendumCount');
			if (data) {
                const updatedTrackInfo: TrackInfo = {};
				Object?.entries(data.trackDataMap).forEach(([key, value]) => {
					const trackName = getTrackNameFromId(network, parseInt(key));
					updatedTrackInfo[trackName] = value as number;
				});

				setTrackInfo(updatedTrackInfo);
                console.log('total items --> ', updatedTrackInfo);
				setLoading(false);
			}
		} catch (error) {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

    const data = trackInfo ? Object?.entries(trackInfo).map(([key, value], index) => ({
        id: key,
        label: key,
        value: value,
        color: `hsl(${index * 30}, 70%, 50%)`
    })) : [];

    return (
        <StyledCard className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white '>
            <h2 className='text-base font-semibold sm:text-xl'>Referendum Count</h2>
            <Spin spinning={loading}>
                <div
                    className='flex justify-start'
                    style={{ height: '300px', width: '100%' }}
                >
                    <ResponsivePie
                        data={data}
                        margin={{
                            bottom: 8,
                            left: -520,
                            right: 260,
                            top: 20
                        }}
                        colors={{ datum: 'data.color' }}
                        innerRadius={0.8}
                        padAngle={0.7}
                        cornerRadius={15}
                        activeOuterRadiusOffset={8}
                        borderWidth={1}
                        borderColor={{
                            from: 'color',
                            modifiers: [['darker', 0.2]]
                        }}
                        enableArcLinkLabels={false}
                        arcLinkLabelsSkipAngle={10}
                        arcLinkLabelsTextColor='#333333'
                        arcLinkLabelsThickness={2}
                        arcLinkLabelsColor='#c93b3b'
                        enableArcLabels={false}
                        arcLabelsRadiusOffset={0.55}
                        arcLabelsSkipAngle={10}
                        arcLabelsTextColor={{
                            from: 'color',
                            modifiers: [['darker', 2]]
                        }}
                        defs={[
                            {
                                background: 'inherit',
                                color: 'rgba(255, 255, 255, 0.3)',
                                id: 'dots',
                                padding: 1,
                                size: 4,
                                stagger: true,
                                type: 'patternDots'
                            },
                            {
                                background: 'inherit',
                                color: 'rgba(255, 255, 255, 0.3)',
                                id: 'lines',
                                lineWidth: 6,
                                rotation: -45,
                                spacing: 10,
                                type: 'patternLines'
                            }
                        ]}
                        legends={[
                            {
                                anchor: 'right',
                                direction: 'column',
                                justify: false,
                                translateX: 0,
                                translateY: 0,
                                itemsSpacing: 1,
                                itemWidth: 100, // Adjust width based on your needs
                                itemHeight: 20,
                                itemDirection: 'left-to-right',
                                symbolSize: 16,
                                itemTextColor: '#999',
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemTextColor: '#000'
                                        }
                                    }
                                ],
                                // Custom logic to create 3 columns
                                data: data.map((item, index) => ({
                                    ...item,
                                    color: item.color,
                                    id: item.id,
                                    label: `${item.label} - ${item.value}`,
                                    x: (index % 3) * 120, // Adjust spacing between columns
                                    y: Math.floor(index / 3) * 30 // Adjust spacing between rows
                                })),
                            }
                        ]}
                    />
                </div>
            </Spin>
        </StyledCard>
    )
}

export default ReferendumCount