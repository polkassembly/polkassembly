// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Link from 'next/link';
import styled from 'styled-components';
import PaLogo from './PaLogo';
import PaLogoDark from '~assets/PALogoDark.svg';
import { RedirectIcon } from '~src/ui-components/CustomIcons';
import { Divider, Space } from 'antd';
import TwitterIcon from '~assets/icons/twitter-pink-bg.svg';
import DiscordIcon from '~assets/icons/discord-icon.svg';
import TelegramIcon from '~assets/icons/telegram-icon.svg';
import InternetIcon from '~assets/icons/internet-icon.svg';
import TwitterIconSm from '~assets/icons/twitter-icon-sm.svg';
import DiscordIconSm from '~assets/icons/discord-icon-sm.svg';
import TelegramIconSm from '~assets/icons/telegram-icon-sm.svg';
import InternetIconSm from '~assets/icons/internet-icon-sm.svg';
import DiscordDarkIcon from '~assets/icons/discord-dark.svg';
import TelegramDarkIcon from '~assets/icons/telegram-dark.svg';
import TwitterDarkIcon from '~assets/icons/twitter-dark.svg';
import InternetDarkIcon from '~assets/icons/web-dark.svg';
import TwitterIconDarkSm from '~assets/icons/twitter-dark-mobile.svg';
import DiscordIconDarkSm from '~assets/icons/discord-dark-mobile.svg';
import TelegramIconDarkSm from '~assets/icons/telegram-dark-mobile.svg';
import InternetIconDarkSm from '~assets/icons/web-dark-mobile.svg';
import AiBot from '../AiBot/AiBot';
import { useState } from 'react';

<<<<<<< HEAD
const Footer = ({ className, theme } : { className?:string, theme?:string }) => {

=======
const Footer = ({ className }: { className?: string }) => {
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
	const [isAIChatBotOpen, setIsAIChatBotOpen] = useState(false);
	const [floatButtonOpen, setFloatButtonOpen] = useState(false);

	return (
<<<<<<< HEAD
		<footer aria-label="Site Footer" className={`${className} bg-white max-[650px]:rounded-[14px] dark:bg-section-dark-overlay`}>
			<div className="mx-auto max-w-screen-xl px-4 pt-8  sm:px-6 lg:pl-8 lg:pr-2 dark:bg-section-dark-overlay">
				<div className="flex flex-col md:flex-row ">
					{/* Logo and Network Link */}
					<div>
						<div className="flex justify-center sm:justify-start">
							<Link className='flex' href='/'>
								{
									theme === 'dark' ?
										<PaLogoDark className='h-auto w-[180px]' />
										:
										<PaLogo className='h-auto w-[180px]' />
								}
							</Link>
						</div>

						<div className='mt-3 flex justify-center md:inline-block max-[650px]:hidden'>
							<Space size={19} className='items-center '>

								<a href={'https://twitter.com/polk_gov'} target='_blank' rel='noreferrer'>
									{
										theme === 'dark' ?
											<TwitterDarkIcon className='text-sm md:text-lg md:mr-1 text-lightBlue' />
											:
											<TwitterIcon className='text-sm md:text-lg md:mr-1 text-lightBlue' />
									}
								</a>

								<a href={'https://discord.com/invite/CYmYWHgPha'} target='_blank' rel='noreferrer'>
									{
										theme === 'dark' ?
											<DiscordDarkIcon className='text-sm md:text-lg md:mr-1 text-lightBlue' />
											:
											<DiscordIcon className='text-sm md:text-lg md:mr-1 text-lightBlue' />
									}
								</a>

								<a href={'https://t.me/+6WQDzi6RuIw3YzY1'} target='_blank' rel='noreferrer'>
									{
										theme === 'dark' ?
											<TelegramDarkIcon className='text-sm md:text-lg md:mr-1 text-lightBlue' />
											:
											<TelegramIcon className='text-sm md:text-lg md:mr-1 text-lightBlue' />
									}
								</a>

								<a href={'https://polkassembly.io/'} target='_blank' rel='noreferrer'>
									{
										theme === 'dark' ?
											<InternetDarkIcon className='text-sm md:text-lg md:mr-1 text-lightBlue' />
											:
											<InternetIcon className='text-sm md:text-lg md:mr-1 text-lightBlue' />
									}
=======
		<footer
			aria-label='Site Footer'
			className={`${className} bg-white max-[650px]:rounded-[14px] `}
		>
			<div className='mx-auto max-w-screen-xl px-4 pt-8  sm:px-6 lg:pl-8 lg:pr-2'>
				<div className='flex flex-col md:flex-row '>
					{/* Logo and Network Link */}
					<div>
						<div className='flex justify-center sm:justify-start'>
							<Link
								className='flex'
								href='/'
							>
								<PaLogo className='h-auto w-[180px]' />
							</Link>
						</div>

						<div className='mt-3 flex justify-center max-[650px]:hidden md:inline-block'>
							<Space
								size={19}
								className='items-center '
							>
								<a
									href={'https://twitter.com/polk_gov'}
									target='_blank'
									rel='noreferrer'
								>
									<TwitterIcon className='text-sm text-lightBlue md:mr-1 md:text-lg' />
								</a>

								<a
									href={'https://discord.com/invite/CYmYWHgPha'}
									target='_blank'
									rel='noreferrer'
								>
									<DiscordIcon className='text-sm text-lightBlue md:mr-1 md:text-lg' />
								</a>

								<a
									href={'https://t.me/+6WQDzi6RuIw3YzY1'}
									target='_blank'
									rel='noreferrer'
								>
									<TelegramIcon className='text-sm text-lightBlue md:mr-1 md:text-lg' />
								</a>

								<a
									href={'https://polkassembly.io/'}
									target='_blank'
									rel='noreferrer'
								>
									<InternetIcon className='text-sm text-lightBlue md:mr-1 md:text-lg' />
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
								</a>
							</Space>
						</div>
					</div>

					{/* Terms Links */}
<<<<<<< HEAD
					<div className="mt-8 md:mt-0 mx-auto md:mx-0 md:ml-auto flex flex-col md:flex-row justify-center md:justify-end">
						<div className="md:ml-10 lg:ml-14 text-center sm:text-left">
							<p className="text-sm font-bold text-blue-light-high dark:text-blue-dark-medium mb-[-5px] max-[650px]:mt-[-15px] ">Help Center</p>

							<nav aria-label="Footer About Nav" className="mt-4 md:mt-3">
								<div className="space-y-2 text-sm text-lightBlue dark:text-blue-dark-high font-normal">
=======
					<div className='mx-auto mt-8 flex flex-col justify-center md:mx-0 md:ml-auto md:mt-0 md:flex-row md:justify-end'>
						<div className='text-center sm:text-left md:ml-10 lg:ml-14'>
							<p className='mb-[-5px] text-lg font-bold text-bodyBlue max-[650px]:mt-[-15px] '>Help Center</p>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29

							<nav
								aria-label='Footer About Nav'
								className='mt-4 md:mt-3'
							>
								<div className='space-y-2 text-sm font-normal text-lightBlue'>
									<div>
										<a
											href='https://polkassembly.hellonext.co/'
											target='_blank'
											rel='noreferrer'
										>
											Report an Issue
											<RedirectIcon className='ml-3 text-lightBlue dark:text-blue-dark-high' />
										</a>
									</div>
									<div className='max-[650px]:mb-[-5px]'>
										<a
											href='https://feedback.polkassembly.io'
											target='_blank'
											rel='noreferrer'
										>
											Feedback
											<RedirectIcon className='ml-3 text-lightBlue dark:text-blue-dark-high' />
										</a>
									</div>
									<div className='max-[650px]:hidden'>
										<Link href='/terms-and-conditions'>Terms and Conditions</Link>
									</div>
									<div>
										<a
											href='https://github.com/polkassembly/polkassembly'
											target='_blank'
											rel='noreferrer'
										>
											Github
											<RedirectIcon className='ml-3 text-lightBlue dark:text-blue-dark-high' />
										</a>
									</div>
								</div>
							</nav>
						</div>

<<<<<<< HEAD
						<div className="mt-8 md:mt-0 md:ml-10 lg:ml-14 text-center sm:text-left text-lightBlue dark:text-blue-dark-high font-normal">
							<p className="text-sm font-bold text-blue-light-high dark:text-blue-dark-medium mb-[-5px] max-[650px]:mt-[-15px] ">Our Services</p>
=======
						<div className='mt-8 text-center font-normal text-lightBlue sm:text-left md:ml-10 md:mt-0 lg:ml-14'>
							<p className='mb-[-5px] text-lg font-bold text-bodyBlue max-[650px]:mt-[-15px] '>Our Services</p>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29

							<nav
								aria-label='Footer Services Nav'
								className='mt-4 md:mt-3'
							>
								<div className='space-y-2 text-sm'>
									<div>
										<a
											href='https://docs.polkassembly.io/'
											target='_blank'
											rel='noreferrer'
										>
											Docs
										</a>
										<RedirectIcon className='ml-3 dark:text-white' />
									</div>

									<div className='max-[650px]:hidden'>
										<Link href={'/terms-of-website'}>Terms of Website</Link>
									</div>

									<div className='max-[650px]:hidden'>
										<Link href={'/privacy'}>Privacy Policy</Link>
									</div>
								</div>
							</nav>
						</div>
					</div>
				</div>

				{/* Below divider */}
				<Divider className='mb-0' />
<<<<<<< HEAD
				<div className="mt-5 pb-3 text-sm text-lightBlue dark:text-blue-dark-high font-medium">
					<div className="text-center sm:flex sm:justify-between sm:text-left">
=======
				<div className='mt-5 pb-3 text-sm font-medium text-lightBlue'>
					<div className='text-center sm:flex sm:justify-between sm:text-left'>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
						<div className='flex max-[650px]:flex-col'>
							<p className=' mr-1 max-[650px]:mb-0 '>A House of Commons Initiative.</p>
							<p className='mt-4  sm:mt-0 '>Polka Labs Private Limited {new Date().getFullYear()}</p>
						</div>

						<p className='mb-0'>
							<span className='block sm:inline'>All rights reserved.</span>
						</p>
					</div>
				</div>
				<div className='md:hidden'>
					<div className='mt-1 flex justify-center'>
<<<<<<< HEAD
						<Space size={19} className='items-center '>

							<a href={'https://twitter.com/polk_gov'} target='_blank' rel='noreferrer'>
								{
									theme === 'dark' ?
										<TwitterIconDarkSm className='text-sm md:text-lg md:mr-1' />
										:
										<TwitterIconSm className='text-sm md:text-lg md:mr-1 text-lightBlue' />
								}
							</a>

							<a href={'https://discord.com/invite/CYmYWHgPha'} target='_blank' rel='noreferrer'>
								{
									theme === 'dark' ?
										<DiscordIconDarkSm className='text-sm md:text-lg md:mr-1' />
										:
										<DiscordIconSm className='text-sm md:text-lg md:mr-1 text-lightBlue' />
								}
							</a>

							<a href={'https://t.me/+6WQDzi6RuIw3YzY1'} target='_blank' rel='noreferrer'>
								{
									theme === 'dark' ?
										<TelegramIconDarkSm className='text-sm md:text-lg md:mr-1' />
										:
										<TelegramIconSm className='text-sm md:text-lg md:mr-1 text-lightBlue' />
								}
							</a>

							<a href={'https://polkassembly.io/'} target='_blank' rel='noreferrer'>
								{
									theme === 'dark' ?
										<InternetIconDarkSm className='text-sm md:text-lg md:mr-1' />
										:
										<InternetIconSm className='text-sm md:text-lg md:mr-1 text-lightBlue' />
								}
=======
						<Space
							size={19}
							className='items-center '
						>
							<a
								href={'https://twitter.com/polk_gov'}
								target='_blank'
								rel='noreferrer'
							>
								<TwitterIconSm className='text-sm text-lightBlue md:mr-1 md:text-lg' />
							</a>

							<a
								href={'https://discord.com/invite/CYmYWHgPha'}
								target='_blank'
								rel='noreferrer'
							>
								<DiscordIconSm className='text-sm text-lightBlue md:mr-1 md:text-lg' />
							</a>

							<a
								href={'https://t.me/+6WQDzi6RuIw3YzY1'}
								target='_blank'
								rel='noreferrer'
							>
								<TelegramIconSm className='text-sm text-lightBlue md:mr-1 md:text-lg' />
							</a>

							<a
								href={'https://polkassembly.io/'}
								target='_blank'
								rel='noreferrer'
							>
								<InternetIconSm className='text-sm text-lightBlue md:mr-1 md:text-lg' />
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
							</a>
						</Space>
					</div>

<<<<<<< HEAD
					<div className='flex flex-col justify-center mt-2 text-[10px] text-[#96A4B6] dark:text-blue-dark-medium font-normal leading-[15px]'>
=======
					<div className='mt-2 flex flex-col justify-center text-[10px] font-normal leading-[15px] text-[#96A4B6]'>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
						<div className='flex justify-center'>
							<Link href='/terms-and-conditions'>Terms and Conditions</Link>
							<Link
								href={'/terms-of-website'}
								className='ml-2'
							>
								Terms of Website
							</Link>
						</div>
						<Link
							href={'/privacy'}
							className='mx-auto mt-2'
						>
							Privacy Policy
						</Link>
					</div>
				</div>
			</div>
			<AiBot
				isAIChatBotOpen={isAIChatBotOpen}
				setIsAIChatBotOpen={setIsAIChatBotOpen}
				floatButtonOpen={floatButtonOpen}
				setFloatButtonOpen={setFloatButtonOpen}
			/>
		</footer>
	);
};

export default styled(Footer)`
	.anticon:hover {
		outline: pink_primary 2px solid;
		path {
			fill: pink_primary !important;
		}
	}
`;
