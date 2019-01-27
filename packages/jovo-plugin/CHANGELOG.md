### 2.0.1
Bump sdk-core dependency to 1.1.0 to take of advantage of its new built-in resources for common scenarios. These resources are available using the `RenderItem` keys:
* `Jargon.unhandledResponse` -- provides a response for when you can't otherwise process an intent
* `Jargon.defaultReprompt` -- provides a generic reprompt

A customer-provided definition for these resource keys is used in preference to the built-in resources.

Currently the SDK includes variants of these resources for English, with other languages coming soon.

### 2.0.0
Move to v2.0 of the Jovo framework.

### 1.0.8
Fix overly-specific dependency on @jargon/sdk-core, with a minimum of 1.0.9.

### 1.0.7
Initial release of the Jargon Jovo plugin