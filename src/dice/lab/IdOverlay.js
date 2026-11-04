// Only the standalone lab creates these diagnostic labels.
export class IdOverlay {
    constructor(container, scene) {
        this.labels=new Map();this.root=document.createElement('div');this.root.className='DiceLabIds';
        this.root.setAttribute('aria-hidden','true');container.append(this.root);
        this.unsubscribe=scene.subscribeScreenPositions(positions=>this.render(positions));
    }
    render(positions) {
        const live=new Set(positions.map(item=>item.id));
        for(const [id,label] of this.labels)if(!live.has(id)){label.remove();this.labels.delete(id);}
        for(const position of positions){
            let label=this.labels.get(position.id);
            if(!label){
                label=document.createElement('span');label.className='DiceLabId texture-label-inverse';
                label.textContent=position.id;this.root.append(label);this.labels.set(position.id,label);
            }
            label.classList.toggle('state-consumed',position.consumed);
            label.style.left=`${position.x}px`;label.style.top=`${position.y+10}px`;
        }
    }
    dispose(){this.unsubscribe();this.labels.clear();this.root.remove();}
}
