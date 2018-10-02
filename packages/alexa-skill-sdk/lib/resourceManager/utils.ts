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

function getLastOfPath (object: any, path: any, Empty?: any) {
  function cleanKey (key: any) {
    return (key && key.indexOf('###') > -1) ? key.replace(/###/g, '.') : key
  }

  function canNotTraverseDeeper () {
    return !object || typeof object === 'string'
  }

  const stack = (typeof path !== 'string') ? [].concat(path) : path.split('.')
  while (stack.length > 1) {
    if (canNotTraverseDeeper()) return {}

    const key = cleanKey(stack.shift())
    if (!object[key] && Empty) object[key] = new Empty()
    object = object[key]
  }

  if (canNotTraverseDeeper()) return {}
  return {
    obj: object,
    k: cleanKey(stack.shift())
  }
}

export function setPath (object: any, path: any, newValue: any) {
  const { obj, k } = getLastOfPath(object, path, Object)

  obj[k] = newValue
}

export function pushPath (object: any, path: any, newValue: any, concat: any) {
  const { obj, k } = getLastOfPath(object, path, Object)

  obj[k] = obj[k] || []
  if (concat) obj[k] = obj[k].concat(newValue)
  if (!concat) obj[k].push(newValue)
}

export function getPath (object: any, path: any) {
  const { obj, k } = getLastOfPath(object, path)

  if (!obj) return undefined
  return obj[k]
}

let arr: any = []
let each = arr.forEach
let slice = arr.slice

export function defaults (obj: any, ...args: any[]) {
  each.call(slice.call(arguments, 1), function (source: any) {
    if (source) {
      for (let prop in source) {
        if (obj[prop] === undefined) obj[prop] = source[prop]
      }
    }
  })
  return obj
}

export function extend (obj: any) {
  each.call(slice.call(arguments, 1), function (source: any) {
    if (source) {
      for (let prop in source) {
        obj[prop] = source[prop]
      }
    }
  })
  return obj
}
