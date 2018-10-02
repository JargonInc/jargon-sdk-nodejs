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

const ampRegex = /&/
const amp = '&amp;'

export function escapeSSML (s: string): string {
  let match = ampRegex.exec(s)
  if (!match) {
    return s
  }

  let output = ''
  let i = 0
  let li = 0

  for (i = match.index; i < s.length; i++) {
    if (s.charAt(i) === '&') {
      if (li !== i) {
        // Add intervening text
        output += s.substring(li, i)
      }

      li = i + 1
      output += amp
    }
  }

  if (li !== i) {
    // Add trailing text
    output += s.substring(li, i)
  }

  return output
}
