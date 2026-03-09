import { describe, expect, it } from 'bun:test'
import { renderTemplate } from '../src/templates/render'

describe('renderTemplate', () => {
  it('renders event, userId, and payload tokens', async () => {
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

    expect(result.text).toContain('ord_1')
    expect(result.text).toContain('user_1')
    expect(result.text).toContain('order.paid')
  })
})
