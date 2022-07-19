/*
  Rui Santos
  Complete project details at https://RandomNerdTutorials.com/esp32-mpu-6050-web-server/

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/


let scene, camera, rendered, cube;
var teste = "arquivo teste";
const accX_array = [];
const accY_array = [];
const accZ_array = [];
const giroX_array = [];
const giroY_array = [];
const giroZ_array = [];
const time_array = [];
var N_amostra = 100;
var tempoInicio = 0.0;

function parentWidth(elem) { 
  return elem.parentElement.clientWidth;
}

function parentHeight(elem) {
  return elem.parentElement.clientHeight;
}

function init3D(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(75, parentWidth(document.getElementById("3Dcube")) / parentHeight(document.getElementById("3Dcube")), 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(parentWidth(document.getElementById("3Dcube")), parentHeight(document.getElementById("3Dcube")));

  document.getElementById('3Dcube').appendChild(renderer.domElement);

  // Create a geometry
  const geometry = new THREE.BoxGeometry(5, 1, 4);

  // Materials of each face
  var cubeMaterials = [
    new THREE.MeshBasicMaterial({color:0x03045e}),
    new THREE.MeshBasicMaterial({color:0x023e8a}),
    new THREE.MeshBasicMaterial({color:0x0077b6}),
    new THREE.MeshBasicMaterial({color:0x03045e}),
    new THREE.MeshBasicMaterial({color:0x023e8a}),
    new THREE.MeshBasicMaterial({color:0x0077b6}),
  ];

  const material = new THREE.MeshFaceMaterial(cubeMaterials);

  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  camera.position.z = 5;
  renderer.render(scene, camera);
}

// Resize the 3D object when the browser window changes size
function onWindowResize(){
  camera.aspect = parentWidth(document.getElementById("3Dcube")) / parentHeight(document.getElementById("3Dcube"));
  //camera.aspect = window.innerWidth /  window.innerHeight;
  camera.updateProjectionMatrix();
  //renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setSize(parentWidth(document.getElementById("3Dcube")), parentHeight(document.getElementById("3Dcube")));

}

window.addEventListener('resize', onWindowResize, false);

// Create the 3D representation
init3D();

// Create events for the sensor readings
if (!!window.EventSource) {
  var source = new EventSource('/events');

  source.addEventListener('open', function(e) {
    console.log("Events Connected");
  }, false);

  source.addEventListener('error', function(e) {
    if (e.target.readyState != EventSource.OPEN) {
      console.log("Events Disconnected");
    }
  }, false);

  source.addEventListener('gyro_readings', function(e) {
    //console.log("gyro_readings", e.data);
    var obj = JSON.parse(e.data);
    document.getElementById("gyroX").innerHTML = obj.gyroX;
    document.getElementById("gyroY").innerHTML = obj.gyroY;
    document.getElementById("gyroZ").innerHTML = obj.gyroZ;
    if(giroZ_array.length<N_amostra){
      giroX_array.push(obj.gyroX);
      giroY_array.push(obj.gyroY); 
      giroZ_array.push(obj.gyroZ);
    }

    // Change cube rotation after receiving the readinds
    cube.rotation.x = obj.gyroY;
    cube.rotation.z = obj.gyroX;
    cube.rotation.y = obj.gyroZ;
    renderer.render(scene, camera);
  }, false);

  source.addEventListener('temperature_reading', function(e) {
    console.log("temperature_reading", e.data);
    document.getElementById("temp").innerHTML = e.data;
  }, false);

  source.addEventListener('time_reading', function(e) {
    console.log("time_reading", e.data);
    //document.getElementById("temp").innerHTML = e.data;
    if(time_array.length<N_amostra){
      time_array.push((parseFloat(e.data) - tempoInicio)/1000);
    }
    if(time_array.length==1){
      tempoInicio = time_array[0];
      time_array[0] = 0.0;
    }
  }, false);

  source.addEventListener('accelerometer_readings', function(e) {
    console.log("accelerometer_readings", e.data);
    var obj = JSON.parse(e.data);
    document.getElementById("accX").innerHTML = obj.accX;
    document.getElementById("accY").innerHTML = obj.accY;
    document.getElementById("accZ").innerHTML = obj.accZ;
      if(accZ_array.length<N_amostra){
        accX_array.push(obj.accX);
        accY_array.push(obj.accY); 
        accZ_array.push(obj.accZ);
      }
  }, false);
}

function resetPosition(element){
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/"+element.id, true);
  console.log(element.id);
  xhr.send();
}
  


function dataSaver(){
  const medicoes = {accX:accX_array, accY:accY_array, accZ:accZ_array, giroX:giroX_array, giroY:giroY_array, giroZ:giroZ_array, time:time_array}
  var blob = new Blob([JSON.stringify(medicoes),null,'\t'], {type: "text/plain;charset=utf-8"});
  console.log(medicoes);
  var xhr = new XMLHttpRequest();
  saveAs(blob, "Medicoes.json");
  xhr.open("GET", "/save", true);
  console.log(save);
  xhr.send();
}
