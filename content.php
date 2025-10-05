<?php

$sBaseUrl = "https://www.zuidwestupdate.nl";

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
// Handle location parameter for weather
$sWeatherLocation = 'Woensdrecht,NL';
if(isset($_GET['location']) && !empty($_GET['location'])) {
	// Sanitize the location parameter - allow letters, numbers, spaces, commas, and hyphens
	$sWeatherLocation = preg_replace('/[^a-zA-Z0-9\s,\-]/', '', $_GET['location']);
	if(empty($sWeatherLocation)) {
		$sWeatherLocation = 'Woensdrecht,NL';
	}
}

// Determine cache file name based on location
$sWeatherCacheFile = './weather_' . preg_replace('/[^a-zA-Z0-9]/', '_', strtolower($sWeatherLocation)) . '.json';

// Check if cache exists and is less than 1 hour old
if(file_exists($sWeatherCacheFile) && (time() - filemtime($sWeatherCacheFile) < 3600)) {
	// Use cached data
	$oWeather = json_decode(file_get_contents($sWeatherCacheFile));
} else {
	// Fetch new weather data from OpenWeatherMap
	$oWeather = null;
	for ($iRetryCounter = 0; $iRetryCounter <= 3; $iRetryCounter++) {
		$sUrl = 'http://api.openweathermap.org/data/2.5/forecast/daily?q=' . urlencode($sWeatherLocation) . '&units=metric&lang=nl&cnt=5&appid=1e8c419c622b073f3fb80961fba99241';
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
$sWeatherTitle = 'Weer';
if($sWeatherLocation !== 'Woensdrecht,NL') {
	$aCityParts = explode(',', $sWeatherLocation);
	$sCityName = trim($aCityParts[0]);
	if(!empty($sCityName)) {
		$sWeatherTitle = 'Weerstation ' . $sCityName;
	}
}

$aData[] = array(
	'type' => 'weer',
	'title' => $sWeatherTitle,
	'photo' => 'images/Weer - logo - kabelkrant2.jpg',
	'video' => '',
	'content' => $sContent);

# Nieuws ophalen
$sNewsUrl = $sBaseUrl.'/wp-json/wp/v2/posts?per_page=15&_fields=title,kabelkrant_text,featured_media';

// Add region parameter if provided
if(isset($_GET['regio']) && !empty($_GET['regio'])) {
	// Sanitize the region parameter - allow only numbers and commas
	$sRegio = preg_replace('/[^0-9,]/', '', $_GET['regio']);
	if(!empty($sRegio)) {
		$sNewsUrl .= '&regio=' . $sRegio;
	}
}

$oNews = json_decode(file_get_contents($sNewsUrl));

$iCounter = 0;
foreach ($oNews as $oItem) {
	if(trim((string)$oItem->kabelkrant_text)!="") {
		$sPhoto = 'images/Standaard - logo - kabelkrant2.jpg';
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
		'photo' => 'images/Kabelkrant reclame.jpg');
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
