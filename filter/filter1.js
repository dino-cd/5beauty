window.applyFilter1 = function() {
    const customFragmentShader = `
        precision mediump float;
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform vec2 uDimensions;
        uniform float uPixelSize;
        uniform float uColors;
        uniform float uSpread;

        float rand(vec2 co) { return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); }

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
        uDimensions: [960, 540], uPixelSize: 7.0, uColors: 18.0, uSpread: 0.05        
    });

    document.querySelectorAll('.filter-ui-container').forEach(el => el.remove());

    const ui = document.createElement('div');
    ui.className = 'filter-ui-container'; 
    ui.style.position = 'fixed';
    ui.style.bottom = '20px';
    ui.style.left = '50%';
    ui.style.transform = 'translateX(-50%)';
    ui.style.backgroundColor = '#b38762'; 
    ui.style.color = 'white';
    ui.style.padding = '10px 20px';
    ui.style.borderRadius = '5px';
    ui.style.display = 'flex';
    ui.style.gap = '25px';
    ui.style.fontFamily = 'sans-serif';
    ui.style.zIndex = '1000';

    ui.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;"><label style="font-size: 14px;">Pixel Size: <span id="val-px">7</span></label><input type="range" id="slider-px" min="1" max="25" step="1" value="7" style="cursor: pointer;"></div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;"><label style="font-size: 14px;">Colors: <span id="val-col">18</span></label><input type="range" id="slider-col" min="2" max="64" step="1" value="18" style="cursor: pointer;"></div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;"><label style="font-size: 14px;">Dither: <span id="val-dith">0.05</span></label><input type="range" id="slider-dith" min="0" max="0.5" step="0.01" value="0.05" style="cursor: pointer;"></div>
    `;

    document.body.appendChild(ui);

    document.getElementById('slider-px').addEventListener('input', (e) => { retroFilter.uniforms.uPixelSize = parseFloat(e.target.value); document.getElementById('val-px').innerText = e.target.value; });
    document.getElementById('slider-col').addEventListener('input', (e) => { retroFilter.uniforms.uColors = parseFloat(e.target.value); document.getElementById('val-col').innerText = e.target.value; });
    document.getElementById('slider-dith').addEventListener('input', (e) => { retroFilter.uniforms.uSpread = parseFloat(e.target.value); document.getElementById('val-dith').innerText = e.target.value; });

    return [retroFilter];
};
