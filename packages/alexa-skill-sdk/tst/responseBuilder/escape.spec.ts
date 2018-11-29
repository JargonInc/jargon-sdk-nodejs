import { expect } from 'chai'
import { escapeSSML } from '../../lib/responseBuilder/escape'

it('leaves the source string alone', () => {
  const s = '<foo></foo>'
  const e = escapeSSML(s)
  expect(e).equals(s)
})

it('converts ampersands', () => {
  const s = '<foo>1&2</foo>'
  const e = escapeSSML(s)
  expect(e).equals('<foo>1&amp;2</foo>')
})

it('leaves escapted ampersands unchanged', () => {
  const s = '<foo>1&amp;2</foo>'
  const e = escapeSSML(s)
  expect(e).equals('<foo>1&amp;2</foo>')
})
