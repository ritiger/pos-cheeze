<?php
// 
include __DIR__ . DIRECTORY_SEPARATOR . 'connect_db.php';

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
    global $conn;
    $result = $conn->query('SELECT * FROM product');
    $products = [];

    if ($result->num_rows > 0) {
        // output data of each row
        while($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
    }
    return $products;
}

function getProductByBarcode($barcode) {
    global $conn;
    $query = "SELECT * FROM product WHERE UPC='" . $barcode . "'";
    $result = $conn->query($query);

    if ($result->num_rows > 0) {
        return $result->fetch_assoc();
    }
    return null;
}

function getProductById($id) {
    global $conn;
    $query = "SELECT * FROM product WHERE RecID={$id}";
    $result = $conn->query($query);
    return $result->fetch_assoc();
}

function addPayment($params) {
    global $conn;
    $product_ids = $params['product_ids'];
    $cash = $params['cash'];
    $card = $params['card'];
    $total_price = $params['totalPrice'];

    // $product = getProductById($product_id);

    $invoiceNum = 'TEMP';
    $invoiceDate = date('Y-m-d');
    $invoiceTime = date('H:i:s');
    $query = "INSERT INTO invoice (CustomerRecID, InvoiceNumber, InvoiceDate, TotalUnitAmount, TotalDiscountAmount, TotalSubTotal, TotalVATAmount, GrandTotal, InvoiceCreatedDate, InvoiceCreatedTime, CardAmount, CashAmount) VALUES 
        (1, '{$invoiceNum}', '{$invoiceDate}', {$total_price}, 0, {$total_price}, 0, {$total_price}, '{$invoiceDate}', '{$invoiceTime}', {$card}, {$cash});";
    $result = $conn->query($query);

    $invoiceId = $conn->insert_id;
    // update invoice id.
    $invoiceNum = 'INV/' . str_pad($invoiceId, 6, '0', STR_PAD_LEFT);

    $updateQuery = "UPDATE invoice SET invoiceNumber='{$invoiceNum}' WHERE RecID={$invoiceId}";
    $conn->query($updateQuery);

    // create invoice details.
    for ($i = 0; $i < count($product_ids); $i++) {
      $product_id = $product_ids[$i];
      $product = getProductById($product_id);
      $price = $product['RetailPrice'];
      $query = "INSERT INTO invoicedetail (InvoiceRecID, UPC, Quantity, TotalUnitAmount, TotalDiscountAmount, TotalSubTotal, TotalVATAmount, GrandTotal) VALUES 
        ('{$invoiceId}', '{$product['UPC']}', 1, {$price}, 0, {$price}, 0, {$price})";
      $conn->query($query);
    }

    // get invoice by id.
    return getInvoiceById($invoiceId);
}

function getInvoiceById($id) {
    global $conn;
    $query = "SELECT * FROM invoice WHERE RecID={$id}";
    $result = $conn->query($query);
    return $result->fetch_assoc();
}
