/* global d3 */

var ADD_CLASS = false;

function Table(opts) {
  opts = Object.assign({
    width: 200,
    height: 200,
    padding: {top: 0, right: 0, bottom: 0, left: 0}
  }, opts);
  
  return function(selection) {
    selection.each(function(dataset){

      // Svg + padding
      var svg = d3.select(this).append('svg')
                  .attr('width', opts.width)
                  .attr('height', opts.height)
                  .attr('xmlns', 'http://www.w3.org/2000/svg')
                  .attr('version', '1.1')
                  .append('g')
                  .attr('transform', 'translate(' + opts.padding.left + ',' + opts.padding.top + ')');

      // Table cells
      var cellWidth  = Math.floor((opts.width - opts.padding.left - opts.padding.right) / (dataset.value[0].length + 1)),
          cellHeight = Math.floor((opts.height - opts.padding.top - opts.padding.bottom) / (dataset.value.length + 1));

      var headers = svg.append('g').attr('class', 'chart-group'),
          rows    = svg.append('g').attr('class', 'chart-group');

      // Headers for each row
      var rowHeaders = headers.append('g').attr('class', ADD_CLASS ? 'row-header' : null);

      rowHeaders.selectAll('rect')
        .data(dataset.rowLabel)
        .enter()
        .append('rect')
          .attr('class', ADD_CLASS ? 'row-header-cell' : null)
          .attr('width', cellWidth)
          .attr('height', cellHeight)
          .attr('x', 0)
          .attr('y', function(d, i){ return (i+1) * cellHeight; })
          .style('fill', '#eee')
          .style('stroke', 'silver');

      rowHeaders.selectAll('text')
        .data(dataset.rowLabel)
        .enter()
        .append('text')
          .attr('class', ADD_CLASS ? 'row-header-content' : null)
          .attr('x', 0)
          .attr('y', function(d, i){ return (i+1) * cellHeight; })
          .attr('dx', cellWidth / 2)
          .attr('dy', (cellHeight / 2) + 5)
          .style('fill', 'black')
          .style('text-anchor', 'middle')
          .text(function(d, i){ return d; });

      // Headers for each column
      var colHeaders = headers.append('g').attr('class', ADD_CLASS ? 'col-header' : null);

      colHeaders.selectAll('rect')
        .data(dataset.columnLabel)
        .enter()
        .append('rect')
          .attr('class', ADD_CLASS ? 'col-header-cell' : null)
          .attr('width', cellWidth)
          .attr('height', cellHeight)
          .attr('y', 0)
          .attr('x', function(d, i){ return (i+1) * cellWidth; })
          .style('fill', '#eee')
          .style('stroke', 'silver');

      colHeaders.selectAll('text')
        .data(dataset.columnLabel)
        .enter()
        .append('text')
          .attr('class', ADD_CLASS ? 'col-header-content' : null)
          .attr('y', 0)
          .attr('x', function(d, i){ return (i+1) * cellWidth; })
          .attr('dx', cellWidth / 2)
          .attr('dy', (cellHeight / 2) + 5)
          .style('fill', 'black')
          .style('text-anchor', 'middle')
          .text(function(d, i){ return d; });

    // Rows
    rows.selectAll('g')
      .data(dataset.value)
      .enter()
      .append('g')
        .attr('class', ADD_CLASS ? 'row' : null)
        .each(function(row_d, row_i){

       // Cells
       var cells = d3.select(this);

       cells.selectAll('rect')
         .data(row_d)
         .enter()
            .append('rect')
            .attr('class', ADD_CLASS ? 'cell' : null)
            .attr('width', cellWidth)
            .attr('height', cellHeight)
            .attr('x', function(d, i){ return (i+1) * cellWidth; })
            .attr('y', function(d, i){ return (row_i+1) * cellHeight; })
            .style('fill', 'white')
            .style('stroke', 'silver');

        cells.selectAll('text')
          .data(row_d)
          .enter()
            .append('text')
            .attr('class', ADD_CLASS ? 'cell-content' : null)
            .attr('width', cellWidth)
            .attr('height', cellHeight)
            .attr('x', function(d, i){ return (i+1) * cellWidth; })
            .attr('y', function(d, i){ return (row_i+1) * cellHeight; })
            .attr('dx', 7)
            .attr('dy', (cellHeight / 2) + 5)
            .style('fill', 'black')
            .style('text-anchor', 'start')
            .html(function(d, i){
              if(typeof d == "string") {
                return d.replace(/<b>/g, '<tspan style="font-weight: bold">')
                        .replace(/<\/b>/g, '</tspan>');
              } else {
                return d;
              }
            });
      });
    });
  };
}

var dataset = {
    rowLabel: ['A', 'B', 'C', 'D', 'E'],
    columnLabel: ['P', 'Q', 'R', 'S'],
    value: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]]
};

var table = Table({width: 600, height: 250});

d3.select('body')
    .datum(dataset)
    .call(table);
