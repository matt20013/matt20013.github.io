var trialStatusChart = new dc.PieChart("#trialStatusChart");
var trialPhaseChart = new dc.PieChart("#trialPhaseChart");
//var trialTable = new dc.DataTable("#trialTable");
var trialTable = dc.tableview("#trialTable");
//var trialCountChart = new dc.LineChart('#trial_count_chart');

var ndx_trials;

d3.json('../data/assaynet_trials.json').then(function (experiments) {
    var fmt = d3.format('02d');
    ndx_trials = crossfilter(experiments)
    var trialStatusDimension = ndx_trials.dimension(function (d) {
        return d.status;
    }),
        trialStatusGroup = trialStatusDimension.group(),
        trialPhaseDimension = ndx_trials.dimension(function (d) {
            return d.max_phase;
        }),
        trialPhaseGroup = trialPhaseDimension.group(),
        trialTableDimension = ndx_trials.dimension(function (d) {
            return [d.status, d.max_phase];
        })

    trialStatusChart
        .width(768)
        .height(480)
        .slicesCap(4)
        .innerRadius(100)
        .dimension(trialStatusDimension)
        .group(trialStatusGroup)
        .legend(dc.legend().highlightSelected(true))
        // workaround for #703: not enough data is accessible through .label() to display percentages
        .on('pretransition', function (chart) {
            chart.selectAll('text.pie-slice').text(function (d) {
                return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + '%';
            })
        });

    trialStatusChart.render();

    trialPhaseChart
        .width(768)
        .height(480)
        .slicesCap(4)
        .innerRadius(100)
        .dimension(trialPhaseDimension)
        .group(trialPhaseGroup)
        .legend(dc.legend().highlightSelected(true))
        // workaround for #703: not enough data is accessible through .label() to display percentages
        .on('pretransition', function (chart) {
            chart.selectAll('text.pie-slice').text(function (d) {
                return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + '%';
            })
        })


    trialPhaseChart.render();

    var trialNCTDimension = ndx_trials.dimension(function (d) {return d.nct_id;});
    var trialNCTGroup = trialNCTDimension.group();
    
    // trialTable
    //     .width(300)
    //     .height(480)
    //     .dimension(trialTableDimension)
    //     .size(Infinity)
    //     .showSections(false)
    //     .columns(['nct_id', 'official_title', 'brief_summary', 'start_date', 'status', 'max_phase'])
    //     .sortBy(function (d) {
    //         return [fmt(+d.Expt), fmt(+d.Run)];
    //     })
    //     .order(d3.ascending)
    //     .on('preRender', trialUpdateOffset)
    //     .on('preRedraw', trialUpdateOffset)
    //     .on('pretransition', trialDisplay);

    trialTable
        .dimension(trialNCTDimension)
        .group(trialNCTGroup)
        .columns([
            { title: "NCTID", data: "ct_link" },
            { title: "Title", data: "official_title" },
            { title: "PubMed", data: "pubmed"},
            { title: "Preclinical", data: "preclinical" },
            { title: "Summary", data: "brief_summary" },
            { title: "Start", data: "start_date" },
            { title: "Status", data: "status" },
            { title: "Names", data: "intervention_names"},
            //{ title: "ATC Codes", data: "atc_codes"},
            { title: "Phase", data: "max_phase" },

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
        .sortBy([["ct_link", "asc"]])
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

    //trialTable.render();
    //dc.renderAll();

});
var ofs = 0,
    pag = 10;

function trialUpdateOffset() {
    var totFilteredRecs = ndx_trials.groupAll().value();
    var end = ofs + pag > totFilteredRecs ? totFilteredRecs : ofs + pag;
    ofs = ofs >= totFilteredRecs ? Math.floor((totFilteredRecs - 1) / pag) * pag : ofs;
    ofs = ofs < 0 ? 0 : ofs;

    trialTable.beginSlice(ofs);
    trialTable.endSlice(ofs + pag);
}

function trialDisplay() {
    var totFilteredRecs = ndx_trials.groupAll().value();
    var end = ofs + pag > totFilteredRecs ? totFilteredRecs : ofs + pag;
    d3.select('#trialBegin')
        .text(end === 0 ? ofs : ofs + 1);
    d3.select('#trialEnd')
        .text(end);
    d3.select('#trialLast')
        .attr('disabled', ofs - pag < 0 ? 'true' : null);
    d3.select('#trialNext')
        .attr('disabled', ofs + pag >= totFilteredRecs ? 'true' : null);
    d3.select('#trialSize').text(totFilteredRecs);
    if (totFilteredRecs != ndx_trials.size()) {
        d3.select('#trialTotalSize').text("(filtered Total: " + ndx_trials.size() + " )");
    } else {
        d3.select('#trialTotalSize').text('');
    }
}

function trialNext() {
    ofs += pag;
    trialUpdateOffset();
    trialTable.redraw();
}

function trialLast() {
    ofs -= pag;
    trialUpdateOffset();
    trialTable.redraw();
}




//   const moveMonths = ndx_trials.dimension(d => d.month);

//   var years = ndx_trials.dimension(function(d) {
//            return d.start_date.year;
//        });
//   var trialCountsByYear = years.group().reduce(
//                function (p, v) { // add
//                var day = d3.time.day(v.EventDate).getTime();
//                p.map.set(day, p.map.has(day) ? p.map.get(day) + 1 : 1);
//                p.avg = average_map(p.map);
//                return p;
//            },
//            function (p, v) { // remove
//                var day = d3.time.day(v.EventDate).getTime();
//                p.map.set(day, p.map.has(day) ? p.map.get(day) - 1 : 0);
//                p.avg = average_map(p.map);
//                return p;
//            },
//            function () { // init
//                return { map: d3.map(), avg: 0 };
//            }
//        );

//    trialCountChart.width(990) /* dc.barChart('#monthly-volume-chart', 'chartGroup'); */
//        .height(40)
//        .margins({top: 0, right: 50, bottom: 20, left: 40})
//        .dimension(moveMonths)
//        .group(volumeByMonthGroup)
//        .centerBar(true)
//        .gap(1)
//        .x(d3.scaleTime().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
//        .round(d3.timeMonth.round)
//        .alwaysUseRounding(true)
//        .xUnits(d3.timeMonths);

//   });