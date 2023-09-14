// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Inspired by https://github.com/codecks-io/react-sticky-box/blob/master/packages/react-sticky-box/src/index.tsx

import { ComponentProps, useEffect, useState } from 'react';

const getScrollParent = (node: HTMLElement) => {
	let parent: HTMLElement | null = node;
	while ((parent = parent.parentElement)) {
		const overflowForY = getComputedStyle(parent, null).getPropertyValue('overflow-y');
		if (parent === document.body) return window;
		if (overflowForY === 'auto' || overflowForY === 'scroll' || overflowForY === 'overlay') {
			return parent;
		}
	}
	return window;
};

const isOffsetElement = (el: HTMLElement): boolean => (el.firstChild ? (el.firstChild as HTMLElement).offsetParent === el : true);

const getParentNode = (node: HTMLElement) => {
	let currentParent = node.parentElement;
	while (currentParent) {
		const style = getComputedStyle(currentParent, null);
		if (style.getPropertyValue('display') !== 'contents') break;
		currentParent = currentParent.parentElement;
	}
	return currentParent || window;
};

let stickyProp: null | string = null;
if (typeof CSS !== 'undefined' && CSS.supports) {
	if (CSS.supports('position', 'sticky')) stickyProp = 'sticky';
	else if (CSS.supports('position', '-webkit-sticky')) stickyProp = '-webkit-sticky';
}

let passiveArg: false | { passive: true } = false;
try {
	const opts = Object.defineProperty({}, 'passive', {
		// eslint-disable-next-line getter-return
		get() {
			passiveArg = { passive: true };
		}
	});
	const emptyHandler = () => {};
	window.addEventListener('testPassive', emptyHandler, opts);
	window.removeEventListener('testPassive', emptyHandler, opts);
} catch (e) {
	console.log(e);
}

const offsetLimit = (node: HTMLElement, target: HTMLElement) => {
	let current = node;
	let offset = 0;
	// If target is not an offsetParent itself, subtract its offsetTop and set correct target
	if (!isOffsetElement(target)) {
		offset += node.offsetTop - target.offsetTop;
		target = node.offsetParent as HTMLElement;
		offset += -node.offsetTop;
	}
	do {
		offset += current.offsetTop;
		current = current.offsetParent as HTMLElement;
	} while (current && current !== target);
	return offset;
};

type UnsubList = (() => void)[];
type MeasureFn<T extends object> = (opts: { top: number; left: number; height: number; width: number }) => T;

const getDimensions = <T extends object>(opts: { el: HTMLElement | Window; onChange: () => void; unsubs: UnsubList; measure: MeasureFn<T> }): T => {
	const { el, onChange, unsubs, measure } = opts;
	if (el === window) {
		const getRect = () => ({
			height: window.innerHeight,
			left: 0,
			top: 0,
			width: window.innerWidth
		});
		const resultM = measure(getRect());
		const handler = () => {
			Object.assign(resultM, measure(getRect()));
			onChange();
		};
		window.addEventListener('resize', handler, passiveArg);
		unsubs.push(() => window.removeEventListener('resize', handler));
		return resultM;
	} else {
		const resultM = measure((el as HTMLElement).getBoundingClientRect());
		const handler: ResizeObserverCallback = () => {
			// note the e[0].contentRect is different from `getBoundingClientRect`
			Object.assign(resultM, measure((el as HTMLElement).getBoundingClientRect()));
			onChange();
		};
		const ro = new ResizeObserver(handler);
		ro.observe(el as HTMLElement);
		unsubs.push(() => ro.disconnect());
		return resultM;
	}
};

const VerticalPadding = (node: HTMLElement) => {
	const calculatedParentStyle = getComputedStyle(node, null);
	const parentPaddingTop = parseInt(calculatedParentStyle.getPropertyValue('padding-top'), 10);
	const parentPaddingBottom = parseInt(calculatedParentStyle.getPropertyValue('padding-bottom'), 10);
	return { bottom: parentPaddingBottom, top: parentPaddingTop };
};

const enum MODES {
	stickyTop,
	stickyBottom,
	relative,
	small
}

type StickyMode = null | (typeof MODES)[keyof typeof MODES];

const setup = (node: HTMLElement, unsubs: UnsubList, opts: Required<StickyBoxConfig>) => {
	const { bottom, offsetBottom, offsetTop } = opts;
	const scrollPanel = getScrollParent(node);

	let isScheduled = false;
	const layoutSchedule = () => {
		if (!isScheduled) {
			requestAnimationFrame(() => {
				const nextMode = onLayout();
				if (nextMode !== mode) changeMode(nextMode);
				isScheduled = false;
			});
		}
		isScheduled = true;
	};

	let latestScrollY = scrollPanel === window ? window.scrollY : (scrollPanel as HTMLElement).scrollTop;

	const isContainerBoxLow = (scrollY: number) => {
		const { offsetTop: offsetScrollPane, height: viewPortHeight } = scrollPaneDims;
		const { naturalTop } = parentDims;
		const { height: nodeHeight } = nodeDims;

		if (scrollY + offsetScrollPane + viewPortHeight >= naturalTop + nodeHeight + relativeOffset + offsetBottom) {
			return true;
		}
		return false;
	};

	const onLayout = (): StickyMode => {
		const { height: viewPortHeight } = scrollPaneDims;
		const { height: nodeHeight } = nodeDims;
		if (nodeHeight + offsetTop + offsetBottom <= viewPortHeight) {
			return MODES.small;
		} else {
			if (isContainerBoxLow(latestScrollY)) {
				return MODES.stickyBottom;
			} else {
				return MODES.relative;
			}
		}
	};

	const scrollPaneIsOffsetEl = scrollPanel !== window && isOffsetElement(scrollPanel as HTMLElement);
	const scrollPaneDims = getDimensions({
		el: scrollPanel,
		measure: ({ height, top }) => ({
			height,
			offsetTop: scrollPaneIsOffsetEl ? top : 0
		}),
		onChange: layoutSchedule,
		unsubs
	});

	const parentNode = getParentNode(node);
	const parentPaddings = parentNode === window ? { bottom: 0, top: 0 } : VerticalPadding(parentNode as HTMLElement);
	const parentDims = getDimensions({
		el: parentNode,
		measure: ({ height }) => ({
			height: height - parentPaddings.top - parentPaddings.bottom,
			naturalTop: parentNode === window ? 0 : offsetLimit(parentNode as HTMLElement, scrollPanel as HTMLElement) + parentPaddings.top + scrollPaneDims.offsetTop
		}),
		onChange: layoutSchedule,
		unsubs
	});

	const nodeDims = getDimensions({
		el: node,
		measure: ({ height }) => ({ height }),
		onChange: layoutSchedule,
		unsubs
	});

	let relativeOffset = 0;
	let mode = onLayout();

	const onScroll = (scrollY: number) => {
		if (scrollY === latestScrollY) return;
		const scrollDelta = scrollY - latestScrollY;
		latestScrollY = scrollY;
		if (mode === MODES.small) return;

		const { offsetTop: offsetScrollPane, height: viewPortHeight } = scrollPaneDims;
		const { naturalTop, height: parentHeight } = parentDims;
		const { height: nodeHeight } = nodeDims;

		if (scrollDelta > 0) {
			// scroll down
			if (mode === MODES.stickyTop) {
				if (scrollY + offsetScrollPane + offsetTop > naturalTop) {
					const topOffset = Math.max(0, offsetScrollPane + latestScrollY - naturalTop + offsetTop);
					if (scrollY + offsetScrollPane + viewPortHeight <= naturalTop + nodeHeight + topOffset + offsetBottom) {
						changeMode(MODES.relative);
					} else {
						changeMode(MODES.stickyBottom);
					}
				}
			} else if (mode === MODES.relative) {
				if (isContainerBoxLow(scrollY)) changeMode(MODES.stickyBottom);
			}
		} else {
			// scroll up
			if (mode === MODES.stickyBottom) {
				if (offsetScrollPane + scrollY + viewPortHeight < naturalTop + parentHeight + offsetBottom) {
					const bottomOffset = Math.max(0, offsetScrollPane + latestScrollY + viewPortHeight - (naturalTop + nodeHeight + offsetBottom));
					if (offsetScrollPane + scrollY + offsetTop >= naturalTop + bottomOffset) {
						changeMode(MODES.relative);
					} else {
						changeMode(MODES.stickyTop);
					}
				}
			} else if (mode === MODES.relative) {
				if (offsetScrollPane + scrollY + offsetTop < naturalTop + relativeOffset) {
					changeMode(MODES.stickyTop);
				}
			}
		}
	};

	const changeMode = (newMode: StickyMode) => {
		const prevMode = mode;
		mode = newMode;
		if (prevMode === MODES.relative) relativeOffset = -1;
		if (newMode === MODES.small) {
			node.style.position = stickyProp as string;
			if (bottom) {
				node.style.bottom = `${offsetBottom}px`;
			} else {
				node.style.top = `${offsetTop}px`;
			}
			return;
		}

		const { height: viewPortHeight, offsetTop: offsetScrollPane } = scrollPaneDims;
		const { height: parentHeight, naturalTop } = parentDims;
		const { height: nodeHeight } = nodeDims;
		if (newMode === MODES.relative) {
			node.style.position = 'relative';
			relativeOffset =
				prevMode === MODES.stickyTop
					? Math.max(0, offsetScrollPane + latestScrollY - naturalTop + offsetTop)
					: Math.max(0, offsetScrollPane + latestScrollY + viewPortHeight - (naturalTop + nodeHeight + offsetBottom));
			if (bottom) {
				const nextBottom = Math.max(0, parentHeight - nodeHeight - relativeOffset);
				node.style.bottom = `${nextBottom}px`;
			} else {
				node.style.top = `${relativeOffset}px`;
			}
		} else {
			node.style.position = stickyProp as string;
			if (newMode === MODES.stickyBottom) {
				if (bottom) {
					node.style.bottom = `${offsetBottom}px`;
				} else {
					node.style.top = `${viewPortHeight - nodeHeight - offsetBottom}px`;
				}
			} else {
				// stickyTop
				if (bottom) {
					node.style.bottom = `${viewPortHeight - nodeHeight - offsetBottom}px`;
				} else {
					node.style.top = `${offsetTop}px`;
				}
			}
		}
	};
	changeMode(mode);

	const handleScroll = scrollPanel === window ? () => onScroll(window.scrollY) : () => onScroll((scrollPanel as HTMLElement).scrollTop);

	scrollPanel.addEventListener('scroll', handleScroll, passiveArg);
	scrollPanel.addEventListener('mousewheel', handleScroll, passiveArg);
	unsubs.push(
		() => scrollPanel.removeEventListener('scroll', handleScroll),
		() => scrollPanel.removeEventListener('mousewheel', handleScroll)
	);
};

export type StickyBoxCompProps = StickyBoxConfig & Pick<ComponentProps<'div'>, 'children' | 'className' | 'style'>;

export type StickyBoxConfig = {
	offsetTop?: number;
	offsetBottom?: number;
	bottom?: boolean;
};

export type UseStickyBoxOptions = StickyBoxConfig;

export const useStickyBox = ({ offsetTop = 0, offsetBottom = 0, bottom = false }: StickyBoxConfig = {}) => {
	const [node, setNode] = useState<HTMLElement | null>(null);
	useEffect(() => {
		if (!node || !stickyProp) return;
		const unsubs: UnsubList = [];
		setup(node, unsubs, { bottom, offsetBottom, offsetTop });
		return () => {
			unsubs.forEach((fn) => fn());
		};
	}, [node, offsetBottom, offsetTop, bottom]);

	return setNode;
};

const StickyBox = (props: StickyBoxCompProps) => {
	const { offsetTop, offsetBottom, bottom, children, className, style } = props;
	const ref = useStickyBox({ bottom, offsetBottom, offsetTop });

	return (
		<div
			className={className}
			style={style}
			ref={ref}
		>
			{children}
		</div>
	);
};
/* eslint-enable indent */
export default StickyBox;
