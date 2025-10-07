<?php

// Get config ID from URL parameter
$sConfigId = isset($_GET['config']) ? $_GET['config'] : null;

// Load configuration from config.json
if(!file_exists('config.json')) {
    die('<!DOCTYPE html><html><body><h1>Error</h1><p>Configuration file config.json not found</p></body></html>');
}

$sConfigContent = file_get_contents('config.json');
$oConfigFile = json_decode($sConfigContent);

if(json_last_error() !== JSON_ERROR_NONE) {
    die('<!DOCTYPE html><html><body><h1>Error</h1><p>Invalid JSON in config.json: ' . htmlspecialchars(json_last_error_msg()) . '</p></body></html>');
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
                die('<!DOCTYPE html><html><body><h1>Error</h1><p>Configuration "' . htmlspecialchars($sConfigId) . '" not found in config.json</p></body></html>');
            }
        } else {
            // No config ID provided - use default
            if(isset($oConfigFile->default) && isset($oConfigFile->configurations->{$oConfigFile->default})) {
                $oConfig = $oConfigFile->configurations->{$oConfigFile->default};
            }
        }
    }
    // Legacy single-configuration structure
    elseif(isset($oConfigFile->display)) {
        $oConfig = $oConfigFile;
    }
}

// Exit with error if configuration is not properly loaded
if(!$oConfig) {
    die('<!DOCTYPE html><html><body><h1>Error</h1><p>Configuration not found or invalid structure in config.json</p></body></html>');
}

// Validate required configuration fields
if(!isset($oConfig->display) || !isset($oConfig->display->brandColor)) {
    die('<!DOCTYPE html><html><body><h1>Error</h1><p>Missing required display configuration in config.json</p></body></html>');
}

// Calculate refresh timing (hardcoded to refresh at 02:55:00)
$sRefreshTime = '02:55:00';
$oTomorrow  = new DateTime(date('Y-m-d ' . $sRefreshTime, strtotime('tomorrow')));
$oToday     = new DateTime();
$oInterval  = $oTomorrow->diff($oToday);

$iSec       = (int) $oInterval->format('%s');
$iMin       = (int) $oInterval->format('%i');
$iHour      = (int) $oInterval->format('%h');

$iTotSec    = $iSec+($iMin*60)+($iHour*3600)+300;

// Get configuration values from config.json only
$sBrandColor = $oConfig->display->brandColor;
$sRegio = isset($oConfig->content->regio) ? $oConfig->content->regio : null; // regio is optional
$sWeatherLocation = $oConfig->weather->location;

// Check for slide preview parameter in URL (overrides config setting)
$iSlidePreview = isset($_GET['slide']) ? (int)$_GET['slide'] : null;
if($iSlidePreview !== null) {
	$oConfig->display->slide = $iSlidePreview;
}

// Hardcoded timeout lengths
$iContentTimeoutLength = 25000;
$iReclameTimeoutLength = 5000;
$iTickerTimeoutLength = 20000;

?>
<!doctype html>
<html>
    <title>Kabelkrant</title>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="refresh" content="<?= $iTotSec ?>">
        <meta http-equiv="Pragma" CONTENT="no-cache">
        <meta http-equiv="Expires" CONTENT="-1">
        <style type="text/css">
            * {
                box-sizing: border-box;
                font-family: Calibri;
            }

            html, body {
                height: 100%;
            }

            body {
                background: #000;
                /* cursor: none; */
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
            }

            .viewport {
                width: 1920px; /* done */
                height: 1080px; /* done */
                position: relative;
                background: #B5B5B5;
            }
            
            .reclame {
                width: 1920px; /* done */
                height: 1080px; /* done */
                position: absolute;
                left: 0px;
                top: 0px;
                z-index: 93;
            }
            
            .reclame__photo__pre {
                position: absolute;
                width: 100%;
                height: 100%;
                opacity: 0;
                display: block;
                z-index: 95;
            }
            
            .reclame__photo__current {
                position: absolute;
                width: 100%;
                height: 100%;
                opacity: 0;
                display: block;
                z-index: 94;
            }

            .logos {
                position: absolute;
                background-image: url(images/logos_kabelkrant.png);
                background-size: cover;
                left: 81px; /* 54px */
                top: 45px; /* 30px */
                width: 233px; /* 155px */
                height: 393px; /* 262px */
            }

            .top {
                width: 1920px; /* done */
                height: 156px; /* 104px */
                position: absolue;
                background: #4C4C4C;
            }
            .top__datetime {
                position: absolute;
                right: 150px; /* 100px */
                top: 6%;
                color: #F5F5F5;
                font-size: 44px; /* 29px */
                font-weight: bold;
                text-align: right;
            }

            .ticker {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 68px; /* 45px */
                display: flex;
                background: #4C4C4C;
                color: #fff;
                line-height: 72px; /* 48px */
                font-size: 54px; /* 36px */
            }

            .ticker__label {
                background: <?= $sBrandColor ?>;
                color: #ffffff;
                width: 480px; /* 320px */
                text-transform: uppercase;
                text-align: right;
                padding: 0 18px; /* 0 12px */
                font-weight: bold;
            }

            .ticker__content {
                padding: 0 18px; /* 0 12px */
            }

            .carousel {
                position: absolute;
                background: yellow;
                left: 237px; /* 158px */
                top: 156px; /* 104px */
                bottom: 0;
                right: 0;
            }

            .carousel__slide {
                width: 100%;
                height: 100%;
                position: absolute;
                left: 0;
                top: 0;
                background: #F5F5F5;
                padding: 24px 72px 0 48px; /* 16px 48px 0 32px */
                overflow: auto;
                font-size: 48px; /* 32px */
            }

            .carousel__slide h1 {
                font-size: 51px; /* 34px */
                font-weight: 800;
                margin-top: 0px;
            }

            .carousel__slide h2 {
                font-size: 44px; /* 29px */
                font-weight: 600;
                margin-top: 0px;
                margin-bottom: 15px; /* 10px */
            }
            
            .carousel__slide p {
                margin-top: 0px;
            }

            .carousel__photo, .blob__placeholder {
                position: absolute;
                right: 0;
                bottom: 0;
                width: 660px; /* 440px */
                height: 600px; /* 400px */
                background-size: cover;
                -webkit-clip-path: polygon(100% 11%, 93% 4%, 84% 0%, 62% 6%, 48% 12%, 33% 20%, 18% 30%, 7% 40%, 2% 46%, 0% 54%, 3% 65%, 25% 84%, 50% 100%, 100% 100%);
                z-index: 80;
                display: block;
            }

            .carousel__photo__base {
                position: absolute;
                display: block;
                z-index: 81;
            }

            .carousel__photo__base img {
                position: absolute;
                z-index: 82;
            }
            
            .carousel__photo__pre {
                position: absolute;
                display: block;
                z-index: 82;
            }

            .carousel__photo__pre img {
                position: absolute;
                z-index: 83;
                min-height: 600px;
                min-width: 660px;
                height: 100%;
                width: 100%;
                object-fit: cover;
            }

            .carousel__photo__current {
                position: absolute;
                display: block;
                z-index: 85;
            }

            .carousel__photo__current img {
                position: absolute;
                z-index: 86;
                min-height: 600px;
                min-width: 660px;
                height: 100%;
                width: 100%;
                object-fit: cover;
            }

            .blob__placeholder {
                z-index: 75;
            }

            .carousel__punch {
                float: right;
                margin-top: 300px; /* 200px */
                right: -72px; /* -48px */
                width: 660px; /* 440px */
                height: 600px; /* 400px */
                shape-outside: content-box polygon(100% 11%, 93% 4%, 84% 0%, 62% 6%, 48% 12%, 33% 20%, 18% 30%, 7% 40%, 2% 46%, 0% 54%, 3% 65%, 25% 84%, 50% 100%, 100% 100%);
                position: relative;
            }

            .blob__line {
                width: 668px; /* 445px */
                height: 603px; /* 402px */
                position: absolute;
                right: 0;
                bottom: 0;
                z-index: 90;
            }
            
            a {
                text-decoration: none;
                color: black;
            }
        </style>
        <script src="jquery-3.7.1.min.js"></script>
    </head>
    <body>
        <div class="viewport">
            <div class="reclame">
                <img class="reclame__photo__pre" src="images/Kabelkrant reclame.jpg"/>
                <img class="reclame__photo__current" src="images/Kabelkrant reclame.jpg"/>
            </div>
            <div class="logos">&nbsp;</div>
            <div class="top">
                <span id="date_time" class="top__datetime">&nbsp;</span>
            </div>
            <div class="carousel">
                <div class="carousel__slide" style="overflow: hidden;">
                    <div class="carousel__punch">&nbsp;</div>
                    <div class="carousel__content">&nbsp;</div>
                    <div class="carousel__photo">
                        <div class="carousel__photo__current">
                            <img src=""/>
                        </div>
                        <div class="carousel__photo__pre">
                            <img src=""/>
                        </div>
                        <div class="carousel__photo__base">
                            <img src=""/>
                        </div>
                    </div>
                    <div class="carousel__photo"></div>
                </div>
            </div>
            <div class="ticker">
                <span class="ticker__label">&nbsp;</span>
                <span class="ticker__content">&nbsp;</span>
            </div>

            <div class="blob__line">
                <svg width="668" height="603" viewBox="0 0 446 403" version="1.1" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%;">
                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <g transform="translate(1.000000, 1.000000)" fill="<?= $sBrandColor ?>">
                            <path d="M351.55,1.39 C365.17,-1.27 379.51,-0.98 392.79,3.25 C408.66,8.08 423.7,16.74 434.53,29.48 C437.77,33.35 441.57,36.69 445,40.38 L445,60.73 C439.34,53.13 435.15,44.38 428.29,37.71 C423.74,33.25 419.43,28.47 414.17,24.81 C398.88,13.42 379.2,8.22 360.26,10.3 C350.46,11.64 340.78,13.78 331.2,16.19 C306.79,21.61 283.03,29.45 259.36,37.41 C225.69,49.81 192.55,63.83 160.98,80.95 C118.43,103.84 77.95,130.78 41.32,162.32 C33.75,168.75 26.8,175.93 20.99,183.99 C12.56,196.72 7.89,212.68 11.12,227.86 C13.22,241.91 20.75,254.47 29.95,265.04 C35.09,271.63 42.01,276.39 48.53,281.47 C77.01,303.68 106.65,324.33 136.8,344.21 C159.77,358.83 182.82,373.39 206.91,386.13 C216.58,391.93 227.28,395.84 236.74,402 L212.46,402 C209.34,399.98 206.41,397.67 203.18,395.83 C186.58,386.54 169.91,377.36 153.8,367.21 C149.06,364.25 144.41,361.09 139.34,358.71 C132.95,355.75 127.75,350.89 121.78,347.23 C103.64,335.55 86.39,322.56 68.62,310.34 C54,297.21 36.59,287.34 23.27,272.74 C10.94,259.26 2.27,242.12 0.05,223.9 C-1.66,207.86 4.01,191.94 12.58,178.6 C20.18,167.1 30.45,157.74 41,149.01 C49.85,141.81 58.76,134.69 67.97,127.96 C90.92,110.32 115.46,94.89 140.53,80.49 C206.31,43.66 277.49,15.98 351.55,1.39 L351.55,1.39 Z"></path>
                        </g>
                    </g>
                </svg>
            </div>

            <script>
                var iSelectedSlide = <?= isset($oConfig->display->slide) ? $oConfig->display->slide : 'null'; ?>;
                var aContentData = new Array();
                var iContentCounter = 0;
                var iContentTimeout = null;
                var iContentTimeoutLength = <?= $iContentTimeoutLength ?>;
                var iReclameTimeoutLength = <?= $iReclameTimeoutLength ?>;
                var iPhotoId = 1;
                var sContentResult = null;
                var bDebug = false;

                var aTickerData = new Array();
                var iTickerCounter = 0;
                var iTickerTimeout = null;
                var iTickerTimeoutLength = <?= $iTickerTimeoutLength ?>;
                var aTickerConst = {tv_today: 'Vandaag op TV', tv_tomorrow: 'Morgen op TV', fm_now: 'Nu op FM', fm_next: 'Straks op FM'};
                
                $(document).ready(function() {
                    getContentData();
                    getTickerData();
                    setDatum();
                });
                
                function getContentData() {
                    writeDebug('getContentData');
                    clearTimeout(iContentTimeout);

                    // Pass config parameter to content.php
                    var sConfigParam = '<?php echo isset($_GET['config']) ? '?config=' . urlencode($_GET['config']) : ''; ?>';

                    $.ajax({
                      url: "content.php" + sConfigParam,
                      cache: false,
                      timeout: 20000
                    })
                    .done(function( result ) {
                        clearTimeout(iContentTimeout);

                        // Try to parse the result
                        try {
                            var aNewContentData = JSON.parse(result);
                            sContentResult      = result;
                            aContentData        = aNewContentData;
                            aNewContentData     = null;
                        }
                        // Show error in debug mode
                        catch(error) {
                            writeDebug(error);
                            writeDebug(result);
                        }
                    })
                    .fail(function() {
                        // Error fetching content
                        writeDebug('error in ophalen');
                    })
                    .always(function() {
                        // Continue with next rotation cycle
                        if(iSelectedSlide==null) {
                            iContentCounter = 0;
                        } else {
                            iContentCounter = iSelectedSlide;
                        }

                        setContent();
                    });
                }
                
                function setContent() {
                    writeDebug('setContent');
                    iTimeoutLength = null;
                    
                    if(aContentData.length>iContentCounter) {
                        $('.reclame__photo__current').css('display', 'block');
                        $('.reclame__photo__pre').css('display', 'block');

                        if(aContentData[iContentCounter]['type']=='reclame') {
                            // Show blob line for reclame slides
                            $('.blob__line').css('display', 'block');
                            $('.reclame__photo__pre').animate({ opacity: 1 }, 400, function() {
                                $('.reclame__photo__current').toggleClass('reclame__photo__current reclame__photo__temp');
                                $('.reclame__photo__pre').toggleClass('reclame__photo__pre reclame__photo__current');
                                $('.reclame__photo__temp').toggleClass('reclame__photo__temp reclame__photo__pre');

                                $('.reclame__photo__pre').attr('src', aContentData[iContentCounter]['photo']);
                                $('.reclame__photo__pre').css('opacity', 0);
                            });

                            $('.carousel__photo__pre img').attr('src', aContentData[0]['photo']);
                            $('.carousel__photo__pre video').attr('src', aContentData[0]['video']);

                            // Hide image if photo is empty
                            if(aContentData[0]['photo'] == '') {
                                $('.carousel__photo__pre img').css('display', 'none');
                            } else {
                                $('.carousel__photo__pre img').css('display', 'block');
                            }

                            iTimeoutLength = iReclameTimeoutLength;
                        } else {
                            if(iContentCounter==0) {
                                $('.reclame__photo__pre').css('opacity', 0);
                                $('.reclame__photo__current').animate({ opacity: 0 }, 400);
                                $('.reclame__photo__pre').attr('src', 'http://www.zuidwestupdate.nl/images/teksttv/Kabelkrant reclame.jpg');
                            }

                            if(aContentData[iContentCounter]['type']=='weer') {
                                $('.carousel__content').html('<h1>'+aContentData[iContentCounter]['title']+'</h1>'+aContentData[iContentCounter]['content']);
                                // Weather slides have no photo or blob, ensure they are hidden
                                $('.carousel__photo__current img').css('display', 'none');
                                $('.carousel__photo__pre img').css('display', 'none');
                                $('.blob__line').css('display', 'none');
                            }
                            
                            if(aContentData[iContentCounter]['type']=='nieuws') {
                                $('.carousel__content').html('<h1>'+aContentData[iContentCounter]['title']+'</h1>'+aContentData[iContentCounter]['content']);
                                // Show blob line for non-weather slides
                                $('.blob__line').css('display', 'block');
                            }
                            
                            iTimeoutLength = iContentTimeoutLength;
                            
                            if(iSelectedSlide!=null) {
                                $('.carousel__photo__pre img').attr('src', aContentData[iContentCounter]['photo']);
                            }

                            // Hide image if photo is empty
                            if(aContentData[iContentCounter]['photo'] == '') {
                                $('.carousel__photo__pre img').css('display', 'none');
                            } else {
                                $('.carousel__photo__pre img').css('display', 'block');
                            }

                            $('.carousel__photo__pre').css('display', 'block');
                            $('.carousel__photo__pre').css('opacity', '1');

                            $('.carousel__photo__current').animate({ opacity: 0 }, 400, function() {
                                $('.carousel__photo__current').toggleClass('carousel__photo__current carousel__photo__temp');
                                $('.carousel__photo__pre').toggleClass('carousel__photo__pre carousel__photo__current');
                                $('.carousel__photo__temp').toggleClass('carousel__photo__temp carousel__photo__pre');

                                if(aContentData[iContentCounter]['type']!='reclame') {
                                    var nextPhoto = '';
                                    if((iContentCounter+1)>aContentData.length) {
                                        nextPhoto = aContentData[0]['photo'];
                                        $('.carousel__photo__pre img').attr('src', nextPhoto);
                                    } else {
                                        nextPhoto = aContentData[iContentCounter]['photo'];
                                        $('.carousel__photo__pre img').attr('src', nextPhoto);
                                    }

                                    // Hide image if photo is empty
                                    if(nextPhoto == '') {
                                        $('.carousel__photo__pre img').css('display', 'none');
                                    } else {
                                        $('.carousel__photo__pre img').css('display', 'block');
                                    }
                                }
                                else {
                                    $('.reclame__photo__pre').attr('src', aContentData[iContentCounter]['photo']);
                                }

                                $('.carousel__photo__current').css('display', 'block');
                                $('.carousel__photo__pre').css('display', 'block');
                            });
                        }
                        
                        iContentCounter++;
                        if(iContentCounter>=aContentData.length) {
                            iContentCounter = 0;
                        }
                    }
                    
                    
                    if(iSelectedSlide==null) {
                        if(iTimeoutLength==null) {
                            setTimeout(getContentData, 60*1000);
                        }
                        else {
                            if(iContentCounter!=0) {
                                iContentTimeout = setTimeout(setContent, iTimeoutLength);
                            } else {
                                setTimeout(getContentData, iTimeoutLength);
                            }
                        }
                    }
                }
                
                function getTickerData() {
                    writeDebug('getTickerData');
                    $.ajax({
                      url: "https://www.zuidwestupdate.nl/wp-json/zw/v1/broadcast_data"
                    })
                    .done(function( result ) {
                        if(typeof result.fm!=undefined || typeof result.tv!=undefined) {
                            aTickerData = new Array();
                        }
                        if(typeof result.fm!=undefined) {
                            if(typeof result.fm.now!=undefined) {
                                aTickerData[aTickerData.length] = {'type' : 'fm_now', 'title': result.fm.now};
                            }
                            if(typeof result.fm.next!=undefined) {
                                aTickerData[aTickerData.length] = {'type' : 'fm_next', 'title': result.fm.next};
                            }
                        }

                        if(typeof result.tv!=undefined) {
                            if(typeof result.tv.today!=undefined) {
                                for(i=0; i<result.tv.today.length; i++) {
                                    aTickerData[aTickerData.length] = {'type' : 'tv_today', 'title': result.tv.today[i]};
                                }
                            }
                            if(typeof result.tv.tomorrow!=undefined) {
                                for(i=0; i<result.tv.tomorrow.length; i++) {
                                    aTickerData[aTickerData.length] = {'type' : 'tv_tomorrow', 'title': result.tv.tomorrow[i]};
                                }
                            }
                        }

                        iTickerCounter = 0;
                        clearTimeout(iTickerTimeout);
                        setTickerData();
                    })
                    .always(function() {
                        writeDebug(aTickerData.length*iTickerTimeoutLength*5);
                        if(aTickerData.length>0) {
                            setTimeout(getTickerData, aTickerData.length*iTickerTimeoutLength*5);
                        }
                        else {
                            setTimeout(getTickerData, 4*iTickerTimeoutLength*5);
                        }
                    });
                };
                
                function setTickerData() {
                    writeDebug('setTickerData');
                    if(aTickerData.length>iTickerCounter) {
                        $('.ticker__label').html(aTickerConst[aTickerData[iTickerCounter]['type']]);
                        $('.ticker__content').html(aTickerData[iTickerCounter]['title']);
                        
                        iTickerCounter++;
                        if(iTickerCounter>=aTickerData.length) {
                            iTickerCounter = 0;
                        }
                    }
                    else {
                        iTickerCounter = 0;
                        $('#ticker__label').html('&nbsp;');
                        $('.ticker__content').html('&nbsp;');
                    }
                    
                    iTickerTimeout = setTimeout(setTickerData, iTickerTimeoutLength);
                }
                
                function setDatum() {
                    var oDate = new Date;
                    var aMonths = new Array('januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december');
                    var aDays = new Array('zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag');
                    var iHour = (oDate.getHours()<10) ? '0'+oDate.getHours() : oDate.getHours();
                    var iMinute = (oDate.getMinutes()<10) ? '0'+oDate.getMinutes() : oDate.getMinutes();
                    
                    $('.top__datetime').html(aDays[oDate.getDay()]+' '+oDate.getDate()+' '+aMonths[oDate.getMonth()]+' &nbsp;&nbsp; '+iHour+':'+iMinute);
                    
                    setTimeout(setDatum, 1000);
                }
                
                function writeDebug(sDebug) {
                    if(bDebug) {
                        console.log(sDebug);
                    }
                }
            </script>
        </div>
        <input onclick="setContent();" value="next" type="button" style="display: none;"/>
    </body>
</html>
