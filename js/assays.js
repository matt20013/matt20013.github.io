//var assayHighestPhaseChart = new dc.PieChart("#assayHighestPhaseChart");
var assayTable = new dc.DataTable("#assayTable");
var assayClassificationChart = new dc.PieChart("#assayClassificationChart")
var ndx_assay;

d3.json('../static/assaynet_assays.json').then(function(experiments) {
  var fmt = d3.format('02d');
  ndx_assay = crossfilter(experiments)
    var assayClassificationDimension  = ndx_assay.dimension(function(d) {return d.classification;})
    var assayClassificationGroup = assayClassificationDimension.group()
    var assayTableDimension = ndx_assay.dimension(function(d) {return [d.pmid, d.text, d.classification, d.combined_species];})
  assayClassificationChart
    .width(768)
    .height(480)
    .slicesCap(4)
    .innerRadius(100)
    .dimension(assayClassificationDimension)
    .group(assayClassificationGroup)
    .legend(dc.legend().highlightSelected(true))
    // workaround for #703: not enough data is accessible through .label() to display percentages
    .on('pretransition', function(chart) {
        chart.selectAll('text.pie-slice').text(function(d) {
            return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
        })
    });

  assayClassificationChart.render();

      assayTable
          .width(300)
          .height(480)
          .dimension(assayTableDimension)
          .size(Infinity)
          .showSections(false)
          .columns(['pmid','text','classification','combined_species'])
          .sortBy(function (d) { return [d.classification]; })
          .order(d3.ascending)
          .on('preRender', assayUpdateOffset)
          .on('preRedraw', assayUpdateOffset)
          .on('pretransition', assayDisplay);

        //dc.renderAll();
        assayTable.render();
   });

      var assay_ofs = 0, assay_pag = 10;
      function assayUpdateOffset() {
          var totFilteredRecs = ndx_assay.groupAll().value();
          var end = assay_ofs + pag > totFilteredRecs ? totFilteredRecs : assay_ofs + assay_pag;
          assay_ = assay_ofs >= totFilteredRecs ? Math.floor((totFilteredRecs - 1) / assay_pag) * assay_pag : assay_ofs;
          assay_ = assay_ofs < 0 ? 0 : assay_ofs;

          assayTable.beginSlice(assay_ofs);
          assayTable.endSlice(assay_ofs+assay_pag);
      }
      function assayDisplay() {
          var totFilteredRecs = ndx_assay.groupAll().value();
          var end = assay_ofs + assay_pag > totFilteredRecs ? totFilteredRecs : assay_ofs + assay_pag;
          d3.select('#assayBegin')
              .text(end === 0? assay_ofs : assay_ofs + 1);
          d3.select('#assayEnd')
              .text(end);
          d3.select('#assayLast')
              .attr('disabled', assay_ofs-assay_pag<0 ? 'true' : null);
          d3.select('#assayNext')
              .attr('disabled', assay_ofs+assay_pag>=totFilteredRecs ? 'true' : null);
          d3.select('#assaySize').text(totFilteredRecs);
          if(totFilteredRecs != ndx_assay.size()){
            d3.select('#assayTotalSize').text("(filtered Total: " + ndx_assay.size() + " )");
          }else{
            d3.select('#assayTotalSize').text('');
          }
      }
      function assayNext() {
          assay_ofs += assay_pag;
          assayUpdateOffset();
          assayTable.redraw();
      }
      function assayLast() {
          assay_ofs -= assay_pag;
          assayUpdateOffset();
          assayTable.redraw();
      }




