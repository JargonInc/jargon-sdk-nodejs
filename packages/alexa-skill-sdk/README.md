# Jargon SDK for Amazon Alexa (nodejs)

The Jargon SDK makes it easy for skill developers to manage their runtime content, and to support
multiple languages from within their skill.

Need help localizing your skills to new languages and locales? Contact Jargon at localization@jargon.com.

- [Jargon SDK for Amazon Alexa (nodejs)](#jargon-sdk-for-amazon-alexa-nodejs)
  - [Requirements](#requirements)
  - [Core concepts](#core-concepts)
    - [Content resources and resource files](#content-resources-and-resource-files)
    - [Resource value format](#resource-value-format)
      - [Named parameters](#named-parameters)
      - [Plural forms](#plural-forms)
      - [Gendered forms](#gendered-forms)
    - [Variations](#variations)
  - [Runtime interface](#runtime-interface)
    - [JargonResponseBuilder](#jargonresponsebuilder)
    - [RenderItem](#renderitem)
    - [JargonSkillBuilder](#jargonskillbuilder)
    - [ResourceManager](#resourcemanager)
  - [Adding to an existing skill](#adding-to-an-existing-skill)
    - [Installation](#installation)
    - [Externalize resources](#externalize-resources)
    - [Switch over to the Jargon response builder](#switch-over-to-the-jargon-response-builder)
  - [Setting up a new skill](#setting-up-a-new-skill)

## Requirements

This version of the SDK works with Amazon Alexa skills that are built using the [ASK SDK v2 for Node.js](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.0.x/ask-sdk).

Like the ASK SDK, the Jargon SDK is built using [TypeScript](https://www.typescriptlang.org/index.html),
and includes typing information in the distribution package (but you're under no obligation to use
TypeScript to build your skill).

Your Lambda function should be using the [nodejs8.10 runtime](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html),
or a later version (when available).

## Core concepts

### Content resources and resource files
Content resources define the text that your skill outputs to users, via Alexa's voice, card content,
or screen content. It's important that these resources live outside of your skill's source code to
make it possible to localize them into other languages.

The Jargon SDK expects resource files to live in the "resources" subdirectory within your lambda
code (i.e., skill_root/lambda/custom/resources). Each locale has a single resource file, named for
that locale (e.g., "en-US.json").

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
It's important for Alexa skills to vary the words they use in response to users, lest they sound robotic. The Jargon SDK
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

### JargonResponseBuilder
The core class you'll work with. JargonResponseBuilder mirrors the ASK SDK response builder, but changes string
parameters containing content presented to users to RenderItems (see below).

By default the `speak` and `reprompt` methods replace the content from previous calls to those methods; this behavior mirrors
that of corresponding ASK SDK methods. There are two ways to change this behavior such to multiple calls to result in content
getting merged (with a space in between) instead of replaced:
1. When constructing the `JargonSkillBuilder` (described below) pass in an options object with `mergeSpeakAndReprompt` set to true
1. Set the `merge` parameter to the `speak` or `reprompt` method to true

When `mergeSpeakAndReprompt` is true the default replace behavior can be used for specific calls to `speak` or `reprompt` by
setting the `merge` parameter to false.

Note that each individual call to `speak` or `reprompt` should contain content that can stand alone (e.g., a full sentence or
paragraph) to minimize the chances that the order of the content would change across languages.

```typescript
export interface JargonResponseBuilder {
  /**
   * Has Alexa say the provided speech to the user
   * @param {RenderItem} speechOutput The item to render for the speech content
   * @param {boolean} merge If provided, overrides the mergeSpeakAndReprompt setting in the response builder's options.
   * True merges the rendered content with previously rendered content; false replaces any previous content
   * @returns {ResponseBuilder}
   */
  speak (speechOutput: RenderItem, merge?: boolean): this
  /**
   * Has alexa listen for speech from the user. If the user doesn't respond within 8 seconds
   * then has alexa reprompt with the provided reprompt speech
   * @param {RenderItem} repromptSpeechOutput The item to render for the reprompt content
   * @param {boolean} merge If provided, overrides the mergeSpeakAndReprompt setting in the response builder's options
   * True merges the rendered content with previously rendered content; false replaces any previous content
   * @returns {ResponseBuilder}
   */
  reprompt (repromptSpeechOutput: RenderItem, merge?: boolean): this
  /**
   * Renders a simple card with the following title and content
   * @param {RenderItem} cardTitle
   * @param {RenderItem} cardContent
   * @returns {JargonResponseBuilder}
   */
  withSimpleCard (cardTitle: RenderItem, cardContent: RenderItem): this
  /**
   * Renders a standard card with the following title, content and image
   * @param {RenderItem} cardTitle
   * @param {RenderItem} cardContent
   * @param {string} smallImageUrl
   * @param {string} largeImageUrl
   * @returns {JargonResponseBuilder}
   */
  withStandardCard (cardTitle: RenderItem, cardContent: RenderItem, smallImageUrl?: string, largeImageUrl?: string): this
    /**
   * Adds a hint directive - show a hint on the screen of the echo show
   * @param {RenderItem} text plain text to show on the hint
   * @returns {JargonResponseBuilder}
   */
  addHintDirective (text: RenderItem): this
  /**
   * Adds a VideoApp play directive to play a video
   *
   * @param {string} source Identifies the location of video content at a remote HTTPS location.
   * The video file must be hosted at an Internet-accessible HTTPS endpoint.
   * @param {RenderItem} title (optional) title that can be displayed on VideoApp.
   * @param {RenderItem} subtitle (optional) subtitle that can be displayed on VideoApp.
   * @returns {JargonResponseBuilder}
   */
  addVideoAppLaunchDirective (source: string, title?: RenderItem, subtitle?: RenderItem): this

  // Additional methods are identical to ResponseBuilder in the ASK SDK
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

### JargonSkillBuilder
`JargonSkillBuilder` wraps the ASK skill builder, and handles all details of initializing the Jargon SDK,
installing request and response interceptors, and so on.
```javascript
const skillBuilder = new Jargon.JargonSkillBuilder().wrap(Alexa.SkillBuilders.custom())
```

### ResourceManager
Internally `JargonResponseBuilder` uses a `ResourceManager` to render strings and objects. You
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
and can be used directly from code that isn't based on ASKv2.

## Adding to an existing skill

### Installation
First add the Jargon SDK as a dependency of your lambda code (skill_root/lambda/custom)
  * npm i --save @jargon/alexa-skill-sdk
  * yarn add @jargon/alexa-skill-sdk

Next, wrap the Alexa skill builder with Jargon's skill builder:
```javascript
// Import the Jargon SDK
const Jargon = require('@jargon/alexa-skill-sdk')

// Wrap the skill builder
const skillBuilder = new Jargon.JargonSkillBuilder().wrap(Alexa.SkillBuilders.custom())
```

### Externalize resources
The content that your skill outputs via speak(), reprompt(), etc., needs to move from wherever
it currently lives in to Jargon resource files. That's currently a manual step, but in the future
we'll have tools to help automate portions of the process.

Resource files go under skill_root/lambda/custom/resources, and are named by the locale they contain
content for (e.g., "en-US.json").

### Switch over to the Jargon response builder
In your skill handlers access the Jargon response builder via one of the following methods:
* `handlerInput.jrb`
* `handlerInput.jargonResponseBuilder`
* `handlerInput.attributesManager.getRequestAttributes().jrb`
* `handlerInput.attributesManager.getRequestAttributes().jargonResponseBuilder`

TypeScript users: you'll need to cast `handlerInput` to `JargonHandlerInput` if you want to use one of
the first two forms.

Feel free to move to the Jargon response builder incrementally; however, you shouldn't mix the use of
the ASK response builder and the Jargon response builder in a single request due to the last-write-wins
behavior of `speak()` and `reprompt()` in the ASK response builder.

## Setting up a new skill

We've "Jargonized" some of the ASK starter templates to simplify creating a new skill. To make use of these templates:
1. Install and setup the [ASK CLI](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html)
   * If you've previously installed the CLI please make sure you're on the latest version by running `npm update -g ask-cli`
   * If this is your first time using the CLI you'll need to first run `ask init` to configure everything
2. Run `ask new --url https://s3.amazonaws.com/jargon-templates/ask-nodejs.json`
3. Select the template you wish to use, and follow the prompts to complete configuring your new skill

Please note that you'll receive a warning message that the template isn't from an official source; in order to create the skill from
the template answer "yes" when prompted. The templates include the same hook scripts as the original Amazon templates; these scripts
ensure that the necessary dependencies are installed (via npm) after creating a new project, and prior to deployment.

If you know which template you'd like to use, in step 2 above you can directly provide its URL:
* Hello World - https://github.com/JargonInc/skill-sample-nodejs-hello-world.git
  * A minimal template showing basic skill functionality
* Trivia - https://github.com/JargonInc/skill-sample-nodejs-trivia.git
  * A more complex skill that stores session state, and makes use of the Jargon's SDK ability to render objects stored in resource files
* Button Colorchanger - https://github.com/JargonInc/skill-sample-nodejs-buttons-colorchanger.git
  * A skill that shows how to interact with Echo buttons, and compose complex responses

Alternatively, you can clone the template repository instead of using the ASK CLI.

Please [file an issue](https://github.com/JargonInc/jargon-sdk-nodejs/issues/new) if you're interested in seeing a template for a different use case, or contact us at [sdk@jargon.com](mailto:sdk@jargon.com) with any suggestions or feedback you might have.
