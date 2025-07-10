# Monome Arc Web Client

A web-based client for the Monome Arc using Deno and the Web Serial API. This project allows you to connect directly to a Monome Arc device from your web browser without needing serialosc middleware.

## Features

- Direct Web Serial API connection to Monome Arc
- Real-time encoder position tracking
- Visual LED ring feedback
- Support for 2025 edition pushbutton
- Interactive LED control via clicking
- Adjustable brightness control
- Real-time logging

## Requirements

- **Browser**: Chrome 89+ or Edge 89+ with experimental web platform features enabled
- **Runtime**: Deno 1.30+
- **Hardware**: Monome Arc (any edition, optimized for 2025 edition)

## Browser Setup

1. Enable Web Serial API in your browser:
   - Chrome: Visit `chrome://flags/#enable-experimental-web-platform-features`
   - Edge: Visit `edge://flags/#enable-experimental-web-platform-features`
   - Set "Experimental Web Platform features" to **Enabled**
   - Restart your browser

## Installation & Usage

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd arc_test
   ```

3. Start the Deno server:
   ```bash
   deno run --allow-net --allow-read server.ts
   ```

4. Open your browser and navigate to: `http://localhost:8000`

5. Connect your Monome Arc via USB

6. Click "Connect Arc" and select your device from the serial port list

## Usage

### Connecting
- Click "Connect Arc" button
- Select your Monome Arc from the browser's serial port dialog
- Once connected, the status will show "Connected" in green

### Interacting
- **Encoders**: Turn the physical knobs to see real-time updates
- **LEDs**: Click anywhere on the visual LED rings to toggle individual LEDs
- **Pushbutton**: Press the center button (2025 edition) to see feedback
- **Brightness**: Use the slider to adjust global LED brightness

### Monitoring
- All encoder movements and button presses are logged in real-time
- Use "Clear Log" to reset the log output

## Technical Details

### Communication Protocol
- **Connection**: Direct USB serial at 115200 baud
- **Encoder Data**: 0x60 command + encoder ID + delta value
- **Button Data**: 0x61 command + state
- **LED Control**: 0x70-0x73 commands + 64 brightness values per ring

### Architecture
- **Backend**: Deno HTTP server serving static files
- **Frontend**: Vanilla JavaScript with Web Serial API
- **No Dependencies**: Pure web standards implementation

### File Structure
```
arc_test/
├── server.ts          # Deno HTTP server
├── public/
│   └── index.html     # Web client application
└── README.md          # This file
```

## Troubleshooting

### "Web Serial API Not Supported"
- Ensure you're using Chrome 89+ or Edge 89+
- Enable experimental web platform features in browser flags
- Restart your browser after enabling flags

### Connection Issues
- Make sure your Arc is connected via USB
- Try different USB ports or cables
- Check that no other applications are using the Arc
- On some systems, you may need to install USB drivers

### No Encoder Data
- Verify the baud rate (should be 115200)
- Check the log for connection errors
- Try disconnecting and reconnecting

### LED Updates Not Working
- Ensure the device is properly connected
- Check browser console for JavaScript errors
- Verify the LED command format matches your Arc's firmware

## Development

To modify the client:
1. Edit `public/index.html` for UI changes
2. Edit `server.ts` for server-side changes
3. Restart the Deno server to see changes

The serial protocol implementation is based on the Monome Arc documentation and may need adjustments depending on your specific Arc model and firmware version.

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 89+     | ✅ Supported |
| Edge    | 89+     | ✅ Supported |
| Firefox | Any     | ❌ No Web Serial API |
| Safari  | Any     | ❌ No Web Serial API |

## License

This project is provided as-is for educational and experimental purposes.