export function colorizeGrayscale(pixels, hex) {
    const rgb = [1,3,5].map(start=>parseInt(hex.slice(start,start+2),16)/255);
    const max=Math.max(...rgb), min=Math.min(...rgb), delta=max-min;
    const inkLightness=(max+min)/2;
    const saturation=delta===0?0:delta/(1-Math.abs(2*inkLightness-1));
    let hue=0;
    if(delta!==0){
        const sector=max===rgb[0]?(rgb[1]-rgb[2])/delta:max===rgb[1]?(rgb[2]-rgb[0])/delta+2:(rgb[0]-rgb[1])/delta+4;
        hue=(sector+6)%6;
    }
    for(let i=0;i<pixels.length;i+=4){
        const lightness=(.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2])/255;
        const chroma=(1-Math.abs(2*lightness-1))*saturation;
        const secondary=chroma*(1-Math.abs(hue%2-1)), offset=lightness-chroma/2;
        const tint=hue<1?[chroma,secondary,0]:hue<2?[secondary,chroma,0]:hue<3?[0,chroma,secondary]:
            hue<4?[0,secondary,chroma]:hue<5?[secondary,0,chroma]:[chroma,0,secondary];
        for(let channel=0;channel<3;channel++) pixels[i+channel]=(tint[channel]+offset)*255;
    }
}
