var VSHADER_SOURCE =`
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 u_FragColor;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjMatrix;
    void main() {
    gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    u_FragColor = a_Color;
    }`;

var FSHADER_SOURCE =`
    precision mediump float;
    varying vec4 u_FragColor;
    void main(){
    gl_FragColor = u_FragColor;
    }`;

function changeAxis() {
    var xAxis = document.getElementById("x-axis");
    var yAxis = document.getElementById("y-axis");
    var zAxis = document.getElementById("z-axis");

    if(xAxis.checked){
        kendoConsole.log("X");
        axis = [1,0,0];
        axisIndex = 0;
        setSliderValues(0);
        translate = 0;
        scale = 1;
    }
    if(yAxis.checked){
        kendoConsole.log("Y");
        axis = [0,1,0];
        axisIndex = 1;
        setSliderValues(1);
        translate = 0;
        scale = 1;
    }
    if(zAxis.checked){
        kendoConsole.log("Z");
        axis = [0,0,1];
        axisIndex = 2;
        setSliderValues(2);
        translate = 0;
        scale = 1;
    }
}

function setSliderValues(aIndex) {
    var rotSlider = $("#rotSlider").data("kendoSlider");
    var transSlider = $("#transSlider").data("kendoSlider");
    var scaleSlider = $("#scaleSlider").data("kendoSlider");
    rotSlider.value(rotValues[aIndex]);
    transSlider.value(transValues[aIndex]);
    scaleSlider.value(scaleValues[aIndex]);
}

//function resetSliders

function restart(){
    index = 0;
    g_points = [];
    g_colors = [];
    kendoConsole.log("Restart");
}

function rotSliderOnSlide(e) {
    kendoConsole.log("Slide :: new slide value is: " + e.value);
    angle = e.value;
    rotValues[axisIndex] = angle;
}

function rotSliderOnChange(e) {
    kendoConsole.log("Change :: new value is: " + e.value);
    angle = e.value;
    rotValues[axisIndex] = angle;
}

function transSliderOnSlide(e) {
    kendoConsole.log("Slide :: new slide value is: " + e.value);
    trans = e.value;
    transValues[axisIndex] = axis[axisIndex] * trans;
}

function transSliderOnChange(e) {
    kendoConsole.log("Change :: new value is: " + e.value);
    trans = e.value;
    transValues[axisIndex] = axis[axisIndex] * trans;
}

function scaleSliderOnSlide(e) {
    kendoConsole.log("Slide :: new slide value is: " + e.value);
    scale = e.value;
    scaleValues[axisIndex] = axis[axisIndex] * scale;
}

function scaleSliderOnChange(e) {
    kendoConsole.log("Change :: new value is: " + e.value);
    scale = e.value;
    scaleValues[axisIndex] = axis[axisIndex] * scale;
}

/*
function rangeSliderOnSlide(e) {
    kendoConsole.log("Slide :: new slide values are: " + e.value.toString().replace(",", " - "));
}

function rangeSliderOnChange(e) {
    kendoConsole.log("Change :: new values are: " + e.value.toString().replace(",", " - "));
    var slider = $("#slider").data("kendoSlider");
    slider.min(e.value[0]);
    slider.max(e.value[1]);

    if(slider.value() < e.value[0]){
        slider.value(e.value[0]);
    } else if(slider.value() > e.value[1]){
        slider.value(e.value[1]);
    }
    slider.resize();
angle = slider.value();
}
*/

//var min = -360;
//var max = 360;
$(document).ready(function() {
    $("#rotSlider").kendoSlider({
        change: rotSliderOnChange,
        slide: rotSliderOnSlide,
        min: -360,
        max: 360,
        smallStep: 10,
        largeStep: 60,
        value: 0
    });

    $("#transSlider").kendoSlider({
        change: transSliderOnChange,
        slide: transSliderOnSlide,
        min: -1.0,
        max: 1.0,
        smallStep: .01,
        largeStep: .1,
        value: 0
    });

    $("#scaleSlider").kendoSlider({
        change: scaleSliderOnChange,
        slide: scaleSliderOnSlide,
        min: -10.0,
        max: 10.0,
        smallStep: .1,
        largeStep: 1,
        value: 1
    });

    /*$("#rangeslider").kendoRangeSlider({
        change: rangeSliderOnChange,
        slide: rangeSliderOnSlide,
        min: min,
        max: max,
        smallStep: 10,
        largeStep: 60,
        tickPlacement: "both"
    });*/
});

var canvas;
var gl;
function main(){
    canvas = document.getElementById('webgl');
    gl = getWebGLContext(canvas);

    if(!gl){
        console.log('Failed to get the WebGL context');
        return;
    }

    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log('Failed to initialize shaders');
        return;
    }

    canvas.onmousedown = function(ev){ click(ev, gl, canvas); };
    canvas.oncontextmenu = function(ev){ rightClick(ev, gl); return false;};

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    requestAnimationFrame(update, canvas);
}

function update(){
    draw(gl);
    requestAnimationFrame(update, canvas);
}

function rightClick(ev, gl) {
    $('#buttons').append('<button onclick="selectModel(' + index + ')" id="button' + index + '" class="modelButton" type="button"><i class="fas fa-cube"></i></button>');
    index++;
}

function selectModel(n) {
    kendoConsole.log('selected: ' + n);
}

function initVertexBuffers(gl, vertices, colors){
    var n = vertices.length/3;
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position<0){
        console.log('Failed to get program for a_Position');
        return;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // transformations
    var modelMatrix = new Matrix4();
    modelMatrix.setScale(scaleValues[0], scaleValues[1], scaleValues[2]);
    modelMatrix.translate(transValues[0], transValues[1], transValues[2]);
    modelMatrix.rotate(rotValues[2], 0, 0, 1);
    modelMatrix.rotate(rotValues[1], 0, 1, 0);
    modelMatrix.rotate(rotValues[0], 1, 0, 0);
    /*
    modelMatrix.setRotate(rotValues[0], 1, 0, 0);
    modelMatrix.rotate(rotValues[1], 0, 1, 0);
    modelMatrix.rotate(rotValues[2], 0, 0, 1);
    modelMatrix.translate(transValues[0], transValues[1], transValues[2]);
    modelMatrix.scale(scaleValues[0], scaleValues[1], scaleValues[2]);
    */

    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if(!u_ModelMatrix){ console.log('Failed to get location of u_ModelMatrix'); return;  }
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if(!u_ViewMatrix){ console.log('Failed to get location of u_ViewMatrix'); return;  }
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(0.0, 0.0, 1.5, 0.0,0.0,0.0, 0.0,1.0,0.0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    if(!u_ProjMatrix){ console.log('Failed to get location of u_ProjMatrix'); return;  }
    var projMatrix = new Matrix4();
    //projMatrix.setOrtho(-1.0,1.0,-1.0,1.0,1.0,2.0);
    projMatrix.setPerspective(60.0, 1.0, 0.1, 5.0);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);


    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);

    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Color < 0){
        console.log('Failed to get location of a_Color');
        return;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    return n;
}

function draw(gl){
    gl.clear(gl.COLOR_BUFFER_BIT);
    for(var i = 0; i < g_points.length; i++){
        var n = initVertexBuffers(gl, new Float32Array(g_points[i]), new Float32Array(g_colors[i]));
        gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
    }
}

var index = 0;
axisIndex = 0;
var angle = 0.0;
var trans = 0.0;
var scale = 1.0;
var axis = [1,0,0];
var rotValues = [0, 0, 0];
var transValues = [0.0, 0.0, 0.0];
var scaleValues = [1,1,1];
var g_points = [];
var g_colors = [];
function click(ev, gl, canvas) {
    if(event.buttons == 1){
        var x = ev.clientX;
        var y = ev.clientY;
        var rect = ev.target.getBoundingClientRect() ;

        x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
        y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

        if(g_points.length <= index){
            var arrayPoints = [];
            g_points.push(arrayPoints);
            var arrayColors = [];
            g_colors.push(arrayColors);
        }

        g_points[index].push(x);
        g_points[index].push(y);
        var z = 0.0;
        if(ev.ctrlKey){
            z = -0.5;
        } else if(ev.shiftKey) {
            z = -1.0;
        }
        g_points[index].push(z);

        g_colors[index].push(Math.random());
        g_colors[index].push(Math.random());
        g_colors[index].push(Math.random());
    }
}
