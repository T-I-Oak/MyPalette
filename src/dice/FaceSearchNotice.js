import {onLanguageChange,getActiveLanguage} from '../../../GameWorksOAK/src/lib/core/i18n.js';
import {searchNoticeParts} from './searchMessages.js';
import {conditionCanvas} from './searchIcons.js';

export const FACE_SEARCH_NOTICE_ID='dice-search-notice';

export class FaceSearchNotice {
    constructor(search){
        this.search=search;this.target=null;this.key='';
        this.unsubscribe=onLanguageChange(()=>this.render(this.search.active?this.search.result:null,true));
    }
    render(result,force=false,opacity=this.search.opacity){
        const target=document.getElementById(FACE_SEARCH_NOTICE_ID);
        if(!target)return;
        target.style.opacity=String(opacity);
        if(target!==this.target){this.target=target;this.key='';target.setAttribute('role','status');target.setAttribute('aria-live','polite');target.setAttribute('aria-atomic','true');}
        if(!result){target.hidden=true;if(this.key){target.replaceChildren();this.key='';}return;}
        const key=JSON.stringify([result.condition,result.diceCount,getActiveLanguage()]);
        if(!force && key===this.key)return;
        this.key=key;const message=document.createElement('span');message.className='DiceSearchMessage';target.replaceChildren(message);
        for(const part of searchNoticeParts(result)){
            if(typeof part==='string')message.append(document.createTextNode(part));
            else {const icon=conditionCanvas(part.condition);icon.setAttribute('aria-label',part.label);message.append(icon);}
        }
        target.hidden=false;
    }
    dispose(){this.unsubscribe();if(this.target){this.target.hidden=true;this.target.replaceChildren();}this.target=null;this.key='';}
}
