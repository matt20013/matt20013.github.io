var interventionTagsChart = new dc.PieChart("#interventionTagsChart");
var interventionTable = new dc.DataTable("#interventionTable");

var ndx_int;

d3.json('../static/assaynet_ct_interventions.json').then(function(experiments) {
  var fmt = d3.format('02d');
  ndx_int = crossfilter(experiments)
  var interventionTagsDimension  = ndx_int.dimension(function(d) {return d.tags;}),
    interventionTagsGroup = interventionTagsDimension.group(),
    var interventionTableDimension = ndx_int.dimension(function(d) {return [d.name, d.inchikey, d.latest_trial, d.highest_phase, d.atc_codes, d.tags];})
  interventionTagsChart
    .width(768)
    .height(480)
    .slicesCap(4)
    .innerRadius(100)
    .dimension(interventionTagsDimension)
    .group(interventionTagsGroup)
    .legend(dc.legend().highlightSelected(true))
    // workaround for #703: not enough data is accessible through .label() to display percentages
    .on('pretransition', function(chart) {
        chart.selectAll('text.pie-slice').text(function(d) {
            return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
        })
    });

  //highestPhaseChart.render();

      interventionTable
          .width(300)
          .height(480)
          .dimension(interventionTableDimension)
          .size(Infinity)
          .showSections(false)
          .columns(['name','inchikey','latest_trial', 'highest_phase','atc_codes'])
          .sortBy(function (d) { return [d.name, d.inchikey, d.latest_trial, d.highest_trial]; })
          .order(d3.ascending)
          .on('preRender', interventionUpdateOffset)
          .on('preRedraw', interventionUpdateOffset)
          .on('pretransition', interventionDisplay);

        //dc.renderAll();
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




