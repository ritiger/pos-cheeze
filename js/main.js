const FOCUS_BARCODE = 0;
const FOCUS_CASH = 1;
const FOCUS_CARD = 2;
has_focus = 0;

const TARGET_IDS = ['barcode', 'cash-input', 'card-input'];

var curProduct;
var products = [];

$(function() {

    // test
    getAllProductsReq()
        .then(products => console.log(products));

    // when clicking numbers and '.'.
    $('.numpad-number').on('click', function() {
        const target_id = TARGET_IDS[has_focus];

        const prev = $(`#${target_id}`).val();
        const num = $(this).data('num');
        if (prev.includes('.') && num === '.') return;
        $(`#${target_id}`).val(prev + num.toString());
    });

    // when click backspace.
    $('#backspace').on('click', function() {
        const target_id = TARGET_IDS[has_focus];
        const prev = $(`#${target_id}`).val();
        if (prev.length === 0) return;
        $(`#${target_id}`).val(prev.substring(0, prev.length - 1));
    });

    // when clicking 'C' button.
    $('#clear-target').on('click', function() {
        const target_id = TARGET_IDS[has_focus];
        $(`#${target_id}`).val('');
    });

    // when clicking barcode input.
    $('#barcode').on('focus', function() {
        has_focus = FOCUS_BARCODE;
    });

    // when clicking cash input.
    $('#cash-input').on('focus', function(){
        has_focus = FOCUS_CASH;
    });

    // when cash input changes.
    $('#cash-input').on('change keyup', function() {
      updateBalancePrice();
    });

    // when clicking card input.
    $('#card-input').on('focus', function() {
        has_focus = FOCUS_CARD;
    });

    // when cash input changes.
    $('#card-input').on('change keyup', function() {
      updateBalancePrice();
    });

    $('#cash-button').on('click', function() {
      // if no product is selected, then don't run the code below.
      if (!curProduct) {
        alert('Please input a valid barcode!');
        return;
      }

      $('#cash-button').addClass('d-hide');
      $('#cash-card-wrapper').removeClass('d-hide');
    });

    // whenever the user press 'enter' key.
    $('#barcode').on('keypress', function(e) {
      if (e.keyCode === 13) {
        barcodeInputUpdated();
      }
    });

    // when the user click the 'enter' button in the UI keyboard.
    $('#enter-key').on('click', function() {
      barcodeInputUpdated();
    });

    // when clicking 'Payments' button.
    $('#btn-payments').on('click', function() {
      // if any product is not selected, then return;
      if (!curProduct) return;

      const cashAmt = Number($('#cash-input').val());
      const cardAmt = Number($('#card-input').val());
      // check the sum of inputs are equal to product price.
      const totalPrice = Number($('#price-sale').text());
      if (cashAmt + cardAmt !== totalPrice) {
        alert('Price does not match!');
        return;
      }
    
      // compose payload to send to server.
      
      const payload = {
        product_ids: products.map(product => product.RecID),
        totalPrice,
        cash: cashAmt,
        card: cardAmt,
      };

      return addPayment(payload)
        .then(res => {
          if (res.status) {
            initializeStatus();
          }
          alert(res.message);
        });
    });
});


/**
 * This event will be triggered when the user press enter or click UI 'enter' key.
 * Now the logic has been changed. The user must be able to checkout multiple products at a time.
 * Left section will show the added products. Means when the user enter a valid barcode, then the product will be showed in a table in the section section.
 */
function barcodeInputUpdated() {
  const barcode = $('#barcode').val();
  return getProductByBarcode(barcode)
  .then(response => {
    if (response.status) {
      console.log('[Product By Barcode]', response.data);
      curProduct = response.data;
      if (response.data) {
        // show the product info in the web page.
        const product = response.data;
        products.push(product);
        $('#barcode').val('');
        updateLeftSection();
      } else {
        alert('Unable to find the product');
      }
    } else {
      // alert user if the request fails.
      alert(response.message);
    }
  });
}

function updateBalancePrice() {
  const cash = Number($('#cash-input').val() || 0);
  const card = Number($('#card-input').val() || 0);
  const totalPrice = Number($('#price-sale').text());
  const balance = totalPrice - cash - card;
  $('#price-balance').text(balance);
}

function updateLeftSection() {
  let tableBody = '';
  let totalPrice = 0;
  products.forEach((product, i) => {
    let price = Number(product.RetailPrice);
    totalPrice += price;
    tableBody += `
    <div class="item-line border-bottom cross-devide">
      <div class="text-height border-right cross-element truncated">
          ${product.Name}
      </div>
      <div class="text-height border-right cross-element1">
          1
      </div>
      <div class="text-height border-right cross-element1">
          -
      </div>
      <div class="text-height cross-element1">
        ${price.toFixed(2)}
      </div>
    </div>
    `;
  });
  $('#product-rows').html(tableBody);
  $('#price-sale').text(totalPrice.toFixed(2));
  $('#price-balance').text(totalPrice.toFixed(2));
  $('#product-qty').text(products.length);
}

function initializeStatus() {
  products = [];
  updateLeftSection();
  $('#cash-input').val(0);
  $('#card-input').val(0);
  $('#cash-button').removeClass('d-hide');
  $('#cash-card-wrapper').addClass('d-hide');
}

function getAllProductsReq() {
    return $.ajax({
        url: 'api.php?action=get-products',
    });
}

function getProductByBarcode(barcode) {
  const payload = { barcode };
  return $.ajax({
    type: 'POST',
    url: 'api.php?action=get-product-by-barcode',
    data: JSON.stringify(payload),
    contentType: "application/json; charset=utf-8",
  });
}

function addPayment(payload) {
  return $.ajax({
    type: 'POST',
    url: 'api.php?action=add-payment',
    data: JSON.stringify(payload),
    contentType: 'application/json',
  });
}
