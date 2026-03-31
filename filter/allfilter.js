window.applyAllFilters = function(uiContainer, sprite) {
    const masterTicker = new PIXI.Ticker();
    let currentActiveFilter = null;

    const filterRegistry = {
        crt: { name: "CRT", cls: "CRTFilter", anim: f => f.seed = Math.random(), sliders: [
            { id: "curvature", label: "Curvature", min: 0, max: 10, step: 0.1, val: 3 },
            { id: "lineContrast", label: "Scanlines", min: 0, max: 1, step: 0.05, val: 0.25 },
            { id: "noise", label: "Noise", min: 0, max: 1, step: 0.05, val: 0.1 }
        ]},
        bloom: { name: "Bloom", cls: "AdvancedBloomFilter", sliders: [
            { id: "bloomScale", label: "Scale", min: 0, max: 5, step: 0.1, val: 1 },
            { id: "blur", label: "Blur", min: 0, max: 20, step: 1, val: 4 }
        ]},
        glitch: { name: "Glitch", cls: "GlitchFilter", sliders: [
            { id: "slices", label: "Slices", min: 2, max: 40, step: 1, val: 10 },
            { id: "offset", label: "Offset", min: 0, max: 200, step: 1, val: 50 }
        ]},
        godray: { name: "Godray", cls: "GodrayFilter", anim: f => f.time += 0.01, sliders: [
            { id: "angle", label: "Angle", min: -30, max: 30, step: 1, val: 30 },
            { id: "gain", label: "Gain", min: 0, max: 1, step: 0.01, val: 0.5 }
        ]},
        pixelate: { name: "Pixelate", cls: "PixelateFilter", sliders: [
            { id: "size", label: "Block Size", min: 1, max: 50, step: 1, val: 10 }
        ]},
        dot: { name: "Dot", cls: "DotFilter", sliders: [
            { id: "scale", label: "Scale", min: 0.1, max: 5, step: 0.1, val: 1 },
            { id: "angle", label: "Angle", min: 0, max: 5, step: 0.1, val: 5 }
        ]},
        ascii: { name: "ASCII", cls: "AsciiFilter", sliders: [
            { id: "size", label: "Text Size", min: 2, max: 20, step: 1, val: 8 }
        ]},
        bulge: { name: "Bulge/Pinch", cls: "BulgePinchFilter", sliders: [
            { id: "radius", label: "Radius", min: 0, max: 500, step: 1, val: 100 },
            { id: "strength", label: "Strength", min: -1, max: 1, step: 0.1, val: 1 }
        ]},
        twist: { name: "Twist", cls: "TwistFilter", sliders: [
            { id: "angle", label: "Angle", min: -10, max: 10, step: 0.1, val: 4 },
            { id: "radius", label: "Radius", min: 0, max: 1000, step: 10, val: 200 }
        ]},
        outline: { name: "Outline", cls: "OutlineFilter", sliders: [
            { id: "thickness", label: "Thickness", min: 0, max: 20, step: 1, val: 2 }
        ]},
        blur: { name: "Standard Blur", cls: "BlurFilter", sliders: [
            { id: "blur", label: "Blur", min: 0, max: 20, step: 0.5, val: 4 }
        ]}
    };

    function renderDropdown() {
        let optionsHtml = `<option value="none">-- Choose an Effect --</option>`;
        for (const [key, config] of Object.entries(filterRegistry)) {
            optionsHtml += `<option value="${key}">${config.name}</option>`;
        }

        uiContainer.innerHTML = `
            <div class="slider-group" style="margin-bottom: 25px;">
                <label style="font-weight: bold; margin-bottom: 5px;">Select Effect:</label>
                <select id="effect-select" style="width: 100%; padding: 8px; background: #8a6443; color: white; border: 1px solid white; border-radius: 4px; cursor: pointer;">
                    ${optionsHtml}
                </select>
            </div>
            <div id="dynamic-sliders"></div> 
        `;

        document.getElementById('effect-select').addEventListener('change', (e) => applySpecificEffect(e.target.value));
    }

    let activeAnimation = null;

    function applySpecificEffect(key) {
        const sliderDiv = document.getElementById('dynamic-sliders');
        sliderDiv.innerHTML = ''; 

        if (activeAnimation) masterTicker.remove(activeAnimation);

        if (key === 'none') {
            sprite.filters = [];
            currentActiveFilter = null;
            return;
        }

        const config = filterRegistry[key];

        let FilterClass = null;
        if (typeof PIXI.filters !== 'undefined' && PIXI.filters[config.cls]) {
            FilterClass = PIXI.filters[config.cls];
        } else if (typeof PIXI !== 'undefined' && PIXI[config.cls]) {
            FilterClass = PIXI[config.cls];
        }

        if (!FilterClass) {
            sliderDiv.innerHTML = `<p style="color:#ffcccc; font-size:12px; margin-top: 10px;">⚠️ Please wait a moment for the filter library to finish downloading, then try selecting it again.</p>`;
            return;
        }

        try {
            currentActiveFilter = new FilterClass();
            sprite.filters = [currentActiveFilter];

            if (config.anim) {
                activeAnimation = () => config.anim(currentActiveFilter);
                masterTicker.add(activeAnimation);
            }

            let htmlBlocks = '';
            config.sliders.forEach(slider => {
                currentActiveFilter[slider.id] = slider.val; 
                htmlBlocks += `
                    <div class="slider-group">
                        <label>${slider.label}: <span id="v-${slider.id}">${slider.val}</span></label>
                        <input type="range" id="s-${slider.id}" min="${slider.min}" max="${slider.max}" step="${slider.step}" value="${slider.val}">
                    </div>
                `;
            });

            sliderDiv.innerHTML = htmlBlocks;

            config.sliders.forEach(slider => {
                document.getElementById(`s-${slider.id}`).addEventListener('input', (e) => {
                    const val = parseFloat(e.target.value);
                    currentActiveFilter[slider.id] = val; 
                    document.getElementById(`v-${slider.id}`).innerText = val; 
                });
            });
        } catch (error) {
            console.error(error);
            sliderDiv.innerHTML = `<p style="color:#ffcccc; font-size:12px;">Error initializing filter.</p>`;
        }
    }

    renderDropdown();
    masterTicker.start();

    const returnObject = [];
    returnObject.destroy = function() {
        if (activeAnimation) masterTicker.remove(activeAnimation);
        masterTicker.stop(); 
        masterTicker.destroy();
        sprite.filters = [];
    };

    return returnObject;
};
