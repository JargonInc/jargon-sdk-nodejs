### 1.3.1

Upgrade i18next-sync-fs-backend to 1.1.1

### 1.3.0
Support alternative resource directories

Adds resourceDirectory to ResourceManagerOptions, with a default value of './resources',
to allow for customizing the directory where resources are loaded from.

The ResourceManagerFactory constructor will throw an error if resourceDirectory doesn't
exist (ENOENT) or isn't a directory (ENOTDIR).

### 1.2.0
Expose variation selection logic in ResourceManager

This is intended for use by Jargon's voxa plugin, so it can select
variations after such things as selecting a platform specific message
object.

### 1.1.2
Fix bug returning selected variations

SelectedVariation.variationKey was getting the rendered content instead
of the selected key. Test missed this as the test resources had the content
the same as the key...

### 1.1.1
Support nested `RenderItem` parameters in `ResourceManager.renderObject`

### 1.1.0
Add built-in resources for common scenarios. These resources are available using the `RenderItem` keys:
* `Jargon.unhandledResponse` -- provides a response for when you can't otherwise process an intent
* `Jargon.defaultReprompt` -- provides a generic reprompt

A customer-provided definition for these resource keys is used in preference to the built-in resources.

Currently the SDK includes variants of these resources for English, with other languages coming soon.

### 1.0.9
Fix bad release

### 1.0.8
Fix handling of arrays in renderObject calls

### 1.0.7
Version bump for consistency with other packages

### 1.0.5
Initial version as a standalone package. No functional changes, though we now export
a "DefaultResourceManagerFactory" so client code doesn't need to explicitly select
an implementation.

### 1.0.4
#### Support RenderItem instances as RenderParams values

The use of a RenderItem instance as a parameter value makes it easy to compose multiple
resource together at runtime. This is useful when a parameter value varies across locales,
or when you want the SDK to select across multiple variations for a parameter value, and reduces
the need to chain together multiple calls into the `ResourceManager`.

### 1.0.3
* Add ResourceManager.selectedVariation\[s\]()
### 1.0.2
* Add ResourceManager.renderBatch()
### 1.0.1
* Add ResourceManager.renderObject()
### 1.0.0
* Initial Release