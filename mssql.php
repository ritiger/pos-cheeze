<?php

// $servername = "localhost\SQLEXPRESS";
// $servername = "BIWU\LOCALDB#6321A9DF";
$servername = "(LocalDb)\MSSQLLocalDB";
$username = "MARTIN";
$password = "asdASD123!@#";
$database = 'pos_cheese';

$connectionInfo = [
  'Database' => $database,
  "UID" => $username,
  "PWD" => $password,
];

// Create connection

$conn = sqlsrv_connect($servername, $connectionInfo);

if ($conn) {
  echo "Connected successfully";
} else {
  echo 'Connection could not be established! <br/> <pre>';
  die(print_r(sqlsrv_errors(), true));
}
