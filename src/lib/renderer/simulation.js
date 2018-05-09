"use strict"

var simulationRenderer = {};

const path = require('path');
const fs = require('fs');

simulationRenderer.list = (data) => {
    var href = './templates/simulation.html?simulation=' + data._id;
    return '<div class="btn-group" data-id="' + data._id + '" style="width:100%; padding: 1px;">' +
        '<button type="button" class="simulation-details btn btn-default col-xs-9">' +
        '<span class="pull-left">' + app.format.truncateStr(data.name, 40) + '</span>' +
        '<span class="badge pull-right" title="Number of protocols"></span>' +
        '</button>' +
        '<div class="btn-group dropdown">' +
        '<button type="button" class="btn btn-default dropdown-toggle simulation-config" data-toggle="dropdown">' +
        '<i class="fa fa-bars"></i>' +
        '</button>' +
        '<ul class="dropdown-menu dropdown-menu-right">' +
        '<li><a href="' + href + '"><i class="fa fa-chevron-right"></i> Go to this simulation</a></li>' +
        '<li><a data-toggle="modal" href="#delete-all-protocols-dialog" class="empty-protocols"><i class="fa fa-trash"></i> Empty protocols</a></li>' +
        (data.group == 'user' ? '<li><a data-toggle="modal" href="#delete-simulation-dialog" class="delete-simulation"><i class="fa fa-trash-o"></i> Delete this simulation</a></li>' : '') +
        '</ul>' +
        '</div>' +
        '<a type="button" class="start btn btn-link" title="Go to this simulation" href="' + href + '" style="display:none">' +
        '<i class="fa fa-chevron-circle-right"></i></a>' +
        '</div>'
}

simulationRenderer.details = (data) => {
    var configApp = app.config.app();
    if (fs.existsSync(path.join(app.dataPath, 'images', data._id + '.png'))) {
        var src = path.join(app.dataPath, 'images', data._id + '.png');
    } else {
        // var src = path.join(app.appPath, 'assets/img/simulation_default.png');
        var src = null;
    }

    var div = [];
    div.push('<h3>' + data.name + '</h3>')
    if (src) {
        div.push('<img style="width:100%" src="' + src + '" />')
    }
    div.push('<div class="row">')
    div.push('<div class="col-xs-6">')
    if (data.nodes.length > 0) {
        div.push('<h4>Nodes</h4>')
        div.push('<table>')
        data.nodes.map((node) => div.push(app.renderer.node.table(node)));
        div.push('</table>')
    }
    div.push('</div>')
    div.push('<div class="col-xs-6">')
    if (data.links.length > 0) {
        div.push('<h4>Links</h4>')
        div.push('<table>')
        data.links.map((link) => div.push(app.renderer.link.table(link)));
        div.push('</table>')
    }
    div.push('</div>')
    div.push('</div>')
    if (data.description) {
        div.push('<h4>Description</h4>')
        div.push('<div>' + data.description + '</div>')
    }
    return div.join('')
}

simulationRenderer.dropdown = (data) => {
    var div = [];
    div.push('<li>')
    var href = './simulation.html?simulation=' + data._id;
    div.push('<a ' + 'id="' + data._id + '" ' + 'class="simulation" href="' + href + '" rel="popover" title="' + data.name + '">')
    div.push(app.format.truncateStr(data.name))
    div.push('</a></li>')
    return div.join('')
}

simulationRenderer.thumbnails = (data) => {
    var configApp = app.config.app();
    if (fs.existsSync(path.join(app.dataPath, 'images', data._id + '.png'))) {
        var src = path.join(app.dataPath, 'images', data._id + '.png');
    } else {
        var src = path.join(app.appPath, 'assets/img/simulation_default.png');
    }
    var div = [];
    div.push('<div id="' + data._id + '"class="simulation col-xs-12 col-sm-4 col-md-3" data-img="' + src + '" data-doi="' + (data.doi || '') + '">')
    div.push('<div class="thumbnail">')
    div.push('<div style="position:absolute; z-index:10">')
    div.push('<a href="./templates/simulation.html?simulation=' + data._id + '" ' + 'class="btn btn-default" type="button" title="' + data.name + '">')
    div.push('<span>')
    div.push(app.format.truncateStr(data.name))
    div.push('</span>')
    div.push('<span class="badge" title="number of protocols" style="margin-left: 20px"></span>')
    div.push('</a>')
    div.push('</div>')
    div.push('<img src="' + src + '">')
    div.push('<div class="description" style="display: none">' + (data.description || 'No description found.') + '</div>')
    div.push('</div></div>')
    return div.join('')
}

simulationRenderer.popover = (data) => {
    var configApp = app.config.app();
    if (fs.existsSync(path.join(app.dataPath, 'images', data._id + '.png'))) {
        var src = path.join(app.dataPath, 'images', data._id + '.png');
    } else {
        // var src = path.join(app.appPath, 'assets/img/simulation_default.png');
        var src = null;
    }
    var div = [];
    div.push('<div>Created at ' + app.format.date(data.createdAt) + '</div>')
    if (src) {
        div.push('<img style="width:250px" src="' + src + '" />')
    }
    div.push('<small>')
    data.nodes.map((node) => div.push(app.renderer.node.list(node)))
    div.push('<hr>')
    data.links.map((link) => div.push(app.renderer.link.list(link)))
    div.push('</small>')
    return div.join('')
}

module.exports = simulationRenderer;
