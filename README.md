# Chronotyper

![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?label=downloads&query=%24%5B%22chronotyper%22%5D%5B%22downloads%22%5D&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json&logo=obsidian&color=8b6cef&logoColor=8b6cef&labelColor=f1f2f3&logoWidth=20&style=for-the-badge)

> See [what's new](https://github.com/BambusControl/obsidian-chronotyper/releases)!

Track the total time of your edits directly inside your notes.

> *This is a plugin for [Obsidian: chronotyper](https://obsidian.md/plugins?id=chronotyper)*.

The plugin automatically tracks the time you spend editing a note.
It will automatically save the total edit time, and the modification timestamp in the notes properties:

```yaml
updated: 2024-12-28T19:14:33.599+01:00
edited_seconds: 8
```

## Features

- Tracks time spent editing notes
- Updates frontmatter with timestamps and duration
- Runs in the background without disrupting workflow

### Customization Options

- **Directory Exclusion**: Exclude specific folders from time tracking in settings
- **Custom Property Names**: Change frontmatter property names for timestamps (`updated`) and edit time (`edited_seconds`)
