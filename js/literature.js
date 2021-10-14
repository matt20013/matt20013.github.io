//var literatureHighestPhaseChart = new dc.PieChart("#literatureHighestPhaseChart");
var literatureTable = new dc.DataTable("#literatureTable");
//var literatureTable = dc.tableview("#literatureTable");
//var literatureTriageChart = new dc.PieChart("#literatureTriageChart")
var literatureTriageChart = new dc.PieChart("#literatureTriageChart")
var literatureYearCountsChart = new dc.BarChart('#literatureYearCountsChart');
var literatureKeywordFilterChart = new dc.PieChart('#literatureKeywordFilterChart');
var literatureJournalChart = new dc.RowChart('#literatureJournalChart');
var ndx_literature;

d3.json('../data/assaynet_literature.json').then(function (data) {
  var fmt_literature = d3.format('02d');
  ndx_literature = crossfilter(data);
  var all_literature = ndx_literature.groupAll();
  var literatureTriageDimension = ndx_literature.dimension(function (d) { return d.triage_description ?? "N/a"; });
  var literatureTriageGroup = literatureTriageDimension.group().reduceCount();
  var literatureTableDimension = ndx_literature.dimension(function (d) { return [d.pmid, d.journal, d.title, d.year, d.lm_interventions_title, d.triage_description]; });
  var literatureYearDimension = ndx_literature.dimension(function (d) { return d.year; });
  var literatureYearGroup = literatureYearDimension.group();
  var literatureKeywordFilterDimension = ndx_literature.dimension(function (d) { return d.keyword_filter; });
  var literatureKeywordFilterGroup = literatureKeywordFilterDimension.group();
  var literaturePMIDDimension = ndx_literature.dimension(function (d) { return d.pmid; });
  var literaturePMIDGroup = literaturePMIDDimension.group();

  literatureTriageChart
  //   .width(1268)
  //   .height(880)
  //   //.x(d3.scaleLinear().domain([6,20]))
  //   //.x(d3.scale.ordinal().domain(interventionTagsDimension))
  //   //.x(d3.scaleBand())
  //   //.xUnits(dc.units.ordinal)
  //   .elasticX(true)
  //   //.othersGrouper(null)
  //   .dimension(literatureTriageDimension)
  //   .group(literatureTriageGroup)
  //   .legend(dc.legend().highlightSelected(true))
  //   .rowsCap(30);
  // //.cap(10)

  literatureTriageChart
    .width(480)
    .height(480)
    .innerRadius(100)
    .slicesCap(10)
    .dimension(literatureTriageDimension)
    .group(literatureTriageGroup)
    .legend(dc.legend().highlightSelected(true));
  literatureTriageChart.render();


  interventionTagsChart.ordering(function (d) { return -d.value; })
  interventionTagsChart.render();

  // jQuery(document).ready(
  //   function() {
  //         $('#literatureTable').on( 'processing.dt', function ( e, settings, processing ) {

  //            $.blockUI(
  //              { message: '<h4>Please wait while instruments are loaded...</h4>',
  //                css: {
  //                border: 'none',
  //                padding: '15px',
  //                backgroundColor: '#000',
  //                '-webkit-border-radius': '10px',
  //                '-moz-border-radius': '10px',
  //                opacity: .5,
  //                color: '#fff'
  //                }
  //              }
  //            );

  //          });
  // literatureTriageChart
  //   .width(480)
  //   .height(480)
  //   .innerRadius(100)
  //   .slicesCap(10)
  //   .dimension(literatureTriageDimension)
  //   .group(literatureTriageGroup)
  //   .legend(dc.legend().highlightSelected(true));

  literatureKeywordFilterChart
    .width(480)
    .height(480)
    .innerRadius(100)
    .slicesCap(10)
    .dimension(literatureKeywordFilterDimension)
    .group(literatureKeywordFilterGroup)
    .legend(dc.legend().highlightSelected(true));
  literatureKeywordFilterChart.render();

  literatureYearCountsChart
    .width(420)
    .height(180)
    .margins({ top: 10, right: 50, bottom: 30, left: 40 })
    .dimension(literatureYearDimension)
    .group(literatureYearGroup)
    .elasticY(true)
    //.elasticX(true)
    .x(d3.scaleLinear().domain([1985, 2021]))
    // (_optional_) whether bar should be center to its x value. Not needed for ordinal chart, `default=false`
    .centerBar(true)
    // (_optional_) set gap between bars manually in px, `default=2`
    .gap(1)
    // (_optional_) set filter brush rounding
    .round(Math.floor)
    .alwaysUseRounding(true);
  //.x(d3.scaleLinear().domain([-25, 25]))
  //.renderHorizontalGridLines(true)

  literatureYearCountsChart.render();
  // Customize the filter displayed in the control span
  //        .filterPrinter(filters => {
  //            const filter = filters[0];
  //            let s = '';
  //            s += `${numberFormat(filter[0])}% -> ${numberFormat(filter[1])}%`;
  //            return s;
  //        });
  // workaround for #703: not enough data is accessible through .label() to display percentages
  //        .on('pretransition', function(chart) {
  //            chart.selectAll('text.pie-slice').text(function(d) {
  //                return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + '%';
  //            })
  //        });
  //.legend(dc.legend().highlightSelected(true))
  //workaround for #703: not enough data is accessible through .label() to display percentages
  //    .on('pretransition', function(chart) {
  //        chart.selectAll('text.pie-slice').text(function(d) {
  //            return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
  //        })});

  //  literatureTriageChart
  //    .width(768)
  //    .height(480)
  //    .x(d3.scaleLinear().domain([6,20]))
  //    .elasticX(true)
  //    .dimension(literatureTriageDimension)
  //    .group(literatureTriageGroup);
  //    //.render();

  literatureTriageChart.render();

  literatureTable
    .width(300)
    .height(480)
    .dimension(literatureTableDimension)
    .size(Infinity)
    .showSections(false)
    .columns(['pubmed_link', 'journal', 'title', 'year', 'lm_interventions_title', 'triage'])
    .sortBy(function (d) { return [d.pubmed_link]; })
    .order(d3.ascending)
    .on('preRender', literatureUpdateOffset)
    .on('preRedraw', literatureUpdateOffset)
    .on('pretransition', literatureDisplay);

  literatureTable.render();

  var literatureJournalDimension = ndx_literature.dimension(function (d) { return d.journal; });
  var literatureJournalGroup = literatureJournalDimension.group();

  literatureJournalChart
    .width(800)
    .height(800)
    //.x(d3.scaleLinear().domain([6,20]))
    //.x(d3.scale.ordinal().domain(interventionTagsDimension))
    //.x(d3.scaleBand())
    //.xUnits(dc.units.ordinal)
    .elasticX(true)
    .othersGrouper(null)
    .dimension(literatureJournalDimension)
    .group(literatureJournalGroup)
    .legend(dc.legend().highlightSelected(true))
    .rowsCap(30);
  //.cap(10)

  literatureJournalChart.render();
  // //dc.renderAll();
  // literatureTable.render();


  // literatureTable
  //   .dimension(literaturePMIDDimension)
  //   .group(literaturePMIDGroup)
  //   .columns([
  //     { title: "PMID", data: "pmid" },
  //     { title: "journal", data: "journal" },
  //     { title: "title", data: "title" },
  //     { title: "year", data: "year" },
  //     { title: "LM Interventions", data: "lm_interventions_title" },
  //     { title: "Triage", data: "triage" }
  //     // { title: "AssayNET", data: "has_assays"},
  //     // { title: "CT", data: "has_clinical_trials"},
  //     // { title: "ALS UT", data: "in_als_untangled"},
  //     // { title: "Classes", data: "assay_classification_types"},
  //     // { title: "CTs", data: "trial_links_new"},
  //     // { title: "Tags", data: "tags"}
  //   ])
  //   .enableColumnReordering(false)
  //   .enablePaging(true)
  //   .enablePagingSizeChange(false)
  //   //.enableSearch(true)
  //   .enableScrolling(true)
  //   .scrollingOptions({
  //     scrollY: "31rem",
  //     scrollCollapse: true,
  //     deferRender: true,
  //   })
  //   .rowId("pmid")
  //   // .showGroups(true)
  //   // .groupBy("Expt")
  //   .responsive(true)
  //   .select(false)
  //   .fixedHeader(false)
  //   //.buttons(["pdf", "csv", "excel", "print"])
  //   //.sortBy([["pmid", "asc"]])
  //   .listeners({
  //     rowClicked: function (row, data, index) {
  //       var output = document.querySelector("#alerts");
  //       output.innerHTML = createAlert(`Click on row ${index}!`, JSON.stringify(data));
  //     },
  //     rowDblClicked: function (row, data, index) {
  //       var output = document.querySelector("#alerts");
  //       output.innerHTML = createAlert(`Double click on row ${index}!`, JSON.stringify(data));
  //     },
  //     rowEnter: function (row, data, index) {
  //       row.style.backgroundColor = "#eff9ff";
  //     },
  //     rowLeave: function (row, data, index) {
  //       row.style.backgroundColor = "";
  //     }
  //   });

  

});



var literature_ofs = 0, literature_pag = 10;
function literatureUpdateOffset() {
  var totFilteredRecs = ndx_literature.groupAll().value();
  var end = literature_ofs + pag > totFilteredRecs ? totFilteredRecs : literature_ofs + literature_pag;
  literature_ = literature_ofs >= totFilteredRecs ? Math.floor((totFilteredRecs - 1) / literature_pag) * literature_pag : literature_ofs;
  literature_ = literature_ofs < 0 ? 0 : literature_ofs;

  literatureTable.beginSlice(literature_ofs);
  literatureTable.endSlice(literature_ofs + literature_pag);
}
function literatureDisplay() {
  var totFilteredRecs = ndx_literature.groupAll().value();
  var end = literature_ofs + literature_pag > totFilteredRecs ? totFilteredRecs : literature_ofs + literature_pag;
  d3.select('#literatureBegin')
    .text(end === 0 ? literature_ofs : literature_ofs + 1);
  d3.select('#literatureEnd')
    .text(end);
  d3.select('#literatureLast')
    .attr('disabled', literature_ofs - literature_pag < 0 ? 'true' : null);
  d3.select('#literatureNext')
    .attr('disabled', literature_ofs + literature_pag >= totFilteredRecs ? 'true' : null);
  d3.select('#literatureSize').text(totFilteredRecs);
  if (totFilteredRecs != ndx_literature.size()) {
    d3.select('#literatureTotalSize').text("(filtered Total: " + ndx_literature.size() + " )");
  } else {
    d3.select('#literatureTotalSize').text('');
  }
}
function literatureNext() {
  literature_ofs += literature_pag;
  literatureUpdateOffset();
  literatureTable.redraw();
}
function literatureLast() {
  literature_ofs -= literature_pag;
  literatureUpdateOffset();
  literatureTable.redraw();
}