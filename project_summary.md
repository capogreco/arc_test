# Monome Arc Web Client Project Summary

## 1. Goal

Connect a Monome Arc (specifically mentioning the 2025 edition) to a web client. The client should run in a browser and communicate with the Arc directly using the **Web Serial API**. The backend serving the client is built with **Deno**. This approach aims to bypass the standard `serialosc` middleware.

## 2. Current Status & Challenges

*   **Connection**: A Deno server (`arc_test/server.ts`) serves a web client (`arc_test/public/index.html`). The client successfully establishes a Web Serial connection to the Monome Arc.
*   **Protocol Implementation**: The client attempts to use the Monome `mext` (extended) serial protocol, based on information from `libmonome`, `serialosc`, and `MonomeHost` (Arduino) libraries.
*   **Initialization Sent**:
    *   On connection, the client sends a sequence of `mext` system commands:
        1.  `[0x01]` (SS_SYSTEM, CMD_SYSTEM_GET_ID)
        2.  `[0x00]` (SS_SYSTEM, CMD_SYSTEM_QUERY)
        3.  `[0x05]` (SS_SYSTEM, CMD_SYSTEM_GET_GRIDSZ)
    *   It then attempts to clear all 4 LED rings using `[0x91, ring_num, 0x00]` (SS_LED_RING, CMD_LED_RING_ALL) for each ring.
*   **LED Control Attempt**: The client uses command `0x92` (SS_LED_RING, CMD_LED_RING_MAP) with a payload `[ring_num, 32_packed_bytes]` for setting LED rings. The 64 4-bit LED levels are packed into 32 bytes where each byte is `(level[N] << 4) | level[N+1]`.
*   **Incoming Data**:
    *   The Arc consistently sends messages that are parsed as `0x6d`. This corresponds to `mext` subsystem `0x06` (SS_ANALOG_IN) and command `0x0D` (13).
    *   No clear/expected responses to the `mext` system queries (`0x00`, `0x01`, `0x05`) have been observed in the client logs.
*   **Main Problem**:
    *   The Monome Arc does not seem to enter the expected "raw" `mext` serial mode where it would respond to system queries or accept encoder/LED commands as defined.
    *   LEDs on the physical Arc are not synchronizing with the GUI.
    *   The device appears to default to or get stuck in a mode (possibly an "application mode" like `iii` or an analog input mode) that sends `0x6d` messages.
*   **Error Handling**:
    *   A `SyntaxError` related to `await` in a non-async `parseMessage` function was identified and fixed by making `parseMessage` async.
    *   If the client receives the `0x6d` (subsystem 6) message, it attempts to re-run the initialization sequence.

## 3. Key Files in the Project

*   `arc_test/server.ts`: Deno HTTP server.
*   `arc_test/public/index.html`: Main web client HTML and JavaScript, including Web Serial API logic and `mext` protocol implementation.
*   `arc_test/README.md`: General project README.
*   `arc_test/project_summary.md`: This file.

## 4. Reference Materials Used

*   **Official Monome Arc Documentation**: `https://monome.org/docs/arc/`
*   **`libmonome` library**: Core C library for Monome communication. Key files:
    *   `src/proto/mext.h`: Defines `mext` subsystems, commands, and payload structures.
    *   `src/proto/mext.c`: Implements `mext` protocol logic, including command sending and event parsing.
    *   `public/monome.h`: Public API.
*   **`serialosc` library**: Official OSC server for Monome devices; uses `libmonome`.
    *   `src/serialosc-device/osc/mext_methods.c`: Shows OSC to `mext` translation (useful for outgoing commands).
    *   `src/serialosc-device/server.c`: Shows `libmonome` event handling (useful for incoming events and initialization flow).
*   **`MonomeHost` Arduino library**: Alternative implementation for direct FTDI/serial communication.
    *   `MonomeController.cpp` / `.h`: Contains `mext` parsing and command construction, including an `setup_mext()` initialization sequence.

## 5. Next Steps & Hypotheses

*   **Confirm Response to Queries**: The immediate next step is to verify if *any* response is received from the Arc after sending the simplified initialization queries. The lack of logged raw data for query responses is a major concern.
*   **Investigate `0x6d`**: Understand why the Arc defaults to sending `0x6d` and if there's a specific command (perhaps from "iii" protocol or a different mode set) needed to switch it to the desired `mext` serial mode for direct control. The current reference materials for `mext` don't fully explain this behavior when bypassing `serialosc`.
*   **Low-level Serial Parameters**: Consider if there are other serial port parameters (beyond baud rate, data bits, etc.) that Web Serial API might not be setting, which `libmonome`/`serialosc` handle implicitly when opening a raw TTY device. This could involve control lines or FTDI-specific configurations.
*   **Arduino `MonomeHost` Comparison**: The `MonomeHost`'s `setup_mext()` function in `MonomeController.cpp` provides a template for a successful direct serial initialization. Comparing its exact byte sequence and timing with the Web Serial client's attempt could be insightful. Notably, it loops until a specific (6-byte) response to the initial `[0x00]` query is received.

## 6. Code Snippets of Interest

**Target `mext` LED Ring Map Command (from `index.html`):**
```javascript
// async sendLEDData(encoder)
const header = 0x92; // SS_LED_RING (9) << 4 | CMD_LED_RING_MAP (2)
const ringNum = encoder;
const packedLevels = new Uint8Array(32);
for (let i = 0; i < 32; i++) {
    const level1 = this.leds[encoder][i * 2] & 0x0F;
    const level2 = this.leds[encoder][(i * 2) + 1] & 0x0F;
    packedLevels[i] = (level1 << 4) | level2;
}
const command = new Uint8Array([header, ringNum, ...packedLevels]);
await this.writer.write(command);
```

**Target `mext` Initialization Sequence (from `index.html` `initializeDevice()`):**
```javascript
// async initializeDevice(isInitialConnection)
// 1. Send [0x01] (Get Device ID)
// 2. Send [0x00] (System Query)
// 3. Send [0x05] (Get Grid/Arc Size)
// 4. If isInitialConnection, clear rings: [0x91, ring_num, 0x00] for each ring
```