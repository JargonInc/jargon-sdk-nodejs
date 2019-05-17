### 1.3.1
Readme updates describing how to access the ResourceManager

### 1.3.0
Support alternative resource directories (via dependency on @jargon/sdk-core v1.3.0)

Adds resourceDirectory to ResourceManagerOptions, with a default value of './resources',
to allow for customizing the directory where resources are loaded from.

The ResourceManagerFactory constructor will throw an error if resourceDirectory doesn't
exist (ENOENT) or isn't a directory (ENOTDIR).

### 1.2.1
Add Typescript ambient definitions for the Jargon SDK's additions to HandlerInput. With this
change there's no longer a need to cast HanderInput to JargonHandlerInput to access the Jargon
response builder or resource manager.

### 1.2.0
Support optional playBehavior parameter in ResponseBuilder.speak and .reprompt

ASK v2.4.0 exposes a new optional parameter to speak and reprompt. As JargonResponseBuilder
had already added a different optional parameter to those methods (merge), it now instead
takes either the previous optional boolean, or a new options object (ResponseGenerationOptions)
that has members for merge and playBehavior.

When merging speak/reprompt the first provided playBehavior (if any) is used for the final result
that's passed to the underlying ASK ResponseBuilder.

### 1.1.4
Bump sdk-core dependency to 1.1.0 to take of advantage of its new built-in resources for common scenarios. These resources are available using the `RenderItem` keys:
* `Jargon.unhandledResponse` -- provides a response for when you can't otherwise process an intent
* `Jargon.defaultReprompt` -- provides a generic reprompt

A customer-provided definition for these resource keys is used in preference to the built-in resources.

Currently the SDK includes variants of these resources for English, with other languages coming soon.

### 1.1.3
Rename JargonSkillBuilder.wrap() to installOnto(), to more clearly convey what's taking place.

JargonSkillBuilder.wrap() is marked as deprecated, but will remain present until at least major
version 3.

### 1.1.2
Fix bug with JargonSkillBuilder not passing options down to the request interceptor

### 1.1.1
Change version reference for @jargon/sdk-core to allow everything in the 1.x series, starting at 1.0.8

### 1.1.0
#### Optional JargonSkillBuilder behavior to combine multiple calls to speak and reprompt
By default the `speak` and `reprompt` methods replace the content from previous calls to those methods; this behavior mirrors
that of corresponding ASK SDK methods. There are two ways to change this behavior such to multiple calls to result in content
getting merged (with a space in between) instead of replaced:
1. When constructing the `JargonSkillBuilder` pass in an options object with `mergeSpeakAndReprompt` set to true
2. Set the `merge` parameter to the `speak` or `reprompt` method to true

When `mergeSpeakAndReprompt` is true the default replace behavior can be used for specific calls to `speak` or `reprompt` by
setting the `merge` parameter to false.

Note that each individual call to `speak` or `reprompt` should contain content that can stand alone (e.g., a full sentence or
paragraph) to minimize the chances that the order of the content would change across languages.

#### Add withCanFulfillIntent method to JargonResponseBuilder
Requires version 2.3.0 or later of the ASK SDK.

#### Avoid double-escaping of ampersands when rendering speak and reprompt content
Previously the SSML escaping logic would incorrectly modify already-escaped content.

### 1.0.7
Re-export everything from sdk-core instead of specific items.

### 1.0.6
Remove .nyc_output directory from distribution package.

### 1.0.5
Move functionality that isn't specific to the Alexa Skill Kit to sdk-core.

### 1.0.4
#### Support RenderItem instances as RenderParams values

The use of a RenderItem instance as a parameter value makes it easy to compose multiple
resource together at runtime. This is useful when a parameter value varies across locales,
or when you want the SDK to select across multiple variations for a parameter value, and reduces
the need to chain together multiple calls into the  ResourceManager.

### 1.0.3
* Add ResourceManager.selectedVariation\[s\]()
### 1.0.2
* Add ResourceManager.renderBatch()
### 1.0.1
* Add ResourceManager.renderObject()
### 1.0.0
* Initial Release