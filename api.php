<?php

// database connection


include __DIR__ . DIRECTORY_SEPARATOR . 'lib/functions.php';

if (empty($_GET['action'])) {
    returnJSON([
        'status' => false,
        'message' => 'Invalid API response!',
    ]);
}

$action = $_GET['action'];

if ($action == 'get-products') {
    $products = getAllProducts();
    returnJSON([
        'status' => true,
        'message' => 'success',
        'data' => $products,
    ]);
} else if ($action == 'add-payment') {
    // product_id.
    // cash
    // card

    $req = getJSONRequest();
    $invoice = addPayment($req);

    $response = [
        'status' => true,
        'message' => 'success',
        'route' => 'add-payments',
        'data' => $invoice,
    ];
} else if ($action == 'get-product-by-barcode') {
    $req = getJSONRequest();
    $product = getProductByBarcode($req['barcode']);
    $response = [
        'status' => true,
        'message' => 'success',
        'data' => $product,
    ];
} else {
    $response = [
        'status' => false,
        'message' => 'undefined API',
    ];
//    $objResponse = (object) $response;
//    echo $objResponse->message;

}

returnJSON($response);

