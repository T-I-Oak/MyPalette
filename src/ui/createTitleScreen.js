import { APP_COPYRIGHT } from '../appMetadata.js';
import './titleScreen.css';

function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
}

const size = (style, property) => parseFloat(style[property]);
const paintingRatio = 3 / 2;

export function createTitleScreen(version, { onSettings } = {}) {
    const screen = element('section', 'TitleScreen');
    const room = element('div', 'TitleRoom');
    const header = element('header', 'TitleHeader');
    const heading = element('h1', 'TitleSign');
    const logo = element('img');
    logo.src = `${import.meta.env.BASE_URL}assets/my-palette-logo.png`;
    logo.alt = 'My Palette';
    logo.width = 498;
    logo.height = 161;
    heading.append(logo);
    header.append(heading);
    if (onSettings) {
        const settings = element('button', 'TitleSettings');
        settings.type = 'button';
        settings.setAttribute('aria-label', '設定');
        const icon = element('span', null, '⚙');
        icon.setAttribute('aria-hidden', 'true');
        settings.append(icon);
        settings.addEventListener('click', onSettings);
        header.append(settings);
    }

    const content = element('div', 'TitleContent');
    const menuSpace = element('div', 'TitleMenuSpace');
    const menu = element('nav', 'TitleMenu');
    menu.setAttribute('aria-label', 'タイトルメニュー');
    const list = element('ul');
    menu.append(list);
    menuSpace.append(menu);
    const notice = element('p', 'TitleNotice');
    notice.setAttribute('role', 'status');
    content.append(menuSpace, notice);
    room.append(header, content);

    const footer = element('footer', 'TitleMetadata');
    const copyright = element('p');
    const portal = element('a', null, APP_COPYRIGHT.portal);
    portal.href = APP_COPYRIGHT.portalUrl;
    portal.target = '_blank';
    portal.rel = 'noopener noreferrer';
    copyright.append(`© ${APP_COPYRIGHT.holder} ${APP_COPYRIGHT.year} | `, portal);
    footer.append(copyright, element('p', null, `v${version}`));
    screen.append(room, footer);

    function fitMenu() {
        const item = list.querySelector('.TitleMenuButton');
        if (!item || !menuSpace.clientWidth || !menuSpace.clientHeight) return;
        const layout = getComputedStyle(list);
        const columns = layout.gridTemplateColumns.split(' ').length;
        const rows = Math.ceil(list.children.length / columns);
        const cellWidth = (list.getBoundingClientRect().width - (columns - 1) * size(layout, 'columnGap')) / columns;
        const cellHeight = (menuSpace.getBoundingClientRect().height - (rows - 1) * size(layout, 'rowGap')) / rows;
        const frame = item.querySelector('.TitleFrame');
        const frameStyle = getComputedStyle(frame);
        const frameWidth = size(frameStyle, 'paddingLeft') + size(frameStyle, 'paddingRight')
            + size(frameStyle, 'borderLeftWidth') + size(frameStyle, 'borderRightWidth');
        const frameHeight = size(frameStyle, 'paddingTop') + size(frameStyle, 'paddingBottom')
            + size(frameStyle, 'borderTopWidth') + size(frameStyle, 'borderBottomWidth');
        const gap = size(getComputedStyle(item), 'gap');
        const plaques = [...list.querySelectorAll('.TitlePlaque')].map(plaque => plaque.getBoundingClientRect());
        const plaqueWidth = Math.max(...plaques.map(plaque => plaque.width));
        const plaqueHeight = Math.max(...plaques.map(plaque => plaque.height));
        const below = Math.min(340, cellWidth - frameWidth, (cellHeight - frameHeight - plaqueHeight - gap) * paintingRatio);
        const right = Math.min(340, cellWidth - frameWidth - plaqueWidth - gap, (cellHeight - frameHeight) * paintingRatio);
        // The same size gets the plaque below, as on a gallery wall.
        room.dataset.plaquePosition = right > below ? 'right' : 'below';
        const paintingWidth = Math.max(0, below, right);
        room.style.setProperty('--title-frame-width', `${Math.floor(paintingWidth + frameWidth)}px`);
    }

    const observer = new ResizeObserver(fitMenu);
    observer.observe(menuSpace);

    function setMenuItems(items) {
        const buttons = items.map(({ label, artwork, onSelect }) => {
            const button = element('button', 'TitleMenuButton');
            button.type = 'button';
            const frame = element('span', 'TitleFrame');
            const picture = element('img');
            picture.src = artwork;
            picture.alt = '';
            picture.width = 3;
            picture.height = 2;
            frame.append(picture);
            const plaque = element('span', 'TitlePlaque', label);
            button.append(frame, plaque);
            button.addEventListener('click', onSelect);
            return { button, plaque };
        });
        list.style.setProperty('--title-menu-count', Math.max(1, buttons.length));
        list.replaceChildren(...buttons.map(({ button }) => {
            const item = element('li');
            item.append(button);
            return item;
        }));
        fitMenu();
        return buttons;
    }

    return { screen, notice, setMenuItems };
}
