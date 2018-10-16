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

import * as i18n from 'i18next'
// @ts-ignore Types not available
import * as syncBackend from 'i18next-sync-fs-backend'
import { ICU } from './icuFormat'

import { DefaultResourceManagerOptions, RenderItem, ResourceManager, ResourceManagerFactory, ResourceManagerOptions, RenderOptions, SelectedVariation } from '.'

export class I18NextResourceManager implements ResourceManager {
  protected readonly _rv = Math.random()
  protected _selectedVariants: SelectedVariation[] = []

  constructor (protected _translator: i18n.i18n, readonly locale: string, protected _opts: Required<ResourceManagerOptions>) {
  }

  public render (item: RenderItem): Promise<string> {
    let s = this._translator.t(item.key, item.params)
    if (typeof s === 'string') {
      return Promise.resolve(s)
    } else if (typeof s === 'object') {
      let key = this.selectKey(Object.keys(s), item.options)
      let v = s[key]
      let fk = `${item.key}.${key}`
      if (typeof v !== 'string') {
        return Promise.reject(new Error(`Unexpected type ${typeof v} for item key ${fk}`))
      }
      if (this._opts.trackSelectedVariations) {
        let sv: SelectedVariation = {
          item: item,
          key: fk,
          variationKey: v
        }
        this._selectedVariants.push(sv)
      }
      return Promise.resolve(v)
    }

    return Promise.reject(new Error(`Unexpected type ${typeof s} for item key ${item.key}`))
  }

  public renderBatch (items: RenderItem[]): Promise<string[]> {
    let ps: Promise<string>[] = []
    for (const i of items) {
      ps.push(this.render(i))
    }

    return Promise.all(ps)
  }

  public renderObject<T> (item: RenderItem): Promise<T> {
    let obj = this._translator.t(item.key, item.params)
    let t = typeof obj
    if (t === 'object' || t === 'string' || t === 'boolean' || t === 'number') {
      return Promise.resolve(obj)
    }

    return Promise.reject(new Error(`Unexpected type ${t} for item key ${item.key}`))
  }

  public selectedVariation (item: RenderItem): Promise<SelectedVariation> {
    let v = this._selectedVariants.filter(i => i.item === item)
    if (v.length === 0) {
      return Promise.reject(new Error('Item was not used for any render calls that selected a variation'))
    }

    return Promise.resolve(v[0])
  }

  public selectedVariations (): Promise<SelectedVariation[]> {
    return Promise.resolve(this._selectedVariants)
  }

  protected selectKey (keys: string[], opts?: RenderOptions): string {
    let rv = this._rv
    if (opts && opts.forceNewRandom || !this._opts.consistentRandom) {
      rv = Math.random()
    }

    let i = Math.floor(rv * keys.length)
    return keys[i]
  }
}

export class I18NextResourceManagerFactory implements ResourceManagerFactory {
  private _opts: Required<ResourceManagerOptions>
  constructor (options: ResourceManagerOptions) {
    this._opts = Object.assign({}, DefaultResourceManagerOptions, options)

    this.baseTranslator = i18n
      .use(syncBackend)
      .use(new ICU({}))
      .init({
        backend: {
          loadPath: './resources/{{lng}}.json'
        },
        debug: false,
        fallbackLng: [],
        initImmediate: false,
        preload: this._opts.localesToPreload,
        returnObjects: true
      })
  }

  public forLocale (locale: string): ResourceManager {
    let ii = this.baseTranslator.cloneInstance().init({
      lng: locale
    })

    return new I18NextResourceManager(ii, locale, this._opts)
  }

  private baseTranslator: i18n.i18n
}
