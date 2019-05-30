### 1.1.2

Upgrade sdk-core to 1.3.1

### 1.1.1
Fixes an issue with circular module dependencies that Firebase's javascript compiler now rejects.

### 1.1.0
Support alternative resource directories (via dependency on @jargon/sdk-core v1.3.0)

Adds resourceDirectory to ResourceManagerOptions, with a default value of './resources',
to allow for customizing the directory where resources are loaded from.

The ResourceManagerFactory constructor will throw an error if resourceDirectory doesn't
exist (ENOENT) or isn't a directory (ENOTDIR).

### 1.0.2
Minor readme tweaks

### 1.0.1
Add table of contents to readme

### 1.0.0
Documentation and readme updates; no functionality changes

### 0.3.1 / 0.3.2
Readme updates only; no functionality changes

### 0.3.0
Bump sdk-core dependency to 1.1.0 to take of advantage of its new built-in resources for common scenarios. These resources are available using the `RenderItem` keys:
* `Jargon.unhandledResponse` -- provides a response for when you can't otherwise process an intent
* `Jargon.defaultReprompt` -- provides a generic reprompt

A customer-provided definition for these resource keys is used in preference to the built-in resources.

Currently the SDK includes variants of these resources for English, with other languages coming soon.

### 0.2.0

Fleshes out ResponseFactory

### 0.1.0

Initial preview release. Middleware functionality should be working for both Dialogflow and Actions SDK, but the response factory only contains a limited subset of possible responses.
