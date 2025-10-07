<?php

// Get config ID from URL parameter
$sConfigId = isset($_GET['config']) ? $_GET['config'] : null;

// Load configuration from config.json
if(!file_exists('config.json')) {
    header('HTTP/1.1 500 Internal Server Error');
    die(json_encode(['error' => 'Configuration file config.json not found']));
}

$sConfigContent = file_get_contents('config.json');
$oConfigFile = json_decode($sConfigContent);

if(json_last_error() !== JSON_ERROR_NONE) {
    header('HTTP/1.1 500 Internal Server Error');
    die(json_encode(['error' => 'Invalid JSON in config.json: ' . json_last_error_msg()]));
}

$oConfig = null;

if($oConfigFile) {
    // New multi-configuration structure
    if(isset($oConfigFile->configurations)) {
        if($sConfigId) {
            // Config ID explicitly provided - must exist or error
            if(isset($oConfigFile->configurations->{$sConfigId})) {
                $oConfig = $oConfigFile->configurations->{$sConfigId};
            } else {
                header('HTTP/1.1 404 Not Found');
                die(json_encode(['error' => 'Configuration "' . $sConfigId . '" not found in config.json']));
            }
        } else {
            // No config ID provided - use default
            if(isset($oConfigFile->default) && isset($oConfigFile->configurations->{$oConfigFile->default})) {
                $oConfig = $oConfigFile->configurations->{$oConfigFile->default};
            }
        }
    }
    // Legacy single-configuration structure
    elseif(isset($oConfigFile->content)) {
        $oConfig = $oConfigFile;
    }
}

// Exit with error if configuration is not properly loaded
if(!$oConfig) {
    header('HTTP/1.1 500 Internal Server Error');
    die(json_encode(['error' => 'Configuration not found or invalid structure in config.json']));
}

// Validate required configuration fields
if(!isset($oConfig->content) || !isset($oConfig->weather) || !isset($oConfig->images)) {
    header('HTTP/1.1 500 Internal Server Error');
    die(json_encode(['error' => 'Missing required configuration sections (content, weather, or images)']));
}

// Validate required fields within sections
if(!isset($oConfig->content->newsApiUrl) || !isset($oConfig->content->numberOfPosts)) {
    header('HTTP/1.1 500 Internal Server Error');
    die(json_encode(['error' => 'Missing required content configuration (newsApiUrl or numberOfPosts)']));
}

if(!isset($oConfig->weather->location) || !isset($oConfig->weather->apiKey)) {
    header('HTTP/1.1 500 Internal Server Error');
    die(json_encode(['error' => 'Missing required weather configuration (location or apiKey)']));
}

if(!isset($oConfig->images->standardLogo) || !isset($oConfig->images->reclameLogo)) {
    header('HTTP/1.1 500 Internal Server Error');
    die(json_encode(['error' => 'Missing required image configuration (standardLogo or reclameLogo)']));
}

$sBaseUrl = $oConfig->content->newsApiUrl;

// Set timezone to Netherlands
date_default_timezone_set('Europe/Amsterdam');
setlocale(LC_ALL, 'nl_NL.utf8');

/**
 * Fetch URL with timeout to prevent hanging
 * @param string $sUrl URL to fetch
 * @param int $iTimeout Timeout in seconds (default: 10)
 * @return string|false Content on success, false on failure
 */
function fetchUrlWithTimeout($sUrl, $iTimeout = 10) {
	$oContext = stream_context_create(array(
		'http' => array(
			'timeout' => $iTimeout,
			'ignore_errors' => true,
			'user_agent' => 'TekstTV/1.0'
		)
	));

	$sResult = @file_get_contents($sUrl, false, $oContext);

	if($sResult === false) {
		$aError = error_get_last();
		error_log('TekstTV: URL fetch failed for ' . $sUrl . ' - ' . ($aError['message'] ?? 'Unknown error'));
		return false;
	}

	return $sResult;
}

/**
 * Fetch multiple URLs in parallel using curl_multi
 * @param array $aUrls Associative array of key => URL
 * @param int $iTimeout Timeout in seconds per request (default: 10)
 * @return array Associative array of key => response content
 */
function fetchMultipleUrls($aUrls, $iTimeout = 10) {
	$mh = curl_multi_init();
	$aHandles = array();
	$aResults = array();

	// Initialize all curl handles
	foreach($aUrls as $sKey => $sUrl) {
		$ch = curl_init($sUrl);
		curl_setopt_array($ch, array(
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_FOLLOWLOCATION => true,
			CURLOPT_TIMEOUT => $iTimeout,
			CURLOPT_CONNECTTIMEOUT => 5,
			CURLOPT_USERAGENT => 'TekstTV/1.0'
		));
		curl_multi_add_handle($mh, $ch);
		$aHandles[$sKey] = $ch;
	}

	// Execute all requests simultaneously
	$running = null;
	do {
		curl_multi_exec($mh, $running);
		curl_multi_select($mh);
	} while ($running > 0);

	// Collect results
	foreach($aHandles as $sKey => $ch) {
		$sContent = curl_multi_getcontent($ch);
		$aResults[$sKey] = $sContent !== null ? $sContent : false;
		curl_multi_remove_handle($mh, $ch);
		curl_close($ch);
	}

	curl_multi_close($mh);
	return $aResults;
}

/**
 * Convert wind direction in degrees to compass direction abbreviation
 * @param int $iDeg Wind direction in degrees (0-360)
 * @return string Compass direction (N, NO, O, ZO, Z, ZW, W, NW)
 */
function getWindDir($iDeg) {
	if($iDeg<22.5)  return 'N';
	if($iDeg<67.5)  return 'NO';
	if($iDeg<112.5) return 'O';
	if($iDeg<157.5) return 'ZO';
	if($iDeg<202.5) return 'Z';
	if($iDeg<247.5) return 'ZW';
	if($iDeg<292.5) return 'W';
	if($iDeg<337.5) return 'NW';
	return 'N';
}

/**
 * Convert wind speed in m/s to Beaufort scale (0-12)
 * @param float $iSpeed Wind speed in meters per second
 * @return string Beaufort scale number as string
 */
function getWindSpeed($iSpeed) {
	if($iSpeed<0.3) return '0';
	if($iSpeed<1.6) return '1';
	if($iSpeed<3.4) return '2';
	if($iSpeed<5.5) return '3';
	if($iSpeed<8.0) return '4';
	if($iSpeed<10.8) return '5';
	if($iSpeed<13.9) return '6';
	if($iSpeed<17.2) return '7';
	if($iSpeed<20.8) return '8';
	if($iSpeed<24.5) return '9';
	if($iSpeed<28.5) return '10';
	if($iSpeed<32.7) return '11';
	return '12';
}

/**
 * Convert day number to Dutch day name
 * @param int $iDay Day number (1=Monday, 7=Sunday)
 * @return string Dutch day name
 */
function getDay($iDay) {
	switch($iDay) {
		case 1: return 'Maandag';
		case 2: return 'Dinsdag';
		case 3: return 'Woensdag';
		case 4: return 'Donderdag';
		case 5: return 'Vrijdag';
		case 6: return 'Zaterdag';
		case 7: return 'Zondag';
	}
}

$oToday = new DateTime();
$oToday -> setTime(0, 0, 0);
$aData = array();

// Fetch weather data
// Get weather location from config.json only
$sWeatherLocation = $oConfig->weather->location;

// Determine cache file name based on location
$sWeatherCacheFile = './weather_' . preg_replace('/[^a-zA-Z0-9]/', '_', strtolower($sWeatherLocation)) . '.json';

// Check if cache exists and is less than 1 hour old
if(file_exists($sWeatherCacheFile) && (time() - filemtime($sWeatherCacheFile) < 3600)) {
	// Use cached data
	$oWeather = json_decode(file_get_contents($sWeatherCacheFile));
} else {
	// Fetch new weather data from OpenWeatherMap
	$oWeather = null;
	$sApiKey = $oConfig->weather->apiKey;

	for ($iRetryCounter = 0; $iRetryCounter <= 3; $iRetryCounter++) {
		$sUrl = 'http://api.openweathermap.org/data/2.5/forecast/daily?q=' . urlencode($sWeatherLocation) .
		        '&units=metric&lang=nl&cnt=5&appid=' . $sApiKey;
		$sWeatherData = fetchUrlWithTimeout($sUrl, 10);

		if ($sWeatherData !== false) {
			$oWeather = json_decode($sWeatherData);
			file_put_contents($sWeatherCacheFile, $sWeatherData);
			if($sWeatherLocation === 'Woensdrecht,NL') {
				file_put_contents('./weather.json', $sWeatherData);
			}
			break;
		}
		if ($iRetryCounter < 3) {
			usleep(200000 * pow(2, $iRetryCounter)); // Exponential backoff: 200ms, 400ms, 800ms
		}
	}

	// If fetching failed, try to use existing cache or fallback
	if($oWeather === null) {
		if(file_exists($sWeatherCacheFile)) {
			$oWeather = json_decode(file_get_contents($sWeatherCacheFile));
		} elseif(file_exists('./weather.json')) {
			$oWeather = json_decode(file_get_contents('./weather.json'));
		}
	}
}

$aWeatherData = array();

if($oWeather && isset($oWeather->list)) {
	foreach($oWeather->list as $oWeatherDay) {
		$oDate = new DateTime;
		$oDate->setTimeStamp($oWeatherDay->dt);

		$aWeatherData[$oToday->diff($oDate)->days] = array(
			'date' => getDay($oDate->format('N')),
			'tempday' => round($oWeatherDay->temp->day, 1),
			'tempmin' => round($oWeatherDay->temp->min, 1),
			'tempmax' => round($oWeatherDay->temp->max, 1),
			'weertype' => $oWeatherDay->weather[0]->description,
			'weericon' => 'http://openweathermap.org/img/w/'.$oWeatherDay->weather[0]->icon. '.png',
			'winddir' => getWindDir($oWeatherDay->deg),
			'windspd' => getWindSpeed($oWeatherDay->speed)
		);
	}
}

// Build weather display optimized for TV readability with focus on today
$sContent = '';

// Get brand color from config
$brandColor = isset($oConfig->display->brandColor) ? $oConfig->display->brandColor : '#04C104';

// Full width container that extends to edges
// Using position absolute to override the carousel__slide padding
// Right: 150px to align with top__datetime (respect TV overscan)
// Left padding: 48px to align with h1 (matches carousel__slide left padding)
// Top: 100px to match spacing under h1 on other slides
$sContent .= '<div style="position: absolute; left: 0; right: 150px; top: 100px; bottom: 0; padding: 0 40px 0 48px;">';

// Flex container to position sections side by side
$sContent .= '<div style="display: flex; gap: 40px; height: 100%;">';

// TODAY'S WEATHER - Less dominant (45% width)
if(isset($aWeatherData[0])) {
	$sContent .= '<div style="flex: 0 0 45%;">';

	$sContent .= '<div style="border: 3px solid ' . $brandColor . '; background: #fff;">';

	$sContent .= '<div style="background: ' . $brandColor . '; padding: 10px 25px;">';
	$sContent .= '<h2 style="margin: 0; font-size: 40px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 2px;">Vandaag</h2>';
	$sContent .= '</div>';

	$sContent .= '<div style="padding: 25px 25px 20px 25px;">';

	$sContent .= '<div style="margin-bottom: 20px;">';
	$sContent .= '<div style="font-size: 120px; font-weight: 800; line-height: 0.9; color: #000; letter-spacing: -5px;">' . $aWeatherData[0]['tempmax'] . '°</div>';
	$sContent .= '<div style="font-size: 36px; color: #666; margin-top: 8px; font-weight: 600;">minimaal ' . $aWeatherData[0]['tempmin'] . '°</div>';
	$sContent .= '</div>';

	$sContent .= '<div style="display: flex; align-items: center; margin-bottom: 20px; gap: 15px; padding-bottom: 20px; border-bottom: 2px solid #e0e0e0;">';
	$sContent .= '<img src="' . $aWeatherData[0]['weericon'] . '" style="width: 90px; height: 90px;"/>';
	$sContent .= '<div style="font-size: 32px; color: #000; font-weight: 600; line-height: 1.2; max-width: 280px;">' . ucfirst($aWeatherData[0]['weertype']) . '</div>';
	$sContent .= '</div>';

	$windForce = min($aWeatherData[0]['windspd'], 10);
	$windStrength = $windForce <= 3 ? 'Zwak' : ($windForce <= 6 ? 'Matig' : 'Krachtig');

	$sContent .= '<div style="padding-top: 15px;">';
	$sContent .= '<div style="font-size: 22px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600;">Wind</div>';
	$sContent .= '<div style="font-size: 44px; font-weight: 800; color: #000; line-height: 1;">' . $aWeatherData[0]['winddir'] . ' ' . $aWeatherData[0]['windspd'] . '</div>';
	$sContent .= '<div style="font-size: 26px; color: #000; font-weight: 600; margin-top: 4px;">' . $windStrength . '</div>';
	$sContent .= '</div>';

	$sContent .= '</div>';
	$sContent .= '</div>';

	$sContent .= '</div>';
}

// FORECAST SECTION - Takes remaining space (55%)
$sContent .= '<div style="flex: 1;">';

$sContent .= '<div style="margin-bottom: 30px;">';
$sContent .= '<h3 style="margin: 0; font-size: 32px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 1px;">Komende dagen</h3>';
$sContent .= '</div>';

$sContent .= '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px;">';

for($i = 1; $i <= 4; $i++) {
	if(isset($aWeatherData[$i])) {
		$sContent .= '<div style="background: #fff; border: 2px solid #ddd; padding: 18px 18px 18px 22px; position: relative;">';

		$sContent .= '<div style="position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: ' . $brandColor . ';"></div>';

		$dayName = $i == 1 ? 'Morgen' : $aWeatherData[$i]['date'];
		$sContent .= '<div style="font-size: 24px; font-weight: 700; color: #000; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">' . $dayName . '</div>';

		$sContent .= '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">';

		$sContent .= '<div style="display: flex; align-items: baseline; gap: 8px;">';
		$sContent .= '<span style="font-size: 54px; font-weight: 700; color: #000; line-height: 1;">' . $aWeatherData[$i]['tempmax'] . '°</span>';
		$sContent .= '<span style="font-size: 34px; color: #666; font-weight: 600;">' . $aWeatherData[$i]['tempmin'] . '°</span>';
		$sContent .= '</div>';

		$sContent .= '<img src="' . $aWeatherData[$i]['weericon'] . '" style="width: 60px; height: 60px;"/>';

		$sContent .= '</div>';

		$sContent .= '<div style="font-size: 22px; color: #000; margin-bottom: 8px; line-height: 1.2; font-weight: 500;">' . $aWeatherData[$i]['weertype'] . '</div>';

		$sContent .= '<div style="font-size: 20px; color: #555; font-weight: 500;">Wind: ' . $aWeatherData[$i]['winddir'] . ' ' . $aWeatherData[$i]['windspd'] . '</div>';

		$sContent .= '</div>';
	}
}

$sContent .= '</div>';
$sContent .= '</div>';

$sContent .= '</div>';
$sContent .= '</div>';

// Extract city name from location (e.g., "Amsterdam,NL" -> "Amsterdam")
// Always show "Weerstation [City]" for all locations
$sWeatherTitle = 'Weer';
$aCityParts = explode(',', $sWeatherLocation);
$sCityName = trim($aCityParts[0]);
if(!empty($sCityName)) {
	$sWeatherTitle = 'Weerstation ' . $sCityName;
}

$aData[] = array(
	'type' => 'weer',
	'title' => $sWeatherTitle,
	'photo' => '',
	'content' => $sContent);

// Prepare URLs for parallel API fetching
$iNumberOfPosts = $oConfig->content->numberOfPosts;
$sNewsUrl = $sBaseUrl.'/wp-json/wp/v2/posts?per_page=' . $iNumberOfPosts . '&_fields=title,kabelkrant_text,featured_media';

if(isset($oConfig->content->regio) && is_array($oConfig->content->regio) && count($oConfig->content->regio) > 0) {
	$sNewsUrl .= '&regio=' . urlencode(implode(',', $oConfig->content->regio));
}

// Fetch news and commercials in parallel
$aApiUrls = array(
	'news' => $sNewsUrl,
	'broadcast' => $sBaseUrl . '/wp-json/zw/v1/broadcast_data'
);

$aApiResults = fetchMultipleUrls($aApiUrls, 10);

// Parse news results
$oNews = $aApiResults['news'] !== false ? json_decode($aApiResults['news']) : array();

// Collect all media IDs that need to be fetched
$aMediaIds = array();
if($oNews) {
	foreach ($oNews as $oItem) {
		if(trim((string)$oItem->kabelkrant_text)!="" && (string)$oItem->featured_media!='') {
			$aMediaIds[] = (string)$oItem->featured_media;
		}
	}
}

// Fetch media URLs if needed
$aMediaUrls = array();
if(count($aMediaIds) > 0) {
	$sMediaUrl = $sBaseUrl.'/wp-json/wp/v2/media?include=' . implode(',', $aMediaIds) . '&_fields=id,source_url';
	$sMediaData = fetchUrlWithTimeout($sMediaUrl, 10);
	if($sMediaData !== false) {
		$oMedia = json_decode($sMediaData);
		if($oMedia) {
			foreach($oMedia as $oMediaItem) {
				$aMediaUrls[$oMediaItem->id] = $oMediaItem->source_url;
			}
		}
	}
}

// Build news data array
$iCounter = 0;
foreach ($oNews as $oItem) {
	if(trim((string)$oItem->kabelkrant_text)!="") {
		$sPhoto = $oConfig->images->standardLogo;
		if((string)$oItem->featured_media!='' && isset($aMediaUrls[(int)$oItem->featured_media])) {
			$sPhoto = $aMediaUrls[(int)$oItem->featured_media];
		}

		$aData[] = array(
			'type' => 'nieuws',
			'title' => (string)$oItem->title->rendered,
			'photo' => $sPhoto,
			'content' => (string)$oItem->kabelkrant_text);
	}
}

// Parse commercials data (already fetched in parallel with news)
$oReclame = $aApiResults['broadcast'] !== false ? json_decode($aApiResults['broadcast']) : null;

if($oReclame && isset($oReclame->commercials) && count($oReclame->commercials)>0) {
	$aData[] = array(
		'type' => 'reclame',
		'title' => 'Reclame',
		'photo' => $oConfig->images->reclameLogo);

	foreach ($oReclame->commercials as $oItem) {
		$aData[] = array(
			'type' => 'reclame',
			'title' => 'reclame',
			'photo' => $oItem);
	}
}

echo json_encode($aData);

?>
