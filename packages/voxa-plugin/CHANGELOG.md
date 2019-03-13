### 0.2.0
Jargon variation support

This requires cloning the core Voxa directives into Jargon versions,
and changing at runtime the directiveHandlers in VoxaApp to use the
Jargon equivalent version instead of the originals. Only directives
that need to have variation support require a Jargon versions; directives
that pull full objects (such as APL or display templates) don't need the
modified versions.

### 0.1.0
Initial preview release
