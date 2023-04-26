//@todo refactor your old ES5 code to live inside those classes:

class Pixel {
  x; y; r; g; b;
}

class RedrawRegion {
  index;
  top;
  left;
  width;
  height;
}

class Image {
  data;
  pixels;
  regions;
}

class Canvas {
  context;
  image;
  lastImage;
  cartesianX;
  cartesianY;
  redrawRegions;
  drawingTime;
}

class Fractal {
  type = "mandelbrot"; //@todo include Julia & others

  MaxIterations = 10; //Max iterations on Fractal recursive formula 
  MaxIterationsGrowStep = 1; //Max iterations grow on each zoom level
  MaxIterationsLimit = 100; //Max. limit of max. iterations

  rgbInside = [0, 0, 0];
  rgbOutside = [96, 34, 230];
}



//@todo Refactor code below to live inside classes above
//@todo Convert code to ES6 (use let, const, arrow functions)

var x, y, r, g, b; // Canvas raw pixel coordinates &, and colors
var pixelarray = [];
var cartX, cartY; //Catesian world coordinates
var cxt, imagedata, lastimagedata; //Context and imagedata
var iterations, isInside, Z_im, Z_re, c_re, c_im //fractal variables
var mousex, mousey; //mouse coordinates
var ImageHeight, ImageWidth; //Canvas size
var redrawregions = []; //Redraw regions
var redrawwidth, redrawheight, redrawtop, redrawleft; //redraw region size
var redrawfactor = 20; //How many redraw rows & columns we have
var zoomLevel = 5; //Zoom divider
var clickCount = 0; // Handles single and double click

var MaxIterations = 25; //Max iterations on Fractal recursive formula 
var MaxIterationsGrowStep = 5; //Iterations grow on each zoom level
var MaxIterationsLimit = 100; //Max. number of iterations

// inside color
var Rinside = 0;
var Ginside = 0;
var Binside = 0;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// base outside color
var Routside = getRandomInt(10, 30);
var Goutside = Routside + getRandomInt(1, 10);
var Boutside = Goutside + getRandomInt(1, 10);

var time; //elapsed drawing time

//Cartesian plane (zoom control)
var MinRe = -2.1; //current min real number
var MaxRe = 0.8; //current max real number
var MaxIm = 1.23; //current max. immaginary number
var MinIm; //min. immaginary number (calculated)
var Re_factor, Im_factor;

function draw() {
  var canvas = document.getElementById("canvas");

  ImageHeight = canvas.getAttribute("height");
  ImageWidth = canvas.getAttribute("width");
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('click', onMouseClick);
  canvas.addEventListener('contextmenu', onContextMenu);

  MinIm = MaxIm - (MaxRe - MinRe) * ImageHeight / ImageWidth;
  Re_factor = (MaxRe - MinRe) / ImageWidth;
  Im_factor = (MaxIm - MinIm) / ImageHeight;

  cxt = document.getElementById("canvas").getContext("2d");
  imagedata = [];
  lastimagedata = [];
  redrawregions = [];
  redrawwidth = ImageWidth / redrawfactor;
  redrawheight = ImageHeight / redrawfactor;

  var i = 0;
  for (imgy = 0; imgy <= redrawfactor - 1; imgy++) {
    redrawtop = imgy * ImageHeight / redrawfactor;
    for (imgx = 0; imgx <= redrawfactor - 1; imgx++) {
      redrawleft = imgx * ImageWidth / redrawfactor;
      imagedata[i] = cxt.getImageData(redrawleft, redrawtop, redrawwidth, redrawheight);
      lastimagedata[i] = [];
      i++;
    }
  }

  mandelbrot();
}

function mandelbrot() {

  time = new Date().getTime();

  var points = {};

  for (y = 0; y < ImageHeight; ++y) {

    c_im = MaxIm - y * Im_factor;

    for (x = 0; x < ImageWidth; ++x) {
      c_re = MinRe + x * Re_factor;
      Z_re = c_re, Z_im = c_im;
      isInside = true;

      for (iterations = 0; iterations < MaxIterations; ++iterations) {
        var Z_im2 = Z_im * Z_im;
        var Z_re2 = Z_re * Z_re;

        //sqrt(Z_re2 + Z_im2) > 2
        if (Z_re2 + Z_im2 > 8) {
          isInside = false;
          break;
        }

        //Z² + c
        Z_im = 2 * Z_re * Z_im + c_im;
        Z_re = Z_re2 - Z_im2 + c_re;
      }

      points['p' + x + y] = { z_re: Z_re, z_im: Z_im, c_re: c_re, c_im: c_im };


      if (isInside) {
        r = Rinside;
        g = Ginside;
        b = Binside;
      } else {
        //var divisor = Math.floor(1+iterations/100);
        r = iterations * Routside // Math.floor(1+iterations/90) %256;
        g = iterations * Goutside // Math.floor(1+iterations/30) %256;
        b = iterations * Boutside // Math.floor(1+iterations/60) %256;
      }

      setPixel(x, y, r, g, b);

    }


  }

  getRedrawRegions();
  redraw();

  var deltatime = new Date().getTime() - time;

  document.getElementById("ms").innerHTML = deltatime / 1000;
}

function setPixel(x, y, r, g, b) {
  var nx = Math.floor(x / redrawwidth);
  var ny = Math.floor(y / redrawheight);
  var regionIndex = nx + ny * redrawfactor;

  x = x - (redrawwidth * nx);
  y = y - (redrawheight * ny);

  var pixelIndex = (x + y * redrawwidth) << 2;
  lastimagedata[regionIndex][pixelIndex + 0] = imagedata[regionIndex].data[pixelIndex + 0];
  lastimagedata[regionIndex][pixelIndex + 1] = imagedata[regionIndex].data[pixelIndex + 1];
  lastimagedata[regionIndex][pixelIndex + 2] = imagedata[regionIndex].data[pixelIndex + 2];
  imagedata[regionIndex].data[pixelIndex + 0] = r;
  imagedata[regionIndex].data[pixelIndex + 1] = g;
  imagedata[regionIndex].data[pixelIndex + 2] = b;
  imagedata[regionIndex].data[pixelIndex + 3] = 0xff;

}

function getRedrawRegions() {
  var imgx, imgy, imgdata, index, ymult;
  var n = 0;
  var willredraw = false;
  var lastwillredraw = false;
  var lastredrawtop;
  var joinsum = 0;

  for (imgy = 0; imgy <= redrawfactor - 1; imgy++) {
    lastredrawtop = redrawtop;
    redrawtop = imgy * ImageHeight / redrawfactor;

    for (imgx = 0; imgx <= redrawfactor - 1; imgx++) {
      redrawleft = imgx * ImageWidth / redrawfactor;

      for (y = 0; y <= redrawheight; ++y) {
        if (willredraw) break;
        ymult = y * redrawwidth;

        for (x = 0; x <= redrawwidth; ++x) {
          var index = (x + ymult) << 2;

          if (imagedata[n].data[index] != lastimagedata[n][index] || imagedata[n].data[index + 1] != lastimagedata[n][index + 1] || imagedata[n].data[index + 2] != lastimagedata[n][index + 2]) {
            willredraw = true;
            break;
          }
        }
      }

      lastwillredraw = willredraw;

      if (willredraw && redrawtop == lastredrawtop) { //join both together
        joinsum++;
        redrawregions[n] = new Array(false, redrawleft, redrawtop);
        imagedata[n - joinsum].data = imagedata[n - joinsum].data.concat(imagedata[n].data);
      } else {
        joinsum = 0;
        redrawregions[n] = new Array(willredraw, redrawleft, redrawtop);
      }
      willredraw = false;
      n++;
    }
  }
}

function redraw() {

  var countregions = 0;
  for (var region in redrawregions) {
    if (redrawregions[region][0] == true) {
      cxt.putImageData(imagedata[region], redrawregions[region][1], redrawregions[region][2]);
      countregions++;
    }
  }

  document.getElementById("rc").innerHTML = countregions;

}

function onMouseMove(ev) {
  var rect = ev.target.getBoundingClientRect();
  mousex = ev.clientX - rect.left;
  mousey = Math.ceil(ev.clientY - rect.top);

  //Catesian plane relative coordinates
  cartX = ((mousex / ImageWidth) * (MaxRe - MinRe)) + MinRe;
  cartY = ((1 - (mousey / ImageHeight)) * (MaxIm - MinIm)) + MinIm;

  printCoordinates();
}

function onContextMenu(ev) {
  ev.preventDefault();
  zoomLevel = -Math.abs(zoomLevel);
  handleZoom(ev);
}

function onMouseClick(ev) {
  zoomLevel = Math.abs(zoomLevel);
  handleZoom(ev);
}

function handleZoom(ev) {
  var rect = ev.target.getBoundingClientRect();
  mousex = ev.clientX - rect.left;
  mousey = ev.clientY - rect.top;

  //Catesian plane relative coordinates
  cartX = ((mousex / ImageWidth) * (MaxRe - MinRe)) + MinRe;
  cartY = ((1 - (mousey / ImageHeight)) * (MaxIm - MinIm)) + MinIm;

  var deltaRight = MaxRe - cartX;
  var deltaLeft = cartX - MinRe;

  MaxRe = MaxRe - deltaRight / zoomLevel;
  MinRe = MinRe + deltaLeft / zoomLevel;

  var deltaTop = MaxIm - cartY;
  var deltaBottom = cartY - MinIm;

  var deltaY = MaxIm - MinIm;
  var deltaX = MaxRe - MinRe;

  // First we calculate the delta from the top
  MaxIm = MaxIm - deltaTop / zoomLevel;
  MinIm = MaxIm - (MaxRe - MinRe) * ImageHeight / ImageWidth;

  deltaY = MaxIm - MinIm;
  deltaX = MaxRe - MinRe;

  Re_factor = deltaX / ImageWidth;
  Im_factor = deltaY / ImageHeight;

  // A crude LOD for the fractal
  if (MaxIterations < MaxIterationsLimit) {
    MaxIterations += MaxIterationsGrowStep;
  }

  mandelbrot();
  printCoordinates();
}

function printCoordinates() {
  document.getElementById("coordX").innerHTML = mousex;
  document.getElementById("coordY").innerHTML = mousey;
  document.getElementById("cartX").innerHTML = cartX;
  document.getElementById("cartY").innerHTML = cartY;
  document.getElementById("maxX").innerHTML = MaxRe;
  document.getElementById("minX").innerHTML = MinRe;
  document.getElementById("maxY").innerHTML = MaxIm;
  document.getElementById("minY").innerHTML = MinIm;
}

draw();