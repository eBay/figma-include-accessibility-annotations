<div align="center">
<img alt="include logo" height="60" width="60" src="include_logo.png" />

<h1 style="margin: 12px">Include</h1>

an accessibility annotation Figma plugin

[Try in Figma](https://www.figma.com/community/plugin/1208180794570801545/Include%3A-an-accessibility-annotation-tool)

</div>

## Intro

The eBay Include accessibility annotation Figma plugin is a tool to make annotating for accessibility (a11y) easier — easier for designers to spec and easier for developers to understand what is required.

The plugin was developed by members of the accessibility and design teams at eBay and is released for public use on Figma. You can view and install the latest version of the plugin [here](https://www.figma.com/community/plugin/1208180794570801545/Include%3A-an-accessibility-annotation-tool).

## Installation

```
npm i
```

## Development

```
npm run dev
```

To open the plugin in development mode on Figma, point Figma to the manifest file at the root of the project.

### File Structure

The app consists of 2 main files:

- `ui.js` UI Renderer (React app the user interacts with)
- `code.js` Figma Code Bridge (communicate with the Figma document)

The main methods used **_in this plugin_** to communicate with Figma are:

- `figma.once('run')`

  - used to run once on plugin load: pre-load fonts and search current page for any A11y Layers

- `figma.once('selectionchange')`

  - listen for frame selection (used to start an initial scan)
  - listen for Headings selection by user (accessibility step)

- `figma.once('currentpagechange')`

  - if the user changes to a different page on Figma, we ask them to go back to the page they started the plugin on, or to re-start the plugin on this new page

- `figma.ui.onmessage` **main communication**

  - this listener is used for 90% of the communication between the React App and the Figma document

### Figma Layer Naming and Structure

To create and read in accessibility annotations, the plugin creates Figma layers. An Accessibility Layer is created for each Figma frame that is annotated, and it follows the following structure:

```
[Scanned Frame Name] | Accessibility Layer | [Web or Native]
├── Landmarks Layer
├── Headings Layer
├── Reading order Layer
├── Alt text Layer
├── Contrast Layer
├── Touch target Layer
├── Text zoom Layer
├── Responsive reflow Layer
└── Accessibility annotations Layer

[Scanned Frame Name] Text Zoom
```

**Example:**

```
Using Color | Accessibility Layer | Web
├── Landmarks Layer | 207:424
│   ├── Landmarks Annotations
│   └── Landmark: banner | 207:411
├── Headings Layer | 207:444
│   ├── Heading: h3 | Color Backgrounds
│   ├── Heading: h2 | How We Use Color
│   └── Heading: h1 | Using Color
├── Reading order Layer | 814:1149
│   ├── Arrow 4
│   ├── Arrow 3
│   ├── Arrow 2
│   └── Start Arrow
├── Alt text Layer | 207:410
│   ├── Alt text Annotations
│   └── Alt text: informative | alt text for image | original image name | 2:146
├── Contrast Layer | 814:1297
├── Touch target Layer | 814:1298
├── Text zoom Layer | 122:198
├── Responsive reflow Layer | 804:3055
└── Accessibility annotations Layer | 1210:1466

Using Color Text Zoom
```

## Release Bundles

To bundle a new release, update the version number in `package.json`

Then run:

```
npm run bundle
```

All release bundles exist in `/dist_zips/`

## Helpful Links

We found the following helpful during the development of this plugin.

**Figma**

- [Post Message to UI Layer](https://www.figma.com/plugin-docs/api/figma-ui/#postmessage)
- [Close Plugin](https://www.figma.com/plugin-docs/api/figma-ui/#close)
- [figma.root](https://www.figma.com/plugin-docs/api/figma/#root)
- [Layer Grouping](https://www.figma.com/plugin-docs/api/properties/figma-group/)
- [listAvailableFontsAsync()](https://www.figma.com/plugin-docs/api/figma/#listavailablefontsasync)
- [Node/Group Expanded State](https://www.figma.com/plugin-docs/api/GroupNode/#expanded)
- [Find All with Criteria](https://www.figma.com/plugin-docs/api/properties/nodes-findallwithcriteria/)
- [Helper Functions](https://github.com/figma-plugin-helper-functions/figma-plugin-helpers)
- [Selection change](https://blog.prototypr.io/figma-plugin-tutorial-3-6-a2703864a776)
- [Contrast cheker](https://github.com/romannurik/Figma-Contrast)
- [Open Source List](https://github.com/thomas-lowry/figma-plugins-on-github)

## License

Apache 2.0 - See [LICENSE](https://github.corp.ebay.com/Design-Technology/include-accessibility-annotations/blob/main/LICENSE) for more information.
