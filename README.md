# ySwitch Android App

A React Native application built with Expo and configured for Android development using a custom development client.

## Prerequisites

Before running this application, ensure you have the following installed:

- **Bun** - Fast JavaScript runtime and package manager
- **Android Studio** - For Android development tools and emulator
- **Java Development Kit (JDK)** - Required for Android development
- **Android SDK** - Installed through Android Studio
- **Expo CLI** - Will be installed with dependencies

### Android Setup

1. Install Android Studio from [developer.android.com](https://developer.android.com/studio)
2. Set up Android SDK and accept the license agreements
3. Create an Android Virtual Device (AVD) or connect a physical Android device
4. Enable Developer Options and USB Debugging on your physical device (if using)

### Environment Variables (if needed)

Make sure your environment variables are set up correctly:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Getting Started

### 1. Install Dependencies

```bash
bun i
```

This will install all the necessary dependencies for the project using Bun's fast package manager.

### 2. Run the Application

```bash
bun expo run:android -d
```

This command will:
- Build the development client for Android
- Launch the app on your connected Android device or emulator
- Start the Metro bundler for hot reloading

The `-d` flag enables device selection if multiple devices are available.

## Development

### Available Scripts

- `bun i` - Install dependencies
- `bun expo run:android -d` - Run the app on Android with device selection
- `bun expo start` - Start the Expo development server
- `bun expo prebuild` - Generate native code (if needed)

### Development Client

This project uses Expo's custom development client, which allows you to:
- Use custom native code and third-party libraries
- Have a more native development experience
- Test features that require a production-like environment

### Hot Reloading

The development server supports hot reloading, so changes to your code will automatically refresh the app without losing state.

## Troubleshooting

### Common Issues

**Device not detected:**
- Ensure USB debugging is enabled on your Android device
- Check that your device is properly connected with `adb devices`

**Build errors:**
- Clear the cache with `bun expo start --clear`
- Ensure all Android SDK components are installed and up to date

**Metro bundler issues:**
- Restart the bundler with `bun expo start --clear`
- Check for port conflicts (default is 8081)

### Useful Commands

```bash
# Check connected devices
adb devices

# Clear Expo cache
bun expo start --clear

# Restart ADB server
adb kill-server && adb start-server
```

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Development Client](https://docs.expo.dev/development/introduction/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Bun Documentation](https://bun.sh/docs)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test on Android device/emulator
5. Submit a pull request

## License

[Add your license information here]