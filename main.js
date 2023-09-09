// main.js 2021 Jonathan Castillo Aguilar
// 3D modeling software

/*
* This is the main file of a 3D modeling software.
* Contains the html handlers, shaders, and webgl.
* It calculates the transformations for every matrix in g_points.
* The results are drawn in the canvas.
*/

/**
 * Vertex shader source code
 * @param a_Position position of the vertex.
 * @param a_Color color of the vertex.
 * @param u_ModelMatrix model matrix.
 * @param u_ViewMatrix view matrix.
 * @param u_ProjMatrix projection matrix.
 */
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


/**
 * Fragment shader
 */
var FSHADER_SOURCE =`
    precision mediump float;
    varying vec4 u_FragColor;
    void main(){
    gl_FragColor = u_FragColor;
    }`;

var canvas;
var gl;
var index = 0;
var axisIndex = 0;
var selectedIndex = 0;
var zVal = 0.0;
var aView = [0, 0, 1.5];
var axis = [1,0,0];
var g_points = [];
var g_colors = [];
var g_rot = [];
var g_trans = [];
var g_scale = [];
var g_modelMatrix = [];
var isDrawing = false;
var isZ = false;
var isColorChange = false;
var rClickCount = 0;
var lastSelected = 0;
var isXY = true;
var isXZ = true;
var c = [230 / 255, 100 / 255, 101 / 255];

// Axis buttons
/**
 * changeAxis - Change wich axis is selected.
 *
 */
function changeAxis() {
    var xAxis = document.getElementById("x-axis");
    var yAxis = document.getElementById("y-axis");
    var zAxis = document.getElementById("z-axis");

    if(xAxis.checked){
        kendoConsole.log("X");
        axis = [1,0,0];
        axisIndex = 0;
    }
    if(yAxis.checked){
        kendoConsole.log("Y");
        axis = [0,1,0];
        axisIndex = 1;
    }
    if(zAxis.checked){
        kendoConsole.log("Z");
        axis = [0,0,1];
        axisIndex = 2;
    }
    setSliderValues();
}

// Sliders

/**
 * setSliderValues - Set the slider to the angle, scale value and translate
 * value of the selected shape.
 */
function setSliderValues() {
    var rotSlider = $("#rotSlider").data("kendoSlider");
    var transSlider = $("#transSlider").data("kendoSlider");
    var scaleSlider = $("#scaleSlider").data("kendoSlider");
    rotSlider.value(g_rot[selectedIndex][axisIndex]);
    transSlider.value(g_trans[selectedIndex][axisIndex]);
    scaleSlider.value(g_scale[selectedIndex][axisIndex]);
}


/**
 * rotSliderOnSlide - Get angle of rotation for the selected shape and axis.
 *
 * @param  {event} e Slider event
 */
function rotSliderOnSlide(e) {
    //kendoConsole.log("Slide :: new slide value is: " + e.value);
    angle = e.value;
    g_rot[selectedIndex][axisIndex] = angle;
}


/**
 * rotSliderOnChange - Get angle of rotation for the selected shape and axis.
 *
 * @param  {event} e On change event.
 */
function rotSliderOnChange(e) {
    //kendoConsole.log("Change :: new value is: " + e.value);
    angle = e.value;
    g_rot[selectedIndex][axisIndex] = angle;
}


/**
 * transSliderOnSlide - Get transition value for the selected shape and axis.
 *
 * @param  {event} e Slider event.
 */
function transSliderOnSlide(e) {
    //kendoConsole.log("Slide :: new slide value is: " + e.value);
    trans = e.value;
    g_trans[selectedIndex][axisIndex] = axis[axisIndex] * trans;
}


/**
 * transSliderOnChange - Get transition value for the selected shape and axis.
 *
 * @param  {event} e On change event.
 */
function transSliderOnChange(e) {
    //kendoConsole.log("Change :: new value is: " + e.value);
    trans = e.value;
    g_trans[selectedIndex][axisIndex] = axis[axisIndex] * trans;
}


/**
 * scaleSliderOnSlide - Get scale value for the selected shape and axis.
 *
 * @param  {event} e  Slider event.
 */
function scaleSliderOnSlide(e) {
    //kendoConsole.log("Slide :: new slide value is: " + e.value);
    scale = e.value;
    g_scale[selectedIndex][axisIndex] = axis[axisIndex] * scale;
}


/**
 * scaleSliderOnChange - Get scale value for the selected shape and axis.
 *
 * @param  {event} e On change event.
 */
function scaleSliderOnChange(e) {
    //kendoConsole.log("Change :: new value is: " + e.value);
    scale = e.value;
    g_scale[selectedIndex][axisIndex] = axis[axisIndex] * scale;
}


/**
 * zSliderOnSlide - Get z value for the vertex.
 *
 * @param  {event} e Slide value.
 */
function zSliderOnSlide(e) {
    //kendoConsole.log("Slide :: new slide value is: " + e.value);
    zVal = e.value;
}


/**
 * zSliderOnChange - Get z value for the vertex.
 *
 * @param  {event} e On change event.
 */
function zSliderOnChange(e) {
    //kendoConsole.log("Change :: new value is: " + e.value);
    zVal = e.value;
}


/**
 * Set the kendo sliders and call the correspondent function.
 */
$(document).ready(function() {
    // Rotation slider.
    $("#rotSlider").kendoSlider({
        change: rotSliderOnChange,
        slide: rotSliderOnSlide,
        min: -360,
        max: 360,
        smallStep: 10,
        largeStep: 60,
        value: 0
    });

    // Translation slider.
    $("#transSlider").kendoSlider({
        change: transSliderOnChange,
        slide: transSliderOnSlide,
        min: -1.0,
        max: 1.0,
        smallStep: .02,
        largeStep: .1,
        value: 0
    });

    // Scale slider.
    $("#scaleSlider").kendoSlider({
        change: scaleSliderOnChange,
        slide: scaleSliderOnSlide,
        min: -10.0,
        max: 10.0,
        smallStep: .2,
        largeStep: 1,
        value: 1
    });

    // Z value slider.
    $("#zSlider").kendoSlider({
        change: zSliderOnChange,
        slide: zSliderOnSlide,
        min: -1,
        max: 1,
        smallStep: .02,
        largeStep: .1,
        value: 0
    });
});


/**
 * createButton - Creates an html button
 * onclick - selectModel()
 * id - button#
 * class - btn-primary
 *
 * @param  {int} n Number of button.
 */
function createButton(n) {
    $('#buttons').append('<button onclick="selectModel(' + n + ')" id="button' + n + '" class="btn-primary" type="button"><i class="fas fa-cube"></i></button>');
}


/**
 * update - Animatin update function.
 */
function update(){
    draw(gl);
    requestAnimationFrame(update, canvas);
}


/**
 * rightClick - Called on right click.
 *
 * @param  {event} ev                   event.
 * @param  {WebGLRenderingContext} gl   WebGL rendering context.
 */
function rightClick(ev, gl) {
    createButton(index);
    selectModel(index);
    selectedIndex = index;
    index++;
}


/**
 * selectModel - Select the model depending on the button pressed.
 *
 * @param  {int} n index of the model.
 */
function selectModel(n) {
    kendoConsole.log('selected: ' + n);
    $("#button" + lastSelected).removeClass("modelButtonActive");
    selectedIndex = n;
    setSliderValues();
    $("#button" + n).addClass("modelButtonActive");
    lastSelected = n;
}


/**
 * deleteSelection - Delete selected model.
 */
function deleteSelection() {
    g_points.splice(selectedIndex, 1);
    g_colors.splice(selectedIndex, 1);
    g_rot.splice(selectedIndex, 1);
    g_trans.splice(selectedIndex, 1);
    g_scale.splice(selectedIndex, 1);
    g_modelMatrix.splice(selectedIndex, 1);

    index--;
    selectedIndex = index;

    let id = "button" + index;
    var btnDel = document.getElementById(id);
    btnDel.parentNode.removeChild(btnDel);
}


/**
 * duplicateSelected - Duplicate selected model.
 */
function duplicateSelected() {
    var g_points_buff = Object.assign([], g_points[selectedIndex]);
    var g_colors_buff = Object.assign([], g_colors[selectedIndex]);
    var g_rot_buff = Object.assign([], g_rot[selectedIndex]);
    var g_trans_buff = Object.assign([], g_trans[selectedIndex]);
    var g_scale_buff = Object.assign([], g_scale[selectedIndex]);
    var g_modelMatrix_buff = new Matrix4();

    g_points.push(g_points_buff);
    g_colors.push(g_colors_buff);
    g_rot.push(g_rot_buff);
    g_trans.push(g_trans_buff);
    g_scale.push(g_scale_buff);
    g_modelMatrix.push(g_modelMatrix_buff);

    createButton(index);
    lastSelected = selectedIndex;
    selectModel(index);
    selectedIndex = index;
    index++;
}


/**
 * restart - Reset the program to original.
 */
function restart(){
    $("#buttons").html("");
    index = 0;
    g_points = [];
    g_colors = [];
    g_rot = [];
    g_trans = [];
    g_scale = [];
    g_modelMatrix = [];
    kendoConsole.log("Restart");
}


/**
 * hexToRgb - Converts hexadecimal to RGB.
 *
 * @param  {string} hex hexadecimal string.
 * @return {float}     RGB values from 0 - 1.
 */
function hexToRgb(hex) {
    var aRgbHex = hex.match(/.{1,2}/g);
    var aRgb = [
    parseInt(aRgbHex[0], 16),
    parseInt(aRgbHex[1], 16),
    parseInt(aRgbHex[2], 16)
    ];

    aRgb[0] = aRgb[0] / 255;
    aRgb[1] = aRgb[1] / 255;
    aRgb[2] = aRgb[2] / 255;

    return aRgb;
}

/**
 * rotateCamera - Change the position of the view.
 *
 * @param  {event} ev evetn.
 * @param  {WebGLRenderingContext} gl WebGL rendering context.
 */
function rotateCamera(ev, gl) {
    if (isDrawing) {
        var x = ev.clientX;
        var y = ev.clientY;
        var z = 1.5;

        var rect = ev.target.getBoundingClientRect();

        x = -((x - rect.left) - canvas.width/2)/(canvas.width/2) * 3;
        y = -(canvas.height/2 - (y - rect.top))/(canvas.height/2) * 1.5;

        if (x >= 1) {
            z = 3 - x;
            if (x >= 1.5) {
                x = 1.5;
            }
        }
        if (x <= -1) {
            z = 3 + x;
            if (x <= -1.5) {
                x = -1.5
            }
        }

        aView[0] = x;
        aView[1] = y;
        aView[2] = z;
    }
}


/**
 * initVertexBuffers - initialize the vertex buffer for every model.
 *
 * @param  {WebGL rendering context} gl WebGL rendering context.
 * @param  {float} vertices Vertices matrix.
 * @param  {float} colors Color matrix.
 * @param  {Float32Array} modelMatrix Model martix - apply transformatins.
 * @param  {bool} isStatic Is static or dynamic.
 * @param  {bool} isMatrixSelected Is selected.
 */
function initVertexBuffers(gl, vertices, colors, modelMatrix, isStatic, isMatrixSelected){
    var n = vertices.length/3;
    var vertexBuffer = gl.createBuffer();
    if (isStatic) {
        usage = gl.STATIC_DRAW;
    } else {
        usage = gl.DYNAMIC_DRAW;
        // transformations
        if (isMatrixSelected) {
            modelMatrix = transformMatrix(modelMatrix, g_rot[selectedIndex], g_trans[selectedIndex], g_scale[selectedIndex]);
        }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, usage);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position<0){
        console.log('Failed to get program for a_Position');
        return;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if(!u_ModelMatrix){ console.log('Failed to get location of u_ModelMatrix'); return;  }
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, usage);

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


/**
 * setViewProjMatrices - set view and projection matrices.
 */
function setViewProjMatrices() {
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if(!u_ViewMatrix){ console.log('Failed to get location of u_ViewMatrix'); return;  }
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(aView[0], aView[1], aView[2], 0.0,0.0,0.0, 0.0,1.0,0.0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    if(!u_ProjMatrix){ console.log('Failed to get location of u_ProjMatrix'); return;  }
    var projMatrix = new Matrix4();
    //projMatrix.setOrtho(-1.0,1.0,-1.0,1.0,1.0,2.0);
    projMatrix.setPerspective(60.0, 1.0, 0.1, 5.0);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
}

/**
 * transformMatrix - apply the transformation to the model matrix.
 *
 * @param  {Float32Array} modelMatrix description
 * @param  {float} r array of angles by axis.
 * @param  {float} t array of translation values by axis.
 * @param  {float} s array of scale values by axis.
 * @return {type}  Model matrix transformated.
 */
function transformMatrix(modelMatrix, r, t, s) {
    modelMatrix.setTranslate(t[0], t[1], t[2]);
    modelMatrix.scale(s[0], s[1], s[2]);
    modelMatrix.rotate(r[0], 1, 0, 0);
    modelMatrix.rotate(r[1], 0, 1, 0);
    modelMatrix.rotate(r[2], 0, 0, 1);
    return modelMatrix;
}

/**
 * draw - call to draw.
 *
 * @param  {WebGLRenderingContext} gl WebGL rendering context.
 */
function draw(gl){
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    setViewProjMatrices(gl);

    if (isColorChange) {
        for (var i = 0; i < g_colors[selectedIndex].length; i+= 3) {
            g_colors[selectedIndex][i] = c[0];
            g_colors[selectedIndex][i + 1] = c[1];
            g_colors[selectedIndex][i + 2] = c[2];
        }
        isColorChange = false;
    }

    if (isXZ) {
        for (var i = -0.5; i <= 0.5; i += 0.1) {
            for (var j = -0.5; j <= 0.5; j += 0.1) {
                var n = initVertexBuffers(gl, new Float32Array([i, 0, j, -i, 0, j, i, 0, j, i, 0, -j]), new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]), new Matrix4, true, false);
                gl.drawArrays(gl.LINES, 0, n);
            }
        }
    }

    if (isXY) {
        for (var i = -0.5; i <= 0.5; i += 0.1) {
            for (var j = -0.5; j <= 0.5; j += 0.1) {
                var n = initVertexBuffers(gl, new Float32Array([i, j, 0, -i, j, 0, i, j, 0, i, -j, 0]), new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]), new Matrix4, true, false);
                gl.drawArrays(gl.LINES, 0, n);
            }
        }
    }

    for(var i = 0; i < g_points.length; i++){
        var sbool = false;
        if (i == selectedIndex) {
            sbool = true;
        }
        var n = initVertexBuffers(gl, new Float32Array(g_points[i]), new Float32Array(g_colors[i]), g_modelMatrix[i], false, sbool);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
    }
}


/**
 * drawGrid - checks if a grid is required.
 */
function drawGrid() {
    var xy = document.getElementById("xy-grid");
    var xz = document.getElementById("xz-grid");

    if(xy.checked){
        kendoConsole.log("Vertical grid");
        isXY = true;
    } else {
        isXY = false;
    }
    if(xz.checked){
        kendoConsole.log("Horizontal grid");
        isXZ = true;
    } else {
        isXZ = false;
    }
}

/**
 * click - draw vertices on click.
 *
 * @param  {event} ev event.
 * @param  {WebGLRenderingContext} gl WebGL rendering context.
 * @param  {type} canvas canvas.
 */
function click(ev, gl, canvas) {
    if(event.buttons == 1){
        var rect = ev.target.getBoundingClientRect();
        if (ev.altKey) {
            isDrawing = true;
        } else {
            var x = ev.clientX;
            var y = ev.clientY;
            x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
            y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

            if(g_points.length <= index){
                var arrayPoints = [];
                g_points.push(arrayPoints);
                var arrayColors = [];
                g_colors.push(arrayColors);
                g_modelMatrix.push(new Matrix4());
                g_rot.push([0, 0, 0]);
                g_trans.push([0.0, 0.0, 0.0]);
                g_scale.push([1,1,1]);
            }

            g_points[index].push(x);
            g_points[index].push(y);
            g_points[index].push(zVal);

            g_colors[index].push(c[0]);
            g_colors[index].push(c[1]);
            g_colors[index].push(c[2]);
        }
    }
}


/**
 * main - main function.
 */
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

    $("#colorPicker").change((ev) => {
        c = hexToRgb(ev.target.value.substring(1));
        isColorChange = true;
        return;
    });

    canvas.onmousedown = function(ev){ click(ev, gl, canvas); };
    canvas.oncontextmenu = function(ev){ rightClick(ev, gl); return false;};
    canvas.onmousemove = function(ev){ rotateCamera(ev, gl);};
    canvas.onmouseup = (ev) => {
        isDrawing = false;
    }

    requestAnimationFrame(update, canvas);
}
