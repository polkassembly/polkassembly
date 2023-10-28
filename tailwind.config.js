// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
module.exports = {
	important: true,
	darkMode: 'class',
	content: ['./pages/**/*.{js,ts,jsx,tsx}', './src/**/*.{jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				poppins: ['var(--font-poppins)']
			},
			colors: {
				navBlue: 'var(--navBlue)',
				// blue: 'var(--blue)',
				sidebarBlue: 'var(--sidebarBlue)',
				bodyBlue: 'var(--bodyBlue)',
				lightBlue: 'var(--lightBlue)',
				blue_primary: 'var(--blue_primary)',
				blue_secondary: 'var(--blue_secondary)',
				green_primary: 'var(--green_primary)',
				green_secondary: 'var(--green_secondary)',
				grey_app_background: 'var(--grey_app_background)',
				grey_border: 'var(--grey_border)',
				grey_light: 'var(--grey_light)',
				grey_primary: 'var(--grey_primary)',
				grey_secondary: 'var(--grey_secondary)',
				icon_grey: 'var(--icon_grey)',
				nav_black: 'var(--nav_black)',
				pink_primary: 'var(--pink_primary)',
				pink_primary_transparent: 'var(--pink_primary_transparent)',
				pink_secondary: 'var(--pink_secondary)',
				pink_light: 'var(--pink_light)',
				red_light: 'var(--red_light)',
				red_primary: 'var(--red_primary)',
				red_secondary: 'var(--red_secondary)',
				aye_green: 'var(--aye_green)',
				aye_green_Dark: 'var(--aye_green_Dark)',
				nay_red: 'var(--nay_red)',
				nay_red_Dark: 'var(--nay_red_Dark)',
				comment_bg: 'var(--comment_bg)',
				separatorDark: 'var(--separatorDark)',
				inactiveIconDark: 'var(--inactiveIconDark)',
				modalOverlayDark: 'var(--modalOverlayDark)',
				alertColorDark: 'var(--alertColorDark)',
				disableStateDark: 'var(--disableStateDark)',
				blue: {
					light: {
						disabled: '#96A4B6',
						helper: '#576D8B',
						medium: '#485F7D',
						high: '#243A57'
					},
					dark: {
						helper: '#FF60B5',
						medium: '#909090',
						high: '#FFFFFF'
					}
				},
				red: {
					light: {
						text: '#A8071A',
						medium: '#E91C26',
						high: '#CF1322'
					},
					dark: {
						text: '#A8071A',
						medium: '#E91C26',
						high: '#CF1322'
					}
				},
				icon: {
					light: {
						active: '#243A57',
						inactive: '#485F7D',
						disabled: '#96A4B6'
					},
					dark: {
						active: '#FF0088',
						inactive: '#9E9E9E'
					}
				},
				section: {
					light: {
						container: '#D2D8E0',
						background: '#F5F6F8',
						overlay: '#0000004D'
					},
					dark: {
						container: '#3B444F',
						background: '#1C1D1F',
						overlay: '#0D0D0D'
					}
				}
			},
			screens: {
				xs: '320px'
			},
			borderRadius: {
				xxl: '0.875rem'
			}
		}
	},
	plugins: [],
	corePlugins: {
		preflight: false
	}
};
