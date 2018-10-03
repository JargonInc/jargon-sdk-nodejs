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

 // Ported from https://github.com/i18next/i18next-icu

import * as utils from './utils'
import IntlMessageFormat from 'intl-messageformat'

function getDefaults (): any {
  return {
    memoize: true,
    memoizeFallback: false
  }
}

export class ICU {
  public type: string
  protected options: any
  protected mem: any
  protected formats: any

  constructor (options: any) {
    this.type = 'i18nFormat'
    this.mem = {}

    this.init(null, options)
  }

  init (i18next: any, options: any) {
    const i18nextOptions = (i18next && i18next.options && i18next.options.i18nFormat) || {}
    this.options = utils.defaults(i18nextOptions, options, this.options || {}, getDefaults())
    this.formats = this.options.formats

    if (i18next) {
      i18next.IntlMessageFormat = IntlMessageFormat
      i18next.ICU = this
    }

    if (this.options.localeData) this.addLocaleData(this.options.localeData)
  }

  addLocaleData (data: any) {
    let locales = Object.prototype.toString.apply(data) === '[object Array]' ? data : [data]

    locales.forEach((localeData: any) => {
      if (localeData && localeData.locale) {
        // @ts-ignore Inaccurate type information
        IntlMessageFormat.__addLocaleData(localeData)
      }
    })
  }

  addUserDefinedFormats (formats: any) {
    this.formats = this.formats ? { ...this.formats, ...formats } : formats
  }

  parse (res: any, options: any, lng: string, ns: string, key: string, info: any) {
    if (typeof res === 'object') {
      return this.parseObject(res, options, lng, ns, key, info)
    } else if (typeof res === 'boolean' || typeof res === 'number') {
      return res
    }

    const hadSuccessfulLookup = info && info.resolved && info.resolved.res

    let fc
    if (this.options.memoize) {
      fc = utils.getPath(this.mem, `${lng}.${ns}.${key}`)
    }
    if (!fc) {
      fc = new IntlMessageFormat(res, lng, this.formats)
      if (this.options.memoize && (this.options.memoizeFallback || !info || hadSuccessfulLookup)) utils.setPath(this.mem, `${lng}.${ns}.${key}`, fc)
    }
    return fc.format(options)
  }

  parseObject (res: object, options: any, lng: string, ns: string, path: string, info: any) {
    let result = {}
    for (let k in res) {
      let key = `${path}.${k}`
      // @ts-ignore
      let val: any = res[k]
      // @ts-ignore
      result[k] = this.parse(val, options, lng, ns, key, info)
    }

    return result
  }

  addLookupKeys (finalKeys: any, key: any, code: any, ns: any, options: any) {
    // no additional keys needed for select or plural
    // so there is no need to add keys to that finalKeys array
    return finalKeys
  }
}
