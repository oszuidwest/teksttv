<?php

// Load configuration to get all available configs
if(!file_exists('config.json')) {
	die('<p>Error: Configuration file config.json not found</p>');
}

$sConfigContent = file_get_contents('config.json');
$oConfigFile = json_decode($sConfigContent);

if(json_last_error() !== JSON_ERROR_NONE) {
	die('<p>Error: Invalid JSON in config.json</p>');
}

// Get all available configurations
$aConfigurations = array();
if(isset($oConfigFile->configurations)) {
	foreach($oConfigFile->configurations as $sId => $oConfig) {
		$aConfigurations[$sId] = isset($oConfig->name) ? $oConfig->name : $sId;
	}
}

// Get config ID from URL parameter
$sConfigId = isset($_GET['config']) ? $_GET['config'] : null;

// If no config specified, show config selector
if(!$sConfigId && count($aConfigurations) > 0) {
	?>
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="utf-8">
		<title>Slide Overzicht - Kies Configuratie</title>
		<style>
			body { font-family: Arial, sans-serif; margin: 20px; }
			h1 { margin-bottom: 20px; }
			.config-list { list-style: none; padding: 0; }
			.config-list li { margin: 10px 0; }
			.config-list a {
				display: block;
				padding: 15px 20px;
				background: #f5f5f5;
				border: 2px solid #ddd;
				border-radius: 5px;
				color: #333;
				text-decoration: none;
				transition: all 0.2s;
			}
			.config-list a:hover {
				background: #e0e0e0;
				border-color: #4C4C4C;
			}
			.config-id {
				font-size: 18px;
				font-weight: bold;
				color: #0066cc;
			}
			.config-name {
				font-size: 14px;
				color: #666;
				margin-top: 5px;
			}
		</style>
	</head>
	<body>
		<h1>Slide Overzicht - Kies Configuratie</h1>
		<ul class="config-list">
			<?php foreach($aConfigurations as $sId => $sName): ?>
				<li>
					<a href="?config=<?= urlencode($sId) ?>">
						<div class="config-id"><?= htmlspecialchars($sId) ?></div>
						<div class="config-name"><?= htmlspecialchars($sName) ?></div>
					</a>
				</li>
			<?php endforeach; ?>
		</ul>
	</body>
	</html>
	<?php
	exit;
}

// Set $_GET for content.php to use
if($sConfigId) {
	$_GET['config'] = $sConfigId;
}

// Capture output from content.php
ob_start();
include('content.php');
$sContent = ob_get_clean();

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
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Slide Overzicht<?= $sConfigId ? ' - ' . htmlspecialchars($sConfigId) : '' ?></title>
	<style>
		body { font-family: Arial, sans-serif; margin: 20px; }
		h1 { margin-bottom: 10px; }
		.back-link { margin-bottom: 20px; }
		.back-link a { color: #0066cc; text-decoration: none; }
		.back-link a:hover { text-decoration: underline; }
		table { border-collapse: collapse; width: 100%; max-width: 800px; }
		th { background: #4C4C4C; color: white; padding: 10px; text-align: left; }
		td { padding: 8px; border: 1px solid #ddd; }
		tr:hover { background: #f5f5f5; }
		a { color: #0066cc; text-decoration: none; }
		a:hover { text-decoration: underline; }
	</style>
</head>
<body>
	<?php if(count($aConfigurations) > 1): ?>
		<div class="back-link">
			<a href="slides.php">← Terug naar configuratie overzicht</a>
		</div>
	<?php endif; ?>

	<h1>Slide Overzicht<?= $sConfigId ? ' - ' . htmlspecialchars($aConfigurations[$sConfigId] ?? $sConfigId) : '' ?></h1>

	<table>
		<tr>
			<th>#</th>
			<th>Type</th>
			<th>Titel</th>
			<th>&nbsp;</th>
		</tr>
	<?php
	$iCounter = 0;
	foreach($aContent as $aItem) {
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
</body>
</html>
