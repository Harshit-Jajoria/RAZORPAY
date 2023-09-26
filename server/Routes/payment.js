const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');


const values={
  key_id: 'rzp_test_NJdtyJFDDMYWob',
  key_secret:'xvWBtZFb4shoK08eNNN45XPt'
}


router.post('/orders', async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: values.key_id,
      key_secret: values.key_secret,
    });

    const options = {
      amount: req.body.amount * 100,
      currency: 'INR',
      receipt: crypto.randomBytes(10).toString('hex'),
    };

    instance.orders.create(options, (error, order) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something Went Wrong!', error });
      }
      res.status(200).json({ data: order });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error!', error });
  }
});



router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', values.key_secret)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment verified successfully

      // Fetch payment details from Razorpay using the payment ID
      const instance = new Razorpay({
        key_id: values.key_id,
        key_secret: values.key_secret,
      });

      instance.payments.fetch(razorpay_payment_id, (error, payment) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: 'Error fetching payment details', error });
        }

        // Payment details are available in the `payment` object
        return res.status(200).json({ message: 'Payment verified successfully', payment });
   });
  //  return res.status(200).json({ message: 'Payment verified successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid signature sent!' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error!', error });
  }
});







module.exports = router;
