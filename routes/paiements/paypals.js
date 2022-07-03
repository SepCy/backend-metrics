const paypal = require('paypal-rest-sdk');
const express = require('express');
require("dotenv").config()
const app = express()
const router = express.Router()
const ejs = require('ejs')
const auth = require('../../middlewares/auth');



router.get('/', auth, (req, res) =>res.render('index'))

router.post('/paypal', auth, (req, res) => {
   paypal.configure({
      'mode': 'sandbox', //sandbox or live
      'client_id': 'AetkGJhB6LppNe6V51bO4sFmmsC1hlEjPiVFLskR2bLsqATlV0LhIDnBvXFDxAZrhynDIqx2XSVJqzGL',
      'client_secret': 'EOtHFA_owqr-Urz83E_GmOkyGjVsKH5mSftAfZNC2SmwYjC6FXgZ1uHc22yikhh6R2wc80Pr7sXtiUWS'
   });
   var create_payment_json = {
      "intent": "sale",
      "payer": {
         "payment_method": "paypal"
      },
      "redirect_urls": {
         "return_url": "http://localhost:5000/success",
         "cancel_url": "http://localhost:5000/cancel"
      },
      "transactions": [{
         "item_list": {
            "items": [{
               "name": "item",
               "sku": "item",
               "price": "1.00",
               "currency": "USD",
               "quantity": 1
            }]
         },
         "amount": {
            "currency": "USD",
            "total": "1.00"
         },
         "description": "This is the payment description."
      }]
   };
   
   
   paypal.payment.create(create_payment_json, function (error, payment) {
      if( error ) { throw error } 
      else { 
         let approval_url = payment.links.filter( link => link.rel === 'approval_url');
         // Do something with the approval url
         res.redirect(approval_url[0].href )
      }
   })
})

router.get('/success', auth, (req, res ) => {
   const payerId = req.query.PayerID;
   const paymentId = req.query.paymentId;
   
   const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
         "amount": {
            "currency": "USD",
            "total": "1.00"
         }
      }]
   }
   
   paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
      if (error) { 
         console.log(error.response); 
         throw error;
      } else {
         console.log(JSON.stringify(payment));
         res.send("Payment success!");
      }

      return res.json(payment)
   })
});

router.get('/cancel', (req, res) => {
   res.send('Cancelled')
})


module.exports = router;
