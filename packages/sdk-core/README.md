# `@jargon/sdk-core`

Jargon's SDK core package contains functionality common to multiple voice platforms and
frameworks.

## Core concepts

### Content resources and resource files
Content resources define the text that may vary across user locales.

Resource files are JSON, with a single top-level object (similar to package.json). The keys within that
object are the identifiers you'll use to refer to specific resources within your source code. Nested objects
are supported to help you organize your resources.
```json
{
  "key1":"Text for key 1",
  "key2":"Text for key 2",
  "nestedObjects":{
    "are":{
      "supported":"Use the key 'nestedObjects.are.supported' to refer to this resource"
    }
  }
}
```

### Resource value format
Resource values are in [ICU MessageFormat](http://userguide.icu-project.org/formatparse/messages). This
format supports constructing text at runtime based on parameters passed in from your code, and selecting
alternative forms to handle things like pluralization and gender.

#### Named parameters
```json
{
  "sayHello":"Hello {name}"
}
```
#### Plural forms
```json
{
  "itemCount":"{count, plural, =0 {You have zero items} =1 {You have one item} other {You have # items}}"
}
```

#### Gendered forms
```json
{
  "pronounSelection":"{gender, select, female {She did it!} male {He did it!} other {It did it!}"
}
```

### Variations
Resources can have multiple variations. Variations are defined using nested objects:
```json
{
  "resourceWithVariations":{
    "v1":"First variation",
    "v2":"Second variation",
    "v3":"Third variation"
  }
}
```

When rendering the key `resourceWithVariations` the `ResourceManager` will choose a variation at random (with other more complex
methods coming in future versions). If you render the same resource multiple times within a single request (e.g., for spoken
content and for card or screen content) the `ResourceManager` will by default consistently choose the same variation.

Note that you can always select a specific variation using its fully-qualified key (e.g., `resourceWithVariations.v1`)

You can determine which variation the was choses via the ResourceManager's selectedVariation(s) routines.

## Functionality

### Resource management and runtime rendering

`ResourceManager` allows clients to access content resources stored in locale-specifc
files, and to render those resources at runtime, substituting parameters.

A `ResourceManager` instance is meant to live only for the lifetime of a single request, and is bound
to a specific locale. Instances are created via a `ResourceManagerFactory` instance, normally `DefaultResourceManagerFactory`.

Resource files live in "resources" subdirectory of the process's runtime directory; this will soon be customizeable via
`ResourceManagerOptions`.

### Built-in Resources

This SDK includes default variations for some common responses.  Specifically, it includes resources for
* `JARGON_UNHANDLED_RESPONSE` can be used to provide a response when you can't otherwise process an intent
* `JARGON_DEFAULT_REPROMPT` can be used as a generic reprompt for the user

You can render these resources as you would any of your own, as described in the following section.  You can also define your own version of any of these strings in your resource file to override the default behavior.

## Runtime Interface

### RenderItem
A RenderItem specifies a resource key, optional parameters, and options to control details of the rendering (which
are themselves optional).
```typescript
interface RenderItem {
  /** The resource key to render */
  key: string
  /** Params to use during rendering (optional) */
  params?: RenderParams
  /** Render options (optional) */
  options?: RenderOptions
}
```

`RenderParams` are a map from parameter name to a string, number, or `RenderItem` instance.
```typescript
interface RenderParams {
  [param: string]: string | number | RenderItem
}
```

The use of a `RenderItem` instance as a parameter value makes it easy to compose multiple
resource together at runtime. This is useful when a parameter value varies across locales,
or when you want the SDK to select across multiple variations for a parameter value, and reduces
the need to chain together multiple calls into the  `ResourceManager`.

The `ri` helper function simplifies constructing a `RenderItem`:
```typescript
function ri (key: string, params?: RenderParams, options?: RenderOptions): RenderItem

rm.render(ri('sayHello', { 'name': 'World' }))
```

`RenderOptions` allows fine-grained control of rendering behavior for a specific call, overriding
the configuration set at the `ResourceManager` level.

```typescript
interface RenderOptions {
  /** When true, forces the use of a new random value for selecting variations,
   * overriding consistentRandom
   */
  readonly forceNewRandom?: boolean
}
```

### ResourceManager
`ResourceManager` is the core interface for rendering locale-specific content at runtime.

```typescript
export interface ResourceManager {
  /** Renders a string in the current locale
   * @param {RenderItem} item The item to render
   * @returns {Promise<string>} A promise to the rendered string
   */
  render (item: RenderItem): Promise<string>

  /** Renders multiple item
   * @param {RenderItem[]} items The items to render
   * @returns {Promise<string[]} A promise to the rendered strings
   */
  renderBatch (items: RenderItem[]): Promise<string[]>

  /** Renders an object in the current locale. This also supports returning
   * strings, numbers, or booleans
   * @param {RenderItem} item The item to render
   * @returns {Promise<T>} A promise to the rendered object
   */
  renderObject<T> (item: RenderItem): Promise<T>

  /** Retrieves information about the selected variant for a rendered item. This
   * will only return a result when rendering the item required a variation
   * selection. If item has been used for multiple calls to a render routine
   * the result of the first operation will be returned; use selectedVariations
   * to see all results.
   * @param {RenderItem} item The item to retrieve the selected variant for
   * @return {Promise<SelectedVariation>} A promise to the selected variation
   */
  selectedVariation (item: RenderItem): Promise<SelectedVariation>

  /** Retrieves information about all selected variations for rendered item. This
   * will only return a result for items that required a variation selection
   * during rendering. Results are ordered by the ordering of the calls to render
   * routines.
   * @return {Promise<SelectedVariation[]>} A promise to the selected variations
   */
  selectedVariations (): Promise<SelectedVariation[]>

  /** The locale the resource manager uses */
  readonly locale: string
}
```

Note that the render routines return `Promise`s to the rendered content, not the content directly.

### ResourceManagerFactory
A `ResourceManagerFactory` construct locale-specific `ResourceManager` instance.

```typescript
export interface ResourceManagerFactory {
  /** Constructs a ResourceManager for the specified locale
   * @param {string} locale
   */
  forLocale (locale: string): ResourceManager
}
```
Locales name use the standard [BCP-47](https://tools.ietf.org/html/bcp47) tags, such as 'en-US' or 'de-DE'.

### ResourceManagerOptions
Options for controlling resource manager functionality. Defaults are specified in `DefaultResourceManagerOptions`.

```typescript
export interface ResourceManagerOptions {
  /** When true (default), the resource manager will use the same random value
   * when randomly selecting among variations; this ensures that calls to different routines
   * (speak, reprompt, etc.) with identical RenderItem inputs will render the same output.
   * When false, each render call will use a different random value, leading to possible
   * inconsistencies in the final response. Note that this option can be overridden via
   * a RenderItem option.
   */
  consistentRandom?: boolean

  /** Resource files for the provided locales will be loaded during initialization instead
   * of on first use; default is none.
   */
  localesToPreload?: string[]

  /** When true (default), the resource manager will keep track of which variation it selected,
   * allowing clients to view those selections through a call to selectedVariation(s)
   */
  trackSelectedVariations?: boolean
}

export const DefaultResourceManagerOptions: Required<ResourceManagerOptions> = {
  consistentRandom: true,
  localesToPreload: [],
  trackSelectedVariations: true
}
```

### RenderOptions
Options for controlling rendering behavior, overriding the `ResourceManager`s configuration.
Defaults are specified in `DefaultRenderOptions`.

```typescript
/**
 * Options control additional rendering behavior, overridding the
 * settings configured at the ResourceManager level.
 */
export interface RenderOptions {
  /** When true, forces the use of a new random value for selecting variations,
   * overriding consistentRandom
   */
  readonly forceNewRandom?: boolean
}

export const DefaultRenderOptions: RenderOptions = {
  forceNewRandom: false
}
```

## Usage

```javascript
const sdkCore = require('@jargon/sdk-core');
const options = {}
const resourceManagerFactory = new sdkCore.DefaultResourceManagerFactory(options)
const resourceManager = resourceManagerFactory.forLocale('en-US')
const contentPromise = resourceManager.render(sdkCore.ri('sayHello', { 'name': 'World' }))
```
