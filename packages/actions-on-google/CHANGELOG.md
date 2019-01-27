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
