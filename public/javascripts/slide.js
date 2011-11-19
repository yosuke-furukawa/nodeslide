 var currentSlideNo = getCurrentSlide();
 var slides = document.getElementsByClassName('slide');

 var spaces = /\s+/, a1 = [""];

 var str2array = function(s) {
 if (typeof s == "string" || s instanceof String) {
 if (s.indexOf(" ") < 0) {
 a1[0] = s;
 return a1;
 } else {
 return s.split(spaces);
 }
 }
 return s;
 };

 var trim = function(str) {
 return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
 };

 var addClass = function(node, classStr) {
	 classStr = str2array(classStr);
	 var cls = " " + node.className + " ";
	 for (var i = 0, len = classStr.length, c; i < len; ++i) {
		 c = classStr[i];
		 if (c && cls.indexOf(" " + c + " ") < 0) {
			 cls += c + " ";
		 }
	 }
	 node.className = trim(cls);
 };

 var removeClass = function(node, classStr) {
	 var cls;
	 if (classStr !== undefined) {
		 classStr = str2array(classStr);
		 cls = " " + node.className + " ";
		 for (var i = 0, len = classStr.length; i < len; ++i) {
			 cls = cls.replace(" " + classStr[i] + " ", " ");
		 }
		 cls = trim(cls);
	 } else {
		 cls = "";
	 }
	 if (node.className != cls) {
		 node.className = cls;
	 }
 };

 var getSlideEl = function(slideNo) {
	 if (slideNo > 0) {
		 return slides[slideNo - 1];
	 } else {
		 return null;
	 }
 };

 var changeSlideElClass = function(slideNo, className) {
	 var el = getSlideEl(slideNo);

	 if (el) {
		 removeClass(el, 'far-past past current future far-future');
		 addClass(el, className);
	 }
 };

 var updateSlideClasses = function() {
	 window.location.hash = "slide" + currentSlideNo;
	 changeSlideElClass(currentSlideNo - 2, 'far-past');
	 changeSlideElClass(currentSlideNo - 1, 'past');
	 changeSlideElClass(currentSlideNo, 'current');
	 changeSlideElClass(currentSlideNo + 1, 'future');
	 changeSlideElClass(currentSlideNo + 2, 'far-future');
 };

 var nextSlide = function() {
	 if (currentSlideNo < slides.length) {
		 currentSlideNo++;
	 }
	 updateSlideClasses();
 };

 var prevSlide = function() {
	 if (currentSlideNo > 1) {
		 currentSlideNo--;
	 }
	 updateSlideClasses();
 };

 var handleBodyKeyDown = function(event) {
	 switch (event.keyCode) {
		 case 37: // left arrow
			 prevSlide();
			 break;
		 case 39: // right arrow
			 nextSlide();
			 break;
	 }
 };

 function getCurrentSlide() {
  var url = location.href;

  var start = url.lastIndexOf('#slide');
  if (start >= 0) {
  var slideNum = url.substring(start+6);
    console.log(slideNum);
    return slideNum;
  } else {
    return 1;
  }
 }



