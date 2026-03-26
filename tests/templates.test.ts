import { describe, expect, it } from 'bun:test'
import { renderTemplate } from '../src/templates/render'

describe('renderTemplate', () => {
  it('renders event, userId, payload tokens, subject, and html', async () => {
    const result = await renderTemplate(
      'Order {{ payload.orderId }} for {{ userId }} on {{ event }}',
      {
        event: 'order.paid',
        userId: 'user_1',
        payload: {
          orderId: 'ord_1',
        },
      },
    )

    expect(result.subject).toContain('order.paid')
    expect(result.text).toContain('ord_1')
    expect(result.text).toContain('user_1')
    expect(result.text).toContain('order.paid')
    expect(result.html).toContain('user_1')
  })

  it('handles missing payload tokens gracefully', async () => {
    const result = await renderTemplate('Order {{ payload.missing }}', {
      event: 'order.paid',
      userId: 'user_1',
      payload: {},
    })

    expect(result.text).toBe('Order ')
  })

  it('supports empty templates', async () => {
    const result = await renderTemplate('', {
      event: 'order.paid',
      userId: 'user_1',
    })

    expect(result.text).toBe('')
    expect(result.html).toBe('<p></p>')
  })

  it('stringifies unsupported payload values safely', async () => {
    const result = await renderTemplate('Value: {{ payload.amount }}', {
      event: 'order.paid',
      userId: 'user_1',
      payload: {
        amount: BigInt(42),
      },
    })

    expect(result.text).toContain('42')
  })

  it('escapes html output while preserving text output', async () => {
    const result = await renderTemplate('Unsafe {{ payload.value }}', {
      event: 'order.paid',
      userId: 'user_1',
      payload: {
        value: '<script>alert(1)</script>',
      },
    })

    expect(result.text).toContain('<script>alert(1)</script>')
    expect(result.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  })
})
