const AlipaySdk = require('alipay-sdk').AlipaySdk || require('alipay-sdk').default;

const alipay = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID,
  privateKey: process.env.ALIPAY_PRIVATE_KEY,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
  gateway: 'https://openapi.alipay.com/gateway.do',
  signType: 'RSA2',
});

// 生成付款二维码
async function createQrCode({ orderId, title, amount }) {
  const result = await alipay.exec('alipay.trade.precreate', {
    bizContent: {
      out_trade_no: orderId,
      total_amount: amount,
      subject: title,
      timeout_express: '10m',
    },
  });
  return { qrCode: result.qrCode, orderId: result.outTradeNo };
}

// 查询支付状态
async function queryOrder(orderId) {
  const result = await alipay.exec('alipay.trade.query', {
    bizContent: { out_trade_no: orderId },
  });
  const map = {
    WAIT_BUYER_PAY: 'WAITING',
    TRADE_SUCCESS: 'SUCCESS',
    TRADE_FINISHED: 'SUCCESS',
    TRADE_CLOSED: 'CLOSED',
  };
  return { status: map[result.tradeStatus] || 'WAITING' };
}

module.exports = { createQrCode, queryOrder };