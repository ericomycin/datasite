export default async function handler(req, res) {
  try {

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(204).end();
    }

    //Method not allowed
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Invalid Request' });
    }

    let body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { reference, amount } = body || {};

    if (!reference) {
      return res.status(400).json({ success: false, message: 'Missing reference' });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    //No secret key
    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message: 'Not allowed'
      });
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const payload = await response.json();

    console.log("PAYSTACK RESPONSE:", payload);

    if (!payload?.data || payload.data.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment not verified',
      });
    }

    if (amount && payload.data.amount !== Number(amount) * 100) {
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified',
      data: payload.data,
    });

  } catch (error) {
    console.error("ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}