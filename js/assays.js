//var assayHighestPhaseChart = new dc.PieChart("#assayHighestPhaseChart");
//var assayTable = new dc.DataTable("#assayTable");
const ASSAY_GROUP = "ASSAY";
var assayTable = dc.tableview("#assayTable", ASSAY_GROUP);
var assayClassificationChart = new dc.PieChart("#assayClassificationChart", ASSAY_GROUP)
var assaySpeciesChart = new dc.RowChart("#assaySpeciesChart", ASSAY_GROUP);
var assayLiteratureYearCountsChart = new dc.BarChart('#assayLiteratureYearCountsChart', ASSAY_GROUP);
var assayLiteratureJournalChart = new dc.RowChart('#assayLiteratureJournalChart', ASSAY_GROUP);
var assayTagsChart = new dc.RowChart("#assayTagsChart", ASSAY_GROUP);
var assayModelsChart = new dc.RowChart("#assayModelsChart", ASSAY_GROUP);
var ndx_assay;

function assay_reset() {
    // reset all trial filters
    dc.filterAll(ASSAY_GROUP)
    dc.redrawAll(ASSAY_GROUP)
}

function assay_tag_filter(tag) {
    // filter tagRowChart 
    dc.filterAll(ASSAY_GROUP)
    assayTagsChart.filter(tag);
    //assayTagsChart.redraw();
    dc.redrawAll(ASSAY_GROUP);
}

function getFilteredAssays() {
    // interventions = interventionNameDimension.top(Infinity);;
    // let ids = interventions.map(({ id }) => id);
    // console.log(ids);
    // filter_assaynet_by_interventions(ids)
    openTab(null, 'DashboardTab')
    openTabSubNetwork(null, "NetworkTab")
}

d3.json('../data/assaynet_assays.json').then(function (experiments) {
    var fmt = d3.format('02d');
    ndx_assay = crossfilter(experiments)
    var assayClassificationDimension = ndx_assay.dimension(function (d) { return d.classification; })
    var assayClassificationGroup = assayClassificationDimension.group()
    var assayTableDimension = ndx_assay.dimension(function (d) { return [d.pmid, d.text, d.classification, d.combined_species]; })
    var assayPMIDDimension = ndx_assay.dimension(function (d) { return d.pmid; });
    var assayPMIDGroup = assayPMIDDimension.group();
    assayClassificationChart
        .width(768)
        .height(480)
        .slicesCap(6)
        .innerRadius(100)
        .dimension(assayClassificationDimension)
        .group(assayClassificationGroup)
        .legend(dc.legend().highlightSelected(true))
        // workaround for #703: not enough data is accessible through .label() to display percentages
        .on('pretransition', function (chart) {
            chart.selectAll('text.pie-slice').text(function (d) {
                return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + '%';
            })
        });

    assayClassificationChart.render();

    // assayTable
    //     .width(300)
    //     .height(480)
    //     .dimension(assayTableDimension)
    //     .size(Infinity)
    //     .showSections(false)
    //     .columns(['pmid', 'text', 'classification', 'combined_species'])
    //     .sortBy(function (d) { return [d.classification]; })
    //     .order(d3.ascending)
    //     .on('preRender', assayUpdateOffset)
    //     .on('preRedraw', assayUpdateOffset)
    //     .on('pretransition', assayDisplay);

    assayTable
        .dimension(assayPMIDDimension)
        .group(assayPMIDGroup)
        .columns([
            { title: "ID", data: "id"},
            { title: "PMID", data: "pubmed_link" },
            { title: "Text", data: "text" },
            { title: "Class", data: "classification" },
            { title: "Species", data: "combined_species" },
//            { title: "Intvn", data: "intervention_str"},
            {  title: "Models", data: "models" },
            { title: "Tags", data: "tags_concatenated" }
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
        .fixedHeader(false)
        .buttons(["csv", "excel"])
        .sortBy([["pubmed_link", "asc"]])
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
    //dc.renderAll();
    assayTable.render();

    //var interventionTagsDimension  = ndx_int.dimension(function(d) {return d.tags;}),
    var assayTagsDimension = ndx_assay.dimension(d => d.tags_concatenated.map(r => r), true);
    assayTagsGroup = assayTagsDimension.group()
    //interventionTagsGroup = interventionTagsDimension.group().reduce(reduceAdd, reduceRemove, reduceInitial);
    assayTagsChart
        .width(1268)
        .height(880)
        .elasticX(true)
        .othersGrouper(null)
        .dimension(assayTagsDimension)
        .group(assayTagsGroup)
        .legend(dc.legend().highlightSelected(true))
        .rowsCap(30);

    assayTagsChart.ordering(function (d) { return -d.value; })
    assayTagsChart.render();

    var assayModelsDimension = ndx_assay.dimension(d => d.models.map(r => r), true);
    assayModelsGroup = assayModelsDimension.group()
    //interventionTagsGroup = interventionTagsDimension.group().reduce(reduceAdd, reduceRemove, reduceInitial);
    assayModelsChart
        .width(1268)
        .height(880)
        .elasticX(true)
        .othersGrouper(null)
        .dimension(assayModelsDimension)
        .group(assayModelsGroup)
        .legend(dc.legend().highlightSelected(true))
        .rowsCap(30);

    assayModelsChart.ordering(function (d) { return -d.value; })
    assayModelsChart.render();

    var interventionSpeciesDimension = ndx_assay.dimension(d => d.combined_species.map(r => r), true);
    var interventionSpeciesGroup = interventionSpeciesDimension.group();

    assaySpeciesChart
        .width(800)
        .height(800)
        //.x(d3.scaleLinear().domain([6,20]))
        //.x(d3.scale.ordinal().domain(interventionTagsDimension))
        //.x(d3.scaleBand())
        //.xUnits(dc.units.ordinal)
        .elasticX(true)
        .othersGrouper(null)
        .dimension(interventionSpeciesDimension)
        .group(interventionSpeciesGroup)
        .legend(dc.legend().highlightSelected(true))
        .rowsCap(30);
    //.cap(10)

    assaySpeciesChart.render();

    var assayLiteratureJournalDimension = ndx_assay.dimension(function (d) { return d.journal ?? "Unknown"; });
    var assayLiteratureJournalGroup = assayLiteratureJournalDimension.group();

    assayLiteratureJournalChart
        .width(800)
        .height(800)
        //.x(d3.scaleLinear().domain([6,20]))
        //.x(d3.scale.ordinal().domain(interventionTagsDimension))
        //.x(d3.scaleBand())
        //.xUnits(dc.units.ordinal)
        .elasticX(true)
        .othersGrouper(null)
        .dimension(assayLiteratureJournalDimension)
        .group(assayLiteratureJournalGroup)
        .legend(dc.legend().highlightSelected(true))
        .rowsCap(30);
    //.cap(10)

    assayLiteratureJournalChart.render();

    var assayLiteratureYearDimension = ndx_assay.dimension(function (d) { return d.year; });
    var assayLiteratureYearGroup = assayLiteratureYearDimension.group();
    assayLiteratureYearCountsChart
        .width(420)
        .height(180)
        .margins({ top: 10, right: 50, bottom: 30, left: 40 })
        .dimension(assayLiteratureYearDimension)
        .group(assayLiteratureYearGroup)
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

    assayLiteratureYearCountsChart.render();
});

var assay_ofs = 0, assay_pag = 10;
function assayUpdateOffset() {
    var totFilteredRecs = ndx_assay.groupAll().value();
    var end = assay_ofs + pag > totFilteredRecs ? totFilteredRecs : assay_ofs + assay_pag;
    assay_ = assay_ofs >= totFilteredRecs ? Math.floor((totFilteredRecs - 1) / assay_pag) * assay_pag : assay_ofs;
    assay_ = assay_ofs < 0 ? 0 : assay_ofs;

    assayTable.beginSlice(assay_ofs);
    assayTable.endSlice(assay_ofs + assay_pag);
}
function assayDisplay() {
    var totFilteredRecs = ndx_assay.groupAll().value();
    var end = assay_ofs + assay_pag > totFilteredRecs ? totFilteredRecs : assay_ofs + assay_pag;
    d3.select('#assayBegin')
        .text(end === 0 ? assay_ofs : assay_ofs + 1);
    d3.select('#assayEnd')
        .text(end);
    d3.select('#assayLast')
        .attr('disabled', assay_ofs - assay_pag < 0 ? 'true' : null);
    d3.select('#assayNext')
        .attr('disabled', assay_ofs + assay_pag >= totFilteredRecs ? 'true' : null);
    d3.select('#assaySize').text(totFilteredRecs);
    if (totFilteredRecs != ndx_assay.size()) {
        d3.select('#assayTotalSize').text("(filtered Total: " + ndx_assay.size() + " )");
    } else {
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




