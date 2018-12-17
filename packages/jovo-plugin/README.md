# Jargon SDK for the Jovo Framework

The Jargon SDK makes it easy for skill developers to manage their runtime content, and to support
multiple languages from within their skill.

Need help localizing your skills to new languages and locales? Contact Jargon at localization@jargon.com.

## Requirements
Jargon's Jovo plugin works with version 1.4 and later of the [Jovo Framework](https://www.jovo.tech/).

## Core Concepts

### Content resources and resource files
Content resources define the text that your Jovo application outputs to users, via the devices voice,
card content, or screen content. It's important that these resources live outside of your application's
source code to make it possible to localize them into other languages.

The Jargon SDK expects resource files to live in the "resources" subdirectory within your Jovo
code. Each locale has a single resource file, named for that locale (e.g., "en-US.json").

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
It's important for voice applications to vary the words they use in response to users, lest they sound robotic. The Jargon SDK
makes ths simple with built-in variation support. Variations are defined using nested objects:
```json
{
  "resourceWithVariations":{
    "v1":"First variation",
    "v2":"Second variation",
    "v3":"Third variation"
  }
}
```

When rendering the key `resourceWithVariations` the Jargon SDK will choose a variation at random (with other more complex
methods coming in future versions). If you render the same resource multiple times within a single request (e.g., for spoken
content and for card or screen content) the SDK will by default consistently choose the same variation.

Note that you can always select a specific variation using its fully-qualified key (e.g., `resourceWithVariations.v1`)

You can determine which variation the SDK chose via the ResourceManager's selectedVariation(s) routines.

## Runtime interface

### Jargon plugin
After creating the Jovo application (which normally takes place in app/app.js) instantiate the Jargon plugin
and register it wil the application:

```javascript
const { JargonPlugin } = require('@jargon/jovo-plugin')
app.register("Jargon", new JargonPlugin())
```

The Jargon plugin installs an event handler that runs for every requests. That event handler adds a
`JovoJargon` object to the `jovo` object that's passed to your intent handlers.

### JovoJargon

The core class you'll work with. JovoJargon has methods that mirror the equivalent Jovo methods for
constructing a response, but changes string parameters containing content presented to users to RenderItems.

```typescript
/**
 * JovoJargon contains Jargon's additions to the core Jovo framework
 * class.
 */
export interface JovoJargon {
  /** The resource manager for the current request */
  rm: ResourceManager

  /** Responds with the given text and ends session
   * @param {RenderItem} speech The item to render for the speech content
   */
  tell (speech: RenderItem): Promise<void>

  /**
   * Says speech and waits for answer from user.
   * Reprompt when user input fails.
   * Keeps session open.
   * @param {RenderItem} speech The item to render for the speech content
   * @param {RenderItem} repromptSpeech The item to render for the reprompt content
   */
  ask (speech: RenderItem, repromptSpeech?: RenderItem): Promise<void>

  /** Shows simple card to response
   * @param {RenderItem} title The item to render for the card's title
   * @param {RenderItem} content The item to render for the card's content
   */
  showSimpleCard (title: RenderItem, content: RenderItem): Promise<void>

  /** Shows image card to response
   * @param {RenderItem} title The item to render for the card's title
   * @param {RenderItem} content The item to render for the card's content
   * @param {string} imageUrl The URL for the image. Must be https
   */
  showImageCard (title: RenderItem, content: RenderItem, imageUrl: string): Promise<void>
}
```

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

handlerInput.jrb.speak(ri('sayHello', { 'name': 'World' }))
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
Internally `JovoJargon` uses a `ResourceManager` to render strings and objects. You
can directly access the resource manager if desired, for use cases such as:
* obtaining locale-specific values that are used as parameters for later rendering operations
* incrementally or conditionally constructing complex content
* response directives that internally have locale-specific content (such as an upsell directive)
* batch rendering of multiple resources
* determining which variation the ResourceManager chose

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

`ResourceManager` is part of the package [@jargon/sdk-core](https://github.com/JargonInc/jargon-sdk-nodejs/tree/master/packages/sdk-core),
and can be used directly from code that isn't based on the Jovo framework.
