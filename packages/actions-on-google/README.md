# Jargon SDK for Actions on Google (nodejs)

The Jargon SDK makes it easy for action developers to manage their runtime content, and to support
multiple languages from within their action.

Need help localizing your actions to new languages and locales? Contact Jargon at localization@jargon.com.

- [Jargon SDK for Actions on Google (nodejs)](#jargon-sdk-for-actions-on-google-nodejs)
  - [Requirements](#requirements)
  - [Core concepts](#core-concepts)
    - [Content resources and resource files](#content-resources-and-resource-files)
    - [Resource value format](#resource-value-format)
      - [Named parameters](#named-parameters)
      - [Plural forms](#plural-forms)
      - [Gendered forms](#gendered-forms)
    - [Variations](#variations)
  - [Runtime interface](#runtime-interface)
    - [ResponseFactory](#responsefactory)
    - [RenderItem](#renderitem)
    - [JargonDialogflowApp and JargonActionsSdkApp](#jargondialogflowapp-and-jargonactionssdkapp)
    - [ResourceManager](#resourcemanager)
    - [Built-in Resources](#built-in-resources)
  - [Adding to an existing skill](#adding-to-an-existing-skill)
    - [Installation](#installation)
    - [Externalize resources](#externalize-resources)
    - [Use the Jargon response factory to create response objects](#use-the-jargon-response-factory-to-create-response-objects)

## Requirements

This version of the SDK works with Google Assistant actions that are built using the [Actions on Gooogle client library](https://github.com/actions-on-google/actions-on-google-nodejs).

The Jargon SDK makes use of Javascript features supported by Node version 8 and later. When deploying on Google / Firebase cloud functions make sure you're selecting the appropriate engine in your package.json:

```json
  "engines": {
    "node": "8"
  }
```

Like the Actions on Google support library, the Jargon SDK is built using [TypeScript](https://www.typescriptlang.org/index.html),
and includes typing information in the distribution package.

## Core concepts

### Content resources and resource files
Content resources define the text that your action outputs to users, via Google Assistant's voice, card content,
or screen content. It's important that these resources live outside of your action's source code to
make it possible to localize them into other languages.

The Jargon SDK expects resource files to live in the "resources" subdirectory within your fulfillment
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
It's important for Google Assistant Actions to vary the words they use in response to users, lest they sound robotic. The Jargon SDK
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

### ResponseFactory
`ResponseFactory` makes it easy to construct responses that have content managed through the Jargon SDK.
It contains methods that mirror the constructors of the Actions on Google response objects, with modified
Options objects that take `RenderItem`s (described below) instead of raw string parameters.

```typescript
/**
 * ResponseFactory simplifies the construction of response objects via the Jargon
 * SDK. The various options objects mirror the constructors for the associated Actions
 * on Google response objects, but take RenderItems instead of raw string parameters for
 * content that is spoken or displayed to the end user.
 *
 * Note that all of the methods in ResponseFactory return a Promise to the response object.
 */
export interface ResponseFactory {
  basicCard (options: JBasicCardOptions): Promise<BasicCard>
  browseCarouselItem (options: JBrowseCarouselItemOptions): Promise<BrowseCarouselItem>
  button (options: JButtonOptions): Promise<Button>
  image (options: JImageOptions): Promise<Image>
  linkOutSuggestion (options: JLinkOutSuggestionOptions): Promise<LinkOutSuggestion>
  mediaObject (options: JMediaObjectOptions): Promise<MediaObject>
  simple (options: JSimpleResponseOptions | RenderItem): Promise<SimpleResponse>
  suggestions (...suggestions: RenderItem[]): Promise<Suggestions>
  table (options: JTableOptions): Promise<Table>
  tableColumn (column: JTableColumn): Promise<TableColumn>
  tableRow (row: JTableRow): Promise<TableRow>
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
### JargonDialogflowApp and JargonActionsSdkApp

`JargonDialogflowApp` and `JargonActionsSdkApp` are the main entry point to the Jargon SDK. You should
use the version that corresponds with the API your action is written against (likely Dialogflow). These
objects install middleware that create the Jargon SDK's per request objects, which are added to the conversation
object passed to your intent handlers.

```typescript
// Jargon extensions to the base Actions on Google Conversation
export interface Conversation<TUserStorage> {
  jargonResourceManager: ResourceManager
  jrm: ResourceManager

  jargonResponseFactory: ResponseFactory
  jrf: ResponseFactory
}
```

Initializing the Jargon SDK is simple:

```javascript
const { JargonDialogflowApp } = require('@jargon/actions-on-google')

// Standard dialogflow app instantiation
const app = dialogflow()

// Install the Jargon SDK onto the application
new JargonDialogflowApp().installOnto(app)
```

### ResourceManager
Internally `ResponseFactory` uses a `ResourceManager` to render strings and objects. You
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
and can be used directly from code that isn't based on the Actions on Google support library.

### Built-in Resources

This SDK includes default responses for some common scenarios. These responses are available using the following `RenderItem` keys:
* `Jargon.unhandledResponse` -- provides a response for when you can't otherwise process an intent
* `Jargon.defaultReprompt` -- provides a generic reprompt

You can render these resources as you would any of your own. You can also define your own version for these keys in your resource file to override the Jargon-provided responses.

Currently the SDK includes variants of these resources for English, with other languages coming soon.

## Adding to an existing skill

### Installation
First add the Jargon SDK as a dependency of your function code (action_root/function/)
  * npm i --save @jargon/actions-on-google
  * yarn add @jargon/actions-on-google

Next, install Jargon's skill builder onto your Dialogflow or Actions SDK application
```javascript
// Import the Jargon SDK
const Jargon = require('@jargon/alexa-skill-sdk')

// Installation -- Dialogflow
const app = ...
new Jargon.JargonDialogflowApp().installOnto(app)

// Installation -- Actions SDK
const app = ...
new Jargon.JargonActionsSdkApp().installOnto(app)
```

### Externalize resources
The content that your skill outputs via ask(), etc., needs to move from wherever
it currently lives in to Jargon resource files. That's currently a manual step, but in the future
we'll have tools to help automate portions of the process.

Resource files go under action_root/functions/resources, and are named by the locale they contain
content for (e.g., "en-US.json").

### Use the Jargon response factory to create response objects
The conversation object passed to your application's intent handlers includes a reference to the locale-specific
Jargon `ResponseFactory`
* `conv.jrf`
* `conv.jargonResponseFactory`

Feel free to move to the Jargon response factory incrementally.



