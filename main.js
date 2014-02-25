
// Load data

var loadData = function(filename){

var AJAX_req = new XMLHttpRequest();

AJAX_req.open("GET",filename,true);
AJAX_req.setRequestHeader("Content-type", "application/json");

  AJAX_req.onreadystatechange = function(){
    if(AJAX_req.readyState == 4 && AJAX_req.status == 200){
      
      var data = JSON.parse(AJAX_req.responseText);
      init(data);
    }
  }

AJAX_req.send();

}

var init = function(data){


  width = window.innerWidth;
  height = window.innerHeight;

  offsetX = 0;
  offsetY = 0;

  SCALE = 10;

  renderer = new THREE.CanvasRenderer();
  renderer.setSize( width, height );
  renderer.setClearColor( 0x000000 );


  document.body.appendChild( renderer.domElement );

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 100;
  camera.position.x = 0;
  camera.position.y = 0;
  


  controls = new THREE.TrackballControls( camera );

        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        controls.keys = [ 65, 83, 68 ];

      
  scene = new THREE.Scene();

  createGrid(data);

  animate();

}


var createGrid = function(data){

  var colors = ['rgb(255,245,235)','rgb(254,230,206)','rgb(253,208,162)','rgb(253,174,107)','rgb(253,141,60)','rgb(241,105,19)','rgb(217,72,1)','rgb(166,54,3)','rgb(127,39,4)'];
  //0-8
  
  var range = getRanges(data);
  shapes = [];
  
  for(var i = 0; i < data.length; i++){

    // this is for testing purposes
    if(i %1 === 0){



      var pos = {

        x: geoToScreen([data[i][0],data[i][1]])[0],
        y: geoToScreen([data[i][0],data[i][1]])[1],
        z: data[i][2],

      };

      var category = Math.round(Math.abs((pos.z - range.min.z) / (range.min.z - range.max.z))*8);

      var color = new THREE.Color(colors[category]);

      shapes[i] = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial( { color: color } ));
   
      shapes[i].position.x = (pos.x-range.min.x)-(range.max.x-range.min.x)/2; 

      shapes[i].position.y = (pos.y-range.min.y)-(range.max.y-range.min.y)/2;
      shapes[i].position.z = pos.z / 300;


      scene.add(shapes[i]);

}

  

  }


}

var getRanges = function(data){

  var min = {x: 999999, y: 999999, z:99999};
  var max = {x: 0, y: 0, z:0};

  for(var i = 0; i < data.length; i++){

  var pos = {

        x: geoToScreen([data[i][0],data[i][1]])[0],
        y: geoToScreen([data[i][0],data[i][1]])[1],
        z: data[i][2],

      };

  min.x = pos.x < min.x ? pos.x : min.x;
  min.y = pos.y < min.y ? pos.y : min.y;

  max.x = pos.x > max.x ? pos.x : max.x;
  max.y = pos.y > max.y ? pos.y : max.y;

  min.z = pos.z < min.z ? pos.z : min.z;
  max.z = pos.z > max.z ? pos.z : max.z;

  }

  var range = {

    min: {
      x: min.x,
      y: min.y,
      z: min.z
    },

    max: {
      x: max.x,
      y: max.y,
      z: max.z
    }

  };

  return range;
}

var createGroundPlane = function(width,height,x,y,z){

  var plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshNormalMaterial());
      plane.overdraw = true;
      scene.add(plane);


}


var animate = function(time) {
  
  requestAnimationFrame(animate);

    camera.rotation.x = 0.8;
    camera.position.y = -130;

  renderer.render( scene, camera );
  controls.update();


      }


var geoToScreen = function(coordinates){

  var lon = coordinates[0];
  var lat = coordinates[1];

  var mapWidth = width*SCALE;
  var mapHeight = height*SCALE;

  var x = (lon+180)*(mapWidth/360);

  var latRad = lat*Math.PI/180;
  var mercN = Math.log(Math.tan((Math.PI/4)+(latRad/2)));

  var y = (mapHeight/2)-(mapWidth*mercN/(2*Math.PI));

  return [x,y];

}



window.onload = function(){

loadData("altitudes.json");

}
