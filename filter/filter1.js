// qq
window.applyFilter1 = function() {
    const customFragmentShader = `
        precision mediump float;

        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        
        uniform vec2 uDimensions;
        uniform float uPixelSize;
        uniform float uColors;
        uniform float uSpread;

        float rand(vec2 co) {
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main(void) {
            vec2 grid = uDimensions / uPixelSize;
            vec2 pixelatedCoord = floor(vTextureCoord * grid) / grid;
            
            vec4 color = texture2D(uSampler, pixelatedCoord);
            float noise = (rand(pixelatedCoord) - 0.5) * uSpread;
            vec3 dithered = floor((color.rgb + noise) * uColors + 0.5) / uColors;
            
            gl_FragColor = vec4(dithered, color.a);
        }
    `;
    const retroFilter = new PIXI.Filter(null, customFragmentShader, {
        uDimensions: [960, 540], 
        uPixelSize: 7.0,
        uColors: 18.0,
        uSpread: 0.05
    });
    return [retroFilter];
};
