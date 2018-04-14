/* global d3 */

window.onload = function(){
  document.getElementById("toggle").addEventListener("click", function(){
    if(this.previousElementSibling.style.display == "none") {
      this.previousElementSibling.style.display = "block";
    } else {
      this.previousElementSibling.style.display = "none";
    }
  });
  document.getElementById("form").addEventListener("submit", create_table);
  document.getElementById("add_column").addEventListener("click", edit_table);
  document.getElementById("add_row").addEventListener("click", edit_table);
  document.getElementById("add_row_headers").addEventListener("click", edit_table);

  handle_export();
  handle_editCell();
};

//+--------------------------------------------------------
//| CREATE SVG TABLE
//+--------------------------------------------------------
function create_table(e) {
  e.preventDefault();

  // Get submitted options values
  var opts = {};
  for(var k in this.elements){
    if(!this.hasOwnProperty(k) || !this.elements[k].name) continue;

    opts[this.elements[k].name] = this.elements[k].value;
  }

  // Create emtpy dataset
  var nRow         = parseInt(opts.rows, 10),
      nCol         = parseInt(opts.columns, 10),
      value        = [],
      line_height  = parseInt(opts.line_height, 10) || 19,
      refreshTspan = false;

  if(window.dataset) {
    value = window.dataset.value.slice(0, nRow).map(row => Array(nCol).fill(row[0]));

    for(let i=value.length; i<nRow; i++) {
      value.push(Array(nCol).fill(0));
    }

  } else {
    for(let i=0; i<nRow; i++) {
      value.push(Array(nCol).fill(0));
    }
  }

  var dataset = {
    width: opts.width,
    height: opts.height_of == "row" ? opts.height * (nRow+1) : opts.height,
    row_header_width: opts.row_header_width,
    row_header_align: opts.row_header_align,
    valign: opts.valign,
    line_height: line_height,
    value: value
  };
  if(window.dataset) {
    refreshTspan = dataset.height != window.dataset.height
                    || dataset.line_height != window.dataset.height
                    || dataset.valign != window.dataset.valign
                    || dataset.row_header_align != window.dataset.row_header_align;
  }
  window.dataset = dataset;
  window.builder = window.Table();
  refresh_table();
  document.getElementById('container').style.display = null;

  // Refresh position of multi-line text
  if(refreshTspan) {
    var nodes = Array.from(document.body.querySelectorAll('tspan[dy]'))
                     .map((node) => node.parentNode)
                     .filter(function(item, pos, self) { return self.indexOf(item) == pos; });

    for(let i=0; i<nodes.length; i++) {
      var node  = nodes[i],
          dy    = node.getAttribute('dy'),
          dx    = node.getAttribute('dx'),
          x     = node.getAttribute('x'),
          start = dy;

      if(window.dataset.valign == "middle") {
        start -= (node.children.length / 2) * window.dataset.line_height/2;
      }
      for(let j=0; j<node.children.length; j++) {
        node.children[j].setAttribute('dy', j==0 ? start : window.dataset.line_height);
        node.children[j].setAttribute('dx', dx);
        node.children[j].setAttribute('x', x);
      }
    }
  }
}

//+--------------------------------------------------------
//| EDIT SVG TABLE (ADD COLUMN, RESET...)
//+--------------------------------------------------------
function edit_table(e) {
  e.preventDefault();

  switch(e.explicitOriginalTarget.id) {
    case "add_column":
      window.dataset.value.forEach(function(row){
        row.push(row[0]);
      });
      refresh_table();
      break;

    case "add_row":
      window.dataset.value.push(window.dataset.value[0].slice());
      refresh_table();
      break;

    case "add_row_headers":
      window.dataset.value.push(window.dataset.value[0].slice().fill(1));
      refresh_table();
      break;
  }
}

function refresh_table() {
  d3.select('#container')
      .datum(window.dataset)
      .call(window.builder);
}

//+--------------------------------------------------------
//| ADD EVENTS AND HANDLE CELL TEXT EDITING
//+--------------------------------------------------------
function handle_editCell() {
  var input  = document.getElementById('input'),
      target = false;

  // Show input
  document.body.addEventListener("click", function(e){
    if(e.target.nodeName == "rect") {
      edit_cell(e.target);

    } else if(e.target != input && e.target.nodeName != "BUTTON") {
      set_cell();
      input.style.display = "none";
    }
  });

  // Set text
  input.addEventListener("keydown", function(e){
    e.key == "Tab" && e.preventDefault();
  });
  input.addEventListener("blur", function(e){
    set_cell();
  });
  input.addEventListener("keyup", function(e) {
    if(e.key !== "Enter" && e.key != "Tab") return;

    set_cell();

    if(e.key == "Tab") {
      if(target.parentNode.nextElementSibling) { // Next cell
        return edit_cell(target.parentNode.nextElementSibling.firstChild);

      } else if (target.parentNode.parentNode.classList.contains("row") && target.parentNode.parentNode.nextElementSibling) { // Next row
        return edit_cell(target.parentNode.parentNode.nextElementSibling.firstChild.firstChild);
      }
    }
    this.style.display = "none";
  });

  function set_cell() {
    if(!target.nextElementSibling) {
      return;
    }
    target.nextElementSibling.innerHTML = text_to_svg(input.value,
      target.nextElementSibling.getAttribute("x"),
      target.nextElementSibling.getAttribute("dx"),
      target.nextElementSibling.getAttribute("dy")
    );
  }
  function edit_cell(_target) {
    target = _target;
  
    input.style.top     = target.getAttribute('y') + 'px';
    input.style.left    = target.getAttribute('x') + 'px';
    input.style.width   = target.getAttribute('width') + 'px';
    input.style.height  = target.getAttribute('height') + 'px';
    input.value         = svg_to_text(target.nextElementSibling.innerHTML);
    input.style.display = "block";
    input.focus();
  }

  // Translate user's text to SVG
  function text_to_svg(d, x, dx, dy) {
    d = d.replace(/</g, '\u03A9&lt;')
         .replace(/>/g, '&gt;')

         .replace(/\u03A9&lt;i&gt;([^\u03A9]+)\u03A9&lt;\/i&gt;/g, '<tspan style="font-style: italic">$1</tspan>')
         .replace(/\u03A9&lt;b&gt;([^\u03A9]+)\u03A9&lt;\/b&gt;/g, '<tspan style="font-weight: bold">$1</tspan>')
         .replace(/\u03A9&lt;i&gt;([^\u03A9]+)\u03A9&lt;\/i&gt;/g, '<tspan style="font-style: italic">$1</tspan>') // italic that contains bold
         .replace(/\u03A9/g, '');

    var lines = d.split('&lt;br&gt;');
    if(lines.length == 1) {
      return d;
    }

    var i = 0, start = dy;
    if(window.dataset.valign == "middle") {
      start -= (lines.length / 2) * window.dataset.line_height/2;
    }
    return lines.map(p => `<tspan x="${x}" dx="${dx}" dy="${(i++ == 0 ? start : window.dataset.line_height)}">` + p + '</tspan>').join("\n");
  }

  // Translate SVG innerHTML to plainText
  function svg_to_text(d) {
    d = d.replace(/</g, '\u03A9<')
         .replace(/\u03A9<tspan style="font-style: italic">([^\u03A9]+)\u03A9<\/tspan>/g, '<i>$1</i>')
         .replace(/\u03A9<tspan style="font-weight: bold">([^\u03A9]+)\u03A9<\/tspan>/g, '<b>$1</b>')
         .replace(/\u03A9<tspan style="font-style: italic">([^\u03A9]+)\u03A9<\/tspan>/g, '<i>$1</i>') // italic that contains bold
         .replace(/\u03A9/g, '')

         .replace(/<tspan[^>]*>/g, '<br>')
         .replace(/<\/tspan>/g, '')

         .replace(/&lt;/g, '<')
         .replace(/&gt;/g, '>')
         .replace(/^<br>/, '');
    return d;
  }
}

//+--------------------------------------------------------
//| COPY HTML
//+--------------------------------------------------------
function handle_export() {
  var copy = new window.Clipboard("#export", {
    text: function(trigger) {
      var html = document.getElementsByTagName('svg')[0].outerHTML;

      if(window.dataset.row_header_width === "0") {
        html = html.replace(/<g class="row-headers">.*<g class="col-headers">/, '<g class="col-headers">');
      }

      return html.replace(/<g><rect/g, '<rect')
                 .replace(/<\/text><\/g>/g, '</text>');
    },
    target: function(trigger) {
      return trigger;
    }
  });

  copy.on('success', function(e) {
    e.clearSelection();
    feedback();
  });
}

//+--------------------------------------------------------
//| FEEDBACK BUBBLE
//+--------------------------------------------------------
var feedback_timer = null;
function feedback() {
  var div = document.getElementById('feedback');

  if(feedback_timer) {
    clearTimeout(feedback_timer);
  } else {
    div.classList.add('show');
  }

  feedback_timer = setTimeout(function(){
    feedback_timer = false;
    div.classList.remove('show');
  }.bind(this), 1000);
}