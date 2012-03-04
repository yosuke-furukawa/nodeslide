var socket = io.connect('http://yosuketest.node-ninja.com', {
  'reconnect': true,
  'reconnection delay': 500,
  'max reconnection attempts': 10
});
var idArray = new Array();
var connected = false;
var slidesClass = document.getElementsByClassName("slides")[0];
var operation = document.getElementsByClassName("operation")[0];
socket.on('connect', function (data) {
  var count = {slideId: getSlideId()};
  if (validate_slideId(count)) {
    socket.json.emit('count up', count);
  }
  connected = true;
});
socket.on('disconnect', function(data) {
  connected = false;
});

socket.on('loaded', function (data) {
  console.log(data._id);
  console.log(data.message);
  labelLoad(data);
});
socket.on('counter', function (data) {
  var counter = document.getElementsByClassName("counter")[0];
  var slideId = getSlideId();
  if (slideId == data.slideId) {
    counter.innerHTML = "now reading : " + data.count + " people";
  }
});
socket.on('created', function (data) {
        if (data.slideKey == getSlideId()) {
	  var newLabel = document.createElement("DIV");
          var message;
	  newLabel.id = data.id;
          idArray.push(data.id);
	  newLabel.className = "label";
	  newLabel.style.left = data.x + "px";
	  newLabel.style.top = data.y + "px";
	  //入力フォームの用意
	  var inputForm = document.createElement("FORM");

	  var inputText = document.createElement("TEXTAREA");
	  inputText.style.cols = "10";
	  inputText.style.rows = "3";
	  inputForm.appendChild(inputText);

	  newLabel.onmousedown = function (evt) { onDrag(evt, this) };


	  var okButton = document.createElement("INPUT");
	  okButton.type = "button";
	  okButton.value = "ok";
	  okButton.onclick = function () { writeText() };
	  inputForm.appendChild(okButton);
	  //OKされたらテキストを表示し、フォームを消す
	  var writeText = function () {
		var labelText = document.createElement("SPAN");
		var str = inputText.value;
		str = escapeHTML(str);
		var htmlstr = str.replace(/(\n|\r)+/g, "<br />");
		labelText.innerHTML = htmlstr;
		newLabel.appendChild(labelText);

		newLabel.removeChild(inputForm);
		
                console.log('currentSlideNo:%d', currentSlideNo);
                var textdata =  {id: newLabel.id, message: htmlstr};
                if (validate_id(textdata) && validate_message(textdata)) {
		  socket.json.emit('text edit', textdata);
                }
		newLabel.onmousedown = function (evt) { onDrag(evt, this) };
		newLabel.ondblclick = function (evt) { reEdit(evt, this); return false; };
		slidesClass.addEventListener("dblclick", addLabel, false);
		document.addEventListener('keydown', handleBodyKeyDown, false);
	  }

	  //編集をキャンセルした場合の処理
	  var cancelButton = document.createElement("INPUT");
	  cancelButton.type = "button";
	  cancelButton.value = "x";
	  cancelButton.onclick = function () { 
		var node = newLabel.parentNode;
		node.removeChild(newLabel);
                var canceldata =  {id: newLabel.id};
                if (validate_id(canceldata)) {
		  socket.json.emit('cancel',canceldata);
                }
		slidesClass.addEventListener("dblclick", addLabel, false);
		document.addEventListener('keydown', handleBodyKeyDown, false);

	  };
	  inputForm.appendChild(cancelButton);
	  //上記内容をAppend
	  newLabel.appendChild(inputForm);
	  document.getElementsByClassName('slide')[data.slideno].appendChild(newLabel);
	  inputText.focus();
        }
	});
socket.on('created by other', function(data){
        if (data.slideKey == getSlideId()) {
          var newLabel = document.createElement("DIV");
          var message;
	  newLabel.id = data.id;
	  newLabel.className = "label";
	  newLabel.style.left = data.x + "px";
	  newLabel.style.top = data.y + "px";
	  var labelText = document.createElement("SPAN");
	  labelText.innerHTML = "someone writing....";
	  newLabel.appendChild(labelText);
	  newLabel.onmousedown = function (evt) { onDrag(evt, this) };
	  newLabel.ondblclick = function (evt) { reEdit(evt, this); return false; };
	  slidesClass.addEventListener("dblclick", addLabel, false);
	  document.addEventListener('keydown', handleBodyKeyDown, false);

       	  document.getElementsByClassName('slide')[data.slideno].appendChild(newLabel);
        }
        });
socket.on('text edited', function(data){
        if (data.slideKey == getSlideId()) {
          var label = document.getElementById(data.id);
	  var xButtonLabel = label.getElementsByTagName("A")[0];
          var labelText = label.getElementsByTagName("SPAN")[0];
	  if (xButtonLabel) {
	    label.removeChild(xButtonLabel);
	  }
	  label.removeChild(labelText);
          var xButton = document.createElement("A");
	  xButton.href = "#";
	  xButton.innerHTML = "[x]";
	  xButton.onclick = function(){
	   	labelDelete(label.id);
		return false;
	  }
	  label.appendChild(xButton);
 	  labelText.innerHTML = data.message;
	  label.appendChild(labelText);
        }
        });
socket.on('deleted', function(data){
          var label = document.getElementById(data.id);
          var node = label.parentNode;
          node.removeChild(label);
        });
socket.on('updated', function(data){
          var label = document.getElementById(data.id);
          label.style.left = data.x + "px";
          label.style.top = data.y + "px";
        });
socket.on('cancelled', function(data){
	  var label = document.getElementById(data.id);
          var node = label.parentNode;
	  node.removeChild(label);

	});
window.onload = function (){
        document.addEventListener('keydown', handleBodyKeyDown, false);
	var els = slides;
	for (var i = 0, el; el = els[i]; i++){
		addClass(el, 'slide');
	}
	updateSlideClasses(); 
	slidesClass.addEventListener("dblclick", addLabel, false);
	createOperationMenu();
        }

function reconnectSocket() {
  if (!connected) {
    $.get('/ping', function(data) {
      connected = true;
      window.location.href = unescape(window.location.pathname);
    });
  }
}

function createOperationMenu() {
	var showButton = document.createElement("BUTTON");
        showButton.type = "button";
        showButton.innerHTML = "show";
        //hideButton.addEventListener('click', hideAll, false);
	showButton.onclick = function(){ 
          showAll(); };

	var hideButton = document.createElement("BUTTON");
        hideButton.type = "button";
        hideButton.innerHTML = "hide";
        //hideButton.addEventListener('click', hideAll, false);
	hideButton.onclick = function(){ 
          hideAll(); };

	var previousButton = document.createElement("BUTTON");
        previousButton.type = "button";
        previousButton.innerHTML = "< previous";
        //hideButton.addEventListener('click', hideAll, false);
	previousButton.onclick = function(){ 
          prevSlide(); };


	var nextButton = document.createElement("BUTTON");
        nextButton.type = "button";
        nextButton.innerHTML = "next >";
        //hideButton.addEventListener('click', hideAll, false);
	nextButton.onclick = function(){ 
          nextSlide(); };


        var colorSelector = document.createElement("SELECT");
        var yellowOption = document.createElement("OPTION");
        yellowOption.value = "yellow";
        yellowOption.innerHTML = "yellow";
        yellowOption.onselect = function() {
          console.log("yellow");
        }
        var redOption = document.createElement("OPTION");
        redOption.value = "red";
        redOption.innerHTML = "red";
        colorSelector.appendChild(yellowOption);
        colorSelector.appendChild(redOption);

        operation.appendChild(showButton);
	operation.appendChild(hideButton);
	operation.appendChild(previousButton);
        operation.appendChild(nextButton);
        //operation.appendChild(colorSelector);
}
function addLabel (event) {
	//新しいラベルの追加
        reconnectSocket();
	var layerX = event.layerX;
        var layerY = event.layerY;
	var createdata = {x: layerX, y: layerY, slideno: currentSlideNo-1};
        console.log(validate_slideNo(createdata));
        console.log(validate_position(createdata.x, createdata.y));
        if (validate_slideNo(createdata) && validate_position(createdata.x, createdata.y)) {
	  slidesClass.removeEventListener("dblclick", addLabel, false);
          document.removeEventListener('keydown', handleBodyKeyDown, false);
          socket.json.emit('create', createdata);
        }
}

function onDrag (evt, item) {
	//ドラッグされるとラベルを移動する
        reconnectSocket();

	var x = 0;
	var y = 0;

	x = evt.screenX;
	y = evt.screenY;

	orgX = item.style.left;
	orgX = Number(orgX.slice(0, -2));
	orgY = item.style.top;
	orgY = Number(orgY.slice(0, -2));

	slidesClass.addEventListener("mousemove", mousemove, false);
	slidesClass.addEventListener("mouseup", mouseup, false);

	function mousemove(move) {
		dx = move.screenX - x;
		dy = move.screenY - y;
                var movedata =  {id: item.id,x: orgX + dx, y: orgY + dy};
                if (validate_id(movedata) && validate_position(movedata.x, movedata.y)) {
		  socket.json.emit('update', movedata);
                  item.style.left = ( orgX + dx ) + "px";
                  item.style.top = ( orgY + dy ) + "px";
                }
	}

	function mouseup (){
       		slidesClass.removeEventListener("mousemove", mousemove, false);
	}

}

function reEdit (evt, oDiv) {
	//ダブルクリックで再編集
        reconnectSocket();

	var str = oDiv.lastChild.innerHTML;
	str = escapeHTML(str);

	oDiv.removeChild(oDiv.firstChild);
	oDiv.removeChild(oDiv.firstChild);

	oDiv.ondblclick = function (){};
	slidesClass.removeEventListener("dblclick", addLabel, false);
	oDiv.onmousedown = function(){};

	//フォームを用意し、既に書いてあるテキストを代入
	var inputForm = document.createElement("FORM");

	var inputText = document.createElement("TEXTAREA");
	inputText.style.cols = "10";
	inputText.style.rows = "3";
	str = str.replace(/<br\b\/>|<br>/g, "\n");
	inputText.value = str;	
	inputForm.appendChild(inputText);

	var okButton = document.createElement("INPUT");
	okButton.type = "button";
	okButton.value = "ok";
	okButton.onclick = function () { writeText() };
	inputForm.appendChild(okButton);

	//OKされると内容を表示
	var writeText = function () {
		
		var labelText = document.createElement("SPAN");
		var str = inputText.value;
		str = str.replace(/(\n|\r)+/g, "<br />");
		labelText.innerHTML = str;
		oDiv.appendChild(labelText);

		oDiv.removeChild(inputForm);
		var editdata = {id: oDiv.id, message: str};
                if (validate_id(editdata) && validate_message(editdata)) {
                  socket.json.emit('text edit', editdata);
                }

		oDiv.onmousedown = function (evt) { onDrag(evt, this) };
		oDiv.ondblclick = function (evt) { reEdit(evt,this); return false };

		slidesClass.addEventListener("dblclick", addLabel, false);
                document.addEventListener('keydown', handleBodyKeyDown, false);

	}

	//編集をキャンセルした場合の処理
	var cancelButton = document.createElement("INPUT");
	cancelButton.type = "button";
	cancelButton.value = "x";
	cancelButton.onclick = function () {
		var xButton = document.createElement("A");
		xButton.href = "#";
		xButton.innerHTML = "[x]";
		xButton.onclick = function () {
			labelDelete(newLabel.id);
			return false;
		}
		oDiv.appendChild(xButton);

		var labelText = document.createElement("SPAN");
		labelText.innerHTML = str;
		oDiv.appendChild(labelText);

		oDiv.removeChild(inputForm);

		oDiv.onmousedown = function (evt) { onDrag(evt, this) };
		oDiv.ondblclick = function (evt) { reEdit(evt,this) ; return false;};

		slidesClass.addEventListener("dblclick", addLabel, false);
		document.addEventListener('keydown', handleBodyKeyDown, false);
	};
	inputForm.appendChild(cancelButton);

	//上記内容をAppend
	oDiv.appendChild(inputForm);

	inputText.focus();
}
function labelLoad (data) {
	//ラベルのロード

	var newLabel = document.createElement("DIV");
        if (idArray.indexOf(data._id) < 0) {
	newLabel.className = "label";
	newLabel.id = data._id;
        idArray.push(data._id);
	newLabel.style.left = data.x + "px";
	newLabel.style.top = data.y + "px";
	document.getElementsByClassName("slide")[data.slideno].appendChild(newLabel);


	var xButton = document.createElement("A");
	xButton.href = "#";
	xButton.innerHTML = "[x]";
	xButton.onclick = function(){
		labelDelete(newLabel.id);
		return false;
	}
	newLabel.appendChild(xButton);

	var labelText = document.createElement("SPAN");
	labelText.innerHTML = data.message;
	newLabel.appendChild(labelText);

	newLabel.onmousedown = function(evt){
		onDrag(evt, this)
	};
	newLabel.ondblclick = function(evt){
		reEdit(evt, this);
		return false;
	};
        }
}

function getSlideId() {
  var url = location.href;

  var start = url.lastIndexOf('/')+1;
  var end = url.indexOf('#');
  if (start < end) {
    var slideId = url.substring(start, end);
    console.log(slideId);
    return slideId;
  } else {
    return 'default';
  }
}

function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}


function labelDelete(id) {
        reconnectSocket();

        var deletedata = {id: id};
        if (validate_id(deletedata)) {
          socket.json.emit('delete', deletedata);
        }
}

function labelSave () {
	//ラベルのセーブ

}
function showAll() {
  reconnectSocket();

  var labels = document.getElementsByClassName("label");
  console.log(labels);
  for (var i=0; i<labels.length; i++) {
    console.log(labels[i]);
    labels[i].style.display='';
  }
}
function hideAll() {
  reconnectSocket();

  var labels = document.getElementsByClassName("label");
  console.log(labels.length);
  for (var i=0; i<labels.length; i++) {
    console.log(labels[i]);
    labels[i].style.display='none';
  }
}


