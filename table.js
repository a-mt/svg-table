/* global d3 */

var ADD_CLASS = false;

function Table(opts) {
  var default_opts = {
    padding: {top: 0, right: 0, bottom: 0, left: 0}
  };
  opts = opts ? Object.assign(default_opts, opts) : default_opts;
  
  return function(selection) {
    selection.each(function(dataset){
      var svg, container;

      var nRow       = dataset.value.length,
          nCol       = dataset.value[0].length,
          width      = dataset.width,
          height     = dataset.height;

      if(!width) {
        width = 50 * (nCol+1);
      }
      if(!height) {
        height = 50 * (nRow+1);
      }

      // Svg + padding
      container = svg = d3.select(this).selectAll(':scope > svg');

     if(!svg.size()) {
        container = svg = d3.select(this).append('svg')
           .attr('xmlns', 'http://www.w3.org/2000/svg')
           .attr('version', '1.1');
        container = svg.append('g').attr('transform', 'translate(' + opts.padding.left + ',' + opts.padding.top + ')');

     } else {
        container = svg.selectAll(':scope > g');
     }
     svg.attr('width', width)
        .attr('height', height);

      // Table cells
      var cellWidth  = Math.floor((width - opts.padding.left - opts.padding.right) / (nCol + 1)),
          cellHeight = Math.floor((height - opts.padding.top - opts.padding.bottom) / (nRow + 1));

      // Create groups for cells
      var rowHeaders = container.selectAll(':scope > g.row-headers').data([1]),
          colHeaders = container.selectAll(':scope > g.col-headers').data([1]),
          rows       = container.selectAll(':scope > g.cells').data([1]);

      rowHeaders = rowHeaders.enter().append('g').attr('class', 'row-headers').merge(rowHeaders);
      colHeaders = colHeaders.enter().append('g').attr('class', 'col-headers').merge(colHeaders);
      rows       = rows.enter().append('g').attr('class', 'cells').merge(rows);

      // Headers for each row
      var g = rowHeaders.selectAll('g').data(new Array(nRow));

      g.exit().remove();

      g.enter().append('g')
        .html('<rect></rect><text></text>')
        .merge(g)
        .each(function(d, i){

        d3.select(this).selectAll('rect')
          .attr('class', ADD_CLASS ? 'row-header-cell' : null)
          .attr('width', cellWidth)
          .attr('height', cellHeight)
          .attr('x', 0)
          .attr('y', (i+1) * cellHeight)
          .style('fill', '#eee')
          .style('stroke', 'silver');

        d3.select(this).selectAll('text')
          .attr('class', ADD_CLASS ? 'row-header-content' : null)
          .attr('x', 0)
          .attr('y', (i+1) * cellHeight)
          .attr('dx', cellWidth / 2)
          .attr('dy', (cellHeight / 2) + 5)
          .style('fill', 'black')
          .style('text-anchor', 'middle');
      });

      // Headers for each column
      g = colHeaders.selectAll('g').data(new Array(nCol));

      g.exit().remove();

      g.enter().append('g')
        .html('<rect></rect><text></text>')
        .merge(g)
        .each(function(d, i){
 
        d3.select(this).selectAll('rect')
          .attr('class', ADD_CLASS ? 'col-header-cell' : null)
          .attr('width', cellWidth)
          .attr('height', cellHeight)
          .attr('x', (i+1) * cellWidth)
          .attr('y', 0)
          .style('fill', '#eee')
          .style('stroke', 'silver');
  
        d3.select(this).selectAll('text')
          .attr('class', ADD_CLASS ? 'col-header-content' : null)
          .attr('x', (i+1) * cellWidth)
          .attr('y', 0)
          .attr('dx', cellWidth / 2)
          .attr('dy', (cellHeight / 2) + 5)
          .style('fill', 'black')
          .style('text-anchor', 'middle');
      });

      // Rows
      g = rows.selectAll(':scope > g').data(dataset.value);

      g.exit().remove();

      g.enter().append('g')
        .attr('class', 'row')
        .merge(g)
        .each(function(row_d, row_i){

        // Cell
        var cells = d3.select(this)
                    .selectAll(':scope > g')
                    .data(dataset.value[row_i]);

        cells.exit().remove();

        cells.enter().append('g')
          .html('<rect></rect><text></text>')
          .merge(cells)
          .each(function(isHeader, i){

            d3.select(this).selectAll('rect')
                .attr('class', ADD_CLASS ? 'cell' : null)
                .attr('width', cellWidth)
                .attr('height', cellHeight)
                .attr('x', (i+1) * cellWidth)
                .attr('y', (row_i+1) * cellHeight)
                .style('fill', isHeader ? '#eee' : 'white')
                .style('stroke', 'silver');

            d3.select(this).selectAll('text')
                .attr('class', ADD_CLASS ? 'cell-content' : null)
                .attr('x', (i+1) * cellWidth)
                .attr('y', (row_i+1) * cellHeight)
                .attr('dx', isHeader ? cellWidth / 2 : 7)
                .attr('dy', (cellHeight / 2) + 5)
                .style('fill', 'black')
                .style('text-anchor', isHeader ? 'middle' : null);
              });

      });
    });
  };
}

/*
var dataset = {
    value: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]]
};

var table = Table({width: 600, height: 250});

d3.select('#container')
    .datum(dataset)
    .call(table);
*/