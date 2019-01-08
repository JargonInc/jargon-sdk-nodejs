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
1. Set the `merge` parameter to the `speak` or `reprompt` method to true

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