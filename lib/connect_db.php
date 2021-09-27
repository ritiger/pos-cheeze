<?php

// $servername = "localhost\SQLEXPRESS";
// $servername = "BIWU\LOCALDB#6321A9DF";
$servername = "(LocalDb)\MSSQLLocalDB";
$username = "BIWU/Tai";
$password = "test";
$database = 'pos';

$connectionInfo = [
  'Database' => $database,
  "UID" => $username,
  // "PWD" => $password,
];

// Create connection
// $conn = new mysqli($servername, $username, $password, $database);

// // Check connection
// if ($conn->connect_error) {
//     die("Connection failed: " . $conn->connect_error);
// }

//echo "Connected successfully";

$conn = sqlsrv_connect($servername, $connectionInfo);

if ($conn) {

} else {
  echo 'Connection could not be established!';
  die(print_r(sqlsrv_errors(), true));
}
