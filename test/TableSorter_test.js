/*
  ======== A Handy Little QUnit Reference ========
  http://api.qunitjs.com/

  Test methods:
    module(name, {[setup][ ,teardown]})
    test(name, callback)
    expect(numberOfAssertions)
    stop(increment)
    start(decrement)
  Test assertions:
    ok(value, [message])
    equal(actual, expected, [message])
    notEqual(actual, expected, [message])
    deepEqual(actual, expected, [message])
    notDeepEqual(actual, expected, [message])
    strictEqual(actual, expected, [message])
    notStrictEqual(actual, expected, [message])
    throws(block, [expected], [message])
*/
(function($) { "use strict";

function addRows(lines, container, rowTagName, colTagName) {
	var i, ilen, j, jlen, tag, tr, cell, cells, classes;
	container = container || $table.get(0);
	if (typeof lines == 'string') {
		lines.split('\n');
	}
	for (i = 0, ilen = lines.length; i < ilen; i++) {
		// add tr
		tr = document.createElement(rowTagName || 'tr');
		container.appendChild(tr);
		// add cells
		tag = colTagName || (i === 0 ? 'th' : 'td');
		cells = lines[i].split('|');
		for (j = 0, jlen = cells.length; j < jlen; j++) {
			cell = document.createElement(tag);
			tr.appendChild(cell);
			cells[j] = cells[j].replace(/@(\S+)/g, function($0, $1) {
				var parts = $1.split('=');
				var name = parts[0];
				var value = parts[1];
				cell.setAttribute(name, value);
				return '';
			});
			classes = [];
			cells[j] = cells[j].replace(/\.([^\s\.]+)/g, function($0, $1) {
				classes.push($1);
				return '';
			});
			cell.className = classes.join(' ');
			cell.innerHTML = $.trim(cells[j]);
		}
	}
	return container;
}
function makeDefaultTable(cols, rows, container, rowTagName, colTagName) {
	var r, c, cells;
	var lines = [];
	var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	cells = [];
	for (c = 0; c < cols; c++) {
		cells.push(alphabet[c]);
	}
	lines.push(cells.join(' | '));
	for (r = 1; r < rows; r++) {
		cells = [];
		for (c = 0; c < cols; c++) {
			cells.push(alphabet[c] + r);
		}
		lines.push(cells.join(' | '));
	}
	return addRows(lines, container, rowTagName, colTagName);
}

var $workspace = $('#qunit-fixture');
var $table;

var config = {
	setup: function() {
		$table = $('<table />').appendTo($workspace);
	},
	teardown: function() {
		$table.remove();
	}
};  
module('Init', config);
test("Constructor", function() {
	var sorter = new $.TableSorter($table, {foo:1});
	strictEqual(sorter.$table instanceof jQuery, true, 'Table is stored at instance.$table');
	strictEqual(sorter.options.foo, 1, 'option foo is stored');
});	
test("Default Options", function() {
	$.TableSorter.defaultOptions.foo = 1;
	var sorter = new $.TableSorter($table);
	strictEqual(sorter.options.foo, 1, 'option foo is stored');
	delete $.TableSorter.defaultOptions.foo;
});	
test("addRows util function for testing", function() {
	addRows([
		'@data-index=1 Field 1 | @data-index=2 Field 2',
		'.cell.one Cell 1 | .cell.two Cell 2'
	]);
	var sorter = new $.TableSorter($table);
	strictEqual($table.find('tr').length, 2, '2 trs');
	strictEqual($table.find('tr:nth-child(1) th').length, 2, '2 ths');
	strictEqual($table.find('tr:nth-child(1) th[data-index]').length, 2, 'attributes');
	strictEqual($table.find('tr:nth-child(1) th[data-index=1]').length, 1, 'attributes');
	strictEqual($table.find('tr:nth-child(1) th[data-index=2]').length, 1, 'attributes');
	strictEqual($table.find('tr:nth-child(1) th:nth-child(1)').text(), 'Field 1', 'html');
	strictEqual($table.find('tr:nth-child(1) th:nth-child(2)').text(), 'Field 2', 'html');
	strictEqual($table.find('tr:nth-child(2) td').length, 2, '2 tds');
	strictEqual($table.find('tr:nth-child(2) td.cell').length, 2, 'classes');
	strictEqual($table.find('tr:nth-child(2) td.one').length, 1, 'classes');
	strictEqual($table.find('tr:nth-child(2) td.two').length, 1, 'classes');
	strictEqual($table.find('tr:nth-child(2) td:nth-child(1)').text(), 'Cell 1', 'html');
	strictEqual($table.find('tr:nth-child(2) td:nth-child(2)').text(), 'Cell 2', 'html');
});	
test("makeDefaultTable util function for testing", function() {
	addRows([
		'A | B | C',
		'A1 | B1 | C1',
		'A2 | B2 | C2',
		'A3 | B3 | C3'
	]);
	var addRowsHtml = $table.html();
	$table.html('');
	makeDefaultTable(3, 4);
	var makeDefaultTableHtml = $table.html();
	strictEqual(addRowsHtml, makeDefaultTableHtml, '3x4 table');	
});	
test("Handle heading rows", function() {
	makeDefaultTable(3, 4);
	var sorter = new $.TableSorter($table, {
		headings: 'th',
		rows: 'tr:gt(0)'
	});
	strictEqual(sorter.headings.length, 3, 'Headers properly collected');
	strictEqual(sorter.headings[0].innerHTML, 'A', 'Headers properly collected');
	strictEqual(sorter.headings[1].innerHTML, 'B', 'Headers properly collected');
	strictEqual(sorter.headings[2].innerHTML, 'C', 'Headers properly collected');
	strictEqual(sorter.rows.length, 3, 'Rows properly collected with first row ignored');
});	
test("Handle div-based structures", function() {
	var section = $('<div class=wrapper />').appendTo($workspace).get(0);
	makeDefaultTable(3, 4, section, 'div', 'span');
	var sorter = new $.TableSorter(section, {
		headings: 'div:eq(0) span',
		rows: 'div:gt(0)'
	});
	strictEqual(sorter.headings.length, 3, 'Headers properly collected');
	strictEqual(sorter.headings[0].innerHTML, 'A', 'Headers properly collected');
	strictEqual(sorter.headings[1].innerHTML, 'B', 'Headers properly collected');
	strictEqual(sorter.headings[2].innerHTML, 'C', 'Headers properly collected');
	strictEqual(sorter.rows.length, 3, 'Rows properly collected with first row ignored');
	$(section).remove();
});	
test("Zebra striping: 2 classes", function() {
	makeDefaultTable(1, 5)
	var sorter = new $.TableSorter($table, {
		zebraClasses: ['odd','even']
	});
	strictEqual($table.find('tr.odd').length, 2, 'odd stripes');
	strictEqual($table.find('tr.even').length, 2, 'even stripes');
});	
test("Zebra striping: 4 classes", function() {
	makeDefaultTable(1, 9)
	$table.find('tr:nth-child(2)').addClass('stripe2');
	var sorter = new $.TableSorter($table, {
		zebraClasses: ['stripe1','stripe1','stripe2','stripe2']
	});
	strictEqual($table.find('tr.stripe1').length, 4, 'odd double stripes');
	strictEqual($table.find('tr.stripe2').length, 4, 'even deouble stripes');
});	
test("Zebra striping: hidden rows", function() {
	makeDefaultTable(1, 6)
	$table.find('tr:nth-child(3)').hide();
	var sorter = new $.TableSorter($table, {
		zebraClasses: ['odd','even']
	});
	strictEqual($table.find('tr.odd').length, 2, 'odd stripes');
	strictEqual($table.find('tr.even').length, 2, 'even stripes');
});	
test("Collecting datatypes", function() {
	makeDefaultTable(4, 1);
	var sorter = new $.TableSorter($table);
	strictEqual(sorter.getDatatype(sorter.headings[0]), 'string', 'string datatype');
	sorter.headings[1].setAttribute('data-datatype','number');
	strictEqual(sorter.getDatatype(sorter.headings[1]), 'number', 'number datatype');
	sorter.headings[2].setAttribute('data-datatype','date');
	strictEqual(sorter.getDatatype(sorter.headings[2]), 'date', 'date datatype');
	sorter.headings[3].setAttribute('data-datatype','nonsense');
	window['throws'](function() {
		sorter.getDataType(sorter.headings[3]);
	}, Error, 'Unknown datatype throws Error object');
});
test("Datatype Processors: string", function() {
	makeDefaultTable(1, 1);
	var sorter = new $.TableSorter($table);
	var processor = sorter.getDatatypeProcessor(sorter.headings[0]);
	strictEqual(processor('foo'), 'foo', 'Returning trimming');
	strictEqual(processor(' foo '), 'foo', 'String trimming');
	strictEqual(processor('\t\n foo '), 'foo', 'String trimming');
});
test("Datatype Processors: number", function() {
	makeDefaultTable(1, 1);
	var sorter = new $.TableSorter($table);
	sorter.headings[0].setAttribute('data-datatype','number');
	var processor = sorter.getDatatypeProcessor(sorter.headings[0]);
	strictEqual(processor('1'), 1, 'Single Integer');
	strictEqual(processor('-12'), -12, 'Negative number');
	strictEqual(processor('+12'), 12, 'Plus sign');
	strictEqual(processor('1.2'), 1.2, 'Decimal number');
	strictEqual(processor(' 1.2'), 1.2, 'Decimal number with preceeding spaces');
	strictEqual(processor('1.2 '), 1.2, 'Decimal number with trailing spaces');
	strictEqual(processor('$5.25'), 5.25, 'Money');
	strictEqual(processor('1e3'), 1000, 'Exponent');
	strictEqual(processor('-1E4'), -10000, 'Exponent');
});
test("Collecting Column values", function() {
	addRows([
		'A | B',
		'A1 | B1',
		'A2 | B2'
	]);
	var sorter = new $.TableSorter($table);
	deepEqual(
		sorter.getValues( $table.find('th').get(0) ), 
		[
			{tr: sorter.rows[0], val:'A1'},
			{tr: sorter.rows[1], val:'A2'}
		],
		'get column values - already sorted'
	);
	deepEqual(
		sorter.getValues( $table.find('th').get(1) ), 
		[
			{tr: sorter.rows[0], val:'B1'},
			{tr: sorter.rows[1], val:'B2'}
		],
		'get column values - already sorted - col 2'
	);
});	
test("Collecting Column values - sorted", function() {
	addRows([
		'A | B',
		'A2 | B2',
		'A1 | B1'
	]);
	var sorter = new $.TableSorter($table);
	deepEqual(
		sorter.getValues( $table.find('th').get(0) ), 
		[
			{tr: sorter.rows[1], val:'A1'},
			{tr: sorter.rows[0], val:'A2'}
		],
		'get column values after sorted'
	);
	deepEqual(
		sorter.getValues( $table.find('th').get(1) ), 
		[
			{tr: sorter.rows[1], val:'B1'},
			{tr: sorter.rows[0], val:'B2'}
		],
		'get column values after sorted - col 2'
	);
});	
test("Collecting Column values with number datatype", function() {
	addRows([
		'@data-datatype=number A | @data-datatype=number B',
		'11 | 11',
		'9 | 9'
	]);
	var sorter = new $.TableSorter($table);
	deepEqual(
		sorter.getValues( $table.find('th').get(0) ), 
		[
			{tr: sorter.rows[1], val:9},
			{tr: sorter.rows[0], val:11}
		],
		'get column values - numbers'
	);
});	
test("Getting collector functions - attr", function() {
	addRows([
		'@data-attr=data-timestamp @data-datatype=number A',
		'7/21/2013',
		'7/20/2013'
	]);
	var today = Date.parse('7/20/2013');
	var tomorrow = Date.parse('7/21/2013');
	$table.find('tr').get(1).setAttribute('data-timestamp', tomorrow);
	$table.find('tr').get(2).setAttribute('data-timestamp', today);
	var sorter = new $.TableSorter($table);
	deepEqual(
		sorter.getValues( $table.find('th').get(0) ), 
		[
			{tr: sorter.rows[1], val:today},
			{tr: sorter.rows[0], val:tomorrow}
		],
		'get column values via data-timestamp attribute'
	);
});	
test("Getting collector functions - column", function() {
	addRows([
		'@data-column=2 A, B',
		'101 | Ruby',
		'102 | JavaScript'
	]);
	var sorter = new $.TableSorter($table);
	deepEqual(
		sorter.getValues( $table.find('th').get(0) ), 
		[
			{tr: sorter.rows[1], val:'JavaScript'},
			{tr: sorter.rows[0], val:'Ruby'}
		],
		'get column values via column index'
	);
});	
test("Getting collector functions - selector", function() {
	addRows([
		'@data-selector=.language A, B',
		'101 | Ruby',
		'102 | JavaScript'
	]);
	$table.find('td:last-child').addClass('language');
	var sorter = new $.TableSorter($table);
	deepEqual(
		sorter.getValues( $table.find('th').get(0) ), 
		[
			{tr: sorter.rows[1], val:'JavaScript'},
			{tr: sorter.rows[0], val:'Ruby'}
		],
		'get column values via selector'
	);
});	
test("Getting collector functions - callback", function() {
	addRows([
		'@data-callback=handleNA A, B',
		'101 | Ruby',
		'102 | JavaScript',
		'103 | N/A',
	]);
	window.handleNA = function(row) {
		var text = $(row.children[1]).text();
		return (text == 'N/A' ? '' : text);
	};
	var sorter = new $.TableSorter($table);
	deepEqual(
		sorter.getValues( $table.find('th').get(0) ), 
		[
			{tr: sorter.rows[2], val:''},
			{tr: sorter.rows[1], val:'JavaScript'},
			{tr: sorter.rows[0], val:'Ruby'}
		],
		'get column values via callback function'
	);
});	

}(jQuery));
