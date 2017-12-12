"use strict"

//
// Bar-chart
//

const d3 = require("d3");

var chart = {};

chart.yVal = (d, idx) => {
    idx = idx || 'y';
    if (typeof idx == 'number' || idx == 'y') {
        var y = d[idx]
    } else {
        var y = idx.map((i) => d[i]).reduce((acc, val) => acc + val)
    }
    return y || 0
}

chart.update = (recorder) => {
    chart.g.style('display', 'none')
    if (!chart.data) return

    chart.xScale.range([0, +chart.g.attr('width')])
    chart.yScale.range([+chart.g.attr('height'), 0])

    // if (app.selected_node && app.selected_node.element_type == 'neuron' && recorder.sources.indexOf(app.selected_node.id) != -1) {
    //     var nidx = app.selected_node.id;
    //     var idx = app.selected_node.ids.map((d) => recorder.senders.indexOf(d))
    // } else {
        var nidx = null;
        var idx = 'y';
    // }

    chart.xScale.domain(app.chart.xScale.domain())
    chart.yScale.domain([0, d3.max(chart.data, (d) => chart.yVal(d, idx.length == 1 ? idx[0] : idx))])

    var transition = !(app.simulation.running || app.chart.dragging || app.chart.zooming || app.chart.resizing || app.mouseover)
    app.chart.axesUpdate(chart, transition)
    app.chart.xLabel(chart, 'xLabel_' + app.simulation.recorders.indexOf(recorder), (app.model.record_labels[app.chart.abscissa] || app.chart.abscissa))

    var bars = chart.g.select('#clip')
        .selectAll(".bar")
        .data(chart.data);
    chart.bars = bars;

    var colors = app.chart.colors()
    var cidx = (recorder.sources.length == 1 ? recorder.sources[0] : nidx)
    var color = app.config.app().chart.color ? colors[cidx || (recorder.node.id % colors.length)] : ''
    if (transition) {
        bars
            .attr("x", (d) => chart.xScale(d.x0))
            .attr("width", (d) => chart.xScale(d.x1) - chart.xScale(d.x0))
            .transition(app.chart.transition)
            .attr("y", (d) => chart.yScale(chart.yVal(d, idx)))
            .attr("height", (d) => Math.max(0, +chart.g.attr('height') - chart.yScale(chart.yVal(d, idx))))
            .style("fill", color);

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => chart.xScale(d.x0))
            .attr("width", (d) => chart.xScale(d.x1) - chart.xScale(d.x0))
            .attr('y', chart.g.attr('height'))
            .transition(app.chart.transition)
            .attr("y", (d) => chart.yScale(chart.yVal(d, idx)))
            .attr("height", (d) => Math.max(0, +chart.g.attr('height') - chart.yScale(chart.yVal(d, idx))))
            .style("fill", color);
    } else {
        bars
            .attr("x", (d) => chart.xScale(d.x0))
            .attr("width", (d) => chart.xScale(d.x1) - chart.xScale(d.x0))
            .attr("y", (d) => chart.yScale(chart.yVal(d, idx)))
            .attr("height", (d) => Math.max(0, +chart.g.attr('height') - chart.yScale(chart.yVal(d, idx))))
            .style("fill", color);

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => chart.xScale(d.x0))
            .attr("width", (d) => chart.xScale(d.x1) - chart.xScale(d.x0))
            .attr('y', chart.g.attr('height'))
            .attr("y", (d) => chart.yScale(chart.yVal(d, idx)))
            .attr("height", (d) => Math.max(0, +chart.g.attr('height') - chart.yScale(chart.yVal(d, idx))))
            .style("fill", color);
    }

    bars.exit()
        .remove()

    chart.g.style('display', null)
}

chart.init = (reference, id, size) => {
    // console.log('Init bar chart')

    var margin = {
        top: 10,
        right: 40,
        bottom: 40,
        left: 50,
    };

    var g = d3.select(reference),
        width = app.chart.width,
        height = (size.height ? size.height : +g.attr("height")) - margin.top - margin.bottom;
    chart.width = width;
    chart.height = height;

    chart.xScale = d3.scaleLinear();
    chart.xScale.range([0, width])
    chart.yScale = d3.scaleLinear();
    chart.yScale.range([height, 0])

    chart.g = g.append("g")
        .attr('height', height)
        .attr('width', width)
        .attr("transform", "translate(" + (margin.left + (size.x ? size.x : 0)) + "," + (margin.top + (size.y ? size.y : 0)) + ")");

    var clip = chart.g.append("g")
        .attr("clip-path", "url(#clip)")
        .attr('id', 'clip');

    // add area for dragging event
    clip.append("rect")
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'white');

    app.chart.xAxis(chart);
    app.chart.yAxis(chart);
    app.chart.xLabel(chart, 'xLabel_' + id, 'Time [ms]');
    app.chart.yLabel(chart, 'yLabel_' + id, 'Spike count');
    app.chart.onDrag(chart);
    app.chart.onZoom(chart);
}

module.exports = chart;
