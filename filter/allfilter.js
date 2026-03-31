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
            { id: "gain", label: "Gain", min: 0, max: 1, step: 0.01, val: 0.5 },
            { id: "lacunarity", label: "Lacunarity", min: 0, max: 5, step: 0.1, val: 2.5 }
        ]},
        oldfilm: { name: "Old Film", cls: "OldFilmFilter", anim: f => f.seed = Math.random(), sliders: [
            { id: "sepia", label: "Sepia", min: 0, max: 1, step: 0.01, val: 0.3 },
            { id: "noise", label: "Noise", min: 0, max: 1, step: 0.01, val: 0.3 },
            { id: "scratch", label: "Scratches", min: 0, max: 1, step: 0.01, val: 0.5 }
        ]},
        shockwave: { name: "Shockwave", cls: "ShockwaveFilter", anim: f => f.time = (f.time + 0.02) % 2, sliders: [
            { id: "amplitude", label: "Amplitude", min: 0, max: 100, step: 1, val: 30 },
            { id: "wavelength", label: "Wavelength", min: 0, max: 300, step: 1, val: 160 }
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
        tiltshift: { name: "Tilt Shift", cls: "TiltShiftFilter", sliders: [
            { id: "blur", label: "Blur", min: 0, max: 50, step: 1, val: 10 },
            { id: "gradientBlur", label: "Gradient", min: 0, max: 2000, step: 10, val: 600 }
        ]},
        twist: { name: "Twist", cls: "TwistFilter", sliders: [
            { id: "angle", label: "Angle", min: -10, max: 10, step: 0.1, val: 4 },
            { id: "radius", label: "Radius", min: 0, max: 1000, step: 10, val: 200 }
        ]},
        zoomblur: { name: "Zoom Blur", cls: "ZoomBlurFilter", sliders: [
            { id: "strength", label: "Strength", min: 0, max: 1, step: 0.01, val: 0.1 },
            { id: "innerRadius", label: "Inner Rad", min: 0, max: 500, step: 1, val: 0 }
        ]},
        outline: { name: "Outline", cls: "OutlineFilter", sliders: [
            { id: "thickness", label: "Thickness", min: 0, max: 20, step: 1, val: 2 }
        ]},
        emboss: { name: "Emboss", cls: "EmbossFilter", sliders: [
            { id: "strength", label: "Strength", min: 0, max: 20, step: 0.5, val: 5 }
        ]},
        blur: { name: "Standard Blur", cls: "BlurFilter", sliders: [
            { id: "blur", label: "Blur", min: 0, max: 20, step: 0.5, val: 4 }
        ]},
        noise: { name: "Static Noise", cls: "NoiseFilter", sliders: [
            { id: "noise", label: "Noise", min: 0, max: 1, step: 0.01, val: 0.5 }
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

        document.getElementById('effect-select').addEventListener('change', (e) => {
            applySpecificEffect(e.target.value);
        });
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

        const FilterClass = (PIXI.filters && PIXI.filters[config.cls]) || PIXI[config.cls];

        if (!FilterClass) {
            sliderDiv.innerHTML = `<p style="color:#ffcccc; font-size:12px;">Error: ${config.cls} failed to load from the library.</p>`;
            return;
        }

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
