// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import PolkaSafeIcon from '~assets/icons/PolkaSafe.svg';
import TownHallIcon from '~assets/icons/TownHall.svg';
import PolkasafeWhiteIcon from '~assets/icons/polkasafe-white-logo.svg';
import StakeIcon from '~assets/stake-icon.svg';
import DelegateIcon from '~assets/delegate-icon.svg';
import { delegationSupportedNetworks } from '../Post/Tabs/PostStats/util/constants';
import { useNetworkSelector } from '~src/redux/selectors';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import { Dropdown } from '~src/ui-components/Dropdown';
import { OptionMenu } from '~src/ui-components/CustomIcons';
import { useTheme } from 'next-themes';
import classNames from 'classnames';
import { poppins } from 'pages/_app';

const ProductsRedirectionMenu = () => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();

	const menudropDownItems: ItemType[] = [
		{
			className: 'logo-class',
			key: 'Townhall',
			label: (
				<a
					href='https://townhallgov.com/'
					target='_blank'
					rel='noreferrer'
					className='custom-link after:hidden'
				>
					<span className='flex items-center gap-x-2 text-sm font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary'>
						<TownHallIcon />
						<span>TownHall</span>
					</span>
				</a>
			)
		},
		{
			className: 'logo-class',
			key: 'Polkasafe',
			label: (
				<a
					href='https://polkasafe.xyz/'
					target='_blank'
					rel='noreferrer'
					className='custom-link after:hidden'
				>
					<span className='flex items-center gap-x-2 text-sm font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary'>
						{theme === 'dark' ? <PolkasafeWhiteIcon /> : <PolkaSafeIcon />}
						<span>Polkasafe</span>
					</span>
				</a>
			)
		},
		{
			className: 'logo-class',
			key: 'Staking',
			label: (
				<a
					href='https://staking.polkadot.network/'
					target='_blank'
					rel='noreferrer'
					className='custom-link after:hidden'
				>
					<span className='flex items-center gap-x-2 text-sm font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary'>
						<StakeIcon />
						<span>Staking</span>
					</span>
				</a>
			)
		}
	];

	if (delegationSupportedNetworks?.includes(network)) {
		menudropDownItems.push({
			className: 'logo-class',
			key: 'Delegation',
			label: (
				<a
					href={`https://${network}.polkassembly.io/delegation`}
					target='_blank'
					rel='noreferrer'
					className='custom-link after:hidden'
				>
					<span className='flex items-center gap-x-2 text-sm font-medium text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary'>
						<DelegateIcon />
						<span>Delegation</span>
					</span>
				</a>
			)
		});
	}

	return (
		<Dropdown
			hideOverflow={true}
			menu={{ items: menudropDownItems }}
			trigger={['click']}
			overlayClassName={classNames(poppins.className, poppins.variable, 'navbar-dropdowns')}
			theme={theme}
			className={classNames(poppins.className, poppins.variable)}
		>
			<OptionMenu className='mt-[6px] text-2xl' />
		</Dropdown>
	);
};

export default ProductsRedirectionMenu;
