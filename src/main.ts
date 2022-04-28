import { vertex, uv, normals, createTable } from "./createModel.js";

const models = ["src/shader/scene.vs", "src/shader/scene.fs"];
const shader: {
  scene_vertex?: string,
  scene_fragment?: string,
} = {};
const shaderProgram: {
  combineShader?: any
} = {};
const shaderProgramObject: {
  combineShader?: {
    vertex_buffer: any,
    normals_buffer: any,
    vertex_length: number
  }
} = {};


const canvas = document.getElementById("canvas");
const gl = getWebGLContext(canvas, {});
let ext = gl.getExtension("OES_standard_derivatives");
if (!ext) {
  alert("this machine or browser does not support OES_standard_derivatives");
}
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);


// 准备PVM变换矩阵
let eyeX = -7.0, eyeY = 15.0, eyeZ = 50.0;
const model_matrix = new Matrix4([]);
const view_matrix = new Matrix4([]);
const perspective_matrix = new Matrix4([]);
// view_matrix.setLookAt(eyeX, eyeY, eyeZ, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
perspective_matrix.setPerspective(45, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 100);
const table = createTable(gl);


function _init() {
  // 创建combineShader着色器
  shaderProgram.combineShader = createProgram(gl, shader.scene_vertex, shader.scene_fragment);
  shaderProgram.combineShader.a_position = gl.getAttribLocation(shaderProgram.combineShader, "a_position");
  shaderProgram.combineShader.a_normals = gl.getAttribLocation(shaderProgram.combineShader, "normals");
  shaderProgram.combineShader.u_model = gl.getUniformLocation(shaderProgram.combineShader, "u_model");
  shaderProgram.combineShader.u_view = gl.getUniformLocation(shaderProgram.combineShader, "u_view");
  shaderProgram.combineShader.u_perspective = gl.getUniformLocation(shaderProgram.combineShader, "u_perspective");
  shaderProgram.combineShader.u_size = gl.getUniformLocation(shaderProgram.combineShader, "u_size");

  // let ver32 = new Float32Array(table.vertices);
  // let normals32 = new Float32Array(table.normals);
  // const vertex_buffer = _initVBOBuffer(ver32);
  // const normals_buffer = _initVBOBuffer(normals32);

  shaderProgramObject.combineShader = {
    vertex_buffer: table.vertices,
    normals_buffer: table.normals,
    vertex_length: table.count
  };
}

// 初始化VBO
const _initVBOBuffer = (data: Float32Array) => {
  let buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}


document.addEventListener("keydown", function (e) {
  switch (e.key) {
    case "ArrowLeft":
      eyeX -= 0.1;
      break;
    case "ArrowRight":
      eyeX += 0.1;
      break;
    case "ArrowUp":
      eyeY += 0.1;
      break;
    case "ArrowDown":
      eyeY -= 0.1;
      break;
  }
})


function renderer(time: number) {
  if (shader.scene_fragment && shader.scene_vertex && shaderProgramObject.combineShader) {
    const now = 0.1 * time;
    const ROTATION_TIME = 10.0;  // 模型旋转360度所需要的时间
    const longPerSec = 2.0 * Math.PI / ROTATION_TIME;
    const latPerSec = 0.5 * Math.PI / ROTATION_TIME;
    const longitudeRad = (longPerSec * now) % 360.0;
    const latitudeRad = (latPerSec * now) % 360.0;

    model_matrix.setTranslate(0, 0, -8);
    // model_matrix.rotate(longitudeRad, 0.0, 1.0, 0.0);
    model_matrix.rotate(latitudeRad, 0.0, 0.0, 1.0,);
    console.log(model_matrix.elements)


    // view_matrix.setLookAt(eyeX, eyeY, eyeZ, -5.0, 7.0, 0.0, 0.0, 1.0, 0.0);
    // gl.bindFramebuffer(gl.FRAMEBUFFER, maskFB);
    gl.useProgram(shaderProgram.combineShader);
    // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, normalMask, 0);

    // VAO、VBO赋值
    gl.uniformMatrix4fv(shaderProgram.combineShader.u_perspective, false, perspective_matrix.elements);
    gl.uniformMatrix4fv(shaderProgram.combineShader.u_view, false, view_matrix.elements);
    gl.uniformMatrix4fv(shaderProgram.combineShader.u_model, false, model_matrix.elements);
    gl.uniform2fv(shaderProgram.combineShader.u_size, [gl.drawingBufferWidth, gl.drawingBufferHeight]);
    gl.bindBuffer(gl.ARRAY_BUFFER, shaderProgramObject.combineShader.vertex_buffer);
    gl.vertexAttribPointer(shaderProgram.combineShader.a_position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.combineShader.a_position);
    gl.bindBuffer(gl.ARRAY_BUFFER, shaderProgramObject.combineShader.normals_buffer);
    gl.vertexAttribPointer(shaderProgram.combineShader.a_normals, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.combineShader.a_normals);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, shaderProgramObject.combineShader.vertex_length);
    gl.disableVertexAttribArray(shaderProgram.combineShader.a_position);
    gl.disableVertexAttribArray(shaderProgram.combineShader.a_normals);
    requestAnimationFrame(renderer);
  }
}

Promise.all(models.map(url =>
  fetch(url).then(resp => resp.text())
)).then(
  (shaders) => {
    shader.scene_vertex = shaders[0];
    shader.scene_fragment = shaders[1];
    _init();
    requestAnimationFrame(renderer);
  }
);
