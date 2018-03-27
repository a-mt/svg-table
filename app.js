/* global d3 */

window.onload = function(){
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
  var nRow  = parseInt(opts.rows, 10),
      nCol  = parseInt(opts.columns, 10),
      value = [];

  for(var i=0; i<nRow; i++) {
    value.push(Array(nCol).fill(0));
  }

  window.dataset = {
    width: opts.width,
    height: opts.height,
    header_width: opts.header_width,
    value: value
  };
  window.builder = window.Table();
  refresh_table();
  document.getElementById('container').style.display = null;
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

    } else if(e.target != input) {
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
    target.nextElementSibling.innerHTML = get_text(input.value);
  }
  function edit_cell(_target) {
    target = _target;
  
    input.style.top     = target.getAttribute('y') + 'px';
    input.style.left    = target.getAttribute('x') + 'px';
    input.style.width   = target.getAttribute('width') + 'px';
    input.style.height  = target.getAttribute('height') + 'px';
    input.value         = target.nextElementSibling
                                .innerHTML
                                .replace(/<tspan style="font-weight: bold">/g, "<b>")
                                .replace(/<\/tspan>/g, "</b>");
    input.style.display = "block";
    input.focus();
  }

  function get_text(d) {
    return d.replace(/<b>/g, '<tspan style="font-weight: bold">')
            .replace(/<\/b>/g, '</tspan>');
  }
}

//+--------------------------------------------------------
//| COPY HTML
//+--------------------------------------------------------
function handle_export() {
  var copy = new window.Clipboard("#export", {
    text: function(trigger) {
      return document.getElementsByTagName('svg')[0].outerHTML
                     .replace(/<g><rect/g, '<rect')
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