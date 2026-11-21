import startPainting from './start-painting.webp';
import recordsPainting from './records-painting.png';
import galleryPainting from './gallery-painting.png';

export const titleMenuEntries = [
    { id: 'start', label: 'ゲーム開始', artwork: startPainting, unlocked: true },
    { id: 'records', label: '記録', artwork: recordsPainting, unlocked: false },
    { id: 'gallery', label: 'ギャラリー', artwork: galleryPainting, unlocked: false },
];
