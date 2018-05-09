"use strict"

const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile');
const {
    app,
    BrowserWindow
} = require('electron');

var appPath = __dirname;
var dataPath = process.env['NESTDESKTOP_DATA'] || path.join(process.env['HOME'], '.nest-desktop');
console.log('App path: ' + appPath)
console.log('Data path: ' + dataPath)
require(path.join(appPath, 'init')).sync(dataPath);

// var autoUpdater = require('auto-updater');
// autoUpdater.setFeedURL('http://mycompany.com/myapp/latest?version=' + app.getVersion());
//
// // Report crashes to our server.
// require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

function createWindow() {
    // console.log('Creating the window')
    var configElectron = require(path.join(dataPath, 'config/electron.json'));

    let {
        width,
        height,
    } = configElectron.windowBounds;

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        frame: configElectron.window.frame,
        title: 'A NEST desktop application',
        icon: path.join(appPath, 'src/assets/img/nest-icon.png'),
        // "node-integration": true,
    });

    mainWindow.setFullScreen(configElectron.window.fullscreen);

    mainWindow.on('resize', () => {

        // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
        // the height, width, and x and y coordinates.
        let {
            width,
            height
        } = mainWindow.getBounds();
        // Now that we have them, save them using the `set` method.
        configElectron.windowBounds = {
            width: width,
            height: height
        };

        jsonfile.writeFile(path.join(dataPath, 'config/electron.json'), configElectron, {
            spaces: 4
        }, function(err) {
            if (err) {
                console.error(err)
            }
        })
    });

    // and load the index.html of the app.
    mainWindow.loadURL(path.join('file://', appPath, 'src/index.html'));

    // Open the DevTools.
    if (configElectron.debug) {
        mainWindow.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('ready', createWindow)

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

var main = {};
main.capturePage = function(filePath) {
    var configElectron = require(path.join(dataPath, 'config/electron.json'));

    let {
        width,
        height,
    } = configElectron.windowBounds;

    var clipRect = {
        x: 0,
        y: 50,
        width: width - 319,
        height: height - 50
    };
    mainWindow.capturePage(clipRect, function(imageBuffer) {
        if (configElectron.screenshot.resize) {
            if (configElectron.screenshot.width) {
                var imageBuffer = imageBuffer.resize({
                    width: configElectron.screenshot.width
                })
            } else if (configElectron.screenshot.height) {
                var imageBuffer = imageBuffer.resize({
                    height: configElectron.screenshot.height
                })
            }
        }
        fs.writeFile(filePath, imageBuffer.toPNG(),
            function(err) {
                if (err) {
                    console.error("ERROR Failed to save file", err);
                } else {
                    console.log('Screen captured in ' + filePath)
                }
            });
    });
}

main.printToPDF = function(filePath) {

    var options = {
        marginsType: 0,
    }

    mainWindow.webContents.printToPDF(options, (error, data) => {
        if (error) throw error
        fs.writeFile(filePath, data, (error) => {
            if (error) throw error
            console.log('Write PDF successfully.')
        })
    })
}

module.exports = main;
