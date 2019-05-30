### 0.3.1

Upgrade sdk-core to 1.3.1

### 0.3.0
Support alternative resource directories (via dependency on @jargon/sdk-core v1.3.0)

Adds resourceDirectory to ResourceManagerOptions, with a default value of './resources',
to allow for customizing the directory where resources are loaded from.

The ResourceManagerFactory constructor will throw an error if resourceDirectory doesn't
exist (ENOENT) or isn't a directory (ENOTDIR).

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
