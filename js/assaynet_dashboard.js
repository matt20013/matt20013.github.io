
var diameter = 1200;
var width = window.innerWidth;
var height = window.innerHeight;
var radius = diameter / 2;
var innerRadius = radius - 70;
var minimum_assay_count = 2
var maximum_node_count = 150

var cluster = d3.cluster()
  .size([360, innerRadius])
  .separation(function (a, b) { return (a.parent == b.parent ? 1 : a.parent.parent == b.parent.parent ? 2 : 4); });

var line = d3.line()
  .x(xAccessor)
  .y(yAccessor)
  .curve(d3.curveBundle.beta(0.7));

var svg = d3.select('#dashboard').append("svg:svg")
  .attr('width', 1200)
  .attr('height', 1200)
  //.attr('height',"100%")
  //.attr('weight',2000)
  .append('g')
  .attr('transform', 'translate(' + radius + ',' + radius + ')');

url = "../data/assaynet.json"

var unfiltered_data = null;
var filtered_data = null;
var show_intra_assay_links = false;
var exclude_pending = true;
var show_ct_assays = false;
var show_sequential_links = true;

function apply_dashboard_settings() {
  minimum_assay_count = parseInt(document.getElementById('minimum_assay_count').value)
  maximum_node_count = parseInt(document.getElementById('maximum_node_count').value)
  show_intra_assay_links = document.getElementById('show_intra_assay_links').checked
  exclude_pending = document.getElementById('exlude_pending_tags').checked
  show_ct_assays = document.getElementById('show_ct_assays').checked
  show_sequential_links = document.getElementById('show_sequential_assays').checked
  redraw_assaynet_graph();
}

function clone_data(data) {
  //return Object.assign({}, data);
  return $.extend(true, [], data);
}

sequential_classes = [
  ['B', "C"],
  ["C", "B"],
  ["C", "I"],
  ["I", "C"],
  ["C", "E"],
  ["E", "C"],
  ["I", "E"],
  ["E", "I"],
  ["I", "CT"],
  ["CT", "I"],
  ["E", "CT"],
  ["CT", "E"]
]

sequential_classes = [
  ['B', "C"],
  ["C", "B"],
  ["C", "I"],
  ["I", "C"],
  ["I", "E"],
  ["E", "I"],
  ["I", "CT"],
  ["CT", "I"],
  ["E", "CT"],
  ["CT", "E"]
]

function is_sequential_assay(source_classification, target_classification) {
  sequential = false
  sequential_classes.forEach(function (item, index) {
    if (item[0] == source_classification && item[1] == target_classification) {
      sequential = true
    }
  });

  return sequential

};

function trim_data(graph) {

  // trim nodes if node count > maximum_node_count



  nodes = []
  node_ids = []
  node_ids2 = []
  links = []
  nodes2 = []
  // if (graph["nodes"].length <= maximum_node_count) {
  //   return graph
  // }
  filtered_data["nodes"].forEach(function (item, index) {
    if (show_ct_assays == false && item.assay_classification == "CT")
      return;
    if (graph["nodes"].length <= maximum_node_count) {
        nodes.push(item)
        node_ids.push(item["id"])
      }
    else if (item["assay_id_count"] >= minimum_assay_count) {
      nodes.push(item)
      node_ids.push(item["id"])
    }
  });

  filtered_data["links"].forEach(function (item, index) {

    
    source_pending = item.source.includes("pending");
    target_pending = item.target.includes("pending")

    if (exclude_pending == true && (source_pending || target_pending)) {
      return;
    }
    if (node_ids.includes(item.source) && node_ids.includes(item.target)) {
      source_classification = item.source.split("-")[0].trim()
      target_classification = item.target.split("-")[0].trim()

      if (show_sequential_links == true && ((source_classification != target_classification) && is_sequential_assay(source_classification, target_classification) == false)) {
        return;
      }
      if (show_intra_assay_links == true) {
        links.push(item)
        node_ids2.push(item.source)
        node_ids2.push(item.target)
      }
      else if (source_classification != target_classification) {
        links.push(item)
        node_ids2.push(item.source)
        node_ids2.push(item.target)
      }
    }
  });

  nodes.forEach(function (item, index) {
    if (node_ids2.includes(item["id"])) {
      nodes2.push(item)
    }
  });


  graph = { "nodes": nodes2, "links": links }
  return graph;
  // select all nodes where assay_id_count > minimum_assay_count

}

function get_link_stength(d) {

  nodes = d.filter(c => c.depth == 3)

  source = nodes[0].data
  target = nodes[1].data

  source_pmids = source["pmids"]
  source_inchikeys = source["inchikeys"]
  target_pmids = target["pmids"]
  target_inchikeys = target["inchikeys"]
  pmids_intersect = source_pmids.filter(value => target_pmids.includes(value));
  inchikeys_intersect = source_inchikeys.filter(value => target_inchikeys.includes(value));

  score = pmids_intersect.length + inchikeys_intersect.length

  if (score == 0) {
    score = 2
  }

  return score;
}

function simpleStringify(object) {
  var simpleObject = {};
  for (var prop in object) {
    if (!object.hasOwnProperty(prop)) {
      continue;
    }
    if (typeof (object[prop]) == 'object') {
      continue;
    }
    if (typeof (object[prop]) == 'function') {
      continue;
    }
    simpleObject[prop] = object[prop];
  }
  return JSON.stringify(simpleObject); // returns cleaned up JSON
};

var selected_tag;

function network_intervention_tag_filter() {
  intervention_tag_filter(selected_tag);
  openTab(null, 'InterventionsTab')
  openTabSub(null, 'InterventionsDashboardTab')
}

function network_assay_tag_filter() {
  assay_tag_filter(selected_tag);
  openTab(null, 'AssaysTab')
  openTabSubAssay(null, 'AssaysDashboardTab')
}

function load_assaydetails(tag) {

  selected_tag = tag
  $("#tagname").html(tag);
  // jquery to set text label
  openTabSubNetwork(null, "NetworkNodeDetailsTab")

}

function load_assaynet_graph(graph) {

  //d3.json(data, function (error, graph) {
  //if (error) throw error;
  //graph = JSON.parse(simpleStringify(graph))

  //graph = JSON.parse(JSON.stringify(graph))
  graph = clone_data(graph)
  graph = trim_data(graph)
  var idToNode = {};

  graph.nodes.forEach(function (n) {
    idToNode[n.id] = n;
  });

  graph.links.forEach(function (e) {
    e.source = idToNode[e.source];
    e.target = idToNode[e.target];
    //e.style('stroke', 'red')
  });

  // Find first appearance (volume, book, chapter)
  graph.nodes.forEach(function (n) {
    // n.chapters = n.chapters.map(function (chaps) { return chaps.split('.').map(function (c) { return parseInt(c); }); });
    // n.chapters.sort(chapterCompare).reverse();
    n.classification = n.name[0]
    //n.firstChapter = n.chapters[0].map(function (d) { return d.toString().length == 1 ? '0' + d.toString() : d.toString(); }).join('.');
  });

  var tree = cluster(d3.hierarchy(chapterHierarchy(graph.nodes)).sort(function (a, b) {
    if (a.data.hasOwnProperty('classification') && b.data.hasOwnProperty('classification'))
      return a.data.classification.localeCompare(b.data.classification);
    return a.data.name.localeCompare(b.data.name);
  }));

  var leaves = tree.leaves();

  var paths = graph.links.map(function (l) {
    var source = leaves.filter(function (d) { return d.data === l.source; })[0];
    var target = leaves.filter(function (d) { return d.data === l.target; })[0];
    //l.style("stroke", "red");
    return source.path(target);
  });

  var link = svg.selectAll('.link')
    .data(paths)
    .enter().append('path')
    .attr('class', 'link-dashboard')
    .attr("stroke-width", function (d) {
      return (get_link_stength(d) * 0.5);
    })
    .attr("fill", null)
    .attr("stroke", "#999")
    //    .style('stroke-width', "1.5px")
    //    .style('stroke-opacity', 0.6)
    //    .style('stroke', '#999')
    .attr('d', function (d) { return line(d) })
    //.style('stroke',function(d){return d.colour})
    //    d3.select(this)
    //        .style('stroke', function(d){return d.colour})
    //        .style('stroke-opacity', 1);
    .on('mouseover', function (l) {
      link
        .style('stroke', null)
        .style('stroke-opacity', null);
      d3.select(this)
        .style('stroke', 'blue')
        .style('stroke-opacity', 1);
      node.selectAll('circle')
        .style('fill', null);
      node.filter(function (n) { return n === l[0] || n === l[l.length - 1]; })
        .selectAll('circle')
        .style('fill', 'black');
    })
    .on('mouseout', function (d) {
      link
        .style('stroke', null)
        .style('stroke-opacity', null);
      node.selectAll('circle')
        .style('fill', null);
    });


  var node = svg.selectAll('.node')
    .data(tree.leaves())
    .enter().append('g')
    .attr('class', 'node')
    .attr('transform', function (d) { return 'translate(' + xAccessor(d) + ',' + yAccessor(d) + ')'; })
    // .on('mouseover', function (d) {
    //   node.style('fill', null);
    //   d3.select(this).selectAll('circle').style('fill', 'black');
    //   var nodesToHighlight = paths.map(function (e) { return e[0] === d ? e[e.length - 1] : e[e.length - 1] === d ? e[0] : 0 })
    //     .filter(function (d) { return d; });
    //   node.filter(function (d) { return nodesToHighlight.indexOf(d) >= 0; })
    //     .selectAll('circle')
    //     .style('fill', '#555');
    //   //link
    //   //.style('stroke-opacity', function (link_d) {
    //   //  return link_d[0] === d | link_d[link_d.length - 1] === d ? 1 : null;
    //   //})
    //   //.style('stroke', function (link_d) {
    //   //  return link_d[0] === d | link_d[link_d.length - 1] === d ? '#d62333' : null;
    //   //});
    // })
    // .on('mouseout', function (d) {
    //   //link
    //   //  .style('stroke-opacity', null)
    //   //  .style('stroke', null);
    //   node.selectAll('circle')
    //     .style('fill', null);
    // });
    .on('mouseover', function (d) {
      node.style('fill', null);
      d3.select(this).selectAll('circle').style('fill', 'black');
      var nodesToHighlight = paths.map(function (e) { return e[0] === d ? e[e.length - 1] : e[e.length - 1] === d ? e[0] : 0 })
        .filter(function (d) { return d; });
      node.filter(function (d) { return nodesToHighlight.indexOf(d) >= 0; })
        .selectAll('circle')
        .style('fill', '#555');
      link
        .style('stroke-opacity', function (link_d) {
          return link_d[0] === d | link_d[link_d.length - 1] === d ? 1 : null;
        })
        .style('stroke', function (link_d) {
          return link_d[0] === d | link_d[link_d.length - 1] === d ? '#d62333' : null;
        });
    })
    .on('mouseout', function (d) {
      link
        .style('stroke-opacity', null)
        .style('stroke', null);
      node.selectAll('circle')
        .style('fill', null);
    })
    .on("click", function (d) {
      console.log(d.data.id);
      load_assaydetails(d.data.id);

    });

  node.append('circle').attr('r', 4)
    .append('title')
    .text(function (d) { return d.data.name; });

  node.append('text')
    .attr('dy', '0.32em')
    .attr('x', function (d) { return d.x < 180 ? 6 : -6; })
    .style('text-anchor', function (d) { return d.x < 180 ? 'start' : 'end'; })
    .attr('transform', function (d) { return 'rotate(' + (d.x < 180 ? d.x - 90 : d.x + 90) + ')'; })
    .text(function (d) { return d.data.id; });

  // function chapterCompare(aChaps, bChaps) {
  //   if (aChaps[0] != bChaps[0])
  //     return bChaps[0] - aChaps[0];
  //   else if (aChaps[1] != bChaps[0])
  //     return bChaps[1] - aChaps[1];
  //   else if (aChaps[2] != bChaps[2])
  //     return bChaps[2] - aChaps[2];
  //   return 0;
  // }
  //});
}

function redraw_assaynet_graph() {

  remove_old_data();
  //filtered_data = JSON.parse(JSON.stringify(unfiltered_data));
  filtered_data = clone_data(unfiltered_data)
  load_assaynet_graph(filtered_data);

}

function reset_assaynet_graph() {

  remove_old_data();
  //filtered_data = JSON.parse(JSON.stringify(unfiltered_data));
  filtered_data = clone_data(unfiltered_data)
  load_assaynet_graph(filtered_data);
}

function filter_assaynet_by_interventions(intervention_ids) {
  nodes = []
  links = []
  node_ids = []

  function in_intervention_id_filter(element, index, array) {
    return intervention_ids.includes(element);
  }

  unfiltered_data["links"].forEach(function (item, index) {
    if (item["intervention_ids"].some(in_intervention_id_filter)) {
      links.push(item)
      if (!node_ids.includes(item["source"])) {
        node_ids.push(item["source"])
      }
      if (!node_ids.includes(item["target"])) {
        node_ids.push(item["target"])
      }
    }
  });


  unfiltered_data["nodes"].forEach(function (item, index) {
    if (node_ids.includes(item["id"])) {
      nodes.push(item)
    }
  });

  filtered_data = { "nodes": nodes, "links": links }

  remove_old_data();
  load_assaynet_graph(filtered_data);
}
// $.getJSON(url, function (d) {
//   // JSON result in `data` variable
//   data = d
//   load_assaynet_graph(data);
// });

// d3.json(url).then( data => {
//   data = graph;
//   load_assaynet_graph(data);
// })

d3.json(url, function (error, data) {
  unfiltered_data = data
  //filtered_data = JSON.parse(JSON.stringify(unfiltered_data));
  filtered_data = clone_data(unfiltered_data)
  load_assaynet_graph(filtered_data);
});

// d3.json(url).then(error, data => {
//   load_assaynet_graph(data);
// });


function filter_dashboard_by_interventions(interventions) {
  filtered_data = { "nodes": [], "links": [] }

  const inlist = (element) => element in interventions;

  data.nodes.forEach((n) => {

    n.inchikeys.some(inlist)


  });



  load_assaynet_graph(filtered_data);
}

function remove_old_data() {
  svg.selectAll('*').remove();
}


selection = svg.selectAll(".link-dashboard")
  .style("stroke", "#999")
  .style("stroke-opacity", 0.6)
  .style("stroke-width", "1.5px");


function chapterHierarchy(characters) {
  var hierarchy = {
    root: { name: 'root', children: [] }
  };

  characters.forEach(function (c) {
    var chapter = c.assay_classification_ordered;
    var book = c.assay_classification_ordered.substring(0, c.assay_classification_ordered.lastIndexOf('.'));
    var volume = book.substring(0, book.lastIndexOf('.'));

    if (!hierarchy[volume]) {
      hierarchy[volume] = { name: volume, children: [], parent: hierarchy['root'] };
      hierarchy['root'].children.push(hierarchy[volume]);
    }

    if (!hierarchy[book]) {
      hierarchy[book] = { name: book, children: [], parent: hierarchy[volume] };
      hierarchy[volume].children.push(hierarchy[book]);
    }

    if (!hierarchy[chapter]) {
      hierarchy[chapter] = { name: chapter, children: [], parent: hierarchy[book] };
      hierarchy[book].children.push(hierarchy[chapter]);
    }

    c.parent = hierarchy[chapter];
    hierarchy[chapter].children.push(c);
  });

  return hierarchy['root'];
}

function xAccessor(d) {
  var angle = (d.x - 90) / 180 * Math.PI, radius = d.y;
  return radius * Math.cos(angle);
}

function yAccessor(d) {
  var angle = (d.x - 90) / 180 * Math.PI, radius = d.y;
  return radius * Math.sin(angle);
}