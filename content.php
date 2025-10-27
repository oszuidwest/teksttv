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
		default: return 'Onbekend';
	}
}

/**
 * Fetch region hierarchy from WordPress API with pagination support
 * Caches the result for 24 hours to avoid repeated API calls
 * @param string $sBaseUrl WordPress site base URL
 * @return array Mapping of parent region IDs to array of child region IDs
 */
function fetchRegionHierarchy($sBaseUrl) {
	$sCacheFile = './region_hierarchy.json';
	$iCacheTime = 24 * 3600; // 24 hours

	// Check if cache exists and is less than 24 hours old
	if(file_exists($sCacheFile) && (time() - filemtime($sCacheFile) < $iCacheTime)) {
		$sCachedData = file_get_contents($sCacheFile);
		$aHierarchy = json_decode($sCachedData, true);
		if($aHierarchy !== null) {
			return $aHierarchy;
		}
	}

	// Fetch all regions from WordPress API with pagination
	$aAllRegios = array();
	$iPage = 1;
	$iPerPage = 100;
	$iMaxPages = 20; // Safety limit to prevent infinite loops (covers up to 2000 regions)

	while($iPage <= $iMaxPages) {
		$sRegioUrl = $sBaseUrl . '/wp-json/wp/v2/regio?per_page=' . $iPerPage . '&page=' . $iPage . '&_fields=id,parent';
		$sRegioData = fetchUrlWithTimeout($sRegioUrl, 10);

		if($sRegioData === false) {
			break; // API error, use what we have
		}

		$aRegios = json_decode($sRegioData, true);
		if(!is_array($aRegios) || count($aRegios) === 0) {
			break; // No more results
		}

		// Merge this page of results
		$aAllRegios = array_merge($aAllRegios, $aRegios);

		// If we got fewer results than requested, we've reached the last page
		if(count($aRegios) < $iPerPage) {
			break;
		}

		$iPage++;
	}

	$aHierarchy = array();

	if(count($aAllRegios) > 0) {
		// Build parent-to-children mapping
		foreach($aAllRegios as $oRegio) {
			if(isset($oRegio['parent']) && $oRegio['parent'] > 0) {
				$iParent = (int)$oRegio['parent'];
				$iChild = (int)$oRegio['id'];

				if(!isset($aHierarchy[$iParent])) {
					$aHierarchy[$iParent] = array();
				}
				$aHierarchy[$iParent][] = $iChild;
			}
		}

		// Cache the hierarchy
		file_put_contents($sCacheFile, json_encode($aHierarchy));
	}

	return $aHierarchy;
}

/**
 * Expand region list to include sub-regions for any main regions
 * Automatically fetches region hierarchy from the WordPress API
 * @param array $aRegions Array of region IDs
 * @param string $sBaseUrl WordPress site base URL
 * @return array Expanded array of region IDs (unique values only)
 */
function expandRegions($aRegions, $sBaseUrl) {
	// Fetch region hierarchy dynamically
	$aRegionMapping = fetchRegionHierarchy($sBaseUrl);

	$aExpandedRegions = array();

	foreach($aRegions as $iRegion) {
		// Add the region itself
		$aExpandedRegions[] = $iRegion;

		// If this is a main region with sub-regions, add them too
		if(isset($aRegionMapping[$iRegion])) {
			foreach($aRegionMapping[$iRegion] as $iSubRegion) {
				$aExpandedRegions[] = $iSubRegion;
			}
		}
	}

	// Return unique values only
	return array_unique($aExpandedRegions);
}

function getDayAbbr($iDay) {
	switch($iDay) {
		case 1: return 'ma';
		case 2: return 'di';
		case 3: return 'wo';
		case 4: return 'do';
		case 5: return 'vr';
		case 6: return 'za';
		case 7: return 'zo';
		default: return '??';
	}
}

/**
 * Map OpenWeatherMap weather codes to QWeather icon codes
 * @param int $weatherId OpenWeatherMap weather condition ID
 * @param string $icon OpenWeatherMap icon code (for day/night detection)
 * @return string QWeather icon code
 */
function getQWeatherIcon($weatherId, $icon = '01d') {
	// Determine if it's day or night from OpenWeatherMap icon
	$isNight = strpos($icon, 'n') !== false;

	// Map OpenWeatherMap IDs to QWeather icon codes
	// See: https://openweathermap.org/weather-conditions
	// QWeather codes: https://icons.qweather.com/en/
	switch($weatherId) {
		// Group 2xx: Thunderstorm
		case 200: return '304';  // Thunderstorm with light rain
		case 201: return '304';  // Thunderstorm with rain
		case 202: return '304';  // Thunderstorm with heavy rain
		case 210: return '303';  // Light thunderstorm
		case 211: return '303';  // Thunderstorm
		case 212: return '304';  // Heavy thunderstorm
		case 221: return '304';  // Ragged thunderstorm
		case 230: return '304';  // Thunderstorm with light drizzle
		case 231: return '304';  // Thunderstorm with drizzle
		case 232: return '304';  // Thunderstorm with heavy drizzle

		// Group 3xx: Drizzle
		case 300: return '309';  // Light intensity drizzle
		case 301: return '309';  // Drizzle
		case 302: return '310';  // Heavy intensity drizzle
		case 310: return '309';  // Light intensity drizzle rain
		case 311: return '310';  // Drizzle rain
		case 312: return '311';  // Heavy intensity drizzle rain
		case 313: return '313';  // Shower rain and drizzle
		case 314: return '312';  // Heavy shower rain and drizzle
		case 321: return '313';  // Shower drizzle

		// Group 5xx: Rain
		case 500: return '305';  // Light rain
		case 501: return '306';  // Moderate rain
		case 502: return '307';  // Heavy intensity rain
		case 503: return '308';  // Very heavy rain
		case 504: return '312';  // Extreme rain
		case 511: return '404';  // Freezing rain
		case 520: return '300';  // Light intensity shower rain
		case 521: return '301';  // Shower rain
		case 522: return '302';  // Heavy intensity shower rain
		case 531: return '302';  // Ragged shower rain

		// Group 6xx: Snow
		case 600: return '400';  // Light snow
		case 601: return '401';  // Snow
		case 602: return '402';  // Heavy snow
		case 611: return '404';  // Sleet
		case 612: return '405';  // Light shower sleet
		case 613: return '406';  // Shower sleet
		case 615: return '404';  // Light rain and snow
		case 616: return '405';  // Rain and snow
		case 620: return '400';  // Light shower snow
		case 621: return '401';  // Shower snow
		case 622: return '403';  // Heavy shower snow

		// Group 7xx: Atmosphere
		case 701: return '501';  // Mist
		case 711: return '502';  // Smoke
		case 721: return '504';  // Haze
		case 731: return '503';  // Sand/dust whirls
		case 741: return '501';  // Fog
		case 751: return '503';  // Sand
		case 761: return '504';  // Dust
		case 762: return '502';  // Volcanic ash
		case 771: return '507';  // Squalls
		case 781: return '508';  // Tornado

		// Group 800: Clear
		case 800: return $isNight ? '150' : '100';  // Clear sky

		// Group 80x: Clouds
		case 801: return $isNight ? '151' : '101';  // Few clouds: 11-25%
		case 802: return $isNight ? '152' : '102';  // Scattered clouds: 25-50%
		case 803: return $isNight ? '153' : '103';  // Broken clouds: 51-84%
		case 804: return '104';                      // Overcast clouds: 85-100%

		// Default
		default: return '999';  // Unknown/Not available
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
			'date' => getDay((int)$oDate->format('N')),
			'dayAbbr' => getDayAbbr((int)$oDate->format('N')),
			'tempday' => round($oWeatherDay->temp->day, 1),
			'tempmin' => round($oWeatherDay->temp->min, 1),
			'tempmax' => round($oWeatherDay->temp->max, 1),
			'weertype' => $oWeatherDay->weather[0]->description,
			'weericon' => 'http://openweathermap.org/img/w/'.$oWeatherDay->weather[0]->icon. '.png',
			'qweatherIcon' => getQWeatherIcon($oWeatherDay->weather[0]->id, $oWeatherDay->weather[0]->icon),
			'weatherId' => $oWeatherDay->weather[0]->id,
			'winddir' => getWindDir($oWeatherDay->deg),
			'windspd' => getWindSpeed($oWeatherDay->speed)
		);
	}
}

// Build weather display as a clean table
$sContent = '';

// Get brand color from config
$brandColor = isset($oConfig->display->brandColor) ? $oConfig->display->brandColor : '#04C104';

// Container for the weather table
$sContent .= '<div style="position: absolute; left: 48px; right: 150px; top: 140px; bottom: 200px; display: flex; align-items: center; justify-content: center;">';

// Create table with 4 columns (today + 3 days)
$sContent .= '<div style="width: 100%; max-width: 1200px; position: relative;">';

// Background accent - diagonal brand color strip
$sContent .= '<div style="position: absolute; top: -20px; left: -20px; right: -20px; height: 80px; background: linear-gradient(135deg, ' . $brandColor . ' 0%, ' . $brandColor . ' 50%, transparent 50%); opacity: 0.2; z-index: 0;"></div>';

// Main table wrapper with subtle background
$sContent .= '<div style="position: relative; z-index: 1; background: #fafafa; border: 1px solid #e0e0e0; overflow: hidden;">';

// Table with 4 days - today slightly larger
$sContent .= '<table style="width: 100%; border-collapse: collapse; table-layout: fixed;">';

// Calculate column widths - today gets 28%, others get 24% each
$todayWidth = '28%';
$otherWidth = '24%';

// Row 1: Day headers with gradient background
$sContent .= '<tr>';
for($i = 0; $i <= 3; $i++) {
	if(isset($aWeatherData[$i])) {
		$width = $i === 0 ? $todayWidth : $otherWidth;
		$dayAbbr = $i === 0 ? 'vandaag' : (isset($aWeatherData[$i]['dayAbbr']) ? $aWeatherData[$i]['dayAbbr'] : substr($aWeatherData[$i]['date'], 0, 2));
		$fontSize = $i === 0 ? '42px' : '36px';
		$padding = $i === 0 ? '25px 15px' : '20px 15px';
		$bgGradient = $i === 0
			? 'background: ' . $brandColor . ';'
			: 'background: #5A5A5A;';  // Neutral dark gray for other days

		$sContent .= '<td style="' . $bgGradient . ' color: #fff; text-align: center; padding: ' . $padding . '; font-size: ' . $fontSize . '; font-weight: 800; text-transform: lowercase; width: ' . $width . '; position: relative;">';

		// Add white accent line for today
		if($i === 0) {
			$sContent .= '<div style="position: absolute; top: 0; left: 0; right: 0; height: 5px; background: #fff; opacity: 0.3;"></div>';
		}

		$sContent .= $dayAbbr;
		$sContent .= '</td>';
	} else {
		$sContent .= '<td></td>';
	}
}
$sContent .= '</tr>';

// Row 2: Weather icons using QWeather
$sContent .= '<tr>';
for($i = 0; $i <= 3; $i++) {
	if(isset($aWeatherData[$i])) {
		$iconSize = $i === 0 ? '110px' : '90px';
		$padding = $i === 0 ? '30px 15px' : '25px 15px';
		// Light tint of brand color for today, gray for other days
		$bgColor = $i === 0 ? $brandColor . '15' : '#f3f3f3';  // 15 hex = ~8% opacity

		$sContent .= '<td style="background: ' . $bgColor . '; text-align: center; padding: ' . $padding . '; position: relative;">';

		// Add subtle left border for separation (except first column)
		if($i > 0) {
			$sContent .= '<div style="position: absolute; left: 0; top: 20%; bottom: 20%; width: 1px; background: #e0e0e0;"></div>';
		}

		// QWeather icon for weather condition
		$qweatherIcon = $aWeatherData[$i]['qweatherIcon'];

		// QWeather SVG icon from GitHub via jsdelivr CDN
		$iconUrl = 'https://cdn.jsdelivr.net/gh/qwd/Icons@main/icons/' . $qweatherIcon . '.svg';

		$sContent .= '<img src="' . $iconUrl . '" style="width: ' . $iconSize . '; height: ' . $iconSize . ';" alt="' . $aWeatherData[$i]['weertype'] . '"/>';

		$sContent .= '</td>';
	} else {
		$sContent .= '<td></td>';
	}
}
$sContent .= '</tr>';

// Row 3: Maximum temperatures
$sContent .= '<tr>';
for($i = 0; $i <= 3; $i++) {
	if(isset($aWeatherData[$i])) {
		$fontSize = $i === 0 ? '84px' : '64px';
		$padding = $i === 0 ? '20px 15px 15px' : '15px 15px 10px';
		$fontWeight = $i === 0 ? '900' : '800';

		// Maximum temperature
		$maxTemp = round($aWeatherData[$i]['tempmax']);
		$tempColor = '#000'; // Black text color

		// Use slightly different background for today vs other days
		$cellBg = $i === 0 ? '#fdfdfd' : '#f7f7f7';
		$sContent .= '<td style="background: ' . $cellBg . '; text-align: center; padding: ' . $padding . '; position: relative; border-top: 1px solid #e5e5e5;">';

		// Add subtle left border
		if($i > 0) {
			$sContent .= '<div style="position: absolute; left: 0; top: 20%; bottom: 20%; width: 1px; background: #e0e0e0;"></div>';
		}

		// Add small "max" label above temperature
		$labelSize = $i === 0 ? '20px' : '18px';
		$sContent .= '<div style="font-size: ' . $labelSize . '; color: #999; text-transform: uppercase; font-weight: 600; letter-spacing: 1px; margin-bottom: 2px;">Max</div>';

		// Temperature with color
		$sContent .= '<div style="font-size: ' . $fontSize . '; font-weight: ' . $fontWeight . '; color: ' . $tempColor . ';">' . $maxTemp . '°</div>';
		$sContent .= '</td>';
	} else {
		$sContent .= '<td></td>';
	}
}
$sContent .= '</tr>';

// Row 4: Minimum temperatures
$sContent .= '<tr>';
for($i = 0; $i <= 3; $i++) {
	if(isset($aWeatherData[$i])) {
		$fontSize = $i === 0 ? '48px' : '42px';
		$padding = '12px 15px 10px';

		// Minimum temperature
		$minTemp = round($aWeatherData[$i]['tempmin']);
		$tempColor = '#666'; // Gray text color

		$sContent .= '<td style="background: #ececec; text-align: center; padding: ' . $padding . '; position: relative; border-top: 1px solid #ddd;">';

		// Add subtle left border
		if($i > 0) {
			$sContent .= '<div style="position: absolute; left: 0; top: 20%; bottom: 20%; width: 1px; background: #e0e0e0;"></div>';
		}

		// Add small "min" label
		$labelSize = $i === 0 ? '18px' : '16px';
		$sContent .= '<div style="font-size: ' . $labelSize . '; color: #999; text-transform: uppercase; font-weight: 600; letter-spacing: 1px; margin-bottom: 2px;">Min</div>';

		// Temperature
		$sContent .= '<div style="font-size: ' . $fontSize . '; font-weight: 600; color: ' . $tempColor . ';">' . $minTemp . '°</div>';

		$sContent .= '</td>';
	} else {
		$sContent .= '<td></td>';
	}
}
$sContent .= '</tr>';

// Row 5: Wind direction and strength
$sContent .= '<tr>';
for($i = 0; $i <= 3; $i++) {
	if(isset($aWeatherData[$i])) {
		$padding = $i === 0 ? '15px 10px' : '12px 8px';
		$bgColor = $i === 0 ? $brandColor : '#4C4C4C';

		// Extract wind speed
		$windSpeed = str_replace('Bft', '', $aWeatherData[$i]['windspd']);
		$windSpeed = trim($windSpeed);
		$iWindSpeed = intval($windSpeed);

		// Get wind direction for compass rotation
		$windDir = $aWeatherData[$i]['winddir'];
		$rotation = 0;

		// Map wind direction to rotation degrees
		switch(strtoupper($windDir)) {
			case 'N':   $rotation = 0; break;
			case 'NNO': $rotation = 22.5; break;
			case 'NO':  $rotation = 45; break;
			case 'ONO': $rotation = 67.5; break;
			case 'O':   $rotation = 90; break;
			case 'OZO': $rotation = 112.5; break;
			case 'ZO':  $rotation = 135; break;
			case 'ZZO': $rotation = 157.5; break;
			case 'Z':   $rotation = 180; break;
			case 'ZZW': $rotation = 202.5; break;
			case 'ZW':  $rotation = 225; break;
			case 'WZW': $rotation = 247.5; break;
			case 'W':   $rotation = 270; break;
			case 'WNW': $rotation = 292.5; break;
			case 'NW':  $rotation = 315; break;
			case 'NNW': $rotation = 337.5; break;
		}

		$sContent .= '<td style="background: ' . $bgColor . '; color: #fff; text-align: center; padding: ' . $padding . '; position: relative;">';

		// Add white separator line (except for first column)
		if($i > 0) {
			$sContent .= '<div style="position: absolute; left: 0; top: 20%; bottom: 20%; width: 1px; background: rgba(255,255,255,0.3);"></div>';
		}

		// Wind display with direction arrow and strength
		$sContent .= '<div style="text-align: center;">';

		// Create simple wind direction arrow (pointing to where wind comes FROM)
		$windArrow = '↓'; // Default north
		switch(strtoupper($windDir)) {
			case 'N':   $windArrow = '↑'; break;    // North wind comes from north
			case 'NNO': $windArrow = '↗'; break;
			case 'NO':  $windArrow = '↗'; break;    // NE wind
			case 'ONO': $windArrow = '↗'; break;
			case 'O':   $windArrow = '→'; break;    // East wind
			case 'OZO': $windArrow = '↘'; break;
			case 'ZO':  $windArrow = '↘'; break;    // SE wind
			case 'ZZO': $windArrow = '↘'; break;
			case 'Z':   $windArrow = '↓'; break;    // South wind
			case 'ZZW': $windArrow = '↙'; break;
			case 'ZW':  $windArrow = '↙'; break;    // SW wind
			case 'WZW': $windArrow = '↙'; break;
			case 'W':   $windArrow = '←'; break;    // West wind
			case 'WNW': $windArrow = '↖'; break;
			case 'NW':  $windArrow = '↖'; break;    // NW wind
			case 'NNW': $windArrow = '↑'; break;
		}

		// Wind display with direction and strength
		$sContent .= '<div style="display: flex; align-items: center; justify-content: center; gap: 8px;">';

		// Wind arrow
		$arrowSize = $i === 0 ? '32px' : '26px';
		$sContent .= '<span style="font-size: ' . $arrowSize . '; opacity: 0.7;">' . $windArrow . '</span>';

		// Wind text
		$sContent .= '<div>';
		$windTextSize = $i === 0 ? '18px' : '15px';
		$sContent .= '<div style="font-size: ' . $windTextSize . '; font-weight: 700; line-height: 1;">' . $windDir . ' ' . $iWindSpeed . '</div>';

		// Always show descriptive text for wind strength
		$descriptiveSize = $i === 0 ? '16px' : '14px';
		$windDescription = '';

		if($iWindSpeed <= 1) {
			$windDescription = 'Windstil';
		} elseif($iWindSpeed <= 2) {
			$windDescription = 'Zwak';
		} elseif($iWindSpeed <= 3) {
			$windDescription = 'Licht';
		} elseif($iWindSpeed <= 4) {
			$windDescription = 'Matig';
		} elseif($iWindSpeed <= 5) {
			$windDescription = 'Vrij krachtig';
		} elseif($iWindSpeed <= 6) {
			$windDescription = 'Krachtig';
		} elseif($iWindSpeed <= 7) {
			$windDescription = 'Hard';
		} elseif($iWindSpeed <= 8) {
			$windDescription = 'Stormachtig';
		} else {
			$windDescription = 'Storm';
		}

		$sContent .= '<div style="font-size: ' . $descriptiveSize . '; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">' . $windDescription . '</div>';

		$sContent .= '</div>';
		$sContent .= '</div>';

		$sContent .= '</div>';

		$sContent .= '</td>';
	} else {
		$sContent .= '<td></td>';
	}
}
$sContent .= '</tr>';

$sContent .= '</table>';

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
	// Expand regions to include sub-regions automatically from API
	$aExpandedRegions = expandRegions($oConfig->content->regio, $sBaseUrl);
	$sNewsUrl .= '&regio=' . urlencode(implode(',', $aExpandedRegions));
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
	$sMediaUrl = $sBaseUrl.'/wp-json/wp/v2/media?include=' . implode(',', $aMediaIds) . '&per_page=' . count($aMediaIds) . '&_fields=id,source_url';
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
		if((string)$oItem->featured_media!='' && isset($aMediaUrls[$oItem->featured_media])) {
			$sPhoto = $aMediaUrls[$oItem->featured_media];
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
