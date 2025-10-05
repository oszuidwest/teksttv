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

$sContent = '<table style="position: absolute; top: 90px; font-size: 42px; text-align: center; width: 75%;" cellspacing=0 cellpadding=3><tr>';
if(isset($aWeatherData[0])) $sContent .= '		<td style="width: 20%;">Vandaag</td>';
if(isset($aWeatherData[1])) $sContent .= '		<td style="border-left: 1px solid #B5B5B5; width: 20%;">Morgen</td>';
if(isset($aWeatherData[2])) $sContent .= '		<td style="border-left: 1px solid #B5B5B5; width: 20%;">'.$aWeatherData[2]['date'].'</td>';
if(isset($aWeatherData[3])) $sContent .= '		<td style="border-left: 1px solid #B5B5B5; width: 20%;">'.$aWeatherData[3]['date'].'</td>';
if(isset($aWeatherData[4])) $sContent .= '		<td style="border-left: 1px solid #B5B5B5; width: 20%;">'.$aWeatherData[4]['date'].'</td>';
$sContent .= '	</tr><tr>';
if(isset($aWeatherData[0])) $sContent .= '		<td><img style="width: 75px;" src="'.$aWeatherData[0]['weericon'].'"/></td>';
if(isset($aWeatherData[1])) $sContent .= '		<td style="border-left: 1px solid #B5B5B5;"><img style="width: 75px;" src="'.$aWeatherData[1]['weericon'].'"/></td>';
if(isset($aWeatherData[2])) $sContent .= '		<td style="border-left: 1px solid #B5B5B5;"><img style="width: 75px;" src="'.$aWeatherData[2]['weericon'].'"/></td>';
if(isset($aWeatherData[3])) $sContent .= '		<td style="border-left: 1px solid #B5B5B5;"><img style="width: 75px;" src="'.$aWeatherData[3]['weericon'].'"/></td>';
if(isset($aWeatherData[4])) $sContent .= '		<td style="border-left: 1px solid #B5B5B5;"><img style="width: 75px;" src="'.$aWeatherData[4]['weericon'].'"/></td>';
$sContent .= '	</tr><tr>';
if(isset($aWeatherData[0])) $sContent .= '		<td nowrap>'.$aWeatherData[0]['weertype'].'</td>';
if(isset($aWeatherData[1])) $sContent .= '		<td nowrap style="border-left: 1px solid #B5B5B5;">'.$aWeatherData[1]['weertype'].'</td>';
if(isset($aWeatherData[2])) $sContent .= '		<td nowrap style="border-left: 1px solid #B5B5B5;">'.$aWeatherData[2]['weertype'].'</td>';
if(isset($aWeatherData[3])) $sContent .= '		<td nowrap style="border-left: 1px solid #B5B5B5;">'.$aWeatherData[3]['weertype'].'</td>';
if(isset($aWeatherData[4])) $sContent .= '		<td nowrap style="border-left: 1px solid #B5B5B5;">'.$aWeatherData[4]['weertype'].'</td>';
$sContent .= '	</tr><tr>';
if(isset($aWeatherData[0])) $sContent .= '		<td nowrap>'.$aWeatherData[0]['tempmin'].'&deg; / '.$aWeatherData[0]['tempmax'].'&deg;</td>';
if(isset($aWeatherData[1])) $sContent .= '		<td nowrap style="border-left: 1px solid #B5B5B5;">'.$aWeatherData[1]['tempmin'].'&deg; / '.$aWeatherData[1]['tempmax'].'&deg;</td>';
if(isset($aWeatherData[2])) $sContent .= '		<td nowrap style="border-left: 1px solid #B5B5B5;">'.$aWeatherData[2]['tempmin'].'&deg; / '.$aWeatherData[2]['tempmax'].'&deg;</td>';
if(isset($aWeatherData[3])) $sContent .= '		<td nowrap style="border-left: 1px solid #B5B5B5;">'.$aWeatherData[3]['tempmin'].'&deg; / '.$aWeatherData[3]['tempmax'].'&deg;</td>';
if(isset($aWeatherData[4])) $sContent .= '		<td nowrap style="border-left: 1px solid #B5B5B5;">'.$aWeatherData[4]['tempmin'].'&deg; / '.$aWeatherData[4]['tempmax'].'&deg;</td>';
$sContent .= '	</tr><tr>';
if(isset($aWeatherData[0])) $sContent .= '		<td>'.$aWeatherData[0]['winddir'].' '.$aWeatherData[0]['windspd'].'</td>';
if(isset($aWeatherData[1])) $sContent .= '		<td style="border-left: 1px solid #B5B5B5;">'.$aWeatherData[1]['winddir'].' '.$aWeatherData[1]['windspd'].'</td>';
if(isset($aWeatherData[2])) $sContent .= '		<td style="border-left: 1px solid #B5B5B5;">'.$aWeatherData[2]['winddir'].' '.$aWeatherData[2]['windspd'].'</td>';
if(isset($aWeatherData[3])) $sContent .= '		<td style="border-left: 1px solid #B5B5B5;">'.$aWeatherData[3]['winddir'].' '.$aWeatherData[3]['windspd'].'</td>';
if(isset($aWeatherData[4])) $sContent .= '		<td style="border-left: 1px solid #B5B5B5;">'.$aWeatherData[4]['winddir'].' '.$aWeatherData[4]['windspd'].'</td>';
$sContent .= '	</tr></table>';

// Extract city name from location (e.g., "Amsterdam,NL" -> "Amsterdam")
// Show "Weer" by default, or "Weerstation [City]" if it's not the default config location
$sWeatherTitle = 'Weer';
if(isset($oConfigFile->default) && isset($oConfigFile->configurations->{$oConfigFile->default})) {
	$oDefaultConfig = $oConfigFile->configurations->{$oConfigFile->default};
	if($sWeatherLocation !== $oDefaultConfig->weather->location) {
		$aCityParts = explode(',', $sWeatherLocation);
		$sCityName = trim($aCityParts[0]);
		if(!empty($sCityName)) {
			$sWeatherTitle = 'Weerstation ' . $sCityName;
		}
	}
}

$aData[] = array(
	'type' => 'weer',
	'title' => $sWeatherTitle,
	'photo' => $oConfig->images->weatherLogo,
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
