/**
 * @file JavaScript tree view
 * @see [Example]{@link http://example.com}
 * @author Mazius <ivanmaciagalan@gmail.com>
 * @version 0.1
 */


/** @global object constructor function of trees */
this.Tree = (function($) {
  'use strict';

    //private vars
    var
       /**
        * Store flags.
        * @type {Object}
        */
        flags = {
          flag1: true
        };

   /**
    * Create new instance of a Tree.
    *
    * @class Represents a Window.
    *
    * @param {Object} options - Options to setup the tree.
    *
    */
    function Tree(options) {

     /**
      * Store reference to current tree.
      * @type {Object}
      */
      var self = this;

      this.treeId = options.id;

      this.treeObj = $(options.id);

      this.eventsHandlers = [];

      this.onClick = options.onClick || null;
      this.onDblClick = options.onDblClick || null;

      this.onOpenSubtree  = options.onOpenSubtree  || _defaultCallback;
      this.onCloseSubtree = options.onCloseSubtree || _defaultCallback;

      this.addRoot = !!options.addRoot;

      this.linkRoot = options.linkRoot || '#';

      this.idRoot = options.idRoot || 'root';
	  
	  this.classRoot = options.classRoot || '';

      this.classItem = options.classItem || 'tree-item';
  
      _initialize.call(this);

    }

    /**
     * Detach event handlers and destroy the tree.
     *
     * @public
     * @see {@link https://auth0.com/blog/four-types-of-leaks-in-your-javascript-code-and-how-to-get-rid-of-them/}
     *
     */
    Tree.prototype.destroyTree = function() { // Repasar fugues

      for(var i = 0; i < this.eventsHandlers.length; i++) { // avoiding cyclic references

         var element = Utils.isjQueryObject(this.eventsHandlers[i].element)
           ? this.eventsHandlers[i].element[0]
           : this.eventsHandlers[i].element;

         Utils.detachEvent(element, this.eventsHandlers[i].eventType, this.eventsHandlers[i].handlerFunction);

         this.eventsHandlers[i].element = null;
         this.eventsHandlers[i].handlerFunction = null;

         delete this.eventsHandlers[i];

       }

       this.treeObj.remove();

      // hem d'esborrar qualsevol referencia
      // 1- Esborrem tots els events que hem determinar - dettach events


      /* this.treeObj.off('click dblclick');

      this.treeObj.remove(); */

    };

    /**
     * Move subtree to a new parent
     *
     * @public
     *
     * @param {Object} _old - parent of the subtree to move
     * @param {Object} _new - new parent.
     *
     */
    Tree.prototype.moveSubTree = function(_old, _new) { // idParent : afegeix un element al final segons un idParent

      /**
       * Store subtree.
       * @type {string}
       */
      var subTree = this.getSubTree(_old);

      this.removeSubTree(_old);

      this.addSubTree(_new, subTree, true);

    };

   /**
    * Remove subtree
    *
    * @public
    *
    * @param {Object|String} element - element or id of the element to remove
    *
    */
    Tree.prototype.removeSubTree = function(element) {

       if(typeof element === 'string') { // es un id
         element = document.getElementById(element);
       }

       $(element).children().remove();

       this.removeElement(element);

     };

     /**
    * Remove children of an element
    *
    * @public
    *
    * @param {Object|String} element - element or id of the element to remove children from
    *
    */
    Tree.prototype.removeSubTreeChildren = function(element) {

       if(typeof element === 'string') { // es un id
         element = document.getElementById(element);
       }

       var children = this.getSubTreeChildren(element);

       for(var i in children) {
         this.removeElement(children[i].id);
       }
	   
	   // delete children list
	   $(element).children('ul').remove();   
	   $(element)
        .removeClass('open')
        .children('.has-children')
          .remove();

     };

     /**
     * Set has children flag
     *
     * @public
     *
     * @param {Object|String} element - element or id of the element to check
     *
     * @returns {void}
     *
     */
     Tree.prototype.setHasChildren = function(element) { // determina si un node te fills

       if(typeof element === 'string') { // es un id
         element = document.getElementById(element);
       }
	   
	   $(element).prepend(_openCloseControl());

     };


    /**
     * Check if element has children
     *
     * @public
     *
     * @param {Object|String} element - element or id of the element to check
     *
     * @returns {Boolean} - returns true if the specified element has children, otherwise false.
     *
     */
     Tree.prototype.hasChildren = function(element) { // determina si un node te fills

       if(typeof element === 'string') { // es un id
         element = document.getElementById(element);
       }

       //var ulChild = $(' > ul', element);
       var ulChild = $(element).children('ul');

       // there is list which is not empty
       return ulChild.length > 0 && $(ulChild).children('li').length != 0;

     };
	 
	 /**
     * Get the parent id of an element
     *
     * @public
     *
     * @param {Object|String} element - element or id of the element
     *
     * @returns {Atring} - returns the id of the parent.
     *
     */
     Tree.prototype.getParent = function(element) { // determina si un node te fills
	   
       if(typeof element === 'string') { // es un id
         element = document.getElementById(element);
       }

       var parent = $(element).parent().closest('.' + this.classItem);
	   
	   if(parent.length > 0)
	     return parent[0].id;
 
       return null;

     };

     /**
     * Get subtree as an object
     *
     * @public
     *
     * @param {Object|String} element - parent element or id of the parent element
     * @param {number} level - current level
     *
     * @returns {Object} - object representation of the subtree.
     *
     */
     Tree.prototype.getSubTree = function(element, level) {

          if(typeof element === 'string') {
            element = document.getElementById(element);
          }

          var subTree = [],
              ulList = $(element).children('ul'),
              self = this,
              liList = null;

          if(ulList.length == 0) {  // si no te fills retorna nomes element

            subTree.push(self.getElementObject(element.id));

            return subTree;

          } else {

            if(!level) { // si es l'element en si
              liList = $(element);
              level = 0;
            } else {
              liList = ulList.children('li');
            }

            liList.each(function() {

              var currentObj = self.getElementObject(this.id),
                  childrenSubTree = self.getSubTree(this, ++level);

              if(childrenSubTree) {
                currentObj.children = childrenSubTree;
              }

              subTree.push(currentObj);

            });

            return subTree;

          }

      };

     /**
     * Get children of an element and return as an object
     *
     * @public
     *
     * @param {Object|String} element - parent element or id of the parent element
     *
     * @returns {Object} - object representation of the subtree.
     *
     */
     Tree.prototype.getSubTreeChildren = function(element) {

          if(typeof element === 'string') {
            element = document.getElementById(element);
          }

          var children = [],
              ulList = $(element).children('ul'),
              self = this,
              liList = null;


          liList = ulList.children('li');

		  liList.each(function() {

		    var currentObj = self.getElementObject(this.id);

			children.push(currentObj);

		  });

		  return children;

      };

      /*
       var subTree = [
       {
         id: 'id_nou1',
         label: 'label_nou1',
         children: [
         {
           id: 'id_nou-sub',
           label: 'label_nou-sub',
         },
         {
           id: 'id_nou-sub2',
           label: 'label_nou-sub2',
         }]
       },
       {
         id: 'id_nou2',
         label: 'label_nou2'
       }];
      */


     /**
      * Add child elements to a given parent
      *
      * @public
      *
      * @param {Object|String} parent - new parent of the elements
      * @param {Object} elements - child elements  to add
      * @param {boolean} append - Set if elements are appended to parent
      *
      */
      Tree.prototype.addSubTree = function(parent, elements, append) { // idParent : afegeix un element al final segons un idParent

        if(typeof parent === 'string') {
          parent = document.getElementById(parent);
        }

        for(var i = 0; i < elements.length; i++) {

          this.addElement(parent, elements[i], append);

          if(elements[i].children) {
            this.addSubTree(document.getElementById(elements[i].id), elements[i].children, append);
          }

        }

      };


      /* {id: 'id_nou', label: 'label_nou', , href: 'label_nou'} */
      /**
       * Get node as an object given the id
       *
       * @public
       *
       * @param {String} idElement - id of the node
       *
       * @returns {Object} - object representation of a node.
       *
       */
      Tree.prototype.getElementObject = function(idElement) { // d'un node creem l'objecte

         var element = $("#" + idElement),
             anchor = element.children('a');

         return {
           id: element[0].id,
           label: anchor.contents().filter(function() {
             return this.nodeType === 3;
           }).text(),
           href: anchor[0].href || '#'
         }; // inmediate child node text

      };


      /* {id: 'id_nou', label: 'label_nou', href: 'href_nou'} */

      /**
       * Add node to a given parent
       *
       * @public
       *
       * @param {Object} parent - parent to add node to
       * @param {Object} elementOptions - options
       * @param {boolean} append - Set if node will be appended
       *
       */
      Tree.prototype.addElement = function(parent, elementOptions, append) { // idParent : afegeix un element al final segons un idParent


         //console.log(parent[0])

         var ulList = parent.getElementsByTagName('ul');

         if(ulList.length == 0) { // si no te fills

           ulList = document.createElement('ul');
           parent.appendChild(ulList);

           //parent.prepend(_openCloseControl()); // no hi ha children llavors posa control

           parent.insertBefore(_openCloseControl(true), parent.childNodes[0]);

         } else {
           ulList = ulList[0];
         }

         var liElement = document.createElement('li'),
             aElement = document.createElement('a');

         liElement.setAttribute('id', elementOptions.id);
		 
		 liElement.setAttribute('class', this.classItem);
		 
		 

         aElement.innerHTML = elementOptions.label;

         aElement.setAttribute('href', elementOptions.href || '#');
		 
		 aElement.setAttribute('class', this.classItem + '-label');

         liElement.appendChild(aElement);

         /* $('<li></li>', {
                         id: elementOptions.id,
                         text: elementOptions.label
                     }); */


         if(elementOptions.id != null) { // the node will not be created but generates empty ul list

           if(append) {
             ulList.appendChild(liElement);
           } else {
             ulList.insertBefore(liElement, ulList.childNodes[0]);
           }

         }

         return;
      };

      /**
       * Append to a given parent
       *
       * @public
       *
       * @param {String} idParent - parent to add node to
       * @param {Object} element - node to append to the given parent
       *
       */
      Tree.prototype.appendElement = function(idParent, element) { // idParent : afegeix un element al final segons un idParent

         this.addElement(idParent, element, true);

      };

      /**
       * Prepend element to a given parent
       *
       * @public
       *
       * @param {String} idParent - parent to add node to
       * @param {Object} element - node to prepend to the given parent
       *
       */
      Tree.prototype.prependElement = function(idParent, element) { // idParent : afegeix un element al final segons un idParent

         this.addElement(idParent, element, false);

      };

      /**
       * Remove element from tree
       *
       * @public
       *
       * @param {Object|String} element - node or id of the node to remove
       *
       */
      Tree.prototype.removeElement = function(element) {

         if(typeof element === 'object') {
           element = element.id;
         }

         element = $("#" + element);

         var parent = element.parent();

         element.remove();

         // sino te germans hem desborrar l'ul i modificar pare ja que no te fills
         if(parent.children('li').length == 0) {
           parent.parent()
             .removeClass('open')
             .children('.has-children')
               .remove();
           parent.remove();
         }

      };

    /**
     * Set element as selected
     *
     * @public
     *
     * @param {String} idElement - id of the node to select
     * @param {Boolean} keepSelecteds - keep the state of selected nodes
     * @param {Boolean} dontOpenPath - don't open the path from root to the new selected element
     *
     */
    Tree.prototype.selectElement = function(idElement, keepSelecteds, dontOpenPath) { // idParent : afegeix un element al final segons un idParent

       if(!keepSelecteds) { // no desecciona els que estan seleccionat
         this.treeObj.find('.' + this.classItem + '.selected').removeClass('selected open');
       }

       $("#" + idElement).addClass('selected');

       if(!dontOpenPath) { // no obre el path
         this.openPathSelected();
       }

         // S'ha de mirar si al remoure queden fills a parent i fer les accions pertinents

     };


     /* obre tots els items pares del selected */
    /**
     * Open path to root from all selected node
     *
     * @public
     *
     */
     Tree.prototype.openPathSelected = function() { // idParent : afegeix un element al final segons un idParent

       $('.selected').addClass('open').parents(this.treeId + ' li').addClass('open selected');

     };

    /**
     * Open path from a given node to root
     *
     * @public
     *
     * @param {String} idElement - id of the given node
     *
     */
     Tree.prototype.openPathById = function(idElement) { // idParent : afegeix un element al final segons un idParent

       $("#" + idElement).addClass('open').parents(this.treeId + ' li').addClass('open selected');

     };

    /**
     * Open nodes by their ids
     *
     * @public
     *
     * @param {String} ids - set of ids of nodes to open
     *
     */
     Tree.prototype.openElements = function(ids) {

        ids = '#' + ids.replace(' ', '').split(',').join(',#');

        var el = $(ids).has('.has-children').addClass('open');

     };

    /**
     * Open all nodes
     *
     * @public
     *
     */
     Tree.prototype.expandTree = function() {
        $(".has-children").parent().addClass('open');
     };

    /**
     * Close all nodes
     *
     * @public
     *
     */
     Tree.prototype.colapseTree = function() {
        $(".has-children").parent().removeClass('open');
     };

    return Tree;

    /**
     * Initialize the tree. Set up tree and set events
     *
     * @private
     *
     */
    function _initialize() {


       if(this.addRoot) {
         this.treeObj.html('<li id="' + this.idRoot + '" class="' + this.classRoot + '" ><a href="' + this.linkRoot + '">ROOT</a><ul>' + this.treeObj.html() + '</ul>');
       }
	   
	   var self = this;

       this.treeObj.find('li').each(function() {

         var item = $(this);

         if(item.find('ul').length > 0) {
           item.prepend(_openCloseControl());
         }

         item.addClass(self.classItem);

       });



       _setEvents.call(this);

    }

    /**
     * Set default callback
     *
     * @private
     *
     */
    function _defaultCallback(evt, element) {
     console.log(evt, element);
    }

    /**
     * Create and return html of open close control
     *
     * @private
     *
     * @returns {Object} - returns jQuery dom element
     *
     */
    function _openCloseControl(domObject) {
      var control = $('<span class="has-children"></span>');
      return (domObject) ? control[0] : control;
    }

   /**
    * Set tree events
    *
    * @private
    *
    *
    */
    function _setEvents() {

     var self = this;

     var handler;

     Utils.attachEvent(this.treeObj[0], 'click', handler = function(evt) {

       //if (!event.target.matches(‘input’)) return

       //if(e.target && e.target.nodeName == "LI") {
         // List item found!  Output the ID!
       //console.log("List item ", e.target.id.replace("post-", ""), " was clicked!");
       //}

       if (evt.target && evt.target.matches('.has-children')) {

          var element = $(evt.target).parent();

          var hasClassOpen = element.hasClass('open');

          element.toggleClass('open');

          hasClassOpen ? self.onCloseSubtree(evt, element[0]) : self.onOpenSubtree(evt, element[0]);

       }


       return false;

     });

     this.eventsHandlers.push({element: this.treeObj[0], handlerFunction: handler, eventType: 'click'});

     /* this.treeObj.on('click', '.has-children', function(evt) {

       var element = $(this).parent();

       var hasClassOpen = element.hasClass('open');

       element.toggleClass('open');

       hasClassOpen ? self.onCloseSubtree(evt, element[0]) : self.onOpenSubtree(evt, element[0]);

       return false; // avoid default behabior and propagation

     }); */


     Utils.attachEvent(this.treeObj[0], 'click', handler = function(evt) {

       if (evt.target && evt.target.matches('a')) {

           evt.preventDefault();

       }

     });

     this.eventsHandlers.push({element: this.treeObj[0], handlerFunction: handler, eventType: 'click'});


     Utils.attachEvent(this.treeObj[0], 'dblclick', handler = function(evt) {

       if (evt.target && evt.target.matches('a')) {

           evt.preventDefault();

       }

     });

     this.eventsHandlers.push({element: this.treeObj[0], handlerFunction: handler, eventType: 'dblclick'});



     /* this.treeObj.on('click dblclick', 'a', function(evt) {

       evt.preventDefault();

     }); */

     if(this.onClick) {

       Utils.attachEvent(this.treeObj[0], 'click', handler = function(evt) {

         if (evt.target && evt.target.matches('a')) {

           var element = $(evt.target).parent();

           self.onClick(evt, element[0]);

           return false; // avoid default behabior and propagation

         }

       });

       this.eventsHandlers.push({element: this.treeObj[0], handlerFunction: handler, eventType: 'click'});


       /* this.treeObj.on('click', 'a', function(evt) {

         self.onClick(evt, this);

         return false; // avoid default behabior and propagation

       }); */

     }

     if(this.onDblClick) {


       Utils.attachEvent(this.treeObj[0], 'dblclick', handler = function(evt) {

         if (evt.target && evt.target.matches('a')) {

           evt.preventDefault();

           var element = $(evt.target).parent();

           self.onDblClick(evt, element[0]);

           return false; // avoid default behabior and propagation

         }

       });

       this.eventsHandlers.push({element: this.treeObj[0], handlerFunction: handler, eventType: 'dblclick'});


       /* this.treeObj.on('dblclick', 'a', function(evt) {

         evt.preventDefault();

         self.onDblClick(evt, this);

         return false; // avoid default behabior and propagation

       }); */

     }

    }


})(jQuery);



