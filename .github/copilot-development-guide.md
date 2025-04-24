# Obsidian Chronotyper Plugin - Development Guide

## Core Principles
- Always be concise, answer under 50 words
- Do before asking, and don't describe your actions
- Always commit before you change anything, and after you change it
- Commits have to be concise, and to the point

## Project Overview
Chronotyper tracks time spent editing notes, monitoring file activity and updating frontmatter with timestamps and duration data.

## Setup
1. `npm install` - Install dependencies
2. `npm run dev` - Start development mode
3. `npm run build` - Create production build

## Architecture
- **Core**: `editSession.ts`, `main.ts`, `settingsTab.ts`, `version.ts`
- **Data**: Fragment interfaces and structures
- **Managers**: Business logic implementation
- **Storage**: Data persistence layer
- **Event Handlers**: Obsidian event processing

## Best Practices

### Code Structure
- Single responsibility per file/function
- Early returns over deep nesting
- Functional programming style
- TypeScript interfaces for all data structures
- Dependency injection via constructors

### Performance
- Minimize main thread operations
- Use debouncing for frequent events
- Handle large vaults efficiently

### Error Handling
- Use `ChronotyperError` for plugin errors
- Validate data before saving
- Implement fallbacks for corrupted data

## Testing
- Unit test critical functionality
- Test with various vault sizes
- Verify mobile and desktop compatibility

## Versioning
- Update version in `manifest.json` and `package.json`
- Document changes in release notes
- Tag releases in Git

## Commit Standards
- Small, focused, atomic commits
- Use imperative mood (Add, Fix, Update)
- Commit after logical units of work
- Feature branches for significant changes
