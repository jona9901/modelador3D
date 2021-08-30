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

function setSliderValues() {
    var rotSlider = $("#rotSlider").data("kendoSlider");
    var transSlider = $("#transSlider").data("kendoSlider");
    var scaleSlider = $("#scaleSlider").data("kendoSlider");
    rotSlider.value(g_rot[selectedIndex][axisIndex]);
    transSlider.value(g_trans[selectedIndex][axisIndex]);
    scaleSlider.value(g_scale[selectedIndex][axisIndex]);
}

//function resetSliders

function restart(){
    index = 0;
    g_points = [];
    g_colors = [];
    g_rot = [];
    g_trans = [];
    g_scale = [];
    g_modelMatrix = [];
    kendoConsole.log("Restart");
}

function rotSliderOnSlide(e) {
    //kendoConsole.log("Slide :: new slide value is: " + e.value);
    angle = e.value;
    //rotV[index][axisIndex] = angle;
    g_rot[selectedIndex][axisIndex] = angle;
}

function rotSliderOnChange(e) {
    //kendoConsole.log("Change :: new value is: " + e.value);
    angle = e.value;
    //rotV[index][axisIndex] = angle;
    g_rot[selectedIndex][axisIndex] = angle;
}

function transSliderOnSlide(e) {
    //kendoConsole.log("Slide :: new slide value is: " + e.value);
    trans = e.value;
    g_trans[selectedIndex][axisIndex] = axis[axisIndex] * trans;
}

function transSliderOnChange(e) {
    //kendoConsole.log("Change :: new value is: " + e.value);
    trans = e.value;
    g_trans[selectedIndex][axisIndex] = axis[axisIndex] * trans;
}

function scaleSliderOnSlide(e) {
    //kendoConsole.log("Slide :: new slide value is: " + e.value);
    scale = e.value;
    g_scale[selectedIndex][axisIndex] = axis[axisIndex] * scale;
}

function scaleSliderOnChange(e) {
    //kendoConsole.log("Change :: new value is: " + e.value);
    scale = e.value;
    g_scale[selectedIndex][axisIndex] = axis[axisIndex] * scale;
}

function zSliderOnSlide(e) {
    //kendoConsole.log("Slide :: new slide value is: " + e.value);
    zVal = e.value;
}

function zSliderOnChange(e) {
    //kendoConsole.log("Change :: new value is: " + e.value);
    zVal = e.value;
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

    $("#zSlider").kendoSlider({
        change: zSliderOnChange,
        slide: zSliderOnSlide,
        min: -1,
        max: 1,
        smallStep: .01,
        largeStep: .1,
        value: 0
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

    $("#colorPicker").change((ev) => {
        c = hexToRgb(ev.target.value.substring(1));
        isColorChange = true;
        //if (selectedIndex != index) {
        /*for (var i = 0; i < g_colors[selectedIndex].length; i++) {
            g_colors[selectedIndex][i] = c;
        }*/
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

function rotateCamera(ev, gl) {
    if (isDrawing) {
        var x = ev.clientX;
        var y = ev.clientY;
        var z = 1.5;

        //var xPersp = 0.0;

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
        /*
        if (x >= 1) {
            xPersp = 1.5;
            z = 0;
            isZ = true;
            //z = (x - 1) / 2;
        }
        if (x <= - 1) {
            xPersp = -1.5;
            z = 0;
            isZ = true;
        }
        if (x < 1 && x > -1) {
            xPersp = 0;
            z = 1.5;
            isZ = false;
        }

        //x = 3 - x * 3;
        //var z = (canvas.height / 2) / Math.tan(Math.PI / 6);
        */
        aView[0] = x;
        aView[1] = y;
        aView[2] = z;
    }
}

function mouseMove(ev, gl, canvas) {
    if (isDrawing) {
        kendoConsole.log("hola");
    }
}

function update(){

    draw(gl);
    requestAnimationFrame(update, canvas);
}

function rightClick(ev, gl) {
    $('#buttons').append('<button onclick="selectModel(' + index + ')" id="button' + index + '" class="modelButton" type="button"><i class="fas fa-cube"></i></button>');
    selectedIndex = index;
    index++;
    //isIndex = true;
    //kendoConsole.log("rotV: " + rotValues);
}

function selectModel(n) {
    kendoConsole.log('selected: ' + n);
    selectedIndex = n;
    setSliderValues();
}

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

    $('#buttons').append('<button onclick="selectModel(' + index + ')" id="button' + index + '" class="modelButton" type="button"><i class="fas fa-cube"></i></button>');
    selectedIndex = index;
    index++;
}

/*
function initVertexBuffers(gl, vertices, colors, isStatic){
    var n = vertices.length/3;
    var vertexBuffer = gl.createBuffer();
    var modelMatrix = new Matrix4();
    if (isStatic) {
        usage = gl.STATIC_DRAW;
    } else {
        let mIndex = index;
        if (isSelected) {
            mIndex = selectedIndex;
            isSelected = false;
        }
        usage = gl.DYNAMIC_DRAW;
        modelMatrix.setScale(scaleValues[0], scaleValues[1], scaleValues[2]);
        modelMatrix.translate(transValues[0], transValues[1], transValues[2]);
        modelMatrix.rotate(rotV[mIndex][2], 0, 0, 1);
        modelMatrix.rotate(rotV[mIndex][1], 0, 1, 0);
        modelMatrix.rotate(rotV[mIndex][0], 1, 0, 0);
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

    // transformations

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

    for (var i = -0.5; i <= 0.5; i += 0.1) {
        for (var j = -0.5; j <= 0.5; j += 0.1) {
            var n = initVertexBuffers(gl, new Float32Array([i, 0, j, -i, 0, j, i, 0, j, i, 0, -j]), new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]), new Matrix4, true, false);
            //var n = initVertexBuffers(gl, new Float32Array([i, 0, j, -i, 0, j, i, 0, j, i, 0, -j]), new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]), true);
            gl.drawArrays(gl.LINES, 0, n);
        }
    }

    for(var i = 0; i < g_points.length; i++){
        var sbool = false;
        if (i == selectedIndex) {
            sbool = true;
        }
        var n = initVertexBuffers(gl, new Float32Array(g_points[i]), new Float32Array(g_colors[i]), g_modelMatrix[i], false, sbool);
        //var n = initVertexBuffers(gl, new Float32Array(g_points[i]), new Float32Array(g_colors[i]), modelMatrix, false);
        //var n = initVertexBuffers(gl, new Float32Array(g_points[i]), new Float32Array(g_colors[i]), false);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
    }
}

function transformMatrix(modelMatrix, r, t, s) {
    modelMatrix.setTranslate(t[0], t[1], t[2]);
    modelMatrix.scale(s[0], s[1], s[2]);
    modelMatrix.rotate(r[0], 1, 0, 0);
    modelMatrix.rotate(r[1], 0, 1, 0);
    modelMatrix.rotate(r[2], 0, 0, 1);
    return modelMatrix;
}

var index = 0;
var axisIndex = 0;
var selectedIndex = 0;
var aView = [0, 0, 1.5];
var axis = [1,0,0];
var g_points = [];
var g_colors = [];
var isDrawing = false;
var isZ = false;
var c = [230 / 255, 100 / 255, 101 / 255];
var zVal = 0.0;
var g_rot = [];
var g_trans = [];
var g_scale = [];
var g_modelMatrix = [];
var isColorChange = false;
function click(ev, gl, canvas) {
    if(event.buttons == 1){
        var rect = ev.target.getBoundingClientRect();
        /*if (isZ) {
            var z = ev.clientX;
            z = ((z - rect.left) - canvas.width/2)/(canvas.width/2);
            var x = 0.0;
        } else {
            var x = ev.clientX;
            x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
            var z = 0.0;
        }*/
        if (ev.altKey) {
            isDrawing = true;
        } else {
            //if(isIndex) {
                //index++;
                //selectedIndex = index;
                //isIndex = false;
            //}
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
                //var rotBuff = rotValue
                //g_colors[index - 1].push(0.1);
                // /rotV.push(rotBuff);
                //console.log(rotV);
            }

            g_points[index].push(x);
            g_points[index].push(y);
            /*var z = 0.0;
            if(ev.ctrlKey){
                z = -0.2;
            } else if(ev.shiftKey) {
                z = 0.2;
            }*/
            g_points[index].push(zVal);

            //g_colors[index].push(c);

            g_colors[index].push(c[0]);
            g_colors[index].push(c[1]);
            g_colors[index].push(c[2]);
            //g_colors[index].push(c[3]);
        }
    }
}
