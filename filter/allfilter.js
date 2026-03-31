window.applyAllFilters = function(uiContainer, sprite) {

    const masterTicker = new PIXI.Ticker();
    let currentActiveFilter = null;

    function renderDropdown() {
        uiContainer.innerHTML = `
            <div class="slider-group" style="margin-bottom: 25px;">
                <label style="font-weight: bold; margin-bottom: 5px;">Select Effect:</label>
                <select id="effect-select" style="width: 100%; padding: 8px; background: #8a6443; color: white; border: 1px solid white; border-radius: 4px; cursor: pointer;">
                    <option value="none">-- Choose an Effect --</option>
                    <option value="crt">Retro CRT Monitor</option>
                    <option value="glitch">Cyberpunk Glitch</option>
                    <option value="bloom">Dreamy Bloom</option>
                    <option value="dot">Comic Book Dots</option>
                </select>
            </div>
            <div id="dynamic-sliders"></div> 
        `;

        document.getElementById('effect-select').addEventListener('change', (e) => {
            applySpecificEffect(e.target.value);
        });
    }

    function applySpecificEffect(type) {
        const sliderDiv = document.getElementById('dynamic-sliders');
        sliderDiv.innerHTML = ''; 

        masterTicker.remove(animateCRT); 

        if (type === 'none') {
            sprite.filters = [];
            currentActiveFilter = null;
            return;
        }

        if (type === 'crt') {
            currentActiveFilter = new PIXI.filters.CRTFilter({ curvature: 3, lineContrast: 0.25, noise: 0.1 });
            sprite.filters = [currentFilter];
            masterTicker.add(animateCRT); 

            sliderDiv.innerHTML = `
                <div class="slider-group"><label>Curvature: <span id="v-curv">3.0</span></label><input type="range" id="s-curv" min="0" max="10" step="0.5" value="3.0"></div>
                <div class="slider-group"><label>Scanlines: <span id="v-scan">0.25</span></label><input type="range" id="s-scan" min="0" max="1" step="0.05" value="0.25"></div>
                <div class="slider-group"><label>Static Noise: <span id="v-nois">0.1</span></label><input type="range" id="s-nois" min="0" max="1" step="0.05" value="0.1"></div>
            `;

            document.getElementById('s-curv').addEventListener('input', e => { currentActiveFilter.curvature = parseFloat(e.target.value); document.getElementById('v-curv').innerText = e.target.value; });
            document.getElementById('s-scan').addEventListener('input', e => { currentActiveFilter.lineContrast = parseFloat(e.target.value); document.getElementById('v-scan').innerText = e.target.value; });
            document.getElementById('s-nois').addEventListener('input', e => { currentActiveFilter.noise = parseFloat(e.target.value); document.getElementById('v-nois').innerText = e.target.value; });
        }

        else if (type === 'glitch') {
            currentActiveFilter = new PIXI.filters.GlitchFilter({ slices: 10, offset: 50, direction: 0 });
            sprite.filters = [currentActiveFilter];

            sliderDiv.innerHTML = `
                <div class="slider-group"><label>Glitch Slices: <span id="v-sli">10</span></label><input type="range" id="s-sli" min="2" max="40" step="1" value="10"></div>
                <div class="slider-group"><label>Offset Intensity: <span id="v-off">50</span></label><input type="range" id="s-off" min="0" max="200" step="5" value="50"></div>
            `;

            document.getElementById('s-sli').addEventListener('input', e => { currentActiveFilter.slices = parseInt(e.target.value); document.getElementById('v-sli').innerText = e.target.value; });
            document.getElementById('s-off').addEventListener('input', e => { currentActiveFilter.offset = parseInt(e.target.value); document.getElementById('v-off').innerText = e.target.value; });
        }

        else if (type === 'bloom') {
            currentActiveFilter = new PIXI.filters.AdvancedBloomFilter({ threshold: 0.3, bloomScale: 1.0, brightness: 1.0, blur: 4 });
            sprite.filters = [currentActiveFilter];

            sliderDiv.innerHTML = `
                <div class="slider-group"><label>Bloom Scale: <span id="v-sca">1.0</span></label><input type="range" id="s-sca" min="0" max="5" step="0.1" value="1.0"></div>
                <div class="slider-group"><label>Blur: <span id="v-blu">4</span></label><input type="range" id="s-blu" min="0" max="20" step="1" value="4"></div>
            `;

            document.getElementById('s-sca').addEventListener('input', e => { currentActiveFilter.bloomScale = parseFloat(e.target.value); document.getElementById('v-sca').innerText = e.target.value; });
            document.getElementById('s-blu').addEventListener('input', e => { currentActiveFilter.blur = parseInt(e.target.value); document.getElementById('v-blu').innerText = e.target.value; });
        }

        else if (type === 'dot') {
            currentActiveFilter = new PIXI.filters.DotFilter(1, 2);
            sprite.filters = [currentActiveFilter];

            sliderDiv.innerHTML = `
                <div class="slider-group"><label>Dot Scale: <span id="v-ds">1</span></label><input type="range" id="s-ds" min="0.5" max="5" step="0.1" value="1"></div>
                <div class="slider-group"><label>Angle: <span id="v-da">2</span></label><input type="range" id="s-da" min="0" max="5" step="0.1" value="2"></div>
            `;

            document.getElementById('s-ds').addEventListener('input', e => { currentActiveFilter.scale = parseFloat(e.target.value); document.getElementById('v-ds').innerText = e.target.value; });
            document.getElementById('s-da').addEventListener('input', e => { currentActiveFilter.angle = parseFloat(e.target.value); document.getElementById('v-da').innerText = e.target.value; });
        }
    }

    function animateCRT() {
        if (currentActiveFilter && currentActiveFilter.seed !== undefined) {
            currentActiveFilter.seed = Math.random();
        }
    }

    renderDropdown();
    masterTicker.start();

    const returnObject = [];
    returnObject.destroy = function() {
        masterTicker.stop(); 
        masterTicker.destroy();
        sprite.filters = [];
    };

    return returnObject;
};
