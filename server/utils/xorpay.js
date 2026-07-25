const crypto = require('crypto');

const AID = process.env.XORPAY_AID;
const SECRET = process.env.XORPAY_SECRET;
const BASE_URL = 'https://xorpay.com/api/pay';

/**
 * 生成 XorPay 签名
 * 签名规则：MD5(name + pay_type + price + order_id + notify_url + secret)
 * 纯 value 拼接，不包含 + 号
 */
function sign(params) {
  const raw = params.name + params.pay_type + params.price + params.order_id + params.notify_url + SECRET;
  return crypto.createHash('md5').update(raw, 'utf8').digest('hex');
}

/**
 * 创建支付订单，返回支付宝二维码链接
 */
async function createQrCode({ orderId, title, amount, notifyUrl }) {
  const params = {
    name: title,
    pay_type: 'alipay',
    price: amount,
    order_id: orderId,
    notify_url: notifyUrl,
  };

  params.sign = sign(params);

  const formData = new URLSearchParams(params).toString();

  const response = await fetch(`${BASE_URL}/${AID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });

  const result = await response.json();

  if (result.status !== 'ok') {
    const errMsg = {
      no_contract: '未签约支付通道',
      no_alipay_contract: '未签约支付宝',
      missing_argument: '缺少参数',
      app_off: '账号被冻结',
      aid_not_exist: 'AppID 不存在',
      pay_type_error: '支付类型错误',
      sign_error: '签名错误',
      order_payed: '订单已支付',
      order_expire: '订单已过期',
      fee_error: '余额不足',
      order_exist: '订单号重复',
      alipay_api_error: '支付宝接口错误',
    }[result.status] || result.status;

    throw new Error(`XorPay: ${errMsg}`);
  }

  return {
    qrCode: result.info.qr,
    aoid: result.aoid,
    expireIn: result.expires_in || 7200,
  };
}

/**
 * 验证 XorPay 回调签名
 */
function verifyCallbackSign(params) {
  const receivedSign = params.sign;
  const computedSign = sign({
    name: params.name || '',
    pay_type: params.pay_type || '',
    price: params.price || '',
    order_id: params.order_id || '',
    notify_url: params.notify_url || '',
  });
  return receivedSign === computedSign;
}

module.exports = { createQrCode, verifyCallbackSign };