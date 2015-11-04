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

$pathway = intval($_REQUEST["pathway"]);
$species = str_replace(":", "','", $_REQUEST["species"]);
$species = "'" . $species . "'";

$sql = "(select n.id, p.name, n.pathway_id, n.type, n.pathway_ref, n.x, n.y from nodes n inner join pathways p on p.id = n.foreign_id where n.type = 'pathway' and n.pathway_id = $pathway)
union
(select n.id, m.name, n.pathway_id, n.type, n.pathway_ref, n.x, n.y from nodes n inner join metabolites m on m.id = n.foreign_id where n.type = 'metabolite' and n.pathway_id = $pathway)
union
(select id, '', pathway_id, type, pathway_ref, x, y from nodes n where type = 'protein' and pathway_id = $pathway);";
$result = mysql_query($sql, $conn);
$data = array();
while ($row = mysql_fetch_assoc($result)) {
    $sql_protein = "SELECT * FROM proteins p INNER JOIN nodeproteincorrelations np ON p.id = np.protein_id WHERE np.node_id = $row[id] and species in ($species)";
    $result_proteins = mysql_query($sql_protein, $conn);
    if ($row["type"] == "protein"){
        $row += array("proteins" => array());
        while ($row_protein = mysql_fetch_assoc($result_proteins)) {
            array_push($row["proteins"], $row_protein);
        }
    }
    array_push($data, $row);
}

$response = json_encode($data);
echo $response;
mysql_close($conn);
?>
