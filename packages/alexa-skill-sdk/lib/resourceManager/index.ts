/*
 * Copyright 2018 Jargon, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

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

/**
 * Constructs ResourceManager instances for a specific locale
 */
export interface ResourceManagerFactory {
  /** Constructs a ResourceManager for the specified locale
   * @param {string} locale
   */
  forLocale (locale: string): ResourceManager
}

/**
 * Exposes the core methods needed for runtime resource handling,
 * specifically the rendering of locale-specific strings based
 * on an input key and optional parameters
 */
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

/**
 * Parameters used when rendering a resource. Keys must be
 * strings, and values either strings or numbers
 */
export interface RenderParams {
  [param: string]: string | number
}

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

/**
 * An item to render
 */
export interface RenderItem {
  /** The resource key to render */
  key: string
  /** Params to use during rendering (optional) */
  params?: RenderParams
  /** Render options (optional) */
  options?: RenderOptions
}

/**
 * Helper function for constructing a RenderItem
 * @param key The resource key to render
 * @param params Optional params for the render operation
 * @param options Options for the rendering operation
 */
export function ri (key: string, params?: RenderParams, options?: RenderOptions): RenderItem {
  return {
    key: key,
    params: params,
    options: options
  }
}

export interface SelectedVariation {
  /** The RenderItem instance passed to render(Batch) */
  readonly item: RenderItem
  /** The full key of the selected variation (i.e., this.ri.key + '.' + this.variationKey) */
  readonly key: string
  /** The selected variation subkey */
  readonly variationKey: string
}

export * from './i18next'
