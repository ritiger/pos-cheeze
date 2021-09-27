<?php

include __DIR__ . DIRECTORY_SEPARATOR . 'connect_db.php';

$options = [
  'Scrollable' => SQLSRV_CURSOR_KEYSET,
];

function returnJSON($data) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function getJSONRequest() {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, TRUE);
    return $input;
}

function getAllProducts() {
    global $conn, $options;
    $stmt = sqlsrv_query($conn, 'SELECT * FROM Product', [], $options);
    $products = [];

    if (sqlsrv_num_rows($stmt) > 0) {
        // output data of each row
        while($row = sqlsrv_fetch_array($stmt)) {
            $products[] = $row;
        }
    }
    return $products;
}

function getProductByBarcode($barcode) {
    global $conn, $options;
    $query = "SELECT * FROM Product WHERE UPC='" . $barcode . "'";

    $stmt = sqlsrv_query($conn, $query, [], $options);

    if (sqlsrv_num_rows($stmt) > 0) {
      return sqlsrv_fetch_array($stmt);
    }
    return null;
}

function getProductById($id) {
    global $conn, $options;
    $query = "SELECT * FROM Product WHERE RecID={$id}";
    $stmt = sqlsrv_query($conn, $query, [], $options);
    return sqlsrv_fetch_array($stmt);
}

function addPayment($params) {
    global $conn;
    $product_ids = $params['product_ids'];
    $cash = $params['cash'];
    $card = $params['card'];
    $total_price = $params['totalPrice'];

    $invoiceNum = 'TEMP';
    $invoiceDate = date('Y-m-d');
    $invoiceTime = date('H:i:s');
    $query = "INSERT INTO Invoice (CustomerRecID, InvoiceNumber, InvoiceDate, TotalUnitAmount, TotalDiscountAmount, TotalSubTotal, TotalVATAmount, GrandTotal, InvoiceCreatedDate, InvoiceCreatedTime, CardAmount, CashAmount) VALUES 
        (1, '{$invoiceNum}', '{$invoiceDate}', {$total_price}, 0, {$total_price}, 0, {$total_price}, '{$invoiceDate}', '{$invoiceTime}', {$card}, {$cash});  SELECT SCOPE_IDENTITY()";
    $resource = sqlsrv_query($conn, $query);
    // if (!$resource) {
    //   $errors = sqlsrv_errors();
    //   foreach( $errors as $error ) {
    //     echo "SQLSTATE: ".$error[ 'SQLSTATE']."<br />";
    //     echo "code: ".$error[ 'code']."<br />";
    //     echo "message: ".$error[ 'message']."<br />";
    //   }
    //   exit;
    // }
    sqlsrv_next_result($resource);
    sqlsrv_fetch($resource);
    $invoiceId = sqlsrv_get_field($resource, 0);

    // update invoice id.
    $invoiceNum = 'INV/' . str_pad($invoiceId, 6, '0', STR_PAD_LEFT);

    $updateQuery = "UPDATE Invoice SET InvoiceNumber='{$invoiceNum}' WHERE RecID={$invoiceId}";
    // $conn->query($updateQuery);
    sqlsrv_query($conn, $updateQuery);

    // create invoice details.
    for ($i = 0; $i < count($product_ids); $i++) {
      $product_id = $product_ids[$i];
      $product = getProductById($product_id);
      $price = $product['RetailPrice'];
      $query = "INSERT INTO InvoiceDetail (InvoiceRecID, UPC, Quantity, TotalUnitAmount, TotalDiscountAmount, TotalSubTotal, TotalVATAmount, GrandTotal) VALUES 
        ('{$invoiceId}', '{$product['UPC']}', 1, {$price}, 0, {$price}, 0, {$price});  SELECT SCOPE_IDENTITY()";
      sqlsrv_query($conn, $query);
    }

    // get invoice by id.
    return getInvoiceById($invoiceId);
}

function getInvoiceById($id) {
    global $conn, $options;
    $query = "SELECT * FROM Invoice WHERE RecID={$id}";
    $stmt = sqlsrv_query($conn, $query);
    return sqlsrv_fetch_array($stmt);
}
