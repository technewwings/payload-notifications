import { describe, expect, it } from 'bun:test'
import { compile, render, renderTemplate } from '../src/templates/engine'

describe('template engine', () => {
  describe('compile', () => {
    it('compiles a simple variable template', () => {
      const result = compile('Hello {{ name }}')
      expect(result.ast).toHaveLength(2)
      expect(result.ast[0]).toEqual({ type: 'text', value: 'Hello ' })
      expect(result.ast[1]).toMatchObject({ type: 'variable', path: 'name', raw: false })
    })

    it('compiles raw triple-brace variables', () => {
      const result = compile('Hello {{{ name }}}')
      expect(result.ast[1]).toMatchObject({ type: 'variable', path: 'name', raw: true })
    })

    it('compiles if/else blocks', () => {
      const result = compile('{{#if show}}yes{{else}}no{{/if}}')
      expect(result.ast).toHaveLength(1)
      expect(result.ast[0]).toMatchObject({
        type: 'if',
        path: 'show',
      })
      const ifNode = result.ast[0] as Extract<(typeof result.ast)[0], { type: 'if' }>
      expect(ifNode.body).toHaveLength(1)
      expect(ifNode.elseBody).toHaveLength(1)
    })

    it('compiles each blocks', () => {
      const result = compile('{{#each items}}{{ this }}{{/each}}')
      expect(result.ast).toHaveLength(1)
      expect(result.ast[0]).toMatchObject({ type: 'each', path: 'items' })
    })

    it('compiles formatter expressions', () => {
      const result = compile('{{ uppercase name }}')
      expect(result.ast[0]).toMatchObject({
        type: 'variable',
        path: 'name',
        formatter: { name: 'uppercase', args: [] },
      })
    })

    it('compiles formatter with args', () => {
      const result = compile('{{ currency amount "EUR" }}')
      expect(result.ast[0]).toMatchObject({
        type: 'variable',
        path: 'amount',
        formatter: { name: 'currency', args: ['EUR'] },
      })
    })

    it('compiles default value expressions', () => {
      const result = compile('{{ name | default "Guest" }}')
      expect(result.ast[0]).toMatchObject({
        type: 'variable',
        path: 'name',
        defaultValue: 'Guest',
      })
    })

    it('throws on unclosed expressions', () => {
      expect(() => compile('Hello {{ name')).toThrow('Unclosed expression')
    })

    it('throws on unclosed raw expressions', () => {
      expect(() => compile('Hello {{{ name')).toThrow('Unclosed raw expression')
    })

    it('throws on unclosed blocks', () => {
      expect(() => compile('{{#if show}}yes')).toThrow('Unclosed block')
    })

    it('throws on exceeding max nesting depth', () => {
      expect(() =>
        compile(
          '{{#if a}}{{#if b}}{{#if c}}{{#if d}}{{#if e}}{{#if f}}x{{/if}}{{/if}}{{/if}}{{/if}}{{/if}}{{/if}}',
          { maxDepth: 3 },
        ),
      ).toThrow('nesting exceeds maximum depth')
    })

    it('blocks forbidden patterns for security', () => {
      expect(() => compile('{{ new Date() }}')).toThrow('security violation')
      expect(() => compile('{{ import("fs") }}')).toThrow('security violation')
      expect(() => compile('{{ eval("code") }}')).toThrow('security violation')
      expect(() => compile('{{ constructor }}')).toThrow('security violation')
      expect(() => compile('{{ __proto__ }}')).toThrow('security violation')
    })
  })

  describe('render', () => {
    it('renders simple variable interpolation', () => {
      const compiled = compile('Hello {{ name }}!')
      expect(render(compiled, { name: 'World' })).toBe('Hello World!')
    })

    it('renders nested property access', () => {
      const compiled = compile('Order: {{ order.id }}')
      expect(render(compiled, { order: { id: 'ORD-123' } })).toBe('Order: ORD-123')
    })

    it('renders deep nested paths', () => {
      const compiled = compile('{{ a.b.c.d }}')
      expect(render(compiled, { a: { b: { c: { d: 'deep' } } } })).toBe('deep')
    })

    it('renders array index access', () => {
      const compiled = compile('{{ items.0.name }}')
      expect(render(compiled, { items: [{ name: 'first' }] })).toBe('first')
    })

    it('renders empty string for missing values', () => {
      const compiled = compile('Hello {{ missing }}!')
      expect(render(compiled, {})).toBe('Hello !')
    })

    it('renders default values for missing properties', () => {
      const compiled = compile('Hello {{ name | default "Guest" }}!')
      expect(render(compiled, {})).toBe('Hello Guest!')
    })

    it('does not use default when value is present', () => {
      const compiled = compile('Hello {{ name | default "Guest" }}!')
      expect(render(compiled, { name: 'Alice' })).toBe('Hello Alice!')
    })

    it('HTML-escapes variables by default', () => {
      const compiled = compile('{{ content }}')
      expect(render(compiled, { content: '<script>alert("xss")</script>' })).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
      )
    })

    it('renders raw (unescaped) with triple braces', () => {
      const compiled = compile('{{{ content }}}')
      expect(render(compiled, { content: '<b>bold</b>' })).toBe('<b>bold</b>')
    })

    it('renders if/else blocks correctly', () => {
      const compiled = compile('{{#if show}}visible{{else}}hidden{{/if}}')
      expect(render(compiled, { show: true })).toBe('visible')
      expect(render(compiled, { show: false })).toBe('hidden')
      expect(render(compiled, {})).toBe('hidden')
    })

    it('treats empty arrays as falsy in if blocks', () => {
      const compiled = compile('{{#if items}}has items{{else}}empty{{/if}}')
      expect(render(compiled, { items: [] })).toBe('empty')
      expect(render(compiled, { items: [1] })).toBe('has items')
    })

    it('treats 0 and empty string as falsy', () => {
      const compiled = compile('{{#if count}}yes{{else}}no{{/if}}')
      expect(render(compiled, { count: 0 })).toBe('no')
      expect(render(compiled, { count: '' })).toBe('no')
      expect(render(compiled, { count: 1 })).toBe('yes')
    })

    it('renders if blocks without else', () => {
      const compiled = compile('before{{#if show}} middle{{/if}} after')
      expect(render(compiled, { show: true })).toBe('before middle after')
      expect(render(compiled, { show: false })).toBe('before after')
    })

    it('renders each loops', () => {
      const compiled = compile('{{#each items}}{{ this }},{{/each}}')
      expect(render(compiled, { items: ['a', 'b', 'c'] })).toBe('a,b,c,')
    })

    it('renders each with object items', () => {
      const compiled = compile('{{#each users}}{{ name }};{{/each}}')
      expect(
        render(compiled, {
          users: [{ name: 'Alice' }, { name: 'Bob' }],
        }),
      ).toBe('Alice;Bob;')
    })

    it('provides @index, @first, @last in each loops', () => {
      const compiled = compile('{{#each items}}{{@index}}:{{ this }}{{#if @last}}.{{/if}}{{/each}}')
      expect(render(compiled, { items: ['a', 'b', 'c'] })).toBe('0:a1:b2:c.')
    })

    it('handles empty arrays in each', () => {
      const compiled = compile('{{#each items}}{{ this }}{{/each}}')
      expect(render(compiled, { items: [] })).toBe('')
    })

    it('handles non-array values in each', () => {
      const compiled = compile('{{#each items}}{{ this }}{{/each}}')
      expect(render(compiled, { items: 'not an array' })).toBe('')
    })

    it('renders nested blocks', () => {
      const compiled = compile('{{#each users}}{{#if active}}{{ name }}{{/if}}{{/each}}')
      expect(
        render(compiled, {
          users: [
            { name: 'Alice', active: true },
            { name: 'Bob', active: false },
            { name: 'Carol', active: true },
          ],
        }),
      ).toBe('AliceCarol')
    })

    it('stringifies numbers and booleans', () => {
      const compiled = compile('{{ count }} {{ active }}')
      expect(render(compiled, { count: 42, active: true })).toBe('42 true')
    })

    it('JSON-stringifies objects', () => {
      const compiled = compile('{{ data }}')
      expect(render(compiled, { data: { key: 'val' } })).toBe('{&quot;key&quot;:&quot;val&quot;}')
    })
  })

  describe('formatters', () => {
    it('uppercase formatter', () => {
      const result = renderTemplate('{{ uppercase name }}', { name: 'hello' })
      expect(result).toBe('HELLO')
    })

    it('lowercase formatter', () => {
      const result = renderTemplate('{{ lowercase name }}', { name: 'HELLO' })
      expect(result).toBe('hello')
    })

    it('capitalize formatter', () => {
      const result = renderTemplate('{{ capitalize name }}', { name: 'hello world' })
      expect(result).toBe('Hello world')
    })

    it('truncate formatter with default length', () => {
      const longStr = 'a'.repeat(100)
      const result = renderTemplate('{{ truncate text }}', { text: longStr })
      expect(result).toBe('a'.repeat(50) + '...')
    })

    it('truncate formatter with custom length', () => {
      const result = renderTemplate('{{ truncate text "10" }}', {
        text: 'hello world, this is long',
      })
      expect(result).toBe('hello worl...')
    })

    it('currency formatter', () => {
      const result = renderTemplate('{{ currency amount "USD" }}', { amount: 99.99 })
      expect(result).toContain('99.99')
    })

    it('currency formatter with EUR', () => {
      const result = renderTemplate('{{ currency amount "EUR" }}', { amount: 42 })
      expect(result).toContain('42')
    })

    it('date formatter', () => {
      const result = renderTemplate('{{ date created "MMM d, yyyy" }}', {
        created: '2026-01-15T12:00:00Z',
      })
      expect(result).toContain('2026')
      expect(result).toContain('Jan')
    })

    it('date formatter handles invalid dates', () => {
      const result = renderTemplate('{{ date created }}', { created: 'not-a-date' })
      expect(result).toBe('not-a-date')
    })

    it('currency formatter handles non-numeric values', () => {
      const result = renderTemplate('{{ currency amount "USD" }}', { amount: 'not-a-number' })
      expect(result).toBe('not-a-number')
    })
  })

  describe('renderTemplate convenience function', () => {
    it('compiles and renders in one call', () => {
      const result = renderTemplate('Hello {{ name }}!', { name: 'World' })
      expect(result).toBe('Hello World!')
    })

    it('accepts compile options', () => {
      expect(() =>
        renderTemplate('{{#if a}}{{#if b}}x{{/if}}{{/if}}', { a: true, b: true }, { maxDepth: 1 }),
      ).toThrow('nesting exceeds maximum depth')
    })
  })

  describe('backward compatibility', () => {
    it('handles basic {{ event }} and {{ userId }} tokens like old renderer', () => {
      const result = renderTemplate('Event: {{ event }}, User: {{ userId }}', {
        event: 'order.paid',
        userId: 'user_1',
      })
      expect(result).toBe('Event: order.paid, User: user_1')
    })

    it('handles {{ payload.key }} tokens like old renderer', () => {
      const result = renderTemplate('Order: {{ payload.orderId }}', {
        payload: { orderId: 'ORD-123' },
      })
      expect(result).toBe('Order: ORD-123')
    })
  })
})
