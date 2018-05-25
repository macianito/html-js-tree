    ///////////// FUNCIO MEVA BONA /////////////

/* Utils = {
  attachEvent: function(ele, type, fn) { // bindEvent
    if(ele.attachEvent) {
      ele.attachEvent && ele.attachEvent('on' + type, fn);
    } else {
      ele.addEventListener(type, fn, false);
    }
  },
  detachEvent: function(ele, type, fn) { // unbindEvent
    if(ele.detachEvent) {
       ele.detachEvent && ele.detachEvent('on' + type, fn);
    } else {
       ele.removeEventListener(type, fn, false);
    }
  },
  each: function (object, fn) {
    if(object && fn) {
      var l = object.length;
      for (var i = 0; i < l && fn(object[i], i) !== false; i++) {}
    }
  },
  timeToHMS: function (tm) {
     var dt = new Date(tm);
     return dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
  },
  getAbsoluteMousePosition: function(evt) {
     return { x: evt.pageX, y: evt.pageY };
  },
  isjQueryObject: function(element) {
     return (element instanceof $ || element instanceof jQuery);
  }
}; */

///////////// FUNCIO MEVA BONA /////////////

Utils = {
  attachEvent: function(ele, type, fn) { // bindEvent
    if(ele.attachEvent) {
      ele.attachEvent && ele.attachEvent('on' + type, fn);
    } else {
      ele.addEventListener(type, fn, false);
    }
  },
  detachEvent: function(ele, type, fn) { // unbindEvent
    if(ele.detachEvent) {
       ele.detachEvent && ele.detachEvent('on' + type, fn);
    } else {
       ele.removeEventListener(type, fn, false);
    }
  },
  getElementById: function(id) { // unbindEvent
    return document.getElementById(id);
  },
  querySelectorAll: function(selector) { // unbindEvent
    return document.querySelectorAll(selector);
  },
  querySelector: function(selector) { // unbindEvent
    return document.querySelector(selector);
  },
  each: function (object, fn) {
    if(object && fn) {
      var l = object.length;
      for (var i = 0; i < l && fn(object[i], i) !== false; i++) {}
    }
  },
  getAbsoluteMousePosition: function(evt) {
     return { x: evt.pageX, y: evt.pageY };
  },
  /* getBoxElement: function(element) {

      var boxElement = element.getBoundingClientRect();

      return {
        left: boxElement.left,
        top: boxElement.top,
        right: boxElement.right,
        bottom: boxElement.bottom,
        width: boxElement.right - boxElement.left,
        height: boxElement.bottom - boxElement.top
      };
   }, */
   getAbsolutePositionElement: function(el) {
    var box = el.getBoundingClientRect(),

        body = document.body,
        docEl = document.documentElement,

        scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop,
        scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft,

        clientTop = docEl.clientTop || body.clientTop || 0,
        clientLeft = docEl.clientLeft || body.clientLeft || 0,

        top  = box.top +  scrollTop - clientTop,
        left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
  },
  getBoxElement: function(element) {

      var boxElement = element.getBoundingClientRect(),
          positionElement = this.getAbsolutePositionElement(element);

      return {
        left: positionElement.left,
        top: positionElement.top,
        right: boxElement.right,
        bottom: boxElement.bottom,
        width: boxElement.right - boxElement.left,
        height: boxElement.bottom - boxElement.top
      };
   },
   isjQueryObject: function(element) {
     return (element instanceof $ || element instanceof jQuery);
   },
   timeToHMS: function (tm) {
     var dt = new Date(tm);
     return dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
   }
};

// difine alias
Utils.bindEvent = Utils.attachEvent;
Utils.unbindEvent = Utils.detachEvent;

//console.log(Utils);


// DOWNLOADS ///////////

var textFile = null,
    makeTextFile = function (text) {
      var data = new Blob([text], {type: 'text/plain'});

      // If we are replacing a previously generated file we need to
      // manually revoke the object URL to avoid memory leaks.
      if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
      }

      textFile = window.URL.createObjectURL(data);

      return textFile;
    };



function createDownloader() {
  $('<a href="#" download="" style="display:none" id="downloader">download</a>').appendTo('#file-controls');
};

function download(name, content) {

  var downloader = $('#downloader');

  downloader.attr({
    download: name,
    href: makeTextFile(content)
  });

  downloader[0].click();
}

////////////////////////////////////////

jQuery(document).ready(function() {
  createDownloader();
});


//Make an object a string that evaluates to an equivalent object
//  Note that eval() seems tricky and sometimes you have to do
//  something like eval("a = " + yourString), then use the value
//  of a.
//
//  Also this leaves extra commas after everything, but JavaScript
//  ignores them.
function convertToText(obj) {
    //create an array that will later be joined into a string.
    var string = [];

    //is object
    //    Both arrays and objects seem to return "object"
    //    when typeof(obj) is applied to them. So instead
    //    I am checking to see if they have the property
    //    join, which normal objects don't have but
    //    arrays do.
    if (typeof(obj) == "object" && (obj.join == undefined)) {
        string.push("{\n\r");
        for (prop in obj) {
            string.push(prop, ": ", convertToText(obj[prop]), ",\n\r");
        };
        string.pop();
        string.push("}");

    //is array
    } else if (typeof(obj) == "object" && !(obj.join == undefined)) {
        string.push("\n\r[");
        for(prop in obj) {
            string.push(convertToText(obj[prop]), ",");
        }
        string.pop();
        string.push("]");

    //is function
    } else if (typeof(obj) == "function") {
        string.push(obj.toString());

    //all other values can be done with JSON.stringify
    } else {
        string.push(JSON.stringify(obj));
    }

    return string.join("");
}




// http://jsfiddle.net/koldev/cw7w5/
// Downloaddata
/* var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        var json = JSON.stringify(data),
            blob = new Blob([json], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

var data = { x: 42, s: "hello, world", d: new Date() },
    fileName = "my-download.json";
*/
//saveData(data, fileName);



/* Syntax:
   array.insert(index, value1, value2, ..., valueN) */

// http://stackoverflow.com/questions/586182/how-do-i-insert-an-item-into-an-array-at-a-specific-index

Array.prototype.insert = function(index) {
    index = Math.min(index, this.length);
    arguments.length > 1
        && this.splice.apply(this, [index, 0].concat([].pop.call(arguments)))
        && this.insert.apply(this, arguments);
    return this;
};


// http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object
var clone = function() {
    var newObj = (this instanceof Array) ? [] : {};
    for (var i in this) {
        if (this[i] && typeof this[i] == "object") {
            newObj[i] = this[i].clone();
        }
        else
        {
            newObj[i] = this[i];
        }
    }
    return newObj;
};

Object.defineProperty( Object.prototype, "clone", {value: clone, enumerable: false});


