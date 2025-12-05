/**
 * Preload Script
 * This script runs in the renderer process before the web page is loaded.
 * It has access to both DOM APIs and Node.js environment.
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'electron',
    {
        // Listen for file selection from menu
        onFileSelected: (callback) => {
            ipcRenderer.on('file-selected', (event, filePath) => {
                callback(filePath);
            });
        },

        // Listen for visualization change from menu
        onVisualizationChange: (callback) => {
            ipcRenderer.on('change-visualization', (event, type) => {
                callback(type);
            });
        }
    }
);
