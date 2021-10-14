const INTERVENTION_GROUP = "INTERVENTION";
//var interventionHighestPhaseChart = new dc.PieChart("#interventionHighestPhaseChart");
//var interventionTable = new dc.DataTable("#interventionTable");
//var interventionTable = new dc_datatables.datatable("#interventionTable");
var interventionTable = dc.tableview("#interventionTable",INTERVENTION_GROUP);
var interventionALSUntangledTable = dc.tableview("#interventionALSUntangledTable",INTERVENTION_GROUP);
//('.dc-data-table');
var interventionHasAssaysChart = new dc.PieChart("#interventionHasAssaysChart",INTERVENTION_GROUP);
var interventionHasClinicalTrialsChart = new dc.PieChart("#interventionHasClinicalTrialsChart",INTERVENTION_GROUP);
var interventionInALSUntangledChart = new dc.PieChart("#interventionInALSUntangledChart",INTERVENTION_GROUP);
var interventionTagsChart = new dc.RowChart("#interventionTagsChart",INTERVENTION_GROUP);
var interventionInALSUntangledMechanismChart = new dc.PieChart("#interventionInALSUntangledMechanismChart",INTERVENTION_GROUP);
var interventionInALSUntangledPreclinicalChart = new dc.PieChart("#interventionInALSUntangledPreclinicalChart",INTERVENTION_GROUP);
var interventionInALSUntangledCasesChart = new dc.PieChart("#interventionInALSUntangledCasesChart",INTERVENTION_GROUP);
var interventionInALSUntangledTrialsChart = new dc.PieChart("#interventionInALSUntangledTrialsChart",INTERVENTION_GROUP);
var interventionInALSUntangledRisksChart = new dc.PieChart("#interventionInALSUntangledRisksChart",INTERVENTION_GROUP);
var interventionATCTopLevelChart = new dc.RowChart("#interventionATCTopLevelChart",INTERVENTION_GROUP);
var ndx_int;

var interventionNameDimension;
var interventionNameGroup;

function intervention_reset() {
  // reset all trial filters
  dc.filterAll(INTERVENTION_GROUP)
  dc.redrawAll(INTERVENTION_GROUP)
}

function intervention_tag_filter(tag) {
  // filter tagRowChart 
  //interventionTagsChart.filterAll();
  dc.filterAll(INTERVENTION_GROUP)
  interventionTagsChart.filter(tag);
  interventionTagsChart.redraw();
}

function getFilteredInterventions() {
  interventions = interventionNameDimension.top(Infinity);;
  let ids = interventions.map(({ id }) => id);
  console.log(ids);
  filter_assaynet_by_interventions(ids)
  openTab(null, 'DashboardTab')
  openTabSubNetwork(null, "NetworkTab")
}

d3.json('../data/assaynet_matched_interventions.json').then(function (experiments) {
  var fmt = d3.format('02d');
  ndx_int = crossfilter(experiments)
  var interventionHasAssaysDimension = ndx_int.dimension(function (d) { return d.has_assays; }),
    interventionHasAssaysGroup = interventionHasAssaysDimension.group()
  var interventionHasClinicalTrialsDimension = ndx_int.dimension(function (d) { return d.has_clinical_trials; }),
    interventionHasClinicalTrialsGroup = interventionHasClinicalTrialsDimension.group()
  var interventionInALSUntangledDimension = ndx_int.dimension(function (d) { return d.in_als_untangled; }),
    interventionInALSUntangledGroup = interventionInALSUntangledDimension.group()

  function reduceAdd(p, v) {
    v.tags.forEach(function (val, idx) {
      p[val] = (p[val] || 0) + 1; //increment counts
    });
    return p;
  }

  function reduceRemove(p, v) {
    v.tags.forEach(function (val, idx) {
      p[val] = (p[val] || 0) - 1; //decrement counts
    });
    return p;

  }

  function reduceInitial() {
    return {};
  }


  //var interventionTagsDimension  = ndx_int.dimension(function(d) {return d.tags;}),
  var interventionTagsDimension = ndx_int.dimension(d => d.tags.map(r => r), true);
  interventionTagsGroup = interventionTagsDimension.group()
  //interventionTagsGroup = interventionTagsDimension.group().reduce(reduceAdd, reduceRemove, reduceInitial);
  interventionTagsChart
    .width(1268)
    .height(880)
    //.x(d3.scaleLinear().domain([6,20]))
    //.x(d3.scale.ordinal().domain(interventionTagsDimension))
    //.x(d3.scaleBand())
    //.xUnits(dc.units.ordinal)
    .elasticX(true)
    .othersGrouper(null)
    .dimension(interventionTagsDimension)
    .group(interventionTagsGroup)
    .legend(dc.legend().highlightSelected(true))
    .rowsCap(30);
  //.cap(10)

  interventionTagsChart.ordering(function (d) { return -d.value; })
  interventionTagsChart.render();

  var interventionATCTopLevelDimension = ndx_int.dimension(d => d.top_level_atc_codes.map(r => r), true);
  var interventionATCTopLevelGroup = interventionATCTopLevelDimension.group();
  interventionATCTopLevelChart
    .width(1268)
    .height(880)
    //.x(d3.scaleLinear().domain([6,20]))
    //.x(d3.scale.ordinal().domain(interventionTagsDimension))
    //.x(d3.scaleBand())
    //.xUnits(dc.units.ordinal)
    .elasticX(true)
    .othersGrouper(null)
    .dimension(interventionATCTopLevelDimension)
    .group(interventionATCTopLevelGroup)
    .legend(dc.legend().highlightSelected(true))
    .rowsCap(30);
  //.cap(10)

  interventionATCTopLevelChart.render();

  interventionHasAssaysChart
    .width(300)
    .height(300)
    .slicesCap(4)
    .innerRadius(100)
    .dimension(interventionHasAssaysDimension)
    .group(interventionHasAssaysGroup)
    .legend(dc.legend().highlightSelected(true))
    // workaround for #703: not enough data is accessible through .label() to display percentages
    .on('pretransition', function (chart) {
      chart.selectAll('text.pie-slice').text(function (d) {
        return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + '%';
      })
    });

  interventionHasAssaysChart.render();


  interventionInALSUntangledChart
    .width(300)
    .height(300)
    .slicesCap(4)
    .innerRadius(100)
    .dimension(interventionInALSUntangledDimension)
    .group(interventionInALSUntangledGroup)
    .legend(dc.legend().highlightSelected(true))
    // workaround for #703: not enough data is accessible through .label() to display percentages
    .on('pretransition', function (chart) {
      chart.selectAll('text.pie-slice').text(function (d) {
        return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + '%';
      })
    });

  interventionInALSUntangledChart.render();

  interventionHasClinicalTrialsChart
    .width(300)
    .height(300)
    .slicesCap(4)
    .innerRadius(100)
    .dimension(interventionHasClinicalTrialsDimension)
    .group(interventionHasClinicalTrialsGroup)
    .legend(dc.legend().highlightSelected(true))
    // workaround for #703: not enough data is accessible through .label() to display percentages
    .on('pretransition', function (chart) {
      chart.selectAll('text.pie-slice').text(function (d) {
        return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + '%';
      })
    });

  interventionHasClinicalTrialsChart.render();

  var interventionTableDimension = ndx_int.dimension(function (d) { return [d.name]; });
  
  // interventionTable /* dc_datatables.datatable('.dc-data-table') */
  //   .dimension(interventionNameDimension)
  //   // Data table does not use crossfilter group but rather a closure
  //   // as a grouping function
  //   //        .group(function (d) {
  //   //            var format = d3.format('02d');
  //   //            return d.dd.getFullYear() + '/' + format((d.dd.getMonth() + 1));
  //   //        })
  //   // (_optional_) max number of records to be shown, `default = 25`
  //   .size(10)
  //   .columns([
  //      {"name":'iname',"type":"html","label":"Name"}
  //   ])
  //   .on('renderlet', function (table) {
  //     table.selectAll('.dc-table-group').classed('info', true);
  //   });

  // interventionTable.render();

  interventionNameDimension = ndx_int.dimension(function (d) {
    return d.name;
  
  });
  interventionNameGroup = interventionNameDimension.group();
  

  interventionTable
    .dimension(interventionNameDimension)
    .group(interventionNameGroup)
    .columns([
      { title: "Name", data: "name_link"},
      { title: "AssayNET", data: "has_assays"},
      { title: "CT", data: "has_clinical_trials"},
      { title: "ALS UT", data: "in_als_untangled"},
      { title: "Classes", data: "assay_classification_types"},
      { title: "CTs", data: "trial_links_new"},
      { title: "Preclinical", data: "preclinical"},
      { title: "ATC Codes", data: "atc_codes"},
      { title: "Names", data: "names"},
      { title: "Tags", data: "tags"}
    ])
    .enableColumnReordering(true)
    .enablePaging(true)
    .enablePagingSizeChange(true)
    .enableSearch(true)
    .enableScrolling(false)
    .scrollingOptions({
      scrollY: "50rem",
      scrollCollapse: true,
      deferRender: true,
    })
    .rowId("Expt")
    // .showGroups(true)
    // .groupBy("Expt")
    .responsive(true)
    .select(false)
    .fixedHeader(true)
    .buttons(["pdf", "csv", "excel", "print"])
    .sortBy([["name_link", "asc"]])
    .listeners({
      rowClicked: function (row, data, index) {
        var output = document.querySelector("#alerts");
        output.innerHTML = createAlert(`Click on row ${index}!`, JSON.stringify(data));
      },
      rowDblClicked: function (row, data, index) {
        var output = document.querySelector("#alerts");
        output.innerHTML = createAlert(`Double click on row ${index}!`, JSON.stringify(data));
      },
      rowEnter: function (row, data, index) {
        row.style.backgroundColor = "#eff9ff";
      },
      rowLeave: function (row, data, index) {
        row.style.backgroundColor = "";
      }
    });

  interventionTable.render();


  var interventionALSUTNameDimension = ndx_int.dimension(function (d) {
    return d.name;

  });
  var interventionALSUTNameGroup = interventionALSUTNameDimension.group();

  interventionALSUntangledTable
  .dimension(interventionALSUTNameDimension)
  .group(interventionALSUTNameGroup)
  .columns([
    { title: "Name", data: "als_untangled_link"},
    { title: "Mechanism Score", data: "mechanism_score"},
    { title: "Mechanism Desc", data: "mechanism_description"},
    { title: "Preclinical Score", data: "preclinical_score"},
    { title: "Preclinical Desc", data: "preclinical_description"},
    { title: "Preclinical PMIDs", data: "preclinical_pmids"},
    { title: "Preclinical Summary", data: "preclinical_summary"},
    { title: "Case Score", data: "case_score"},
    { title: "Case Desc", data: "case_description"},
    { title: "Trials Score", data: "trials_score"},
    { title: "Trials Desc", data: "trials_description"},
    { title: "Trials PMIDs", data: "trials_pmids"},
    { title: "Trials Summary", data: "trials_summary"},
    { title: "Risks Score", data: "risks_score"},

  ])
  .enableColumnReordering(true)
  .enablePaging(true)
  .enablePagingSizeChange(true)
  .enableSearch(true)
  .enableScrolling(false)
  .scrollingOptions({
    scrollY: "31rem",
    scrollCollapse: true,
    deferRender: true,
  })
  .rowId("Expt")
  // .showGroups(true)
  // .groupBy("Expt")
  .responsive(true)
  .select(false)
  .fixedHeader(true)
  .buttons(["pdf", "csv", "excel", "print"])
  .sortBy([["als_untangled_link", "asc"]])
  .listeners({
    rowClicked: function (row, data, index) {
      var output = document.querySelector("#alerts");
      output.innerHTML = createAlert(`Click on row ${index}!`, JSON.stringify(data));
    },
    rowDblClicked: function (row, data, index) {
      var output = document.querySelector("#alerts");
      output.innerHTML = createAlert(`Double click on row ${index}!`, JSON.stringify(data));
    },
    rowEnter: function (row, data, index) {
      row.style.backgroundColor = "#eff9ff";
    },
    rowLeave: function (row, data, index) {
      row.style.backgroundColor = "";
    }
  });

interventionALSUntangledTable.render();
// ALS Untangled mechanism
//var interventionInALSUntangledMechanismDimension = ndx_int.dimension(function (d) { return  d.mechanism_score; });
var interventionInALSUntangledMechanismDimension = ndx_int.dimension(function (d) { return  d.mechanism_score ?? "N/a" });
var interventionInALSUntangledMechanismGroup = interventionInALSUntangledMechanismDimension.group();

interventionInALSUntangledMechanismChart
.width(400)
.height(400)
.slicesCap(7)
.innerRadius(100)
.dimension(interventionInALSUntangledMechanismDimension)
.group(interventionInALSUntangledMechanismGroup)
.legend(dc.legend().highlightSelected(true))
// workaround for #703: not enough data is accessible through .label() to display percentages
.on('pretransition', function (chart) {
  chart.selectAll('text.pie-slice').text(function (d) {
    return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + '%';
  })
});

interventionInALSUntangledMechanismChart.render();

// ALS Untangled Preclinical
var interventionInALSUntangledPreclinicalDimension = ndx_int.dimension(function (d) { return d.preclinical_score ?? "N/a"; });
var interventionInALSUntangledPreclinicalGroup = interventionInALSUntangledPreclinicalDimension.group();

interventionInALSUntangledPreclinicalChart
.width(400)
.height(400)
.slicesCap(7)
.innerRadius(100)
.dimension(interventionInALSUntangledPreclinicalDimension)
.group(interventionInALSUntangledPreclinicalGroup)
.legend(dc.legend().highlightSelected(true))
// workaround for #703: not enough data is accessible through .label() to display percentages
.on('pretransition', function (chart) {
  chart.selectAll('text.pie-slice').text(function (d) {
    return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + '%';
  })
});

interventionInALSUntangledPreclinicalChart.render();

var interventionInALSUntangledCasesDimension = ndx_int.dimension(function (d) { return d.case_score ?? "N/a"; });
var interventionInALSUntangledCasesGroup = interventionInALSUntangledCasesDimension.group();

interventionInALSUntangledCasesChart
.width(400)
.height(400)
.slicesCap(7)
.innerRadius(100)
.dimension(interventionInALSUntangledCasesDimension)
.group(interventionInALSUntangledCasesGroup)
.legend(dc.legend().highlightSelected(true))
// workaround for #703: not enough data is accessible through .label() to display percentages
.on('pretransition', function (chart) {
  chart.selectAll('text.pie-slice').text(function (d) {
    return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + '%';
  })
});

interventionInALSUntangledCasesChart.render();

var interventionInALSUntangledTrialsDimension = ndx_int.dimension(function (d) { return d.trials_score ?? "N/a"; });
var interventionInALSUntangledTrialsGroup = interventionInALSUntangledTrialsDimension.group();

interventionInALSUntangledTrialsChart
.width(400)
.height(400)
.slicesCap(7)
.innerRadius(100)
.dimension(interventionInALSUntangledTrialsDimension)
.group(interventionInALSUntangledTrialsGroup)
.legend(dc.legend().highlightSelected(true))
// workaround for #703: not enough data is accessible through .label() to display percentages
.on('pretransition', function (chart) {
  chart.selectAll('text.pie-slice').text(function (d) {
    return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + '%';
  })
});

interventionInALSUntangledTrialsChart.render();

var interventionInALSUntangledRisksDimension = ndx_int.dimension(function (d) { return d.risks_score ?? "N/a"; });
var interventionInALSUntangledRisksGroup = interventionInALSUntangledRisksDimension.group();

interventionInALSUntangledRisksChart
.width(400)
.height(400)
.slicesCap(7)
.innerRadius(100)
.dimension(interventionInALSUntangledRisksDimension)
.group(interventionInALSUntangledRisksGroup)
.legend(dc.legend().highlightSelected(true))
// workaround for #703: not enough data is accessible through .label() to display percentages
.on('pretransition', function (chart) {
  chart.selectAll('text.pie-slice').text(function (d) {
    return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + '%';
  })
});

interventionInALSUntangledRisksChart.render();

});




