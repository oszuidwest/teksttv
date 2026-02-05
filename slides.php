<?php

// Load configuration to get all available channels
$aChannels = array();
if (file_exists('config.json')) {
    $oConfigFile = json_decode(file_get_contents('config.json'));
    if ($oConfigFile && isset($oConfigFile->channels)) {
        foreach ($oConfigFile->channels as $sId => $oChannel) {
            $aChannels[$sId] = array(
                'brandColor' => isset($oChannel->brandColor) ? $oChannel->brandColor : '#04C104'
            );
        }
    }
}

// Get channel from URL parameter, default to first channel
$sKanaal = isset($_GET['kanaal']) ? $_GET['kanaal'] : null;

// Default to first available channel if none specified
if (!$sKanaal && count($aChannels) > 0) {
    $aChannelKeys = array_keys($aChannels);
    $sKanaal = $aChannelKeys[0];
} elseif (!$sKanaal) {
    $sKanaal = 'tv1';
}

// Get brand color for current channel
$sBrandColor = isset($aChannels[$sKanaal]['brandColor']) ? $aChannels[$sKanaal]['brandColor'] : '#04C104';

// Set $_GET for content.php to use
$_GET['kanaal'] = $sKanaal;

// Capture output from content.php
ob_start();
include('content.php');
$sContent = ob_get_clean();

// Reset Content-Type header since content.php sets it to application/json
header('Content-Type: text/html; charset=utf-8');

$oContent = json_decode($sContent);

// Check for errors
if (!$oContent) {
    $errorData = json_decode($sContent);
    if (isset($errorData->error)) {
        die('<p style="color:#d63638;font-family:-apple-system,sans-serif;padding:40px;">Fout: ' . htmlspecialchars($errorData->error) . '</p>');
    } else {
        die('<p style="color:#d63638;font-family:-apple-system,sans-serif;padding:40px;">Fout: Kan content niet laden</p>');
    }
}

// Extract slides array from new response structure
$aContent = isset($oContent->slides) ? $oContent->slides : array();

// Type colors for timeline - nieuws uses brand color
$aTypeColors = array(
    'nieuws' => array('color' => $sBrandColor, 'label' => 'Nieuws'),
    'weer' => array('color' => '#dba617', 'label' => 'Weer'),
    'reclame' => array('color' => '#787c82', 'label' => 'Reclame'),
    'reclame_in' => array('color' => '#787c82', 'label' => 'Reclame'),
    'reclame_uit' => array('color' => '#787c82', 'label' => 'Reclame'),
    'afbeelding' => array('color' => '#646970', 'label' => 'Afbeelding')
);

// Calculate totals
$iTotalDuration = 0;
$aTypeCounts = array();
foreach ($aContent as $aItem) {
    $iTotalDuration += isset($aItem->duration) ? (int)$aItem->duration : 0;
    $t = $aItem->type;
    if (!isset($aTypeCounts[$t])) $aTypeCounts[$t] = 0;
    $aTypeCounts[$t]++;
}

// Format duration
function formatDuration($ms) {
    $totalSeconds = (int)($ms / 1000);
    $minutes = floor($totalSeconds / 60);
    $seconds = $totalSeconds % 60;
    return sprintf('%d:%02d', $minutes, $seconds);
}

function formatDurationLong($ms) {
    $totalSeconds = (int)($ms / 1000);
    $minutes = floor($totalSeconds / 60);
    $seconds = $totalSeconds % 60;
    return sprintf('%02d:%02d', $minutes, $seconds);
}

?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Overzicht slides &lsaquo; <?= htmlspecialchars(strtoupper($sKanaal)) ?> &mdash; Kabelkrant</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --brand: <?= htmlspecialchars($sBrandColor) ?>;
            --wp-admin-bg: #f0f0f1;
            --wp-card-bg: #fff;
            --wp-blue: #2271b1;
            --wp-blue-hover: #135e96;
            --wp-text: #1d2327;
            --wp-text-light: #646970;
            --wp-border: #c3c4c7;
            --wp-border-light: #dcdcde;
            --wp-success: #00a32a;
            --wp-warning: #dba617;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
            background: var(--wp-admin-bg);
            color: var(--wp-text);
            font-size: 13px;
            line-height: 1.4;
            min-height: 100vh;
        }

        /* Page Header */
        .page-header {
            background: var(--wp-card-bg);
            border-bottom: 1px solid var(--wp-border);
            padding: 15px 20px;
        }

        .page-header-inner {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .page-title {
            font-size: 23px;
            font-weight: 400;
            color: var(--wp-text);
        }

        /* Channel Tabs */
        .channel-tabs {
            display: flex;
            gap: 0;
            border: 1px solid var(--wp-border);
            border-radius: 3px;
            overflow: hidden;
        }

        .channel-tab {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: var(--wp-card-bg);
            border: none;
            border-right: 1px solid var(--wp-border);
            font-family: inherit;
            font-size: 13px;
            color: var(--wp-blue);
            text-decoration: none;
            transition: all 0.1s;
        }

        .channel-tab:last-child {
            border-right: none;
        }

        .channel-tab:hover {
            background: #f6f7f7;
            color: var(--wp-blue-hover);
        }

        .channel-tab.active {
            background: var(--wp-blue);
            color: #fff;
        }

        .channel-tab .indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }

        .channel-tab.active .indicator {
            background: rgba(255,255,255,0.5);
        }

        /* Main Content */
        .main-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0;
            border: 1px solid var(--wp-border);
            border-radius: 3px;
            margin-bottom: 20px;
            background: var(--wp-card-bg);
        }

        .stat-box {
            padding: 16px 20px;
            border-right: 1px solid var(--wp-border);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .stat-box:last-child {
            border-right: none;
        }

        .stat-icon {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .stat-icon svg {
            width: 24px;
            height: 24px;
            fill: var(--wp-blue);
        }

        .stat-content {
            display: flex;
            flex-direction: column;
        }

        .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: var(--wp-text);
            line-height: 1;
        }

        .stat-label {
            font-size: 12px;
            color: var(--wp-text-light);
            margin-top: 2px;
        }

        .status-live {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            background: #d7f3e3;
            border-radius: 3px;
            color: var(--wp-success);
            font-size: 13px;
            font-weight: 500;
        }

        .status-live::before {
            content: '';
            width: 8px;
            height: 8px;
            background: var(--wp-success);
            border-radius: 50%;
        }

        /* Timeline Widget */
        .widget {
            background: var(--wp-card-bg);
            border: 1px solid var(--wp-border);
            border-radius: 3px;
            margin-bottom: 20px;
        }

        .widget-header {
            padding: 12px 15px;
            border-bottom: 1px solid var(--wp-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .widget-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--wp-text);
        }

        .widget-meta {
            font-size: 12px;
            color: var(--wp-text-light);
        }

        .widget-body {
            padding: 15px;
        }

        .timeline-bar {
            height: 24px;
            display: flex;
            border: 1px solid var(--wp-border);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 12px;
        }

        .timeline-seg {
            height: 100%;
            transition: filter 0.15s;
        }

        .timeline-seg:hover {
            filter: brightness(1.1);
        }

        .timeline-legend {
            display: flex;
            gap: 20px;
            font-size: 12px;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--wp-text-light);
        }

        .legend-swatch {
            width: 14px;
            height: 14px;
            border-radius: 2px;
        }

        /* Table */
        .table-wrapper {
            background: var(--wp-card-bg);
            border: 1px solid var(--wp-border);
            border-radius: 3px;
        }

        .table-header {
            padding: 10px 15px;
            border-bottom: 1px solid var(--wp-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .table-title {
            font-size: 14px;
            font-weight: 600;
        }

        .table-count {
            font-size: 12px;
            color: var(--wp-text-light);
        }

        .wp-table {
            width: 100%;
            border-collapse: collapse;
        }

        .wp-table th {
            text-align: left;
            padding: 10px 12px;
            font-weight: 400;
            font-size: 13px;
            color: var(--wp-text);
            border-bottom: 1px solid var(--wp-border);
            background: #f6f7f7;
        }

        .wp-table th a {
            color: var(--wp-blue);
            text-decoration: none;
        }

        .wp-table th a:hover {
            color: var(--wp-blue-hover);
        }

        .wp-table th.col-num { width: 50px; }
        .wp-table th.col-thumb { width: 70px; }
        .wp-table th.col-type { width: 100px; }
        .wp-table th.col-dur { width: 60px; text-align: right; }
        .wp-table th.col-action { width: 90px; }

        .wp-table td {
            padding: 10px 12px;
            border-bottom: 1px solid var(--wp-border-light);
            vertical-align: middle;
        }


        .wp-table tbody tr:last-child td {
            border-bottom: none;
        }

        .row-num {
            color: var(--wp-text-light);
            font-weight: 500;
        }

        .thumb-preview {
            width: 60px;
            height: 34px;
            background: #f0f0f1;
            border: 1px solid var(--wp-border);
            border-radius: 2px;
            object-fit: cover;
        }

        .thumb-placeholder {
            width: 60px;
            height: 34px;
            background: #f6f7f7;
            border: 1px solid var(--wp-border);
            border-radius: 2px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--wp-text-light);
        }

        .thumb-placeholder svg {
            width: 16px;
            height: 16px;
        }

        .type-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 500;
        }

        .type-badge.nieuws { background: color-mix(in srgb, var(--brand) 15%, white); color: var(--brand); }
        .type-badge.weer { background: #fcf0c3; color: #996800; }
        .type-badge.afbeelding { background: #f0f0f1; color: var(--wp-text-light); }
        .type-badge.reclame,
        .type-badge.reclame_in,
        .type-badge.reclame_uit { background: #f0f0f1; color: #787c82; }

        .row-title {
            font-weight: 600;
            color: var(--wp-text);
        }

        .row-title a {
            color: var(--wp-blue);
            text-decoration: none;
        }

        .row-title a:hover {
            color: var(--wp-blue-hover);
        }

        .row-title.empty {
            font-weight: 400;
            color: var(--wp-text-light);
            font-style: italic;
        }


        .col-dur {
            text-align: right;
            color: var(--wp-text-light);
            font-variant-numeric: tabular-nums;
        }

        .btn-view {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            background: #f6f7f7;
            border: 1px solid var(--wp-border);
            border-radius: 3px;
            color: var(--wp-text);
            text-decoration: none;
            font-size: 12px;
            transition: all 0.1s;
        }

        .btn-view:hover {
            background: #f0f0f1;
            border-color: #8c8f94;
            color: var(--wp-text);
        }

        .btn-view svg {
            width: 12px;
            height: 12px;
            fill: currentColor;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
            .main-content {
                padding: 15px;
            }

            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .stat-box {
                border-right: 1px solid var(--wp-border);
                border-bottom: 1px solid var(--wp-border);
            }

            .stat-box:nth-child(2n) {
                border-right: none;
            }

            .stat-box:nth-child(n+3) {
                border-bottom: none;
            }

            .timeline-legend {
                flex-wrap: wrap;
                gap: 8px;
            }
        }

        @media (max-width: 768px) {
            .page-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 15px;
                padding: 15px 20px;
            }

            .channel-tab {
                padding: 8px 16px;
                font-size: 13px;
            }

            .stats-grid {
                grid-template-columns: 1fr 1fr;
            }

            .card-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }

            .wp-table th.col-thumb,
            .wp-table td:nth-child(2) {
                display: none;
            }

            .row-title {
                font-size: 13px;
            }

            .btn-view {
                padding: 6px 12px;
                font-size: 12px;
            }

            .btn-view svg {
                display: none;
            }
        }

        @media (max-width: 480px) {
            .main-content {
                padding: 10px;
            }

            .page-title {
                font-size: 18px;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }

            .stat-box {
                border-right: none;
                border-bottom: 1px solid var(--wp-border);
            }

            .stat-box:last-child {
                border-bottom: none;
            }

            .stat-value {
                font-size: 20px;
            }

            .timeline-bar {
                height: 16px;
            }

            .wp-table th.col-dur,
            .wp-table td.col-dur {
                display: none;
            }

            .wp-table th,
            .wp-table td {
                padding: 10px 8px;
            }

            .row-num {
                font-size: 11px;
            }
        }
    </style>
</head>
<body>
    <!-- Page Header -->
    <div class="page-header">
        <div class="page-header-inner">
            <h1 class="page-title">Overzicht slides</h1>
            <div class="channel-tabs">
                <?php foreach ($aChannels as $sId => $aChannel):
                    $bActive = ($sId === $sKanaal);
                    $sTabColor = htmlspecialchars($aChannel['brandColor']);
                ?>
                <a href="?kanaal=<?= urlencode($sId) ?>"
                   class="channel-tab<?= $bActive ? ' active' : '' ?>">
                    <span class="indicator" style="background: <?= $sTabColor ?>;"></span>
                    <?= htmlspecialchars(strtoupper($sId)) ?>
                </a>
                <?php endforeach; ?>
            </div>
        </div>
    </div>

    <div class="main-content">
        <!-- Stats Grid -->
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-icon">
                    <svg viewBox="0 0 20 20"><path d="M19 3H1v14h18V3zM3 5h14v10H3V5z"/></svg>
                </div>
                <div class="stat-content">
                    <div class="stat-value"><?= count($aContent) ?></div>
                    <div class="stat-label">Slides</div>
                </div>
            </div>
            <div class="stat-box">
                <div class="stat-icon">
                    <svg viewBox="0 0 20 20"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H9v6l5.25 3.15.75-1.23-4.5-2.67V5z"/></svg>
                </div>
                <div class="stat-content">
                    <div class="stat-value"><?= formatDurationLong($iTotalDuration) ?></div>
                    <div class="stat-label">Looptijd</div>
                </div>
            </div>
            <div class="stat-box">
                <div class="stat-icon">
                    <svg viewBox="0 0 20 20"><path d="M5 5V3h10v2H5zm0 8h10v-2H5v2zm0 4h10v-2H5v2zm0-8h10V7H5v2z"/></svg>
                </div>
                <div class="stat-content">
                    <div class="stat-value"><?= isset($aTypeCounts['nieuws']) ? $aTypeCounts['nieuws'] : 0 ?></div>
                    <div class="stat-label">Nieuwsberichten</div>
                </div>
            </div>
            <div class="stat-box">
                <div class="stat-icon">
                    <svg viewBox="0 0 24 24"><path d="M3 9v6l18 5V4L3 9zm6 8.5c0 1.4-1.1 2.5-2.5 2.5S4 18.9 4 17.5V15l5 1.3v1.2z"/></svg>
                </div>
                <div class="stat-content">
                    <div class="stat-value"><?= (isset($aTypeCounts['reclame']) ? $aTypeCounts['reclame'] : 0) + (isset($aTypeCounts['reclame_in']) ? $aTypeCounts['reclame_in'] : 0) + (isset($aTypeCounts['reclame_uit']) ? $aTypeCounts['reclame_uit'] : 0) ?></div>
                    <div class="stat-label">Reclame</div>
                </div>
            </div>
        </div>

        <!-- Timeline Widget -->
        <div class="widget">
            <div class="widget-header">
                <span class="widget-title">Tijdlijn</span>
                <span class="widget-meta">Totaal: <?= formatDuration($iTotalDuration) ?></span>
            </div>
            <div class="widget-body">
                <div class="timeline-bar">
                    <?php foreach ($aContent as $idx => $aItem):
                        $iDur = isset($aItem->duration) ? (int)$aItem->duration : 0;
                        $fPercent = $iTotalDuration > 0 ? ($iDur / $iTotalDuration) * 100 : 0;
                        $sType = $aItem->type;
                        $sColor = isset($aTypeColors[$sType]) ? $aTypeColors[$sType]['color'] : '#dcdcde';
                    ?>
                    <div class="timeline-seg"
                         style="width: <?= max(0.3, $fPercent) ?>%; background: <?= $sColor ?>;"
                         title="<?= ($idx + 1) ?>. <?= htmlspecialchars(html_entity_decode($aItem->title ?: $sType, ENT_QUOTES | ENT_HTML5, 'UTF-8')) ?> (<?= (int)($iDur/1000) ?>s)">
                    </div>
                    <?php endforeach; ?>
                </div>
                <div class="timeline-legend">
                    <div class="legend-item">
                        <div class="legend-swatch" style="background: var(--brand);"></div>
                        <span>Nieuws</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-swatch" style="background: var(--wp-warning);"></div>
                        <span>Weer</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-swatch" style="background: #646970;"></div>
                        <span>Afbeelding</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-swatch" style="background: #dcdcde;"></div>
                        <span>Reclame</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
            <div class="table-header">
                <span class="table-title">Alle slides</span>
                <span class="table-count"><?= count($aContent) ?> items</span>
            </div>
            <table class="wp-table">
                <thead>
                    <tr>
                        <th class="col-num">#</th>
                        <th class="col-thumb">Voorbeeld</th>
                        <th class="col-type"><a href="#">Type</a></th>
                        <th><a href="#">Titel</a></th>
                        <th class="col-dur"><a href="#">Duur</a></th>
                        <th class="col-action"></th>
                    </tr>
                </thead>
                <tbody>
                <?php
                $iCounter = 0;
                foreach ($aContent as $aItem) {
                    $sLinkParams = '?slide=' . $iCounter . '&kanaal=' . urlencode($sKanaal);
                    $iDuration = isset($aItem->duration) ? (int)($aItem->duration / 1000) : 0;
                    $sType = $aItem->type;
                    $sPhoto = isset($aItem->photo) ? $aItem->photo : '';
                    $sTitle = html_entity_decode($aItem->title ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                    $sTypeLabel = isset($aTypeColors[$sType]) ? $aTypeColors[$sType]['label'] : ucfirst($sType);
                    ?>
                    <tr>
                        <td><span class="row-num"><?= str_pad($iCounter, 2, '0', STR_PAD_LEFT) ?></span></td>
                        <td>
                            <?php if ($sPhoto): ?>
                                <img src="<?= htmlspecialchars($sPhoto) ?>" class="thumb-preview" alt="" loading="lazy">
                            <?php else: ?>
                                <div class="thumb-placeholder">
                                    <?php if ($sType === 'weer'): ?>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                                    <?php elseif ($sType === 'nieuws'): ?>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 0v16m4-12h8m-8 4h8m-8 4h4"/></svg>
                                    <?php elseif ($sType === 'reclame' || $sType === 'reclame_in' || $sType === 'reclame_uit'): ?>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 01-5.8-1.6"/></svg>
                                    <?php else: ?>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>
                        </td>
                        <td><span class="type-badge <?= htmlspecialchars($sType) ?>"><?= htmlspecialchars($sTypeLabel) ?></span></td>
                        <td>
                            <?php if ($sTitle): ?>
                                <strong class="row-title"><a href="index.php<?= $sLinkParams ?>" target="_blank"><?= htmlspecialchars($sTitle) ?></a></strong>
                            <?php else: ?>
                                <span class="row-title empty">(geen titel)</span>
                            <?php endif; ?>
                        </td>
                        <td class="col-dur"><?= $iDuration ?>s</td>
                        <td>
                            <a href="index.php<?= $sLinkParams ?>" class="btn-view" target="_blank">
                                <svg viewBox="0 0 20 20"><path d="M6.22 8.72a.5.5 0 0 1 .5.5v5.5h5.5a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5v-6a.5.5 0 0 1 .5-.5z"/><path d="M14 3.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V4.707L7.354 10.854a.5.5 0 1 1-.708-.708L12.793 4H7.5a.5.5 0 0 1 0-1h6z"/></svg>
                                Tonen
                            </a>
                        </td>
                    </tr>
                    <?php
                    $iCounter++;
                }
                ?>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
