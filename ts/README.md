# JavaScript Universal Messaging (JSUM) - TypeScript Implementation

This directory contains TypeScript versions of the JSUM library. These implementations provide the same functionality as the JavaScript versions with added type safety.

## Features

- Full TypeScript type definitions
- Identical API to the JavaScript version
- Optional - use either the JavaScript or TypeScript versions

## Usage

### Building

```bash
npm run build:ts
```

This will compile the TypeScript files in `ts/src` to JavaScript in `ts/dist`.

### Development

```bash
npm run watch:ts
```

This will watch for changes to TypeScript files and recompile them automatically.

## Implementation Notes

- The TypeScript implementation maintains the same architecture and API as the JavaScript version
- No external dependencies are added
- Web Components API is used with proper TypeScript types
- Type definitions improve code quality and developer experience

## Modules

- **jsum.ts** - Core message bus and hydration lifecycle
- **API.ts** - REST API interface with request deduplication
- **navigation.ts** - View management component
- **menu.ts** - Navigation menu component
- **persistance.ts** - URL hash-based persistent data storage
- **object_equals.ts** - Deep object comparison utility