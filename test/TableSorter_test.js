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

function addRows(lines) {
	var tbody, i, ilen, j, jlen, tag, tr, cell, cells, classes;
	if (typeof lines == 'string') {
		lines.split('\n');
	}
	tbody = document.createElement('tbody');
	$table.get(0).appendChild(tbody);
	for (i = 0, ilen = lines.length; i < ilen; i++) {
		// add tr
		tr = document.createElement('tr');
		tbody.appendChild(tr);
		// add cells
		tag = i === 0 ? 'th' : 'td';
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
	return $table;
}
function makeDefaultTable(cols, rows) {
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
	return addRows(lines);
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
	deepEqual(sorter.options, {foo:1}, 'options are stored');
	strictEqual(sorter.options.foo, 1, 'option foo is stored');
});	
test("Default Options", function() {
	$.TableSorter.defaultOptions.foo = 1;
	var sorter = new $.TableSorter($table);
	deepEqual(sorter.options, {foo:1}, 'options are stored');
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
test("Zebra striping", function() {
	makeDefaultTable(1, 4)
	var sorter = new $.TableSorter($table, {
		zebraClasses: ['odd','even']
	});
	strictEqual($table.find('tr.odd').length, 2, 'odd stripes');
});	

}(jQuery));
