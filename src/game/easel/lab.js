import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createEasel } from './createEasel.js';
import { createPaintingCanvas } from './createPaintingCanvas.js';
import { paintingPreview } from './paintingPreview.js';
import { loadSettings } from '../../settingsStorage.js';
import { createPaintingInfo } from './paintingInfo.js';
import { createPaintingCamera, paintingInfoAnchor, orientPainting } from './paintingView.js';
import './lab.css';

export async function mountEaselLab(root) {
    const { document: settings } = await loadSettings();
    const image = await paintingPreview(settings.cards[0].id, 0);
    root.replaceChildren();
    const section = document.createElement('section'); section.className = 'EaselLab';
    const title = document.createElement('h2'); title.textContent = 'キャンバスとイーゼルの外観確認';
    const note = document.createElement('p'); note.textContent = 'ドラッグで回転・ホイールで拡大縮小。右ドラッグで視点移動。';
    const toolbar = document.createElement('div'); toolbar.className = 'EaselToolbar';
    const viewport = document.createElement('div'); viewport.className = 'EaselViewport';
    section.append(title, note, toolbar, viewport); root.append(section);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0xe3ded3); renderer.domElement.setAttribute('aria-label', '木製イーゼルの3Dプレビュー');
    viewport.append(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = createPaintingCamera(1);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.25, -.12); controls.minDistance = 1.5; controls.maxDistance = 8;
    controls.maxPolarAngle = Math.PI * .49;
    scene.add(new THREE.HemisphereLight(0xfff5e2, 0x74695c, 2.4));
    const key = new THREE.DirectionalLight(0xffefd7, 3.2); key.position.set(-3, 5, 4);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -2; key.shadow.camera.right = 2;
    key.shadow.camera.top = 3; key.shadow.camera.bottom = -2; key.shadow.normalBias = .015;
    scene.add(key);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0xd2c8b6, roughness: 1 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const easel = createEasel(); orientPainting(easel, .5, 1, settings.cards[0].id); scene.add(easel.object);
    let painting = createPaintingCanvas(image); easel.mountCanvas(painting);
    const dimensions = document.createElement('p');
    dimensions.setAttribute('role', 'status');
    dimensions.textContent = `${image.width} × ${image.height}／キャンバスも同じ縦横比`;
    toolbar.before(dimensions);
    const selectors = document.createElement('div'); selectors.className = 'EaselToolbar';
    function select(labelText, options) {
        const label = document.createElement('label'); label.textContent = labelText + ' ';
        const input = document.createElement('select');
        input.setAttribute('aria-label', labelText);
        for (const [value, text] of options) {
            const option = document.createElement('option'); option.value = value; option.textContent = text; input.append(option);
        }
        label.append(input); selectors.append(label); return input;
    }
    const artwork = select('絵画', settings.cards.map(card => [card.id, `${card.id} ${card.name}`]));
    const step = select('ステップ', [[0, '0：白紙'], [1, '1：下描き（-1.png）'], [2, '2：下絵（-2.png）'], [3, '3：完成（-3.png）']]);
    step.value = '0'; toolbar.before(selectors);
    const possibleLabel = document.createElement('label');
    const possible = document.createElement('input'); possible.type = 'checkbox';
    possibleLabel.append(possible, '達成可能（表示確認）'); selectors.append(possibleLabel);
    const previewNote = document.createElement('p');
    previewNote.textContent = '表示確認用：達成ボタンは表示ステップを進めます。ゲーム状態・ダイスは変更しません。';
    selectors.after(previewNote);
    const info = createPaintingInfo(viewport, { onAchieve() {
        step.value = String(Number(step.value) + 1); updatePainting();
    } });
    function updateInfo() {
        const currentStep = Number(viewport.dataset.step);
        info.update({ definition: settings.cards.find(card => card.id === viewport.dataset.painting),
            currentStep, achievable: possible.checked && currentStep < 3,
            disabled: !possible.checked || currentStep === 3 || step.disabled });
    }
    possible.addEventListener('change', updateInfo);
    let disposed = false;
    async function updatePainting() {
        artwork.disabled = step.disabled = true;
        possible.disabled = true;
        updateInfo();
        dimensions.textContent = '画像を読み込んでいます…';
        try {
            const source = await paintingPreview(artwork.value, Number(step.value));
            if (disposed) return;
            const replacement = createPaintingCanvas(source);
            painting.dispose(); painting = replacement; easel.mountCanvas(painting);
            orientPainting(easel, .5, 1, artwork.value);
            dimensions.textContent = `${source.width} × ${source.height}／キャンバスも同じ縦横比`;
            viewport.dataset.painting = artwork.value; viewport.dataset.step = step.value;
            render();
        } catch (error) {
            if (!disposed) dimensions.textContent = `画像を読み込めませんでした。選び直して再試行してください。${error.message}`;
        } finally {
            artwork.disabled = step.disabled = false;
            possible.disabled = false;
            if (!disposed) updateInfo();
        }
    }
    viewport.dataset.painting = artwork.value; viewport.dataset.step = step.value;
    updateInfo();
    artwork.addEventListener('change', updatePainting); step.addEventListener('change', updatePainting);
    const render = () => {
        renderer.render(scene, camera);
        const { width, height } = viewport.getBoundingClientRect();
        const anchor = paintingInfoAnchor(painting, camera, width, height);
        info.position(Math.max(108, Math.min(width - 108, anchor.x)), Math.max(180, anchor.y));
    };
    const raycaster = new THREE.Raycaster();
    let press;
    renderer.domElement.addEventListener('pointerdown', event => { press = { x: event.clientX, y: event.clientY }; });
    renderer.domElement.addEventListener('pointerup', event => {
        if (!press || Math.hypot(event.clientX - press.x, event.clientY - press.y) > 5) return;
        const rect = renderer.domElement.getBoundingClientRect();
        raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1,
            1 - (event.clientY - rect.top) / rect.height * 2), camera);
        if (raycaster.intersectObject(easel.object, true).length) info.openDetail();
        press = null;
    });
    function view(position) { camera.position.set(...position); controls.target.set(0, 1.25, -.12); controls.update(); render(); }
    for (const [label, position] of [['斜め前', [2.6, 1.9, 4]], ['正面', [0, 1.4, 4.8]], ['側面', [4.5, 1.5, 0]], ['背面', [2, 1.8, -4.2]]]) {
        const button = document.createElement('button'); button.className = 'Button texture-raised'; button.textContent = label;
        button.addEventListener('click', () => view(position)); toolbar.append(button);
    }
    const back = document.createElement('a'); back.href = location.pathname; back.textContent = '開発者用入口へ戻る'; toolbar.append(back);
    controls.addEventListener('change', render);
    const observer = new ResizeObserver(() => {
        const { width, height } = viewport.getBoundingClientRect();
        renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); render();
    });
    observer.observe(viewport); view([2.6, 1.9, 4]);
    function dispose() {
        disposed = true;
        observer.disconnect(); controls.dispose(); info.dispose(); painting.dispose(); easel.dispose(); floor.geometry.dispose(); floor.material.dispose(); renderer.dispose();
        window.removeEventListener('pagehide', dispose);
    }
    window.addEventListener('pagehide', dispose);
    return dispose;
}
