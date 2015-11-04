<?php

$servername = "localhost";
$username = "qsdb_user";
$password = "qsdb_password";
$database = "qsdb";

// Create connection
$conn = mysql_connect($servername, $username, $password);
// Check connection
if (!$conn){
    echo "Could not connect to mysql.";
    return;
}
mysql_select_db($database, $conn);

$pathway = $_REQUEST["pathway"];
$result = mysql_query("SELECT r.* FROM reactions r INNER JOIN nodes n ON r.node_id = n.id WHERE n.pathway_id = $pathway", $conn);
$data = array();
while ($row = mysql_fetch_assoc($result)) {
    $result_proteins = mysql_query("SELECT * FROM reagents WHERE reaction_id = $row[id]", $conn);
    $row += array("reagents" => array());
    while ($row_protein = mysql_fetch_assoc($result_proteins)) {
        array_push($row["reagents"], $row_protein);
    }
    array_push($data, $row);
}

$response = json_encode($data);
echo $response;
mysql_close($conn);
?>
