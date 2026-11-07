import * as THREE from 'three';
import { FIELD_WIDTH, FIELD_DEPTH } from './field.js';
import { faceCanvas } from './icons.js';
import { createDieGeometry } from './geometry.js';
import { displayLabel } from '../effectCatalog.js';
import { specialFrameLayout } from './specialFrameLayout.js';
import { FaceSearch } from './FaceSearch.js';
import { conditionCanvas, countCanvas } from './searchIcons.js';
import { FaceSearchNotice } from './FaceSearchNotice.js';
import { describeFaceCount, describeSearchCondition } from './searchMessages.js';

export class DiceScene {
    constructor(container, group, graphics, onChange) {
        this.container = container; this.group = group; this.graphics = graphics; this.onChange = onChange;
        this.visuals = new Map(); this.positionListeners = new Set(); this.disposed = false;
        this.faceSearch = new FaceSearch(group);
        this.scene = new THREE.Scene(); this.scene.background = new THREE.Color('#dce6df');
        this.camera = new THREE.OrthographicCamera(-7, 7, 5, -5, .1, 100);
        this.camera.position.set(0, 15, 9); this.camera.lookAt(0, 0, 0);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.searchNotice = new FaceSearchNotice(this.faceSearch);
        this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.domElement.setAttribute('aria-label', '物理ロールする3Dダイス。操作と出目は隣の一覧から確認できます');
        container.append(this.renderer.domElement);
        this.overlay = document.createElement('div'); this.overlay.className = 'DiceOverlay'; container.append(this.overlay);
        this.scene.add(new THREE.HemisphereLight('#fffaf0', '#677970', 2.7));
        const light = new THREE.DirectionalLight('#fff5de', 3.4);
        light.position.set(-4, 12, 5); light.castShadow = true;
        Object.assign(light.shadow.camera, { left: -15, right: 15, top: 12, bottom: -12 });
        light.shadow.mapSize.set(1024, 1024); light.shadow.normalBias = .04; this.scene.add(light);
        const texture=new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}assets/field/palette.png`);
        texture.colorSpace=THREE.SRGBColorSpace;
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(FIELD_WIDTH,FIELD_DEPTH),
            new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));
        floor.rotation.x=-Math.PI/2;floor.position.y=-.02;this.scene.add(floor);this.floor=floor;
        const shadow=new THREE.Mesh(new THREE.PlaneGeometry(FIELD_WIDTH,FIELD_DEPTH),new THREE.ShadowMaterial({opacity:.23}));
        shadow.rotation.x=-Math.PI/2;shadow.position.y=0;shadow.receiveShadow=true;this.scene.add(shadow);this.floorShadow=shadow;
        this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(container);
        this.resize(); this.last = performance.now(); this.signature = '';
        this.frame = this.frame.bind(this); this.frameId = requestAnimationFrame(this.frame);
    }
    resize() {
        const { width, height } = this.container.getBoundingClientRect();
        if (!width || !height) return;
        this.width = width; this.height = height;
        this.renderer.setSize(width, height);
        const aspect = width / height, vertical = Math.max(12.5, 28 / aspect);
        this.camera.left = -vertical * aspect / 2; this.camera.right = vertical * aspect / 2;
        this.camera.top = vertical / 2; this.camera.bottom = -vertical / 2; this.camera.updateProjectionMatrix();
    }
    materials(die) {
        return die.faces.map(face => {
            const texture = new THREE.CanvasTexture(faceCanvas(face, die.lifetime));
            texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            return new THREE.MeshStandardMaterial({ map: texture, roughness: .65 });
        });
    }
    freeMaterials(mesh) { mesh.material.forEach(material => { material.map.dispose(); material.dispose(); }); }
    createVisual(die) {
        const mesh = new THREE.Mesh(createDieGeometry(), this.materials(die));
        mesh.castShadow = true; mesh.receiveShadow = true; this.scene.add(mesh);
        const label = document.createElement('div'); label.className = 'DiceAnchor';
        const result = document.createElement('div'); result.className = 'DiceResult'; result.hidden = true;
        const frame = document.createElementNS('http://www.w3.org/2000/svg','svg'); frame.classList.add('DiceSpecialFrame', 'texture-highlight-frame');
        const framePath = document.createElementNS('http://www.w3.org/2000/svg','path'); frame.append(framePath);
        frame.setAttribute('aria-hidden','true');
        const image = document.createElement('img'); image.className = 'texture-artwork';
        const motion = document.createElement('div'); motion.className = 'DiceResultMotion';
        motion.append(frame,image); result.append(motion);
        const searchBadge=document.createElement('div');searchBadge.className='DiceSearchBadge texture-floating';searchBadge.hidden=true;searchBadge.setAttribute('role','img');
        label.append(result, searchBadge); this.overlay.append(label);
        const visual = { mesh, label, result, image, frame, framePath, searchBadge, searchKey:'', revision: die.revision, resultKey: '' };
        this.visuals.set(die.id, visual); return visual;
    }
    deleteVisual(id) {
        const visual = this.visuals.get(id); this.scene.remove(visual.mesh);
        this.freeMaterials(visual.mesh); visual.mesh.geometry.dispose(); visual.label.remove(); this.visuals.delete(id);
    }
    project(position) {
        const p = new THREE.Vector3(position.x, position.y, position.z).project(this.camera);
        return { x: (p.x + 1) * this.width / 2, y: (1 - p.y) * this.height / 2 };
    }
    getScreenPositions() {
        if(this.disposed)return [];
        return this.group.dice.map(die=>({id:die.id,consumed:die.consumed,
            ...this.project({...die.body.position,y:die.body.position.y-.35})}));
    }
    subscribeScreenPositions(listener) {
        if(this.disposed)throw new Error('disposed');
        if(typeof listener!=='function')throw new Error('Position listener must be a function');
        this.positionListeners.add(listener);listener(this.getScreenPositions());
        return ()=>this.positionListeners.delete(listener);
    }
    showFaceSearch(condition) {
        if(this.disposed)throw new Error('disposed');
        const result=this.faceSearch.search(condition);this.searchNotice.render(result,true);this.onChange();return result;
    }
    clearFaceSearch() { this.faceSearch.clear();this.searchNotice.render(null);this.onChange(); }
    frame(now) {
        if (this.disposed) return;
        this.group.step((now - this.last) / 1000); this.last = now;
        for (const id of this.visuals.keys()) if (!this.group.items.has(id)) this.deleteVisual(id);
        const dice = this.group.dice;
        const depthOrder = new Map([...dice].sort((a,b) => this.project(a.body.position).y-this.project(b.body.position).y)
            .map((die,index) => [die.id,index+1]));
        const search=this.faceSearch.active?this.faceSearch.result:null;
        const searchOpacity=this.faceSearch.opacity;
        this.searchNotice.render(search,false,searchOpacity);
        const searchHits=new Map(search?.hits.map(hit=>[hit.id,hit]) ?? []);
        for (const die of dice) {
            const visual = this.visuals.get(die.id) ?? this.createVisual(die);
            if (visual.revision !== die.revision) {
                this.freeMaterials(visual.mesh); visual.mesh.material = this.materials(die); visual.revision = die.revision;
            }
            visual.mesh.position.copy(die.body.position); visual.mesh.quaternion.copy(die.body.quaternion);
            visual.label.classList.toggle('state-consumed', die.consumed);
            visual.mesh.material.forEach(material => { material.color.set(die.consumed ? '#8c9690' : '#ffffff'); });
            const p = this.project({ ...die.body.position, y: die.body.position.y - .35 });
            visual.label.style.left = `${p.x}px`; visual.label.style.top = `${p.y}px`;
            const hit=searchHits.get(die.id);visual.searchBadge.hidden=!hit;
            if(hit){
                visual.searchBadge.style.opacity=String(searchOpacity);
                const key=JSON.stringify([search.condition,hit.count,describeSearchCondition(search.condition)]);
                if(key!==visual.searchKey){
                    visual.searchBadge.replaceChildren(conditionCanvas(search.condition),countCanvas(hit.count));
                    visual.searchBadge.setAttribute('aria-label',describeFaceCount(search.condition,hit.count));visual.searchKey=key;
                }
                const center=this.project(die.body.position);
                visual.searchBadge.style.left=`${Math.max(50,Math.min(this.width-50,center.x))-p.x}px`;
                visual.searchBadge.style.top=`${center.y-p.y-24}px`;
                visual.searchBadge.style.zIndex=String(dice.length+depthOrder.get(die.id));
            }
            const result = die.result;
            visual.result.hidden = !result || die.consumed;
            if (result && !die.consumed) {
                const key = JSON.stringify(result.face);
                if (key !== visual.resultKey) {
                    visual.image.src = this.graphics.get(result.face); visual.resultKey = key;
                    visual.image.alt = result.face.special ? displayLabel(result.face.special) :
                        `${displayLabel(result.face.color)}・${displayLabel(result.face.material)}`;
                }
                const top = this.project({ ...die.body.position, y: die.body.position.y + .5 });
                const unit = this.width/(this.camera.right-this.camera.left);
                const special = Boolean(result.face.special);
                visual.result.classList.toggle('state-special',special);
                let size,x,y;
                if(special){
                    const layout=specialFrameLayout(top,Math.max(80,Math.min(144,unit*2.25)),{width:this.width,height:this.height});
                    size=layout.size; x=layout.left+size/2; y=layout.top;
                    visual.frame.setAttribute('viewBox','0 0 100 100');
                    visual.framePath.setAttribute('d',layout.path);
                }else{
                    size=2*Math.max(32,Math.min(72,unit));
                    x=Math.max(size/2+4,Math.min(this.width-size/2-4,top.x));
                    y=Math.max(4,top.y-size-4);
                }
                visual.result.style.width = `${size}px`; visual.result.style.height = `${size}px`;
                visual.result.style.zIndex = String(depthOrder.get(die.id));
                visual.result.style.marginLeft = `${-size/2}px`;
                visual.result.style.left = `${x-p.x}px`; visual.result.style.top = `${y-p.y}px`;
            }
        }
        this.renderer.render(this.scene, this.camera);
        if(this.positionListeners.size){
            const positions=this.getScreenPositions();
            for(const listener of this.positionListeners)listener(positions);
        }
        const signature = JSON.stringify(this.group.dice.map(die => [die.id, die.state, die.consumed, die.revision]));
        if (signature !== this.signature) { this.signature = signature; this.onChange(); }
        this.frameId = requestAnimationFrame(this.frame);
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true; cancelAnimationFrame(this.frameId); this.observer.disconnect();
        for(const listener of this.positionListeners)listener([]);this.positionListeners.clear();
        this.faceSearch.clear();
        this.searchNotice.dispose();
        for (const id of this.visuals.keys()) this.deleteVisual(id);
        this.floor.geometry.dispose(); this.floor.material.map.dispose(); this.floor.material.dispose();
        this.floorShadow.geometry.dispose();this.floorShadow.material.dispose();
        this.scene.traverse(object => { if (object.shadow) object.shadow.dispose(); });
        this.renderer.dispose(); this.renderer.forceContextLoss();
        this.renderer.domElement.remove(); this.overlay.remove(); this.scene.clear();
        this.graphics.dispose(); this.group.dispose();
    }
}
