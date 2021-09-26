const FOCUS_BARCODE = 0;
const FOCUS_CASH = 1;
const FOCUS_CARD = 2;
has_focus = 0;

const TARGET_IDS = ['barcode', 'cash-input', 'card-input'];

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

    // when clicking card input.
    $('#card-input').on('focus', function() {
        has_focus = FOCUS_CARD;
    });

    $('#cash-button').on('click', function() {
        $('#cash-button').addClass('d-hide');
        $('#cash-card-wrapper').removeClass('d-hide');
    });

    // whenever the value of barcode input changes.
    $('#barcode').on('change', function() {
      const barcode = $(this).val();
      return getProductByBarcode(barcode)
        .then(response => {
          if (response.status) {
            console.log('[Product By Barcode]', response.data);
            if (response.data) {
              // show the product info in the web page.
              const product = response.data;
              const price = Number(product.RetailPrice);
              $('#price-sale').text(price.toFixed(2));
              $('#price-balance').text(price.toFixed(2));
              $('#product-name').text(product.Name);
            } else {
              $('#price-sale').text('-');
              $('#price-balance').text('-');
              $('#product-name').text('-');
            }
          } else {
            // alert user if the request fails.
            alert(response.message);
          }
        });
    });
});



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