<?php

// Get config ID from URL parameter
$sConfigId = isset($_GET['config']) ? $_GET['config'] : null;
$sConfigParam = $sConfigId ? '?config=' . urlencode($sConfigId) : '';

// Fetch content from local content.php with config parameter
$sContent = file_get_contents('content.php' . $sConfigParam);
$aContent = json_decode($sContent);

// Check for errors
if(!$aContent) {
    $errorData = json_decode($sContent);
    if(isset($errorData->error)) {
        die('<p>Error: ' . htmlspecialchars($errorData->error) . '</p>');
    } else {
        die('<p>Error: Could not load content. Check config.json and content.php</p>');
    }
}

?>
<table border=1 cellspacing="0">
    <tr>
        <th>#</th>
        <th>Type</th>
        <th>Titel</th>
        <th>&nbsp;</th>
    </tr>
    <?php
    $iCounter = 0;
    foreach($aContent as $aItem) {
        // Build link with both slide and config parameters
        $sLinkParams = '?slide=' . $iCounter;
        if($sConfigId) {
            $sLinkParams .= '&config=' . urlencode($sConfigId);
        }
        ?>
        <tr>
            <td align=center><?= $iCounter + 1 ?></td>
            <td><?= $aItem->type ?></td>
            <td><?= $aItem->title ?></td>
            <td><a href="index.php<?= $sLinkParams ?>">Tonen</a></td>
        </tr>
        <?php
        $iCounter++;
    }
?>
</table>
