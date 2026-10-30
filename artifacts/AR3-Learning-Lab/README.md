# AR3 Learning Lab

An interactive robot learning lab that runs locally in your browser.

## Quick start

1. Extract `ar3-learning-lab-offline.zip`.
2. Open the extracted `AR3-Learning-Lab` folder.
3. Double-click `ar3-learning-lab.html`, or drag it into Chrome, Edge, or Safari.

No installation, local server, or internet connection is required for the lab.
External tutorial videos and source links require an internet connection.

## Using the lab

- Click the **Robot controls** header to collapse or expand the entire robot workspace, including the robot view, control panel, and coordinate tables. Collapsing it brings the tutorial directly below the header. You can also focus the header and press Enter or Space.
- Use **Robot controls** beside the robot to select joints, adjust angles, and open or close the gripper. On narrow screens, the controls appear directly below the robot.
- Use **−10°**, **+10°**, or a numeric target to animate a movement. Sliders update immediately.
- Select **Ready pose** to return to the model’s reference pose.
- Open **End position** to request Cartesian movements in the base frame.
- Use the **Coordinate frame viewer** to select `base_link` or `link_1` through `link_6` and compare commanded and simulated measured positions.
- Solid axes show the selected current link frame. Dashed axes show the commanded flange frame. X is red, Y is green, and Z is blue.
- Explore the tutorial section below the viewer for guided exercises.

## Languages and saved settings

English is the default language on first use. Korean and Spanish are also available, with major joint and part names shown as English followed by the local translation in parentheses.

The lab remembers your selected language and tutorial progress when browser storage is available. Storage behavior for local HTML files depends on your browser and privacy settings.

## Model limitations

Without a calibrated USB connection this is an educational simulation: the measured column uses animated joint values and forward kinematics. The USB panel below adds explicit, bounded hardware commands and physical encoder feedback.

XYZ values refer to the `link_6` flange origin, not the gripper tip (TCP). Both flange positions in the comparison table use the selected current link frame as a common reference. Joint errors are commanded minus measured angles; the table identifies simulated versus physical encoder feedback.

Cartesian movements solve position using J1–J3 while preserving J4–J6 joint angles. Motion interpolates joint angles and does not guarantee a straight path. Collision, speed, acceleration, and payload checks are not included.

## Credits

The HTML includes the Colorfigures license and attribution for Dexter Ong’s AR3 kinematic data. Source links and model details are available in the lab.

## USB control: legacy AR3 with Teensy 3.5

Open the updated `artifacts/ar3-learning-lab.html` in desktop Chrome or Edge.
Web Serial requires a secure context (HTTPS or localhost); if USB is unavailable
when opening a file, run `python3 -m http.server 8765 --bind 127.0.0.1` from the
project and visit `http://localhost:8765/artifacts/ar3-learning-lab.html`.
Simulation remains available in other browsers.

This adapter supports the **legacy Annin AR3/ARCS Teensy firmware**, at 115200 baud.
Teensy 3.5 identifies the board, not its installed firmware. ROS/ar3_core and AR4
firmware use different protocols and are unsupported. Incompatible responses
or timeouts block motion. No firmware is flashed by this app.

Only the Teensy USB connection is used for the six arm axes and encoder feedback.
The Mega/ATmega2560 connection is for auxiliary IO/servos; attached grippers are
not controlled here. Motor power and the physical emergency stop are separate.
Close ARCS and any serial monitor before connecting to avoid port contention.

1. Expand **Robot controls**, then select **Connect USB** in the physical AR3
   panel. Choose the Teensy port in the browser's device chooser. Connecting
   only reads encoder counts; it does not move or home the robot.
   The on-screen USB log shows port selection, opening, TX commands, raw RX
   data and errors with timestamps (latest 100 entries, kept only in this page).
   A port opening alone does not confirm robot communication: look for
   **Connection verified — valid six-axis encoder reply received** and its
   last-valid-reply time. TX without RX means no response has been received;
   a timeout occurs after eight seconds. **Clear log** clears the display only.
2. The robot must already have been homed using the appropriate ARCS procedure.
   Put it at a physically known reference pose. Open **Reference pose calibration**.
   Enter all six reference angles **in this app's ROS model coordinates**, not
   unconverted ARCS angles. The model ready pose is not a presumed physical pose.
3. Enter each joint's **signed step/°** and **+count bit**. For the standard ARCS
   configuration, step magnitude is `StepLim / (PosAngLim - NegAngLim)`.
   Choose its sign according to encoder change per increasing model angle.
   The direction bit for increasing counts is the opposite of the ARCS `MotDir`
   bit, with the same firmware and wiring. Values are deliberately blank:
   verify these against your calibration and wiring instead of guessing.
   Supported scale magnitude is 1–200 steps/degree. In encoder-to-joint conversions,
   use motor-equivalent steps (the firmware already divides by `encMult`).
4. Confirm the physical pose and settings, then select **Calibrate current reading
   to reference**. This sets host-side zero offsets without moving the robot or
   resetting firmware encoders. It calibrates offsets only; it does not determine
   gearing, backlash, link lengths or joint-axis alignment. Reference calibration is discarded on reconnection; settings also clear on
   reload. Calibration is invalid
   after disconnects or protocol faults. Power cycles require a new physical
   reference; incremental encoder startup counts are not absolute positions.
5. Set a virtual target using the existing controls, choose a joint, and enable
   physical drive after checking clearance and the physical emergency stop.
   **Selected joint → virtual target, max 1°** sends one bounded move at 5% speed.
   Other joints stay still. Repeat explicitly to approach a distant target.
   Sliders, ready pose, tutorials, Cartesian and gripper controls remain virtual.
6. The robot drawing and solid axes now use calibrated encoder feedback; dashed
   axes and the circle mark the virtual target. The comparison table shows actual
   joint angles, flange XYZ, per-axis error and Euclidean flange distance in mm.
   Error is virtual commanded minus measured. XYZ is forward kinematics from
   encoders, not independent metrology. On stock hardware, encoder placement,
   drivetrain backlash and model geometry can differ from physical joint position.
   Readings older than three seconds show no physical measurements. There is no
   encoder feedback while the legacy firmware executes a motion.

**Lock drive and Disconnect do not stop an in-progress move.** The legacy Teensy
firmware blocks USB processing during joint motion; use the physical emergency
stop. Requests are not queued. Timeouts, invalid data and post-move deviations
above 0.5° lock further commands. Verify motor direction with the first small move;
software limits cannot prevent collision or compensate for incorrect calibration.

Protocol reference: [ARCS Teensy source, pinned e1485f08](https://github.com/kentavv/annin_robotics_ar3/blob/e1485f08cde6ff53dc513c98495197beff89c376/ARCS_teensy_sketch/ARCS_teensy_sketch.ino).
The adapter uses `GP` reads and bounded `MJ` moves. Unreachable comparison targets
force encoder feedback without the firmware's usual target-count snapping;
comparison flags in those replies are expected, and host-side position checks
replace them. No `LM` encoder reset or `LL` homing commands are sent.

## Checks

Run `node tests/serial.cjs`, `node tests/i18n.cjs`, `node tests/kinematics.cjs`,
`node tests/course.cjs`, `python3 tests/source-parity.py`, then `python3 build.py`.
Serial checks use a fake device; actual Teensy wiring, calibration, motor response
and emergency-stop operation must be verified on the physical robot.
