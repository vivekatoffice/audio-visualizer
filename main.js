const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        backgroundColor: '#0a0a0f',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        show: false, // Don't show until ready
        frame: true,
        titleBarStyle: 'default'
    });

    // Load the index.html
    mainWindow.loadFile('audio-visualizer.html');

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Create custom menu
    createMenu();

    // Open DevTools in development (optional)
    // mainWindow.webContents.openDevTools();

    // Handle window closed
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open Audio File',
                    accelerator: 'CmdOrCtrl+O',
                    click: async () => {
                        const result = await dialog.showOpenDialog(mainWindow, {
                            properties: ['openFile'],
                            filters: [
                                { name: 'Audio Files', extensions: ['m4a', 'mp3', 'wav', 'ogg', 'flac', 'aac'] },
                                { name: 'All Files', extensions: ['*'] }
                            ]
                        });

                        if (!result.canceled && result.filePaths.length > 0) {
                            mainWindow.webContents.send('file-selected', result.filePaths[0]);
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: 'Alt+F4',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                {
                    label: 'Toggle Fullscreen',
                    accelerator: 'F11',
                    click: () => {
                        mainWindow.setFullScreen(!mainWindow.isFullScreen());
                    }
                },
                { type: 'separator' },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'CmdOrCtrl+Shift+I',
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                }
            ]
        },
        {
            label: 'Visualization',
            submenu: [
                {
                    label: 'Frequency Bars',
                    click: () => {
                        mainWindow.webContents.send('change-visualization', 'bars');
                    }
                },
                {
                    label: 'Pulsing Sphere',
                    click: () => {
                        mainWindow.webContents.send('change-visualization', 'sphere');
                    }
                },
                {
                    label: 'Wave Particles',
                    click: () => {
                        mainWindow.webContents.send('change-visualization', 'wave');
                    }
                },
                {
                    label: 'Expanding Rings',
                    click: () => {
                        mainWindow.webContents.send('change-visualization', 'ring');
                    }
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About Audio Visualizer',
                            message: 'Audio Visualizer v1.0.0',
                            detail: 'A stunning 3D audio visualization application built with Electron and Three.js.\n\nSupports .m4a and other audio formats.\n\nCreated with ❤️ using modern web technologies.',
                            buttons: ['OK']
                        });
                    }
                },
                {
                    label: 'Keyboard Shortcuts',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Keyboard Shortcuts',
                            message: 'Keyboard Shortcuts',
                            detail: 'Ctrl+O - Open Audio File\nF11 - Toggle Fullscreen\nCtrl+R - Reload\nCtrl+Shift+I - Developer Tools\nAlt+F4 - Exit',
                            buttons: ['OK']
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
    // On macOS stay active until user quits with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On macOS re-create window when dock icon is clicked
    if (mainWindow === null) {
        createWindow();
    }
});
