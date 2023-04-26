// From https://rembound.com/articles/drawing-mandelbrot-fractals-with-html5-canvas-and-javascript
// The function gets called when the window is fully loaded
window.onload = function () {
    // Get the canvas and context
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");

    const WIDTH = window.innerWidth
    const HEIGHT = window.innerHeight
    canvas.width = WIDTH
    canvas.height = HEIGHT

    // Width and height of the image
    var imagew = canvas.width;
    var imageh = canvas.height;

    // Image Data (RGBA)
    var imagedata = context.createImageData(imagew, imageh);

    // Pan and zoom parameters
    var offsetx = -imagew / 2;
    var offsety = -imageh / 2;
    var panx = -50;
    var pany = 0;
    var zoom = 250;

    // The maximum number of iterations per pixel
    var maxiterations = 1000;

    // Initialize the game
    function init() {
        // Add mouse events
        canvas.addEventListener("mousedown", onMouseDown);

        // Generate image
        generateImage();

        // Enter main loop
        main(0);
    }

    // Main loop
    function main(tframe) {
        // Request animation frames
        window.requestAnimationFrame(main);

        // Draw the generate image
        context.putImageData(imagedata, 0, 0);
    }

    // Generate the fractal image
    // Values from - http://paulbourke.net/fractals/juliaset/ and
    // https://rosettacode.org/wiki/Julia_set
    function generateImage() {
        // Iterate over the pixels
        // jsX = 0.285, jsY = 0.01;
        // jsX = -0.4, jsY = 0.6;
        // jsX = -0.42, jsY = 0.6;
        // jsX = 0, jsY = 0.8;
        // jsX = 0.37, jsY = 0.1;
        // jsX = 0.355, jsY = 0.355;
        // jsX = -0.54, jsY = 0.54;
        // jsX = -0.4, jsY = -0.59;
        // jsX = 0.34, jsY = -0.05;
        // douady's rabbit fractal below
        // jsX = -0.123, jsY = 0.745;
        // jsX = -0.391, jsY = -0.587;
        // Cauliflower like
        // jsX = -0.7, jsY = -0.3;
        // jsX = -0.75, jsY = -0.2;
        // jsX = -0.75, jsY = 0.15;
        // jsX = -0.7, jsY = 0.35;
        // jsX = -0.35, jsY = 0.65;
        // jsX = -0.65, jsY = 0.35;
        // jsX = -0.15, jsY = 0.85;
        // jsX = -0.8, jsY = -0.156;
        // jsX = -0.7, jsY = 0.27015;
        // jsX = -0.8, jsY = 0.156;
        // jsX = -0.388, jsY = 0.613;
        // jsX = -0.9, jsY = 0.27015;
        // jsX = -0.512511498387847167 , jsY = 0.521295573094847167;
        jsX = -0.4, jsY = 0.6;

        for (var y = 0; y < imageh; y++) {
            for (var x = 0; x < imagew; x++) {
                iterate(x, y, maxiterations, jsX, jsY);
            }
        }
    }

    // Calculate the color of a specific pixel
    // From - https://rosettacode.org/wiki/Julia_set
    function iterate(x, y, maxiterations, jsX, jsY) {
        // Convert the screen coordinate to a fractal coordinate
        var a = (x + offsetx + panx) / zoom;
        var b = (y + offsety + pany) / zoom;

        var iterations = 0;

        while (++iterations <= maxiterations) {
            za = a * a;
            zb = b * b;

            if (za + zb > 4) break;

            as = za - zb;
            bs = 2 * a * b

            a = as + jsX;
            b = bs + jsY;
        }

        // Get palette color based on the number of iterations
        var color = {};
        if (iterations == maxiterations) {
            color = { r: 0, g: 0, b: 0 }; // Black
        } else {
            color = getColor(iterations)
        }

        // Apply the color
        var pixelindex = (y * imagew + x) * 4;
        imagedata.data[pixelindex] = color.r;
        imagedata.data[pixelindex + 1] = color.g;
        imagedata.data[pixelindex + 2] = color.b;

        imagedata.data[pixelindex + 3] = 255;
    }

    // From https://rosettacode.org/wiki/Julia_set
    function getColor(c) {
        var r, g, b, p = c / 250,
            l = ~~(p * 6), o = p * 6 - l,
            q = 1 - o;

        switch (l % 6) {
            case 0: r = 1; g = o; b = 0; break;
            case 1: r = q; g = 1; b = 0; break;
            case 2: r = 0; g = 1; b = o; break;
            case 3: r = 0; g = q; b = 1; break;
            case 4: r = o; g = 0; b = 1; break;
            case 5: r = 1; g = 0; b = q; break;
        }

        color = { r: ~~(r * 255), g: ~~(g * 255), b: ~~(b * 255) };
        return (color);
    }

    // Zoom the fractal
    function zoomFractal(x, y, factor, zoomin) {
        if (zoomin) {
            // Zoom in
            zoom *= factor;
            panx = factor * (x + offsetx + panx);
            pany = factor * (y + offsety + pany);
        } else {
            // Zoom out
            zoom /= factor;
            panx = (x + offsetx + panx) / factor;
            pany = (y + offsety + pany) / factor;
        }
    }

    // Mouse event handlers
    function onMouseDown(e) {
        var pos = getMousePos(canvas, e);

        // Zoom out with Control
        var zoomin = true;
        if (e.ctrlKey) {
            zoomin = false;
        }

        // Pan with Shift
        var zoomfactor = 2;
        if (e.shiftKey) {
            zoomfactor = 1;
        }

        // Zoom the fractal at the mouse position
        zoomFractal(pos.x, pos.y, zoomfactor, zoomin);

        // Generate a new image
        generateImage();
    }

    // Get the mouse position
    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
            y: Math.round((e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
        };
    }

    // Call init to start the game
    init();
};