<?php

// Get channel from URL parameter (defaults to tv1)
$sKanaal = isset($_GET['kanaal']) ? $_GET['kanaal'] : 'tv1';

// Set timezone to Netherlands
date_default_timezone_set('Europe/Amsterdam');
setlocale(LC_ALL, 'nl_NL.utf8');

// Load brandColor for this channel from config.json
$brandColor = '#04C104'; // default
if (file_exists('config.json')) {
    $oConfig = json_decode(file_get_contents('config.json'));
    if ($oConfig && isset($oConfig->channels->{$sKanaal}->brandColor)) {
        $brandColor = $oConfig->channels->{$sKanaal}->brandColor;
    }
}

/**
 * Fetch URL with timeout to prevent hanging
 * @param string $sUrl URL to fetch
 * @param int $iTimeout Timeout in seconds (default: 10)
 * @return string|false Content on success, false on failure
 */
function fetchUrlWithTimeout($sUrl, $iTimeout = 10)
{
    $oContext = stream_context_create(array(
        'http' => array(
            'timeout' => $iTimeout,
            'ignore_errors' => true,
            'user_agent' => 'TekstTV/1.0'
        )
    ));

    $sResult = @file_get_contents($sUrl, false, $oContext);

    if ($sResult === false) {
        $aError = error_get_last();
        error_log('TekstTV: URL fetch failed for ' . $sUrl . ' - ' . ($aError['message'] ?? 'Unknown error'));
        return false;
    }

    return $sResult;
}

/**
 * Map OpenWeatherMap weather codes to QWeather icon codes
 * @param int $weatherId OpenWeatherMap weather condition ID
 * @return string QWeather icon code
 */
function getQWeatherIcon($weatherId)
{
    // Map OpenWeatherMap IDs to QWeather icon codes
    // See: https://openweathermap.org/weather-conditions
    // QWeather codes: https://icons.qweather.com/en/
    switch ($weatherId) {
        // Group 2xx: Thunderstorm
        case 200:
            return '304';  // Thunderstorm with light rain
        case 201:
            return '304';  // Thunderstorm with rain
        case 202:
            return '304';  // Thunderstorm with heavy rain
        case 210:
            return '303';  // Light thunderstorm
        case 211:
            return '303';  // Thunderstorm
        case 212:
            return '304';  // Heavy thunderstorm
        case 221:
            return '304';  // Ragged thunderstorm
        case 230:
            return '304';  // Thunderstorm with light drizzle
        case 231:
            return '304';  // Thunderstorm with drizzle
        case 232:
            return '304';  // Thunderstorm with heavy drizzle

        // Group 3xx: Drizzle
        case 300:
            return '309';  // Light intensity drizzle
        case 301:
            return '309';  // Drizzle
        case 302:
            return '310';  // Heavy intensity drizzle
        case 310:
            return '309';  // Light intensity drizzle rain
        case 311:
            return '310';  // Drizzle rain
        case 312:
            return '311';  // Heavy intensity drizzle rain
        case 313:
            return '313';  // Shower rain and drizzle
        case 314:
            return '312';  // Heavy shower rain and drizzle
        case 321:
            return '313';  // Shower drizzle

        // Group 5xx: Rain
        case 500:
            return '305';  // Light rain
        case 501:
            return '306';  // Moderate rain
        case 502:
            return '307';  // Heavy intensity rain
        case 503:
            return '308';  // Very heavy rain
        case 504:
            return '312';  // Extreme rain
        case 511:
            return '404';  // Freezing rain
        case 520:
            return '300';  // Light intensity shower rain
        case 521:
            return '301';  // Shower rain
        case 522:
            return '302';  // Heavy intensity shower rain
        case 531:
            return '302';  // Ragged shower rain

        // Group 6xx: Snow
        case 600:
            return '400';  // Light snow
        case 601:
            return '401';  // Snow
        case 602:
            return '402';  // Heavy snow
        case 611:
            return '404';  // Sleet
        case 612:
            return '405';  // Light shower sleet
        case 613:
            return '406';  // Shower sleet
        case 615:
            return '404';  // Light rain and snow
        case 616:
            return '405';  // Rain and snow
        case 620:
            return '400';  // Light shower snow
        case 621:
            return '401';  // Shower snow
        case 622:
            return '403';  // Heavy shower snow

        // Group 7xx: Atmosphere
        case 701:
            return '501';  // Mist
        case 711:
            return '502';  // Smoke
        case 721:
            return '504';  // Haze
        case 731:
            return '503';  // Sand/dust whirls
        case 741:
            return '501';  // Fog
        case 751:
            return '503';  // Sand
        case 761:
            return '504';  // Dust
        case 762:
            return '502';  // Volcanic ash
        case 771:
            return '507';  // Squalls
        case 781:
            return '508';  // Tornado

        // Group 800: Clear - always use day icon
        case 800:
            return '100';  // Clear sky

        // Group 80x: Clouds - always use day icons
        case 801:
            return '101';  // Few clouds: 11-25%
        case 802:
            return '102';  // Scattered clouds: 25-50%
        case 803:
            return '103';  // Broken clouds: 51-84%
        case 804:
            return '104';  // Overcast clouds: 85-100%

        // Default
        default:
            return '999';  // Unknown/Not available
    }
}

/**
 * Generate weather HTML display
 * @param array $aWeatherData Array of weather data for each day
 * @param string $brandColor Brand color for styling
 * @return string HTML content
 */
function generateWeatherHtml($aWeatherData, $brandColor)
{
    $sContent = '';

    // Container for the weather table
    $sContent .= '<div style="position: absolute; left: 48px; right: 150px; top: 140px; bottom: 200px; ';
    $sContent .= 'display: flex; align-items: center; justify-content: center;">';

    // Create table with 4 columns (today + 3 days)
    $sContent .= '<div style="width: 100%; max-width: 1200px; position: relative;">';

    // Background accent - diagonal brand color strip
    $sContent .= '<div style="position: absolute; top: -20px; left: -20px; right: -20px; height: 80px; ';
    $sContent .= 'background: linear-gradient(135deg, ' . $brandColor . ' 0%, ' . $brandColor . ' 50%, transparent 50%); ';
    $sContent .= 'opacity: 0.2; z-index: 0;"></div>';

    // Main table wrapper with subtle background
    $sContent .= '<div style="position: relative; z-index: 1; background: #fafafa; border: 1px solid #e0e0e0; overflow: hidden;">';

    // Table with 4 days - today slightly larger
    $sContent .= '<table style="width: 100%; border-collapse: collapse; table-layout: fixed;">';

    // Calculate column widths - today gets 28%, others get 24% each
    $todayWidth = '28%';
    $otherWidth = '24%';

    // Row 1: Day headers with gradient background
    $sContent .= '<tr>';
    for ($i = 0; $i <= 3; $i++) {
        if (isset($aWeatherData[$i])) {
            $width = $i === 0 ? $todayWidth : $otherWidth;
            $dayAbbr = $aWeatherData[$i]['dayAbbr'];
            $fontSize = $i === 0 ? '42px' : '36px';
            $padding = $i === 0 ? '25px 15px' : '20px 15px';
            $bgGradient = $i === 0
                ? 'background: ' . $brandColor . ';'
                : 'background: #5A5A5A;';

            $sContent .= '<td style="' . $bgGradient . ' color: #fff; text-align: center; ';
            $sContent .= 'padding: ' . $padding . '; font-size: ' . $fontSize . '; font-weight: 800; ';
            $sContent .= 'text-transform: lowercase; width: ' . $width . '; position: relative;">';

            // Add white accent line for today
            if ($i === 0) {
                $sContent .= '<div style="position: absolute; top: 0; left: 0; right: 0; height: 5px; ';
                $sContent .= 'background: #fff; opacity: 0.3;"></div>';
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
    for ($i = 0; $i <= 3; $i++) {
        if (isset($aWeatherData[$i])) {
            $iconSize = $i === 0 ? '110px' : '90px';
            $padding = $i === 0 ? '30px 15px' : '25px 15px';
            $bgColor = $i === 0 ? $brandColor . '15' : '#f3f3f3';

            $sContent .= '<td style="background: ' . $bgColor . '; text-align: center; ';
            $sContent .= 'padding: ' . $padding . '; position: relative;">';

            // Add subtle left border for separation (except first column)
            if ($i > 0) {
                $sContent .= '<div style="position: absolute; left: 0; top: 20%; bottom: 20%; width: 1px; ';
                $sContent .= 'background: #e0e0e0;"></div>';
            }

            // QWeather icon for weather condition
            $qweatherIcon = $aWeatherData[$i]['qweatherIcon'];
            $iconUrl = 'https://cdn.jsdelivr.net/gh/qwd/Icons@main/icons/' . $qweatherIcon . '.svg';

            $sContent .= '<img src="' . $iconUrl . '" style="width: ' . $iconSize . '; height: ' . $iconSize . ';" ';
            $sContent .= 'alt="' . htmlspecialchars($aWeatherData[$i]['weertype']) . '"/>';

            $sContent .= '</td>';
        } else {
            $sContent .= '<td></td>';
        }
    }
    $sContent .= '</tr>';

    // Row 3: Maximum temperatures
    $sContent .= '<tr>';
    for ($i = 0; $i <= 3; $i++) {
        if (isset($aWeatherData[$i])) {
            $fontSize = $i === 0 ? '84px' : '64px';
            $padding = $i === 0 ? '20px 15px 15px' : '15px 15px 10px';
            $fontWeight = $i === 0 ? '900' : '800';
            $maxTemp = round($aWeatherData[$i]['tempmax']);
            $tempColor = '#000';
            $cellBg = $i === 0 ? '#fdfdfd' : '#f7f7f7';

            $sContent .= '<td style="background: ' . $cellBg . '; text-align: center; padding: ' . $padding . '; ';
            $sContent .= 'position: relative; border-top: 1px solid #e5e5e5;">';

            // Add subtle left border
            if ($i > 0) {
                $sContent .= '<div style="position: absolute; left: 0; top: 20%; bottom: 20%; width: 1px; ';
                $sContent .= 'background: #e0e0e0;"></div>';
            }

            // Add small "max" label above temperature
            $labelSize = $i === 0 ? '20px' : '18px';
            $sContent .= '<div style="font-size: ' . $labelSize . '; color: #999; text-transform: uppercase; ';
            $sContent .= 'font-weight: 600; letter-spacing: 1px; margin-bottom: 2px;">Max</div>';

            // Temperature with color
            $sContent .= '<div style="font-size: ' . $fontSize . '; font-weight: ' . $fontWeight . '; ';
            $sContent .= 'color: ' . $tempColor . ';">' . $maxTemp . '°</div>';
            $sContent .= '</td>';
        } else {
            $sContent .= '<td></td>';
        }
    }
    $sContent .= '</tr>';

    // Row 4: Minimum temperatures
    $sContent .= '<tr>';
    for ($i = 0; $i <= 3; $i++) {
        if (isset($aWeatherData[$i])) {
            $fontSize = $i === 0 ? '48px' : '42px';
            $padding = '12px 15px 10px';
            $minTemp = round($aWeatherData[$i]['tempmin']);
            $tempColor = '#666';

            $sContent .= '<td style="background: #ececec; text-align: center; padding: ' . $padding . '; ';
            $sContent .= 'position: relative; border-top: 1px solid #ddd;">';

            // Add subtle left border
            if ($i > 0) {
                $sContent .= '<div style="position: absolute; left: 0; top: 20%; bottom: 20%; width: 1px; ';
                $sContent .= 'background: #e0e0e0;"></div>';
            }

            // Add small "min" label
            $labelSize = $i === 0 ? '18px' : '16px';
            $sContent .= '<div style="font-size: ' . $labelSize . '; color: #999; text-transform: uppercase; ';
            $sContent .= 'font-weight: 600; letter-spacing: 1px; margin-bottom: 2px;">Min</div>';

            // Temperature
            $sContent .= '<div style="font-size: ' . $fontSize . '; font-weight: 600; color: ' . $tempColor . ';">';
            $sContent .= $minTemp . '°</div>';

            $sContent .= '</td>';
        } else {
            $sContent .= '<td></td>';
        }
    }
    $sContent .= '</tr>';

    // Row 5: Wind direction and strength
    $sContent .= '<tr>';
    for ($i = 0; $i <= 3; $i++) {
        if (isset($aWeatherData[$i])) {
            $padding = $i === 0 ? '15px 10px' : '12px 8px';
            $bgColor = $i === 0 ? $brandColor : '#4C4C4C';

            // Get wind speed (already in Beaufort from API)
            $iWindSpeed = (int) $aWeatherData[$i]['windspd'];

            // Get wind direction
            $windDir = $aWeatherData[$i]['winddir'];

            $sContent .= '<td style="background: ' . $bgColor . '; color: #fff; text-align: center; ';
            $sContent .= 'padding: ' . $padding . '; position: relative;">';

            // Add white separator line (except for first column)
            if ($i > 0) {
                $sContent .= '<div style="position: absolute; left: 0; top: 20%; bottom: 20%; width: 1px; ';
                $sContent .= 'background: rgba(255,255,255,0.3);"></div>';
            }

            // Get wind arrow based on direction
            $windArrow = getWindArrow($windDir);

            // Wind display with direction arrow and strength
            $sContent .= '<div style="text-align: center;">';
            $sContent .= '<div style="display: flex; align-items: center; justify-content: center; gap: 8px;">';

            // Wind arrow
            $arrowSize = $i === 0 ? '32px' : '26px';
            $sContent .= '<span style="font-size: ' . $arrowSize . '; opacity: 0.7;">' . $windArrow . '</span>';

            // Wind text
            $sContent .= '<div>';
            $windTextSize = $i === 0 ? '18px' : '15px';
            $sContent .= '<div style="font-size: ' . $windTextSize . '; font-weight: 700; line-height: 1;">';
            $sContent .= $windDir . ' ' . $iWindSpeed . '</div>';

            // Always show descriptive text for wind strength
            $descriptiveSize = $i === 0 ? '16px' : '14px';
            $windDescription = getWindDescription($iWindSpeed);

            $sContent .= '<div style="font-size: ' . $descriptiveSize . '; opacity: 0.9; text-transform: uppercase; ';
            $sContent .= 'letter-spacing: 1px; margin-top: 2px;">' . $windDescription . '</div>';

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

    return $sContent;
}

/**
 * Get wind arrow character based on wind direction
 * @param string $windDir Wind direction abbreviation
 * @return string Arrow character
 */
function getWindArrow($windDir)
{
    switch (strtoupper($windDir)) {
        case 'N':
            return '↑';
        case 'NNO':
            return '↗';
        case 'NO':
            return '↗';
        case 'ONO':
            return '↗';
        case 'O':
            return '→';
        case 'OZO':
            return '↘';
        case 'ZO':
            return '↘';
        case 'ZZO':
            return '↘';
        case 'Z':
            return '↓';
        case 'ZZW':
            return '↙';
        case 'ZW':
            return '↙';
        case 'WZW':
            return '↙';
        case 'W':
            return '←';
        case 'WNW':
            return '↖';
        case 'NW':
            return '↖';
        case 'NNW':
            return '↑';
        default:
            return '↓';
    }
}

/**
 * Get wind description based on Beaufort scale
 * @param int $iWindSpeed Wind speed in Beaufort
 * @return string Description in Dutch
 */
function getWindDescription($iWindSpeed)
{
    if ($iWindSpeed <= 1) {
        return 'Windstil';
    } elseif ($iWindSpeed <= 2) {
        return 'Zwak';
    } elseif ($iWindSpeed <= 3) {
        return 'Licht';
    } elseif ($iWindSpeed <= 4) {
        return 'Matig';
    } elseif ($iWindSpeed <= 5) {
        return 'Vrij krachtig';
    } elseif ($iWindSpeed <= 6) {
        return 'Krachtig';
    } elseif ($iWindSpeed <= 7) {
        return 'Hard';
    } elseif ($iWindSpeed <= 8) {
        return 'Stormachtig';
    } else {
        return 'Storm';
    }
}

/**
 * Transform weather slide from API format to internal format
 * @param object $oSlide Slide data from API
 * @param string $brandColor Brand color for styling
 * @return array Transformed slide data
 */
function transformWeatherSlide($oSlide, $brandColor)
{
    $aWeatherData = array();

    if (isset($oSlide->days) && is_array($oSlide->days)) {
        foreach ($oSlide->days as $index => $oDay) {
            // Get weather_id, defaulting to 800 (clear sky) if null or missing
            $weatherId = isset($oDay->weather_id) && $oDay->weather_id !== null
                ? (int) $oDay->weather_id
                : 800;

            $aWeatherData[$index] = array(
                'dayAbbr' => $oDay->day_short ?? '',
                'tempmin' => $oDay->temp_min ?? 0,
                'tempmax' => $oDay->temp_max ?? 0,
                'weertype' => $oDay->description ?? '',
                'qweatherIcon' => getQWeatherIcon($weatherId),
                'winddir' => $oDay->wind_direction ?? 'N',
                'windspd' => $oDay->wind_beaufort ?? 0
            );
        }
    }

    return array(
        'type' => 'weer',
        'title' => $oSlide->title ?? 'Weerstation ' . ($oSlide->location ?? ''),
        'photo' => '',
        'content' => generateWeatherHtml($aWeatherData, $brandColor),
        'duration' => $oSlide->duration ?? 15000
    );
}

/**
 * Transform text (news) slide from API format to internal format
 * @param object $oSlide Slide data from API
 * @return array Transformed slide data
 */
function transformTextSlide($oSlide)
{
    return array(
        'type' => 'nieuws',
        'title' => $oSlide->title ?? '',
        'photo' => $oSlide->image ?? '',
        'content' => $oSlide->body ?? '',
        'duration' => $oSlide->duration ?? 20000
    );
}

/**
 * Transform image (editorial) slide from API format to internal format
 * @param object $oSlide Slide data from API
 * @return array Transformed slide data
 */
function transformImageSlide($oSlide)
{
    return array(
        'type' => 'afbeelding',
        'title' => '',
        'photo' => $oSlide->url ?? '',
        'content' => '',
        'duration' => $oSlide->duration ?? 7000
    );
}

/**
 * Transform commercial slide from API format to internal format
 * @param object $oSlide Slide data from API
 * @return array Transformed slide data
 */
function transformCommercialSlide($oSlide)
{
    return array(
        'type' => 'reclame',
        'title' => 'Reclame',
        'photo' => $oSlide->url ?? '',
        'content' => '',
        'duration' => $oSlide->duration ?? 10000
    );
}

/**
 * Transform commercial transition slide from API format to internal format
 * @param object $oSlide Slide data from API
 * @param bool $bIsFirst Whether this is the first transition (in) or second (out)
 * @return array Transformed slide data
 */
function transformCommercialTransitionSlide($oSlide, $bIsFirst)
{
    return array(
        'type' => $bIsFirst ? 'reclame_in' : 'reclame_uit',
        'title' => $bIsFirst ? 'Reclame in' : 'Reclame uit',
        'photo' => $oSlide->url ?? '',
        'content' => '',
        'duration' => $oSlide->duration ?? 7000
    );
}

/**
 * Transform a slide based on its type
 * @param object $oSlide Slide data from API
 * @param string $brandColor Brand color for styling
 * @param bool|null $bIsFirstTransition For commercial_transition: true=in, false=out, null=n/a
 * @return array|null Transformed slide data or null if unknown type
 */
function transformSlide($oSlide, $brandColor, $bIsFirstTransition = null)
{
    if (!isset($oSlide->type)) {
        return null;
    }

    switch ($oSlide->type) {
        case 'weather':
            return transformWeatherSlide($oSlide, $brandColor);
        case 'text':
            return transformTextSlide($oSlide);
        case 'image':
            return transformImageSlide($oSlide);
        case 'commercial':
            return transformCommercialSlide($oSlide);
        case 'commercial_transition':
            return transformCommercialTransitionSlide($oSlide, $bIsFirstTransition ?? true);
        default:
            return null;
    }
}

// Fetch unified API
$sApiUrl = 'https://preview.zuidwestupdate.nl/wp-json/zw/v1/teksttv?kanaal=' . urlencode($sKanaal);
$sApiData = fetchUrlWithTimeout($sApiUrl, 15);

if ($sApiData === false) {
    header('HTTP/1.1 503 Service Unavailable');
    echo json_encode(array('error' => 'Failed to fetch data from API'));
    exit;
}

$oApiData = json_decode($sApiData);

if (json_last_error() !== JSON_ERROR_NONE || !$oApiData) {
    header('HTTP/1.1 502 Bad Gateway');
    echo json_encode(array('error' => 'Invalid response from API'));
    exit;
}

// Transform slides
$aData = array();
$bFirstTransition = true; // Track if next transition is "in" or "out"
if (isset($oApiData->slides) && is_array($oApiData->slides)) {
    foreach ($oApiData->slides as $oSlide) {
        $bIsFirstTransition = null;
        if (isset($oSlide->type) && $oSlide->type === 'commercial_transition') {
            $bIsFirstTransition = $bFirstTransition;
            $bFirstTransition = false; // Next transition will be "out"
        }
        $aTransformed = transformSlide($oSlide, $brandColor, $bIsFirstTransition);
        if ($aTransformed !== null) {
            $aData[] = $aTransformed;
        }
    }
}

// Build response with slides and ticker data
$aResponse = array(
    'slides' => $aData,
    'ticker' => isset($oApiData->ticker) ? $oApiData->ticker : array()
);

header('Content-Type: application/json');
echo json_encode($aResponse);
