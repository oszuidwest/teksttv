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

// Build perfect information architecture for TV weather display
$sContent = '';

// Get brand color from config
$brandColor = isset($oConfig->display->brandColor) ? $oConfig->display->brandColor : '#04C104';

// Full width container with proper margins and ticker clearance
$sContent .= '<div style="position: absolute; left: 80px; right: 80px; top: 90px; height: 420px;">';

// TODAY'S WEATHER - Primary focus (Left panel, 38% of container)
if(isset($aWeatherData[0])) {
	$sContent .= '<div style="position: absolute; left: 0; top: 0; width: 38%;">';

	// Section header with strong visual anchor
	$sContent .= '<div style="margin-bottom: 50px;">';
	$sContent .= '<div style="display: inline-block; border-bottom: 3px solid ' . $brandColor . '; padding-bottom: 8px;">';
	$sContent .= '<h2 style="margin: 0; font-size: 36px; font-weight: 600; color: #000; text-transform: uppercase; letter-spacing: 3px;">Vandaag</h2>';
	$sContent .= '</div>';
	$sContent .= '</div>';

	// Primary temperature - maximum visual impact
	$sContent .= '<div style="margin-bottom: 45px;">';
	$sContent .= '<div style="font-size: 130px; font-weight: 200; line-height: 1; color: #000; letter-spacing: -5px;">' . $aWeatherData[0]['tempmax'] . '°</div>';
	$sContent .= '<div style="font-size: 36px; color: #666; margin-top: 20px; font-weight: 300;">minimaal ' . $aWeatherData[0]['tempmin'] . '°</div>';
	$sContent .= '</div>';

	// Weather condition with icon - clear pairing
	$sContent .= '<div style="display: flex; align-items: center; margin-bottom: 50px; gap: 25px;">';
	$sContent .= '<img src="' . $aWeatherData[0]['weericon'] . '" style="width: 100px; height: 100px;"/>';
	$sContent .= '<div style="font-size: 30px; color: #222; font-weight: 400; line-height: 1.3; max-width: 250px;">' . ucfirst($aWeatherData[0]['weertype']) . '</div>';
	$sContent .= '</div>';

	// Wind information - secondary data group
	$windForce = min($aWeatherData[0]['windspd'], 10);
	$windStrength = $windForce <= 3 ? 'Zwak' : ($windForce <= 6 ? 'Matig' : 'Krachtig');

	$sContent .= '<div style="border-top: 2px solid #e0e0e0; padding-top: 30px;">';
	$sContent .= '<div style="font-size: 18px; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; font-weight: 600;">Wind</div>';
	$sContent .= '<div style="display: flex; align-items: baseline; gap: 20px;">';
	$sContent .= '<div style="font-size: 46px; font-weight: 600; color: #000;">' . $aWeatherData[0]['winddir'] . ' ' . $aWeatherData[0]['windspd'] . '</div>';
	$sContent .= '<div style="font-size: 26px; color: #666; font-weight: 300;">' . $windStrength . '</div>';
	$sContent .= '</div>';
	$sContent .= '</div>';

	$sContent .= '</div>';
}

// FORECAST SECTION - Secondary focus (Right panel, 58% of container)
$sContent .= '<div style="position: absolute; right: 0; top: 0; width: 58%;">';

// Section header aligned with left panel
$sContent .= '<div style="margin-bottom: 50px;">';
$sContent .= '<h3 style="margin: 0; font-size: 24px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 2px;">Vooruitzicht</h3>';
$sContent .= '</div>';

// Forecast grid - 2x2 with appropriate spacing for container height
$sContent .= '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px;">';

for($i = 1; $i <= 4; $i++) {
	if(isset($aWeatherData[$i])) {
		// Forecast card with clear information hierarchy
		$sContent .= '<div style="background: #f9f9f9; padding: 24px; position: relative;">';

		// Visual accent bar
		$sContent .= '<div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: ' . $brandColor . ';"></div>';

		// Day label - clear and prominent
		$dayName = $i == 1 ? 'Morgen' : $aWeatherData[$i]['date'];
		$sContent .= '<div style="font-size: 20px; font-weight: 600; color: #000; margin-bottom: 18px; text-transform: uppercase; letter-spacing: 1.5px;">' . $dayName . '</div>';

		// Temperature and icon group
		$sContent .= '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">';

		// Temperature hierarchy
		$sContent .= '<div style="display: flex; align-items: baseline; gap: 12px;">';
		$sContent .= '<span style="font-size: 52px; font-weight: 300; color: #000; line-height: 1;">' . $aWeatherData[$i]['tempmax'] . '°</span>';
		$sContent .= '<span style="font-size: 32px; color: #777; font-weight: 300;">' . $aWeatherData[$i]['tempmin'] . '°</span>';
		$sContent .= '</div>';

		// Weather icon
		$sContent .= '<img src="' . $aWeatherData[$i]['weericon'] . '" style="width: 75px; height: 75px;"/>';

		$sContent .= '</div>';

		// Weather description - larger and higher contrast
		$sContent .= '<div style="font-size: 22px; color: #111; margin-bottom: 15px; line-height: 1.3; font-weight: 400;">' . $aWeatherData[$i]['weertype'] . '</div>';

		// Wind - more prominent with better contrast
		$sContent .= '<div style="font-size: 20px; color: #333; font-weight: 500; background: rgba(255,255,255,0.6); padding: 8px 12px; display: inline-block;">Wind: ' . $aWeatherData[$i]['winddir'] . ' ' . $aWeatherData[$i]['windspd'] . '</div>';

		$sContent .= '</div>';
	}
}

$sContent .= '</div>'; // End grid
$sContent .= '</div>'; // End forecast section

$sContent .= '</div>'; // End container

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
