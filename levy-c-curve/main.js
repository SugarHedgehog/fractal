

var canvas = document.getElementById("levy-c-curve");
var ctx = canvas.getContext('2d');
var canvas_width = canvas.getAttribute("height");
var canvas_height = canvas.getAttribute("width");

var len = canvas_height / 2;       // Stating length value

var x = canvas_width / 3; // Stating x value
var y = canvas_height / 4; // Stating y value
var alpha_angle = 0; // Stating angle value
var iteration_count = 10; // Stating iteration value
var line_width = 2;

var default_angle = 45;

// var colors = [ 'red', 'orange', 'blue', 'dark_grey' ];
var colors = ['#0000ff', '#0000a8', '#000068', 'dark_grey'];

var toRadians = function (d) {
    return Math.PI * (d / 180.0);
};

var mrand_i = function (max) {
    return Math.floor(Math.random() * max);
};

var draw = function () {
    ctx.fillStyle = 'black';
    //ctx.fillRect(0, 0, canvas_width + len, canvas_height)
    c_curve(x, y, len, alpha_angle, iteration_count, ctx);
};

var c_curve = function (x, y, length, angle, iteration, ctx) {
    var alpha = angle;
    if (iteration > 0) {
        length = (length / Math.sqrt(2));
        c_curve(x, y, length, (alpha + default_angle), (iteration - 1), ctx); // Recursive Call
        x = (x + (length * Math.cos(toRadians(alpha + default_angle))));
        y = (y + (length * Math.sin(toRadians(alpha + default_angle))));
        c_curve(x, y, length, (alpha - default_angle), (iteration - 1), ctx); // Recursive Call
    } else {
        ctx.strokeStyle = colors[mrand_i(colors.length + 1)]; // Pick a random color for this segment
        ctx.lineWidth = line_width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (length * Math.cos(toRadians(alpha))),
            y + (length * Math.sin(toRadians(alpha))));
        ctx.stroke();
    }
};

draw();


