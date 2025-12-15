# Building the Windows Executable

To build the Windows .exe for the Audio Visualizer:

## Method 1: Build Installer (Recommended)
```
npm run build
```

This will create a Windows installer (.exe) in the `dist` folder.

## Method 2: Run in Development Mode
```
npm start
```

This runs the app without building the exe.

## Build Output
The built application will be in the `dist` folder:
- `Audio Visualizer Setup X.X.X.exe` - Installer
- Unpacked application files

## Note about Icon
The app is configured to use `icon.ico` but we haven't created one yet. The build will work without it, using the default Electron icon.

To add a custom icon:
1. Create or download an .ico file
2. Save it as `icon.ico` in the project root
3. Run the build again
