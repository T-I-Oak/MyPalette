// Dimensions are shared game icon units, measured by visible outline height.
export const ICON_SIZES = Object.freeze({ main: 80, sub: 56, gap: 8 });
export function compositionLayout(nodes, outlineFor) {
    const slots=[];let x=0;
    for(const node of nodes){
        const bounds=outlineFor(node);
        const [left,top,right,bottom]=bounds;
        const scale=node.role?ICON_SIZES[node.role]/(bottom-top):1;
        const width=(right-left)*scale,height=(bottom-top)*scale;
        slots.push({node,scale,x:x-left*scale,y:50-(top+bottom)/2*scale,left:x,right:x+width,width,height});
        x+=width+ICON_SIZES.gap;
    }
    return {slots,width:x-ICON_SIZES.gap};
}
