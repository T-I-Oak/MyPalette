import { MoveObject } from '../ui/areaTransition/MoveObject.js';
import { animateProgress } from './playAnimation.js';
import { canvasOrbit, materialTiming, materialDuration } from './achievementMotion.js';

const lerp = (a,b,p) => ({x:a.x+(b.x-a.x)*p,y:a.y+(b.y-a.y)*p});
const ease = p => p*p*(3-2*p);
export async function flyAchievementMaterials(screen, palette, play, effect, signal) {
    await Promise.all(effect.diceIds.map(async(id,index) => {
        if (!await animateProgress(index*materialTiming.stagger,()=>{},signal)) return;
        const capture = palette.captureMaterial(id), object = new MoveObject(`achievement:${id}`,capture.element);
        capture.start();
        try {
            const complete = await animateProgress(materialDuration(1), progress => {
                const time = progress*materialDuration(1), source = capture.read(), bottom = canvasOrbit(play.canvasCorners(effect.id),0);
                let center, size=source.size, opacity=1, stage;
                if (time < materialTiming.outbound) {
                    stage='outbound'; center=lerp(source,bottom,ease(time/materialTiming.outbound));
                } else if (time < materialTiming.outbound+materialTiming.orbit) {
                    stage='orbit'; center=canvasOrbit(play.canvasCorners(effect.id),(time-materialTiming.outbound)/materialTiming.orbit);
                } else if (time < materialTiming.outbound+materialTiming.orbit+materialTiming.inbound) {
                    stage='inbound'; center=lerp(bottom,source,ease((time-materialTiming.outbound-materialTiming.orbit)/materialTiming.inbound));
                } else {
                    stage='absorb'; const t=ease((time-materialTiming.outbound-materialTiming.orbit-materialTiming.inbound)/materialTiming.absorb);
                    center=lerp(source,source.body,t); size*=1-.88*t; opacity=1-t;
                }
                capture.element.dataset.materialStage=stage;capture.element.dataset.dieId=id;
                capture.element.style.opacity=String(opacity);
                screen.surface.renderMoving(object,{x:center.x-size/2,y:center.y-size/2,width:size,height:size},1);
            }, signal);
            if (complete && !signal.aborted) capture.consume();
        } finally { screen.surface.removeMoving(object); }
    }));
}
