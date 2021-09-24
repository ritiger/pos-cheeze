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
});



function getAllProductsReq() {
    return $.ajax({
        url: 'api.php?action=get-products',
    });
}