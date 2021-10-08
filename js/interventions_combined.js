//var interventionHighestPhaseChart = new dc.PieChart("#interventionHighestPhaseChart");
//var interventionTable = new dc.DataTable("#interventionTable");
var interventionTable = new dc_datatables.datatable("#interventionTable");
//('.dc-data-table');
var interventionHasAssaysChart = new dc.PieChart("#interventionHasAssaysChart");
var interventionHasClinicalTrialsChart = new dc.PieChart("#interventionHasClinicalTrialsChart");
var interventionInALSUntangledChart = new dc.PieChart("#interventionInALSUntangledChart");
var interventionTagsChart = new dc.RowChart("#interventionTagsChart");
var ndx_int;

d3.json('../assaynet_matched_interventions.json').then(function(experiments) {
  var fmt = d3.format('02d');
  ndx_int = crossfilter(experiments)
    var interventionHasAssaysDimension  = ndx_int.dimension(function(d) {return d.has_assays;}),
    interventionHasAssaysGroup = interventionHasAssaysDimension.group()
    var interventionHasClinicalTrialsDimension  = ndx_int.dimension(function(d) {return d.has_clinical_trials;}),
    interventionHasClinicalTrialsGroup = interventionHasClinicalTrialsDimension.group()
    var interventionInALSUntangledDimension  = ndx_int.dimension(function(d) {return d.in_als_untangled;}),
    interventionInALSUntangledGroup = interventionInALSUntangledDimension.group()

  function reduceAdd(p, v) {
      v.tags.forEach (function(val, idx) {
         p[val] = (p[val] || 0) + 1; //increment counts
      });
      return p;
    }

    function reduceRemove(p, v) {
      v.tags.forEach (function(val, idx) {
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
    .width(768)
    .height(480)
    //.x(d3.scaleLinear().domain([6,20]))
    //.x(d3.scale.ordinal().domain(interventionTagsDimension))
    //.x(d3.scaleBand())
    //.xUnits(dc.units.ordinal)
    .elasticX(true)
    .dimension(interventionTagsDimension)
    .group(interventionTagsGroup)
    .legend(dc.legend().highlightSelected(true))
    .rowsCap(20);
    //.cap(10)

    interventionTagsChart.ordering(function(d) { return -d.value; })

    interventionTagsChart.render();
    var interventionTableDimension = ndx_int.dimension(function(d) {return [d.name,d.has_assays,d.has_clinical_trials, d.in_als_untangled,d.assay_classification_types, d.trial_links_new, d.tags];})
  interventionHasAssaysChart
    .width(300)
    .height(300)
    .slicesCap(4)
    .innerRadius(100)
    .dimension(interventionHasAssaysDimension)
    .group(interventionHasAssaysGroup)
    .legend(dc.legend().highlightSelected(true))
    // workaround for #703: not enough data is accessible through .label() to display percentages
    .on('pretransition', function(chart) {
        chart.selectAll('text.pie-slice').text(function(d) {
            return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
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
    .on('pretransition', function(chart) {
        chart.selectAll('text.pie-slice').text(function(d) {
            return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
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
    .on('pretransition', function(chart) {
        chart.selectAll('text.pie-slice').text(function(d) {
            return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
        })
    });

  interventionHasClinicalTrialsChart.render();

interventionTable /* dc_datatables.datatable('.dc-data-table') */
        .dimension(interventionTableDimension)
        // Data table does not use crossfilter group but rather a closure
        // as a grouping function
//        .group(function (d) {
//            var format = d3.format('02d');
//            return d.dd.getFullYear() + '/' + format((d.dd.getMonth() + 1));
//        })
        // (_optional_) max number of records to be shown, `default = 25`
        .size(10)
        // There are several ways to specify the columns; see the data-table documentation.
        // This code demonstrates generating the column header automatically based on the columns.
        .columns([
            // Use the `d.date` field; capitalized automatically; specify sorting order
            'name','has_assays','has_clinical_trials', 'in_als_untangled','assay_classification_types','trial_links_new','tags'
        ])

        // (_optional_) sort using the given field, `default = function(d){return d;}`
//        .sortBy(function (d) {
//            return d.name;
//        })
        // (_optional_) sort order, `default = d3.ascending`
        .order(d3.ascending)
        // (_optional_) custom renderlet to post-process chart using [D3](http://d3js.org)
        .on('renderlet', function (table) {
            table.selectAll('.dc-table-group').classed('info', true);
        });

//      interventionTable
//          .width(800)
//          .height(480)
//          .dimension(interventionTableDimension)
//          .size(Infinity)
//          .showSections(false)
//          .columns(['name','has_assays','has_clinical_trials', 'in_als_untangled','assay_classification_types','trial_links_new','tags'])
//          .sortBy(function (d) { return [d.name]; })
//          .order(d3.ascending)
//          .on('preRender', interventionUpdateOffset)
//          .on('preRedraw', interventionUpdateOffset)
//          .on('pretransition', interventionDisplay);
//
//        //dc.renderAll();
    interventionTable.render();
});

      var intervention_ofs = 0, intervention_pag = 10;
      function interventionUpdateOffset() {
          var totFilteredRecs = ndx_int.groupAll().value();
          var end = intervention_ofs + pag > totFilteredRecs ? totFilteredRecs : intervention_ofs + intervention_pag;
          intervention_ = intervention_ofs >= totFilteredRecs ? Math.floor((totFilteredRecs - 1) / intervention_pag) * intervention_pag : intervention_ofs;
          intervention_ = intervention_ofs < 0 ? 0 : intervention_ofs;

          interventionTable.beginSlice(intervention_ofs);
          interventionTable.endSlice(intervention_ofs+intervention_pag);
      }
      function interventionDisplay() {
          var totFilteredRecs = ndx_int.groupAll().value();
          var end = intervention_ofs + intervention_pag > totFilteredRecs ? totFilteredRecs : intervention_ofs + intervention_pag;
          d3.select('#interventionBegin')
              .text(end === 0? intervention_ofs : intervention_ofs + 1);
          d3.select('#interventionEnd')
              .text(end);
          d3.select('#interventionLast')
              .attr('disabled', intervention_ofs-intervention_pag<0 ? 'true' : null);
          d3.select('#interventionNext')
              .attr('disabled', intervention_ofs+intervention_pag>=totFilteredRecs ? 'true' : null);
          d3.select('#interventionSize').text(totFilteredRecs);
          if(totFilteredRecs != ndx_int.size()){
            d3.select('#interventionTotalSize').text("(filtered Total: " + ndx_int.size() + " )");
          }else{
            d3.select('#interventionTotalSize').text('');
          }
      }
      function interventionNext() {
          intervention_ofs += intervention_pag;
          interventionUpdateOffset();
          interventionTable.redraw();
      }
      function interventionLast() {
          intervention_ofs -= intervention_pag;
          interventionUpdateOffset();
          interventionTable.redraw();
      }




