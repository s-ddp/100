export default class YooKassa {
  constructor(_config) {}
  async createPayment(payload) {
    return {
      id: `yk-${Date.now()}`,
      status: 'pending',
      confirmation: { confirmation_url: payload?.confirmation?.return_url ?? '' },
      amount: payload?.amount ?? { value: '0.00', currency: 'RUB' },
      metadata: payload?.metadata ?? {},
    };
  }
}
