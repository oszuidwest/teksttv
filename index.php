<?php

$oTomorrow  = new DateTime(date('Y-m-d 02:55:00', strtotime('tomorrow')));
$oToday     = new DateTime();
$oInterval  = $oTomorrow->diff($oToday);

$iSec       = $oInterval->format('%s');
$iMin       = $oInterval->format('%i');
$iHour      = $oInterval->format('%h');

$iTotSec    = $iSec+($iMin*60)+($iHour*3600)+300;

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
                background: #04C104;
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

            .carousel__photo__pre video {
                position: absolute;
                z-index: 84;
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

            .carousel__photo__current video {
                position: absolute;
                z-index: 87;
            }

            .blob__placeholder {
                z-index: 75;
                /*background-image: url('http://www.zuidwestupdate.nl/images/teksttv/Agenda%20-%20logo%20-%20kabelkrant2.jpg');*/
                background-image: url('images/Agenda%20-%20logo%20-%20kabelkrant2.jpg');
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
                background: url('vorm.svg');
                background-size: cover;
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
        <script src="jquery-1.6.1.min.js"></script>
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
                            <img src="images/Weer - logo - kabelkrant2.jpg"/>
                            <video width="711" height="400" muted="muted"><source src="" type="video/mp4"></video>
                        </div>
                        <div class="carousel__photo__pre">
                            <img src="images/Weer - logo - kabelkrant2.jpg"/>
                            <video width="711" height="400" muted="muted"><source src="" type="video/mp4"></video>
                        </div>
                        <div class="carousel__photo__base">
                            <img src="images/Standaard - logo - kabelkrant2.jpg"/>
                        </div>
                    </div>
                    <div class="carousel__photo"></div>
                </div>
            </div>
            <div class="ticker">
                <span class="ticker__label">&nbsp;</span>
                <span class="ticker__content">&nbsp;</span>
            </div>

            <div class="blob__line">&nbsp;</div>

            <script>
                var iSelectedSlide = <?= isset($_GET['slide']) && is_numeric($_GET['slide']) ? $_GET['slide'] : 'null'; ?>;
                var aContentData = new Array();
                var iContentCounter = 0;
                var iContentTimeout = null;
                var iContentTimeoutLength = <?= isset($_GET['preview']) ? 4000 : '25*1000' ?>;
                var iReclameTimeoutLength = 5*1000;
                var iPhotoId = 1;
                var sContentResult = null;
                var bDebug = false;
                
                var aTickerData = new Array();
                var iTickerCounter = 0;
                var iTickerTimeout = null;
                var iTickerTimeoutLength = 20*1000;
                var aTickerConst = {tv_today: 'Vandaag op TV', tv_tomorrow: 'Morgen op TV', fm_now: 'Nu op FM', fm_next: 'Straks op FM'};
                
                $(document).ready(function() {
                    getContentData();
                    getTickerData();
                    setDatum();
                });
                
                function getContentData() {
                    writeDebug('getContentData');
                    clearTimeout(iContentTimeout);
                    
                    $.ajax({
                      url: "content.php",
                      cache: false,
                      timeout: 20000,
                      success: function( result ) {
                        clearTimeout(iContentTimeout);
                        
                        // probeer het resultaat te parsen
                        try {
                            var aNewContentData = JSON.parse(result);
                            sContentResult      = result;
                            aContentData        = aNewContentData;
                            aNewContentData     = null;
                        }
                        // error tonen in debug mode
                        catch(error) {
                            writeDebug(error);
                            writeDebug(result);
                        }
                      },
                      // fout in ophalen
                      error: function() {
                        writeDebug('error in ophalen');
                      },
                      // en gewoon weer een ronde gaan draaien
                      complete: function() {
                        if(iSelectedSlide==null) {
                            iContentCounter = 0;
                        } else {
                            iContentCounter = iSelectedSlide;
                        }
                        
                        setContent();
                      }
                    });
                }
                
                function setContent() {
                    writeDebug('setContent');
                    iTimeoutLength = null;
                    
                    if(aContentData.length>iContentCounter) {
                        $('.reclame__photo__current').css('display', 'block');
                        $('.reclame__photo__pre').css('display', 'block');

                        if(aContentData[iContentCounter]['type']=='reclame') {
                            $('.reclame__photo__pre').animate({ opacity: 100 }, 400, function() {
                                $('.reclame__photo__current').toggleClass('reclame__photo__current reclame__photo__temp');
                                $('.reclame__photo__pre').toggleClass('reclame__photo__pre reclame__photo__current');
                                $('.reclame__photo__temp').toggleClass('reclame__photo__temp reclame__photo__pre');

                                $('.reclame__photo__pre').attr('src', aContentData[iContentCounter]['photo']);
                                $('.reclame__photo__pre').css('opacity', 0);
                            });

                            $('.carousel__photo__pre img').attr('src', aContentData[0]['photo']);
                            $('.carousel__photo__pre video').attr('src', aContentData[0]['video']);
                            
                            iTimeoutLength = iReclameTimeoutLength;
                        } else {
                            if(iContentCounter==0) {
                                $('.reclame__photo__pre').css('opacity', 0);
                                $('.reclame__photo__current').animate({ opacity: 0 }, 400);
                                $('.reclame__photo__pre').attr('src', 'http://www.zuidwestupdate.nl/images/teksttv/Kabelkrant reclame.jpg');
                            }

                            if(aContentData[iContentCounter]['type']=='weer') {
                                $('.carousel__content').html('<h1>Weer</h1>'+aContentData[iContentCounter]['content']);
                            }
                            
                            if(aContentData[iContentCounter]['type']=='nieuws') {
                                $('.carousel__content').html('<h1>'+aContentData[iContentCounter]['title']+'</h1>'+aContentData[iContentCounter]['content']);
                            }
                            
                            if(aContentData[iContentCounter]['type']=='agenda') {
                                $('.carousel__content').html('<h1>'+aContentData[iContentCounter]['title']+'</h1><h2>'+aContentData[iContentCounter]['location']+' - '+aContentData[iContentCounter]['datum']+'</h2>'+aContentData[iContentCounter]['content']);
                            }
                            
                            iTimeoutLength = iContentTimeoutLength;
                            
                            if(iSelectedSlide!=null) {
                                $('.carousel__photo__pre img').attr('src', aContentData[iContentCounter]['photo']);
                                $('.carousel__photo__pre video').attr('src', aContentData[iContentCounter]['video']);
                            }

                            if(aContentData[iContentCounter]['video']!="") {
                                $('.carousel__photo__pre video').get(0).play().catch(function() {});
                            }

                            $('.carousel__photo__pre').css('display', 'block');
                            $('.carousel__photo__pre').css('opacity', '100');

                            $('.carousel__photo__current').animate({ opacity: 0 }, 400, function() {
                                $('.carousel__photo__current').toggleClass('carousel__photo__current carousel__photo__temp');
                                $('.carousel__photo__pre').toggleClass('carousel__photo__pre carousel__photo__current');
                                $('.carousel__photo__temp').toggleClass('carousel__photo__temp carousel__photo__pre');

                                if(aContentData[iContentCounter]['type']!='reclame') {
                                    if((iContentCounter+1)>aContentData.length) {
                                        $('.carousel__photo__pre img').attr('src', aContentData[0]['photo']);
                                        $('.carousel__photo__pre video').attr('src', aContentData[0]['video']);
                                    } else {
                                        $('.carousel__photo__pre img').attr('src', aContentData[iContentCounter]['photo']);
                                        $('.carousel__photo__pre video').attr('src', aContentData[iContentCounter]['video']);
                                    }

                                    if($('.carousel__photo__pre video').attr('src')!="") {
                                        $('.carousel__photo__pre video').css('display', 'block');
                                    }
                                    else {
                                        $('.carousel__photo__pre video').css('display', 'none');
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
                      url: "https://www.zuidwestupdate.nl/wp-json/zw/v1/broadcast_data",
                      success: function( result ) {
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
                      },
                      complete: function() {
                        writeDebug(aTickerData.length*iTickerTimeoutLength*5);
                        if(aTickerData.length>0) {
                            setTimeout(getTickerData, aTickerData.length*iTickerTimeoutLength*5);
                        }
                        else {
                            setTimeout(getTickerData, 4*iTickerTimeoutLength*5);
                        }
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
