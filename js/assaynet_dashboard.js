
var diameter = 1200;
var width = window.innerWidth;
var height = window.innerHeight;
var radius = diameter / 2;
var innerRadius = radius - 70;

var cluster = d3.cluster()
  .size([360, innerRadius])
  .separation(function (a, b) { return (a.parent == b.parent ? 1 : a.parent.parent == b.parent.parent ? 2 : 4); });

var line = d3.line()
  .x(xAccessor)
  .y(yAccessor)
  .curve(d3.curveBundle.beta(0.7));

var svg = d3.select('#DashboardTab').append("svg:svg")
  .attr('width', 1200)
  .attr('height', 1200)
  //.attr('height',"100%")
  //.attr('weight',2000)
  .append('g')
  .attr('transform', 'translate(' + radius + ',' + radius + ')');

url = "../assaynet.json"

var data = null;



function load_assaynet_graph(graph) {

  //d3.json(data, function (error, graph) {
  //if (error) throw error;

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
    n.chapters = n.chapters.map(function (chaps) { return chaps.split('.').map(function (c) { return parseInt(c); }); });
    n.chapters.sort(chapterCompare).reverse();
    n.firstChapter = n.name[0]
    //n.firstChapter = n.chapters[0].map(function (d) { return d.toString().length == 1 ? '0' + d.toString() : d.toString(); }).join('.');
  });

  var tree = cluster(d3.hierarchy(chapterHierarchy(graph.nodes)).sort(function (a, b) {
    if (a.data.hasOwnProperty('firstChapter') && b.data.hasOwnProperty('firstChapter'))
      return a.data.firstChapter.localeCompare(b.data.firstChapter);
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
    //    .style('stroke-width', "1.5px")
    //    .style('stroke-opacity', 0.6)
    //    .style('stroke', '#999')
    .attr('d', function (d) { return line(d) })
    //.style('stroke',function(d){return d.colour})
    //    d3.select(this)
    //        .style('stroke', function(d){return d.colour})
    //        .style('stroke-opacity', 1);
    .on('mouseover', function (l) {
      //link
      //  .style('stroke', null)
      //  .style('stroke-opacity', null);
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
      //link
      //  .style('stroke', null)
      //  .style('stroke-opacity', null);
      node.selectAll('circle')
        .style('fill', null);
    });


  var node = svg.selectAll('.node')
    .data(tree.leaves())
    .enter().append('g')
    .attr('class', 'node')
    .attr('transform', function (d) { return 'translate(' + xAccessor(d) + ',' + yAccessor(d) + ')'; })
    .on('mouseover', function (d) {
      node.style('fill', null);
      d3.select(this).selectAll('circle').style('fill', 'black');
      var nodesToHighlight = paths.map(function (e) { return e[0] === d ? e[e.length - 1] : e[e.length - 1] === d ? e[0] : 0 })
        .filter(function (d) { return d; });
      node.filter(function (d) { return nodesToHighlight.indexOf(d) >= 0; })
        .selectAll('circle')
        .style('fill', '#555');
      //link
      //.style('stroke-opacity', function (link_d) {
      //  return link_d[0] === d | link_d[link_d.length - 1] === d ? 1 : null;
      //})
      //.style('stroke', function (link_d) {
      //  return link_d[0] === d | link_d[link_d.length - 1] === d ? '#d62333' : null;
      //});
    })
    .on('mouseout', function (d) {
      //link
      //  .style('stroke-opacity', null)
      //  .style('stroke', null);
      node.selectAll('circle')
        .style('fill', null);
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

  function chapterCompare(aChaps, bChaps) {
    if (aChaps[0] != bChaps[0])
      return bChaps[0] - aChaps[0];
    else if (aChaps[1] != bChaps[0])
      return bChaps[1] - aChaps[1];
    else if (aChaps[2] != bChaps[2])
      return bChaps[2] - aChaps[2];
    return 0;
  }
  //});
}


$.getJSON(url, function (d) {
  // JSON result in `data` variable
  data = d
  load_assaynet_graph(data);
});

function filter_dashboard_by_interventions(interventions) {
  filtered_data = { "nodes": [], "links": [] }

  const inlist = (element) => element in interventions;

  data.nodes.forEach((n) => {

    n.inchikeys.some(inlist)


  });



  load_assaynet_graph(filtered_data);
}

function reset_dashboard() {
  load_assaynet_graph(data);
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
    var chapter = c.firstChapter;
    var book = c.firstChapter.substring(0, c.firstChapter.lastIndexOf('.'));
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