/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Sun Jun 21 2020 15:22:05 GMT+0500 (Yekaterinburg Standard Time)
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
				_this2.setWidth($el[0], $el.outerWidth() / _this2.$table.width() * 100);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHFCQUFVLENBQUM7QUFDaEMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNULE1BQUcsR0FBRyx1QkFBcUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BELFNBQU0sQ0FBQyxJQUFJLHNCQUFXLEdBQUcsQ0FBQyxDQUFDO0dBQzNCLE1BRUksSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7OztBQUM3QyxVQUFPLFFBQUEsR0FBRyxFQUFDLGVBQWUsT0FBQyxPQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0hqQyxhQUFhOzs7Ozs7Ozs7OztJQVVHLGdCQUFnQjtBQUN6QixVQURTLGdCQUFnQixDQUN4QixNQUFNLEVBQUUsT0FBTyxFQUFFO3dCQURULGdCQUFnQjs7QUFFbkMsTUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixNQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGdC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QUFHLHVCQUF1QixDQUFDOztBQUM1QyxJQUFNLG9CQUFvQixvQkFBb0IsQ0FBQzs7Ozs7Ozs7Ozs7O3FCQ2hCekIsU0FBUzs7Ozt1QkFDbEIsV0FBVyIsImZpbGUiOiJqcXVlcnkucmVzaXphYmxlQ29sdW1ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IFJlc2l6YWJsZUNvbHVtbnMgZnJvbSAnLi9jbGFzcyc7XG5pbXBvcnQge0RBVEFfQVBJfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbiQuZm4ucmVzaXphYmxlQ29sdW1ucyA9IGZ1bmN0aW9uKG9wdGlvbnNPck1ldGhvZCwgLi4uYXJncykge1xuXHRyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdGxldCAkdGFibGUgPSAkKHRoaXMpO1xuXG5cdFx0bGV0IGFwaSA9ICR0YWJsZS5kYXRhKERBVEFfQVBJKTtcblx0XHRpZiAoIWFwaSkge1xuXHRcdFx0YXBpID0gbmV3IFJlc2l6YWJsZUNvbHVtbnMoJHRhYmxlLCBvcHRpb25zT3JNZXRob2QpO1xuXHRcdFx0JHRhYmxlLmRhdGEoREFUQV9BUEksIGFwaSk7XG5cdFx0fVxuXG5cdFx0ZWxzZSBpZiAodHlwZW9mIG9wdGlvbnNPck1ldGhvZCA9PT0gJ3N0cmluZycpIHtcblx0XHRcdHJldHVybiBhcGlbb3B0aW9uc09yTWV0aG9kXSguLi5hcmdzKTtcblx0XHR9XG5cdH0pO1xufTtcblxuJC5yZXNpemFibGVDb2x1bW5zID0gUmVzaXphYmxlQ29sdW1ucztcbiIsImltcG9ydCB7XG5cdERBVEFfQVBJLFxuXHREQVRBX0NPTFVNTlNfSUQsXG5cdERBVEFfQ09MVU1OX0lELFxuXHREQVRBX1RILFxuXHRDTEFTU19UQUJMRV9SRVNJWklORyxcblx0Q0xBU1NfQ09MVU1OX1JFU0laSU5HLFxuXHRDTEFTU19IQU5ETEUsXG5cdENMQVNTX0hBTkRMRV9DT05UQUlORVIsXG5cdEVWRU5UX1JFU0laRV9TVEFSVCxcblx0RVZFTlRfUkVTSVpFLFxuXHRFVkVOVF9SRVNJWkVfU1RPUCxcblx0U0VMRUNUT1JfVEgsXG5cdFNFTEVDVE9SX1RELFxuXHRTRUxFQ1RPUl9VTlJFU0laQUJMRVxufVxuZnJvbSAnLi9jb25zdGFudHMnO1xuXG4vKipcblRha2VzIGEgPHRhYmxlIC8+IGVsZW1lbnQgYW5kIG1ha2VzIGl0J3MgY29sdW1ucyByZXNpemFibGUgYWNyb3NzIGJvdGhcbm1vYmlsZSBhbmQgZGVza3RvcCBjbGllbnRzLlxuXG5AY2xhc3MgUmVzaXphYmxlQ29sdW1uc1xuQHBhcmFtICR0YWJsZSB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCA8dGFibGU+IGVsZW1lbnQgdG8gbWFrZSByZXNpemFibGVcbkBwYXJhbSBvcHRpb25zIHtPYmplY3R9IENvbmZpZ3VyYXRpb24gb2JqZWN0XG4qKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc2l6YWJsZUNvbHVtbnMge1xuXHRjb25zdHJ1Y3RvcigkdGFibGUsIG9wdGlvbnMpIHtcblx0XHR0aGlzLm5zID0gJy5yYycgKyB0aGlzLmNvdW50Kys7XG5cblx0XHR0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgUmVzaXphYmxlQ29sdW1ucy5kZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLiR3aW5kb3cgPSAkKHdpbmRvdyk7XG5cdFx0dGhpcy4kb3duZXJEb2N1bWVudCA9ICQoJHRhYmxlWzBdLm93bmVyRG9jdW1lbnQpO1xuXHRcdHRoaXMuJHRhYmxlID0gJHRhYmxlO1xuXG5cdFx0dGhpcy5yZWZyZXNoSGVhZGVycygpO1xuXHRcdHRoaXMucmVzdG9yZUNvbHVtbldpZHRocygpO1xuXHRcdHRoaXMuc3luY0hhbmRsZVdpZHRocygpO1xuXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMuc3luY0hhbmRsZVdpZHRocy5iaW5kKHRoaXMpKTtcblxuXHRcdGlmICh0aGlzLm9wdGlvbnMuc3RhcnQpIHtcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFX1NUQVJULCB0aGlzLm9wdGlvbnMuc3RhcnQpO1xuXHRcdH1cblx0XHRpZiAodGhpcy5vcHRpb25zLnJlc2l6ZSkge1xuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkUsIHRoaXMub3B0aW9ucy5yZXNpemUpO1xuXHRcdH1cblx0XHRpZiAodGhpcy5vcHRpb25zLnN0b3ApIHtcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFX1NUT1AsIHRoaXMub3B0aW9ucy5zdG9wKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0UmVmcmVzaGVzIHRoZSBoZWFkZXJzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGluc3RhbmNlcyA8dGFibGUvPiBlbGVtZW50IGFuZFxuXHRnZW5lcmF0ZXMgaGFuZGxlcyBmb3IgdGhlbS4gQWxzbyBhc3NpZ25zIHBlcmNlbnRhZ2Ugd2lkdGhzLlxuXG5cdEBtZXRob2QgcmVmcmVzaEhlYWRlcnNcblx0KiovXG5cdHJlZnJlc2hIZWFkZXJzKCkge1xuXHRcdC8vIEFsbG93IHRoZSBzZWxlY3RvciB0byBiZSBib3RoIGEgcmVndWxhciBzZWxjdG9yIHN0cmluZyBhcyB3ZWxsIGFzXG5cdFx0Ly8gYSBkeW5hbWljIGNhbGxiYWNrXG5cdFx0bGV0IHNlbGVjdG9yID0gdGhpcy5vcHRpb25zLnNlbGVjdG9yO1xuXHRcdGlmKHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5jYWxsKHRoaXMsIHRoaXMuJHRhYmxlKTtcblx0XHR9XG5cblx0XHQvLyBTZWxlY3QgYWxsIHRhYmxlIGhlYWRlcnNcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMgPSB0aGlzLiR0YWJsZS5maW5kKHNlbGVjdG9yKTtcblxuXHRcdC8vIEFzc2lnbiBwZXJjZW50YWdlIHdpZHRocyBmaXJzdCwgdGhlbiBjcmVhdGUgZHJhZyBoYW5kbGVzXG5cdFx0dGhpcy5hc3NpZ25QZXJjZW50YWdlV2lkdGhzKCk7XG5cdFx0dGhpcy5jcmVhdGVIYW5kbGVzKCk7XG5cdH1cblxuXHQvKipcblx0Q3JlYXRlcyBkdW1teSBoYW5kbGUgZWxlbWVudHMgZm9yIGFsbCB0YWJsZSBoZWFkZXIgY29sdW1uc1xuXG5cdEBtZXRob2QgY3JlYXRlSGFuZGxlc1xuXHQqKi9cblx0Y3JlYXRlSGFuZGxlcygpIHtcblx0XHRsZXQgcmVmID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyO1xuXHRcdGlmIChyZWYgIT0gbnVsbCkge1xuXHRcdFx0cmVmLnJlbW92ZSgpO1xuXHRcdH1cblxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lciA9ICQoYDxkaXYgY2xhc3M9JyR7Q0xBU1NfSEFORExFX0NPTlRBSU5FUn0nIC8+YClcblx0XHR0aGlzLiR0YWJsZS5iZWZvcmUodGhpcy4kaGFuZGxlQ29udGFpbmVyKTtcblxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChpLCBlbCkgPT4ge1xuXHRcdFx0bGV0ICRjdXJyZW50ID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGkpO1xuXHRcdFx0bGV0ICRuZXh0ID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGkgKyAxKTtcblxuXHRcdFx0aWYgKCRuZXh0Lmxlbmd0aCA9PT0gMCB8fCAkY3VycmVudC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkgfHwgJG5leHQuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0ICRoYW5kbGUgPSAkKGA8ZGl2IGNsYXNzPScke0NMQVNTX0hBTkRMRX0nIC8+YClcblx0XHRcdFx0LmRhdGEoREFUQV9USCwgJChlbCkpXG5cdFx0XHRcdC5hcHBlbmRUbyh0aGlzLiRoYW5kbGVDb250YWluZXIpO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJGhhbmRsZUNvbnRhaW5lciwgWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddLCAnLicrQ0xBU1NfSEFORExFLCB0aGlzLm9uUG9pbnRlckRvd24uYmluZCh0aGlzKSk7XG5cdH1cblxuXHQvKipcblx0QXNzaWducyBhIHBlcmNlbnRhZ2Ugd2lkdGggdG8gYWxsIGNvbHVtbnMgYmFzZWQgb24gdGhlaXIgY3VycmVudCBwaXhlbCB3aWR0aChzKVxuXG5cdEBtZXRob2QgYXNzaWduUGVyY2VudGFnZVdpZHRoc1xuXHQqKi9cblx0YXNzaWduUGVyY2VudGFnZVdpZHRocygpIHtcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcblx0XHRcdHRoaXMuc2V0V2lkdGgoJGVsWzBdLCAkZWwub3V0ZXJXaWR0aCgpIC8gdGhpcy4kdGFibGUud2lkdGgoKSAqIDEwMCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblxuXG5cdEBtZXRob2Qgc3luY0hhbmRsZVdpZHRoc1xuXHQqKi9cblx0c3luY0hhbmRsZVdpZHRocygpIHtcblx0XHRsZXQgJGNvbnRhaW5lciA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lclxuXG5cdFx0JGNvbnRhaW5lci53aWR0aCh0aGlzLiR0YWJsZS53aWR0aCgpKTtcblxuXHRcdCRjb250YWluZXIuZmluZCgnLicrQ0xBU1NfSEFORExFKS5lYWNoKChfLCBlbCkgPT4ge1xuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xuXG5cdFx0XHRsZXQgaGVpZ2h0ID0gdGhpcy5vcHRpb25zLnJlc2l6ZUZyb21Cb2R5ID9cblx0XHRcdFx0dGhpcy4kdGFibGUuaGVpZ2h0KCkgOlxuXHRcdFx0XHR0aGlzLiR0YWJsZS5maW5kKCd0aGVhZCcpLmhlaWdodCgpO1xuXG5cdFx0XHRsZXQgbGVmdCA9ICRlbC5kYXRhKERBVEFfVEgpLm91dGVyV2lkdGgoKSArIChcblx0XHRcdFx0JGVsLmRhdGEoREFUQV9USCkub2Zmc2V0KCkubGVmdCAtIHRoaXMuJGhhbmRsZUNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0XG5cdFx0XHQpO1xuXG5cdFx0XHQkZWwuY3NzKHsgbGVmdCwgaGVpZ2h0IH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdFBlcnNpc3RzIHRoZSBjb2x1bW4gd2lkdGhzIGluIGxvY2FsU3RvcmFnZVxuXG5cdEBtZXRob2Qgc2F2ZUNvbHVtbldpZHRoc1xuXHQqKi9cblx0c2F2ZUNvbHVtbldpZHRocygpIHtcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcblxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5zdG9yZSAmJiAhJGVsLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xuXHRcdFx0XHR0aGlzLm9wdGlvbnMuc3RvcmUuc2V0KFxuXHRcdFx0XHRcdHRoaXMuZ2VuZXJhdGVDb2x1bW5JZCgkZWwpLFxuXHRcdFx0XHRcdHRoaXMucGFyc2VXaWR0aChlbClcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHRSZXRyaWV2ZXMgYW5kIHNldHMgdGhlIGNvbHVtbiB3aWR0aHMgZnJvbSBsb2NhbFN0b3JhZ2VcblxuXHRAbWV0aG9kIHJlc3RvcmVDb2x1bW5XaWR0aHNcblx0KiovXG5cdHJlc3RvcmVDb2x1bW5XaWR0aHMoKSB7XG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XG5cblx0XHRcdGlmKHRoaXMub3B0aW9ucy5zdG9yZSAmJiAhJGVsLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xuXHRcdFx0XHRsZXQgd2lkdGggPSB0aGlzLm9wdGlvbnMuc3RvcmUuZ2V0KFxuXHRcdFx0XHRcdHRoaXMuZ2VuZXJhdGVDb2x1bW5JZCgkZWwpXG5cdFx0XHRcdCk7XG5cblx0XHRcdFx0aWYod2lkdGggIT0gbnVsbCkge1xuXHRcdFx0XHRcdHRoaXMuc2V0V2lkdGgoZWwsIHdpZHRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdFBvaW50ZXIvbW91c2UgZG93biBoYW5kbGVyXG5cblx0QG1ldGhvZCBvblBvaW50ZXJEb3duXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxuXHQqKi9cblx0b25Qb2ludGVyRG93bihldmVudCkge1xuXHRcdC8vIE9ubHkgYXBwbGllcyB0byBsZWZ0LWNsaWNrIGRyYWdnaW5nXG5cdFx0aWYoZXZlbnQud2hpY2ggIT09IDEpIHsgcmV0dXJuOyB9XG5cblx0XHQvLyBJZiBhIHByZXZpb3VzIG9wZXJhdGlvbiBpcyBkZWZpbmVkLCB3ZSBtaXNzZWQgdGhlIGxhc3QgbW91c2V1cC5cblx0XHQvLyBQcm9iYWJseSBnb2JibGVkIHVwIGJ5IHVzZXIgbW91c2luZyBvdXQgdGhlIHdpbmRvdyB0aGVuIHJlbGVhc2luZy5cblx0XHQvLyBXZSdsbCBzaW11bGF0ZSBhIHBvaW50ZXJ1cCBoZXJlIHByaW9yIHRvIGl0XG5cdFx0aWYodGhpcy5vcGVyYXRpb24pIHtcblx0XHRcdHRoaXMub25Qb2ludGVyVXAoZXZlbnQpO1xuXHRcdH1cblxuXHRcdC8vIElnbm9yZSBub24tcmVzaXphYmxlIGNvbHVtbnNcblx0XHRsZXQgJGN1cnJlbnRHcmlwID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcblx0XHRpZigkY3VycmVudEdyaXAuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGV0IGdyaXBJbmRleCA9ICRjdXJyZW50R3JpcC5pbmRleCgpO1xuXHRcdGxldCAkbGVmdENvbHVtbiA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShncmlwSW5kZXgpLm5vdChTRUxFQ1RPUl9VTlJFU0laQUJMRSk7XG5cdFx0bGV0ICRyaWdodENvbHVtbiA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShncmlwSW5kZXggKyAxKS5ub3QoU0VMRUNUT1JfVU5SRVNJWkFCTEUpO1xuXG5cdFx0bGV0IGxlZnRXaWR0aCA9IHRoaXMucGFyc2VXaWR0aCgkbGVmdENvbHVtblswXSk7XG5cdFx0bGV0IHJpZ2h0V2lkdGggPSB0aGlzLnBhcnNlV2lkdGgoJHJpZ2h0Q29sdW1uWzBdKTtcblxuXHRcdHRoaXMub3BlcmF0aW9uID0ge1xuXHRcdFx0JGxlZnRDb2x1bW4sICRyaWdodENvbHVtbiwgJGN1cnJlbnRHcmlwLFxuXG5cdFx0XHRzdGFydFg6IHRoaXMuZ2V0UG9pbnRlclgoZXZlbnQpLFxuXHRcdFx0c3RhcnRUYWJsZVdpZHRoOiB0aGlzLiR0YWJsZS53aWR0aCgpLFxuXG5cdFx0XHR3aWR0aHM6IHtcblx0XHRcdFx0bGVmdDogbGVmdFdpZHRoLFxuXHRcdFx0XHRyaWdodDogcmlnaHRXaWR0aFxuXHRcdFx0fSxcblx0XHRcdG5ld1dpZHRoczoge1xuXHRcdFx0XHRsZWZ0OiBsZWZ0V2lkdGgsXG5cdFx0XHRcdHJpZ2h0OiByaWdodFdpZHRoXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiRvd25lckRvY3VtZW50LCBbJ21vdXNlbW92ZScsICd0b3VjaG1vdmUnXSwgdGhpcy5vblBvaW50ZXJNb3ZlLmJpbmQodGhpcykpO1xuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiRvd25lckRvY3VtZW50LCBbJ21vdXNldXAnLCAndG91Y2hlbmQnXSwgdGhpcy5vblBvaW50ZXJVcC5iaW5kKHRoaXMpKTtcblxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lclxuXHRcdFx0LmFkZCh0aGlzLiR0YWJsZSlcblx0XHRcdC5hZGRDbGFzcyhDTEFTU19UQUJMRV9SRVNJWklORyk7XG5cblx0XHQkbGVmdENvbHVtblxuXHRcdFx0LmFkZCgkcmlnaHRDb2x1bW4pXG5cdFx0XHQuYWRkKCRjdXJyZW50R3JpcClcblx0XHRcdC5hZGRDbGFzcyhDTEFTU19DT0xVTU5fUkVTSVpJTkcpO1xuXG5cdFx0dGhpcy50cmlnZ2VyRXZlbnQoRVZFTlRfUkVTSVpFX1NUQVJULCBbXG5cdFx0XHQkbGVmdENvbHVtbiwgJHJpZ2h0Q29sdW1uLFxuXHRcdFx0bGVmdFdpZHRoLCByaWdodFdpZHRoXG5cdFx0XSxcblx0XHRldmVudCk7XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9XG5cblx0LyoqXG5cdFBvaW50ZXIvbW91c2UgbW92ZW1lbnQgaGFuZGxlclxuXG5cdEBtZXRob2Qgb25Qb2ludGVyTW92ZVxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cblx0KiovXG5cdG9uUG9pbnRlck1vdmUoZXZlbnQpIHtcblx0XHRsZXQgb3AgPSB0aGlzLm9wZXJhdGlvbjtcblx0XHRpZighdGhpcy5vcGVyYXRpb24pIHsgcmV0dXJuOyB9XG5cblx0XHQvLyBEZXRlcm1pbmUgdGhlIGRlbHRhIGNoYW5nZSBiZXR3ZWVuIHN0YXJ0IGFuZCBuZXcgbW91c2UgcG9zaXRpb24sIGFzIGEgcGVyY2VudGFnZSBvZiB0aGUgdGFibGUgd2lkdGhcblx0XHRsZXQgZGlmZmVyZW5jZSA9ICh0aGlzLmdldFBvaW50ZXJYKGV2ZW50KSAtIG9wLnN0YXJ0WCk7XG5cdFx0aWYoZGlmZmVyZW5jZSA9PT0gMCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBsZWZ0Q29sdW1uID0gb3AuJGxlZnRDb2x1bW5bMF07XG5cdFx0bGV0IHJpZ2h0Q29sdW1uID0gb3AuJHJpZ2h0Q29sdW1uWzBdO1xuXHRcdGxldCB3aWR0aExlZnQsIHdpZHRoUmlnaHQsIHdpZHRoVGFibGU7XG5cblx0XHRpZihkaWZmZXJlbmNlID4gMCkge1xuXHRcdFx0d2lkdGhMZWZ0ID0gdGhpcy5jb25zdHJhaW5XaWR0aChvcC53aWR0aHMubGVmdCArIGRpZmZlcmVuY2UpO1xuXHRcdFx0d2lkdGhSaWdodCA9IHRoaXMuY29uc3RyYWluV2lkdGgob3Aud2lkdGhzLnJpZ2h0KTtcblx0XHRcdHdpZHRoVGFibGUgPSB0aGlzLmNvbnN0cmFpbldpZHRoKG9wLnN0YXJ0VGFibGVXaWR0aCArIGRpZmZlcmVuY2UpO1xuXHRcdH1cblx0XHRlbHNlIGlmKGRpZmZlcmVuY2UgPCAwKSB7XG5cdFx0XHR3aWR0aExlZnQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKG9wLndpZHRocy5sZWZ0ICsgZGlmZmVyZW5jZSk7XG5cdFx0XHR3aWR0aFJpZ2h0ID0gdGhpcy5jb25zdHJhaW5XaWR0aChvcC53aWR0aHMucmlnaHQpO1xuXHRcdFx0d2lkdGhUYWJsZSA9IHRoaXMuY29uc3RyYWluV2lkdGgob3Auc3RhcnRUYWJsZVdpZHRoICsgZGlmZmVyZW5jZSk7XG5cdFx0fVxuXG5cdFx0aWYobGVmdENvbHVtbikge1xuXHRcdFx0dGhpcy5zZXRXaWR0aChsZWZ0Q29sdW1uLCB3aWR0aExlZnQpO1xuXHRcdH1cblx0XHRpZihyaWdodENvbHVtbikge1xuXHRcdFx0dGhpcy5zZXRXaWR0aChyaWdodENvbHVtbiwgd2lkdGhSaWdodCk7XG5cdFx0fVxuXHRcdGlmICh3aWR0aFRhYmxlKSB7XG5cdFx0XHR0aGlzLiR0YWJsZS5jc3MoXCJ3aWR0aFwiLCB3aWR0aFRhYmxlICsgXCJweFwiKTtcblx0XHR9XG5cblx0XHRvcC5uZXdXaWR0aHMubGVmdCA9IHdpZHRoTGVmdDtcblx0XHRvcC5uZXdXaWR0aHMucmlnaHQgPSB3aWR0aFJpZ2h0O1xuXHRcdG9wLm5ld1dpZHRocy50YWJsZSA9IHdpZHRoVGFibGU7XG5cblx0XHRyZXR1cm4gdGhpcy50cmlnZ2VyRXZlbnQoRVZFTlRfUkVTSVpFLCBbXG5cdFx0XHRvcC4kbGVmdENvbHVtbiwgb3AuJHJpZ2h0Q29sdW1uLFxuXHRcdFx0d2lkdGhMZWZ0LCB3aWR0aFJpZ2h0XG5cdFx0XSxcblx0XHRldmVudCk7XG5cdH1cblxuXHQvKipcblx0UG9pbnRlci9tb3VzZSByZWxlYXNlIGhhbmRsZXJcblxuXHRAbWV0aG9kIG9uUG9pbnRlclVwXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxuXHQqKi9cblx0b25Qb2ludGVyVXAoZXZlbnQpIHtcblx0XHRsZXQgb3AgPSB0aGlzLm9wZXJhdGlvbjtcblx0XHRpZighdGhpcy5vcGVyYXRpb24pIHsgcmV0dXJuOyB9XG5cblx0XHR0aGlzLnVuYmluZEV2ZW50cyh0aGlzLiRvd25lckRvY3VtZW50LCBbJ21vdXNldXAnLCAndG91Y2hlbmQnLCAnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZSddKTtcblxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lclxuXHRcdFx0LmFkZCh0aGlzLiR0YWJsZSlcblx0XHRcdC5yZW1vdmVDbGFzcyhDTEFTU19UQUJMRV9SRVNJWklORyk7XG5cblx0XHRvcC4kbGVmdENvbHVtblxuXHRcdFx0LmFkZChvcC4kcmlnaHRDb2x1bW4pXG5cdFx0XHQuYWRkKG9wLiRjdXJyZW50R3JpcClcblx0XHRcdC5yZW1vdmVDbGFzcyhDTEFTU19DT0xVTU5fUkVTSVpJTkcpO1xuXG5cdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzKCk7XG5cdFx0dGhpcy5zYXZlQ29sdW1uV2lkdGhzKCk7XG5cblx0XHR0aGlzLm9wZXJhdGlvbiA9IG51bGw7XG5cblx0XHRyZXR1cm4gdGhpcy50cmlnZ2VyRXZlbnQoRVZFTlRfUkVTSVpFX1NUT1AsIFtcblx0XHRcdG9wLiRsZWZ0Q29sdW1uLCBvcC4kcmlnaHRDb2x1bW4sXG5cdFx0XHRvcC5uZXdXaWR0aHMubGVmdCwgb3AubmV3V2lkdGhzLnJpZ2h0XG5cdFx0XSxcblx0XHRldmVudCk7XG5cdH1cblxuXHQvKipcblx0UmVtb3ZlcyBhbGwgZXZlbnQgbGlzdGVuZXJzLCBkYXRhLCBhbmQgYWRkZWQgRE9NIGVsZW1lbnRzLiBUYWtlc1xuXHR0aGUgPHRhYmxlLz4gZWxlbWVudCBiYWNrIHRvIGhvdyBpdCB3YXMsIGFuZCByZXR1cm5zIGl0XG5cblx0QG1ldGhvZCBkZXN0cm95XG5cdEByZXR1cm4ge2pRdWVyeX0gT3JpZ2luYWwgalF1ZXJ5LXdyYXBwZWQgPHRhYmxlPiBlbGVtZW50XG5cdCoqL1xuXHRkZXN0cm95KCkge1xuXHRcdGxldCAkdGFibGUgPSB0aGlzLiR0YWJsZTtcblx0XHRsZXQgJGhhbmRsZXMgPSB0aGlzLiRoYW5kbGVDb250YWluZXIuZmluZCgnLicrQ0xBU1NfSEFORExFKTtcblxuXHRcdHRoaXMudW5iaW5kRXZlbnRzKFxuXHRcdFx0dGhpcy4kd2luZG93XG5cdFx0XHRcdC5hZGQodGhpcy4kb3duZXJEb2N1bWVudClcblx0XHRcdFx0LmFkZCh0aGlzLiR0YWJsZSlcblx0XHRcdFx0LmFkZCgkaGFuZGxlcylcblx0XHQpO1xuXG5cdFx0JGhhbmRsZXMucmVtb3ZlRGF0YShEQVRBX1RIKTtcblx0XHQkdGFibGUucmVtb3ZlRGF0YShEQVRBX0FQSSk7XG5cblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIucmVtb3ZlKCk7XG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyID0gbnVsbDtcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMgPSBudWxsO1xuXHRcdHRoaXMuJHRhYmxlID0gbnVsbDtcblxuXHRcdHJldHVybiAkdGFibGU7XG5cdH1cblxuXHQvKipcblx0QmluZHMgZ2l2ZW4gZXZlbnRzIGZvciB0aGlzIGluc3RhbmNlIHRvIHRoZSBnaXZlbiB0YXJnZXQgRE9NRWxlbWVudFxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgYmluZEV2ZW50c1xuXHRAcGFyYW0gdGFyZ2V0IHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnQgdG8gYmluZCBldmVudHMgdG9cblx0QHBhcmFtIGV2ZW50cyB7U3RyaW5nfEFycmF5fSBFdmVudCBuYW1lIChvciBhcnJheSBvZikgdG8gYmluZFxuXHRAcGFyYW0gc2VsZWN0b3JPckNhbGxiYWNrIHtTdHJpbmd8RnVuY3Rpb259IFNlbGVjdG9yIHN0cmluZyBvciBjYWxsYmFja1xuXHRAcGFyYW0gW2NhbGxiYWNrXSB7RnVuY3Rpb259IENhbGxiYWNrIG1ldGhvZFxuXHQqKi9cblx0YmluZEV2ZW50cygkdGFyZ2V0LCBldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjaywgY2FsbGJhY2spIHtcblx0XHRpZih0eXBlb2YgZXZlbnRzID09PSAnc3RyaW5nJykge1xuXHRcdFx0ZXZlbnRzID0gZXZlbnRzICsgdGhpcy5ucztcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRldmVudHMgPSBldmVudHMuam9pbih0aGlzLm5zICsgJyAnKSArIHRoaXMubnM7XG5cdFx0fVxuXG5cdFx0aWYoYXJndW1lbnRzLmxlbmd0aCA+IDMpIHtcblx0XHRcdCR0YXJnZXQub24oZXZlbnRzLCBzZWxlY3Rvck9yQ2FsbGJhY2ssIGNhbGxiYWNrKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHQkdGFyZ2V0Lm9uKGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0VW5iaW5kcyBldmVudHMgc3BlY2lmaWMgdG8gdGhpcyBpbnN0YW5jZSBmcm9tIHRoZSBnaXZlbiB0YXJnZXQgRE9NRWxlbWVudFxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgdW5iaW5kRXZlbnRzXG5cdEBwYXJhbSB0YXJnZXQge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0byB1bmJpbmQgZXZlbnRzIGZyb21cblx0QHBhcmFtIGV2ZW50cyB7U3RyaW5nfEFycmF5fSBFdmVudCBuYW1lIChvciBhcnJheSBvZikgdG8gdW5iaW5kXG5cdCoqL1xuXHR1bmJpbmRFdmVudHMoJHRhcmdldCwgZXZlbnRzKSB7XG5cdFx0aWYodHlwZW9mIGV2ZW50cyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdGV2ZW50cyA9IGV2ZW50cyArIHRoaXMubnM7XG5cdFx0fVxuXHRcdGVsc2UgaWYoZXZlbnRzICE9IG51bGwpIHtcblx0XHRcdGV2ZW50cyA9IGV2ZW50cy5qb2luKHRoaXMubnMgKyAnICcpICsgdGhpcy5ucztcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRldmVudHMgPSB0aGlzLm5zO1xuXHRcdH1cblxuXHRcdCR0YXJnZXQub2ZmKGV2ZW50cyk7XG5cdH1cblxuXHQvKipcblx0VHJpZ2dlcnMgYW4gZXZlbnQgb24gdGhlIDx0YWJsZS8+IGVsZW1lbnQgZm9yIGEgZ2l2ZW4gdHlwZSB3aXRoIGdpdmVuXG5cdGFyZ3VtZW50cywgYWxzbyBzZXR0aW5nIGFuZCBhbGxvd2luZyBhY2Nlc3MgdG8gdGhlIG9yaWdpbmFsRXZlbnQgaWZcblx0Z2l2ZW4uIFJldHVybnMgdGhlIHJlc3VsdCBvZiB0aGUgdHJpZ2dlcmVkIGV2ZW50LlxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgdHJpZ2dlckV2ZW50XG5cdEBwYXJhbSB0eXBlIHtTdHJpbmd9IEV2ZW50IG5hbWVcblx0QHBhcmFtIGFyZ3Mge0FycmF5fSBBcnJheSBvZiBhcmd1bWVudHMgdG8gcGFzcyB0aHJvdWdoXG5cdEBwYXJhbSBbb3JpZ2luYWxFdmVudF0gSWYgZ2l2ZW4sIGlzIHNldCBvbiB0aGUgZXZlbnQgb2JqZWN0XG5cdEByZXR1cm4ge01peGVkfSBSZXN1bHQgb2YgdGhlIGV2ZW50IHRyaWdnZXIgYWN0aW9uXG5cdCoqL1xuXHR0cmlnZ2VyRXZlbnQodHlwZSwgYXJncywgb3JpZ2luYWxFdmVudCkge1xuXHRcdGxldCBldmVudCA9ICQuRXZlbnQodHlwZSk7XG5cdFx0aWYoZXZlbnQub3JpZ2luYWxFdmVudCkge1xuXHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudCA9ICQuZXh0ZW5kKHt9LCBvcmlnaW5hbEV2ZW50KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy4kdGFibGUudHJpZ2dlcihldmVudCwgW3RoaXNdLmNvbmNhdChhcmdzIHx8IFtdKSk7XG5cdH1cblxuXHQvKipcblx0Q2FsY3VsYXRlcyBhIHVuaXF1ZSBjb2x1bW4gSUQgZm9yIGEgZ2l2ZW4gY29sdW1uIERPTUVsZW1lbnRcblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIGdlbmVyYXRlQ29sdW1uSWRcblx0QHBhcmFtICRlbCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBjb2x1bW4gZWxlbWVudFxuXHRAcmV0dXJuIHtTdHJpbmd9IENvbHVtbiBJRFxuXHQqKi9cblx0Z2VuZXJhdGVDb2x1bW5JZCgkZWwpIHtcblx0XHRyZXR1cm4gdGhpcy4kdGFibGUuZGF0YShEQVRBX0NPTFVNTlNfSUQpICsgJy0nICsgJGVsLmRhdGEoREFUQV9DT0xVTU5fSUQpO1xuXHR9XG5cblx0LyoqXG5cdFBhcnNlcyBhIGdpdmVuIERPTUVsZW1lbnQncyB3aWR0aCBpbnRvIGEgZmxvYXRcblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIHBhcnNlV2lkdGhcblx0QHBhcmFtIGVsZW1lbnQge0RPTUVsZW1lbnR9IEVsZW1lbnQgdG8gZ2V0IHdpZHRoIG9mXG5cdEByZXR1cm4ge051bWJlcn0gRWxlbWVudCdzIHdpZHRoIGFzIGEgZmxvYXRcblx0KiovXG5cdHBhcnNlV2lkdGgoZWxlbWVudCkge1xuXHRcdHJldHVybiBlbGVtZW50ID8gcGFyc2VGbG9hdChlbGVtZW50LnN0eWxlLndpZHRoLnJlcGxhY2UoJ3B4JywgJycpKSA6IDA7XG5cdH1cblxuXHQvKipcblx0U2V0cyB0aGUgcGVyY2VudGFnZSB3aWR0aCBvZiBhIGdpdmVuIERPTUVsZW1lbnRcblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIHNldFdpZHRoXG5cdEBwYXJhbSBlbGVtZW50IHtET01FbGVtZW50fSBFbGVtZW50IHRvIHNldCB3aWR0aCBvblxuXHRAcGFyYW0gd2lkdGgge051bWJlcn0gV2lkdGgsIGFzIGEgcGVyY2VudGFnZSwgdG8gc2V0XG5cdCoqL1xuXHRzZXRXaWR0aChlbGVtZW50LCB3aWR0aCkge1xuXHRcdHdpZHRoID0gd2lkdGgudG9GaXhlZCgyKTtcblx0XHR3aWR0aCA9IHdpZHRoID4gMCA/IHdpZHRoIDogMDtcblx0XHRlbGVtZW50LnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnO1xuXHR9XG5cblx0LyoqXG5cdENvbnN0cmFpbnMgYSBnaXZlbiB3aWR0aCB0byB0aGUgbWluaW11bSBhbmQgbWF4aW11bSByYW5nZXMgZGVmaW5lZCBpblxuXHR0aGUgYG1pbldpZHRoYCBhbmQgYG1heFdpZHRoYCBjb25maWd1cmF0aW9uIG9wdGlvbnMsIHJlc3BlY3RpdmVseS5cblxuXHRAcHJpdmF0ZVxuXHRAbWV0aG9kIGNvbnN0cmFpbldpZHRoXG5cdEBwYXJhbSB3aWR0aCB7TnVtYmVyfSBXaWR0aCB0byBjb25zdHJhaW5cblx0QHJldHVybiB7TnVtYmVyfSBDb25zdHJhaW5lZCB3aWR0aFxuXHQqKi9cblx0Y29uc3RyYWluV2lkdGgod2lkdGgpIHtcblx0XHRpZiAodGhpcy5vcHRpb25zLm1pbldpZHRoICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0d2lkdGggPSBNYXRoLm1heCh0aGlzLm9wdGlvbnMubWluV2lkdGgsIHdpZHRoKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5vcHRpb25zLm1heFdpZHRoICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0d2lkdGggPSBNYXRoLm1pbih0aGlzLm9wdGlvbnMubWF4V2lkdGgsIHdpZHRoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gd2lkdGg7XG5cdH1cblxuXHQvKipcblx0R2l2ZW4gYSBwYXJ0aWN1bGFyIEV2ZW50IG9iamVjdCwgcmV0cmlldmVzIHRoZSBjdXJyZW50IHBvaW50ZXIgb2Zmc2V0IGFsb25nXG5cdHRoZSBob3Jpem9udGFsIGRpcmVjdGlvbi4gQWNjb3VudHMgZm9yIGJvdGggcmVndWxhciBtb3VzZSBjbGlja3MgYXMgd2VsbCBhc1xuXHRwb2ludGVyLWxpa2Ugc3lzdGVtcyAobW9iaWxlcywgdGFibGV0cyBldGMuKVxuXG5cdEBwcml2YXRlXG5cdEBtZXRob2QgZ2V0UG9pbnRlclhcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXG5cdEByZXR1cm4ge051bWJlcn0gSG9yaXpvbnRhbCBwb2ludGVyIG9mZnNldFxuXHQqKi9cblx0Z2V0UG9pbnRlclgoZXZlbnQpIHtcblx0XHRpZiAoZXZlbnQudHlwZS5pbmRleE9mKCd0b3VjaCcpID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gKGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXSB8fCBldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdKS5wYWdlWDtcblx0XHR9XG5cdFx0cmV0dXJuIGV2ZW50LnBhZ2VYO1xuXHR9XG59XG5cblJlc2l6YWJsZUNvbHVtbnMuZGVmYXVsdHMgPSB7XG5cdHNlbGVjdG9yOiBmdW5jdGlvbigkdGFibGUpIHtcblx0XHRpZigkdGFibGUuZmluZCgndGhlYWQnKS5sZW5ndGgpIHtcblx0XHRcdHJldHVybiBTRUxFQ1RPUl9USDtcblx0XHR9XG5cblx0XHRyZXR1cm4gU0VMRUNUT1JfVEQ7XG5cdH0sXG5cdHN0b3JlOiB3aW5kb3cuc3RvcmUsXG5cdHN5bmNIYW5kbGVyczogdHJ1ZSxcblx0cmVzaXplRnJvbUJvZHk6IHRydWUsXG5cdG1heFdpZHRoOiBudWxsLFxuXHRtaW5XaWR0aDogMC4wMVxufTtcblxuUmVzaXphYmxlQ29sdW1ucy5jb3VudCA9IDA7XG4iLCJleHBvcnQgY29uc3QgREFUQV9BUEkgPSAncmVzaXphYmxlQ29sdW1ucyc7XG5leHBvcnQgY29uc3QgREFUQV9DT0xVTU5TX0lEID0gJ3Jlc2l6YWJsZS1jb2x1bW5zLWlkJztcbmV4cG9ydCBjb25zdCBEQVRBX0NPTFVNTl9JRCA9ICdyZXNpemFibGUtY29sdW1uLWlkJztcbmV4cG9ydCBjb25zdCBEQVRBX1RIID0gJ3RoJztcblxuZXhwb3J0IGNvbnN0IENMQVNTX1RBQkxFX1JFU0laSU5HID0gJ3JjLXRhYmxlLXJlc2l6aW5nJztcbmV4cG9ydCBjb25zdCBDTEFTU19DT0xVTU5fUkVTSVpJTkcgPSAncmMtY29sdW1uLXJlc2l6aW5nJztcbmV4cG9ydCBjb25zdCBDTEFTU19IQU5ETEUgPSAncmMtaGFuZGxlJztcbmV4cG9ydCBjb25zdCBDTEFTU19IQU5ETEVfQ09OVEFJTkVSID0gJ3JjLWhhbmRsZS1jb250YWluZXInO1xuXG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFX1NUQVJUID0gJ2NvbHVtbjpyZXNpemU6c3RhcnQnO1xuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRSA9ICdjb2x1bW46cmVzaXplJztcbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkVfU1RPUCA9ICdjb2x1bW46cmVzaXplOnN0b3AnO1xuXG5leHBvcnQgY29uc3QgU0VMRUNUT1JfVEggPSAndHI6Zmlyc3QgPiB0aDp2aXNpYmxlJztcbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9URCA9ICd0cjpmaXJzdCA+IHRkOnZpc2libGUnO1xuZXhwb3J0IGNvbnN0IFNFTEVDVE9SX1VOUkVTSVpBQkxFID0gYFtkYXRhLW5vcmVzaXplXWA7XG4iLCJpbXBvcnQgUmVzaXphYmxlQ29sdW1ucyBmcm9tICcuL2NsYXNzJztcbmltcG9ydCBhZGFwdGVyIGZyb20gJy4vYWRhcHRlcic7XG5cbmV4cG9ydCBkZWZhdWx0IFJlc2l6YWJsZUNvbHVtbnM7Il0sInByZUV4aXN0aW5nQ29tbWVudCI6Ii8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkltNXZaR1ZmYlc5a2RXeGxjeTlpY205M2MyVnlMWEJoWTJzdlgzQnlaV3gxWkdVdWFuTWlMQ0pET2k5VmMyVnljeTloWVcxaGRDOXpiM1Z5WTJVdmNtVndiM012YW5GMVpYSjVMWEpsYzJsNllXSnNaUzFqYjJ4MWJXNXpMM055WXk5aFpHRndkR1Z5TG1weklpd2lRem92VlhObGNuTXZZV0Z0WVhRdmMyOTFjbU5sTDNKbGNHOXpMMnB4ZFdWeWVTMXlaWE5wZW1GaWJHVXRZMjlzZFcxdWN5OXpjbU12WTJ4aGMzTXVhbk1pTENKRE9pOVZjMlZ5Y3k5aFlXMWhkQzl6YjNWeVkyVXZjbVZ3YjNNdmFuRjFaWEo1TFhKbGMybDZZV0pzWlMxamIyeDFiVzV6TDNOeVl5OWpiMjV6ZEdGdWRITXVhbk1pTENKRE9pOVZjMlZ5Y3k5aFlXMWhkQzl6YjNWeVkyVXZjbVZ3YjNNdmFuRjFaWEo1TFhKbGMybDZZV0pzWlMxamIyeDFiVzV6TDNOeVl5OXBibVJsZUM1cWN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRVHM3T3pzN2NVSkRRVFpDTEZOQlFWTTdPenM3ZVVKQlEyWXNZVUZCWVRzN1FVRkZjRU1zUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4blFrRkJaMElzUjBGQlJ5eFZRVUZUTEdWQlFXVXNSVUZCVnp0dFEwRkJUaXhKUVVGSk8wRkJRVW9zVFVGQlNUczdPMEZCUTNoRUxGRkJRVThzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4WlFVRlhPMEZCUXpOQ0xFMUJRVWtzVFVGQlRTeEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenM3UVVGRmNrSXNUVUZCU1N4SFFVRkhMRWRCUVVjc1RVRkJUU3hEUVVGRExFbEJRVWtzY1VKQlFWVXNRMEZCUXp0QlFVTm9ReXhOUVVGSkxFTkJRVU1zUjBGQlJ5eEZRVUZGTzBGQlExUXNUVUZCUnl4SFFVRkhMSFZDUVVGeFFpeE5RVUZOTEVWQlFVVXNaVUZCWlN4RFFVRkRMRU5CUVVNN1FVRkRjRVFzVTBGQlRTeERRVUZETEVsQlFVa3NjMEpCUVZjc1IwRkJSeXhEUVVGRExFTkJRVU03UjBGRE0wSXNUVUZGU1N4SlFVRkpMRTlCUVU4c1pVRkJaU3hMUVVGTExGRkJRVkVzUlVGQlJUczdPMEZCUXpkRExGVkJRVThzVVVGQlFTeEhRVUZITEVWQlFVTXNaVUZCWlN4UFFVRkRMRTlCUVVrc1NVRkJTU3hEUVVGRExFTkJRVU03UjBGRGNrTTdSVUZEUkN4RFFVRkRMRU5CUVVNN1EwRkRTQ3hEUVVGRE96dEJRVVZHTEVOQlFVTXNRMEZCUXl4blFrRkJaMElzY1VKQlFXMUNMRU5CUVVNN096czdPenM3T3pzN096czdlVUpEU0dwRExHRkJRV0U3T3pzN096czdPenM3TzBsQlZVY3NaMEpCUVdkQ08wRkJRM3BDTEZWQlJGTXNaMEpCUVdkQ0xFTkJRM2hDTEUxQlFVMHNSVUZCUlN4UFFVRlBMRVZCUVVVN2QwSkJSRlFzWjBKQlFXZENPenRCUVVWdVF5eE5RVUZKTEVOQlFVTXNSVUZCUlN4SFFVRkhMRXRCUVVzc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTTdPMEZCUlM5Q0xFMUJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVY3NRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhGUVVGRkxFVkJRVVVzWjBKQlFXZENMRU5CUVVNc1VVRkJVU3hGUVVGRkxFOUJRVThzUTBGQlF5eERRVUZET3p0QlFVVm9SU3hOUVVGSkxFTkJRVU1zVDBGQlR5eEhRVUZITEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRCUVVONlFpeE5RVUZKTEVOQlFVTXNZMEZCWXl4SFFVRkhMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNZVUZCWVN4RFFVRkRMRU5CUVVNN1FVRkRha1FzVFVGQlNTeERRVUZETEUxQlFVMHNSMEZCUnl4TlFVRk5MRU5CUVVNN08wRkJSWEpDTEUxQlFVa3NRMEZCUXl4alFVRmpMRVZCUVVVc1EwRkJRenRCUVVOMFFpeE5RVUZKTEVOQlFVTXNiVUpCUVcxQ0xFVkJRVVVzUTBGQlF6dEJRVU16UWl4TlFVRkpMRU5CUVVNc1owSkJRV2RDTEVWQlFVVXNRMEZCUXpzN1FVRkZlRUlzVFVGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRkxGRkJRVkVzUlVGQlJTeEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN08wRkJSVEZGTEUxQlFVa3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhMUVVGTExFVkJRVVU3UVVGRGRrSXNUMEZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeHBRMEZCYzBJc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0SFFVTnlSVHRCUVVORUxFMUJRVWtzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4TlFVRk5MRVZCUVVVN1FVRkRlRUlzVDBGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3d5UWtGQlowSXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dEhRVU5vUlR0QlFVTkVMRTFCUVVrc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVWQlFVVTdRVUZEZEVJc1QwRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4blEwRkJjVUlzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRIUVVOdVJUdEZRVU5FT3pzN096czdPenRqUVhwQ2JVSXNaMEpCUVdkQ096dFRRV2xEZEVJc01FSkJRVWM3T3p0QlFVZG9RaXhQUVVGSkxGRkJRVkVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJRenRCUVVOeVF5eFBRVUZITEU5QlFVOHNVVUZCVVN4TFFVRkxMRlZCUVZVc1JVRkJSVHRCUVVOc1F5eFpRVUZSTEVkQlFVY3NVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFVkJRVVVzU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMGxCUXpWRE96czdRVUZIUkN4UFFVRkpMRU5CUVVNc1lVRkJZU3hIUVVGSExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE96czdRVUZIYUVRc1QwRkJTU3hEUVVGRExITkNRVUZ6UWl4RlFVRkZMRU5CUVVNN1FVRkRPVUlzVDBGQlNTeERRVUZETEdGQlFXRXNSVUZCUlN4RFFVRkRPMGRCUTNKQ096czdPenM3T3p0VFFVOVpMSGxDUVVGSE96czdRVUZEWml4UFFVRkpMRWRCUVVjc1IwRkJSeXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNN1FVRkRhRU1zVDBGQlNTeEhRVUZITEVsQlFVa3NTVUZCU1N4RlFVRkZPMEZCUTJoQ0xFOUJRVWNzUTBGQlF5eE5RVUZOTEVWQlFVVXNRMEZCUXp0SlFVTmlPenRCUVVWRUxFOUJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1IwRkJSeXhEUVVGRExDdEVRVUUyUXl4RFFVRkJPMEZCUTNSRkxFOUJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4RFFVRkRPenRCUVVVeFF5eFBRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVczdRVUZEYkVNc1VVRkJTU3hSUVVGUkxFZEJRVWNzVFVGQlN5eGhRVUZoTEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8wRkJRM2hETEZGQlFVa3NTMEZCU3l4SFFVRkhMRTFCUVVzc1lVRkJZU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNN08wRkJSWHBETEZGQlFVa3NTMEZCU3l4RFFVRkRMRTFCUVUwc1MwRkJTeXhEUVVGRExFbEJRVWtzVVVGQlVTeERRVUZETEVWQlFVVXNhVU5CUVhOQ0xFbEJRVWtzUzBGQlN5eERRVUZETEVWQlFVVXNhVU5CUVhOQ0xFVkJRVVU3UVVGRE9VWXNXVUZCVHp0TFFVTlFPenRCUVVWRUxGRkJRVWtzVDBGQlR5eEhRVUZITEVOQlFVTXNjVVJCUVcxRExFTkJRMmhFTEVsQlFVa3NjVUpCUVZVc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlEzQkNMRkZCUVZFc1EwRkJReXhOUVVGTExHZENRVUZuUWl4RFFVRkRMRU5CUVVNN1NVRkRiRU1zUTBGQlF5eERRVUZET3p0QlFVVklMRTlCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhGUVVGRkxFTkJRVU1zVjBGQlZ5eEZRVUZGTEZsQlFWa3NRMEZCUXl4RlFVRkZMRWRCUVVjc01FSkJRV0VzUlVGQlJTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzBkQlEzSklPenM3T3pzN096dFRRVTl4UWl4clEwRkJSenM3TzBGQlEzaENMRTlCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1JVRkJTenRCUVVOc1F5eFJRVUZKTEVkQlFVY3NSMEZCUnl4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU03UVVGRGFFSXNWMEZCU3l4UlFVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVkQlFVY3NRMEZCUXl4VlFVRlZMRVZCUVVVc1IwRkJSeXhQUVVGTExFMUJRVTBzUTBGQlF5eExRVUZMTEVWQlFVVXNSMEZCUnl4SFFVRkhMRU5CUVVNc1EwRkJRenRKUVVOd1JTeERRVUZETEVOQlFVTTdSMEZEU0RzN096czdPenM3VTBGUFpTdzBRa0ZCUnpzN08wRkJRMnhDTEU5QlFVa3NWVUZCVlN4SFFVRkhMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUVRzN1FVRkZkRU1zWVVGQlZTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETEVOQlFVTTdPMEZCUlhSRExHRkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl3d1FrRkJZU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1JVRkJTenRCUVVOcVJDeFJRVUZKTEVkQlFVY3NSMEZCUnl4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU03TzBGQlJXaENMRkZCUVVrc1RVRkJUU3hIUVVGSExFOUJRVXNzVDBGQlR5eERRVUZETEdOQlFXTXNSMEZEZGtNc1QwRkJTeXhOUVVGTkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVkQlEzQkNMRTlCUVVzc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4TlFVRk5MRVZCUVVVc1EwRkJRenM3UVVGRmNFTXNVVUZCU1N4SlFVRkpMRWRCUVVjc1IwRkJSeXhEUVVGRExFbEJRVWtzYjBKQlFWTXNRMEZCUXl4VlFVRlZMRVZCUVVVc1NVRkRlRU1zUjBGQlJ5eERRVUZETEVsQlFVa3NiMEpCUVZNc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eEpRVUZKTEVkQlFVY3NUMEZCU3l4blFrRkJaMElzUTBGQlF5eE5RVUZOTEVWQlFVVXNRMEZCUXl4SlFVRkpMRU5CUVVFc1FVRkRja1VzUTBGQlF6czdRVUZGUml4UFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVVzU1VGQlNTeEZRVUZLTEVsQlFVa3NSVUZCUlN4TlFVRk5MRVZCUVU0c1RVRkJUU3hGUVVGRkxFTkJRVU1zUTBGQlF6dEpRVU14UWl4RFFVRkRMRU5CUVVNN1IwRkRTRHM3T3pzN096czdVMEZQWlN3MFFrRkJSenM3TzBGQlEyeENMRTlCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1JVRkJTenRCUVVOc1F5eFJRVUZKTEVkQlFVY3NSMEZCUnl4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU03TzBGQlJXaENMRkZCUVVrc1QwRkJTeXhQUVVGUExFTkJRVU1zUzBGQlN5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRVZCUVVVc2FVTkJRWE5DTEVWQlFVVTdRVUZEZUVRc1dVRkJTeXhQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NRMEZEY2tJc1QwRkJTeXhuUWtGQlowSXNRMEZCUXl4SFFVRkhMRU5CUVVNc1JVRkRNVUlzVDBGQlN5eFZRVUZWTEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUTI1Q0xFTkJRVU03UzBGRFJqdEpRVU5FTEVOQlFVTXNRMEZCUXp0SFFVTklPenM3T3pzN096dFRRVTlyUWl3clFrRkJSenM3TzBGQlEzSkNMRTlCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1JVRkJTenRCUVVOc1F5eFJRVUZKTEVkQlFVY3NSMEZCUnl4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU03TzBGQlJXaENMRkZCUVVjc1QwRkJTeXhQUVVGUExFTkJRVU1zUzBGQlN5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRVZCUVVVc2FVTkJRWE5DTEVWQlFVVTdRVUZEZGtRc1UwRkJTU3hMUVVGTExFZEJRVWNzVDBGQlN5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkRha01zVDBGQlN5eG5Ra0ZCWjBJc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGRE1VSXNRMEZCUXpzN1FVRkZSaXhUUVVGSExFdEJRVXNzU1VGQlNTeEpRVUZKTEVWQlFVVTdRVUZEYWtJc1lVRkJTeXhSUVVGUkxFTkJRVU1zUlVGQlJTeEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRPMDFCUTNwQ08wdEJRMFE3U1VGRFJDeERRVUZETEVOQlFVTTdSMEZEU0RzN096czdPenM3TzFOQlVWa3NkVUpCUVVNc1MwRkJTeXhGUVVGRk96dEJRVVZ3UWl4UFFVRkhMRXRCUVVzc1EwRkJReXhMUVVGTExFdEJRVXNzUTBGQlF5eEZRVUZGTzBGQlFVVXNWMEZCVHp0SlFVRkZPenM3T3p0QlFVdHFReXhQUVVGSExFbEJRVWtzUTBGQlF5eFRRVUZUTEVWQlFVVTdRVUZEYkVJc1VVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0SlFVTjRRanM3TzBGQlIwUXNUMEZCU1N4WlFVRlpMRWRCUVVjc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXp0QlFVTXhReXhQUVVGSExGbEJRVmtzUTBGQlF5eEZRVUZGTEdsRFFVRnpRaXhGUVVGRk8wRkJRM3BETEZkQlFVODdTVUZEVURzN1FVRkZSQ3hQUVVGSkxGTkJRVk1zUjBGQlJ5eFpRVUZaTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN1FVRkRja01zVDBGQlNTeFhRVUZYTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhGUVVGRkxFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNSMEZCUnl4cFEwRkJjMElzUTBGQlF6dEJRVU0zUlN4UFFVRkpMRmxCUVZrc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVWQlFVVXNRMEZCUXl4VFFVRlRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eHBRMEZCYzBJc1EwRkJRenM3UVVGRmJFWXNUMEZCU1N4VFFVRlRMRWRCUVVjc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eFhRVUZYTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRCUVVOb1JDeFBRVUZKTEZWQlFWVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExGbEJRVmtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPenRCUVVWc1JDeFBRVUZKTEVOQlFVTXNVMEZCVXl4SFFVRkhPMEZCUTJoQ0xHVkJRVmNzUlVGQldDeFhRVUZYTEVWQlFVVXNXVUZCV1N4RlFVRmFMRmxCUVZrc1JVRkJSU3haUVVGWkxFVkJRVm9zV1VGQldUczdRVUZGZGtNc1ZVRkJUU3hGUVVGRkxFbEJRVWtzUTBGQlF5eFhRVUZYTEVOQlFVTXNTMEZCU3l4RFFVRkRPMEZCUXk5Q0xHMUNRVUZsTEVWQlFVVXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhMUVVGTExFVkJRVVU3TzBGQlJYQkRMRlZCUVUwc1JVRkJSVHRCUVVOUUxGTkJRVWtzUlVGQlJTeFRRVUZUTzBGQlEyWXNWVUZCU3l4RlFVRkZMRlZCUVZVN1MwRkRha0k3UVVGRFJDeGhRVUZUTEVWQlFVVTdRVUZEVml4VFFVRkpMRVZCUVVVc1UwRkJVenRCUVVObUxGVkJRVXNzUlVGQlJTeFZRVUZWTzB0QlEycENPMGxCUTBRc1EwRkJRenM3UVVGRlJpeFBRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhqUVVGakxFVkJRVVVzUTBGQlF5eFhRVUZYTEVWQlFVVXNWMEZCVnl4RFFVRkRMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRCUVVOb1J5eFBRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhqUVVGakxFVkJRVVVzUTBGQlF5eFRRVUZUTEVWQlFVVXNWVUZCVlN4RFFVRkRMRVZCUVVVc1NVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenM3UVVGRk0wWXNUMEZCU1N4RFFVRkRMR2RDUVVGblFpeERRVU51UWl4SFFVRkhMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVU5vUWl4UlFVRlJMR2xEUVVGelFpeERRVUZET3p0QlFVVnFReXhqUVVGWExFTkJRMVFzUjBGQlJ5eERRVUZETEZsQlFWa3NRMEZCUXl4RFFVTnFRaXhIUVVGSExFTkJRVU1zV1VGQldTeERRVUZETEVOQlEycENMRkZCUVZFc2EwTkJRWFZDTEVOQlFVTTdPMEZCUld4RExFOUJRVWtzUTBGQlF5eFpRVUZaTEdkRFFVRnhRaXhEUVVOeVF5eFhRVUZYTEVWQlFVVXNXVUZCV1N4RlFVTjZRaXhUUVVGVExFVkJRVVVzVlVGQlZTeERRVU55UWl4RlFVTkVMRXRCUVVzc1EwRkJReXhEUVVGRE96dEJRVVZRTEZGQlFVc3NRMEZCUXl4alFVRmpMRVZCUVVVc1EwRkJRenRIUVVOMlFqczdPenM3T3pzN08xTkJVVmtzZFVKQlFVTXNTMEZCU3l4RlFVRkZPMEZCUTNCQ0xFOUJRVWtzUlVGQlJTeEhRVUZITEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNN1FVRkRlRUlzVDBGQlJ5eERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRlRMRVZCUVVVN1FVRkJSU3hYUVVGUE8wbEJRVVU3T3p0QlFVY3ZRaXhQUVVGSkxGVkJRVlVzUjBGQlNTeEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRXRCUVVzc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGQlF5eE5RVUZOTEVGQlFVTXNRMEZCUXp0QlFVTjJSQ3hQUVVGSExGVkJRVlVzUzBGQlN5eERRVUZETEVWQlFVVTdRVUZEY0VJc1YwRkJUenRKUVVOUU96dEJRVVZFTEU5QlFVa3NWVUZCVlN4SFFVRkhMRVZCUVVVc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdRVUZEYmtNc1QwRkJTU3hYUVVGWExFZEJRVWNzUlVGQlJTeERRVUZETEZsQlFWa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRCUVVOeVF5eFBRVUZKTEZOQlFWTXNXVUZCUVR0UFFVRkZMRlZCUVZVc1dVRkJRVHRQUVVGRkxGVkJRVlVzV1VGQlFTeERRVUZET3p0QlFVVjBReXhQUVVGSExGVkJRVlVzUjBGQlJ5eERRVUZETEVWQlFVVTdRVUZEYkVJc1lVRkJVeXhIUVVGSExFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNSVUZCUlN4RFFVRkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFZEJRVWNzVlVGQlZTeERRVUZETEVOQlFVTTdRVUZETjBRc1kwRkJWU3hIUVVGSExFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNSVUZCUlN4RFFVRkRMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dEJRVU5zUkN4alFVRlZMRWRCUVVjc1NVRkJTU3hEUVVGRExHTkJRV01zUTBGQlF5eEZRVUZGTEVOQlFVTXNaVUZCWlN4SFFVRkhMRlZCUVZVc1EwRkJReXhEUVVGRE8wbEJRMnhGTEUxQlEwa3NTVUZCUnl4VlFVRlZMRWRCUVVjc1EwRkJReXhGUVVGRk8wRkJRM1pDTEdGQlFWTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1kwRkJZeXhEUVVGRExFVkJRVVVzUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4SFFVRkhMRlZCUVZVc1EwRkJReXhEUVVGRE8wRkJRemRFTEdOQlFWVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1kwRkJZeXhEUVVGRExFVkJRVVVzUTBGQlF5eE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1FVRkRiRVFzWTBGQlZTeEhRVUZITEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1JVRkJSU3hEUVVGRExHVkJRV1VzUjBGQlJ5eFZRVUZWTEVOQlFVTXNRMEZCUXp0SlFVTnNSVHM3UVVGRlJDeFBRVUZITEZWQlFWVXNSVUZCUlR0QlFVTmtMRkZCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zVlVGQlZTeEZRVUZGTEZOQlFWTXNRMEZCUXl4RFFVRkRPMGxCUTNKRE8wRkJRMFFzVDBGQlJ5eFhRVUZYTEVWQlFVVTdRVUZEWml4UlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExGZEJRVmNzUlVGQlJTeFZRVUZWTEVOQlFVTXNRMEZCUXp0SlFVTjJRenRCUVVORUxFOUJRVWtzVlVGQlZTeEZRVUZGTzBGQlEyWXNVVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhIUVVGSExFTkJRVU1zVDBGQlR5eEZRVUZGTEZWQlFWVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1EwRkJRenRKUVVNMVF6czdRVUZGUkN4TFFVRkZMRU5CUVVNc1UwRkJVeXhEUVVGRExFbEJRVWtzUjBGQlJ5eFRRVUZUTEVOQlFVTTdRVUZET1VJc1MwRkJSU3hEUVVGRExGTkJRVk1zUTBGQlF5eExRVUZMTEVkQlFVY3NWVUZCVlN4RFFVRkRPMEZCUTJoRExFdEJRVVVzUTBGQlF5eFRRVUZUTEVOQlFVTXNTMEZCU3l4SFFVRkhMRlZCUVZVc1EwRkJRenM3UVVGRmFFTXNWVUZCVHl4SlFVRkpMRU5CUVVNc1dVRkJXU3d3UWtGQlpTeERRVU4wUXl4RlFVRkZMRU5CUVVNc1YwRkJWeXhGUVVGRkxFVkJRVVVzUTBGQlF5eFpRVUZaTEVWQlF5OUNMRk5CUVZNc1JVRkJSU3hWUVVGVkxFTkJRM0pDTEVWQlEwUXNTMEZCU3l4RFFVRkRMRU5CUVVNN1IwRkRVRHM3T3pzN096czdPMU5CVVZVc2NVSkJRVU1zUzBGQlN5eEZRVUZGTzBGQlEyeENMRTlCUVVrc1JVRkJSU3hIUVVGSExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTTdRVUZEZUVJc1QwRkJSeXhEUVVGRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVWQlFVVTdRVUZCUlN4WFFVRlBPMGxCUVVVN08wRkJSUzlDTEU5QlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1NVRkJTU3hEUVVGRExHTkJRV01zUlVGQlJTeERRVUZETEZOQlFWTXNSVUZCUlN4VlFVRlZMRVZCUVVVc1YwRkJWeXhGUVVGRkxGZEJRVmNzUTBGQlF5eERRVUZETEVOQlFVTTdPMEZCUlRGR0xFOUJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkRia0lzUjBGQlJ5eERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkRhRUlzVjBGQlZ5eHBRMEZCYzBJc1EwRkJRenM3UVVGRmNFTXNTMEZCUlN4RFFVRkRMRmRCUVZjc1EwRkRXaXhIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEZsQlFWa3NRMEZCUXl4RFFVTndRaXhIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEZsQlFWa3NRMEZCUXl4RFFVTndRaXhYUVVGWExHdERRVUYxUWl4RFFVRkRPenRCUVVWeVF5eFBRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFVkJRVVVzUTBGQlF6dEJRVU40UWl4UFFVRkpMRU5CUVVNc1owSkJRV2RDTEVWQlFVVXNRMEZCUXpzN1FVRkZlRUlzVDBGQlNTeERRVUZETEZOQlFWTXNSMEZCUnl4SlFVRkpMRU5CUVVNN08wRkJSWFJDTEZWQlFVOHNTVUZCU1N4RFFVRkRMRmxCUVZrc0swSkJRVzlDTEVOQlF6TkRMRVZCUVVVc1EwRkJReXhYUVVGWExFVkJRVVVzUlVGQlJTeERRVUZETEZsQlFWa3NSVUZETDBJc1JVRkJSU3hEUVVGRExGTkJRVk1zUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlN4RFFVRkRMRk5CUVZNc1EwRkJReXhMUVVGTExFTkJRM0pETEVWQlEwUXNTMEZCU3l4RFFVRkRMRU5CUVVNN1IwRkRVRHM3T3pzN096czdPenRUUVZOTkxHMUNRVUZITzBGQlExUXNUMEZCU1N4TlFVRk5MRWRCUVVjc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF6dEJRVU42UWl4UFFVRkpMRkZCUVZFc1IwRkJSeXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzTUVKQlFXRXNRMEZCUXl4RFFVRkRPenRCUVVVMVJDeFBRVUZKTEVOQlFVTXNXVUZCV1N4RFFVTm9RaXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVU5XTEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1kwRkJZeXhEUVVGRExFTkJRM2hDTEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRMmhDTEVkQlFVY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkRaaXhEUVVGRE96dEJRVVZHTEZkQlFWRXNRMEZCUXl4VlFVRlZMRzlDUVVGVExFTkJRVU03UVVGRE4wSXNVMEZCVFN4RFFVRkRMRlZCUVZVc2NVSkJRVlVzUTBGQlF6czdRVUZGTlVJc1QwRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRE8wRkJReTlDTEU5QlFVa3NRMEZCUXl4blFrRkJaMElzUjBGQlJ5eEpRVUZKTEVOQlFVTTdRVUZETjBJc1QwRkJTU3hEUVVGRExHRkJRV0VzUjBGQlJ5eEpRVUZKTEVOQlFVTTdRVUZETVVJc1QwRkJTU3hEUVVGRExFMUJRVTBzUjBGQlJ5eEpRVUZKTEVOQlFVTTdPMEZCUlc1Q0xGVkJRVThzVFVGQlRTeERRVUZETzBkQlEyUTdPenM3T3pzN096czdPenM3VTBGWlV5eHZRa0ZCUXl4UFFVRlBMRVZCUVVVc1RVRkJUU3hGUVVGRkxHdENRVUZyUWl4RlFVRkZMRkZCUVZFc1JVRkJSVHRCUVVONlJDeFBRVUZITEU5QlFVOHNUVUZCVFN4TFFVRkxMRkZCUVZFc1JVRkJSVHRCUVVNNVFpeFZRVUZOTEVkQlFVY3NUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJReXhGUVVGRkxFTkJRVU03U1VGRE1VSXNUVUZEU1R0QlFVTktMRlZCUVUwc1IwRkJSeXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRWRCUVVjc1IwRkJSeXhEUVVGRExFZEJRVWNzU1VGQlNTeERRVUZETEVWQlFVVXNRMEZCUXp0SlFVTTVRenM3UVVGRlJDeFBRVUZITEZOQlFWTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhGUVVGRk8wRkJRM2hDTEZkQlFVOHNRMEZCUXl4RlFVRkZMRU5CUVVNc1RVRkJUU3hGUVVGRkxHdENRVUZyUWl4RlFVRkZMRkZCUVZFc1EwRkJReXhEUVVGRE8wbEJRMnBFTEUxQlEwazdRVUZEU2l4WFFVRlBMRU5CUVVNc1JVRkJSU3hEUVVGRExFMUJRVTBzUlVGQlJTeHJRa0ZCYTBJc1EwRkJReXhEUVVGRE8wbEJRM1pETzBkQlEwUTdPenM3T3pzN096czdPMU5CVlZjc2MwSkJRVU1zVDBGQlR5eEZRVUZGTEUxQlFVMHNSVUZCUlR0QlFVTTNRaXhQUVVGSExFOUJRVThzVFVGQlRTeExRVUZMTEZGQlFWRXNSVUZCUlR0QlFVTTVRaXhWUVVGTkxFZEJRVWNzVFVGQlRTeEhRVUZITEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNN1NVRkRNVUlzVFVGRFNTeEpRVUZITEUxQlFVMHNTVUZCU1N4SlFVRkpMRVZCUVVVN1FVRkRka0lzVlVGQlRTeEhRVUZITEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzUjBGQlJ5eEhRVUZITEVOQlFVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRE8wbEJRemxETEUxQlEwazdRVUZEU2l4VlFVRk5MRWRCUVVjc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF6dEpRVU5xUWpzN1FVRkZSQ3hWUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMGRCUTNCQ096czdPenM3T3pzN096czdPenM3VTBGalZ5eHpRa0ZCUXl4SlFVRkpMRVZCUVVVc1NVRkJTU3hGUVVGRkxHRkJRV0VzUlVGQlJUdEJRVU4yUXl4UFFVRkpMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMEZCUXpGQ0xFOUJRVWNzUzBGQlN5eERRVUZETEdGQlFXRXNSVUZCUlR0QlFVTjJRaXhUUVVGTExFTkJRVU1zWVVGQllTeEhRVUZITEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1JVRkJSU3hGUVVGRkxHRkJRV0VzUTBGQlF5eERRVUZETzBsQlEyeEVPenRCUVVWRUxGVkJRVThzU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1NVRkJTU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETzBkQlF6ZEVPenM3T3pzN096czdPenRUUVZWbExEQkNRVUZETEVkQlFVY3NSVUZCUlR0QlFVTnlRaXhWUVVGUExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCU1N3MFFrRkJhVUlzUjBGQlJ5eEhRVUZITEVkQlFVY3NSMEZCUnl4RFFVRkRMRWxCUVVrc01rSkJRV2RDTEVOQlFVTTdSMEZETVVVN096czdPenM3T3pzN08xTkJWVk1zYjBKQlFVTXNUMEZCVHl4RlFVRkZPMEZCUTI1Q0xGVkJRVThzVDBGQlR5eEhRVUZITEZWQlFWVXNRMEZCUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzBkQlEzWkZPenM3T3pzN096czdPenRUUVZWUExHdENRVUZETEU5QlFVOHNSVUZCUlN4TFFVRkxMRVZCUVVVN1FVRkRlRUlzVVVGQlN5eEhRVUZITEV0QlFVc3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03UVVGRGVrSXNVVUZCU3l4SFFVRkhMRXRCUVVzc1IwRkJSeXhEUVVGRExFZEJRVWNzUzBGQlN5eEhRVUZITEVOQlFVTXNRMEZCUXp0QlFVTTVRaXhWUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NSMEZCUnl4TFFVRkxMRWRCUVVjc1NVRkJTU3hEUVVGRE8wZEJRMjVET3pzN096czdPenM3T3pzN1UwRlhZU3gzUWtGQlF5eExRVUZMTEVWQlFVVTdRVUZEY2tJc1QwRkJTU3hKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEZGQlFWRXNTVUZCU1N4VFFVRlRMRVZCUVVVN1FVRkRka01zVTBGQlN5eEhRVUZITEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFJRVUZSTEVWQlFVVXNTMEZCU3l4RFFVRkRMRU5CUVVNN1NVRkRMME03TzBGQlJVUXNUMEZCU1N4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExGRkJRVkVzU1VGQlNTeFRRVUZUTEVWQlFVVTdRVUZEZGtNc1UwRkJTeXhIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhSUVVGUkxFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTTdTVUZETDBNN08wRkJSVVFzVlVGQlR5eExRVUZMTEVOQlFVTTdSMEZEWWpzN096czdPenM3T3pzN096dFRRVmxWTEhGQ1FVRkRMRXRCUVVzc1JVRkJSVHRCUVVOc1FpeFBRVUZKTEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNSVUZCUlR0QlFVTjBReXhYUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEdGQlFXRXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUzBGQlN5eERRVUZETEdGQlFXRXNRMEZCUXl4alFVRmpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVUVzUTBGQlJTeExRVUZMTEVOQlFVTTdTVUZEZGtZN1FVRkRSQ3hWUVVGUExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTTdSMEZEYmtJN096dFJRUzlrYlVJc1owSkJRV2RDT3pzN2NVSkJRV2hDTEdkQ1FVRm5RanM3UVVGclpYSkRMR2RDUVVGblFpeERRVUZETEZGQlFWRXNSMEZCUnp0QlFVTXpRaXhUUVVGUkxFVkJRVVVzYTBKQlFWTXNUVUZCVFN4RlFVRkZPMEZCUXpGQ0xFMUJRVWNzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhOUVVGTkxFVkJRVVU3UVVGREwwSXNhVU5CUVcxQ08wZEJRMjVDT3p0QlFVVkVMR2REUVVGdFFqdEZRVU51UWp0QlFVTkVMRTFCUVVzc1JVRkJSU3hOUVVGTkxFTkJRVU1zUzBGQlN6dEJRVU51UWl4aFFVRlpMRVZCUVVVc1NVRkJTVHRCUVVOc1FpeGxRVUZqTEVWQlFVVXNTVUZCU1R0QlFVTndRaXhUUVVGUkxFVkJRVVVzU1VGQlNUdEJRVU5rTEZOQlFWRXNSVUZCUlN4SlFVRkpPME5CUTJRc1EwRkJRenM3UVVGRlJpeG5Ra0ZCWjBJc1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZET3pzN096czdPenM3UVVNelowSndRaXhKUVVGTkxGRkJRVkVzUjBGQlJ5eHJRa0ZCYTBJc1EwRkJRenM3UVVGRGNFTXNTVUZCVFN4bFFVRmxMRWRCUVVjc2MwSkJRWE5DTEVOQlFVTTdPMEZCUXk5RExFbEJRVTBzWTBGQll5eEhRVUZITEhGQ1FVRnhRaXhEUVVGRE96dEJRVU0zUXl4SlFVRk5MRTlCUVU4c1IwRkJSeXhKUVVGSkxFTkJRVU03T3p0QlFVVnlRaXhKUVVGTkxHOUNRVUZ2UWl4SFFVRkhMRzFDUVVGdFFpeERRVUZET3p0QlFVTnFSQ3hKUVVGTkxIRkNRVUZ4UWl4SFFVRkhMRzlDUVVGdlFpeERRVUZET3p0QlFVTnVSQ3hKUVVGTkxGbEJRVmtzUjBGQlJ5eFhRVUZYTEVOQlFVTTdPMEZCUTJwRExFbEJRVTBzYzBKQlFYTkNMRWRCUVVjc2NVSkJRWEZDTEVOQlFVTTdPenRCUVVWeVJDeEpRVUZOTEd0Q1FVRnJRaXhIUVVGSExIRkNRVUZ4UWl4RFFVRkRPenRCUVVOcVJDeEpRVUZOTEZsQlFWa3NSMEZCUnl4bFFVRmxMRU5CUVVNN08wRkJRM0pETEVsQlFVMHNhVUpCUVdsQ0xFZEJRVWNzYjBKQlFXOUNMRU5CUVVNN096dEJRVVV2UXl4SlFVRk5MRmRCUVZjc1IwRkJSeXgxUWtGQmRVSXNRMEZCUXpzN1FVRkROVU1zU1VGQlRTeFhRVUZYTEVkQlFVY3NkVUpCUVhWQ0xFTkJRVU03TzBGQlF6VkRMRWxCUVUwc2IwSkJRVzlDTEc5Q1FVRnZRaXhEUVVGRE96czdPenM3T3pzN096czdjVUpEYUVKNlFpeFRRVUZUT3pzN08zVkNRVU5zUWl4WFFVRlhJaXdpWm1sc1pTSTZJbWRsYm1WeVlYUmxaQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lJb1puVnVZM1JwYjI0Z1pTaDBMRzRzY2lsN1puVnVZM1JwYjI0Z2N5aHZMSFVwZTJsbUtDRnVXMjlkS1h0cFppZ2hkRnR2WFNsN2RtRnlJR0U5ZEhsd1pXOW1JSEpsY1hWcGNtVTlQVndpWm5WdVkzUnBiMjVjSWlZbWNtVnhkV2x5WlR0cFppZ2hkU1ltWVNseVpYUjFjbTRnWVNodkxDRXdLVHRwWmlocEtYSmxkSFZ5YmlCcEtHOHNJVEFwTzNaaGNpQm1QVzVsZHlCRmNuSnZjaWhjSWtOaGJtNXZkQ0JtYVc1a0lHMXZaSFZzWlNBblhDSXJieXRjSWlkY0lpazdkR2h5YjNjZ1ppNWpiMlJsUFZ3aVRVOUVWVXhGWDA1UFZGOUdUMVZPUkZ3aUxHWjlkbUZ5SUd3OWJsdHZYVDE3Wlhod2IzSjBjenA3ZlgwN2RGdHZYVnN3WFM1allXeHNLR3d1Wlhod2IzSjBjeXhtZFc1amRHbHZiaWhsS1h0MllYSWdiajEwVzI5ZFd6RmRXMlZkTzNKbGRIVnliaUJ6S0c0L2JqcGxLWDBzYkN4c0xtVjRjRzl5ZEhNc1pTeDBMRzRzY2lsOWNtVjBkWEp1SUc1YmIxMHVaWGh3YjNKMGMzMTJZWElnYVQxMGVYQmxiMllnY21WeGRXbHlaVDA5WENKbWRXNWpkR2x2Ymx3aUppWnlaWEYxYVhKbE8yWnZjaWgyWVhJZ2J6MHdPMjg4Y2k1c1pXNW5kR2c3YnlzcktYTW9jbHR2WFNrN2NtVjBkWEp1SUhOOUtTSXNJbWx0Y0c5eWRDQlNaWE5wZW1GaWJHVkRiMngxYlc1eklHWnliMjBnSnk0dlkyeGhjM01uTzF4dWFXMXdiM0owSUh0RVFWUkJYMEZRU1gwZ1puSnZiU0FuTGk5amIyNXpkR0Z1ZEhNbk8xeHVYRzRrTG1adUxuSmxjMmw2WVdKc1pVTnZiSFZ0Ym5NZ1BTQm1kVzVqZEdsdmJpaHZjSFJwYjI1elQzSk5aWFJvYjJRc0lDNHVMbUZ5WjNNcElIdGNibHgwY21WMGRYSnVJSFJvYVhNdVpXRmphQ2htZFc1amRHbHZiaWdwSUh0Y2JseDBYSFJzWlhRZ0pIUmhZbXhsSUQwZ0pDaDBhR2x6S1R0Y2JseHVYSFJjZEd4bGRDQmhjR2tnUFNBa2RHRmliR1V1WkdGMFlTaEVRVlJCWDBGUVNTazdYRzVjZEZ4MGFXWWdLQ0ZoY0drcElIdGNibHgwWEhSY2RHRndhU0E5SUc1bGR5QlNaWE5wZW1GaWJHVkRiMngxYlc1ektDUjBZV0pzWlN3Z2IzQjBhVzl1YzA5eVRXVjBhRzlrS1R0Y2JseDBYSFJjZENSMFlXSnNaUzVrWVhSaEtFUkJWRUZmUVZCSkxDQmhjR2twTzF4dVhIUmNkSDFjYmx4dVhIUmNkR1ZzYzJVZ2FXWWdLSFI1Y0dWdlppQnZjSFJwYjI1elQzSk5aWFJvYjJRZ1BUMDlJQ2R6ZEhKcGJtY25LU0I3WEc1Y2RGeDBYSFJ5WlhSMWNtNGdZWEJwVzI5d2RHbHZibk5QY2sxbGRHaHZaRjBvTGk0dVlYSm5jeWs3WEc1Y2RGeDBmVnh1WEhSOUtUdGNibjA3WEc1Y2JpUXVjbVZ6YVhwaFlteGxRMjlzZFcxdWN5QTlJRkpsYzJsNllXSnNaVU52YkhWdGJuTTdYRzRpTENKcGJYQnZjblFnZTF4dVhIUkVRVlJCWDBGUVNTeGNibHgwUkVGVVFWOURUMHhWVFU1VFgwbEVMRnh1WEhSRVFWUkJYME5QVEZWTlRsOUpSQ3hjYmx4MFJFRlVRVjlVU0N4Y2JseDBRMHhCVTFOZlZFRkNURVZmVWtWVFNWcEpUa2NzWEc1Y2RFTk1RVk5UWDBOUFRGVk5UbDlTUlZOSldrbE9SeXhjYmx4MFEweEJVMU5mU0VGT1JFeEZMRnh1WEhSRFRFRlRVMTlJUVU1RVRFVmZRMDlPVkVGSlRrVlNMRnh1WEhSRlZrVk9WRjlTUlZOSldrVmZVMVJCVWxRc1hHNWNkRVZXUlU1VVgxSkZVMGxhUlN4Y2JseDBSVlpGVGxSZlVrVlRTVnBGWDFOVVQxQXNYRzVjZEZORlRFVkRWRTlTWDFSSUxGeHVYSFJUUlV4RlExUlBVbDlVUkN4Y2JseDBVMFZNUlVOVVQxSmZWVTVTUlZOSldrRkNURVZjYm4xY2JtWnliMjBnSnk0dlkyOXVjM1JoYm5Sekp6dGNibHh1THlvcVhHNVVZV3RsY3lCaElEeDBZV0pzWlNBdlBpQmxiR1Z0Wlc1MElHRnVaQ0J0WVd0bGN5QnBkQ2R6SUdOdmJIVnRibk1nY21WemFYcGhZbXhsSUdGamNtOXpjeUJpYjNSb1hHNXRiMkpwYkdVZ1lXNWtJR1JsYzJ0MGIzQWdZMnhwWlc1MGN5NWNibHh1UUdOc1lYTnpJRkpsYzJsNllXSnNaVU52YkhWdGJuTmNia0J3WVhKaGJTQWtkR0ZpYkdVZ2UycFJkV1Z5ZVgwZ2FsRjFaWEo1TFhkeVlYQndaV1FnUEhSaFlteGxQaUJsYkdWdFpXNTBJSFJ2SUcxaGEyVWdjbVZ6YVhwaFlteGxYRzVBY0dGeVlXMGdiM0IwYVc5dWN5QjdUMkpxWldOMGZTQkRiMjVtYVdkMWNtRjBhVzl1SUc5aWFtVmpkRnh1S2lvdlhHNWxlSEJ2Y25RZ1pHVm1ZWFZzZENCamJHRnpjeUJTWlhOcGVtRmliR1ZEYjJ4MWJXNXpJSHRjYmx4MFkyOXVjM1J5ZFdOMGIzSW9KSFJoWW14bExDQnZjSFJwYjI1ektTQjdYRzVjZEZ4MGRHaHBjeTV1Y3lBOUlDY3VjbU1uSUNzZ2RHaHBjeTVqYjNWdWRDc3JPMXh1WEc1Y2RGeDBkR2hwY3k1dmNIUnBiMjV6SUQwZ0pDNWxlSFJsYm1Rb2UzMHNJRkpsYzJsNllXSnNaVU52YkhWdGJuTXVaR1ZtWVhWc2RITXNJRzl3ZEdsdmJuTXBPMXh1WEc1Y2RGeDBkR2hwY3k0a2QybHVaRzkzSUQwZ0pDaDNhVzVrYjNjcE8xeHVYSFJjZEhSb2FYTXVKRzkzYm1WeVJHOWpkVzFsYm5RZ1BTQWtLQ1IwWVdKc1pWc3dYUzV2ZDI1bGNrUnZZM1Z0Wlc1MEtUdGNibHgwWEhSMGFHbHpMaVIwWVdKc1pTQTlJQ1IwWVdKc1pUdGNibHh1WEhSY2RIUm9hWE11Y21WbWNtVnphRWhsWVdSbGNuTW9LVHRjYmx4MFhIUjBhR2x6TG5KbGMzUnZjbVZEYjJ4MWJXNVhhV1IwYUhNb0tUdGNibHgwWEhSMGFHbHpMbk41Ym1OSVlXNWtiR1ZYYVdSMGFITW9LVHRjYmx4dVhIUmNkSFJvYVhNdVltbHVaRVYyWlc1MGN5aDBhR2x6TGlSM2FXNWtiM2NzSUNkeVpYTnBlbVVuTENCMGFHbHpMbk41Ym1OSVlXNWtiR1ZYYVdSMGFITXVZbWx1WkNoMGFHbHpLU2s3WEc1Y2JseDBYSFJwWmlBb2RHaHBjeTV2Y0hScGIyNXpMbk4wWVhKMEtTQjdYRzVjZEZ4MFhIUjBhR2x6TG1KcGJtUkZkbVZ1ZEhNb2RHaHBjeTRrZEdGaWJHVXNJRVZXUlU1VVgxSkZVMGxhUlY5VFZFRlNWQ3dnZEdocGN5NXZjSFJwYjI1ekxuTjBZWEowS1R0Y2JseDBYSFI5WEc1Y2RGeDBhV1lnS0hSb2FYTXViM0IwYVc5dWN5NXlaWE5wZW1VcElIdGNibHgwWEhSY2RIUm9hWE11WW1sdVpFVjJaVzUwY3loMGFHbHpMaVIwWVdKc1pTd2dSVlpGVGxSZlVrVlRTVnBGTENCMGFHbHpMbTl3ZEdsdmJuTXVjbVZ6YVhwbEtUdGNibHgwWEhSOVhHNWNkRngwYVdZZ0tIUm9hWE11YjNCMGFXOXVjeTV6ZEc5d0tTQjdYRzVjZEZ4MFhIUjBhR2x6TG1KcGJtUkZkbVZ1ZEhNb2RHaHBjeTRrZEdGaWJHVXNJRVZXUlU1VVgxSkZVMGxhUlY5VFZFOVFMQ0IwYUdsekxtOXdkR2x2Ym5NdWMzUnZjQ2s3WEc1Y2RGeDBmVnh1WEhSOVhHNWNibHgwTHlvcVhHNWNkRkpsWm5KbGMyaGxjeUIwYUdVZ2FHVmhaR1Z5Y3lCaGMzTnZZMmxoZEdWa0lIZHBkR2dnZEdocGN5QnBibk4wWVc1alpYTWdQSFJoWW14bEx6NGdaV3hsYldWdWRDQmhibVJjYmx4MFoyVnVaWEpoZEdWeklHaGhibVJzWlhNZ1ptOXlJSFJvWlcwdUlFRnNjMjhnWVhOemFXZHVjeUJ3WlhKalpXNTBZV2RsSUhkcFpIUm9jeTVjYmx4dVhIUkFiV1YwYUc5a0lISmxabkpsYzJoSVpXRmtaWEp6WEc1Y2RDb3FMMXh1WEhSeVpXWnlaWE5vU0dWaFpHVnljeWdwSUh0Y2JseDBYSFF2THlCQmJHeHZkeUIwYUdVZ2MyVnNaV04wYjNJZ2RHOGdZbVVnWW05MGFDQmhJSEpsWjNWc1lYSWdjMlZzWTNSdmNpQnpkSEpwYm1jZ1lYTWdkMlZzYkNCaGMxeHVYSFJjZEM4dklHRWdaSGx1WVcxcFl5QmpZV3hzWW1GamExeHVYSFJjZEd4bGRDQnpaV3hsWTNSdmNpQTlJSFJvYVhNdWIzQjBhVzl1Y3k1elpXeGxZM1J2Y2p0Y2JseDBYSFJwWmloMGVYQmxiMllnYzJWc1pXTjBiM0lnUFQwOUlDZG1kVzVqZEdsdmJpY3BJSHRjYmx4MFhIUmNkSE5sYkdWamRHOXlJRDBnYzJWc1pXTjBiM0l1WTJGc2JDaDBhR2x6TENCMGFHbHpMaVIwWVdKc1pTazdYRzVjZEZ4MGZWeHVYRzVjZEZ4MEx5OGdVMlZzWldOMElHRnNiQ0IwWVdKc1pTQm9aV0ZrWlhKelhHNWNkRngwZEdocGN5NGtkR0ZpYkdWSVpXRmtaWEp6SUQwZ2RHaHBjeTRrZEdGaWJHVXVabWx1WkNoelpXeGxZM1J2Y2lrN1hHNWNibHgwWEhRdkx5QkJjM05wWjI0Z2NHVnlZMlZ1ZEdGblpTQjNhV1IwYUhNZ1ptbHljM1FzSUhSb1pXNGdZM0psWVhSbElHUnlZV2NnYUdGdVpHeGxjMXh1WEhSY2RIUm9hWE11WVhOemFXZHVVR1Z5WTJWdWRHRm5aVmRwWkhSb2N5Z3BPMXh1WEhSY2RIUm9hWE11WTNKbFlYUmxTR0Z1Wkd4bGN5Z3BPMXh1WEhSOVhHNWNibHgwTHlvcVhHNWNkRU55WldGMFpYTWdaSFZ0YlhrZ2FHRnVaR3hsSUdWc1pXMWxiblJ6SUdadmNpQmhiR3dnZEdGaWJHVWdhR1ZoWkdWeUlHTnZiSFZ0Ym5OY2JseHVYSFJBYldWMGFHOWtJR055WldGMFpVaGhibVJzWlhOY2JseDBLaW92WEc1Y2RHTnlaV0YwWlVoaGJtUnNaWE1vS1NCN1hHNWNkRngwYkdWMElISmxaaUE5SUhSb2FYTXVKR2hoYm1Sc1pVTnZiblJoYVc1bGNqdGNibHgwWEhScFppQW9jbVZtSUNFOUlHNTFiR3dwSUh0Y2JseDBYSFJjZEhKbFppNXlaVzF2ZG1Vb0tUdGNibHgwWEhSOVhHNWNibHgwWEhSMGFHbHpMaVJvWVc1a2JHVkRiMjUwWVdsdVpYSWdQU0FrS0dBOFpHbDJJR05zWVhOelBTY2tlME5NUVZOVFgwaEJUa1JNUlY5RFQwNVVRVWxPUlZKOUp5QXZQbUFwWEc1Y2RGeDBkR2hwY3k0a2RHRmliR1V1WW1WbWIzSmxLSFJvYVhNdUpHaGhibVJzWlVOdmJuUmhhVzVsY2lrN1hHNWNibHgwWEhSMGFHbHpMaVIwWVdKc1pVaGxZV1JsY25NdVpXRmphQ2dvYVN3Z1pXd3BJRDArSUh0Y2JseDBYSFJjZEd4bGRDQWtZM1Z5Y21WdWRDQTlJSFJvYVhNdUpIUmhZbXhsU0dWaFpHVnljeTVsY1NocEtUdGNibHgwWEhSY2RHeGxkQ0FrYm1WNGRDQTlJSFJvYVhNdUpIUmhZbXhsU0dWaFpHVnljeTVsY1NocElDc2dNU2s3WEc1Y2JseDBYSFJjZEdsbUlDZ2tibVY0ZEM1c1pXNW5kR2dnUFQwOUlEQWdmSHdnSkdOMWNuSmxiblF1YVhNb1UwVk1SVU5VVDFKZlZVNVNSVk5KV2tGQ1RFVXBJSHg4SUNSdVpYaDBMbWx6S0ZORlRFVkRWRTlTWDFWT1VrVlRTVnBCUWt4RktTa2dlMXh1WEhSY2RGeDBYSFJ5WlhSMWNtNDdYRzVjZEZ4MFhIUjlYRzVjYmx4MFhIUmNkR3hsZENBa2FHRnVaR3hsSUQwZ0pDaGdQR1JwZGlCamJHRnpjejBuSkh0RFRFRlRVMTlJUVU1RVRFVjlKeUF2UG1BcFhHNWNkRngwWEhSY2RDNWtZWFJoS0VSQlZFRmZWRWdzSUNRb1pXd3BLVnh1WEhSY2RGeDBYSFF1WVhCd1pXNWtWRzhvZEdocGN5NGthR0Z1Wkd4bFEyOXVkR0ZwYm1WeUtUdGNibHgwWEhSOUtUdGNibHh1WEhSY2RIUm9hWE11WW1sdVpFVjJaVzUwY3loMGFHbHpMaVJvWVc1a2JHVkRiMjUwWVdsdVpYSXNJRnNuYlc5MWMyVmtiM2R1Snl3Z0ozUnZkV05vYzNSaGNuUW5YU3dnSnk0bkswTk1RVk5UWDBoQlRrUk1SU3dnZEdocGN5NXZibEJ2YVc1MFpYSkViM2R1TG1KcGJtUW9kR2hwY3lrcE8xeHVYSFI5WEc1Y2JseDBMeW9xWEc1Y2RFRnpjMmxuYm5NZ1lTQndaWEpqWlc1MFlXZGxJSGRwWkhSb0lIUnZJR0ZzYkNCamIyeDFiVzV6SUdKaGMyVmtJRzl1SUhSb1pXbHlJR04xY25KbGJuUWdjR2w0Wld3Z2QybGtkR2dvY3lsY2JseHVYSFJBYldWMGFHOWtJR0Z6YzJsbmJsQmxjbU5sYm5SaFoyVlhhV1IwYUhOY2JseDBLaW92WEc1Y2RHRnpjMmxuYmxCbGNtTmxiblJoWjJWWGFXUjBhSE1vS1NCN1hHNWNkRngwZEdocGN5NGtkR0ZpYkdWSVpXRmtaWEp6TG1WaFkyZ29LRjhzSUdWc0tTQTlQaUI3WEc1Y2RGeDBYSFJzWlhRZ0pHVnNJRDBnSkNobGJDazdYRzVjZEZ4MFhIUjBhR2x6TG5ObGRGZHBaSFJvS0NSbGJGc3dYU3dnSkdWc0xtOTFkR1Z5VjJsa2RHZ29LU0F2SUhSb2FYTXVKSFJoWW14bExuZHBaSFJvS0NrZ0tpQXhNREFwTzF4dVhIUmNkSDBwTzF4dVhIUjlYRzVjYmx4MEx5b3FYRzVjYmx4dVhIUkFiV1YwYUc5a0lITjVibU5JWVc1a2JHVlhhV1IwYUhOY2JseDBLaW92WEc1Y2RITjVibU5JWVc1a2JHVlhhV1IwYUhNb0tTQjdYRzVjZEZ4MGJHVjBJQ1JqYjI1MFlXbHVaWElnUFNCMGFHbHpMaVJvWVc1a2JHVkRiMjUwWVdsdVpYSmNibHh1WEhSY2RDUmpiMjUwWVdsdVpYSXVkMmxrZEdnb2RHaHBjeTRrZEdGaWJHVXVkMmxrZEdnb0tTazdYRzVjYmx4MFhIUWtZMjl1ZEdGcGJtVnlMbVpwYm1Rb0p5NG5LME5NUVZOVFgwaEJUa1JNUlNrdVpXRmphQ2dvWHl3Z1pXd3BJRDArSUh0Y2JseDBYSFJjZEd4bGRDQWtaV3dnUFNBa0tHVnNLVHRjYmx4dVhIUmNkRngwYkdWMElHaGxhV2RvZENBOUlIUm9hWE11YjNCMGFXOXVjeTV5WlhOcGVtVkdjbTl0UW05a2VTQS9YRzVjZEZ4MFhIUmNkSFJvYVhNdUpIUmhZbXhsTG1obGFXZG9kQ2dwSURwY2JseDBYSFJjZEZ4MGRHaHBjeTRrZEdGaWJHVXVabWx1WkNnbmRHaGxZV1FuS1M1b1pXbG5hSFFvS1R0Y2JseHVYSFJjZEZ4MGJHVjBJR3hsWm5RZ1BTQWtaV3d1WkdGMFlTaEVRVlJCWDFSSUtTNXZkWFJsY2xkcFpIUm9LQ2tnS3lBb1hHNWNkRngwWEhSY2RDUmxiQzVrWVhSaEtFUkJWRUZmVkVncExtOW1abk5sZENncExteGxablFnTFNCMGFHbHpMaVJvWVc1a2JHVkRiMjUwWVdsdVpYSXViMlptYzJWMEtDa3ViR1ZtZEZ4dVhIUmNkRngwS1R0Y2JseHVYSFJjZEZ4MEpHVnNMbU56Y3loN0lHeGxablFzSUdobGFXZG9kQ0I5S1R0Y2JseDBYSFI5S1R0Y2JseDBmVnh1WEc1Y2RDOHFLbHh1WEhSUVpYSnphWE4wY3lCMGFHVWdZMjlzZFcxdUlIZHBaSFJvY3lCcGJpQnNiMk5oYkZOMGIzSmhaMlZjYmx4dVhIUkFiV1YwYUc5a0lITmhkbVZEYjJ4MWJXNVhhV1IwYUhOY2JseDBLaW92WEc1Y2RITmhkbVZEYjJ4MWJXNVhhV1IwYUhNb0tTQjdYRzVjZEZ4MGRHaHBjeTRrZEdGaWJHVklaV0ZrWlhKekxtVmhZMmdvS0Y4c0lHVnNLU0E5UGlCN1hHNWNkRngwWEhSc1pYUWdKR1ZzSUQwZ0pDaGxiQ2s3WEc1Y2JseDBYSFJjZEdsbUlDaDBhR2x6TG05d2RHbHZibk11YzNSdmNtVWdKaVlnSVNSbGJDNXBjeWhUUlV4RlExUlBVbDlWVGxKRlUwbGFRVUpNUlNrcElIdGNibHgwWEhSY2RGeDBkR2hwY3k1dmNIUnBiMjV6TG5OMGIzSmxMbk5sZENoY2JseDBYSFJjZEZ4MFhIUjBhR2x6TG1kbGJtVnlZWFJsUTI5c2RXMXVTV1FvSkdWc0tTeGNibHgwWEhSY2RGeDBYSFIwYUdsekxuQmhjbk5sVjJsa2RHZ29aV3dwWEc1Y2RGeDBYSFJjZENrN1hHNWNkRngwWEhSOVhHNWNkRngwZlNrN1hHNWNkSDFjYmx4dVhIUXZLaXBjYmx4MFVtVjBjbWxsZG1WeklHRnVaQ0J6WlhSeklIUm9aU0JqYjJ4MWJXNGdkMmxrZEdoeklHWnliMjBnYkc5allXeFRkRzl5WVdkbFhHNWNibHgwUUcxbGRHaHZaQ0J5WlhOMGIzSmxRMjlzZFcxdVYybGtkR2h6WEc1Y2RDb3FMMXh1WEhSeVpYTjBiM0psUTI5c2RXMXVWMmxrZEdoektDa2dlMXh1WEhSY2RIUm9hWE11SkhSaFlteGxTR1ZoWkdWeWN5NWxZV05vS0NoZkxDQmxiQ2tnUFQ0Z2UxeHVYSFJjZEZ4MGJHVjBJQ1JsYkNBOUlDUW9aV3dwTzF4dVhHNWNkRngwWEhScFppaDBhR2x6TG05d2RHbHZibk11YzNSdmNtVWdKaVlnSVNSbGJDNXBjeWhUUlV4RlExUlBVbDlWVGxKRlUwbGFRVUpNUlNrcElIdGNibHgwWEhSY2RGeDBiR1YwSUhkcFpIUm9JRDBnZEdocGN5NXZjSFJwYjI1ekxuTjBiM0psTG1kbGRDaGNibHgwWEhSY2RGeDBYSFIwYUdsekxtZGxibVZ5WVhSbFEyOXNkVzF1U1dRb0pHVnNLVnh1WEhSY2RGeDBYSFFwTzF4dVhHNWNkRngwWEhSY2RHbG1LSGRwWkhSb0lDRTlJRzUxYkd3cElIdGNibHgwWEhSY2RGeDBYSFIwYUdsekxuTmxkRmRwWkhSb0tHVnNMQ0IzYVdSMGFDazdYRzVjZEZ4MFhIUmNkSDFjYmx4MFhIUmNkSDFjYmx4MFhIUjlLVHRjYmx4MGZWeHVYRzVjZEM4cUtseHVYSFJRYjJsdWRHVnlMMjF2ZFhObElHUnZkMjRnYUdGdVpHeGxjbHh1WEc1Y2RFQnRaWFJvYjJRZ2IyNVFiMmx1ZEdWeVJHOTNibHh1WEhSQWNHRnlZVzBnWlhabGJuUWdlMDlpYW1WamRIMGdSWFpsYm5RZ2IySnFaV04wSUdGemMyOWphV0YwWldRZ2QybDBhQ0IwYUdVZ2FXNTBaWEpoWTNScGIyNWNibHgwS2lvdlhHNWNkRzl1VUc5cGJuUmxja1J2ZDI0b1pYWmxiblFwSUh0Y2JseDBYSFF2THlCUGJteDVJR0Z3Y0d4cFpYTWdkRzhnYkdWbWRDMWpiR2xqYXlCa2NtRm5aMmx1WjF4dVhIUmNkR2xtS0dWMlpXNTBMbmRvYVdOb0lDRTlQU0F4S1NCN0lISmxkSFZ5YmpzZ2ZWeHVYRzVjZEZ4MEx5OGdTV1lnWVNCd2NtVjJhVzkxY3lCdmNHVnlZWFJwYjI0Z2FYTWdaR1ZtYVc1bFpDd2dkMlVnYldsemMyVmtJSFJvWlNCc1lYTjBJRzF2ZFhObGRYQXVYRzVjZEZ4MEx5OGdVSEp2WW1GaWJIa2daMjlpWW14bFpDQjFjQ0JpZVNCMWMyVnlJRzF2ZFhOcGJtY2diM1YwSUhSb1pTQjNhVzVrYjNjZ2RHaGxiaUJ5Wld4bFlYTnBibWN1WEc1Y2RGeDBMeThnVjJVbmJHd2djMmx0ZFd4aGRHVWdZU0J3YjJsdWRHVnlkWEFnYUdWeVpTQndjbWx2Y2lCMGJ5QnBkRnh1WEhSY2RHbG1LSFJvYVhNdWIzQmxjbUYwYVc5dUtTQjdYRzVjZEZ4MFhIUjBhR2x6TG05dVVHOXBiblJsY2xWd0tHVjJaVzUwS1R0Y2JseDBYSFI5WEc1Y2JseDBYSFF2THlCSloyNXZjbVVnYm05dUxYSmxjMmw2WVdKc1pTQmpiMngxYlc1elhHNWNkRngwYkdWMElDUmpkWEp5Wlc1MFIzSnBjQ0E5SUNRb1pYWmxiblF1WTNWeWNtVnVkRlJoY21kbGRDazdYRzVjZEZ4MGFXWW9KR04xY25KbGJuUkhjbWx3TG1sektGTkZURVZEVkU5U1gxVk9Va1ZUU1ZwQlFreEZLU2tnZTF4dVhIUmNkRngwY21WMGRYSnVPMXh1WEhSY2RIMWNibHh1WEhSY2RHeGxkQ0JuY21sd1NXNWtaWGdnUFNBa1kzVnljbVZ1ZEVkeWFYQXVhVzVrWlhnb0tUdGNibHgwWEhSc1pYUWdKR3hsWm5SRGIyeDFiVzRnUFNCMGFHbHpMaVIwWVdKc1pVaGxZV1JsY25NdVpYRW9aM0pwY0VsdVpHVjRLUzV1YjNRb1UwVk1SVU5VVDFKZlZVNVNSVk5KV2tGQ1RFVXBPMXh1WEhSY2RHeGxkQ0FrY21sbmFIUkRiMngxYlc0Z1BTQjBhR2x6TGlSMFlXSnNaVWhsWVdSbGNuTXVaWEVvWjNKcGNFbHVaR1Y0SUNzZ01Ta3VibTkwS0ZORlRFVkRWRTlTWDFWT1VrVlRTVnBCUWt4RktUdGNibHh1WEhSY2RHeGxkQ0JzWldaMFYybGtkR2dnUFNCMGFHbHpMbkJoY25ObFYybGtkR2dvSkd4bFpuUkRiMngxYlc1Yk1GMHBPMXh1WEhSY2RHeGxkQ0J5YVdkb2RGZHBaSFJvSUQwZ2RHaHBjeTV3WVhKelpWZHBaSFJvS0NSeWFXZG9kRU52YkhWdGJsc3dYU2s3WEc1Y2JseDBYSFIwYUdsekxtOXdaWEpoZEdsdmJpQTlJSHRjYmx4MFhIUmNkQ1JzWldaMFEyOXNkVzF1TENBa2NtbG5hSFJEYjJ4MWJXNHNJQ1JqZFhKeVpXNTBSM0pwY0N4Y2JseHVYSFJjZEZ4MGMzUmhjblJZT2lCMGFHbHpMbWRsZEZCdmFXNTBaWEpZS0dWMlpXNTBLU3hjYmx4MFhIUmNkSE4wWVhKMFZHRmliR1ZYYVdSMGFEb2dkR2hwY3k0a2RHRmliR1V1ZDJsa2RHZ29LU3hjYmx4dVhIUmNkRngwZDJsa2RHaHpPaUI3WEc1Y2RGeDBYSFJjZEd4bFpuUTZJR3hsWm5SWGFXUjBhQ3hjYmx4MFhIUmNkRngwY21sbmFIUTZJSEpwWjJoMFYybGtkR2hjYmx4MFhIUmNkSDBzWEc1Y2RGeDBYSFJ1WlhkWGFXUjBhSE02SUh0Y2JseDBYSFJjZEZ4MGJHVm1kRG9nYkdWbWRGZHBaSFJvTEZ4dVhIUmNkRngwWEhSeWFXZG9kRG9nY21sbmFIUlhhV1IwYUZ4dVhIUmNkRngwZlZ4dVhIUmNkSDA3WEc1Y2JseDBYSFIwYUdsekxtSnBibVJGZG1WdWRITW9kR2hwY3k0a2IzZHVaWEpFYjJOMWJXVnVkQ3dnV3lkdGIzVnpaVzF2ZG1VbkxDQW5kRzkxWTJodGIzWmxKMTBzSUhSb2FYTXViMjVRYjJsdWRHVnlUVzkyWlM1aWFXNWtLSFJvYVhNcEtUdGNibHgwWEhSMGFHbHpMbUpwYm1SRmRtVnVkSE1vZEdocGN5NGtiM2R1WlhKRWIyTjFiV1Z1ZEN3Z1d5ZHRiM1Z6WlhWd0p5d2dKM1J2ZFdOb1pXNWtKMTBzSUhSb2FYTXViMjVRYjJsdWRHVnlWWEF1WW1sdVpDaDBhR2x6S1NrN1hHNWNibHgwWEhSMGFHbHpMaVJvWVc1a2JHVkRiMjUwWVdsdVpYSmNibHgwWEhSY2RDNWhaR1FvZEdocGN5NGtkR0ZpYkdVcFhHNWNkRngwWEhRdVlXUmtRMnhoYzNNb1EweEJVMU5mVkVGQ1RFVmZVa1ZUU1ZwSlRrY3BPMXh1WEc1Y2RGeDBKR3hsWm5SRGIyeDFiVzVjYmx4MFhIUmNkQzVoWkdRb0pISnBaMmgwUTI5c2RXMXVLVnh1WEhSY2RGeDBMbUZrWkNna1kzVnljbVZ1ZEVkeWFYQXBYRzVjZEZ4MFhIUXVZV1JrUTJ4aGMzTW9RMHhCVTFOZlEwOU1WVTFPWDFKRlUwbGFTVTVIS1R0Y2JseHVYSFJjZEhSb2FYTXVkSEpwWjJkbGNrVjJaVzUwS0VWV1JVNVVYMUpGVTBsYVJWOVRWRUZTVkN3Z1cxeHVYSFJjZEZ4MEpHeGxablJEYjJ4MWJXNHNJQ1J5YVdkb2RFTnZiSFZ0Yml4Y2JseDBYSFJjZEd4bFpuUlhhV1IwYUN3Z2NtbG5hSFJYYVdSMGFGeHVYSFJjZEYwc1hHNWNkRngwWlhabGJuUXBPMXh1WEc1Y2RGeDBaWFpsYm5RdWNISmxkbVZ1ZEVSbFptRjFiSFFvS1R0Y2JseDBmVnh1WEc1Y2RDOHFLbHh1WEhSUWIybHVkR1Z5TDIxdmRYTmxJRzF2ZG1WdFpXNTBJR2hoYm1Sc1pYSmNibHh1WEhSQWJXVjBhRzlrSUc5dVVHOXBiblJsY2sxdmRtVmNibHgwUUhCaGNtRnRJR1YyWlc1MElIdFBZbXBsWTNSOUlFVjJaVzUwSUc5aWFtVmpkQ0JoYzNOdlkybGhkR1ZrSUhkcGRHZ2dkR2hsSUdsdWRHVnlZV04wYVc5dVhHNWNkQ29xTDF4dVhIUnZibEJ2YVc1MFpYSk5iM1psS0dWMlpXNTBLU0I3WEc1Y2RGeDBiR1YwSUc5d0lEMGdkR2hwY3k1dmNHVnlZWFJwYjI0N1hHNWNkRngwYVdZb0lYUm9hWE11YjNCbGNtRjBhVzl1S1NCN0lISmxkSFZ5YmpzZ2ZWeHVYRzVjZEZ4MEx5OGdSR1YwWlhKdGFXNWxJSFJvWlNCa1pXeDBZU0JqYUdGdVoyVWdZbVYwZDJWbGJpQnpkR0Z5ZENCaGJtUWdibVYzSUcxdmRYTmxJSEJ2YzJsMGFXOXVMQ0JoY3lCaElIQmxjbU5sYm5SaFoyVWdiMllnZEdobElIUmhZbXhsSUhkcFpIUm9YRzVjZEZ4MGJHVjBJR1JwWm1abGNtVnVZMlVnUFNBb2RHaHBjeTVuWlhSUWIybHVkR1Z5V0NobGRtVnVkQ2tnTFNCdmNDNXpkR0Z5ZEZncE8xeHVYSFJjZEdsbUtHUnBabVpsY21WdVkyVWdQVDA5SURBcElIdGNibHgwWEhSY2RISmxkSFZ5Ymp0Y2JseDBYSFI5WEc1Y2JseDBYSFJzWlhRZ2JHVm1kRU52YkhWdGJpQTlJRzl3TGlSc1pXWjBRMjlzZFcxdVd6QmRPMXh1WEhSY2RHeGxkQ0J5YVdkb2RFTnZiSFZ0YmlBOUlHOXdMaVJ5YVdkb2RFTnZiSFZ0Ymxzd1hUdGNibHgwWEhSc1pYUWdkMmxrZEdoTVpXWjBMQ0IzYVdSMGFGSnBaMmgwTENCM2FXUjBhRlJoWW14bE8xeHVYRzVjZEZ4MGFXWW9aR2xtWm1WeVpXNWpaU0ErSURBcElIdGNibHgwWEhSY2RIZHBaSFJvVEdWbWRDQTlJSFJvYVhNdVkyOXVjM1J5WVdsdVYybGtkR2dvYjNBdWQybGtkR2h6TG14bFpuUWdLeUJrYVdabVpYSmxibU5sS1R0Y2JseDBYSFJjZEhkcFpIUm9VbWxuYUhRZ1BTQjBhR2x6TG1OdmJuTjBjbUZwYmxkcFpIUm9LRzl3TG5kcFpIUm9jeTV5YVdkb2RDazdYRzVjZEZ4MFhIUjNhV1IwYUZSaFlteGxJRDBnZEdocGN5NWpiMjV6ZEhKaGFXNVhhV1IwYUNodmNDNXpkR0Z5ZEZSaFlteGxWMmxrZEdnZ0t5QmthV1ptWlhKbGJtTmxLVHRjYmx4MFhIUjlYRzVjZEZ4MFpXeHpaU0JwWmloa2FXWm1aWEpsYm1ObElEd2dNQ2tnZTF4dVhIUmNkRngwZDJsa2RHaE1aV1owSUQwZ2RHaHBjeTVqYjI1emRISmhhVzVYYVdSMGFDaHZjQzUzYVdSMGFITXViR1ZtZENBcklHUnBabVpsY21WdVkyVXBPMXh1WEhSY2RGeDBkMmxrZEdoU2FXZG9kQ0E5SUhSb2FYTXVZMjl1YzNSeVlXbHVWMmxrZEdnb2IzQXVkMmxrZEdoekxuSnBaMmgwS1R0Y2JseDBYSFJjZEhkcFpIUm9WR0ZpYkdVZ1BTQjBhR2x6TG1OdmJuTjBjbUZwYmxkcFpIUm9LRzl3TG5OMFlYSjBWR0ZpYkdWWGFXUjBhQ0FySUdScFptWmxjbVZ1WTJVcE8xeHVYSFJjZEgxY2JseHVYSFJjZEdsbUtHeGxablJEYjJ4MWJXNHBJSHRjYmx4MFhIUmNkSFJvYVhNdWMyVjBWMmxrZEdnb2JHVm1kRU52YkhWdGJpd2dkMmxrZEdoTVpXWjBLVHRjYmx4MFhIUjlYRzVjZEZ4MGFXWW9jbWxuYUhSRGIyeDFiVzRwSUh0Y2JseDBYSFJjZEhSb2FYTXVjMlYwVjJsa2RHZ29jbWxuYUhSRGIyeDFiVzRzSUhkcFpIUm9VbWxuYUhRcE8xeHVYSFJjZEgxY2JseDBYSFJwWmlBb2QybGtkR2hVWVdKc1pTa2dlMXh1WEhSY2RGeDBkR2hwY3k0a2RHRmliR1V1WTNOektGd2lkMmxrZEdoY0lpd2dkMmxrZEdoVVlXSnNaU0FySUZ3aWNIaGNJaWs3WEc1Y2RGeDBmVnh1WEc1Y2RGeDBiM0F1Ym1WM1YybGtkR2h6TG14bFpuUWdQU0IzYVdSMGFFeGxablE3WEc1Y2RGeDBiM0F1Ym1WM1YybGtkR2h6TG5KcFoyaDBJRDBnZDJsa2RHaFNhV2RvZER0Y2JseDBYSFJ2Y0M1dVpYZFhhV1IwYUhNdWRHRmliR1VnUFNCM2FXUjBhRlJoWW14bE8xeHVYRzVjZEZ4MGNtVjBkWEp1SUhSb2FYTXVkSEpwWjJkbGNrVjJaVzUwS0VWV1JVNVVYMUpGVTBsYVJTd2dXMXh1WEhSY2RGeDBiM0F1Skd4bFpuUkRiMngxYlc0c0lHOXdMaVJ5YVdkb2RFTnZiSFZ0Yml4Y2JseDBYSFJjZEhkcFpIUm9UR1ZtZEN3Z2QybGtkR2hTYVdkb2RGeHVYSFJjZEYwc1hHNWNkRngwWlhabGJuUXBPMXh1WEhSOVhHNWNibHgwTHlvcVhHNWNkRkJ2YVc1MFpYSXZiVzkxYzJVZ2NtVnNaV0Z6WlNCb1lXNWtiR1Z5WEc1Y2JseDBRRzFsZEdodlpDQnZibEJ2YVc1MFpYSlZjRnh1WEhSQWNHRnlZVzBnWlhabGJuUWdlMDlpYW1WamRIMGdSWFpsYm5RZ2IySnFaV04wSUdGemMyOWphV0YwWldRZ2QybDBhQ0IwYUdVZ2FXNTBaWEpoWTNScGIyNWNibHgwS2lvdlhHNWNkRzl1VUc5cGJuUmxjbFZ3S0dWMlpXNTBLU0I3WEc1Y2RGeDBiR1YwSUc5d0lEMGdkR2hwY3k1dmNHVnlZWFJwYjI0N1hHNWNkRngwYVdZb0lYUm9hWE11YjNCbGNtRjBhVzl1S1NCN0lISmxkSFZ5YmpzZ2ZWeHVYRzVjZEZ4MGRHaHBjeTUxYm1KcGJtUkZkbVZ1ZEhNb2RHaHBjeTRrYjNkdVpYSkViMk4xYldWdWRDd2dXeWR0YjNWelpYVndKeXdnSjNSdmRXTm9aVzVrSnl3Z0oyMXZkWE5sYlc5MlpTY3NJQ2QwYjNWamFHMXZkbVVuWFNrN1hHNWNibHgwWEhSMGFHbHpMaVJvWVc1a2JHVkRiMjUwWVdsdVpYSmNibHgwWEhSY2RDNWhaR1FvZEdocGN5NGtkR0ZpYkdVcFhHNWNkRngwWEhRdWNtVnRiM1psUTJ4aGMzTW9RMHhCVTFOZlZFRkNURVZmVWtWVFNWcEpUa2NwTzF4dVhHNWNkRngwYjNBdUpHeGxablJEYjJ4MWJXNWNibHgwWEhSY2RDNWhaR1FvYjNBdUpISnBaMmgwUTI5c2RXMXVLVnh1WEhSY2RGeDBMbUZrWkNodmNDNGtZM1Z5Y21WdWRFZHlhWEFwWEc1Y2RGeDBYSFF1Y21WdGIzWmxRMnhoYzNNb1EweEJVMU5mUTA5TVZVMU9YMUpGVTBsYVNVNUhLVHRjYmx4dVhIUmNkSFJvYVhNdWMzbHVZMGhoYm1Sc1pWZHBaSFJvY3lncE8xeHVYSFJjZEhSb2FYTXVjMkYyWlVOdmJIVnRibGRwWkhSb2N5Z3BPMXh1WEc1Y2RGeDBkR2hwY3k1dmNHVnlZWFJwYjI0Z1BTQnVkV3hzTzF4dVhHNWNkRngwY21WMGRYSnVJSFJvYVhNdWRISnBaMmRsY2tWMlpXNTBLRVZXUlU1VVgxSkZVMGxhUlY5VFZFOVFMQ0JiWEc1Y2RGeDBYSFJ2Y0M0a2JHVm1kRU52YkhWdGJpd2diM0F1SkhKcFoyaDBRMjlzZFcxdUxGeHVYSFJjZEZ4MGIzQXVibVYzVjJsa2RHaHpMbXhsWm5Rc0lHOXdMbTVsZDFkcFpIUm9jeTV5YVdkb2RGeHVYSFJjZEYwc1hHNWNkRngwWlhabGJuUXBPMXh1WEhSOVhHNWNibHgwTHlvcVhHNWNkRkpsYlc5MlpYTWdZV3hzSUdWMlpXNTBJR3hwYzNSbGJtVnljeXdnWkdGMFlTd2dZVzVrSUdGa1pHVmtJRVJQVFNCbGJHVnRaVzUwY3k0Z1ZHRnJaWE5jYmx4MGRHaGxJRHgwWVdKc1pTOCtJR1ZzWlcxbGJuUWdZbUZqYXlCMGJ5Qm9iM2NnYVhRZ2QyRnpMQ0JoYm1RZ2NtVjBkWEp1Y3lCcGRGeHVYRzVjZEVCdFpYUm9iMlFnWkdWemRISnZlVnh1WEhSQWNtVjBkWEp1SUh0cVVYVmxjbmw5SUU5eWFXZHBibUZzSUdwUmRXVnllUzEzY21Gd2NHVmtJRHgwWVdKc1pUNGdaV3hsYldWdWRGeHVYSFFxS2k5Y2JseDBaR1Z6ZEhKdmVTZ3BJSHRjYmx4MFhIUnNaWFFnSkhSaFlteGxJRDBnZEdocGN5NGtkR0ZpYkdVN1hHNWNkRngwYkdWMElDUm9ZVzVrYkdWeklEMGdkR2hwY3k0a2FHRnVaR3hsUTI5dWRHRnBibVZ5TG1acGJtUW9KeTRuSzBOTVFWTlRYMGhCVGtSTVJTazdYRzVjYmx4MFhIUjBhR2x6TG5WdVltbHVaRVYyWlc1MGN5aGNibHgwWEhSY2RIUm9hWE11SkhkcGJtUnZkMXh1WEhSY2RGeDBYSFF1WVdSa0tIUm9hWE11Skc5M2JtVnlSRzlqZFcxbGJuUXBYRzVjZEZ4MFhIUmNkQzVoWkdRb2RHaHBjeTRrZEdGaWJHVXBYRzVjZEZ4MFhIUmNkQzVoWkdRb0pHaGhibVJzWlhNcFhHNWNkRngwS1R0Y2JseHVYSFJjZENSb1lXNWtiR1Z6TG5KbGJXOTJaVVJoZEdFb1JFRlVRVjlVU0NrN1hHNWNkRngwSkhSaFlteGxMbkpsYlc5MlpVUmhkR0VvUkVGVVFWOUJVRWtwTzF4dVhHNWNkRngwZEdocGN5NGthR0Z1Wkd4bFEyOXVkR0ZwYm1WeUxuSmxiVzkyWlNncE8xeHVYSFJjZEhSb2FYTXVKR2hoYm1Sc1pVTnZiblJoYVc1bGNpQTlJRzUxYkd3N1hHNWNkRngwZEdocGN5NGtkR0ZpYkdWSVpXRmtaWEp6SUQwZ2JuVnNiRHRjYmx4MFhIUjBhR2x6TGlSMFlXSnNaU0E5SUc1MWJHdzdYRzVjYmx4MFhIUnlaWFIxY200Z0pIUmhZbXhsTzF4dVhIUjlYRzVjYmx4MEx5b3FYRzVjZEVKcGJtUnpJR2RwZG1WdUlHVjJaVzUwY3lCbWIzSWdkR2hwY3lCcGJuTjBZVzVqWlNCMGJ5QjBhR1VnWjJsMlpXNGdkR0Z5WjJWMElFUlBUVVZzWlcxbGJuUmNibHh1WEhSQWNISnBkbUYwWlZ4dVhIUkFiV1YwYUc5a0lHSnBibVJGZG1WdWRITmNibHgwUUhCaGNtRnRJSFJoY21kbGRDQjdhbEYxWlhKNWZTQnFVWFZsY25rdGQzSmhjSEJsWkNCRVQwMUZiR1Z0Wlc1MElIUnZJR0pwYm1RZ1pYWmxiblJ6SUhSdlhHNWNkRUJ3WVhKaGJTQmxkbVZ1ZEhNZ2UxTjBjbWx1WjN4QmNuSmhlWDBnUlhabGJuUWdibUZ0WlNBb2IzSWdZWEp5WVhrZ2IyWXBJSFJ2SUdKcGJtUmNibHgwUUhCaGNtRnRJSE5sYkdWamRHOXlUM0pEWVd4c1ltRmpheUI3VTNSeWFXNW5mRVoxYm1OMGFXOXVmU0JUWld4bFkzUnZjaUJ6ZEhKcGJtY2diM0lnWTJGc2JHSmhZMnRjYmx4MFFIQmhjbUZ0SUZ0allXeHNZbUZqYTEwZ2UwWjFibU4wYVc5dWZTQkRZV3hzWW1GamF5QnRaWFJvYjJSY2JseDBLaW92WEc1Y2RHSnBibVJGZG1WdWRITW9KSFJoY21kbGRDd2daWFpsYm5SekxDQnpaV3hsWTNSdmNrOXlRMkZzYkdKaFkyc3NJR05oYkd4aVlXTnJLU0I3WEc1Y2RGeDBhV1lvZEhsd1pXOW1JR1YyWlc1MGN5QTlQVDBnSjNOMGNtbHVaeWNwSUh0Y2JseDBYSFJjZEdWMlpXNTBjeUE5SUdWMlpXNTBjeUFySUhSb2FYTXVibk03WEc1Y2RGeDBmVnh1WEhSY2RHVnNjMlVnZTF4dVhIUmNkRngwWlhabGJuUnpJRDBnWlhabGJuUnpMbXB2YVc0b2RHaHBjeTV1Y3lBcklDY2dKeWtnS3lCMGFHbHpMbTV6TzF4dVhIUmNkSDFjYmx4dVhIUmNkR2xtS0dGeVozVnRaVzUwY3k1c1pXNW5kR2dnUGlBektTQjdYRzVjZEZ4MFhIUWtkR0Z5WjJWMExtOXVLR1YyWlc1MGN5d2djMlZzWldOMGIzSlBja05oYkd4aVlXTnJMQ0JqWVd4c1ltRmpheWs3WEc1Y2RGeDBmVnh1WEhSY2RHVnNjMlVnZTF4dVhIUmNkRngwSkhSaGNtZGxkQzV2YmlobGRtVnVkSE1zSUhObGJHVmpkRzl5VDNKRFlXeHNZbUZqYXlrN1hHNWNkRngwZlZ4dVhIUjlYRzVjYmx4MEx5b3FYRzVjZEZWdVltbHVaSE1nWlhabGJuUnpJSE53WldOcFptbGpJSFJ2SUhSb2FYTWdhVzV6ZEdGdVkyVWdabkp2YlNCMGFHVWdaMmwyWlc0Z2RHRnlaMlYwSUVSUFRVVnNaVzFsYm5SY2JseHVYSFJBY0hKcGRtRjBaVnh1WEhSQWJXVjBhRzlrSUhWdVltbHVaRVYyWlc1MGMxeHVYSFJBY0dGeVlXMGdkR0Z5WjJWMElIdHFVWFZsY25sOUlHcFJkV1Z5ZVMxM2NtRndjR1ZrSUVSUFRVVnNaVzFsYm5RZ2RHOGdkVzVpYVc1a0lHVjJaVzUwY3lCbWNtOXRYRzVjZEVCd1lYSmhiU0JsZG1WdWRITWdlMU4wY21sdVozeEJjbkpoZVgwZ1JYWmxiblFnYm1GdFpTQW9iM0lnWVhKeVlYa2diMllwSUhSdklIVnVZbWx1WkZ4dVhIUXFLaTljYmx4MGRXNWlhVzVrUlhabGJuUnpLQ1IwWVhKblpYUXNJR1YyWlc1MGN5a2dlMXh1WEhSY2RHbG1LSFI1Y0dWdlppQmxkbVZ1ZEhNZ1BUMDlJQ2R6ZEhKcGJtY25LU0I3WEc1Y2RGeDBYSFJsZG1WdWRITWdQU0JsZG1WdWRITWdLeUIwYUdsekxtNXpPMXh1WEhSY2RIMWNibHgwWEhSbGJITmxJR2xtS0dWMlpXNTBjeUFoUFNCdWRXeHNLU0I3WEc1Y2RGeDBYSFJsZG1WdWRITWdQU0JsZG1WdWRITXVhbTlwYmloMGFHbHpMbTV6SUNzZ0p5QW5LU0FySUhSb2FYTXVibk03WEc1Y2RGeDBmVnh1WEhSY2RHVnNjMlVnZTF4dVhIUmNkRngwWlhabGJuUnpJRDBnZEdocGN5NXVjenRjYmx4MFhIUjlYRzVjYmx4MFhIUWtkR0Z5WjJWMExtOW1aaWhsZG1WdWRITXBPMXh1WEhSOVhHNWNibHgwTHlvcVhHNWNkRlJ5YVdkblpYSnpJR0Z1SUdWMlpXNTBJRzl1SUhSb1pTQThkR0ZpYkdVdlBpQmxiR1Z0Wlc1MElHWnZjaUJoSUdkcGRtVnVJSFI1Y0dVZ2QybDBhQ0JuYVhabGJseHVYSFJoY21kMWJXVnVkSE1zSUdGc2MyOGdjMlYwZEdsdVp5QmhibVFnWVd4c2IzZHBibWNnWVdOalpYTnpJSFJ2SUhSb1pTQnZjbWxuYVc1aGJFVjJaVzUwSUdsbVhHNWNkR2RwZG1WdUxpQlNaWFIxY201eklIUm9aU0J5WlhOMWJIUWdiMllnZEdobElIUnlhV2RuWlhKbFpDQmxkbVZ1ZEM1Y2JseHVYSFJBY0hKcGRtRjBaVnh1WEhSQWJXVjBhRzlrSUhSeWFXZG5aWEpGZG1WdWRGeHVYSFJBY0dGeVlXMGdkSGx3WlNCN1UzUnlhVzVuZlNCRmRtVnVkQ0J1WVcxbFhHNWNkRUJ3WVhKaGJTQmhjbWR6SUh0QmNuSmhlWDBnUVhKeVlYa2diMllnWVhKbmRXMWxiblJ6SUhSdklIQmhjM01nZEdoeWIzVm5hRnh1WEhSQWNHRnlZVzBnVzI5eWFXZHBibUZzUlhabGJuUmRJRWxtSUdkcGRtVnVMQ0JwY3lCelpYUWdiMjRnZEdobElHVjJaVzUwSUc5aWFtVmpkRnh1WEhSQWNtVjBkWEp1SUh0TmFYaGxaSDBnVW1WemRXeDBJRzltSUhSb1pTQmxkbVZ1ZENCMGNtbG5aMlZ5SUdGamRHbHZibHh1WEhRcUtpOWNibHgwZEhKcFoyZGxja1YyWlc1MEtIUjVjR1VzSUdGeVozTXNJRzl5YVdkcGJtRnNSWFpsYm5RcElIdGNibHgwWEhSc1pYUWdaWFpsYm5RZ1BTQWtMa1YyWlc1MEtIUjVjR1VwTzF4dVhIUmNkR2xtS0dWMlpXNTBMbTl5YVdkcGJtRnNSWFpsYm5RcElIdGNibHgwWEhSY2RHVjJaVzUwTG05eWFXZHBibUZzUlhabGJuUWdQU0FrTG1WNGRHVnVaQ2g3ZlN3Z2IzSnBaMmx1WVd4RmRtVnVkQ2s3WEc1Y2RGeDBmVnh1WEc1Y2RGeDBjbVYwZFhKdUlIUm9hWE11SkhSaFlteGxMblJ5YVdkblpYSW9aWFpsYm5Rc0lGdDBhR2x6WFM1amIyNWpZWFFvWVhKbmN5QjhmQ0JiWFNrcE8xeHVYSFI5WEc1Y2JseDBMeW9xWEc1Y2RFTmhiR04xYkdGMFpYTWdZU0IxYm1seGRXVWdZMjlzZFcxdUlFbEVJR1p2Y2lCaElHZHBkbVZ1SUdOdmJIVnRiaUJFVDAxRmJHVnRaVzUwWEc1Y2JseDBRSEJ5YVhaaGRHVmNibHgwUUcxbGRHaHZaQ0JuWlc1bGNtRjBaVU52YkhWdGJrbGtYRzVjZEVCd1lYSmhiU0FrWld3Z2UycFJkV1Z5ZVgwZ2FsRjFaWEo1TFhkeVlYQndaV1FnWTI5c2RXMXVJR1ZzWlcxbGJuUmNibHgwUUhKbGRIVnliaUI3VTNSeWFXNW5mU0JEYjJ4MWJXNGdTVVJjYmx4MEtpb3ZYRzVjZEdkbGJtVnlZWFJsUTI5c2RXMXVTV1FvSkdWc0tTQjdYRzVjZEZ4MGNtVjBkWEp1SUhSb2FYTXVKSFJoWW14bExtUmhkR0VvUkVGVVFWOURUMHhWVFU1VFgwbEVLU0FySUNjdEp5QXJJQ1JsYkM1a1lYUmhLRVJCVkVGZlEwOU1WVTFPWDBsRUtUdGNibHgwZlZ4dVhHNWNkQzhxS2x4dVhIUlFZWEp6WlhNZ1lTQm5hWFpsYmlCRVQwMUZiR1Z0Wlc1MEozTWdkMmxrZEdnZ2FXNTBieUJoSUdac2IyRjBYRzVjYmx4MFFIQnlhWFpoZEdWY2JseDBRRzFsZEdodlpDQndZWEp6WlZkcFpIUm9YRzVjZEVCd1lYSmhiU0JsYkdWdFpXNTBJSHRFVDAxRmJHVnRaVzUwZlNCRmJHVnRaVzUwSUhSdklHZGxkQ0IzYVdSMGFDQnZabHh1WEhSQWNtVjBkWEp1SUh0T2RXMWlaWEo5SUVWc1pXMWxiblFuY3lCM2FXUjBhQ0JoY3lCaElHWnNiMkYwWEc1Y2RDb3FMMXh1WEhSd1lYSnpaVmRwWkhSb0tHVnNaVzFsYm5RcElIdGNibHgwWEhSeVpYUjFjbTRnWld4bGJXVnVkQ0EvSUhCaGNuTmxSbXh2WVhRb1pXeGxiV1Z1ZEM1emRIbHNaUzUzYVdSMGFDNXlaWEJzWVdObEtDZHdlQ2NzSUNjbktTa2dPaUF3TzF4dVhIUjlYRzVjYmx4MEx5b3FYRzVjZEZObGRITWdkR2hsSUhCbGNtTmxiblJoWjJVZ2QybGtkR2dnYjJZZ1lTQm5hWFpsYmlCRVQwMUZiR1Z0Wlc1MFhHNWNibHgwUUhCeWFYWmhkR1ZjYmx4MFFHMWxkR2h2WkNCelpYUlhhV1IwYUZ4dVhIUkFjR0Z5WVcwZ1pXeGxiV1Z1ZENCN1JFOU5SV3hsYldWdWRIMGdSV3hsYldWdWRDQjBieUJ6WlhRZ2QybGtkR2dnYjI1Y2JseDBRSEJoY21GdElIZHBaSFJvSUh0T2RXMWlaWEo5SUZkcFpIUm9MQ0JoY3lCaElIQmxjbU5sYm5SaFoyVXNJSFJ2SUhObGRGeHVYSFFxS2k5Y2JseDBjMlYwVjJsa2RHZ29aV3hsYldWdWRDd2dkMmxrZEdncElIdGNibHgwWEhSM2FXUjBhQ0E5SUhkcFpIUm9MblJ2Um1sNFpXUW9NaWs3WEc1Y2RGeDBkMmxrZEdnZ1BTQjNhV1IwYUNBK0lEQWdQeUIzYVdSMGFDQTZJREE3WEc1Y2RGeDBaV3hsYldWdWRDNXpkSGxzWlM1M2FXUjBhQ0E5SUhkcFpIUm9JQ3NnSjNCNEp6dGNibHgwZlZ4dVhHNWNkQzhxS2x4dVhIUkRiMjV6ZEhKaGFXNXpJR0VnWjJsMlpXNGdkMmxrZEdnZ2RHOGdkR2hsSUcxcGJtbHRkVzBnWVc1a0lHMWhlR2x0ZFcwZ2NtRnVaMlZ6SUdSbFptbHVaV1FnYVc1Y2JseDBkR2hsSUdCdGFXNVhhV1IwYUdBZ1lXNWtJR0J0WVhoWGFXUjBhR0FnWTI5dVptbG5kWEpoZEdsdmJpQnZjSFJwYjI1ekxDQnlaWE53WldOMGFYWmxiSGt1WEc1Y2JseDBRSEJ5YVhaaGRHVmNibHgwUUcxbGRHaHZaQ0JqYjI1emRISmhhVzVYYVdSMGFGeHVYSFJBY0dGeVlXMGdkMmxrZEdnZ2UwNTFiV0psY24wZ1YybGtkR2dnZEc4Z1kyOXVjM1J5WVdsdVhHNWNkRUJ5WlhSMWNtNGdlMDUxYldKbGNuMGdRMjl1YzNSeVlXbHVaV1FnZDJsa2RHaGNibHgwS2lvdlhHNWNkR052Ym5OMGNtRnBibGRwWkhSb0tIZHBaSFJvS1NCN1hHNWNkRngwYVdZZ0tIUm9hWE11YjNCMGFXOXVjeTV0YVc1WGFXUjBhQ0FoUFNCMWJtUmxabWx1WldRcElIdGNibHgwWEhSY2RIZHBaSFJvSUQwZ1RXRjBhQzV0WVhnb2RHaHBjeTV2Y0hScGIyNXpMbTFwYmxkcFpIUm9MQ0IzYVdSMGFDazdYRzVjZEZ4MGZWeHVYRzVjZEZ4MGFXWWdLSFJvYVhNdWIzQjBhVzl1Y3k1dFlYaFhhV1IwYUNBaFBTQjFibVJsWm1sdVpXUXBJSHRjYmx4MFhIUmNkSGRwWkhSb0lEMGdUV0YwYUM1dGFXNG9kR2hwY3k1dmNIUnBiMjV6TG0xaGVGZHBaSFJvTENCM2FXUjBhQ2s3WEc1Y2RGeDBmVnh1WEc1Y2RGeDBjbVYwZFhKdUlIZHBaSFJvTzF4dVhIUjlYRzVjYmx4MEx5b3FYRzVjZEVkcGRtVnVJR0VnY0dGeWRHbGpkV3hoY2lCRmRtVnVkQ0J2WW1wbFkzUXNJSEpsZEhKcFpYWmxjeUIwYUdVZ1kzVnljbVZ1ZENCd2IybHVkR1Z5SUc5bVpuTmxkQ0JoYkc5dVoxeHVYSFIwYUdVZ2FHOXlhWHB2Ym5SaGJDQmthWEpsWTNScGIyNHVJRUZqWTI5MWJuUnpJR1p2Y2lCaWIzUm9JSEpsWjNWc1lYSWdiVzkxYzJVZ1kyeHBZMnR6SUdGeklIZGxiR3dnWVhOY2JseDBjRzlwYm5SbGNpMXNhV3RsSUhONWMzUmxiWE1nS0cxdlltbHNaWE1zSUhSaFlteGxkSE1nWlhSakxpbGNibHh1WEhSQWNISnBkbUYwWlZ4dVhIUkFiV1YwYUc5a0lHZGxkRkJ2YVc1MFpYSllYRzVjZEVCd1lYSmhiU0JsZG1WdWRDQjdUMkpxWldOMGZTQkZkbVZ1ZENCdlltcGxZM1FnWVhOemIyTnBZWFJsWkNCM2FYUm9JSFJvWlNCcGJuUmxjbUZqZEdsdmJseHVYSFJBY21WMGRYSnVJSHRPZFcxaVpYSjlJRWh2Y21sNmIyNTBZV3dnY0c5cGJuUmxjaUJ2Wm1aelpYUmNibHgwS2lvdlhHNWNkR2RsZEZCdmFXNTBaWEpZS0dWMlpXNTBLU0I3WEc1Y2RGeDBhV1lnS0dWMlpXNTBMblI1Y0dVdWFXNWtaWGhQWmlnbmRHOTFZMmduS1NBOVBUMGdNQ2tnZTF4dVhIUmNkRngwY21WMGRYSnVJQ2hsZG1WdWRDNXZjbWxuYVc1aGJFVjJaVzUwTG5SdmRXTm9aWE5iTUYwZ2ZId2daWFpsYm5RdWIzSnBaMmx1WVd4RmRtVnVkQzVqYUdGdVoyVmtWRzkxWTJobGMxc3dYU2t1Y0dGblpWZzdYRzVjZEZ4MGZWeHVYSFJjZEhKbGRIVnliaUJsZG1WdWRDNXdZV2RsV0R0Y2JseDBmVnh1ZlZ4dVhHNVNaWE5wZW1GaWJHVkRiMngxYlc1ekxtUmxabUYxYkhSeklEMGdlMXh1WEhSelpXeGxZM1J2Y2pvZ1puVnVZM1JwYjI0b0pIUmhZbXhsS1NCN1hHNWNkRngwYVdZb0pIUmhZbXhsTG1acGJtUW9KM1JvWldGa0p5a3ViR1Z1WjNSb0tTQjdYRzVjZEZ4MFhIUnlaWFIxY200Z1UwVk1SVU5VVDFKZlZFZzdYRzVjZEZ4MGZWeHVYRzVjZEZ4MGNtVjBkWEp1SUZORlRFVkRWRTlTWDFSRU8xeHVYSFI5TEZ4dVhIUnpkRzl5WlRvZ2QybHVaRzkzTG5OMGIzSmxMRnh1WEhSemVXNWpTR0Z1Wkd4bGNuTTZJSFJ5ZFdVc1hHNWNkSEpsYzJsNlpVWnliMjFDYjJSNU9pQjBjblZsTEZ4dVhIUnRZWGhYYVdSMGFEb2diblZzYkN4Y2JseDBiV2x1VjJsa2RHZzZJREF1TURGY2JuMDdYRzVjYmxKbGMybDZZV0pzWlVOdmJIVnRibk11WTI5MWJuUWdQU0F3TzF4dUlpd2laWGh3YjNKMElHTnZibk4wSUVSQlZFRmZRVkJKSUQwZ0ozSmxjMmw2WVdKc1pVTnZiSFZ0Ym5Nbk8xeHVaWGh3YjNKMElHTnZibk4wSUVSQlZFRmZRMDlNVlUxT1UxOUpSQ0E5SUNkeVpYTnBlbUZpYkdVdFkyOXNkVzF1Y3kxcFpDYzdYRzVsZUhCdmNuUWdZMjl1YzNRZ1JFRlVRVjlEVDB4VlRVNWZTVVFnUFNBbmNtVnphWHBoWW14bExXTnZiSFZ0YmkxcFpDYzdYRzVsZUhCdmNuUWdZMjl1YzNRZ1JFRlVRVjlVU0NBOUlDZDBhQ2M3WEc1Y2JtVjRjRzl5ZENCamIyNXpkQ0JEVEVGVFUxOVVRVUpNUlY5U1JWTkpXa2xPUnlBOUlDZHlZeTEwWVdKc1pTMXlaWE5wZW1sdVp5YzdYRzVsZUhCdmNuUWdZMjl1YzNRZ1EweEJVMU5mUTA5TVZVMU9YMUpGVTBsYVNVNUhJRDBnSjNKakxXTnZiSFZ0YmkxeVpYTnBlbWx1WnljN1hHNWxlSEJ2Y25RZ1kyOXVjM1FnUTB4QlUxTmZTRUZPUkV4RklEMGdKM0pqTFdoaGJtUnNaU2M3WEc1bGVIQnZjblFnWTI5dWMzUWdRMHhCVTFOZlNFRk9SRXhGWDBOUFRsUkJTVTVGVWlBOUlDZHlZeTFvWVc1a2JHVXRZMjl1ZEdGcGJtVnlKenRjYmx4dVpYaHdiM0owSUdOdmJuTjBJRVZXUlU1VVgxSkZVMGxhUlY5VFZFRlNWQ0E5SUNkamIyeDFiVzQ2Y21WemFYcGxPbk4wWVhKMEp6dGNibVY0Y0c5eWRDQmpiMjV6ZENCRlZrVk9WRjlTUlZOSldrVWdQU0FuWTI5c2RXMXVPbkpsYzJsNlpTYzdYRzVsZUhCdmNuUWdZMjl1YzNRZ1JWWkZUbFJmVWtWVFNWcEZYMU5VVDFBZ1BTQW5ZMjlzZFcxdU9uSmxjMmw2WlRwemRHOXdKenRjYmx4dVpYaHdiM0owSUdOdmJuTjBJRk5GVEVWRFZFOVNYMVJJSUQwZ0ozUnlPbVpwY25OMElENGdkR2c2ZG1semFXSnNaU2M3WEc1bGVIQnZjblFnWTI5dWMzUWdVMFZNUlVOVVQxSmZWRVFnUFNBbmRISTZabWx5YzNRZ1BpQjBaRHAyYVhOcFlteGxKenRjYm1WNGNHOXlkQ0JqYjI1emRDQlRSVXhGUTFSUFVsOVZUbEpGVTBsYVFVSk1SU0E5SUdCYlpHRjBZUzF1YjNKbGMybDZaVjFnTzF4dUlpd2lhVzF3YjNKMElGSmxjMmw2WVdKc1pVTnZiSFZ0Ym5NZ1puSnZiU0FuTGk5amJHRnpjeWM3WEc1cGJYQnZjblFnWVdSaGNIUmxjaUJtY205dElDY3VMMkZrWVhCMFpYSW5PMXh1WEc1bGVIQnZjblFnWkdWbVlYVnNkQ0JTWlhOcGVtRmliR1ZEYjJ4MWJXNXpPeUpkZlE9PSJ9
