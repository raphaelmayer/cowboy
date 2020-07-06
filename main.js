!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";function o({x:e,y:t,name:n,color:o,sprite:r}){return{x:e,y:t,name:n||"null",sprite:r||{x:6,y:2},color:o||"red"}}function r({x:e,y:t,name:n,color:r,sprite:i,traversable:s,penetrable:l,seeable:h,occupied:a,movementCost:c}){return{...o({x:e,y:t,name:n,color:r,sprite:i}),traversable:s,penetrable:l,seeable:h,occupied:!0===a,movementCost:c||1}}function i({x:e,y:t,name:n,sprite:o,movementCost:i}){return{...r({x:e,y:t,name:n,color:"white",traversable:!0,penetrable:!0,seeable:!0,movementCost:i||1,sprite:o})}}function s({x:e,y:t,name:n,sprite:o,movementCost:i}){return{...r({x:e,y:t,name:n,color:"grey",traversable:!1,penetrable:!1,seeable:!1,movementCost:i||1,sprite:o})}}function l({x:e,y:t,name:n,sprite:o,movementCost:i}){return{...r({x:e,y:t,name:n,color:"lightgrey",traversable:!0,penetrable:!1,seeable:!0,movementCost:i||2,sprite:o})}}function h({x:e,y:t,name:n,sprite:o,movementCost:i}){return{...r({x:e,y:t,name:n,color:"darkgreen",traversable:!0,penetrable:!0,seeable:!1,movementCost:i||2,sprite:o})}}function a({x:e,y:t,name:n,color:r,sprite:i,movementSpeed:s,friendly:l,vision:h}){return{...o({x:e,y:t,name:n,color:r,sprite:i}),draw:null,movementSpeed:s,friendly:l||0,vision:h||10,xVel:0,yVel:0,moveTo:function(e,t,n,o,r){this.xVel+=n-e,this.yVel+=o-t}}}function c({x:e,y:t,name:n,color:o,sprite:r,range:i,movementSpeed:s,friendly:l}){return 4,{...a({x:e,y:t,name:n,color:o,sprite:r,movementSpeed:4,friendly:l}),range:i||0===i?i:10}}function y({x:e,y:t,name:n,sprite:o,friendly:r}){return{...c({x:e,y:t,name:n,friendly:r,sprite:o||{x:0,y:1},range:10,movementSpeed:5,name:"gunner"}),weapon:{attack:5,velocity:10}}}function u(e,t){const{overlays:n,screen_buffer:o,currentSelection:r}=t;if(console.log(e.code),"Digit1"!==e.code){for(;n.length>0;)n.pop();mode=STANDARD_MODE}function i(e,t,n,o){for(let r=0;r<t;r+=t/n)setTimeout(()=>{o(),r>t-t/n*2&&console.log("tile:",e),e.occupied=!0},r)}function s(e,t){if(!e||!e.movementSpeed)return!0;const n=toTileSize(e.x),r=toTileSize(e.y);let i=0,s=0;"KeyW"===t&&(s=-1),"KeyS"===t&&(s=1),"KeyA"===t&&(i=-1),"KeyD"===t&&(i=1),n*TILE_SIZE<e.x&&++i,r*TILE_SIZE<e.y&&++s;const l=getIndex(n+i,r+s,TM_WIDTH);if(console.log("x:",n,"y:",r," => i:",l),!o[l].traversable||o[l].occupied)return console.log("collision detected:",o[l]),console.log("entity:",e),!0;const h=getIndex(n,r,TM_WIDTH);return console.log(l,h),o[h].occupied=!1,console.log(o[l]),!1}switch(e.code){case"KeyW":s(r,e.code)||i(o[getTileIndex(r.x,r.y-TILE_SIZE)],200,TILE_SIZE,()=>r.y--);break;case"KeyD":s(r,e.code)||i(o[getTileIndex(r.x+TILE_SIZE,r.y)],200,TILE_SIZE,()=>r.x++);break;case"KeyS":s(r,e.code)||i(o[getTileIndex(r.x,r.y+TILE_SIZE)],200,TILE_SIZE,()=>r.y++);break;case"KeyA":s(r,e.code)||i(o[getTileIndex(r.x-TILE_SIZE,r.y)],200,TILE_SIZE,()=>r.x--);break;case"Digit1":if(console.log("attack mode"),r&&mode!==ATTACK_MODE){for(mode=ATTACK_MODE;n.length>0;)n.pop();const{x:e,y:t,range:o}=r;for(let r=-o;r<o;r++)for(let i=-o;i<o;i++)getTileDistance(e,t,e+r*TILE_SIZE,t+i*TILE_SIZE)<o&&n.push({x:e+r*TILE_SIZE,y:t+i*TILE_SIZE})}else{for(;n.length>0;)n.pop();mode=STANDARD_MODE}break;case"Digit2":case"Digit3":break;case"Digit4":t.currentSelection.x=t.currentSelection.x+20;break;case"Digit0":console.log(t),0===debug?debug=5:debug-=1}}n.r(t);const x=new Image(40,20);x.src="./sprite-sheet.png";let d="";d+="#####################H##########",d+="#hhhhhhhhhhhhhh#     Hhhhhhhhhh#",d+="#hhhh       hhh#     H   hhhhhh#",d+="#hh           h  z  zH     hhhh#",d+="#hh   ------      uu H      -hh#",d+="#hh  hh####-    --   H      -hh#",d+="#hh   h####-   ---hh H     -hhh#",d+="#hh   h hhH    --hhhhH    -hhhh#",d+="==========X==========X==========",d+="#####     H    hhhh  H 6   hhhh#",d+="#h        H     hh   H      hhh#",d+="#h  1223h Hh123      H       ###",d+="#h  qwweh Hhqwe      H        h#",d+="#h  assdh Hhqwe      H #  --  h#",d+="#h hyxfch Hhqwe   h  H # ---  h#",d+="#h        Hhqwe      H # --  hh#",d+="#h  12223 Hhqwe      H      hhh#",d+="#h  qwwwe Hhqwe    --H      hhh#",d+="#h  asssd Hhasd   ---H      hhh#",d+="#h hyxgfc Hhyxc   ---H     --hh#",d+="==========L==========X=========-",d+="#h            #      H   ---hhh#",d+="#hhhhhhhhhhhhh#hhhhh H ----hhhh#",d+="#####################H##########";function m(){const e=document.createElement("canvas"),t=document.createElement("canvas");e.width=t.width=640,e.height=t.height=480,e.style.position=t.style.position="absolute",document.body.style.margin=0,document.body.insertBefore(e,document.body.childNodes[0]),document.body.insertBefore(t,document.body.childNodes[0]);const n=e.getContext("2d"),o=t.getContext("2d"),r=[],m=[],T=[],w=[];let E,I="STD",H={x:0,y:0},_=!1,k=[];var M={};let A,D=!1,C=null,L=0,O={screen_buffer:r,entities:m,overlays:T,weatherParticles:w,lightning:5,fogOfWar:[],mode:I,currentSelection:E,mousePos:H,mapInitialized:_,debug:5,preview:k,pressedKeys:M,leftMousePressed:D,leftMouseDownStart:C,timePreviousFrame:A,fps:L};for(let e=0;e<128;e++)w.push({x:b(640),y:-b(480)});console.log("resolution: 640 * 480"),console.log("tile size: 20, tile resolution: 32 * 24"),console.log("MAP_CHAR_COUNT:",d.length);for(let e=0;e<d.length-1;e++){const{x:t,y:n}=f(e,32);" "==d[e]&&(r[e]={...i({x:20*t,y:20*n,name:"grass tile",sprite:{x:0,y:0}})}),"-"==d[e]&&(r[e]={...h({x:20*t,y:20*n,name:"high grass tile",sprite:{x:7,y:2}})}),"#"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"wall tile",sprite:{x:1,y:0}})}),"h"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"tree",sprite:{x:2,y:0}})}),"="==d[e]&&(r[e]={...i({x:20*t,y:20*n,name:"road",sprite:{x:4,y:0}})}),"H"==d[e]&&(r[e]={...i({x:20*t,y:20*n,name:"road",sprite:{x:3,y:1}})}),"l"==d[e]&&(r[e]={...i({x:20*t,y:20*n,name:"road",sprite:{x:5,y:1}})}),"L"==d[e]&&(r[e]={...i({x:20*t,y:20*n,name:"road",sprite:{x:4,y:2}})}),"X"==d[e]&&(r[e]={...i({x:20*t,y:20*n,name:"road",sprite:{x:3,y:0}})}),"1"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"house",sprite:{x:0,y:2}})}),"2"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"house",sprite:{x:1,y:2}})}),"3"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"house",sprite:{x:2,y:2}})}),"6"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"deer stand",sprite:{x:6,y:0}})}),"7"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"house",sprite:{x:7,y:0}})}),"q"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"house",sprite:{x:0,y:3}})}),"w"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"house",sprite:{x:1,y:3}})}),"e"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"house",sprite:{x:2,y:3}})}),"r"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"house",sprite:{x:3,y:3}})}),"t"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"house",sprite:{x:4,y:3}})}),"z"==d[e]&&(r[e]={...l({x:20*t,y:20*n,name:"halfwall H",sprite:{x:6,y:1}})}),"u"==d[e]&&(r[e]={...l({x:20*t,y:20*n,name:"halfwall V",sprite:{x:7,y:1}})}),"a"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"house",sprite:{x:0,y:4}})}),"s"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"house",sprite:{x:1,y:4}})}),"d"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"house",sprite:{x:2,y:4}})}),"f"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"house",sprite:{x:3,y:4}})}),"g"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"house",sprite:{x:4,y:4}})}),"y"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"house",sprite:{x:0,y:5}})}),"x"==d[e]&&(r[e]={...i({x:20*t,y:20*n,name:"house",sprite:{x:1,y:5}})}),"c"==d[e]&&(r[e]={...s({x:20*t,y:20*n,name:"house",sprite:{x:2,y:5}})})}m.push(y({x:420,y:300,friendly:1})),m.push(y({x:300,y:300,sprite:{x:1,y:1},friendly:1})),m.push(y({x:420,y:6400,friendly:1})),m.push(y({x:300,y:400,sprite:{x:1,y:1},friendly:1})),m.push(function({x:e,y:t,friendly:n}){return{...c({x:e,y:t,friendly:n,sprite:{x:3,y:2},range:20,movementSpeed:3,name:"sniper"}),weapon:{attack:10,velocity:20}}}({x:100,y:80,friendly:-1})),m.push(function({x:e,y:t,name:n}){return{...a({x:e,y:t,name:"chicken",sprite:{x:2,y:1},movementSpeed:3})}}({x:200,y:240})),window.onkeyup=function(e){M[e.keyCode]=!1},window.onkeydown=function(e){M[e.keyCode]=!0};document.addEventListener("keydown",e=>u(e,O)),document.addEventListener("mousemove",e=>function(e,t){const{mousePos:n}=t;n.x=e.x,n.y=e.y}(e,O)),document.addEventListener("mouseup",void 0),document.addEventListener("contextmenu",void 0);function P(e,t,n,o){if(!e||!t)return console.error("drawSprite(): Insufficient params"),void(e&&console.log(e));const{color:r,sprite:i}=e,s=n>=0?n:e.x,l=o>=0?o:e.y;e&&(i?t.drawImage(x,20*i.x,20*i.y,20,20,s,l,20,20):(t.fillstyle=r,t.fillRect(s,l,20,20)))}window.requestAnimationFrame((function e(){console.log("debug",5),n.clearRect(0,0,640,480),function(){const e=performance.now();if(!A)return A=e,void(L=0);let t=(e-A)/1e3;A=e,L=(1/t).toFixed(0)}(),_||(o.clearRect(0,0,640,480),o.fillStyle="#e1c699",o.fillRect(0,0,640,480),r.forEach((e,t)=>{const n=20*Math.floor(t%32),r=20*Math.floor(t/32);o.drawImage(x,20*e.sprite.x,20*e.sprite.y,20,20,n,r,20,20)}),_=!0);r.forEach(e=>e.occupied=!1);{const{x:e,y:t}=H;n.font="10px Arial",n.font="30px Arial",n.fillStyle="white",n.fillText("x: "+e+" y: "+t+" tx: "+g(e)+" ty: "+g(t)+", fps: "+L,0,30)}if(m.forEach(e=>{1===e.friendly?n.strokeStyle="blue":-1===e.friendly&&(n.strokeStyle="red");const{x:t,y:o}=e;let i=p(e.x,e.y);r[i]&&(r[i].occupied=!0),P(e,n)}),E){const{x:e,y:t,friendly:o,range:r}=E;n.strokeStyle=-1===o?"red":1===o?"blue":"#222",n.beginPath(),n.rect(e,t,20,20),n.stroke(),"ATK"===I&&function(e,t,n){const o=[];for(let r=-n;r<n;r++)for(let i=-n;i<n;i++){const s=e+20*r,l=t+20*i;S(s,l)&&(Math.abs(r)<n-n/5&&Math.abs(i)<n-n/5||v(e,t,s,l)<n)&&o.push({x:s,y:l})}return o}(e,t,r).forEach(e=>{n.beginPath(),n.rect(e.x,e.y,20,20),n.stroke()}),n.font="12px Arial",n.fillStyle="#eee",n.fillRect(530,340,640,480);const{movementSpeed:i,movementCost:s,name:l,traversable:h,occupied:a,attack:c}=E;n.fillStyle="#222",n.fillText(l,540,365),n.font="10px Arial",n.fillText("MOV: "+(i||s),540,390),i?(n.fillText("ATK: "+c,540,410),n.fillText("RNG: "+r,540,430)):(n.fillText("TRA: "+h,540,410),n.fillText("OCC: "+a,540,430)),P(E,n,610,350)}T.length>0&&console.log("ol:",T.length),T&&T.length>0&&(n.strokeStyle="#1aa",n.beginPath(),T.forEach(e=>e.animate?P(e,n):n.rect(e.x,e.y,20,20)),n.stroke());if(H){const{x:e,y:t}=H;"ATK"===I&&(n.strokeStyle="red"),"STD"===I&&(n.strokeStyle="blue"),n.beginPath(),n.rect(20*g(e),20*g(t),20,20),n.stroke()}window.requestAnimationFrame(e)}))}function f(e,t){return{x:e%t,y:Math.floor(e/t)}}function p(e,t){return function(e,t,n=640){return e+n*t}(g(e),g(t),32)}function g(e){return Math.floor(e/20)}function b(e){return Math.floor(Math.random()*e)}function v(e,t,n,o){const r=g(n)-g(e),i=g(o)-g(t);return Math.sqrt((s=r)*s+(l=i)*l);var s,l}function S(e,t){return 0<=e&&e<640&&0<=t&&t<480}window.onload=()=>{m()}}]);