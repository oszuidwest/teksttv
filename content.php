<?php

// Get config ID from URL parameter, default to "zwtv1"
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

if(!isset($oConfig->images->weatherLogo) || !isset($oConfig->images->standardLogo) || !isset($oConfig->images->reclameLogo)) {
    header('HTTP/1.1 500 Internal Server Error');
    die(json_encode(['error' => 'Missing required image configuration (weatherLogo, standardLogo, or reclameLogo)']));
}

$sBaseUrl = $oConfig->content->newsApiUrl;

error_reporting(E_ALL);
ini_set('display_errors', 'true');

error_reporting(~E_ALL);
ini_set('display_errors', 'false');

setlocale(LC_ALL, 'nl_NL.utf8');

function debug($s) {
	print_r($s);
	echo "\n";
}

//echo "<pre>";

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

# Weer ophalen
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
		$sWeatherData = @file_get_contents($sUrl);

		if ($sWeatherData !== false) {
			$oWeather = json_decode($sWeatherData);
			// Save to location-specific cache file
			file_put_contents($sWeatherCacheFile, $sWeatherData);
			// Also maintain backward compatibility with the default weather.json
			if($sWeatherLocation === 'Woensdrecht,NL') {
				file_put_contents('./weather.json', $sWeatherData);
			}
			break;
		}
		if ($iRetryCounter < 3) {
			sleep(1); // Short delay before retry
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

// Build modern, magazine-style weather layout
$sContent = '';

// Get brand color from config
$brandColor = isset($oConfig->display->brandColor) ? $oConfig->display->brandColor : '#04C104';

// Create two-column layout: Today's weather hero (left) and 4-day forecast (right)
if(isset($aWeatherData[0])) {
	// TODAY'S WEATHER - Hero Section (Left side, 40% width)
	$sContent .= '<div style="position: absolute; left: 50px; top: 90px; width: 35%;">';

	// Large "VANDAAG" header with accent line
	$sContent .= '<div style="border-bottom: 4px solid ' . $brandColor . '; padding-bottom: 10px; margin-bottom: 30px;">';
	$sContent .= '<h2 style="margin: 0; font-size: 48px; font-weight: 300; color: #333;">VANDAAG</h2>';
	$sContent .= '</div>';

	// Huge temperature display
	$sContent .= '<div style="margin-bottom: 30px;">';
	$sContent .= '<div style="font-size: 120px; font-weight: bold; line-height: 1; color: #222; margin-bottom: 10px;">' . $aWeatherData[0]['tempmax'] . '°</div>';
	$sContent .= '<div style="font-size: 40px; color: #888;">Minimum: ' . $aWeatherData[0]['tempmin'] . '°</div>';
	$sContent .= '</div>';

	// Large weather icon and description
	$sContent .= '<div style="display: flex; align-items: center; margin-bottom: 30px;">';
	$sContent .= '<img src="' . $aWeatherData[0]['weericon'] . '" style="width: 100px; height: 100px; margin-right: 20px;"/>';
	$sContent .= '<div style="font-size: 36px; color: #444; line-height: 1.3;">' . ucfirst($aWeatherData[0]['weertype']) . '</div>';
	$sContent .= '</div>';

	// Wind information with visual indicator
	$windForce = min($aWeatherData[0]['windspd'], 10);
	$windStrength = $windForce <= 3 ? 'Zwak' : ($windForce <= 6 ? 'Matig' : 'Krachtig');
	$windColor = $windForce <= 3 ? '#4CAF50' : ($windForce <= 6 ? '#FF9800' : '#F44336');

	$sContent .= '<div style="background: rgba(0,0,0,0.05); padding: 20px; border-radius: 8px;">';
	$sContent .= '<div style="font-size: 24px; color: #666; margin-bottom: 10px;">WIND</div>';
	$sContent .= '<div style="display: flex; justify-content: space-between; align-items: center;">';
	$sContent .= '<div>';
	$sContent .= '<span style="font-size: 36px; font-weight: bold; color: ' . $windColor . ';">' . $aWeatherData[0]['winddir'] . ' ' . $aWeatherData[0]['windspd'] . '</span>';
	$sContent .= '<div style="font-size: 24px; color: #777; margin-top: 5px;">' . $windStrength . '</div>';
	$sContent .= '</div>';

	// Wind strength bar
	$sContent .= '<div style="width: 120px; height: 10px; background: rgba(0,0,0,0.1); border-radius: 5px; overflow: hidden;">';
	$sContent .= '<div style="width: ' . ($windForce * 10) . '%; height: 100%; background: ' . $windColor . ';"></div>';
	$sContent .= '</div>';
	$sContent .= '</div>';
	$sContent .= '</div>';

	$sContent .= '</div>';
}

// 4-DAY FORECAST - Grid (Right side, 55% width)
$sContent .= '<div style="position: absolute; right: 50px; top: 90px; width: 55%;">';

// "VOORUITZICHT" header
$sContent .= '<h3 style="font-size: 32px; font-weight: 300; color: #666; margin: 0 0 25px 0; padding-bottom: 10px; border-bottom: 1px solid rgba(0,0,0,0.1);">4-DAAGSE VOORUITZICHT</h3>';

// Create 2x2 grid for next 4 days
$sContent .= '<div style="display: flex; flex-wrap: wrap; gap: 20px;">';

for($i = 1; $i <= 4; $i++) {
	if(isset($aWeatherData[$i])) {
		// Each forecast card (2 per row)
		$sContent .= '<div style="width: calc(50% - 10px); background: rgba(255,255,255,0.5); padding: 20px; border-left: 3px solid ' . $brandColor . '; min-height: 180px;">';

		// Day name
		$dayName = $i == 1 ? 'Morgen' : $aWeatherData[$i]['date'];
		$sContent .= '<div style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 15px;">' . $dayName . '</div>';

		// Icon and temps in flex layout
		$sContent .= '<div style="display: flex; align-items: center; gap: 15px;">';
		$sContent .= '<img src="' . $aWeatherData[$i]['weericon'] . '" style="width: 60px; height: 60px;"/>';
		$sContent .= '<div>';
		$sContent .= '<div style="font-size: 36px; font-weight: bold; color: #222;">' . $aWeatherData[$i]['tempmax'] . '°</div>';
		$sContent .= '<div style="font-size: 24px; color: #888;">' . $aWeatherData[$i]['tempmin'] . '°</div>';
		$sContent .= '</div>';
		$sContent .= '</div>';

		// Weather description
		$sContent .= '<div style="font-size: 20px; color: #555; margin-top: 10px;">' . $aWeatherData[$i]['weertype'] . '</div>';

		// Compact wind info
		$sContent .= '<div style="font-size: 18px; color: #777; margin-top: 8px;">Wind: ' . $aWeatherData[$i]['winddir'] . ' ' . $aWeatherData[$i]['windspd'] . '</div>';

		$sContent .= '</div>';
	}
}

$sContent .= '</div>'; // End grid
$sContent .= '</div>'; // End right column

// Decorative windsock in top right corner
if(isset($aWeatherData[0])) {
	$windAngle = 30 - (min($aWeatherData[0]['windspd'], 10) * 3);

	$sContent .= '<div style="position: absolute; right: 20px; top: 50px; opacity: 0.1;">';
	$sContent .= '<svg width="150" height="100" viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg">';

	// Simple windsock
	$sContent .= '<g transform="translate(20, 50) rotate(' . $windAngle . ')">';
	$sContent .= '<path d="M 0,0 L 60,-8 L 80,-4 L 90,0 L 80,4 L 60,8 L 0,0 Z" fill="' . $brandColor . '" opacity="0.5"/>';
	$sContent .= '<rect x="15" y="-8" width="10" height="16" fill="white" opacity="0.3"/>';
	$sContent .= '<rect x="35" y="-6" width="10" height="12" fill="white" opacity="0.3"/>';
	$sContent .= '<rect x="55" y="-4" width="8" height="8" fill="white" opacity="0.3"/>';
	$sContent .= '</g>';

	$sContent .= '</svg>';
	$sContent .= '</div>';
}

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
	'video' => '',
	'content' => $sContent);

# Nieuws ophalen
$iNumberOfPosts = $oConfig->content->numberOfPosts;
$sNewsUrl = $sBaseUrl.'/wp-json/wp/v2/posts?per_page=' . $iNumberOfPosts . '&_fields=title,kabelkrant_text,featured_media';

// Add region parameter from config.json (regio is optional, must be an array if present)
if(isset($oConfig->content->regio) && is_array($oConfig->content->regio)) {
	$sNewsUrl .= '&regio=' . urlencode(implode(',', $oConfig->content->regio));
}

$oNews = json_decode(file_get_contents($sNewsUrl));

$iCounter = 0;
foreach ($oNews as $oItem) {
	if(trim((string)$oItem->kabelkrant_text)!="") {
		$sPhoto = $oConfig->images->standardLogo;
		# Als er een foto geupload is
		if((string)$oItem->featured_media!='') {
			$oMedia = json_decode(file_get_contents($sBaseUrl."/wp-json/wp/v2/media/".$oItem->featured_media."?_fields=source_url"));
			if($oMedia!="")	$sPhoto = $oMedia->source_url;
		}

		$aData[] = array(
			'type' => 'nieuws',
			'title' => (string)$oItem->title->rendered,
			'photo' => $sPhoto,
			'video' => '', //(((string) $oItem ->video)!="") ? (string) $oItem->video : '',
			'content' => (string)$oItem->kabelkrant_text);
	}
}

# Reclame ophalen

//$oReclame = json_decode(file_get_contents('https://preview.zuidwestupdate.nl/wp-json/zw/v1/broadcast_data'));
$oReclame  = json_decode(file_get_contents($sBaseUrl.'/wp-json/zw/v1/broadcast_data'));

if(count($oReclame->commercials)>0) {
	$aData[] = array(
		'type' => 'reclame',
		'title' => 'Reclame',
		'photo' => $oConfig->images->reclameLogo);
}

foreach ($oReclame->commercials as $oItem) {
	$aData[] = array(
		'type' => 'reclame',
		'title' => 'reclame', 
		'photo' => $oItem);
}

//print_r($aData);
echo json_encode($aData);

?>
