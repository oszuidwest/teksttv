<?

error_reporting(E_ALL);
ini_set('display_errors', 'true');

function getWindDir($iDeg) {
	if($iDeg<22.5)  return 'Noord';
	if($iDeg<67.5)  return 'Noord-Oost';
	if($iDeg<112.5) return 'Oost';
	if($iDeg<157.5) return 'Zuid-Oost';
	if($iDeg<202.5) return 'Zuid';
	if($iDeg<247.5) return 'Zuid-West';
	if($iDeg<292.5) return 'West';
	if($iDeg<337.5) return 'Noord-West';
	return 'Noord';
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

# Weer ophalen
$oWeather = json_decode(file_get_contents('/home/web/zuidwesttv.nl/www/html/uploads/weather.json'));
$aWeatherData = array();

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

$sContent = $aWeatherData[0]['weertype'].' max '.number_format($aWeatherData[0]['tempmax'], 0).' graden wind '.$aWeatherData[0]['winddir'].' kracht '. $aWeatherData[0]['windspd'];


echo $sContent;