# UIAgent

Purpose
- Define and validate EvenHub UI rendering strategy from request to container payload.
- Standardize how blocks, frames, lists, and pseudo-tables are represented under SDK limits.

When to use
- Use for requests about UI darstellen/rendern/layout/screen/container/visual structure for EvenHub/TestApp glasses UI.
- Exclude non-UI tasks (API integrations, storage, CI, release workflows).
- If multiple skills match, use this order: `ui_agent -> even_agent -> architecture` (architecture only for code-change compliance checks).

Sources
- Official SDK README: `testapp/node_modules/@evenrealities/even_hub_sdk/README.md`
- Official SDK types: `testapp/node_modules/@evenrealities/even_hub_sdk/dist/index.d.ts`
- UI pipeline: `testapp/src/ui`
- Bridge wrapper: `testapp/src/bridge/evenHubBridge.ts`
- G2 notes (Browser UI components, community/reverse-engineered): `https://github.com/nickustinov/even-g2-notes/blob/main/G2.md#browser-ui-component-library`
- Priority rule:
  - Official SDK sources are authoritative for glasses rendering and bridge behavior.
  - G2 notes are supplemental for companion Browser/WebView UI guidance.

Local monitoring
- Dev URL for live UI/manual log inspection: `http://localhost:5173`
- Quick availability check from terminal: `curl -I http://localhost:5173`

Supported primitives
- Container models:
  - `ListContainerProperty`
  - `TextContainerProperty`
  - `ImageContainerProperty`
- Rendering/update methods:
  - `createStartUpPageContainer`
  - `rebuildPageContainer`
  - `textContainerUpgrade`
  - `updateImageRawData`

Browser UI (WebView companion, not glasses canvas)
- Purpose:
  - Use `@jappyjan/even-realities-ui` for companion config/settings screens in Browser/WebView.
- Scope boundary:
  - These components do not render on the glasses canvas.
  - Glasses rendering still requires SDK containers and bridge calls.
- Entry points:
  - `@jappyjan/even-realities-ui` (full re-export)
  - `@jappyjan/even-realities-ui/components`
  - `@jappyjan/even-realities-ui/icons`
  - `@jappyjan/even-realities-ui/tokens` (currently empty in package)
  - `@jappyjan/even-realities-ui/styles.css`
- Install/import:
  - `npm install @jappyjan/even-realities-ui`
  - Import stylesheet exactly once globally: `@jappyjan/even-realities-ui/styles.css`
- Recommended Browser components:
  - Actions: `Button` (variants/sizes), `IconButton`
  - Layout: `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Divider`
  - Text: `Text` (variant-based typography)
  - Inputs: `Input`, `Textarea`, `Select`
  - Controls: `Checkbox`, `Radio`, `Switch`
  - Status/meta: `Badge`, `Chip`
- Icons:
  - 90+ icon set, grouped by domain: hardware, battery, navigation, actions, features, settings, general.
  - Example names: `GlassesIcon`, `BatteryFullIcon`, `BackIcon`, `AddIcon`, `TranslateIcon`, `SettingsIcon`, `InfoIcon`.
- Tokens (CSS custom properties):
  - Backgrounds (`--color-bc-*`), surfaces (`--color-sc-*`), text (`--color-tc-*`).
  - Typography (`--font-size-app-*`), spacing (`--space-*`), layout (`--layout-*`), radius (`--radius-*`).
- Utility:
  - `cn(...inputs): string` for class composition (`clsx` + `tailwind-merge`).

Hard constraints
- Maximum 4 containers per page.
- Exactly one container must have `isEventCapture=1`.
- Coordinate system: origin `(0,0)` top-left, X right, Y down.
- List/Text container ranges:
  - `xPosition: 0-576`, `yPosition: 0-288`
  - `width: 0-576`, `height: 0-288`
  - `borderWidth: 0-5`, `borderRdaius: 0-10`
- Image container ranges:
  - `xPosition: 0-576`, `yPosition: 0-288`
  - `width: 20-200`, `height: 20-100`
- Image delivery constraints:
  - Create image containers first, then send content via `updateImageRawData`.
  - Do not send image updates concurrently; use queue/sequential updates.
  - Avoid high-frequency image pushes due to device memory limits.

What is not native
- No native SVG/vector drawing API.
- No native table/grid widget.
- No free-form primitive shape API (line/rect/path/canvas drawing).

Representation rules
- Frames/blocks:
  - Use list/text containers with `borderWidth`, `borderColor`, `borderRdaius`, `paddingLength`.
- Tables:
  - Simple: represent as list rows in a list container.
  - Complex: pre-render to image and push through `updateImageRawData`.
- Icons/charts/SVG-like visuals:
  - Pre-render externally and deliver as image data via image container updates.

Workflow
1. Classify request scope as `browser-ui`, `glasses-ui`, or `hybrid`.
2. If scope is `browser-ui` or `hybrid`, plan companion Browser/WebView UI first:
   - Choose `@jappyjan/even-realities-ui` entry points.
   - Map screen sections to component sets and icon/token usage.
3. If scope is `glasses-ui` or `hybrid`, classify glasses payload as `text`, `list`, `image`, or `mixed`.
4. Build a glasses container plan that stays within 4-container budget.
5. Assign exactly one event-capture container (`isEventCapture=1`) for glasses payload.
6. Produce the glasses API sequence:
   - Initial render: `createStartUpPageContainer`
   - Subsequent pages/major changes: `rebuildPageContainer`
   - Text-only delta: `textContainerUpgrade`
   - Image content: `updateImageRawData` (sequential queue)
7. If design exceeds SDK limits, provide an explicit fallback layout and note compromises.

Output contract
- Always return:
  - Scope classification (`browser-ui`, `glasses-ui`, `hybrid`)
  - Clear separation between Browser/WebView plan and glasses container plan
- If Browser/WebView UI is included, also return:
  - Entry points used
  - Component list per screen/section
  - Icon/token usage notes
  - CSS import note (`styles.css` imported once globally)
- If glasses UI is included, always return:
  - Container plan (types, positions, sizes, IDs/names)
  - Event-capture assignment
  - API call sequence
  - Tradeoffs/compromises caused by SDK limits

Common pitfalls
- Calling `createStartUpPageContainer` repeatedly after first successful startup.
- Assigning `isEventCapture=1` to more than one container.
- Sending concurrent image updates.
- Promising native SVG/table features that are not supported by the SDK.
- Treating Browser/WebView components as if they render on the glasses canvas.
- Treating `@jappyjan/even-realities-ui` as a replacement for SDK container APIs.
- Missing global stylesheet import or importing it multiple times.
- For hybrid screens, mixing Browser/WebView recommendations with device-rendered container output without clear separation.

Testing requirements
- Every UI-related implementation change must include automated tests for:
  - each changed/new method that influences UI behavior
  - each changed/new feature flow (navigation, rendering state, and input handling)
- Minimum scenario set per changed feature:
  - happy path
  - edge/error handling
  - regression case for the exact changed behavior
- If some UI behavior cannot be fully automated (device-only limits), document the manual checks and keep the decision logic under automated test coverage.
