import {validateFaceCondition} from './faceConditions.js';

export class FaceSearch {
    constructor(group,{now=()=>performance.now(),duration=3000}={}) {
        this.group=group;this.now=now;this.duration=duration;this.condition=null;this.until=0;
    }
    search(condition) {
        const query=validateFaceCondition(condition);
        this.group.findFaces(query);
        this.condition=query;this.until=this.now()+this.duration;
        return this.result;
    }
    get result() {
        if(!this.condition)return null;
        const hits=this.group.findFaces(this.condition);
        return {condition:this.condition,hits,diceCount:hits.length};
    }
    get active() { return this.condition!==null && this.now()<this.until; }
    get opacity() {
        if(!this.condition)return 0;
        const remaining=this.until-this.now(),elapsed=this.duration-remaining;
        return Math.max(0,Math.min(1,elapsed/200,remaining/300));
    }
    clear() { this.condition=null;this.until=0; }
}
