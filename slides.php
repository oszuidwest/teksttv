<?

error_reporting(E_ALL);
ini_set('display_errors', 'true');

//echo '<pre>';

$sContent = file_get_contents('http://teksttv.zuidwesttv.nl/content.php');
$aContent = json_decode($sContent);

//print_r($sContent);

?>
<table border=1 cellspacing="0">
    <tr>
        <th>#</th>
        <th>Type</th>
        <th>Titel</th>
        <th>&nbsp;</th>
    </tr>
    <?
    $iCounter = 0;
    foreach($aContent as $aItem) {
        ?>
        <tr>
            <td align=center><?= $iCounter + 1 ?></td>
            <td><?= $aItem->type ?></td>
            <td><?= $aItem->title ?></td>
            <td><a href="index.php?slide=<?= $iCounter ?>">Tonen</a></td>
        </tr>
        <?
        $iCounter++;
    }
?>
</table>
