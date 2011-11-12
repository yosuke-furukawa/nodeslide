

function showAll() {
  var labels = document.getElementsByClassName("label");
  console.log(labels);
  for (var label in labels) {
    label.style.display='';
  }
}
function hideAll() {
  var labels = document.getElementsByClassName("label");
  console.log(labels);
  for (var label in labels) {
    label.style.display='none';
  }
}

//window.onload = function (){
//
//var showbutton = document.getElementById("show");
//console.log(showbutton);
//showbutton.onclick = function(evt) { showAll() };
//
//var hidebutton = document.getElementById("hide");
//hidebutton.onclick = function(evt) { hideAll() };
//};
