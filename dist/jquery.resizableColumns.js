/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Sun Jun 21 2020 23:53:32 GMT+0500 (Yekaterinburg Standard Time)
 * @version v0.2.3
 * @link https://github.com/aamatveev/jquery-resizable-columns/
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _class = require('./class');

var _class2 = _interopRequireDefault(_class);

var _constants = require('./constants');

$.fn.resizableColumns = function (optionsOrMethod) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	return this.each(function () {
		var $table = $(this);

		var api = $table.data(_constants.DATA_API);
		if (!api) {
			api = new _class2['default']($table, optionsOrMethod);
			$table.data(_constants.DATA_API, api);
		} else if (typeof optionsOrMethod === 'string') {
			var _api;

			return (_api = api)[optionsOrMethod].apply(_api, args);
		}
	});
};

$.resizableColumns = _class2['default'];

},{"./class":2,"./constants":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _constants = require('./constants');

/**
Takes a <table /> element and makes it's columns resizable across both
mobile and desktop clients.

@class ResizableColumns
@param $table {jQuery} jQuery-wrapped <table> element to make resizable
@param options {Object} Configuration object
**/

var ResizableColumns = (function () {
	function ResizableColumns($table, options) {
		_classCallCheck(this, ResizableColumns);

		this.ns = '.rc' + this.count++;

		this.options = $.extend({}, ResizableColumns.defaults, options);

		this.$window = $(window);
		this.$ownerDocument = $($table[0].ownerDocument);
		this.$table = $table;

		this.refreshHeaders();
		this.restoreColumnWidths();
		this.syncHandleWidths();

		this.bindEvents(this.$window, 'resize', this.syncHandleWidths.bind(this));

		if (this.options.start) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE_START, this.options.start);
		}
		if (this.options.resize) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE, this.options.resize);
		}
		if (this.options.stop) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE_STOP, this.options.stop);
		}
	}

	/**
 Refreshes the headers associated with this instances <table/> element and
 generates handles for them. Also assigns percentage widths.
 	@method refreshHeaders
 **/

	_createClass(ResizableColumns, [{
		key: 'refreshHeaders',
		value: function refreshHeaders() {
			// Allow the selector to be both a regular selctor string as well as
			// a dynamic callback
			var selector = this.options.selector;
			if (typeof selector === 'function') {
				selector = selector.call(this, this.$table);
			}

			// Select all table headers
			this.$tableHeaders = this.$table.find(selector);

			// Assign percentage widths first, then create drag handles
			this.assignPercentageWidths();
			this.createHandles();
		}

		/**
  Creates dummy handle elements for all table header columns
  	@method createHandles
  **/
	}, {
		key: 'createHandles',
		value: function createHandles() {
			var _this = this;

			var ref = this.$handleContainer;
			if (ref != null) {
				ref.remove();
			}

			this.$handleContainer = $('<div class=\'' + _constants.CLASS_HANDLE_CONTAINER + '\' />');
			this.$table.before(this.$handleContainer);

			this.$tableHeaders.each(function (i, el) {
				var $current = _this.$tableHeaders.eq(i);
				var $next = _this.$tableHeaders.eq(i + 1);

				if ($next.length === 0 || $current.is(_constants.SELECTOR_UNRESIZABLE) || $next.is(_constants.SELECTOR_UNRESIZABLE)) {
					return;
				}

				var $handle = $('<div class=\'' + _constants.CLASS_HANDLE + '\' />').data(_constants.DATA_TH, $(el)).appendTo(_this.$handleContainer);
			});

			this.bindEvents(this.$handleContainer, ['mousedown', 'touchstart'], '.' + _constants.CLASS_HANDLE, this.onPointerDown.bind(this));
		}

		/**
  Assigns a percentage width to all columns based on their current pixel width(s)
  	@method assignPercentageWidths
  **/
	}, {
		key: 'assignPercentageWidths',
		value: function assignPercentageWidths() {
			var _this2 = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);
				_this2.setWidth($el[0], $el.outerWidth());
			});
		}

		/**
  
  @method syncHandleWidths
  **/
	}, {
		key: 'syncHandleWidths',
		value: function syncHandleWidths() {
			var _this3 = this;

			var $container = this.$handleContainer;

			$container.width(this.$table.width());

			$container.find('.' + _constants.CLASS_HANDLE).each(function (_, el) {
				var $el = $(el);

				var height = _this3.options.resizeFromBody ? _this3.$table.height() : _this3.$table.find('thead').height();

				var left = $el.data(_constants.DATA_TH).outerWidth() + ($el.data(_constants.DATA_TH).offset().left - _this3.$handleContainer.offset().left);

				$el.css({ left: left, height: height });
			});
		}

		/**
  Persists the column widths in localStorage
  	@method saveColumnWidths
  **/
	}, {
		key: 'saveColumnWidths',
		value: function saveColumnWidths() {
			var _this4 = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (_this4.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
					_this4.options.store.set(_this4.generateColumnId($el), _this4.parseWidth(el));
				}
			});
		}

		/**
  Retrieves and sets the column widths from localStorage
  	@method restoreColumnWidths
  **/
	}, {
		key: 'restoreColumnWidths',
		value: function restoreColumnWidths() {
			var _this5 = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (_this5.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
					var width = _this5.options.store.get(_this5.generateColumnId($el));

					if (width != null) {
						_this5.setWidth(el, width);
					}
				}
			});
		}

		/**
  Pointer/mouse down handler
  	@method onPointerDown
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onPointerDown',
		value: function onPointerDown(event) {
			// Only applies to left-click dragging
			if (event.which !== 1) {
				return;
			}

			// If a previous operation is defined, we missed the last mouseup.
			// Probably gobbled up by user mousing out the window then releasing.
			// We'll simulate a pointerup here prior to it
			if (this.operation) {
				this.onPointerUp(event);
			}

			// Ignore non-resizable columns
			var $currentGrip = $(event.currentTarget);
			if ($currentGrip.is(_constants.SELECTOR_UNRESIZABLE)) {
				return;
			}

			var gripIndex = $currentGrip.index();
			var $leftColumn = this.$tableHeaders.eq(gripIndex).not(_constants.SELECTOR_UNRESIZABLE);
			var $rightColumn = this.$tableHeaders.eq(gripIndex + 1).not(_constants.SELECTOR_UNRESIZABLE);

			var leftWidth = this.parseWidth($leftColumn[0]);
			var rightWidth = this.parseWidth($rightColumn[0]);

			this.operation = {
				$leftColumn: $leftColumn, $rightColumn: $rightColumn, $currentGrip: $currentGrip,

				startX: this.getPointerX(event),
				startTableWidth: this.$table.width(),

				widths: {
					left: leftWidth,
					right: rightWidth
				},
				newWidths: {
					left: leftWidth,
					right: rightWidth
				}
			};

			this.bindEvents(this.$ownerDocument, ['mousemove', 'touchmove'], this.onPointerMove.bind(this));
			this.bindEvents(this.$ownerDocument, ['mouseup', 'touchend'], this.onPointerUp.bind(this));

			this.$handleContainer.add(this.$table).addClass(_constants.CLASS_TABLE_RESIZING);

			$leftColumn.add($rightColumn).add($currentGrip).addClass(_constants.CLASS_COLUMN_RESIZING);

			this.triggerEvent(_constants.EVENT_RESIZE_START, [$leftColumn, $rightColumn, leftWidth, rightWidth], event);

			event.preventDefault();
		}

		/**
  Pointer/mouse movement handler
  	@method onPointerMove
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onPointerMove',
		value: function onPointerMove(event) {
			var op = this.operation;
			if (!this.operation) {
				return;
			}

			// Determine the delta change between start and new mouse position, as a percentage of the table width
			var difference = this.getPointerX(event) - op.startX;
			if (difference === 0) {
				return;
			}

			var leftColumn = op.$leftColumn[0];
			var rightColumn = op.$rightColumn[0];
			var widthLeft = undefined,
			    widthRight = undefined,
			    widthTable = undefined;

			if (difference > 0) {
				widthLeft = this.constrainWidth(op.widths.left + difference);
				widthRight = this.constrainWidth(op.widths.right);
				widthTable = this.constrainWidth(op.startTableWidth + difference);
			} else if (difference < 0) {
				widthLeft = this.constrainWidth(op.widths.left + difference);
				widthRight = this.constrainWidth(op.widths.right);
				widthTable = this.constrainWidth(op.startTableWidth + difference);
			}

			if (leftColumn) {
				this.setWidth(leftColumn, widthLeft);
			}
			if (rightColumn) {
				this.setWidth(rightColumn, widthRight);
			}
			if (widthTable) {
				this.$table.css("width", widthTable + "px");
			}

			op.newWidths.left = widthLeft;
			op.newWidths.right = widthRight;
			op.newWidths.table = widthTable;

			return this.triggerEvent(_constants.EVENT_RESIZE, [op.$leftColumn, op.$rightColumn, widthLeft, widthRight], event);
		}

		/**
  Pointer/mouse release handler
  	@method onPointerUp
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onPointerUp',
		value: function onPointerUp(event) {
			var op = this.operation;
			if (!this.operation) {
				return;
			}

			this.unbindEvents(this.$ownerDocument, ['mouseup', 'touchend', 'mousemove', 'touchmove']);

			this.$handleContainer.add(this.$table).removeClass(_constants.CLASS_TABLE_RESIZING);

			op.$leftColumn.add(op.$rightColumn).add(op.$currentGrip).removeClass(_constants.CLASS_COLUMN_RESIZING);

			this.syncHandleWidths();
			this.saveColumnWidths();

			this.operation = null;

			return this.triggerEvent(_constants.EVENT_RESIZE_STOP, [op.$leftColumn, op.$rightColumn, op.newWidths.left, op.newWidths.right], event);
		}

		/**
  Removes all event listeners, data, and added DOM elements. Takes
  the <table/> element back to how it was, and returns it
  	@method destroy
  @return {jQuery} Original jQuery-wrapped <table> element
  **/
	}, {
		key: 'destroy',
		value: function destroy() {
			var $table = this.$table;
			var $handles = this.$handleContainer.find('.' + _constants.CLASS_HANDLE);

			this.unbindEvents(this.$window.add(this.$ownerDocument).add(this.$table).add($handles));

			$handles.removeData(_constants.DATA_TH);
			$table.removeData(_constants.DATA_API);

			this.$handleContainer.remove();
			this.$handleContainer = null;
			this.$tableHeaders = null;
			this.$table = null;

			return $table;
		}

		/**
  Binds given events for this instance to the given target DOMElement
  	@private
  @method bindEvents
  @param target {jQuery} jQuery-wrapped DOMElement to bind events to
  @param events {String|Array} Event name (or array of) to bind
  @param selectorOrCallback {String|Function} Selector string or callback
  @param [callback] {Function} Callback method
  **/
	}, {
		key: 'bindEvents',
		value: function bindEvents($target, events, selectorOrCallback, callback) {
			if (typeof events === 'string') {
				events = events + this.ns;
			} else {
				events = events.join(this.ns + ' ') + this.ns;
			}

			if (arguments.length > 3) {
				$target.on(events, selectorOrCallback, callback);
			} else {
				$target.on(events, selectorOrCallback);
			}
		}

		/**
  Unbinds events specific to this instance from the given target DOMElement
  	@private
  @method unbindEvents
  @param target {jQuery} jQuery-wrapped DOMElement to unbind events from
  @param events {String|Array} Event name (or array of) to unbind
  **/
	}, {
		key: 'unbindEvents',
		value: function unbindEvents($target, events) {
			if (typeof events === 'string') {
				events = events + this.ns;
			} else if (events != null) {
				events = events.join(this.ns + ' ') + this.ns;
			} else {
				events = this.ns;
			}

			$target.off(events);
		}

		/**
  Triggers an event on the <table/> element for a given type with given
  arguments, also setting and allowing access to the originalEvent if
  given. Returns the result of the triggered event.
  	@private
  @method triggerEvent
  @param type {String} Event name
  @param args {Array} Array of arguments to pass through
  @param [originalEvent] If given, is set on the event object
  @return {Mixed} Result of the event trigger action
  **/
	}, {
		key: 'triggerEvent',
		value: function triggerEvent(type, args, originalEvent) {
			var event = $.Event(type);
			if (event.originalEvent) {
				event.originalEvent = $.extend({}, originalEvent);
			}

			return this.$table.trigger(event, [this].concat(args || []));
		}

		/**
  Calculates a unique column ID for a given column DOMElement
  	@private
  @method generateColumnId
  @param $el {jQuery} jQuery-wrapped column element
  @return {String} Column ID
  **/
	}, {
		key: 'generateColumnId',
		value: function generateColumnId($el) {
			return this.$table.data(_constants.DATA_COLUMNS_ID) + '-' + $el.data(_constants.DATA_COLUMN_ID);
		}

		/**
  Parses a given DOMElement's width into a float
  	@private
  @method parseWidth
  @param element {DOMElement} Element to get width of
  @return {Number} Element's width as a float
  **/
	}, {
		key: 'parseWidth',
		value: function parseWidth(element) {
			return element ? parseFloat(element.style.width.replace('px', '')) : 0;
		}

		/**
  Sets the percentage width of a given DOMElement
  	@private
  @method setWidth
  @param element {DOMElement} Element to set width on
  @param width {Number} Width, as a percentage, to set
  **/
	}, {
		key: 'setWidth',
		value: function setWidth(element, width) {
			width = width.toFixed(2);
			width = width > 0 ? width : 0;
			element.style.width = width + 'px';
		}

		/**
  Constrains a given width to the minimum and maximum ranges defined in
  the `minWidth` and `maxWidth` configuration options, respectively.
  	@private
  @method constrainWidth
  @param width {Number} Width to constrain
  @return {Number} Constrained width
  **/
	}, {
		key: 'constrainWidth',
		value: function constrainWidth(width) {
			if (this.options.minWidth != undefined) {
				width = Math.max(this.options.minWidth, width);
			}

			if (this.options.maxWidth != undefined) {
				width = Math.min(this.options.maxWidth, width);
			}

			return width;
		}

		/**
  Given a particular Event object, retrieves the current pointer offset along
  the horizontal direction. Accounts for both regular mouse clicks as well as
  pointer-like systems (mobiles, tablets etc.)
  	@private
  @method getPointerX
  @param event {Object} Event object associated with the interaction
  @return {Number} Horizontal pointer offset
  **/
	}, {
		key: 'getPointerX',
		value: function getPointerX(event) {
			if (event.type.indexOf('touch') === 0) {
				return (event.originalEvent.touches[0] || event.originalEvent.changedTouches[0]).pageX;
			}
			return event.pageX;
		}
	}]);

	return ResizableColumns;
})();

exports['default'] = ResizableColumns;

ResizableColumns.defaults = {
	selector: function selector($table) {
		if ($table.find('thead').length) {
			return _constants.SELECTOR_TH;
		}

		return _constants.SELECTOR_TD;
	},
	store: window.store,
	syncHandlers: true,
	resizeFromBody: true,
	maxWidth: null,
	minWidth: 0.01
};

ResizableColumns.count = 0;
module.exports = exports['default'];

},{"./constants":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var DATA_API = 'resizableColumns';
exports.DATA_API = DATA_API;
var DATA_COLUMNS_ID = 'resizable-columns-id';
exports.DATA_COLUMNS_ID = DATA_COLUMNS_ID;
var DATA_COLUMN_ID = 'resizable-column-id';
exports.DATA_COLUMN_ID = DATA_COLUMN_ID;
var DATA_TH = 'th';

exports.DATA_TH = DATA_TH;
var CLASS_TABLE_RESIZING = 'rc-table-resizing';
exports.CLASS_TABLE_RESIZING = CLASS_TABLE_RESIZING;
var CLASS_COLUMN_RESIZING = 'rc-column-resizing';
exports.CLASS_COLUMN_RESIZING = CLASS_COLUMN_RESIZING;
var CLASS_HANDLE = 'rc-handle';
exports.CLASS_HANDLE = CLASS_HANDLE;
var CLASS_HANDLE_CONTAINER = 'rc-handle-container';

exports.CLASS_HANDLE_CONTAINER = CLASS_HANDLE_CONTAINER;
var EVENT_RESIZE_START = 'column:resize:start';
exports.EVENT_RESIZE_START = EVENT_RESIZE_START;
var EVENT_RESIZE = 'column:resize';
exports.EVENT_RESIZE = EVENT_RESIZE;
var EVENT_RESIZE_STOP = 'column:resize:stop';

exports.EVENT_RESIZE_STOP = EVENT_RESIZE_STOP;
var SELECTOR_TH = 'tr:first > th:visible';
exports.SELECTOR_TH = SELECTOR_TH;
var SELECTOR_TD = 'tr:first > td:visible';
exports.SELECTOR_TD = SELECTOR_TD;
var SELECTOR_UNRESIZABLE = '[data-noresize]';
exports.SELECTOR_UNRESIZABLE = SELECTOR_UNRESIZABLE;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _class = require('./class');

var _class2 = _interopRequireDefault(_class);

var _adapter = require('./adapter');

var _adapter2 = _interopRequireDefault(_adapter);

exports['default'] = _class2['default'];
module.exports = exports['default'];

},{"./adapter":1,"./class":2}]},{},[4])

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHFCQUFVLENBQUM7QUFDaEMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNULE1BQUcsR0FBRyx1QkFBcUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BELFNBQU0sQ0FBQyxJQUFJLHNCQUFXLEdBQUcsQ0FBQyxDQUFDO0dBQzNCLE1BRUksSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7OztBQUM3QyxVQUFPLFFBQUEsR0FBRyxFQUFDLGVBQWUsT0FBQyxPQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0hqQyxhQUFhOzs7Ozs7Ozs7OztJQVVHLGdCQUFnQjtBQUN6QixVQURTLGdCQUFnQixDQUN4QixNQUFNLEVBQUUsT0FBTyxFQUFFO3dCQURULGdCQUFnQjs7QUFFbkMsTUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixNQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGdC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QixDQUFDOzs7Ozs7Ozs7Ozs7cUJDaEJ6QixTQUFTOzs7O3VCQUNsQixXQUFXIiwiZmlsZSI6ImpxdWVyeS5yZXNpemFibGVDb2x1bW5zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgUmVzaXphYmxlQ29sdW1ucyBmcm9tICcuL2NsYXNzJztcbmltcG9ydCB7REFUQV9BUEl9IGZyb20gJy4vY29uc3RhbnRzJztcblxuJC5mbi5yZXNpemFibGVDb2x1bW5zID0gZnVuY3Rpb24ob3B0aW9uc09yTWV0aG9kLCAuLi5hcmdzKSB7XG5cdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0bGV0ICR0YWJsZSA9ICQodGhpcyk7XG5cblx0XHRsZXQgYXBpID0gJHRhYmxlLmRhdGEoREFUQV9BUEkpO1xuXHRcdGlmICghYXBpKSB7XG5cdFx0XHRhcGkgPSBuZXcgUmVzaXphYmxlQ29sdW1ucygkdGFibGUsIG9wdGlvbnNPck1ldGhvZCk7XG5cdFx0XHQkdGFibGUuZGF0YShEQVRBX0FQSSwgYXBpKTtcblx0XHR9XG5cblx0XHRlbHNlIGlmICh0eXBlb2Ygb3B0aW9uc09yTWV0aG9kID09PSAnc3RyaW5nJykge1xuXHRcdFx0cmV0dXJuIGFwaVtvcHRpb25zT3JNZXRob2RdKC4uLmFyZ3MpO1xuXHRcdH1cblx0fSk7XG59O1xuXG4kLnJlc2l6YWJsZUNvbHVtbnMgPSBSZXNpemFibGVDb2x1bW5zO1xuIiwiaW1wb3J0IHtcblx0REFUQV9BUEksXG5cdERBVEFfQ09MVU1OU19JRCxcblx0REFUQV9DT0xVTU5fSUQsXG5cdERBVEFfVEgsXG5cdENMQVNTX1RBQkxFX1JFU0laSU5HLFxuXHRDTEFTU19DT0xVTU5fUkVTSVpJTkcsXG5cdENMQVNTX0hBTkRMRSxcblx0Q0xBU1NfSEFORExFX0NPTlRBSU5FUixcblx0RVZFTlRfUkVTSVpFX1NUQVJULFxuXHRFVkVOVF9SRVNJWkUsXG5cdEVWRU5UX1JFU0laRV9TVE9QLFxuXHRTRUxFQ1RPUl9USCxcblx0U0VMRUNUT1JfVEQsXG5cdFNFTEVDVE9SX1VOUkVTSVpBQkxFXG59XG5mcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qKlxuVGFrZXMgYSA8dGFibGUgLz4gZWxlbWVudCBhbmQgbWFrZXMgaXQncyBjb2x1bW5zIHJlc2l6YWJsZSBhY3Jvc3MgYm90aFxubW9iaWxlIGFuZCBkZXNrdG9wIGNsaWVudHMuXG5cbkBjbGFzcyBSZXNpemFibGVDb2x1bW5zXG5AcGFyYW0gJHRhYmxlIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIDx0YWJsZT4gZWxlbWVudCB0byBtYWtlIHJlc2l6YWJsZVxuQHBhcmFtIG9wdGlvbnMge09iamVjdH0gQ29uZmlndXJhdGlvbiBvYmplY3RcbioqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzaXphYmxlQ29sdW1ucyB7XG5cdGNvbnN0cnVjdG9yKCR0YWJsZSwgb3B0aW9ucykge1xuXHRcdHRoaXMubnMgPSAnLnJjJyArIHRoaXMuY291bnQrKztcblxuXHRcdHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBSZXNpemFibGVDb2x1bW5zLmRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRcdHRoaXMuJHdpbmRvdyA9ICQod2luZG93KTtcblx0XHR0aGlzLiRvd25lckRvY3VtZW50ID0gJCgkdGFibGVbMF0ub3duZXJEb2N1bWVudCk7XG5cdFx0dGhpcy4kdGFibGUgPSAkdGFibGU7XG5cblx0XHR0aGlzLnJlZnJlc2hIZWFkZXJzKCk7XG5cdFx0dGhpcy5yZXN0b3JlQ29sdW1uV2lkdGhzKCk7XG5cdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzKCk7XG5cblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kd2luZG93LCAncmVzaXplJywgdGhpcy5zeW5jSGFuZGxlV2lkdGhzLmJpbmQodGhpcykpO1xuXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdGFydCkge1xuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkVfU1RBUlQsIHRoaXMub3B0aW9ucy5zdGFydCk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLm9wdGlvbnMucmVzaXplKSB7XG5cdFx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kdGFibGUsIEVWRU5UX1JFU0laRSwgdGhpcy5vcHRpb25zLnJlc2l6ZSk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLm9wdGlvbnMuc3RvcCkge1xuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkVfU1RPUCwgdGhpcy5vcHRpb25zLnN0b3ApO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRSZWZyZXNoZXMgdGhlIGhlYWRlcnMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgaW5zdGFuY2VzIDx0YWJsZS8+IGVsZW1lbnQgYW5kXG5cdGdlbmVyYXRlcyBoYW5kbGVzIGZvciB0aGVtLiBBbHNvIGFzc2lnbnMgcGVyY2VudGFnZSB3aWR0aHMuXG5cblx0QG1ldGhvZCByZWZyZXNoSGVhZGVyc1xuXHQqKi9cblx0cmVmcmVzaEhlYWRlcnMoKSB7XG5cdFx0Ly8gQWxsb3cgdGhlIHNlbGVjdG9yIHRvIGJlIGJvdGggYSByZWd1bGFyIHNlbGN0b3Igc3RyaW5nIGFzIHdlbGwgYXNcblx0XHQvLyBhIGR5bmFtaWMgY2FsbGJhY2tcblx0XHRsZXQgc2VsZWN0b3IgPSB0aGlzLm9wdGlvbnMuc2VsZWN0b3I7XG5cdFx0aWYodHlwZW9mIHNlbGVjdG9yID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLmNhbGwodGhpcywgdGhpcy4kdGFibGUpO1xuXHRcdH1cblxuXHRcdC8vIFNlbGVjdCBhbGwgdGFibGUgaGVhZGVyc1xuXHRcdHRoaXMuJHRhYmxlSGVhZGVycyA9IHRoaXMuJHRhYmxlLmZpbmQoc2VsZWN0b3IpO1xuXG5cdFx0Ly8gQXNzaWduIHBlcmNlbnRhZ2Ugd2lkdGhzIGZpcnN0LCB0aGVuIGNyZWF0ZSBkcmFnIGhhbmRsZXNcblx0XHR0aGlzLmFzc2lnblBlcmNlbnRhZ2VXaWR0aHMoKTtcblx0XHR0aGlzLmNyZWF0ZUhhbmRsZXMoKTtcblx0fVxuXG5cdC8qKlxuXHRDcmVhdGVzIGR1bW15IGhhbmRsZSBlbGVtZW50cyBmb3IgYWxsIHRhYmxlIGhlYWRlciBjb2x1bW5zXG5cblx0QG1ldGhvZCBjcmVhdGVIYW5kbGVzXG5cdCoqL1xuXHRjcmVhdGVIYW5kbGVzKCkge1xuXHRcdGxldCByZWYgPSB0aGlzLiRoYW5kbGVDb250YWluZXI7XG5cdFx0aWYgKHJlZiAhPSBudWxsKSB7XG5cdFx0XHRyZWYucmVtb3ZlKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyID0gJChgPGRpdiBjbGFzcz0nJHtDTEFTU19IQU5ETEVfQ09OVEFJTkVSfScgLz5gKVxuXHRcdHRoaXMuJHRhYmxlLmJlZm9yZSh0aGlzLiRoYW5kbGVDb250YWluZXIpO1xuXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKGksIGVsKSA9PiB7XG5cdFx0XHRsZXQgJGN1cnJlbnQgPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoaSk7XG5cdFx0XHRsZXQgJG5leHQgPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoaSArIDEpO1xuXG5cdFx0XHRpZiAoJG5leHQubGVuZ3RoID09PSAwIHx8ICRjdXJyZW50LmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSB8fCAkbmV4dC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgJGhhbmRsZSA9ICQoYDxkaXYgY2xhc3M9JyR7Q0xBU1NfSEFORExFfScgLz5gKVxuXHRcdFx0XHQuZGF0YShEQVRBX1RILCAkKGVsKSlcblx0XHRcdFx0LmFwcGVuZFRvKHRoaXMuJGhhbmRsZUNvbnRhaW5lcik7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kaGFuZGxlQ29udGFpbmVyLCBbJ21vdXNlZG93bicsICd0b3VjaHN0YXJ0J10sICcuJytDTEFTU19IQU5ETEUsIHRoaXMub25Qb2ludGVyRG93bi5iaW5kKHRoaXMpKTtcblx0fVxuXG5cdC8qKlxuXHRBc3NpZ25zIGEgcGVyY2VudGFnZSB3aWR0aCB0byBhbGwgY29sdW1ucyBiYXNlZCBvbiB0aGVpciBjdXJyZW50IHBpeGVsIHdpZHRoKHMpXG5cblx0QG1ldGhvZCBhc3NpZ25QZXJjZW50YWdlV2lkdGhzXG5cdCoqL1xuXHRhc3NpZ25QZXJjZW50YWdlV2lkdGhzKCkge1xuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xuXHRcdFx0dGhpcy5zZXRXaWR0aCgkZWxbMF0sICRlbC5vdXRlcldpZHRoKCkpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cblxuXHRAbWV0aG9kIHN5bmNIYW5kbGVXaWR0aHNcblx0KiovXG5cdHN5bmNIYW5kbGVXaWR0aHMoKSB7XG5cdFx0bGV0ICRjb250YWluZXIgPSB0aGlzLiRoYW5kbGVDb250YWluZXJcblxuXHRcdCRjb250YWluZXIud2lkdGgodGhpcy4kdGFibGUud2lkdGgoKSk7XG5cblx0XHQkY29udGFpbmVyLmZpbmQoJy4nK0NMQVNTX0hBTkRMRSkuZWFjaCgoXywgZWwpID0+IHtcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcblxuXHRcdFx0bGV0IGhlaWdodCA9IHRoaXMub3B0aW9ucy5yZXNpemVGcm9tQm9keSA/XG5cdFx0XHRcdHRoaXMuJHRhYmxlLmhlaWdodCgpIDpcblx0XHRcdFx0dGhpcy4kdGFibGUuZmluZCgndGhlYWQnKS5oZWlnaHQoKTtcblxuXHRcdFx0bGV0IGxlZnQgPSAkZWwuZGF0YShEQVRBX1RIKS5vdXRlcldpZHRoKCkgKyAoXG5cdFx0XHRcdCRlbC5kYXRhKERBVEFfVEgpLm9mZnNldCgpLmxlZnQgLSB0aGlzLiRoYW5kbGVDb250YWluZXIub2Zmc2V0KCkubGVmdFxuXHRcdFx0KTtcblxuXHRcdFx0JGVsLmNzcyh7IGxlZnQsIGhlaWdodCB9KTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHRQZXJzaXN0cyB0aGUgY29sdW1uIHdpZHRocyBpbiBsb2NhbFN0b3JhZ2VcblxuXHRAbWV0aG9kIHNhdmVDb2x1bW5XaWR0aHNcblx0KiovXG5cdHNhdmVDb2x1bW5XaWR0aHMoKSB7XG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XG5cblx0XHRcdGlmICh0aGlzLm9wdGlvbnMuc3RvcmUgJiYgISRlbC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcblx0XHRcdFx0dGhpcy5vcHRpb25zLnN0b3JlLnNldChcblx0XHRcdFx0XHR0aGlzLmdlbmVyYXRlQ29sdW1uSWQoJGVsKSxcblx0XHRcdFx0XHR0aGlzLnBhcnNlV2lkdGgoZWwpXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0UmV0cmlldmVzIGFuZCBzZXRzIHRoZSBjb2x1bW4gd2lkdGhzIGZyb20gbG9jYWxTdG9yYWdlXG5cblx0QG1ldGhvZCByZXN0b3JlQ29sdW1uV2lkdGhzXG5cdCoqL1xuXHRyZXN0b3JlQ29sdW1uV2lkdGhzKCkge1xuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xuXG5cdFx0XHRpZih0aGlzLm9wdGlvbnMuc3RvcmUgJiYgISRlbC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcblx0XHRcdFx0bGV0IHdpZHRoID0gdGhpcy5vcHRpb25zLnN0b3JlLmdldChcblx0XHRcdFx0XHR0aGlzLmdlbmVyYXRlQ29sdW1uSWQoJGVsKVxuXHRcdFx0XHQpO1xuXG5cdFx0XHRcdGlmKHdpZHRoICE9IG51bGwpIHtcblx0XHRcdFx0XHR0aGlzLnNldFdpZHRoKGVsLCB3aWR0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHRQb2ludGVyL21vdXNlIGRvd24gaGFuZGxlclxuXG5cdEBtZXRob2Qgb25Qb2ludGVyRG93blxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cblx0KiovXG5cdG9uUG9pbnRlckRvd24oZXZlbnQpIHtcblx0XHQvLyBPbmx5IGFwcGxpZXMgdG8gbGVmdC1jbGljayBkcmFnZ2luZ1xuXHRcdGlmKGV2ZW50LndoaWNoICE9PSAxKSB7IHJldHVybjsgfVxuXG5cdFx0Ly8gSWYgYSBwcmV2aW91cyBvcGVyYXRpb24gaXMgZGVmaW5lZCwgd2UgbWlzc2VkIHRoZSBsYXN0IG1vdXNldXAuXG5cdFx0Ly8gUHJvYmFibHkgZ29iYmxlZCB1cCBieSB1c2VyIG1vdXNpbmcgb3V0IHRoZSB3aW5kb3cgdGhlbiByZWxlYXNpbmcuXG5cdFx0Ly8gV2UnbGwgc2ltdWxhdGUgYSBwb2ludGVydXAgaGVyZSBwcmlvciB0byBpdFxuXHRcdGlmKHRoaXMub3BlcmF0aW9uKSB7XG5cdFx0XHR0aGlzLm9uUG9pbnRlclVwKGV2ZW50KTtcblx0XHR9XG5cblx0XHQvLyBJZ25vcmUgbm9uLXJlc2l6YWJsZSBjb2x1bW5zXG5cdFx0bGV0ICRjdXJyZW50R3JpcCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCk7XG5cdFx0aWYoJGN1cnJlbnRHcmlwLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBncmlwSW5kZXggPSAkY3VycmVudEdyaXAuaW5kZXgoKTtcblx0XHRsZXQgJGxlZnRDb2x1bW4gPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoZ3JpcEluZGV4KS5ub3QoU0VMRUNUT1JfVU5SRVNJWkFCTEUpO1xuXHRcdGxldCAkcmlnaHRDb2x1bW4gPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoZ3JpcEluZGV4ICsgMSkubm90KFNFTEVDVE9SX1VOUkVTSVpBQkxFKTtcblxuXHRcdGxldCBsZWZ0V2lkdGggPSB0aGlzLnBhcnNlV2lkdGgoJGxlZnRDb2x1bW5bMF0pO1xuXHRcdGxldCByaWdodFdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKCRyaWdodENvbHVtblswXSk7XG5cblx0XHR0aGlzLm9wZXJhdGlvbiA9IHtcblx0XHRcdCRsZWZ0Q29sdW1uLCAkcmlnaHRDb2x1bW4sICRjdXJyZW50R3JpcCxcblxuXHRcdFx0c3RhcnRYOiB0aGlzLmdldFBvaW50ZXJYKGV2ZW50KSxcblx0XHRcdHN0YXJ0VGFibGVXaWR0aDogdGhpcy4kdGFibGUud2lkdGgoKSxcblxuXHRcdFx0d2lkdGhzOiB7XG5cdFx0XHRcdGxlZnQ6IGxlZnRXaWR0aCxcblx0XHRcdFx0cmlnaHQ6IHJpZ2h0V2lkdGhcblx0XHRcdH0sXG5cdFx0XHRuZXdXaWR0aHM6IHtcblx0XHRcdFx0bGVmdDogbGVmdFdpZHRoLFxuXHRcdFx0XHRyaWdodDogcmlnaHRXaWR0aFxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kb3duZXJEb2N1bWVudCwgWydtb3VzZW1vdmUnLCAndG91Y2htb3ZlJ10sIHRoaXMub25Qb2ludGVyTW92ZS5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kb3duZXJEb2N1bWVudCwgWydtb3VzZXVwJywgJ3RvdWNoZW5kJ10sIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSk7XG5cblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXJcblx0XHRcdC5hZGQodGhpcy4kdGFibGUpXG5cdFx0XHQuYWRkQ2xhc3MoQ0xBU1NfVEFCTEVfUkVTSVpJTkcpO1xuXG5cdFx0JGxlZnRDb2x1bW5cblx0XHRcdC5hZGQoJHJpZ2h0Q29sdW1uKVxuXHRcdFx0LmFkZCgkY3VycmVudEdyaXApXG5cdFx0XHQuYWRkQ2xhc3MoQ0xBU1NfQ09MVU1OX1JFU0laSU5HKTtcblxuXHRcdHRoaXMudHJpZ2dlckV2ZW50KEVWRU5UX1JFU0laRV9TVEFSVCwgW1xuXHRcdFx0JGxlZnRDb2x1bW4sICRyaWdodENvbHVtbixcblx0XHRcdGxlZnRXaWR0aCwgcmlnaHRXaWR0aFxuXHRcdF0sXG5cdFx0ZXZlbnQpO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0fVxuXG5cdC8qKlxuXHRQb2ludGVyL21vdXNlIG1vdmVtZW50IGhhbmRsZXJcblxuXHRAbWV0aG9kIG9uUG9pbnRlck1vdmVcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXG5cdCoqL1xuXHRvblBvaW50ZXJNb3ZlKGV2ZW50KSB7XG5cdFx0bGV0IG9wID0gdGhpcy5vcGVyYXRpb247XG5cdFx0aWYoIXRoaXMub3BlcmF0aW9uKSB7IHJldHVybjsgfVxuXG5cdFx0Ly8gRGV0ZXJtaW5lIHRoZSBkZWx0YSBjaGFuZ2UgYmV0d2VlbiBzdGFydCBhbmQgbmV3IG1vdXNlIHBvc2l0aW9uLCBhcyBhIHBlcmNlbnRhZ2Ugb2YgdGhlIHRhYmxlIHdpZHRoXG5cdFx0bGV0IGRpZmZlcmVuY2UgPSAodGhpcy5nZXRQb2ludGVyWChldmVudCkgLSBvcC5zdGFydFgpO1xuXHRcdGlmKGRpZmZlcmVuY2UgPT09IDApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgbGVmdENvbHVtbiA9IG9wLiRsZWZ0Q29sdW1uWzBdO1xuXHRcdGxldCByaWdodENvbHVtbiA9IG9wLiRyaWdodENvbHVtblswXTtcblx0XHRsZXQgd2lkdGhMZWZ0LCB3aWR0aFJpZ2h0LCB3aWR0aFRhYmxlO1xuXG5cdFx0aWYoZGlmZmVyZW5jZSA+IDApIHtcblx0XHRcdHdpZHRoTGVmdCA9IHRoaXMuY29uc3RyYWluV2lkdGgob3Aud2lkdGhzLmxlZnQgKyBkaWZmZXJlbmNlKTtcblx0XHRcdHdpZHRoUmlnaHQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKG9wLndpZHRocy5yaWdodCk7XG5cdFx0XHR3aWR0aFRhYmxlID0gdGhpcy5jb25zdHJhaW5XaWR0aChvcC5zdGFydFRhYmxlV2lkdGggKyBkaWZmZXJlbmNlKTtcblx0XHR9XG5cdFx0ZWxzZSBpZihkaWZmZXJlbmNlIDwgMCkge1xuXHRcdFx0d2lkdGhMZWZ0ID0gdGhpcy5jb25zdHJhaW5XaWR0aChvcC53aWR0aHMubGVmdCArIGRpZmZlcmVuY2UpO1xuXHRcdFx0d2lkdGhSaWdodCA9IHRoaXMuY29uc3RyYWluV2lkdGgob3Aud2lkdGhzLnJpZ2h0KTtcblx0XHRcdHdpZHRoVGFibGUgPSB0aGlzLmNvbnN0cmFpbldpZHRoKG9wLnN0YXJ0VGFibGVXaWR0aCArIGRpZmZlcmVuY2UpO1xuXHRcdH1cblxuXHRcdGlmKGxlZnRDb2x1bW4pIHtcblx0XHRcdHRoaXMuc2V0V2lkdGgobGVmdENvbHVtbiwgd2lkdGhMZWZ0KTtcblx0XHR9XG5cdFx0aWYocmlnaHRDb2x1bW4pIHtcblx0XHRcdHRoaXMuc2V0V2lkdGgocmlnaHRDb2x1bW4sIHdpZHRoUmlnaHQpO1xuXHRcdH1cblx0XHRpZiAod2lkdGhUYWJsZSkge1xuXHRcdFx0dGhpcy4kdGFibGUuY3NzKFwid2lkdGhcIiwgd2lkdGhUYWJsZSArIFwicHhcIik7XG5cdFx0fVxuXG5cdFx0b3AubmV3V2lkdGhzLmxlZnQgPSB3aWR0aExlZnQ7XG5cdFx0b3AubmV3V2lkdGhzLnJpZ2h0ID0gd2lkdGhSaWdodDtcblx0XHRvcC5uZXdXaWR0aHMudGFibGUgPSB3aWR0aFRhYmxlO1xuXG5cdFx0cmV0dXJuIHRoaXMudHJpZ2dlckV2ZW50KEVWRU5UX1JFU0laRSwgW1xuXHRcdFx0b3AuJGxlZnRDb2x1bW4sIG9wLiRyaWdodENvbHVtbixcblx0XHRcdHdpZHRoTGVmdCwgd2lkdGhSaWdodFxuXHRcdF0sXG5cdFx0ZXZlbnQpO1xuXHR9XG5cblx0LyoqXG5cdFBvaW50ZXIvbW91c2UgcmVsZWFzZSBoYW5kbGVyXG5cblx0QG1ldGhvZCBvblBvaW50ZXJVcFxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cblx0KiovXG5cdG9uUG9pbnRlclVwKGV2ZW50KSB7XG5cdFx0bGV0IG9wID0gdGhpcy5vcGVyYXRpb247XG5cdFx0aWYoIXRoaXMub3BlcmF0aW9uKSB7IHJldHVybjsgfVxuXG5cdFx0dGhpcy51bmJpbmRFdmVudHModGhpcy4kb3duZXJEb2N1bWVudCwgWydtb3VzZXVwJywgJ3RvdWNoZW5kJywgJ21vdXNlbW92ZScsICd0b3VjaG1vdmUnXSk7XG5cblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXJcblx0XHRcdC5hZGQodGhpcy4kdGFibGUpXG5cdFx0XHQucmVtb3ZlQ2xhc3MoQ0xBU1NfVEFCTEVfUkVTSVpJTkcpO1xuXG5cdFx0b3AuJGxlZnRDb2x1bW5cblx0XHRcdC5hZGQob3AuJHJpZ2h0Q29sdW1uKVxuXHRcdFx0LmFkZChvcC4kY3VycmVudEdyaXApXG5cdFx0XHQucmVtb3ZlQ2xhc3MoQ0xBU1NfQ09MVU1OX1JFU0laSU5HKTtcblxuXHRcdHRoaXMuc3luY0hhbmRsZVdpZHRocygpO1xuXHRcdHRoaXMuc2F2ZUNvbHVtbldpZHRocygpO1xuXG5cdFx0dGhpcy5vcGVyYXRpb24gPSBudWxsO1xuXG5cdFx0cmV0dXJuIHRoaXMudHJpZ2dlckV2ZW50KEVWRU5UX1JFU0laRV9TVE9QLCBbXG5cdFx0XHRvcC4kbGVmdENvbHVtbiwgb3AuJHJpZ2h0Q29sdW1uLFxuXHRcdFx0b3AubmV3V2lkdGhzLmxlZnQsIG9wLm5ld1dpZHRocy5yaWdodFxuXHRcdF0sXG5cdFx0ZXZlbnQpO1xuXHR9XG5cblx0LyoqXG5cdFJlbW92ZXMgYWxsIGV2ZW50IGxpc3RlbmVycywgZGF0YSwgYW5kIGFkZGVkIERPTSBlbGVtZW50cy4gVGFrZXNcblx0dGhlIDx0YWJsZS8+IGVsZW1lbnQgYmFjayB0byBob3cgaXQgd2FzLCBhbmQgcmV0dXJucyBpdFxuXG5cdEBtZXRob2QgZGVzdHJveVxuXHRAcmV0dXJuIHtqUXVlcnl9IE9yaWdpbmFsIGpRdWVyeS13cmFwcGVkIDx0YWJsZT4gZWxlbWVudFxuXHQqKi9cblx0ZGVzdHJveSgpIHtcblx0XHRsZXQgJHRhYmxlID0gdGhpcy4kdGFibGU7XG5cdFx0bGV0ICRoYW5kbGVzID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyLmZpbmQoJy4nK0NMQVNTX0hBTkRMRSk7XG5cblx0XHR0aGlzLnVuYmluZEV2ZW50cyhcblx0XHRcdHRoaXMuJHdpbmRvd1xuXHRcdFx0XHQuYWRkKHRoaXMuJG93bmVyRG9jdW1lbnQpXG5cdFx0XHRcdC5hZGQodGhpcy4kdGFibGUpXG5cdFx0XHRcdC5hZGQoJGhhbmRsZXMpXG5cdFx0KTtcblxuXHRcdCRoYW5kbGVzLnJlbW92ZURhdGEoREFUQV9USCk7XG5cdFx0JHRhYmxlLnJlbW92ZURhdGEoREFUQV9BUEkpO1xuXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyLnJlbW92ZSgpO1xuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lciA9IG51bGw7XG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzID0gbnVsbDtcblx0XHR0aGlzLiR0YWJsZSA9IG51bGw7XG5cblx0XHRyZXR1cm4gJHRhYmxlO1xuXHR9XG5cblx0LyoqXG5cdEJpbmRzIGdpdmVuIGV2ZW50cyBmb3IgdGhpcyBpbnN0YW5jZSB0byB0aGUgZ2l2ZW4gdGFyZ2V0IERPTUVsZW1lbnRcblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIGJpbmRFdmVudHNcblx0QHBhcmFtIHRhcmdldCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IHRvIGJpbmQgZXZlbnRzIHRvXG5cdEBwYXJhbSBldmVudHMge1N0cmluZ3xBcnJheX0gRXZlbnQgbmFtZSAob3IgYXJyYXkgb2YpIHRvIGJpbmRcblx0QHBhcmFtIHNlbGVjdG9yT3JDYWxsYmFjayB7U3RyaW5nfEZ1bmN0aW9ufSBTZWxlY3RvciBzdHJpbmcgb3IgY2FsbGJhY2tcblx0QHBhcmFtIFtjYWxsYmFja10ge0Z1bmN0aW9ufSBDYWxsYmFjayBtZXRob2Rcblx0KiovXG5cdGJpbmRFdmVudHMoJHRhcmdldCwgZXZlbnRzLCBzZWxlY3Rvck9yQ2FsbGJhY2ssIGNhbGxiYWNrKSB7XG5cdFx0aWYodHlwZW9mIGV2ZW50cyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdGV2ZW50cyA9IGV2ZW50cyArIHRoaXMubnM7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0ZXZlbnRzID0gZXZlbnRzLmpvaW4odGhpcy5ucyArICcgJykgKyB0aGlzLm5zO1xuXHRcdH1cblxuXHRcdGlmKGFyZ3VtZW50cy5sZW5ndGggPiAzKSB7XG5cdFx0XHQkdGFyZ2V0Lm9uKGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrLCBjYWxsYmFjayk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0JHRhcmdldC5vbihldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjayk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdFVuYmluZHMgZXZlbnRzIHNwZWNpZmljIHRvIHRoaXMgaW5zdGFuY2UgZnJvbSB0aGUgZ2l2ZW4gdGFyZ2V0IERPTUVsZW1lbnRcblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIHVuYmluZEV2ZW50c1xuXHRAcGFyYW0gdGFyZ2V0IHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgdG8gdW5iaW5kIGV2ZW50cyBmcm9tXG5cdEBwYXJhbSBldmVudHMge1N0cmluZ3xBcnJheX0gRXZlbnQgbmFtZSAob3IgYXJyYXkgb2YpIHRvIHVuYmluZFxuXHQqKi9cblx0dW5iaW5kRXZlbnRzKCR0YXJnZXQsIGV2ZW50cykge1xuXHRcdGlmKHR5cGVvZiBldmVudHMgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRldmVudHMgPSBldmVudHMgKyB0aGlzLm5zO1xuXHRcdH1cblx0XHRlbHNlIGlmKGV2ZW50cyAhPSBudWxsKSB7XG5cdFx0XHRldmVudHMgPSBldmVudHMuam9pbih0aGlzLm5zICsgJyAnKSArIHRoaXMubnM7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0ZXZlbnRzID0gdGhpcy5ucztcblx0XHR9XG5cblx0XHQkdGFyZ2V0Lm9mZihldmVudHMpO1xuXHR9XG5cblx0LyoqXG5cdFRyaWdnZXJzIGFuIGV2ZW50IG9uIHRoZSA8dGFibGUvPiBlbGVtZW50IGZvciBhIGdpdmVuIHR5cGUgd2l0aCBnaXZlblxuXHRhcmd1bWVudHMsIGFsc28gc2V0dGluZyBhbmQgYWxsb3dpbmcgYWNjZXNzIHRvIHRoZSBvcmlnaW5hbEV2ZW50IGlmXG5cdGdpdmVuLiBSZXR1cm5zIHRoZSByZXN1bHQgb2YgdGhlIHRyaWdnZXJlZCBldmVudC5cblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIHRyaWdnZXJFdmVudFxuXHRAcGFyYW0gdHlwZSB7U3RyaW5nfSBFdmVudCBuYW1lXG5cdEBwYXJhbSBhcmdzIHtBcnJheX0gQXJyYXkgb2YgYXJndW1lbnRzIHRvIHBhc3MgdGhyb3VnaFxuXHRAcGFyYW0gW29yaWdpbmFsRXZlbnRdIElmIGdpdmVuLCBpcyBzZXQgb24gdGhlIGV2ZW50IG9iamVjdFxuXHRAcmV0dXJuIHtNaXhlZH0gUmVzdWx0IG9mIHRoZSBldmVudCB0cmlnZ2VyIGFjdGlvblxuXHQqKi9cblx0dHJpZ2dlckV2ZW50KHR5cGUsIGFyZ3MsIG9yaWdpbmFsRXZlbnQpIHtcblx0XHRsZXQgZXZlbnQgPSAkLkV2ZW50KHR5cGUpO1xuXHRcdGlmKGV2ZW50Lm9yaWdpbmFsRXZlbnQpIHtcblx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQgPSAkLmV4dGVuZCh7fSwgb3JpZ2luYWxFdmVudCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuJHRhYmxlLnRyaWdnZXIoZXZlbnQsIFt0aGlzXS5jb25jYXQoYXJncyB8fCBbXSkpO1xuXHR9XG5cblx0LyoqXG5cdENhbGN1bGF0ZXMgYSB1bmlxdWUgY29sdW1uIElEIGZvciBhIGdpdmVuIGNvbHVtbiBET01FbGVtZW50XG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCBnZW5lcmF0ZUNvbHVtbklkXG5cdEBwYXJhbSAkZWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgY29sdW1uIGVsZW1lbnRcblx0QHJldHVybiB7U3RyaW5nfSBDb2x1bW4gSURcblx0KiovXG5cdGdlbmVyYXRlQ29sdW1uSWQoJGVsKSB7XG5cdFx0cmV0dXJuIHRoaXMuJHRhYmxlLmRhdGEoREFUQV9DT0xVTU5TX0lEKSArICctJyArICRlbC5kYXRhKERBVEFfQ09MVU1OX0lEKTtcblx0fVxuXG5cdC8qKlxuXHRQYXJzZXMgYSBnaXZlbiBET01FbGVtZW50J3Mgd2lkdGggaW50byBhIGZsb2F0XG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCBwYXJzZVdpZHRoXG5cdEBwYXJhbSBlbGVtZW50IHtET01FbGVtZW50fSBFbGVtZW50IHRvIGdldCB3aWR0aCBvZlxuXHRAcmV0dXJuIHtOdW1iZXJ9IEVsZW1lbnQncyB3aWR0aCBhcyBhIGZsb2F0XG5cdCoqL1xuXHRwYXJzZVdpZHRoKGVsZW1lbnQpIHtcblx0XHRyZXR1cm4gZWxlbWVudCA/IHBhcnNlRmxvYXQoZWxlbWVudC5zdHlsZS53aWR0aC5yZXBsYWNlKCdweCcsICcnKSkgOiAwO1xuXHR9XG5cblx0LyoqXG5cdFNldHMgdGhlIHBlcmNlbnRhZ2Ugd2lkdGggb2YgYSBnaXZlbiBET01FbGVtZW50XG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCBzZXRXaWR0aFxuXHRAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBzZXQgd2lkdGggb25cblx0QHBhcmFtIHdpZHRoIHtOdW1iZXJ9IFdpZHRoLCBhcyBhIHBlcmNlbnRhZ2UsIHRvIHNldFxuXHQqKi9cblx0c2V0V2lkdGgoZWxlbWVudCwgd2lkdGgpIHtcblx0XHR3aWR0aCA9IHdpZHRoLnRvRml4ZWQoMik7XG5cdFx0d2lkdGggPSB3aWR0aCA+IDAgPyB3aWR0aCA6IDA7XG5cdFx0ZWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4Jztcblx0fVxuXG5cdC8qKlxuXHRDb25zdHJhaW5zIGEgZ2l2ZW4gd2lkdGggdG8gdGhlIG1pbmltdW0gYW5kIG1heGltdW0gcmFuZ2VzIGRlZmluZWQgaW5cblx0dGhlIGBtaW5XaWR0aGAgYW5kIGBtYXhXaWR0aGAgY29uZmlndXJhdGlvbiBvcHRpb25zLCByZXNwZWN0aXZlbHkuXG5cblx0QHByaXZhdGVcblx0QG1ldGhvZCBjb25zdHJhaW5XaWR0aFxuXHRAcGFyYW0gd2lkdGgge051bWJlcn0gV2lkdGggdG8gY29uc3RyYWluXG5cdEByZXR1cm4ge051bWJlcn0gQ29uc3RyYWluZWQgd2lkdGhcblx0KiovXG5cdGNvbnN0cmFpbldpZHRoKHdpZHRoKSB7XG5cdFx0aWYgKHRoaXMub3B0aW9ucy5taW5XaWR0aCAhPSB1bmRlZmluZWQpIHtcblx0XHRcdHdpZHRoID0gTWF0aC5tYXgodGhpcy5vcHRpb25zLm1pbldpZHRoLCB3aWR0aCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5tYXhXaWR0aCAhPSB1bmRlZmluZWQpIHtcblx0XHRcdHdpZHRoID0gTWF0aC5taW4odGhpcy5vcHRpb25zLm1heFdpZHRoLCB3aWR0aCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHdpZHRoO1xuXHR9XG5cblx0LyoqXG5cdEdpdmVuIGEgcGFydGljdWxhciBFdmVudCBvYmplY3QsIHJldHJpZXZlcyB0aGUgY3VycmVudCBwb2ludGVyIG9mZnNldCBhbG9uZ1xuXHR0aGUgaG9yaXpvbnRhbCBkaXJlY3Rpb24uIEFjY291bnRzIGZvciBib3RoIHJlZ3VsYXIgbW91c2UgY2xpY2tzIGFzIHdlbGwgYXNcblx0cG9pbnRlci1saWtlIHN5c3RlbXMgKG1vYmlsZXMsIHRhYmxldHMgZXRjLilcblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIGdldFBvaW50ZXJYXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxuXHRAcmV0dXJuIHtOdW1iZXJ9IEhvcml6b250YWwgcG9pbnRlciBvZmZzZXRcblx0KiovXG5cdGdldFBvaW50ZXJYKGV2ZW50KSB7XG5cdFx0aWYgKGV2ZW50LnR5cGUuaW5kZXhPZigndG91Y2gnKSA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIChldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0gfHwgZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlc1swXSkucGFnZVg7XG5cdFx0fVxuXHRcdHJldHVybiBldmVudC5wYWdlWDtcblx0fVxufVxuXG5SZXNpemFibGVDb2x1bW5zLmRlZmF1bHRzID0ge1xuXHRzZWxlY3RvcjogZnVuY3Rpb24oJHRhYmxlKSB7XG5cdFx0aWYoJHRhYmxlLmZpbmQoJ3RoZWFkJykubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gU0VMRUNUT1JfVEg7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFNFTEVDVE9SX1REO1xuXHR9LFxuXHRzdG9yZTogd2luZG93LnN0b3JlLFxuXHRzeW5jSGFuZGxlcnM6IHRydWUsXG5cdHJlc2l6ZUZyb21Cb2R5OiB0cnVlLFxuXHRtYXhXaWR0aDogbnVsbCxcblx0bWluV2lkdGg6IDAuMDFcbn07XG5cblJlc2l6YWJsZUNvbHVtbnMuY291bnQgPSAwO1xuIiwiZXhwb3J0IGNvbnN0IERBVEFfQVBJID0gJ3Jlc2l6YWJsZUNvbHVtbnMnO1xuZXhwb3J0IGNvbnN0IERBVEFfQ09MVU1OU19JRCA9ICdyZXNpemFibGUtY29sdW1ucy1pZCc7XG5leHBvcnQgY29uc3QgREFUQV9DT0xVTU5fSUQgPSAncmVzaXphYmxlLWNvbHVtbi1pZCc7XG5leHBvcnQgY29uc3QgREFUQV9USCA9ICd0aCc7XG5cbmV4cG9ydCBjb25zdCBDTEFTU19UQUJMRV9SRVNJWklORyA9ICdyYy10YWJsZS1yZXNpemluZyc7XG5leHBvcnQgY29uc3QgQ0xBU1NfQ09MVU1OX1JFU0laSU5HID0gJ3JjLWNvbHVtbi1yZXNpemluZyc7XG5leHBvcnQgY29uc3QgQ0xBU1NfSEFORExFID0gJ3JjLWhhbmRsZSc7XG5leHBvcnQgY29uc3QgQ0xBU1NfSEFORExFX0NPTlRBSU5FUiA9ICdyYy1oYW5kbGUtY29udGFpbmVyJztcblxuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRV9TVEFSVCA9ICdjb2x1bW46cmVzaXplOnN0YXJ0JztcbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkUgPSAnY29sdW1uOnJlc2l6ZSc7XG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFX1NUT1AgPSAnY29sdW1uOnJlc2l6ZTpzdG9wJztcblxuZXhwb3J0IGNvbnN0IFNFTEVDVE9SX1RIID0gJ3RyOmZpcnN0ID4gdGg6dmlzaWJsZSc7XG5leHBvcnQgY29uc3QgU0VMRUNUT1JfVEQgPSAndHI6Zmlyc3QgPiB0ZDp2aXNpYmxlJztcbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9VTlJFU0laQUJMRSA9IGBbZGF0YS1ub3Jlc2l6ZV1gO1xuIiwiaW1wb3J0IFJlc2l6YWJsZUNvbHVtbnMgZnJvbSAnLi9jbGFzcyc7XG5pbXBvcnQgYWRhcHRlciBmcm9tICcuL2FkYXB0ZXInO1xuXG5leHBvcnQgZGVmYXVsdCBSZXNpemFibGVDb2x1bW5zOyJdLCJwcmVFeGlzdGluZ0NvbW1lbnQiOiIvLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbTV2WkdWZmJXOWtkV3hsY3k5aWNtOTNjMlZ5TFhCaFkyc3ZYM0J5Wld4MVpHVXVhbk1pTENKRE9pOVZjMlZ5Y3k5aFlXMWhkQzl6YjNWeVkyVXZjbVZ3YjNNdmFuRjFaWEo1TFhKbGMybDZZV0pzWlMxamIyeDFiVzV6TDNOeVl5OWhaR0Z3ZEdWeUxtcHpJaXdpUXpvdlZYTmxjbk12WVdGdFlYUXZjMjkxY21ObEwzSmxjRzl6TDJweGRXVnllUzF5WlhOcGVtRmliR1V0WTI5c2RXMXVjeTl6Y21NdlkyeGhjM011YW5NaUxDSkRPaTlWYzJWeWN5OWhZVzFoZEM5emIzVnlZMlV2Y21Wd2IzTXZhbkYxWlhKNUxYSmxjMmw2WVdKc1pTMWpiMngxYlc1ekwzTnlZeTlqYjI1emRHRnVkSE11YW5NaUxDSkRPaTlWYzJWeWN5OWhZVzFoZEM5emIzVnlZMlV2Y21Wd2IzTXZhbkYxWlhKNUxYSmxjMmw2WVdKc1pTMWpiMngxYlc1ekwzTnlZeTlwYm1SbGVDNXFjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVRzN096czdjVUpEUVRaQ0xGTkJRVk03T3pzN2VVSkJRMllzWVVGQllUczdRVUZGY0VNc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eG5Ra0ZCWjBJc1IwRkJSeXhWUVVGVExHVkJRV1VzUlVGQlZ6dHRRMEZCVGl4SlFVRkpPMEZCUVVvc1RVRkJTVHM3TzBGQlEzaEVMRkZCUVU4c1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eFpRVUZYTzBGQlF6TkNMRTFCUVVrc1RVRkJUU3hIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXpzN1FVRkZja0lzVFVGQlNTeEhRVUZITEVkQlFVY3NUVUZCVFN4RFFVRkRMRWxCUVVrc2NVSkJRVlVzUTBGQlF6dEJRVU5vUXl4TlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRk8wRkJRMVFzVFVGQlJ5eEhRVUZITEhWQ1FVRnhRaXhOUVVGTkxFVkJRVVVzWlVGQlpTeERRVUZETEVOQlFVTTdRVUZEY0VRc1UwRkJUU3hEUVVGRExFbEJRVWtzYzBKQlFWY3NSMEZCUnl4RFFVRkRMRU5CUVVNN1IwRkRNMElzVFVGRlNTeEpRVUZKTEU5QlFVOHNaVUZCWlN4TFFVRkxMRkZCUVZFc1JVRkJSVHM3TzBGQlF6ZERMRlZCUVU4c1VVRkJRU3hIUVVGSExFVkJRVU1zWlVGQlpTeFBRVUZETEU5QlFVa3NTVUZCU1N4RFFVRkRMRU5CUVVNN1IwRkRja003UlVGRFJDeERRVUZETEVOQlFVTTdRMEZEU0N4RFFVRkRPenRCUVVWR0xFTkJRVU1zUTBGQlF5eG5Ra0ZCWjBJc2NVSkJRVzFDTEVOQlFVTTdPenM3T3pzN096czdPenM3ZVVKRFNHcERMR0ZCUVdFN096czdPenM3T3pzN08wbEJWVWNzWjBKQlFXZENPMEZCUTNwQ0xGVkJSRk1zWjBKQlFXZENMRU5CUTNoQ0xFMUJRVTBzUlVGQlJTeFBRVUZQTEVWQlFVVTdkMEpCUkZRc1owSkJRV2RDT3p0QlFVVnVReXhOUVVGSkxFTkJRVU1zUlVGQlJTeEhRVUZITEV0QlFVc3NSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03TzBGQlJTOUNMRTFCUVVrc1EwRkJReXhQUVVGUExFZEJRVWNzUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4RlFVRkZMRVZCUVVVc1owSkJRV2RDTEVOQlFVTXNVVUZCVVN4RlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGRE96dEJRVVZvUlN4TlFVRkpMRU5CUVVNc1QwRkJUeXhIUVVGSExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0QlFVTjZRaXhOUVVGSkxFTkJRVU1zWTBGQll5eEhRVUZITEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zWVVGQllTeERRVUZETEVOQlFVTTdRVUZEYWtRc1RVRkJTU3hEUVVGRExFMUJRVTBzUjBGQlJ5eE5RVUZOTEVOQlFVTTdPMEZCUlhKQ0xFMUJRVWtzUTBGQlF5eGpRVUZqTEVWQlFVVXNRMEZCUXp0QlFVTjBRaXhOUVVGSkxFTkJRVU1zYlVKQlFXMUNMRVZCUVVVc1EwRkJRenRCUVVNelFpeE5RVUZKTEVOQlFVTXNaMEpCUVdkQ0xFVkJRVVVzUTBGQlF6czdRVUZGZUVJc1RVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RlFVRkZMRkZCUVZFc1JVRkJSU3hKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdPMEZCUlRGRkxFMUJRVWtzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4TFFVRkxMRVZCUVVVN1FVRkRka0lzVDBGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hwUTBGQmMwSXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dEhRVU55UlR0QlFVTkVMRTFCUVVrc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eE5RVUZOTEVWQlFVVTdRVUZEZUVJc1QwRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN3eVFrRkJaMElzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRIUVVOb1JUdEJRVU5FTEUxQlFVa3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFVkJRVVU3UVVGRGRFSXNUMEZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeG5RMEZCY1VJc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0SFFVTnVSVHRGUVVORU96czdPenM3T3p0alFYcENiVUlzWjBKQlFXZENPenRUUVdsRGRFSXNNRUpCUVVjN096dEJRVWRvUWl4UFFVRkpMRkZCUVZFc1IwRkJSeXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEZGQlFWRXNRMEZCUXp0QlFVTnlReXhQUVVGSExFOUJRVThzVVVGQlVTeExRVUZMTEZWQlFWVXNSVUZCUlR0QlFVTnNReXhaUVVGUkxFZEJRVWNzVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzBsQlF6VkRPenM3UVVGSFJDeFBRVUZKTEVOQlFVTXNZVUZCWVN4SFFVRkhMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPenM3UVVGSGFFUXNUMEZCU1N4RFFVRkRMSE5DUVVGelFpeEZRVUZGTEVOQlFVTTdRVUZET1VJc1QwRkJTU3hEUVVGRExHRkJRV0VzUlVGQlJTeERRVUZETzBkQlEzSkNPenM3T3pzN096dFRRVTlaTEhsQ1FVRkhPenM3UVVGRFppeFBRVUZKTEVkQlFVY3NSMEZCUnl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTTdRVUZEYUVNc1QwRkJTU3hIUVVGSExFbEJRVWtzU1VGQlNTeEZRVUZGTzBGQlEyaENMRTlCUVVjc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF6dEpRVU5pT3p0QlFVVkVMRTlCUVVrc1EwRkJReXhuUWtGQlowSXNSMEZCUnl4RFFVRkRMQ3RFUVVFMlF5eERRVUZCTzBGQlEzUkZMRTlCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eERRVUZET3p0QlFVVXhReXhQUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFVkJRVXM3UVVGRGJFTXNVVUZCU1N4UlFVRlJMRWRCUVVjc1RVRkJTeXhoUVVGaExFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMEZCUTNoRExGRkJRVWtzUzBGQlN5eEhRVUZITEUxQlFVc3NZVUZCWVN4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdPMEZCUlhwRExGRkJRVWtzUzBGQlN5eERRVUZETEUxQlFVMHNTMEZCU3l4RFFVRkRMRWxCUVVrc1VVRkJVU3hEUVVGRExFVkJRVVVzYVVOQlFYTkNMRWxCUVVrc1MwRkJTeXhEUVVGRExFVkJRVVVzYVVOQlFYTkNMRVZCUVVVN1FVRkRPVVlzV1VGQlR6dExRVU5RT3p0QlFVVkVMRkZCUVVrc1QwRkJUeXhIUVVGSExFTkJRVU1zY1VSQlFXMURMRU5CUTJoRUxFbEJRVWtzY1VKQlFWVXNRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRM0JDTEZGQlFWRXNRMEZCUXl4TlFVRkxMR2RDUVVGblFpeERRVUZETEVOQlFVTTdTVUZEYkVNc1EwRkJReXhEUVVGRE96dEJRVVZJTEU5QlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RlFVRkZMRU5CUVVNc1YwRkJWeXhGUVVGRkxGbEJRVmtzUTBGQlF5eEZRVUZGTEVkQlFVY3NNRUpCUVdFc1JVRkJSU3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8wZEJRM0pJT3pzN096czdPenRUUVU5eFFpeHJRMEZCUnpzN08wRkJRM2hDTEU5QlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNSVUZCU3p0QlFVTnNReXhSUVVGSkxFZEJRVWNzUjBGQlJ5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNN1FVRkRhRUlzVjBGQlN5eFJRVUZSTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFZEJRVWNzUTBGQlF5eFZRVUZWTEVWQlFVVXNRMEZCUXl4RFFVRkRPMGxCUTNoRExFTkJRVU1zUTBGQlF6dEhRVU5JT3pzN096czdPenRUUVU5bExEUkNRVUZIT3pzN1FVRkRiRUlzVDBGQlNTeFZRVUZWTEVkQlFVY3NTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZCT3p0QlFVVjBReXhoUVVGVkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU1zUTBGQlF6czdRVUZGZEVNc1lVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITERCQ1FVRmhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RlFVRkxPMEZCUTJwRUxGRkJRVWtzUjBGQlJ5eEhRVUZITEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRenM3UVVGRmFFSXNVVUZCU1N4TlFVRk5MRWRCUVVjc1QwRkJTeXhQUVVGUExFTkJRVU1zWTBGQll5eEhRVU4yUXl4UFFVRkxMRTFCUVUwc1EwRkJReXhOUVVGTkxFVkJRVVVzUjBGRGNFSXNUMEZCU3l4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRPenRCUVVWd1F5eFJRVUZKTEVsQlFVa3NSMEZCUnl4SFFVRkhMRU5CUVVNc1NVRkJTU3h2UWtGQlV5eERRVUZETEZWQlFWVXNSVUZCUlN4SlFVTjRReXhIUVVGSExFTkJRVU1zU1VGQlNTeHZRa0ZCVXl4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRExFbEJRVWtzUjBGQlJ5eFBRVUZMTEdkQ1FVRm5RaXhEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEVsQlFVa3NRMEZCUVN4QlFVTnlSU3hEUVVGRE96dEJRVVZHTEU5QlFVY3NRMEZCUXl4SFFVRkhMRU5CUVVNc1JVRkJSU3hKUVVGSkxFVkJRVW9zU1VGQlNTeEZRVUZGTEUxQlFVMHNSVUZCVGl4TlFVRk5MRVZCUVVVc1EwRkJReXhEUVVGRE8wbEJRekZDTEVOQlFVTXNRMEZCUXp0SFFVTklPenM3T3pzN096dFRRVTlsTERSQ1FVRkhPenM3UVVGRGJFSXNUMEZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RlFVRkxPMEZCUTJ4RExGRkJRVWtzUjBGQlJ5eEhRVUZITEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRenM3UVVGRmFFSXNVVUZCU1N4UFFVRkxMRTlCUVU4c1EwRkJReXhMUVVGTExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlN4cFEwRkJjMElzUlVGQlJUdEJRVU40UkN4WlFVRkxMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVU55UWl4UFFVRkxMR2RDUVVGblFpeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVTXhRaXhQUVVGTExGVkJRVlVzUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZEYmtJc1EwRkJRenRMUVVOR08wbEJRMFFzUTBGQlF5eERRVUZETzBkQlEwZzdPenM3T3pzN08xTkJUMnRDTEN0Q1FVRkhPenM3UVVGRGNrSXNUMEZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RlFVRkxPMEZCUTJ4RExGRkJRVWtzUjBGQlJ5eEhRVUZITEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRenM3UVVGRmFFSXNVVUZCUnl4UFFVRkxMRTlCUVU4c1EwRkJReXhMUVVGTExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlN4cFEwRkJjMElzUlVGQlJUdEJRVU4yUkN4VFFVRkpMRXRCUVVzc1IwRkJSeXhQUVVGTExFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNSMEZCUnl4RFFVTnFReXhQUVVGTExHZENRVUZuUWl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVNeFFpeERRVUZET3p0QlFVVkdMRk5CUVVjc1MwRkJTeXhKUVVGSkxFbEJRVWtzUlVGQlJUdEJRVU5xUWl4aFFVRkxMRkZCUVZFc1EwRkJReXhGUVVGRkxFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTTdUVUZEZWtJN1MwRkRSRHRKUVVORUxFTkJRVU1zUTBGQlF6dEhRVU5JT3pzN096czdPenM3VTBGUldTeDFRa0ZCUXl4TFFVRkxMRVZCUVVVN08wRkJSWEJDTEU5QlFVY3NTMEZCU3l4RFFVRkRMRXRCUVVzc1MwRkJTeXhEUVVGRExFVkJRVVU3UVVGQlJTeFhRVUZQTzBsQlFVVTdPenM3TzBGQlMycERMRTlCUVVjc1NVRkJTU3hEUVVGRExGTkJRVk1zUlVGQlJUdEJRVU5zUWl4UlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzBsQlEzaENPenM3UVVGSFJDeFBRVUZKTEZsQlFWa3NSMEZCUnl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExHRkJRV0VzUTBGQlF5eERRVUZETzBGQlF6RkRMRTlCUVVjc1dVRkJXU3hEUVVGRExFVkJRVVVzYVVOQlFYTkNMRVZCUVVVN1FVRkRla01zVjBGQlR6dEpRVU5RT3p0QlFVVkVMRTlCUVVrc1UwRkJVeXhIUVVGSExGbEJRVmtzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXp0QlFVTnlReXhQUVVGSkxGZEJRVmNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRVZCUVVVc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eEhRVUZITEdsRFFVRnpRaXhEUVVGRE8wRkJRemRGTEU5QlFVa3NXVUZCV1N4SFFVRkhMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zUlVGQlJTeERRVUZETEZOQlFWTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExHbERRVUZ6UWl4RFFVRkRPenRCUVVWc1JpeFBRVUZKTEZOQlFWTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMEZCUTJoRUxFOUJRVWtzVlVGQlZTeEhRVUZITEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1dVRkJXU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdPMEZCUld4RUxFOUJRVWtzUTBGQlF5eFRRVUZUTEVkQlFVYzdRVUZEYUVJc1pVRkJWeXhGUVVGWUxGZEJRVmNzUlVGQlJTeFpRVUZaTEVWQlFWb3NXVUZCV1N4RlFVRkZMRmxCUVZrc1JVRkJXaXhaUVVGWk96dEJRVVYyUXl4VlFVRk5MRVZCUVVVc1NVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF5eExRVUZMTEVOQlFVTTdRVUZETDBJc2JVSkJRV1VzUlVGQlJTeEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRXRCUVVzc1JVRkJSVHM3UVVGRmNFTXNWVUZCVFN4RlFVRkZPMEZCUTFBc1UwRkJTU3hGUVVGRkxGTkJRVk03UVVGRFppeFZRVUZMTEVWQlFVVXNWVUZCVlR0TFFVTnFRanRCUVVORUxHRkJRVk1zUlVGQlJUdEJRVU5XTEZOQlFVa3NSVUZCUlN4VFFVRlRPMEZCUTJZc1ZVRkJTeXhGUVVGRkxGVkJRVlU3UzBGRGFrSTdTVUZEUkN4RFFVRkRPenRCUVVWR0xFOUJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMR05CUVdNc1JVRkJSU3hEUVVGRExGZEJRVmNzUlVGQlJTeFhRVUZYTEVOQlFVTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMEZCUTJoSExFOUJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMR05CUVdNc1JVRkJSU3hEUVVGRExGTkJRVk1zUlVGQlJTeFZRVUZWTEVOQlFVTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPenRCUVVVelJpeFBRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRMjVDTEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRMmhDTEZGQlFWRXNhVU5CUVhOQ0xFTkJRVU03TzBGQlJXcERMR05CUVZjc1EwRkRWQ3hIUVVGSExFTkJRVU1zV1VGQldTeERRVUZETEVOQlEycENMRWRCUVVjc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGRGFrSXNVVUZCVVN4clEwRkJkVUlzUTBGQlF6czdRVUZGYkVNc1QwRkJTU3hEUVVGRExGbEJRVmtzWjBOQlFYRkNMRU5CUTNKRExGZEJRVmNzUlVGQlJTeFpRVUZaTEVWQlEzcENMRk5CUVZNc1JVRkJSU3hWUVVGVkxFTkJRM0pDTEVWQlEwUXNTMEZCU3l4RFFVRkRMRU5CUVVNN08wRkJSVkFzVVVGQlN5eERRVUZETEdOQlFXTXNSVUZCUlN4RFFVRkRPMGRCUTNaQ096czdPenM3T3pzN1UwRlJXU3gxUWtGQlF5eExRVUZMTEVWQlFVVTdRVUZEY0VJc1QwRkJTU3hGUVVGRkxFZEJRVWNzU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXp0QlFVTjRRaXhQUVVGSExFTkJRVU1zU1VGQlNTeERRVUZETEZOQlFWTXNSVUZCUlR0QlFVRkZMRmRCUVU4N1NVRkJSVHM3TzBGQlJ5OUNMRTlCUVVrc1ZVRkJWU3hIUVVGSkxFbEJRVWtzUTBGQlF5eFhRVUZYTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1JVRkJSU3hEUVVGRExFMUJRVTBzUVVGQlF5eERRVUZETzBGQlEzWkVMRTlCUVVjc1ZVRkJWU3hMUVVGTExFTkJRVU1zUlVGQlJUdEJRVU53UWl4WFFVRlBPMGxCUTFBN08wRkJSVVFzVDBGQlNTeFZRVUZWTEVkQlFVY3NSVUZCUlN4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dEJRVU51UXl4UFFVRkpMRmRCUVZjc1IwRkJSeXhGUVVGRkxFTkJRVU1zV1VGQldTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMEZCUTNKRExFOUJRVWtzVTBGQlV5eFpRVUZCTzA5QlFVVXNWVUZCVlN4WlFVRkJPMDlCUVVVc1ZVRkJWU3haUVVGQkxFTkJRVU03TzBGQlJYUkRMRTlCUVVjc1ZVRkJWU3hIUVVGSExFTkJRVU1zUlVGQlJUdEJRVU5zUWl4aFFVRlRMRWRCUVVjc1NVRkJTU3hEUVVGRExHTkJRV01zUTBGQlF5eEZRVUZGTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1IwRkJSeXhWUVVGVkxFTkJRVU1zUTBGQlF6dEJRVU0zUkN4alFVRlZMRWRCUVVjc1NVRkJTU3hEUVVGRExHTkJRV01zUTBGQlF5eEZRVUZGTEVOQlFVTXNUVUZCVFN4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8wRkJRMnhFTEdOQlFWVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1kwRkJZeXhEUVVGRExFVkJRVVVzUTBGQlF5eGxRVUZsTEVkQlFVY3NWVUZCVlN4RFFVRkRMRU5CUVVNN1NVRkRiRVVzVFVGRFNTeEpRVUZITEZWQlFWVXNSMEZCUnl4RFFVRkRMRVZCUVVVN1FVRkRka0lzWVVGQlV5eEhRVUZITEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1JVRkJSU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVkQlFVY3NWVUZCVlN4RFFVRkRMRU5CUVVNN1FVRkROMFFzWTBGQlZTeEhRVUZITEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1JVRkJSU3hEUVVGRExFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0QlFVTnNSQ3hqUVVGVkxFZEJRVWNzU1VGQlNTeERRVUZETEdOQlFXTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1pVRkJaU3hIUVVGSExGVkJRVlVzUTBGQlF5eERRVUZETzBsQlEyeEZPenRCUVVWRUxFOUJRVWNzVlVGQlZTeEZRVUZGTzBGQlEyUXNVVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhWUVVGVkxFVkJRVVVzVTBGQlV5eERRVUZETEVOQlFVTTdTVUZEY2tNN1FVRkRSQ3hQUVVGSExGZEJRVmNzUlVGQlJUdEJRVU5tTEZGQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1YwRkJWeXhGUVVGRkxGVkJRVlVzUTBGQlF5eERRVUZETzBsQlEzWkRPMEZCUTBRc1QwRkJTU3hWUVVGVkxFVkJRVVU3UVVGRFppeFJRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWRCUVVjc1EwRkJReXhQUVVGUExFVkJRVVVzVlVGQlZTeEhRVUZITEVsQlFVa3NRMEZCUXl4RFFVRkRPMGxCUXpWRE96dEJRVVZFTEV0QlFVVXNRMEZCUXl4VFFVRlRMRU5CUVVNc1NVRkJTU3hIUVVGSExGTkJRVk1zUTBGQlF6dEJRVU01UWl4TFFVRkZMRU5CUVVNc1UwRkJVeXhEUVVGRExFdEJRVXNzUjBGQlJ5eFZRVUZWTEVOQlFVTTdRVUZEYUVNc1MwRkJSU3hEUVVGRExGTkJRVk1zUTBGQlF5eExRVUZMTEVkQlFVY3NWVUZCVlN4RFFVRkRPenRCUVVWb1F5eFZRVUZQTEVsQlFVa3NRMEZCUXl4WlFVRlpMREJDUVVGbExFTkJRM1JETEVWQlFVVXNRMEZCUXl4WFFVRlhMRVZCUVVVc1JVRkJSU3hEUVVGRExGbEJRVmtzUlVGREwwSXNVMEZCVXl4RlFVRkZMRlZCUVZVc1EwRkRja0lzUlVGRFJDeExRVUZMTEVOQlFVTXNRMEZCUXp0SFFVTlFPenM3T3pzN096czdVMEZSVlN4eFFrRkJReXhMUVVGTExFVkJRVVU3UVVGRGJFSXNUMEZCU1N4RlFVRkZMRWRCUVVjc1NVRkJTU3hEUVVGRExGTkJRVk1zUTBGQlF6dEJRVU40UWl4UFFVRkhMRU5CUVVNc1NVRkJTU3hEUVVGRExGTkJRVk1zUlVGQlJUdEJRVUZGTEZkQlFVODdTVUZCUlRzN1FVRkZMMElzVDBGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1kwRkJZeXhGUVVGRkxFTkJRVU1zVTBGQlV5eEZRVUZGTEZWQlFWVXNSVUZCUlN4WFFVRlhMRVZCUVVVc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF6czdRVUZGTVVZc1QwRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVTnVRaXhIUVVGSExFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVTm9RaXhYUVVGWExHbERRVUZ6UWl4RFFVRkRPenRCUVVWd1F5eExRVUZGTEVOQlFVTXNWMEZCVnl4RFFVTmFMRWRCUVVjc1EwRkJReXhGUVVGRkxFTkJRVU1zV1VGQldTeERRVUZETEVOQlEzQkNMRWRCUVVjc1EwRkJReXhGUVVGRkxFTkJRVU1zV1VGQldTeERRVUZETEVOQlEzQkNMRmRCUVZjc2EwTkJRWFZDTEVOQlFVTTdPMEZCUlhKRExFOUJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1JVRkJSU3hEUVVGRE8wRkJRM2hDTEU5QlFVa3NRMEZCUXl4blFrRkJaMElzUlVGQlJTeERRVUZET3p0QlFVVjRRaXhQUVVGSkxFTkJRVU1zVTBGQlV5eEhRVUZITEVsQlFVa3NRMEZCUXpzN1FVRkZkRUlzVlVGQlR5eEpRVUZKTEVOQlFVTXNXVUZCV1N3clFrRkJiMElzUTBGRE0wTXNSVUZCUlN4RFFVRkRMRmRCUVZjc1JVRkJSU3hGUVVGRkxFTkJRVU1zV1VGQldTeEZRVU12UWl4RlFVRkZMRU5CUVVNc1UwRkJVeXhEUVVGRExFbEJRVWtzUlVGQlJTeEZRVUZGTEVOQlFVTXNVMEZCVXl4RFFVRkRMRXRCUVVzc1EwRkRja01zUlVGRFJDeExRVUZMTEVOQlFVTXNRMEZCUXp0SFFVTlFPenM3T3pzN096czdPMU5CVTAwc2JVSkJRVWM3UVVGRFZDeFBRVUZKTEUxQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRE8wRkJRM3BDTEU5QlFVa3NVVUZCVVN4SFFVRkhMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXd3UWtGQllTeERRVUZETEVOQlFVTTdPMEZCUlRWRUxFOUJRVWtzUTBGQlF5eFpRVUZaTEVOQlEyaENMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRMVlzUjBGQlJ5eERRVUZETEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1EwRkRlRUlzUjBGQlJ5eERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkRhRUlzUjBGQlJ5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVTm1MRU5CUVVNN08wRkJSVVlzVjBGQlVTeERRVUZETEZWQlFWVXNiMEpCUVZNc1EwRkJRenRCUVVNM1FpeFRRVUZOTEVOQlFVTXNWVUZCVlN4eFFrRkJWU3hEUVVGRE96dEJRVVUxUWl4UFFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNN1FVRkRMMElzVDBGQlNTeERRVUZETEdkQ1FVRm5RaXhIUVVGSExFbEJRVWtzUTBGQlF6dEJRVU0zUWl4UFFVRkpMRU5CUVVNc1lVRkJZU3hIUVVGSExFbEJRVWtzUTBGQlF6dEJRVU14UWl4UFFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF6czdRVUZGYmtJc1ZVRkJUeXhOUVVGTkxFTkJRVU03UjBGRFpEczdPenM3T3pzN096czdPenRUUVZsVExHOUNRVUZETEU5QlFVOHNSVUZCUlN4TlFVRk5MRVZCUVVVc2EwSkJRV3RDTEVWQlFVVXNVVUZCVVN4RlFVRkZPMEZCUTNwRUxFOUJRVWNzVDBGQlR5eE5RVUZOTEV0QlFVc3NVVUZCVVN4RlFVRkZPMEZCUXpsQ0xGVkJRVTBzUjBGQlJ5eE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJRenRKUVVNeFFpeE5RVU5KTzBGQlEwb3NWVUZCVFN4SFFVRkhMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVXNSMEZCUnl4SFFVRkhMRU5CUVVNc1IwRkJSeXhKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETzBsQlF6bERPenRCUVVWRUxFOUJRVWNzVTBGQlV5eERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRVZCUVVVN1FVRkRlRUlzVjBGQlR5eERRVUZETEVWQlFVVXNRMEZCUXl4TlFVRk5MRVZCUVVVc2EwSkJRV3RDTEVWQlFVVXNVVUZCVVN4RFFVRkRMRU5CUVVNN1NVRkRha1FzVFVGRFNUdEJRVU5LTEZkQlFVOHNRMEZCUXl4RlFVRkZMRU5CUVVNc1RVRkJUU3hGUVVGRkxHdENRVUZyUWl4RFFVRkRMRU5CUVVNN1NVRkRka003UjBGRFJEczdPenM3T3pzN096czdVMEZWVnl4elFrRkJReXhQUVVGUExFVkJRVVVzVFVGQlRTeEZRVUZGTzBGQlF6ZENMRTlCUVVjc1QwRkJUeXhOUVVGTkxFdEJRVXNzVVVGQlVTeEZRVUZGTzBGQlF6bENMRlZCUVUwc1IwRkJSeXhOUVVGTkxFZEJRVWNzU1VGQlNTeERRVUZETEVWQlFVVXNRMEZCUXp0SlFVTXhRaXhOUVVOSkxFbEJRVWNzVFVGQlRTeEpRVUZKTEVsQlFVa3NSVUZCUlR0QlFVTjJRaXhWUVVGTkxFZEJRVWNzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3hIUVVGSExFZEJRVWNzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNN1NVRkRPVU1zVFVGRFNUdEJRVU5LTEZWQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRE8wbEJRMnBDT3p0QlFVVkVMRlZCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdSMEZEY0VJN096czdPenM3T3pzN096czdPenRUUVdOWExITkNRVUZETEVsQlFVa3NSVUZCUlN4SlFVRkpMRVZCUVVVc1lVRkJZU3hGUVVGRk8wRkJRM1pETEU5QlFVa3NTMEZCU3l4SFFVRkhMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdRVUZETVVJc1QwRkJSeXhMUVVGTExFTkJRVU1zWVVGQllTeEZRVUZGTzBGQlEzWkNMRk5CUVVzc1EwRkJReXhoUVVGaExFZEJRVWNzUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4RlFVRkZMRVZCUVVVc1lVRkJZU3hEUVVGRExFTkJRVU03U1VGRGJFUTdPMEZCUlVRc1ZVRkJUeXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEU5QlFVOHNRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4SlFVRkpMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03UjBGRE4wUTdPenM3T3pzN096czdPMU5CVldVc01FSkJRVU1zUjBGQlJ5eEZRVUZGTzBGQlEzSkNMRlZCUVU4c1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTERSQ1FVRnBRaXhIUVVGSExFZEJRVWNzUjBGQlJ5eEhRVUZITEVOQlFVTXNTVUZCU1N3eVFrRkJaMElzUTBGQlF6dEhRVU14UlRzN096czdPenM3T3pzN1UwRlZVeXh2UWtGQlF5eFBRVUZQTEVWQlFVVTdRVUZEYmtJc1ZVRkJUeXhQUVVGUExFZEJRVWNzVlVGQlZTeERRVUZETEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03UjBGRGRrVTdPenM3T3pzN096czdPMU5CVlU4c2EwSkJRVU1zVDBGQlR5eEZRVUZGTEV0QlFVc3NSVUZCUlR0QlFVTjRRaXhSUVVGTExFZEJRVWNzUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRCUVVONlFpeFJRVUZMTEVkQlFVY3NTMEZCU3l4SFFVRkhMRU5CUVVNc1IwRkJSeXhMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETzBGQlF6bENMRlZCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eEhRVUZITEV0QlFVc3NSMEZCUnl4SlFVRkpMRU5CUVVNN1IwRkRia003T3pzN096czdPenM3T3p0VFFWZGhMSGRDUVVGRExFdEJRVXNzUlVGQlJUdEJRVU55UWl4UFFVRkpMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeEpRVUZKTEZOQlFWTXNSVUZCUlR0QlFVTjJReXhUUVVGTExFZEJRVWNzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExGRkJRVkVzUlVGQlJTeExRVUZMTEVOQlFVTXNRMEZCUXp0SlFVTXZRenM3UVVGRlJDeFBRVUZKTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1VVRkJVU3hKUVVGSkxGTkJRVk1zUlVGQlJUdEJRVU4yUXl4VFFVRkxMRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRkZCUVZFc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF6dEpRVU12UXpzN1FVRkZSQ3hWUVVGUExFdEJRVXNzUTBGQlF6dEhRVU5pT3pzN096czdPenM3T3pzN08xTkJXVlVzY1VKQlFVTXNTMEZCU3l4RlFVRkZPMEZCUTJ4Q0xFOUJRVWtzUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eEZRVUZGTzBGQlEzUkRMRmRCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zWVVGQllTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hMUVVGTExFTkJRVU1zWVVGQllTeERRVUZETEdOQlFXTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRU3hEUVVGRkxFdEJRVXNzUTBGQlF6dEpRVU4yUmp0QlFVTkVMRlZCUVU4c1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF6dEhRVU51UWpzN08xRkJMMlJ0UWl4blFrRkJaMEk3T3p0eFFrRkJhRUlzWjBKQlFXZENPenRCUVd0bGNrTXNaMEpCUVdkQ0xFTkJRVU1zVVVGQlVTeEhRVUZITzBGQlF6TkNMRk5CUVZFc1JVRkJSU3hyUWtGQlV5eE5RVUZOTEVWQlFVVTdRVUZETVVJc1RVRkJSeXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRTFCUVUwc1JVRkJSVHRCUVVNdlFpeHBRMEZCYlVJN1IwRkRia0k3TzBGQlJVUXNaME5CUVcxQ08wVkJRMjVDTzBGQlEwUXNUVUZCU3l4RlFVRkZMRTFCUVUwc1EwRkJReXhMUVVGTE8wRkJRMjVDTEdGQlFWa3NSVUZCUlN4SlFVRkpPMEZCUTJ4Q0xHVkJRV01zUlVGQlJTeEpRVUZKTzBGQlEzQkNMRk5CUVZFc1JVRkJSU3hKUVVGSk8wRkJRMlFzVTBGQlVTeEZRVUZGTEVsQlFVazdRMEZEWkN4RFFVRkRPenRCUVVWR0xHZENRVUZuUWl4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU03T3pzN096czdPenRCUXpOblFuQkNMRWxCUVUwc1VVRkJVU3hIUVVGSExHdENRVUZyUWl4RFFVRkRPenRCUVVOd1F5eEpRVUZOTEdWQlFXVXNSMEZCUnl4elFrRkJjMElzUTBGQlF6czdRVUZETDBNc1NVRkJUU3hqUVVGakxFZEJRVWNzY1VKQlFYRkNMRU5CUVVNN08wRkJRemRETEVsQlFVMHNUMEZCVHl4SFFVRkhMRWxCUVVrc1EwRkJRenM3TzBGQlJYSkNMRWxCUVUwc2IwSkJRVzlDTEVkQlFVY3NiVUpCUVcxQ0xFTkJRVU03TzBGQlEycEVMRWxCUVUwc2NVSkJRWEZDTEVkQlFVY3NiMEpCUVc5Q0xFTkJRVU03TzBGQlEyNUVMRWxCUVUwc1dVRkJXU3hIUVVGSExGZEJRVmNzUTBGQlF6czdRVUZEYWtNc1NVRkJUU3h6UWtGQmMwSXNSMEZCUnl4eFFrRkJjVUlzUTBGQlF6czdPMEZCUlhKRUxFbEJRVTBzYTBKQlFXdENMRWRCUVVjc2NVSkJRWEZDTEVOQlFVTTdPMEZCUTJwRUxFbEJRVTBzV1VGQldTeEhRVUZITEdWQlFXVXNRMEZCUXpzN1FVRkRja01zU1VGQlRTeHBRa0ZCYVVJc1IwRkJSeXh2UWtGQmIwSXNRMEZCUXpzN08wRkJSUzlETEVsQlFVMHNWMEZCVnl4SFFVRkhMSFZDUVVGMVFpeERRVUZET3p0QlFVTTFReXhKUVVGTkxGZEJRVmNzUjBGQlJ5eDFRa0ZCZFVJc1EwRkJRenM3UVVGRE5VTXNTVUZCVFN4dlFrRkJiMElzYjBKQlFXOUNMRU5CUVVNN096czdPenM3T3pzN096dHhRa05vUW5wQ0xGTkJRVk03T3pzN2RVSkJRMnhDTEZkQlFWY2lMQ0ptYVd4bElqb2laMlZ1WlhKaGRHVmtMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSWlobWRXNWpkR2x2YmlCbEtIUXNiaXh5S1h0bWRXNWpkR2x2YmlCektHOHNkU2w3YVdZb0lXNWJiMTBwZTJsbUtDRjBXMjlkS1h0MllYSWdZVDEwZVhCbGIyWWdjbVZ4ZFdseVpUMDlYQ0ptZFc1amRHbHZibHdpSmlaeVpYRjFhWEpsTzJsbUtDRjFKaVpoS1hKbGRIVnliaUJoS0c4c0lUQXBPMmxtS0drcGNtVjBkWEp1SUdrb2J5d2hNQ2s3ZG1GeUlHWTlibVYzSUVWeWNtOXlLRndpUTJGdWJtOTBJR1pwYm1RZ2JXOWtkV3hsSUNkY0lpdHZLMXdpSjF3aUtUdDBhSEp2ZHlCbUxtTnZaR1U5WENKTlQwUlZURVZmVGs5VVgwWlBWVTVFWENJc1puMTJZWElnYkQxdVcyOWRQWHRsZUhCdmNuUnpPbnQ5ZlR0MFcyOWRXekJkTG1OaGJHd29iQzVsZUhCdmNuUnpMR1oxYm1OMGFXOXVLR1VwZTNaaGNpQnVQWFJiYjExYk1WMWJaVjA3Y21WMGRYSnVJSE1vYmo5dU9tVXBmU3hzTEd3dVpYaHdiM0owY3l4bExIUXNiaXh5S1gxeVpYUjFjbTRnYmx0dlhTNWxlSEJ2Y25SemZYWmhjaUJwUFhSNWNHVnZaaUJ5WlhGMWFYSmxQVDFjSW1aMWJtTjBhVzl1WENJbUpuSmxjWFZwY21VN1ptOXlLSFpoY2lCdlBUQTdienh5TG14bGJtZDBhRHR2S3lzcGN5aHlXMjlkS1R0eVpYUjFjbTRnYzMwcElpd2lhVzF3YjNKMElGSmxjMmw2WVdKc1pVTnZiSFZ0Ym5NZ1puSnZiU0FuTGk5amJHRnpjeWM3WEc1cGJYQnZjblFnZTBSQlZFRmZRVkJKZlNCbWNtOXRJQ2N1TDJOdmJuTjBZVzUwY3ljN1hHNWNiaVF1Wm00dWNtVnphWHBoWW14bFEyOXNkVzF1Y3lBOUlHWjFibU4wYVc5dUtHOXdkR2x2Ym5OUGNrMWxkR2h2WkN3Z0xpNHVZWEpuY3lrZ2UxeHVYSFJ5WlhSMWNtNGdkR2hwY3k1bFlXTm9LR1oxYm1OMGFXOXVLQ2tnZTF4dVhIUmNkR3hsZENBa2RHRmliR1VnUFNBa0tIUm9hWE1wTzF4dVhHNWNkRngwYkdWMElHRndhU0E5SUNSMFlXSnNaUzVrWVhSaEtFUkJWRUZmUVZCSktUdGNibHgwWEhScFppQW9JV0Z3YVNrZ2UxeHVYSFJjZEZ4MFlYQnBJRDBnYm1WM0lGSmxjMmw2WVdKc1pVTnZiSFZ0Ym5Nb0pIUmhZbXhsTENCdmNIUnBiMjV6VDNKTlpYUm9iMlFwTzF4dVhIUmNkRngwSkhSaFlteGxMbVJoZEdFb1JFRlVRVjlCVUVrc0lHRndhU2s3WEc1Y2RGeDBmVnh1WEc1Y2RGeDBaV3h6WlNCcFppQW9kSGx3Wlc5bUlHOXdkR2x2Ym5OUGNrMWxkR2h2WkNBOVBUMGdKM04wY21sdVp5Y3BJSHRjYmx4MFhIUmNkSEpsZEhWeWJpQmhjR2xiYjNCMGFXOXVjMDl5VFdWMGFHOWtYU2d1TGk1aGNtZHpLVHRjYmx4MFhIUjlYRzVjZEgwcE8xeHVmVHRjYmx4dUpDNXlaWE5wZW1GaWJHVkRiMngxYlc1eklEMGdVbVZ6YVhwaFlteGxRMjlzZFcxdWN6dGNiaUlzSW1sdGNHOXlkQ0I3WEc1Y2RFUkJWRUZmUVZCSkxGeHVYSFJFUVZSQlgwTlBURlZOVGxOZlNVUXNYRzVjZEVSQlZFRmZRMDlNVlUxT1gwbEVMRnh1WEhSRVFWUkJYMVJJTEZ4dVhIUkRURUZUVTE5VVFVSk1SVjlTUlZOSldrbE9SeXhjYmx4MFEweEJVMU5mUTA5TVZVMU9YMUpGVTBsYVNVNUhMRnh1WEhSRFRFRlRVMTlJUVU1RVRFVXNYRzVjZEVOTVFWTlRYMGhCVGtSTVJWOURUMDVVUVVsT1JWSXNYRzVjZEVWV1JVNVVYMUpGVTBsYVJWOVRWRUZTVkN4Y2JseDBSVlpGVGxSZlVrVlRTVnBGTEZ4dVhIUkZWa1ZPVkY5U1JWTkpXa1ZmVTFSUFVDeGNibHgwVTBWTVJVTlVUMUpmVkVnc1hHNWNkRk5GVEVWRFZFOVNYMVJFTEZ4dVhIUlRSVXhGUTFSUFVsOVZUbEpGVTBsYVFVSk1SVnh1ZlZ4dVpuSnZiU0FuTGk5amIyNXpkR0Z1ZEhNbk8xeHVYRzR2S2lwY2JsUmhhMlZ6SUdFZ1BIUmhZbXhsSUM4K0lHVnNaVzFsYm5RZ1lXNWtJRzFoYTJWeklHbDBKM01nWTI5c2RXMXVjeUJ5WlhOcGVtRmliR1VnWVdOeWIzTnpJR0p2ZEdoY2JtMXZZbWxzWlNCaGJtUWdaR1Z6YTNSdmNDQmpiR2xsYm5SekxseHVYRzVBWTJ4aGMzTWdVbVZ6YVhwaFlteGxRMjlzZFcxdWMxeHVRSEJoY21GdElDUjBZV0pzWlNCN2FsRjFaWEo1ZlNCcVVYVmxjbmt0ZDNKaGNIQmxaQ0E4ZEdGaWJHVStJR1ZzWlcxbGJuUWdkRzhnYldGclpTQnlaWE5wZW1GaWJHVmNia0J3WVhKaGJTQnZjSFJwYjI1eklIdFBZbXBsWTNSOUlFTnZibVpwWjNWeVlYUnBiMjRnYjJKcVpXTjBYRzRxS2k5Y2JtVjRjRzl5ZENCa1pXWmhkV3gwSUdOc1lYTnpJRkpsYzJsNllXSnNaVU52YkhWdGJuTWdlMXh1WEhSamIyNXpkSEoxWTNSdmNpZ2tkR0ZpYkdVc0lHOXdkR2x2Ym5NcElIdGNibHgwWEhSMGFHbHpMbTV6SUQwZ0p5NXlZeWNnS3lCMGFHbHpMbU52ZFc1MEt5czdYRzVjYmx4MFhIUjBhR2x6TG05d2RHbHZibk1nUFNBa0xtVjRkR1Z1WkNoN2ZTd2dVbVZ6YVhwaFlteGxRMjlzZFcxdWN5NWtaV1poZFd4MGN5d2diM0IwYVc5dWN5azdYRzVjYmx4MFhIUjBhR2x6TGlSM2FXNWtiM2NnUFNBa0tIZHBibVJ2ZHlrN1hHNWNkRngwZEdocGN5NGtiM2R1WlhKRWIyTjFiV1Z1ZENBOUlDUW9KSFJoWW14bFd6QmRMbTkzYm1WeVJHOWpkVzFsYm5RcE8xeHVYSFJjZEhSb2FYTXVKSFJoWW14bElEMGdKSFJoWW14bE8xeHVYRzVjZEZ4MGRHaHBjeTV5WldaeVpYTm9TR1ZoWkdWeWN5Z3BPMXh1WEhSY2RIUm9hWE11Y21WemRHOXlaVU52YkhWdGJsZHBaSFJvY3lncE8xeHVYSFJjZEhSb2FYTXVjM2x1WTBoaGJtUnNaVmRwWkhSb2N5Z3BPMXh1WEc1Y2RGeDBkR2hwY3k1aWFXNWtSWFpsYm5SektIUm9hWE11SkhkcGJtUnZkeXdnSjNKbGMybDZaU2NzSUhSb2FYTXVjM2x1WTBoaGJtUnNaVmRwWkhSb2N5NWlhVzVrS0hSb2FYTXBLVHRjYmx4dVhIUmNkR2xtSUNoMGFHbHpMbTl3ZEdsdmJuTXVjM1JoY25RcElIdGNibHgwWEhSY2RIUm9hWE11WW1sdVpFVjJaVzUwY3loMGFHbHpMaVIwWVdKc1pTd2dSVlpGVGxSZlVrVlRTVnBGWDFOVVFWSlVMQ0IwYUdsekxtOXdkR2x2Ym5NdWMzUmhjblFwTzF4dVhIUmNkSDFjYmx4MFhIUnBaaUFvZEdocGN5NXZjSFJwYjI1ekxuSmxjMmw2WlNrZ2UxeHVYSFJjZEZ4MGRHaHBjeTVpYVc1a1JYWmxiblJ6S0hSb2FYTXVKSFJoWW14bExDQkZWa1ZPVkY5U1JWTkpXa1VzSUhSb2FYTXViM0IwYVc5dWN5NXlaWE5wZW1VcE8xeHVYSFJjZEgxY2JseDBYSFJwWmlBb2RHaHBjeTV2Y0hScGIyNXpMbk4wYjNBcElIdGNibHgwWEhSY2RIUm9hWE11WW1sdVpFVjJaVzUwY3loMGFHbHpMaVIwWVdKc1pTd2dSVlpGVGxSZlVrVlRTVnBGWDFOVVQxQXNJSFJvYVhNdWIzQjBhVzl1Y3k1emRHOXdLVHRjYmx4MFhIUjlYRzVjZEgxY2JseHVYSFF2S2lwY2JseDBVbVZtY21WemFHVnpJSFJvWlNCb1pXRmtaWEp6SUdGemMyOWphV0YwWldRZ2QybDBhQ0IwYUdseklHbHVjM1JoYm1ObGN5QThkR0ZpYkdVdlBpQmxiR1Z0Wlc1MElHRnVaRnh1WEhSblpXNWxjbUYwWlhNZ2FHRnVaR3hsY3lCbWIzSWdkR2hsYlM0Z1FXeHpieUJoYzNOcFoyNXpJSEJsY21ObGJuUmhaMlVnZDJsa2RHaHpMbHh1WEc1Y2RFQnRaWFJvYjJRZ2NtVm1jbVZ6YUVobFlXUmxjbk5jYmx4MEtpb3ZYRzVjZEhKbFpuSmxjMmhJWldGa1pYSnpLQ2tnZTF4dVhIUmNkQzh2SUVGc2JHOTNJSFJvWlNCelpXeGxZM1J2Y2lCMGJ5QmlaU0JpYjNSb0lHRWdjbVZuZFd4aGNpQnpaV3hqZEc5eUlITjBjbWx1WnlCaGN5QjNaV3hzSUdGelhHNWNkRngwTHk4Z1lTQmtlVzVoYldsaklHTmhiR3hpWVdOclhHNWNkRngwYkdWMElITmxiR1ZqZEc5eUlEMGdkR2hwY3k1dmNIUnBiMjV6TG5ObGJHVmpkRzl5TzF4dVhIUmNkR2xtS0hSNWNHVnZaaUJ6Wld4bFkzUnZjaUE5UFQwZ0oyWjFibU4wYVc5dUp5a2dlMXh1WEhSY2RGeDBjMlZzWldOMGIzSWdQU0J6Wld4bFkzUnZjaTVqWVd4c0tIUm9hWE1zSUhSb2FYTXVKSFJoWW14bEtUdGNibHgwWEhSOVhHNWNibHgwWEhRdkx5QlRaV3hsWTNRZ1lXeHNJSFJoWW14bElHaGxZV1JsY25OY2JseDBYSFIwYUdsekxpUjBZV0pzWlVobFlXUmxjbk1nUFNCMGFHbHpMaVIwWVdKc1pTNW1hVzVrS0hObGJHVmpkRzl5S1R0Y2JseHVYSFJjZEM4dklFRnpjMmxuYmlCd1pYSmpaVzUwWVdkbElIZHBaSFJvY3lCbWFYSnpkQ3dnZEdobGJpQmpjbVZoZEdVZ1pISmhaeUJvWVc1a2JHVnpYRzVjZEZ4MGRHaHBjeTVoYzNOcFoyNVFaWEpqWlc1MFlXZGxWMmxrZEdoektDazdYRzVjZEZ4MGRHaHBjeTVqY21WaGRHVklZVzVrYkdWektDazdYRzVjZEgxY2JseHVYSFF2S2lwY2JseDBRM0psWVhSbGN5QmtkVzF0ZVNCb1lXNWtiR1VnWld4bGJXVnVkSE1nWm05eUlHRnNiQ0IwWVdKc1pTQm9aV0ZrWlhJZ1kyOXNkVzF1YzF4dVhHNWNkRUJ0WlhSb2IyUWdZM0psWVhSbFNHRnVaR3hsYzF4dVhIUXFLaTljYmx4MFkzSmxZWFJsU0dGdVpHeGxjeWdwSUh0Y2JseDBYSFJzWlhRZ2NtVm1JRDBnZEdocGN5NGthR0Z1Wkd4bFEyOXVkR0ZwYm1WeU8xeHVYSFJjZEdsbUlDaHlaV1lnSVQwZ2JuVnNiQ2tnZTF4dVhIUmNkRngwY21WbUxuSmxiVzkyWlNncE8xeHVYSFJjZEgxY2JseHVYSFJjZEhSb2FYTXVKR2hoYm1Sc1pVTnZiblJoYVc1bGNpQTlJQ1FvWUR4a2FYWWdZMnhoYzNNOUp5UjdRMHhCVTFOZlNFRk9SRXhGWDBOUFRsUkJTVTVGVW4wbklDOCtZQ2xjYmx4MFhIUjBhR2x6TGlSMFlXSnNaUzVpWldadmNtVW9kR2hwY3k0a2FHRnVaR3hsUTI5dWRHRnBibVZ5S1R0Y2JseHVYSFJjZEhSb2FYTXVKSFJoWW14bFNHVmhaR1Z5Y3k1bFlXTm9LQ2hwTENCbGJDa2dQVDRnZTF4dVhIUmNkRngwYkdWMElDUmpkWEp5Wlc1MElEMGdkR2hwY3k0a2RHRmliR1ZJWldGa1pYSnpMbVZ4S0drcE8xeHVYSFJjZEZ4MGJHVjBJQ1J1WlhoMElEMGdkR2hwY3k0a2RHRmliR1ZJWldGa1pYSnpMbVZ4S0drZ0t5QXhLVHRjYmx4dVhIUmNkRngwYVdZZ0tDUnVaWGgwTG14bGJtZDBhQ0E5UFQwZ01DQjhmQ0FrWTNWeWNtVnVkQzVwY3loVFJVeEZRMVJQVWw5VlRsSkZVMGxhUVVKTVJTa2dmSHdnSkc1bGVIUXVhWE1vVTBWTVJVTlVUMUpmVlU1U1JWTkpXa0ZDVEVVcEtTQjdYRzVjZEZ4MFhIUmNkSEpsZEhWeWJqdGNibHgwWEhSY2RIMWNibHh1WEhSY2RGeDBiR1YwSUNSb1lXNWtiR1VnUFNBa0tHQThaR2wySUdOc1lYTnpQU2NrZTBOTVFWTlRYMGhCVGtSTVJYMG5JQzgrWUNsY2JseDBYSFJjZEZ4MExtUmhkR0VvUkVGVVFWOVVTQ3dnSkNobGJDa3BYRzVjZEZ4MFhIUmNkQzVoY0hCbGJtUlVieWgwYUdsekxpUm9ZVzVrYkdWRGIyNTBZV2x1WlhJcE8xeHVYSFJjZEgwcE8xeHVYRzVjZEZ4MGRHaHBjeTVpYVc1a1JYWmxiblJ6S0hSb2FYTXVKR2hoYm1Sc1pVTnZiblJoYVc1bGNpd2dXeWR0YjNWelpXUnZkMjRuTENBbmRHOTFZMmh6ZEdGeWRDZGRMQ0FuTGljclEweEJVMU5mU0VGT1JFeEZMQ0IwYUdsekxtOXVVRzlwYm5SbGNrUnZkMjR1WW1sdVpDaDBhR2x6S1NrN1hHNWNkSDFjYmx4dVhIUXZLaXBjYmx4MFFYTnphV2R1Y3lCaElIQmxjbU5sYm5SaFoyVWdkMmxrZEdnZ2RHOGdZV3hzSUdOdmJIVnRibk1nWW1GelpXUWdiMjRnZEdobGFYSWdZM1Z5Y21WdWRDQndhWGhsYkNCM2FXUjBhQ2h6S1Z4dVhHNWNkRUJ0WlhSb2IyUWdZWE56YVdkdVVHVnlZMlZ1ZEdGblpWZHBaSFJvYzF4dVhIUXFLaTljYmx4MFlYTnphV2R1VUdWeVkyVnVkR0ZuWlZkcFpIUm9jeWdwSUh0Y2JseDBYSFIwYUdsekxpUjBZV0pzWlVobFlXUmxjbk11WldGamFDZ29YeXdnWld3cElEMCtJSHRjYmx4MFhIUmNkR3hsZENBa1pXd2dQU0FrS0dWc0tUdGNibHgwWEhSY2RIUm9hWE11YzJWMFYybGtkR2dvSkdWc1d6QmRMQ0FrWld3dWIzVjBaWEpYYVdSMGFDZ3BLVHRjYmx4MFhIUjlLVHRjYmx4MGZWeHVYRzVjZEM4cUtseHVYRzVjYmx4MFFHMWxkR2h2WkNCemVXNWpTR0Z1Wkd4bFYybGtkR2h6WEc1Y2RDb3FMMXh1WEhSemVXNWpTR0Z1Wkd4bFYybGtkR2h6S0NrZ2UxeHVYSFJjZEd4bGRDQWtZMjl1ZEdGcGJtVnlJRDBnZEdocGN5NGthR0Z1Wkd4bFEyOXVkR0ZwYm1WeVhHNWNibHgwWEhRa1kyOXVkR0ZwYm1WeUxuZHBaSFJvS0hSb2FYTXVKSFJoWW14bExuZHBaSFJvS0NrcE8xeHVYRzVjZEZ4MEpHTnZiblJoYVc1bGNpNW1hVzVrS0NjdUp5dERURUZUVTE5SVFVNUVURVVwTG1WaFkyZ29LRjhzSUdWc0tTQTlQaUI3WEc1Y2RGeDBYSFJzWlhRZ0pHVnNJRDBnSkNobGJDazdYRzVjYmx4MFhIUmNkR3hsZENCb1pXbG5hSFFnUFNCMGFHbHpMbTl3ZEdsdmJuTXVjbVZ6YVhwbFJuSnZiVUp2WkhrZ1AxeHVYSFJjZEZ4MFhIUjBhR2x6TGlSMFlXSnNaUzVvWldsbmFIUW9LU0E2WEc1Y2RGeDBYSFJjZEhSb2FYTXVKSFJoWW14bExtWnBibVFvSjNSb1pXRmtKeWt1YUdWcFoyaDBLQ2s3WEc1Y2JseDBYSFJjZEd4bGRDQnNaV1owSUQwZ0pHVnNMbVJoZEdFb1JFRlVRVjlVU0NrdWIzVjBaWEpYYVdSMGFDZ3BJQ3NnS0Z4dVhIUmNkRngwWEhRa1pXd3VaR0YwWVNoRVFWUkJYMVJJS1M1dlptWnpaWFFvS1M1c1pXWjBJQzBnZEdocGN5NGthR0Z1Wkd4bFEyOXVkR0ZwYm1WeUxtOW1abk5sZENncExteGxablJjYmx4MFhIUmNkQ2s3WEc1Y2JseDBYSFJjZENSbGJDNWpjM01vZXlCc1pXWjBMQ0JvWldsbmFIUWdmU2s3WEc1Y2RGeDBmU2s3WEc1Y2RIMWNibHh1WEhRdktpcGNibHgwVUdWeWMybHpkSE1nZEdobElHTnZiSFZ0YmlCM2FXUjBhSE1nYVc0Z2JHOWpZV3hUZEc5eVlXZGxYRzVjYmx4MFFHMWxkR2h2WkNCellYWmxRMjlzZFcxdVYybGtkR2h6WEc1Y2RDb3FMMXh1WEhSellYWmxRMjlzZFcxdVYybGtkR2h6S0NrZ2UxeHVYSFJjZEhSb2FYTXVKSFJoWW14bFNHVmhaR1Z5Y3k1bFlXTm9LQ2hmTENCbGJDa2dQVDRnZTF4dVhIUmNkRngwYkdWMElDUmxiQ0E5SUNRb1pXd3BPMXh1WEc1Y2RGeDBYSFJwWmlBb2RHaHBjeTV2Y0hScGIyNXpMbk4wYjNKbElDWW1JQ0VrWld3dWFYTW9VMFZNUlVOVVQxSmZWVTVTUlZOSldrRkNURVVwS1NCN1hHNWNkRngwWEhSY2RIUm9hWE11YjNCMGFXOXVjeTV6ZEc5eVpTNXpaWFFvWEc1Y2RGeDBYSFJjZEZ4MGRHaHBjeTVuWlc1bGNtRjBaVU52YkhWdGJrbGtLQ1JsYkNrc1hHNWNkRngwWEhSY2RGeDBkR2hwY3k1d1lYSnpaVmRwWkhSb0tHVnNLVnh1WEhSY2RGeDBYSFFwTzF4dVhIUmNkRngwZlZ4dVhIUmNkSDBwTzF4dVhIUjlYRzVjYmx4MEx5b3FYRzVjZEZKbGRISnBaWFpsY3lCaGJtUWdjMlYwY3lCMGFHVWdZMjlzZFcxdUlIZHBaSFJvY3lCbWNtOXRJR3h2WTJGc1UzUnZjbUZuWlZ4dVhHNWNkRUJ0WlhSb2IyUWdjbVZ6ZEc5eVpVTnZiSFZ0YmxkcFpIUm9jMXh1WEhRcUtpOWNibHgwY21WemRHOXlaVU52YkhWdGJsZHBaSFJvY3lncElIdGNibHgwWEhSMGFHbHpMaVIwWVdKc1pVaGxZV1JsY25NdVpXRmphQ2dvWHl3Z1pXd3BJRDArSUh0Y2JseDBYSFJjZEd4bGRDQWtaV3dnUFNBa0tHVnNLVHRjYmx4dVhIUmNkRngwYVdZb2RHaHBjeTV2Y0hScGIyNXpMbk4wYjNKbElDWW1JQ0VrWld3dWFYTW9VMFZNUlVOVVQxSmZWVTVTUlZOSldrRkNURVVwS1NCN1hHNWNkRngwWEhSY2RHeGxkQ0IzYVdSMGFDQTlJSFJvYVhNdWIzQjBhVzl1Y3k1emRHOXlaUzVuWlhRb1hHNWNkRngwWEhSY2RGeDBkR2hwY3k1blpXNWxjbUYwWlVOdmJIVnRia2xrS0NSbGJDbGNibHgwWEhSY2RGeDBLVHRjYmx4dVhIUmNkRngwWEhScFppaDNhV1IwYUNBaFBTQnVkV3hzS1NCN1hHNWNkRngwWEhSY2RGeDBkR2hwY3k1elpYUlhhV1IwYUNobGJDd2dkMmxrZEdncE8xeHVYSFJjZEZ4MFhIUjlYRzVjZEZ4MFhIUjlYRzVjZEZ4MGZTazdYRzVjZEgxY2JseHVYSFF2S2lwY2JseDBVRzlwYm5SbGNpOXRiM1Z6WlNCa2IzZHVJR2hoYm1Sc1pYSmNibHh1WEhSQWJXVjBhRzlrSUc5dVVHOXBiblJsY2tSdmQyNWNibHgwUUhCaGNtRnRJR1YyWlc1MElIdFBZbXBsWTNSOUlFVjJaVzUwSUc5aWFtVmpkQ0JoYzNOdlkybGhkR1ZrSUhkcGRHZ2dkR2hsSUdsdWRHVnlZV04wYVc5dVhHNWNkQ29xTDF4dVhIUnZibEJ2YVc1MFpYSkViM2R1S0dWMlpXNTBLU0I3WEc1Y2RGeDBMeThnVDI1c2VTQmhjSEJzYVdWeklIUnZJR3hsWm5RdFkyeHBZMnNnWkhKaFoyZHBibWRjYmx4MFhIUnBaaWhsZG1WdWRDNTNhR2xqYUNBaFBUMGdNU2tnZXlCeVpYUjFjbTQ3SUgxY2JseHVYSFJjZEM4dklFbG1JR0VnY0hKbGRtbHZkWE1nYjNCbGNtRjBhVzl1SUdseklHUmxabWx1WldRc0lIZGxJRzFwYzNObFpDQjBhR1VnYkdGemRDQnRiM1Z6WlhWd0xseHVYSFJjZEM4dklGQnliMkpoWW14NUlHZHZZbUpzWldRZ2RYQWdZbmtnZFhObGNpQnRiM1Z6YVc1bklHOTFkQ0IwYUdVZ2QybHVaRzkzSUhSb1pXNGdjbVZzWldGemFXNW5MbHh1WEhSY2RDOHZJRmRsSjJ4c0lITnBiWFZzWVhSbElHRWdjRzlwYm5SbGNuVndJR2hsY21VZ2NISnBiM0lnZEc4Z2FYUmNibHgwWEhScFppaDBhR2x6TG05d1pYSmhkR2x2YmlrZ2UxeHVYSFJjZEZ4MGRHaHBjeTV2YmxCdmFXNTBaWEpWY0NobGRtVnVkQ2s3WEc1Y2RGeDBmVnh1WEc1Y2RGeDBMeThnU1dkdWIzSmxJRzV2YmkxeVpYTnBlbUZpYkdVZ1kyOXNkVzF1YzF4dVhIUmNkR3hsZENBa1kzVnljbVZ1ZEVkeWFYQWdQU0FrS0dWMlpXNTBMbU4xY25KbGJuUlVZWEpuWlhRcE8xeHVYSFJjZEdsbUtDUmpkWEp5Wlc1MFIzSnBjQzVwY3loVFJVeEZRMVJQVWw5VlRsSkZVMGxhUVVKTVJTa3BJSHRjYmx4MFhIUmNkSEpsZEhWeWJqdGNibHgwWEhSOVhHNWNibHgwWEhSc1pYUWdaM0pwY0VsdVpHVjRJRDBnSkdOMWNuSmxiblJIY21sd0xtbHVaR1Y0S0NrN1hHNWNkRngwYkdWMElDUnNaV1owUTI5c2RXMXVJRDBnZEdocGN5NGtkR0ZpYkdWSVpXRmtaWEp6TG1WeEtHZHlhWEJKYm1SbGVDa3VibTkwS0ZORlRFVkRWRTlTWDFWT1VrVlRTVnBCUWt4RktUdGNibHgwWEhSc1pYUWdKSEpwWjJoMFEyOXNkVzF1SUQwZ2RHaHBjeTRrZEdGaWJHVklaV0ZrWlhKekxtVnhLR2R5YVhCSmJtUmxlQ0FySURFcExtNXZkQ2hUUlV4RlExUlBVbDlWVGxKRlUwbGFRVUpNUlNrN1hHNWNibHgwWEhSc1pYUWdiR1ZtZEZkcFpIUm9JRDBnZEdocGN5NXdZWEp6WlZkcFpIUm9LQ1JzWldaMFEyOXNkVzF1V3pCZEtUdGNibHgwWEhSc1pYUWdjbWxuYUhSWGFXUjBhQ0E5SUhSb2FYTXVjR0Z5YzJWWGFXUjBhQ2drY21sbmFIUkRiMngxYlc1Yk1GMHBPMXh1WEc1Y2RGeDBkR2hwY3k1dmNHVnlZWFJwYjI0Z1BTQjdYRzVjZEZ4MFhIUWtiR1ZtZEVOdmJIVnRiaXdnSkhKcFoyaDBRMjlzZFcxdUxDQWtZM1Z5Y21WdWRFZHlhWEFzWEc1Y2JseDBYSFJjZEhOMFlYSjBXRG9nZEdocGN5NW5aWFJRYjJsdWRHVnlXQ2hsZG1WdWRDa3NYRzVjZEZ4MFhIUnpkR0Z5ZEZSaFlteGxWMmxrZEdnNklIUm9hWE11SkhSaFlteGxMbmRwWkhSb0tDa3NYRzVjYmx4MFhIUmNkSGRwWkhSb2N6b2dlMXh1WEhSY2RGeDBYSFJzWldaME9pQnNaV1owVjJsa2RHZ3NYRzVjZEZ4MFhIUmNkSEpwWjJoME9pQnlhV2RvZEZkcFpIUm9YRzVjZEZ4MFhIUjlMRnh1WEhSY2RGeDBibVYzVjJsa2RHaHpPaUI3WEc1Y2RGeDBYSFJjZEd4bFpuUTZJR3hsWm5SWGFXUjBhQ3hjYmx4MFhIUmNkRngwY21sbmFIUTZJSEpwWjJoMFYybGtkR2hjYmx4MFhIUmNkSDFjYmx4MFhIUjlPMXh1WEc1Y2RGeDBkR2hwY3k1aWFXNWtSWFpsYm5SektIUm9hWE11Skc5M2JtVnlSRzlqZFcxbGJuUXNJRnNuYlc5MWMyVnRiM1psSnl3Z0ozUnZkV05vYlc5MlpTZGRMQ0IwYUdsekxtOXVVRzlwYm5SbGNrMXZkbVV1WW1sdVpDaDBhR2x6S1NrN1hHNWNkRngwZEdocGN5NWlhVzVrUlhabGJuUnpLSFJvYVhNdUpHOTNibVZ5Ukc5amRXMWxiblFzSUZzbmJXOTFjMlYxY0Njc0lDZDBiM1ZqYUdWdVpDZGRMQ0IwYUdsekxtOXVVRzlwYm5SbGNsVndMbUpwYm1Rb2RHaHBjeWtwTzF4dVhHNWNkRngwZEdocGN5NGthR0Z1Wkd4bFEyOXVkR0ZwYm1WeVhHNWNkRngwWEhRdVlXUmtLSFJvYVhNdUpIUmhZbXhsS1Z4dVhIUmNkRngwTG1Ga1pFTnNZWE56S0VOTVFWTlRYMVJCUWt4RlgxSkZVMGxhU1U1SEtUdGNibHh1WEhSY2RDUnNaV1owUTI5c2RXMXVYRzVjZEZ4MFhIUXVZV1JrS0NSeWFXZG9kRU52YkhWdGJpbGNibHgwWEhSY2RDNWhaR1FvSkdOMWNuSmxiblJIY21sd0tWeHVYSFJjZEZ4MExtRmtaRU5zWVhOektFTk1RVk5UWDBOUFRGVk5UbDlTUlZOSldrbE9SeWs3WEc1Y2JseDBYSFIwYUdsekxuUnlhV2RuWlhKRmRtVnVkQ2hGVmtWT1ZGOVNSVk5KV2tWZlUxUkJVbFFzSUZ0Y2JseDBYSFJjZENSc1pXWjBRMjlzZFcxdUxDQWtjbWxuYUhSRGIyeDFiVzRzWEc1Y2RGeDBYSFJzWldaMFYybGtkR2dzSUhKcFoyaDBWMmxrZEdoY2JseDBYSFJkTEZ4dVhIUmNkR1YyWlc1MEtUdGNibHh1WEhSY2RHVjJaVzUwTG5CeVpYWmxiblJFWldaaGRXeDBLQ2s3WEc1Y2RIMWNibHh1WEhRdktpcGNibHgwVUc5cGJuUmxjaTl0YjNWelpTQnRiM1psYldWdWRDQm9ZVzVrYkdWeVhHNWNibHgwUUcxbGRHaHZaQ0J2YmxCdmFXNTBaWEpOYjNabFhHNWNkRUJ3WVhKaGJTQmxkbVZ1ZENCN1QySnFaV04wZlNCRmRtVnVkQ0J2WW1wbFkzUWdZWE56YjJOcFlYUmxaQ0IzYVhSb0lIUm9aU0JwYm5SbGNtRmpkR2x2Ymx4dVhIUXFLaTljYmx4MGIyNVFiMmx1ZEdWeVRXOTJaU2hsZG1WdWRDa2dlMXh1WEhSY2RHeGxkQ0J2Y0NBOUlIUm9hWE11YjNCbGNtRjBhVzl1TzF4dVhIUmNkR2xtS0NGMGFHbHpMbTl3WlhKaGRHbHZiaWtnZXlCeVpYUjFjbTQ3SUgxY2JseHVYSFJjZEM4dklFUmxkR1Z5YldsdVpTQjBhR1VnWkdWc2RHRWdZMmhoYm1kbElHSmxkSGRsWlc0Z2MzUmhjblFnWVc1a0lHNWxkeUJ0YjNWelpTQndiM05wZEdsdmJpd2dZWE1nWVNCd1pYSmpaVzUwWVdkbElHOW1JSFJvWlNCMFlXSnNaU0IzYVdSMGFGeHVYSFJjZEd4bGRDQmthV1ptWlhKbGJtTmxJRDBnS0hSb2FYTXVaMlYwVUc5cGJuUmxjbGdvWlhabGJuUXBJQzBnYjNBdWMzUmhjblJZS1R0Y2JseDBYSFJwWmloa2FXWm1aWEpsYm1ObElEMDlQU0F3S1NCN1hHNWNkRngwWEhSeVpYUjFjbTQ3WEc1Y2RGeDBmVnh1WEc1Y2RGeDBiR1YwSUd4bFpuUkRiMngxYlc0Z1BTQnZjQzRrYkdWbWRFTnZiSFZ0Ymxzd1hUdGNibHgwWEhSc1pYUWdjbWxuYUhSRGIyeDFiVzRnUFNCdmNDNGtjbWxuYUhSRGIyeDFiVzViTUYwN1hHNWNkRngwYkdWMElIZHBaSFJvVEdWbWRDd2dkMmxrZEdoU2FXZG9kQ3dnZDJsa2RHaFVZV0pzWlR0Y2JseHVYSFJjZEdsbUtHUnBabVpsY21WdVkyVWdQaUF3S1NCN1hHNWNkRngwWEhSM2FXUjBhRXhsWm5RZ1BTQjBhR2x6TG1OdmJuTjBjbUZwYmxkcFpIUm9LRzl3TG5kcFpIUm9jeTVzWldaMElDc2daR2xtWm1WeVpXNWpaU2s3WEc1Y2RGeDBYSFIzYVdSMGFGSnBaMmgwSUQwZ2RHaHBjeTVqYjI1emRISmhhVzVYYVdSMGFDaHZjQzUzYVdSMGFITXVjbWxuYUhRcE8xeHVYSFJjZEZ4MGQybGtkR2hVWVdKc1pTQTlJSFJvYVhNdVkyOXVjM1J5WVdsdVYybGtkR2dvYjNBdWMzUmhjblJVWVdKc1pWZHBaSFJvSUNzZ1pHbG1abVZ5Wlc1alpTazdYRzVjZEZ4MGZWeHVYSFJjZEdWc2MyVWdhV1lvWkdsbVptVnlaVzVqWlNBOElEQXBJSHRjYmx4MFhIUmNkSGRwWkhSb1RHVm1kQ0E5SUhSb2FYTXVZMjl1YzNSeVlXbHVWMmxrZEdnb2IzQXVkMmxrZEdoekxteGxablFnS3lCa2FXWm1aWEpsYm1ObEtUdGNibHgwWEhSY2RIZHBaSFJvVW1sbmFIUWdQU0IwYUdsekxtTnZibk4wY21GcGJsZHBaSFJvS0c5d0xuZHBaSFJvY3k1eWFXZG9kQ2s3WEc1Y2RGeDBYSFIzYVdSMGFGUmhZbXhsSUQwZ2RHaHBjeTVqYjI1emRISmhhVzVYYVdSMGFDaHZjQzV6ZEdGeWRGUmhZbXhsVjJsa2RHZ2dLeUJrYVdabVpYSmxibU5sS1R0Y2JseDBYSFI5WEc1Y2JseDBYSFJwWmloc1pXWjBRMjlzZFcxdUtTQjdYRzVjZEZ4MFhIUjBhR2x6TG5ObGRGZHBaSFJvS0d4bFpuUkRiMngxYlc0c0lIZHBaSFJvVEdWbWRDazdYRzVjZEZ4MGZWeHVYSFJjZEdsbUtISnBaMmgwUTI5c2RXMXVLU0I3WEc1Y2RGeDBYSFIwYUdsekxuTmxkRmRwWkhSb0tISnBaMmgwUTI5c2RXMXVMQ0IzYVdSMGFGSnBaMmgwS1R0Y2JseDBYSFI5WEc1Y2RGeDBhV1lnS0hkcFpIUm9WR0ZpYkdVcElIdGNibHgwWEhSY2RIUm9hWE11SkhSaFlteGxMbU56Y3loY0luZHBaSFJvWENJc0lIZHBaSFJvVkdGaWJHVWdLeUJjSW5CNFhDSXBPMXh1WEhSY2RIMWNibHh1WEhSY2RHOXdMbTVsZDFkcFpIUm9jeTVzWldaMElEMGdkMmxrZEdoTVpXWjBPMXh1WEhSY2RHOXdMbTVsZDFkcFpIUm9jeTV5YVdkb2RDQTlJSGRwWkhSb1VtbG5hSFE3WEc1Y2RGeDBiM0F1Ym1WM1YybGtkR2h6TG5SaFlteGxJRDBnZDJsa2RHaFVZV0pzWlR0Y2JseHVYSFJjZEhKbGRIVnliaUIwYUdsekxuUnlhV2RuWlhKRmRtVnVkQ2hGVmtWT1ZGOVNSVk5KV2tVc0lGdGNibHgwWEhSY2RHOXdMaVJzWldaMFEyOXNkVzF1TENCdmNDNGtjbWxuYUhSRGIyeDFiVzRzWEc1Y2RGeDBYSFIzYVdSMGFFeGxablFzSUhkcFpIUm9VbWxuYUhSY2JseDBYSFJkTEZ4dVhIUmNkR1YyWlc1MEtUdGNibHgwZlZ4dVhHNWNkQzhxS2x4dVhIUlFiMmx1ZEdWeUwyMXZkWE5sSUhKbGJHVmhjMlVnYUdGdVpHeGxjbHh1WEc1Y2RFQnRaWFJvYjJRZ2IyNVFiMmx1ZEdWeVZYQmNibHgwUUhCaGNtRnRJR1YyWlc1MElIdFBZbXBsWTNSOUlFVjJaVzUwSUc5aWFtVmpkQ0JoYzNOdlkybGhkR1ZrSUhkcGRHZ2dkR2hsSUdsdWRHVnlZV04wYVc5dVhHNWNkQ29xTDF4dVhIUnZibEJ2YVc1MFpYSlZjQ2hsZG1WdWRDa2dlMXh1WEhSY2RHeGxkQ0J2Y0NBOUlIUm9hWE11YjNCbGNtRjBhVzl1TzF4dVhIUmNkR2xtS0NGMGFHbHpMbTl3WlhKaGRHbHZiaWtnZXlCeVpYUjFjbTQ3SUgxY2JseHVYSFJjZEhSb2FYTXVkVzVpYVc1a1JYWmxiblJ6S0hSb2FYTXVKRzkzYm1WeVJHOWpkVzFsYm5Rc0lGc25iVzkxYzJWMWNDY3NJQ2QwYjNWamFHVnVaQ2NzSUNkdGIzVnpaVzF2ZG1VbkxDQW5kRzkxWTJodGIzWmxKMTBwTzF4dVhHNWNkRngwZEdocGN5NGthR0Z1Wkd4bFEyOXVkR0ZwYm1WeVhHNWNkRngwWEhRdVlXUmtLSFJvYVhNdUpIUmhZbXhsS1Z4dVhIUmNkRngwTG5KbGJXOTJaVU5zWVhOektFTk1RVk5UWDFSQlFreEZYMUpGVTBsYVNVNUhLVHRjYmx4dVhIUmNkRzl3TGlSc1pXWjBRMjlzZFcxdVhHNWNkRngwWEhRdVlXUmtLRzl3TGlSeWFXZG9kRU52YkhWdGJpbGNibHgwWEhSY2RDNWhaR1FvYjNBdUpHTjFjbkpsYm5SSGNtbHdLVnh1WEhSY2RGeDBMbkpsYlc5MlpVTnNZWE56S0VOTVFWTlRYME5QVEZWTlRsOVNSVk5KV2tsT1J5azdYRzVjYmx4MFhIUjBhR2x6TG5ONWJtTklZVzVrYkdWWGFXUjBhSE1vS1R0Y2JseDBYSFIwYUdsekxuTmhkbVZEYjJ4MWJXNVhhV1IwYUhNb0tUdGNibHh1WEhSY2RIUm9hWE11YjNCbGNtRjBhVzl1SUQwZ2JuVnNiRHRjYmx4dVhIUmNkSEpsZEhWeWJpQjBhR2x6TG5SeWFXZG5aWEpGZG1WdWRDaEZWa1ZPVkY5U1JWTkpXa1ZmVTFSUFVDd2dXMXh1WEhSY2RGeDBiM0F1Skd4bFpuUkRiMngxYlc0c0lHOXdMaVJ5YVdkb2RFTnZiSFZ0Yml4Y2JseDBYSFJjZEc5d0xtNWxkMWRwWkhSb2N5NXNaV1owTENCdmNDNXVaWGRYYVdSMGFITXVjbWxuYUhSY2JseDBYSFJkTEZ4dVhIUmNkR1YyWlc1MEtUdGNibHgwZlZ4dVhHNWNkQzhxS2x4dVhIUlNaVzF2ZG1WeklHRnNiQ0JsZG1WdWRDQnNhWE4wWlc1bGNuTXNJR1JoZEdFc0lHRnVaQ0JoWkdSbFpDQkVUMDBnWld4bGJXVnVkSE11SUZSaGEyVnpYRzVjZEhSb1pTQThkR0ZpYkdVdlBpQmxiR1Z0Wlc1MElHSmhZMnNnZEc4Z2FHOTNJR2wwSUhkaGN5d2dZVzVrSUhKbGRIVnlibk1nYVhSY2JseHVYSFJBYldWMGFHOWtJR1JsYzNSeWIzbGNibHgwUUhKbGRIVnliaUI3YWxGMVpYSjVmU0JQY21sbmFXNWhiQ0JxVVhWbGNua3RkM0poY0hCbFpDQThkR0ZpYkdVK0lHVnNaVzFsYm5SY2JseDBLaW92WEc1Y2RHUmxjM1J5YjNrb0tTQjdYRzVjZEZ4MGJHVjBJQ1IwWVdKc1pTQTlJSFJvYVhNdUpIUmhZbXhsTzF4dVhIUmNkR3hsZENBa2FHRnVaR3hsY3lBOUlIUm9hWE11SkdoaGJtUnNaVU52Ym5SaGFXNWxjaTVtYVc1a0tDY3VKeXREVEVGVFUxOUlRVTVFVEVVcE8xeHVYRzVjZEZ4MGRHaHBjeTUxYm1KcGJtUkZkbVZ1ZEhNb1hHNWNkRngwWEhSMGFHbHpMaVIzYVc1a2IzZGNibHgwWEhSY2RGeDBMbUZrWkNoMGFHbHpMaVJ2ZDI1bGNrUnZZM1Z0Wlc1MEtWeHVYSFJjZEZ4MFhIUXVZV1JrS0hSb2FYTXVKSFJoWW14bEtWeHVYSFJjZEZ4MFhIUXVZV1JrS0NSb1lXNWtiR1Z6S1Z4dVhIUmNkQ2s3WEc1Y2JseDBYSFFrYUdGdVpHeGxjeTV5WlcxdmRtVkVZWFJoS0VSQlZFRmZWRWdwTzF4dVhIUmNkQ1IwWVdKc1pTNXlaVzF2ZG1WRVlYUmhLRVJCVkVGZlFWQkpLVHRjYmx4dVhIUmNkSFJvYVhNdUpHaGhibVJzWlVOdmJuUmhhVzVsY2k1eVpXMXZkbVVvS1R0Y2JseDBYSFIwYUdsekxpUm9ZVzVrYkdWRGIyNTBZV2x1WlhJZ1BTQnVkV3hzTzF4dVhIUmNkSFJvYVhNdUpIUmhZbXhsU0dWaFpHVnljeUE5SUc1MWJHdzdYRzVjZEZ4MGRHaHBjeTRrZEdGaWJHVWdQU0J1ZFd4c08xeHVYRzVjZEZ4MGNtVjBkWEp1SUNSMFlXSnNaVHRjYmx4MGZWeHVYRzVjZEM4cUtseHVYSFJDYVc1a2N5Qm5hWFpsYmlCbGRtVnVkSE1nWm05eUlIUm9hWE1nYVc1emRHRnVZMlVnZEc4Z2RHaGxJR2RwZG1WdUlIUmhjbWRsZENCRVQwMUZiR1Z0Wlc1MFhHNWNibHgwUUhCeWFYWmhkR1ZjYmx4MFFHMWxkR2h2WkNCaWFXNWtSWFpsYm5SelhHNWNkRUJ3WVhKaGJTQjBZWEpuWlhRZ2UycFJkV1Z5ZVgwZ2FsRjFaWEo1TFhkeVlYQndaV1FnUkU5TlJXeGxiV1Z1ZENCMGJ5QmlhVzVrSUdWMlpXNTBjeUIwYjF4dVhIUkFjR0Z5WVcwZ1pYWmxiblJ6SUh0VGRISnBibWQ4UVhKeVlYbDlJRVYyWlc1MElHNWhiV1VnS0c5eUlHRnljbUY1SUc5bUtTQjBieUJpYVc1a1hHNWNkRUJ3WVhKaGJTQnpaV3hsWTNSdmNrOXlRMkZzYkdKaFkyc2dlMU4wY21sdVozeEdkVzVqZEdsdmJuMGdVMlZzWldOMGIzSWdjM1J5YVc1bklHOXlJR05oYkd4aVlXTnJYRzVjZEVCd1lYSmhiU0JiWTJGc2JHSmhZMnRkSUh0R2RXNWpkR2x2Ym4wZ1EyRnNiR0poWTJzZ2JXVjBhRzlrWEc1Y2RDb3FMMXh1WEhSaWFXNWtSWFpsYm5SektDUjBZWEpuWlhRc0lHVjJaVzUwY3l3Z2MyVnNaV04wYjNKUGNrTmhiR3hpWVdOckxDQmpZV3hzWW1GamF5a2dlMXh1WEhSY2RHbG1LSFI1Y0dWdlppQmxkbVZ1ZEhNZ1BUMDlJQ2R6ZEhKcGJtY25LU0I3WEc1Y2RGeDBYSFJsZG1WdWRITWdQU0JsZG1WdWRITWdLeUIwYUdsekxtNXpPMXh1WEhSY2RIMWNibHgwWEhSbGJITmxJSHRjYmx4MFhIUmNkR1YyWlc1MGN5QTlJR1YyWlc1MGN5NXFiMmx1S0hSb2FYTXVibk1nS3lBbklDY3BJQ3NnZEdocGN5NXVjenRjYmx4MFhIUjlYRzVjYmx4MFhIUnBaaWhoY21kMWJXVnVkSE11YkdWdVozUm9JRDRnTXlrZ2UxeHVYSFJjZEZ4MEpIUmhjbWRsZEM1dmJpaGxkbVZ1ZEhNc0lITmxiR1ZqZEc5eVQzSkRZV3hzWW1GamF5d2dZMkZzYkdKaFkyc3BPMXh1WEhSY2RIMWNibHgwWEhSbGJITmxJSHRjYmx4MFhIUmNkQ1IwWVhKblpYUXViMjRvWlhabGJuUnpMQ0J6Wld4bFkzUnZjazl5UTJGc2JHSmhZMnNwTzF4dVhIUmNkSDFjYmx4MGZWeHVYRzVjZEM4cUtseHVYSFJWYm1KcGJtUnpJR1YyWlc1MGN5QnpjR1ZqYVdacFl5QjBieUIwYUdseklHbHVjM1JoYm1ObElHWnliMjBnZEdobElHZHBkbVZ1SUhSaGNtZGxkQ0JFVDAxRmJHVnRaVzUwWEc1Y2JseDBRSEJ5YVhaaGRHVmNibHgwUUcxbGRHaHZaQ0IxYm1KcGJtUkZkbVZ1ZEhOY2JseDBRSEJoY21GdElIUmhjbWRsZENCN2FsRjFaWEo1ZlNCcVVYVmxjbmt0ZDNKaGNIQmxaQ0JFVDAxRmJHVnRaVzUwSUhSdklIVnVZbWx1WkNCbGRtVnVkSE1nWm5KdmJWeHVYSFJBY0dGeVlXMGdaWFpsYm5SeklIdFRkSEpwYm1kOFFYSnlZWGw5SUVWMlpXNTBJRzVoYldVZ0tHOXlJR0Z5Y21GNUlHOW1LU0IwYnlCMWJtSnBibVJjYmx4MEtpb3ZYRzVjZEhWdVltbHVaRVYyWlc1MGN5Z2tkR0Z5WjJWMExDQmxkbVZ1ZEhNcElIdGNibHgwWEhScFppaDBlWEJsYjJZZ1pYWmxiblJ6SUQwOVBTQW5jM1J5YVc1bkp5a2dlMXh1WEhSY2RGeDBaWFpsYm5SeklEMGdaWFpsYm5SeklDc2dkR2hwY3k1dWN6dGNibHgwWEhSOVhHNWNkRngwWld4elpTQnBaaWhsZG1WdWRITWdJVDBnYm5Wc2JDa2dlMXh1WEhSY2RGeDBaWFpsYm5SeklEMGdaWFpsYm5SekxtcHZhVzRvZEdocGN5NXVjeUFySUNjZ0p5a2dLeUIwYUdsekxtNXpPMXh1WEhSY2RIMWNibHgwWEhSbGJITmxJSHRjYmx4MFhIUmNkR1YyWlc1MGN5QTlJSFJvYVhNdWJuTTdYRzVjZEZ4MGZWeHVYRzVjZEZ4MEpIUmhjbWRsZEM1dlptWW9aWFpsYm5SektUdGNibHgwZlZ4dVhHNWNkQzhxS2x4dVhIUlVjbWxuWjJWeWN5QmhiaUJsZG1WdWRDQnZiaUIwYUdVZ1BIUmhZbXhsTHo0Z1pXeGxiV1Z1ZENCbWIzSWdZU0JuYVhabGJpQjBlWEJsSUhkcGRHZ2daMmwyWlc1Y2JseDBZWEpuZFcxbGJuUnpMQ0JoYkhOdklITmxkSFJwYm1jZ1lXNWtJR0ZzYkc5M2FXNW5JR0ZqWTJWemN5QjBieUIwYUdVZ2IzSnBaMmx1WVd4RmRtVnVkQ0JwWmx4dVhIUm5hWFpsYmk0Z1VtVjBkWEp1Y3lCMGFHVWdjbVZ6ZFd4MElHOW1JSFJvWlNCMGNtbG5aMlZ5WldRZ1pYWmxiblF1WEc1Y2JseDBRSEJ5YVhaaGRHVmNibHgwUUcxbGRHaHZaQ0IwY21sbloyVnlSWFpsYm5SY2JseDBRSEJoY21GdElIUjVjR1VnZTFOMGNtbHVaMzBnUlhabGJuUWdibUZ0WlZ4dVhIUkFjR0Z5WVcwZ1lYSm5jeUI3UVhKeVlYbDlJRUZ5Y21GNUlHOW1JR0Z5WjNWdFpXNTBjeUIwYnlCd1lYTnpJSFJvY205MVoyaGNibHgwUUhCaGNtRnRJRnR2Y21sbmFXNWhiRVYyWlc1MFhTQkpaaUJuYVhabGJpd2dhWE1nYzJWMElHOXVJSFJvWlNCbGRtVnVkQ0J2WW1wbFkzUmNibHgwUUhKbGRIVnliaUI3VFdsNFpXUjlJRkpsYzNWc2RDQnZaaUIwYUdVZ1pYWmxiblFnZEhKcFoyZGxjaUJoWTNScGIyNWNibHgwS2lvdlhHNWNkSFJ5YVdkblpYSkZkbVZ1ZENoMGVYQmxMQ0JoY21kekxDQnZjbWxuYVc1aGJFVjJaVzUwS1NCN1hHNWNkRngwYkdWMElHVjJaVzUwSUQwZ0pDNUZkbVZ1ZENoMGVYQmxLVHRjYmx4MFhIUnBaaWhsZG1WdWRDNXZjbWxuYVc1aGJFVjJaVzUwS1NCN1hHNWNkRngwWEhSbGRtVnVkQzV2Y21sbmFXNWhiRVYyWlc1MElEMGdKQzVsZUhSbGJtUW9lMzBzSUc5eWFXZHBibUZzUlhabGJuUXBPMXh1WEhSY2RIMWNibHh1WEhSY2RISmxkSFZ5YmlCMGFHbHpMaVIwWVdKc1pTNTBjbWxuWjJWeUtHVjJaVzUwTENCYmRHaHBjMTB1WTI5dVkyRjBLR0Z5WjNNZ2ZId2dXMTBwS1R0Y2JseDBmVnh1WEc1Y2RDOHFLbHh1WEhSRFlXeGpkV3hoZEdWeklHRWdkVzVwY1hWbElHTnZiSFZ0YmlCSlJDQm1iM0lnWVNCbmFYWmxiaUJqYjJ4MWJXNGdSRTlOUld4bGJXVnVkRnh1WEc1Y2RFQndjbWwyWVhSbFhHNWNkRUJ0WlhSb2IyUWdaMlZ1WlhKaGRHVkRiMngxYlc1SlpGeHVYSFJBY0dGeVlXMGdKR1ZzSUh0cVVYVmxjbmw5SUdwUmRXVnllUzEzY21Gd2NHVmtJR052YkhWdGJpQmxiR1Z0Wlc1MFhHNWNkRUJ5WlhSMWNtNGdlMU4wY21sdVozMGdRMjlzZFcxdUlFbEVYRzVjZENvcUwxeHVYSFJuWlc1bGNtRjBaVU52YkhWdGJrbGtLQ1JsYkNrZ2UxeHVYSFJjZEhKbGRIVnliaUIwYUdsekxpUjBZV0pzWlM1a1lYUmhLRVJCVkVGZlEwOU1WVTFPVTE5SlJDa2dLeUFuTFNjZ0t5QWtaV3d1WkdGMFlTaEVRVlJCWDBOUFRGVk5UbDlKUkNrN1hHNWNkSDFjYmx4dVhIUXZLaXBjYmx4MFVHRnljMlZ6SUdFZ1oybDJaVzRnUkU5TlJXeGxiV1Z1ZENkeklIZHBaSFJvSUdsdWRHOGdZU0JtYkc5aGRGeHVYRzVjZEVCd2NtbDJZWFJsWEc1Y2RFQnRaWFJvYjJRZ2NHRnljMlZYYVdSMGFGeHVYSFJBY0dGeVlXMGdaV3hsYldWdWRDQjdSRTlOUld4bGJXVnVkSDBnUld4bGJXVnVkQ0IwYnlCblpYUWdkMmxrZEdnZ2IyWmNibHgwUUhKbGRIVnliaUI3VG5WdFltVnlmU0JGYkdWdFpXNTBKM01nZDJsa2RHZ2dZWE1nWVNCbWJHOWhkRnh1WEhRcUtpOWNibHgwY0dGeWMyVlhhV1IwYUNobGJHVnRaVzUwS1NCN1hHNWNkRngwY21WMGRYSnVJR1ZzWlcxbGJuUWdQeUJ3WVhKelpVWnNiMkYwS0dWc1pXMWxiblF1YzNSNWJHVXVkMmxrZEdndWNtVndiR0ZqWlNnbmNIZ25MQ0FuSnlrcElEb2dNRHRjYmx4MGZWeHVYRzVjZEM4cUtseHVYSFJUWlhSeklIUm9aU0J3WlhKalpXNTBZV2RsSUhkcFpIUm9JRzltSUdFZ1oybDJaVzRnUkU5TlJXeGxiV1Z1ZEZ4dVhHNWNkRUJ3Y21sMllYUmxYRzVjZEVCdFpYUm9iMlFnYzJWMFYybGtkR2hjYmx4MFFIQmhjbUZ0SUdWc1pXMWxiblFnZTBSUFRVVnNaVzFsYm5SOUlFVnNaVzFsYm5RZ2RHOGdjMlYwSUhkcFpIUm9JRzl1WEc1Y2RFQndZWEpoYlNCM2FXUjBhQ0I3VG5WdFltVnlmU0JYYVdSMGFDd2dZWE1nWVNCd1pYSmpaVzUwWVdkbExDQjBieUJ6WlhSY2JseDBLaW92WEc1Y2RITmxkRmRwWkhSb0tHVnNaVzFsYm5Rc0lIZHBaSFJvS1NCN1hHNWNkRngwZDJsa2RHZ2dQU0IzYVdSMGFDNTBiMFpwZUdWa0tESXBPMXh1WEhSY2RIZHBaSFJvSUQwZ2QybGtkR2dnUGlBd0lEOGdkMmxrZEdnZ09pQXdPMXh1WEhSY2RHVnNaVzFsYm5RdWMzUjViR1V1ZDJsa2RHZ2dQU0IzYVdSMGFDQXJJQ2R3ZUNjN1hHNWNkSDFjYmx4dVhIUXZLaXBjYmx4MFEyOXVjM1J5WVdsdWN5QmhJR2RwZG1WdUlIZHBaSFJvSUhSdklIUm9aU0J0YVc1cGJYVnRJR0Z1WkNCdFlYaHBiWFZ0SUhKaGJtZGxjeUJrWldacGJtVmtJR2x1WEc1Y2RIUm9aU0JnYldsdVYybGtkR2hnSUdGdVpDQmdiV0Y0VjJsa2RHaGdJR052Ym1acFozVnlZWFJwYjI0Z2IzQjBhVzl1Y3l3Z2NtVnpjR1ZqZEdsMlpXeDVMbHh1WEc1Y2RFQndjbWwyWVhSbFhHNWNkRUJ0WlhSb2IyUWdZMjl1YzNSeVlXbHVWMmxrZEdoY2JseDBRSEJoY21GdElIZHBaSFJvSUh0T2RXMWlaWEo5SUZkcFpIUm9JSFJ2SUdOdmJuTjBjbUZwYmx4dVhIUkFjbVYwZFhKdUlIdE9kVzFpWlhKOUlFTnZibk4wY21GcGJtVmtJSGRwWkhSb1hHNWNkQ29xTDF4dVhIUmpiMjV6ZEhKaGFXNVhhV1IwYUNoM2FXUjBhQ2tnZTF4dVhIUmNkR2xtSUNoMGFHbHpMbTl3ZEdsdmJuTXViV2x1VjJsa2RHZ2dJVDBnZFc1a1pXWnBibVZrS1NCN1hHNWNkRngwWEhSM2FXUjBhQ0E5SUUxaGRHZ3ViV0Y0S0hSb2FYTXViM0IwYVc5dWN5NXRhVzVYYVdSMGFDd2dkMmxrZEdncE8xeHVYSFJjZEgxY2JseHVYSFJjZEdsbUlDaDBhR2x6TG05d2RHbHZibk11YldGNFYybGtkR2dnSVQwZ2RXNWtaV1pwYm1Wa0tTQjdYRzVjZEZ4MFhIUjNhV1IwYUNBOUlFMWhkR2d1YldsdUtIUm9hWE11YjNCMGFXOXVjeTV0WVhoWGFXUjBhQ3dnZDJsa2RHZ3BPMXh1WEhSY2RIMWNibHh1WEhSY2RISmxkSFZ5YmlCM2FXUjBhRHRjYmx4MGZWeHVYRzVjZEM4cUtseHVYSFJIYVhabGJpQmhJSEJoY25ScFkzVnNZWElnUlhabGJuUWdiMkpxWldOMExDQnlaWFJ5YVdWMlpYTWdkR2hsSUdOMWNuSmxiblFnY0c5cGJuUmxjaUJ2Wm1aelpYUWdZV3h2Ym1kY2JseDBkR2hsSUdodmNtbDZiMjUwWVd3Z1pHbHlaV04wYVc5dUxpQkJZMk52ZFc1MGN5Qm1iM0lnWW05MGFDQnlaV2QxYkdGeUlHMXZkWE5sSUdOc2FXTnJjeUJoY3lCM1pXeHNJR0Z6WEc1Y2RIQnZhVzUwWlhJdGJHbHJaU0J6ZVhOMFpXMXpJQ2h0YjJKcGJHVnpMQ0IwWVdKc1pYUnpJR1YwWXk0cFhHNWNibHgwUUhCeWFYWmhkR1ZjYmx4MFFHMWxkR2h2WkNCblpYUlFiMmx1ZEdWeVdGeHVYSFJBY0dGeVlXMGdaWFpsYm5RZ2UwOWlhbVZqZEgwZ1JYWmxiblFnYjJKcVpXTjBJR0Z6YzI5amFXRjBaV1FnZDJsMGFDQjBhR1VnYVc1MFpYSmhZM1JwYjI1Y2JseDBRSEpsZEhWeWJpQjdUblZ0WW1WeWZTQkliM0pwZW05dWRHRnNJSEJ2YVc1MFpYSWdiMlptYzJWMFhHNWNkQ29xTDF4dVhIUm5aWFJRYjJsdWRHVnlXQ2hsZG1WdWRDa2dlMXh1WEhSY2RHbG1JQ2hsZG1WdWRDNTBlWEJsTG1sdVpHVjRUMllvSjNSdmRXTm9KeWtnUFQwOUlEQXBJSHRjYmx4MFhIUmNkSEpsZEhWeWJpQW9aWFpsYm5RdWIzSnBaMmx1WVd4RmRtVnVkQzUwYjNWamFHVnpXekJkSUh4OElHVjJaVzUwTG05eWFXZHBibUZzUlhabGJuUXVZMmhoYm1kbFpGUnZkV05vWlhOYk1GMHBMbkJoWjJWWU8xeHVYSFJjZEgxY2JseDBYSFJ5WlhSMWNtNGdaWFpsYm5RdWNHRm5aVmc3WEc1Y2RIMWNibjFjYmx4dVVtVnphWHBoWW14bFEyOXNkVzF1Y3k1a1pXWmhkV3gwY3lBOUlIdGNibHgwYzJWc1pXTjBiM0k2SUdaMWJtTjBhVzl1S0NSMFlXSnNaU2tnZTF4dVhIUmNkR2xtS0NSMFlXSnNaUzVtYVc1a0tDZDBhR1ZoWkNjcExteGxibWQwYUNrZ2UxeHVYSFJjZEZ4MGNtVjBkWEp1SUZORlRFVkRWRTlTWDFSSU8xeHVYSFJjZEgxY2JseHVYSFJjZEhKbGRIVnliaUJUUlV4RlExUlBVbDlVUkR0Y2JseDBmU3hjYmx4MGMzUnZjbVU2SUhkcGJtUnZkeTV6ZEc5eVpTeGNibHgwYzNsdVkwaGhibVJzWlhKek9pQjBjblZsTEZ4dVhIUnlaWE5wZW1WR2NtOXRRbTlrZVRvZ2RISjFaU3hjYmx4MGJXRjRWMmxrZEdnNklHNTFiR3dzWEc1Y2RHMXBibGRwWkhSb09pQXdMakF4WEc1OU8xeHVYRzVTWlhOcGVtRmliR1ZEYjJ4MWJXNXpMbU52ZFc1MElEMGdNRHRjYmlJc0ltVjRjRzl5ZENCamIyNXpkQ0JFUVZSQlgwRlFTU0E5SUNkeVpYTnBlbUZpYkdWRGIyeDFiVzV6Snp0Y2JtVjRjRzl5ZENCamIyNXpkQ0JFUVZSQlgwTlBURlZOVGxOZlNVUWdQU0FuY21WemFYcGhZbXhsTFdOdmJIVnRibk10YVdRbk8xeHVaWGh3YjNKMElHTnZibk4wSUVSQlZFRmZRMDlNVlUxT1gwbEVJRDBnSjNKbGMybDZZV0pzWlMxamIyeDFiVzR0YVdRbk8xeHVaWGh3YjNKMElHTnZibk4wSUVSQlZFRmZWRWdnUFNBbmRHZ25PMXh1WEc1bGVIQnZjblFnWTI5dWMzUWdRMHhCVTFOZlZFRkNURVZmVWtWVFNWcEpUa2NnUFNBbmNtTXRkR0ZpYkdVdGNtVnphWHBwYm1jbk8xeHVaWGh3YjNKMElHTnZibk4wSUVOTVFWTlRYME5QVEZWTlRsOVNSVk5KV2tsT1J5QTlJQ2R5WXkxamIyeDFiVzR0Y21WemFYcHBibWNuTzF4dVpYaHdiM0owSUdOdmJuTjBJRU5NUVZOVFgwaEJUa1JNUlNBOUlDZHlZeTFvWVc1a2JHVW5PMXh1Wlhod2IzSjBJR052Ym5OMElFTk1RVk5UWDBoQlRrUk1SVjlEVDA1VVFVbE9SVklnUFNBbmNtTXRhR0Z1Wkd4bExXTnZiblJoYVc1bGNpYzdYRzVjYm1WNGNHOXlkQ0JqYjI1emRDQkZWa1ZPVkY5U1JWTkpXa1ZmVTFSQlVsUWdQU0FuWTI5c2RXMXVPbkpsYzJsNlpUcHpkR0Z5ZENjN1hHNWxlSEJ2Y25RZ1kyOXVjM1FnUlZaRlRsUmZVa1ZUU1ZwRklEMGdKMk52YkhWdGJqcHlaWE5wZW1Vbk8xeHVaWGh3YjNKMElHTnZibk4wSUVWV1JVNVVYMUpGVTBsYVJWOVRWRTlRSUQwZ0oyTnZiSFZ0YmpweVpYTnBlbVU2YzNSdmNDYzdYRzVjYm1WNGNHOXlkQ0JqYjI1emRDQlRSVXhGUTFSUFVsOVVTQ0E5SUNkMGNqcG1hWEp6ZENBK0lIUm9PblpwYzJsaWJHVW5PMXh1Wlhod2IzSjBJR052Ym5OMElGTkZURVZEVkU5U1gxUkVJRDBnSjNSeU9tWnBjbk4wSUQ0Z2RHUTZkbWx6YVdKc1pTYzdYRzVsZUhCdmNuUWdZMjl1YzNRZ1UwVk1SVU5VVDFKZlZVNVNSVk5KV2tGQ1RFVWdQU0JnVzJSaGRHRXRibTl5WlhOcGVtVmRZRHRjYmlJc0ltbHRjRzl5ZENCU1pYTnBlbUZpYkdWRGIyeDFiVzV6SUdaeWIyMGdKeTR2WTJ4aGMzTW5PMXh1YVcxd2IzSjBJR0ZrWVhCMFpYSWdabkp2YlNBbkxpOWhaR0Z3ZEdWeUp6dGNibHh1Wlhod2IzSjBJR1JsWm1GMWJIUWdVbVZ6YVhwaFlteGxRMjlzZFcxdWN6c2lYWDA9In0=
