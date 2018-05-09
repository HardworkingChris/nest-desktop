"use strict"

var nodeController = {};

nodeController.nbins = (node) => {
    if (node.model != 'spike_detector') return
    var nodeDefaults = app.config.nest('node');

    var options = nodeDefaults.nbins;
    node.subchart = node.subchart || { nbins: 100 };
    options.value = options.ticks_labels.indexOf(node.subchart.nbins);
    var nodeElem = $('#nodes .node[data-id=' + node.id + ']')
    nodeElem.find('.subchart .slider').empty();
    app.slider.create_dataSlider('#nodes .node[data-id=' + node.id + '] .subchart .slider', options.id, options)
        .on('slideStop', function(d) {
            var ticks_labels = JSON.parse($(this).data('ticks_labels'));
            var value = ticks_labels ? ticks_labels[d.value] : d.value;
            app.data.nodes[node.id].subchart.nbins = value;
            var recorder = app.simulation.recorders.find((recorder) => {
                return recorder.node.id == node.id;
            })
            recorder.chart.update(recorder)
        })
    nodeElem.find('.subchart .slider').toggle(node.subchart.view ? node.subchart.view != 'none' : false);
}

module.exports = nodeController;
