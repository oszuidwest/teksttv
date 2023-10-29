<?php

for ($iRetryCounter = 0; $iRetryCounter <= 300; $iRetryCounter++) {
    $sData = @file_get_contents('http://api.openweathermap.org/data/2.5/forecast/daily?q=Woensdrecht,NL&units=metric&lang=nl&cnt=5&appid=1e8c419c622b073f3fb80961fba99241');

    if ($sData === false) {
        sleep(10);
    } else {
        $iRetryCounter = 301;
    }
}

if ($sData !== false) {
    file_put_contents('./weather.json', $sData);
}
