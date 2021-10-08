
//# dc.js Getting Started and How-To Guide
'use strict';

/* jshint globalstrict: true */
/* global dc,dc_datatables,d3,crossfilter */

// ### Create Chart Objects

// Create chart objects associated with the container elements identified by the css selector.
// Note: It is often a good idea to have these objects accessible at the global scope so that they can be modified or
// filtered by other page controls.
var statusChart = dc.pieChart('#trials_gain-loss-chart');
//var fluctuationChart = dc.barChart('#trials_fluctuation-chart');
//var quarterChart = dc.pieChart('#trials_quarter-chart');
//var dayOfWeekChart = dc.rowChart('#trials_day-of-week-chart');
//var moveChart = dc.lineChart('#trials_monthly-move-chart');
//var volumeChart = dc.barChart('#trials_monthly-volume-chart');
//var yearlyBubbleChart = dc.bubbleChart('#trials_yearly-bubble-chart');
//var nasdaqCount = dc.dataCount('.dc-data-count');
//var nasdaqTable = dc_datatables.datatable('.dc-data-table');


d3.json('../assaynet_trials.json').then(function (data) {
    // Since its a csv file we need to format the data a bit.
//    var dateFormatSpecifier = '%Y-%m/%d %H:%M:%S';
//    var dateFormat = d3.timeFormat(dateFormatSpecifier);
//    var dateFormatParser = d3.timeParse(dateFormatSpecifier);
    var numberFormat = d3.format('.2f');

//    data.forEach(function (d) {
//        d.dd = dateFormatParser(d.start_date);
//        d.month = d3.timeMonth(d.dd); // pre-calculate month for better performance
//        d.close = +d.close; // coerce to number
//        d.open = +d.open;
//    });

    //### Create Crossfilter Dimensions and Groups

    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
    var ndx = crossfilter(data);
    var all = ndx.groupAll();

//    // Dimension by year
//    var yearlyDimension = ndx.dimension(function (d) {
//        return d3.timeYear(d.dd).getFullYear();
//    });
//    // Maintain running tallies by year as filters are applied or removed
//    var yearlyPerformanceGroup = yearlyDimension.group().reduce(
//        /* callback for when data is added to the current filter results */
//        function (p, v) {
//            ++p.count;
//            p.absGain += v.close - v.open;
//            p.fluctuation += Math.abs(v.close - v.open);
//            p.sumIndex += (v.open + v.close) / 2;
//            p.avgIndex = p.sumIndex / p.count;
//            p.percentageGain = p.avgIndex ? (p.absGain / p.avgIndex) * 100 : 0;
//            p.fluctuationPercentage = p.avgIndex ? (p.fluctuation / p.avgIndex) * 100 : 0;
//            return p;
//        },
//        /* callback for when data is removed from the current filter results */
//        function (p, v) {
//            --p.count;
//            p.absGain -= v.close - v.open;
//            p.fluctuation -= Math.abs(v.close - v.open);
//            p.sumIndex -= (v.open + v.close) / 2;
//            p.avgIndex = p.count ? p.sumIndex / p.count : 0;
//            p.percentageGain = p.avgIndex ? (p.absGain / p.avgIndex) * 100 : 0;
//            p.fluctuationPercentage = p.avgIndex ? (p.fluctuation / p.avgIndex) * 100 : 0;
//            return p;
//        },
//        /* initialize p */
//        function () {
//            return {
//                count: 0,
//                absGain: 0,
//                fluctuation: 0,
//                fluctuationPercentage: 0,
//                sumIndex: 0,
//                avgIndex: 0,
//                percentageGain: 0
//            };
//        }
//    );
//
//    // Dimension by full date
//    var dateDimension = ndx.dimension(function (d) {
//        return d.dd;
//    });
//
//    // Dimension by month
//    var moveMonths = ndx.dimension(function (d) {
//        return d.month;
//    });
//    // Group by total movement within month
//    var monthlyMoveGroup = moveMonths.group().reduceSum(function (d) {
//        return Math.abs(d.close - d.open);
//    });
//    // Group by total volume within move, and scale down result
//    var volumeByMonthGroup = moveMonths.group().reduceSum(function (d) {
//        return d.volume / 500000;
//    });
//    var indexAvgByMonthGroup = moveMonths.group().reduce(
//        function (p, v) {
//            ++p.days;
//            p.total += (v.open + v.close) / 2;
//            p.avg = Math.round(p.total / p.days);
//            return p;
//        },
//        function (p, v) {
//            --p.days;
//            p.total -= (v.open + v.close) / 2;
//            p.avg = p.days ? Math.round(p.total / p.days) : 0;
//            return p;
//        },
//        function () {
//            return {days: 0, total: 0, avg: 0};
//        }
//    );

    // Create categorical dimension
    var status = ndx.dimension(function (d) {
        return d.status;
    });
    // Produce counts records in the dimension
    var statusGroup = status.group();

//    // Determine a histogram of percent changes
//    var fluctuation = ndx.dimension(function (d) {
//        return Math.round((d.close - d.open) / d.open * 100);
//    });
//    var fluctuationGroup = fluctuation.group();
//
//    // Summarize volume by quarter
//    var quarter = ndx.dimension(function (d) {
//        var month = d.dd.getMonth();
//        if (month <= 2) {
//            return 'Q1';
//        } else if (month > 2 && month <= 5) {
//            return 'Q2';
//        } else if (month > 5 && month <= 8) {
//            return 'Q3';
//        } else {
//            return 'Q4';
//        }
//    });
//    var quarterGroup = quarter.group().reduceSum(function (d) {
//        return d.volume;
//    });
//
//    // Counts per weekday
//    var dayOfWeek = ndx.dimension(function (d) {
//        var day = d.dd.getDay();
//        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//        return day + '.' + name[day];
//    });
//    var dayOfWeekGroup = dayOfWeek.group();


//    yearlyBubbleChart /* dc.bubbleChart('#yearly-bubble-chart', 'chartGroup') */
//        // (_optional_) define chart width, `default = 200`
//        .width(990)
//        // (_optional_) define chart height, `default = 200`
//        .height(250)
//        // (_optional_) define chart transition duration, `default = 750`
//        .transitionDuration(1500)
//        .margins({top: 10, right: 50, bottom: 30, left: 40})
//        .dimension(yearlyDimension)
//        //The bubble chart expects the groups are reduced to multiple values which are used
//        //to generate x, y, and radius for each key (bubble) in the group
//        .group(yearlyPerformanceGroup)
//        // (_optional_) define color function or array for bubbles: [ColorBrewer](http://colorbrewer2.org/)
//        .colors(d3.schemeRdYlGn[9])
//        //(optional) define color domain to match your data domain if you want to bind data or color
//        .colorDomain([-500, 500])
//    //##### Accessors
//
//        //Accessor functions are applied to each value returned by the grouping
//
//        // `.colorAccessor` - the returned value will be passed to the `.colors()` scale to determine a fill color
//        .colorAccessor(function (d) {
//            return d.value.absGain;
//        })
//        // `.keyAccessor` - the `X` value will be passed to the `.x()` scale to determine pixel location
//        .keyAccessor(function (p) {
//            return p.value.absGain;
//        })
//        // `.valueAccessor` - the `Y` value will be passed to the `.y()` scale to determine pixel location
//        .valueAccessor(function (p) {
//            return p.value.percentageGain;
//        })
//        // `.radiusValueAccessor` - the value will be passed to the `.r()` scale to determine radius size;
//        //   by default this maps linearly to [0,100]
//        .radiusValueAccessor(function (p) {
//            return p.value.fluctuationPercentage;
//        })
//        .maxBubbleRelativeSize(0.3)
//        .x(d3.scaleLinear().domain([-2500, 2500]))
//        .y(d3.scaleLinear().domain([-100, 100]))
//        .r(d3.scaleLinear().domain([0, 4000]))
//        //##### Elastic Scaling
//
//        //`.elasticY` and `.elasticX` determine whether the chart should rescale each axis to fit the data.
//        .elasticY(true)
//        .elasticX(true)
//        //`.yAxisPadding` and `.xAxisPadding` add padding to data above and below their max values in the same unit
//        //domains as the Accessors.
//        .yAxisPadding(100)
//        .xAxisPadding(500)
//        // (_optional_) render horizontal grid lines, `default=false`
//        .renderHorizontalGridLines(true)
//        // (_optional_) render vertical grid lines, `default=false`
//        .renderVerticalGridLines(true)
//        // (_optional_) render an axis label below the x axis
//        .xAxisLabel('Index Gain')
//        // (_optional_) render a vertical axis lable left of the y axis
//        .yAxisLabel('Index Gain %')
//        //##### Labels and  Titles
//
//        //Labels are displayed on the chart for each bubble. Titles displayed on mouseover.
//        // (_optional_) whether chart should render labels, `default = true`
//        .renderLabel(true)
//        .label(function (p) {
//            return p.key;
//        })
//        // (_optional_) whether chart should render titles, `default = false`
//        .renderTitle(true)
//        .title(function (p) {
//            return [
//                p.key,
//                'Index Gain: ' + numberFormat(p.value.absGain),
//                'Index Gain in Percentage: ' + numberFormat(p.value.percentageGain) + '%',
//                'Fluctuation / Index Ratio: ' + numberFormat(p.value.fluctuationPercentage) + '%'
//            ].join('\n');
//        })
//        //#### Customize Axes
//
//        // Set a custom tick format. Both `.yAxis()` and `.xAxis()` return an axis object,
//        // so any additional method chaining applies to the axis, not the chart.
//        .yAxis().tickFormat(function (v) {
//            return v + '%';
//        });

    // #### Pie/Donut Charts

    // Create a pie chart and use the given css selector as anchor. You can also specify
    // an optional chart group for this chart to be scoped within. When a chart belongs
    // to a specific group then any interaction with such chart will only trigger redraw
    // on other charts within the same chart group.
    // <br>API: [Pie Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#pie-chart)

    statusChart /* dc.pieChart('#gain-loss-chart', 'chartGroup') */
    // (_optional_) define chart width, `default = 200`
        .width(180)
    // (optional) define chart height, `default = 200`
        .height(180)
    // Define pie radius
        .radius(80)
    // Set dimension
        .dimension(status)
    // Set group
        .group(statusGroup)
    // (_optional_) by default pie chart will use `group.key` as its label but you can overwrite it with a closure.
        .label(function (d) {
            if (statusChart.hasFilter() && !statusChart.hasFilter(d.key)) {
                return d.key + '(0%)';
            }
            var label = d.key;
            if (all.value()) {
                label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
            }
            return label;
        });

//    quarterChart /* dc.pieChart('#quarter-chart', 'chartGroup') */
//        .width(180)
//        .height(180)
//        .radius(80)
//        .innerRadius(30)
//        .dimension(quarter)
//        .group(quarterGroup);
//
//    //#### Row Chart
//    dayOfWeekChart /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
//        .width(180)
//        .height(180)
//        .margins({top: 20, left: 10, right: 10, bottom: 20})
//        .group(dayOfWeekGroup)
//        .dimension(dayOfWeek)
//        // Assign colors to each value in the x scale domain
//        .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
//        .label(function (d) {
//            return d.key.split('.')[1];
//        })
//        // Title sets the row text
//        .title(function (d) {
//            return d.value;
//        })
//        .elasticX(true)
//        .xAxis().ticks(4);
//
//    //#### Bar Chart
//
//    // Create a bar chart and use the given css selector as anchor. You can also specify
//    // an optional chart group for this chart to be scoped within. When a chart belongs
//    // to a specific group then any interaction with such chart will only trigger redraw
//    // on other charts within the same chart group.
//    // <br>API: [Bar Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#bar-chart)
//    fluctuationChart /* dc.barChart('#volume-month-chart', 'chartGroup') */
//        .width(420)
//        .height(180)
//        .margins({top: 10, right: 50, bottom: 30, left: 40})
//        .dimension(fluctuation)
//        .group(fluctuationGroup)
//        .elasticY(true)
//        // (_optional_) whether bar should be center to its x value. Not needed for ordinal chart, `default=false`
//        .centerBar(true)
//        // (_optional_) set gap between bars manually in px, `default=2`
//        .gap(1)
//        // (_optional_) set filter brush rounding
//        .round(dc.round.floor)
//        .alwaysUseRounding(true)
//        .x(d3.scaleLinear().domain([-25, 25]))
//        .renderHorizontalGridLines(true)
//        // Customize the filter displayed in the control span
//        .filterPrinter(function (filters) {
//            var filter = filters[0], s = '';
//            s += numberFormat(filter[0]) + '% -> ' + numberFormat(filter[1]) + '%';
//            return s;
//        });
//
//    // Customize axes
//    fluctuationChart.xAxis().tickFormat(
//        function (v) { return v + '%'; });
//    fluctuationChart.yAxis().ticks(5);
//
//    //#### Stacked Area Chart
//
//    //Specify an area chart by using a line chart with `.renderArea(true)`.
//    // <br>API: [Stack Mixin](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#stack-mixin),
//    // [Line Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#line-chart)
//    moveChart /* dc.lineChart('#monthly-move-chart', 'chartGroup') */
//        .renderArea(true)
//        .width(990)
//        .height(200)
//        .transitionDuration(1000)
//        .margins({top: 30, right: 50, bottom: 25, left: 40})
//        .dimension(moveMonths)
//        .mouseZoomable(true)
//    // Specify a "range chart" to link its brush extent with the zoom of the current "focus chart".
//        .rangeChart(volumeChart)
//        .x(d3.scaleTime().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
//        .round(d3.timeMonth.round)
//        .xUnits(d3.timeMonths)
//        .elasticY(true)
//        .renderHorizontalGridLines(true)
//    //##### Legend
//
//        // Position the legend relative to the chart origin and specify items' height and separation.
//        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
//        .brushOn(false)
//        // Add the base layer of the stack with group. The second parameter specifies a series name for use in the
//        // legend.
//        // The `.valueAccessor` will be used for the base layer
//        .group(indexAvgByMonthGroup, 'Monthly Index Average')
//        .valueAccessor(function (d) {
//            return d.value.avg;
//        })
//        // Stack additional layers with `.stack`. The first paramenter is a new group.
//        // The second parameter is the series name. The third is a value accessor.
//        .stack(monthlyMoveGroup, 'Monthly Index Move', function (d) {
//            return d.value;
//        })
//        // Title can be called by any stack layer.
//        .title(function (d) {
//            var value = d.value.avg ? d.value.avg : d.value;
//            if (isNaN(value)) {
//                value = 0;
//            }
//            return dateFormat(d.key) + '\n' + numberFormat(value);
//        });
//
//    //#### Range Chart
//
//
//    volumeChart.width(990) /* dc.barChart('#monthly-volume-chart', 'chartGroup'); */
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


//    nasdaqCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
//        .dimension(ndx)
//        .group(all)
//        // (_optional_) `.html` sets different html when some records or all records are selected.
//        // `.html` replaces everything in the anchor with the html given using the following function.
//        // `%filter-count` and `%total-count` are replaced with the values obtained.
//        .html({
//            some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
//                ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
//            all: 'All records selected. Please click on the graph to apply filters.'
//        });

//    nasdaqTable /* dc_datatables.datatable('.dc-data-table') */
//        .dimension(dateDimension)
//        // Data table does not use crossfilter group but rather a closure
//        // as a grouping function
//        .group(function (d) {
//            var format = d3.format('02d');
//            return d.dd.getFullYear() + '/' + format((d.dd.getMonth() + 1));
//        })
//        // (_optional_) max number of records to be shown, `default = 25`
//        .size(10)
//        // There are several ways to specify the columns; see the data-table documentation.
//        // This code demonstrates generating the column header automatically based on the columns.
//        .columns([
//            // Use the `d.date` field; capitalized automatically; specify sorting order
//            {
//                label: 'date',
//                type: 'date',
//                format: function(d) {
//                    return d.date;
//                }
//            },
//            // Use `d.open`, `d.close`; default sorting order is numeric
//            'open',
//            'close',
//            {
//                // Specify a custom format for column 'Change' by using a label with a function.
//                label: 'Change',
//                format: function (d) {
//                    return numberFormat(d.close - d.open);
//                }
//            },
//            // Use `d.volume`
//            'volume'
//        ])
//
//        // (_optional_) sort using the given field, `default = function(d){return d;}`
//        .sortBy(function (d) {
//            return d.dd;
//        })
//        // (_optional_) sort order, `default = d3.ascending`
//        .order(d3.ascending)
//        // (_optional_) custom renderlet to post-process chart using [D3](http://d3js.org)
//        .on('renderlet', function (table) {
//            table.selectAll('.dc-table-group').classed('info', true);
//        });

    dc.renderAll();


});

//#### Versions

//Determine the current version of dc with `dc.version`
d3.selectAll('#version').text(dc.version);

// Determine latest stable version in the repo via Github API
d3.json('https://api.github.com/repos/dc-js/dc.js/releases/latest').then(function (latestRelease) {
    /*jshint camelcase: false */
    /* jscs:disable */
    d3.selectAll('#latest').text(latestRelease.tag_name);
});
