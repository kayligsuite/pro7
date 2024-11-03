/**
* @package   Gridbox template
* @author    Balbooa http://www.balbooa.com/
* @copyright Copyright @ Balbooa
* @license   http://www.gnu.org/licenses/gpl.html GNU/GPL
*/

(function($)
{
    $(document).ready(function()
    {
        var lightboxZ = 1000;
        $('.ba-lightbox').each(function(ind, el){
            var options = $(this).find('.ba-lightbox-options').val(),
                $this = this;
            options = options.split(';');
            if (options[7] == 0) {
                initBaLightbox(options, $this, ind);
            } else {
                var flag = true;
                if (localStorage[$(this).attr('data-id')]) {
                    var date =  new Date().getTime(),
                        expires = new Date(localStorage[$(this).attr('data-id')]);
                    expires.getTime();
                    if (date >= expires) {
                        flag = true;
                        localStorage.removeItem($(this).attr('data-id'));
                    } else {
                        flag = false;
                    }
                }
                if (flag) {
                    var expiration = new Date();
                    expiration.setDate(expiration.getDate() + options[8] * 1);
                    localStorage.setItem($(this).attr('data-id'), expiration);
                    initBaLightbox(options, $this, ind);
                }
            }          
        });

        function getRandomInt(min, max)
        {
            var id = Math.floor(Math.random() * (max - min)) + min;
            if ($('#'+id).length > 0) {
                id = getRandomInt(min, max)
            }
            return id;
        }

        function initBaLightbox(options, $this, ind)
        {
            if (options[4] == 'time-delay') {
                setTimeout(function(){
                    showLightbox(options, $this);
                }, options[5]);
            } else if (options[4] == 'scrolling') {
                var item = ((navigator.userAgent.toLowerCase().indexOf('webkit') != -1) ? 'body' : 'html'),
                    top,
                    docHeight,
                    htmlHeight;
                $(window).on('scroll.ba-lightbox'+ind+' load.ba-lightbox'+ind, function(){
                    top = $(item).scrollTop();
                    docHeight = document.documentElement.clientHeight
                    htmlHeight = Math.max(
                        document.body.scrollHeight, document.documentElement.scrollHeight,
                        document.body.offsetHeight, document.documentElement.offsetHeight,
                        document.body.clientHeight, document.documentElement.clientHeight
                    );
                    var x = (docHeight + top) * 100 / htmlHeight;
                    if (x >= options[6]) {
                        $(window).off('scroll.ba-lightbox'+ind+' load.ba-lightbox'+ind);
                        showLightbox(options, $this);
                    }
                });
            } else if(options[4] == 'exit-intent') {
                $(document).one('mouseleave.ba-lightbox'+ind, function(){
                    showLightbox(options, $this);
                });
            } else {
                var item = ((navigator.userAgent.toLowerCase().indexOf('webkit') != -1) ? 'body' : 'html'),
                    top,
                    docHeight,
                    htmlHeight;
                $(window).on('scroll.ba-lightbox'+ind+' load.ba-lightbox'+ind, function(){
                    top = $(item).scrollTop();
                    docHeight = document.documentElement.clientHeight;
                    htmlHeight = Math.max(
                        document.body.scrollHeight, document.documentElement.scrollHeight,
                        document.body.offsetHeight, document.documentElement.offsetHeight,
                        document.body.clientHeight, document.documentElement.clientHeight
                    );
                    var x = (docHeight + top) * 100 / htmlHeight;
                    if (x == 100) {
                        $(window).off('scroll.ba-lightbox'+ind+' load.ba-lightbox'+ind);
                        showLightbox(options, $this);
                    }
                });
            }
        }

        function showLightbox(options, $this)
        {
            var id;
            if (!options[1]) {
                var overlay = document.createElement('div'),
                    offset = {
                        top : '',
                        right : '',
                        left : '',
                        bottom : '',
                    };
                if (!$($this).hasClass('notification')) {
                    offset.left = Math.ceil($(window).width() / 2 - $($this).width() / 2) +'px';
                    offset.top = Math.ceil($(window).height() / 2 - $($this).height() / 2) +'px';
                };
                $($this).css({
                    'right' : offset.right,
                    'left' : offset.left,
                    'top' : offset.top,
                    'bottom' : offset.bottom
                });
                overlay.className = 'ba-lightbox-backdrop close-lightbox';
                overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
                $('body').append(overlay);
                $(overlay).on('click', function(){
                    $($this).removeClass('visible-lightbox');
                    $(this).remove();
                    if (overlayVideo[id]) {
                        overlayVideo[id].pauseVideo();
                    }
                    $($this).find('> .ba-section').off('scroll.overlay');
                });
            }
            $($this).find('> .ba-section > .ba-overlay').css('top', 0);
            $($this).find('> .ba-section').on('scroll.overlay', function(){
                $($this).find('> .ba-section > .ba-overlay').css({
                    'top' : this.scrollTop
                });
            });
            $($this).addClass('visible-lightbox').css('z-index', lightboxZ);
            baGoogleMaps();
            lightboxZ++;
            $($this).find('.ba-item iframe').each(function(){
                var $item = $(this),
                    src = $item .attr('src');
                if (src && src.indexOf('www.youtube.com') !== -1) {
                    if (src.indexOf('enablejsapi=1') === -1) {
                        if (src.indexOf('?') === -1) {
                            src += '?';
                        } else {
                            src += '&'
                        }
                        src += 'enablejsapi=1';
                        $item.attr('src', src);
                    }
                    if (!$item.attr('id')) {
                        $item.attr('id', getRandomInt(1, 9999999));
                    }
                    id = $item.attr('id');
                    if (!overlayVideo[id]) {
                        overlayVideo[id] = new YT.Player(id, {
                            events: {
                                onReady: function(event){
                                    if ($($this).hasClass('visible-lightbox')) {
                                        overlayVideo[id].playVideo();
                                    }                                
                                }
                            }
                        });
                    } else {
                        overlayVideo[id].playVideo();
                    }
                }
            });
            $($this).find('.visible.animated').each(function(){
                var $t = $(this);
                lightboxAnimations.forEach(function(el){
                    $t.removeClass(el)
                });
            });
            setTimeout(function(){
                $(window).trigger('scroll');
            }, 300);
            $($this).find(' > .close-lightbox').on('click', function(){
                $($this).removeClass('visible-lightbox');
                if (overlayVideo[id]) {
                    overlayVideo[id].pauseVideo();
                }
                if (!options[1]) {
                    $(overlay).remove();
                }
                $($this).find('> .ba-section').off('scroll.overlay');
            });
        }

        $('.ba-item-button .ba-buttons a, .ba-item-slider .slider-button a,'+
               ' .ba-item-icon i.zmdi, .ba-item-slideset .slideset-button a, '+
               '.ba-item-scroll-to > a, .ba-item-scroll-to-top i.zmdi, a.ba-slider-btn')
        .not('.ba-btn-transition').addClass('ba-btn-transition');
        
        $.easing['jswing'] = $.easing['swing'];

        $.extend( $.easing,
        {
            def: 'easeOutQuad',
            swing: function (x, t, b, c, d) {
                return $.easing[$.easing.def](x, t, b, c, d);
            },
            easeOutQuad: function (x, t, b, c, d) {
                return -c *(t/=d)*(t-2) + b;
            },
            easeOutCubic: function (x, t, b, c, d) {
                return c*((t=t/d-1)*t*t + 1) + b;
            },
            easeInQuart: function (x, t, b, c, d) {
                return c*(t/=d)*t*t*t + b;
            },
            easeOutQuart: function (x, t, b, c, d) {
                return -c * ((t=t/d-1)*t*t*t - 1) + b;
            },
            easeInSine: function (x, t, b, c, d) {
                return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
            },
            easeOutSine: function (x, t, b, c, d) {
                return c * Math.sin(t/d * (Math.PI/2)) + b;
            },
            easeInExpo: function (x, t, b, c, d) {
                return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
            },
            easeOutExpo: function (x, t, b, c, d) {
                return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
            }
        });

        function addCategoryListStyle(item)
        {
            var options = item.find('.ba-category-list-options').val();
            options = options.split(';');
            item.find('.ba-cat-item').css('text-align', options[3]);
            item.find('.ba-cat-item *').hover(function(){
                var options = $(this).closest('.ba-item-category-list').find('.ba-category-list-options').val();
                options = options.split(';');
                $(this).parent().find('*').css('color', options[7]);
            },function(){
                var options = $(this).closest('.ba-item-category-list').find('.ba-category-list-options').val();
                options = options.split(';');
                $(this).parent().find('*').css('color', options[6]);
            });
            item.find('.ba-cat-item *').css({
                'font-family' : options[4].replace(new RegExp('\\+','g'), ' '),
                'font-weight' : options[5],
                'font-size' : options[8]+'px',
                'line-height' : options[9]+'px',
                'color' : options[6],
                'text-decoration' : options[10],
                'text-transform' : options[11],
                'font-style' : options[12],
            });
        }

        function addTagCloudStyle(tags)
        {
            var options = tags.find('.ba-tag-cloud-options').val();
            options = options.split(';');
            tags.find('.ba-tag-cloud a').css({
                'font-family' : options[4].replace(new RegExp('\\+','g'), ' '),
                'font-weight' : options[5],
                'font-size' : options[19]+'px',
                'background-color' : options[6],
                'color' : options[7],
                'text-decoration' : options[8],
                'text-transform' : options[9],
                'font-style' : options[10],
                'border-radius' : options[11],
                'border' : options[13]+'px solid '+options[12],
                'padding' : options[17]+'px '+options[18]+'px'
            }).hover(function(){
                var options = $(this).closest('.ba-item-tag-cloud').find('.ba-tag-cloud-options').val();
                options = options.split(';');
                $(this).css({
                    'color' : options[14],
                    'background-color' : options[15],
                    'border' : options[13]+'px solid '+options[16],
                });
            },function(){
                var options = $(this).closest('.ba-item-tag-cloud').find('.ba-tag-cloud-options').val();
                options = options.split(';');
                $(this).css({
                    'color' : options[7],
                    'background-color' : options[6],
                    'border' : options[13]+'px solid '+options[12],
                });
            });
        }

        function addPostsStyle(item)
        {
            var width = $(window).width(),
                options = item.find('.ba-blog-options').val(),
                maxX = item.find(' > .ba-blog').innerWidth(),
                x = 0,
                flag = false,
                y = 0,
                height = 0;
            options = options.split(';');
            var percent = Math.floor(item.find('.ba-blog').outerWidth() / options[6]);
            if (width <= 480) {
                percent = Math.floor(item.find('.ba-blog').outerWidth());
            } else if (width <= 768) {
                if (options[6] > 1) {
                    percent = Math.floor(item.find('.ba-blog').outerWidth() / 2);
                }
            }
            item.find('.ba-blog-item').css({
                'width' : percent+'px',
            });
            item.find('.ba-blog-title').css({
                'text-align' : options[17],
                'margin-bottom' : options[23]+'px'
            });
            item.find('.ba-blog-title, .ba-blog-title a').css({
                'font-family' : options[18].replace(new RegExp('\\+','g'), ' '),
                'font-weight' : options[19],
                'color' : options[20],
                'font-size' : options[21]+'px',
                'line-height' : options[22]+'px',
                'text-decoration' : options[24],
                'text-transform' : options[25],
                'font-style' : options[26]
            });
            item.find('.ba-blog-info').css('text-align',options[27]);
            item.find('.ba-blog-data, .ba-blog-category').css({
                'font-family' : options[28].replace(new RegExp('\\+','g'), ' '),
                'font-weight' : options[29],
                'color' : options[30],
                'font-size' : options[31]+'px',
                'line-height' : options[32]+'px',
                'text-decoration' : options[33],
                'text-transform' : options[34],
                'font-style' : options[35]
            });
            item.find('.ba-blog-intro-text').css({
                'text-align' : options[36],
                'font-family' : options[37].replace(new RegExp('\\+','g'), ' '),
                'font-weight' : options[38],
                'color' : options[39],
                'font-size' : options[40]+'px',
                'line-height' : options[41]+'px',
                'text-decoration' : options[42],
                'text-transform' : options[43],
                'font-style' : options[44],
                'margin-top' : options[45]+'px'
            });
            item.find('.ba-blog-btn').css({
                'text-align' : options[46],
                'margin-top' : options[63]+'px',
            });
            item.find('.ba-blog-btn a').css({
                'display' : 'inline-block',
                'font-family' : options[47].replace(new RegExp('\\+','g'), ' '),
                'font-weight' : options[48],
                'background-color' : options[49],
                'color' : options[50],
                'font-size' : options[51]+'px',
                'text-decoration' : options[52],
                'text-transform' : options[53],
                'font-style' : options[54],
                'border-radius' : options[55]+'px',
                'border' : options[57]+'px solid '+options[56],
                'padding' : options[61]+'px '+options[62]+'px'
            }).hover(function(){
                var options = $(this).closest('.ba-item-blog').find('.ba-blog-options').val();
                options = options.split(';');
                $(this).css({
                    'color' : options[58],
                    'background-color' : options[59],
                    'border' : options[57]+'px solid '+options[60]
                });
            }, function(){
                var options = $(this).closest('.ba-item-blog').find('.ba-blog-options').val();
                options = options.split(';');
                $(this).css({
                    'color' : options[50],
                    'background-color' : options[49],
                    'border' : options[57]+'px solid '+options[56]
                });
            });
            item.find('.ba-blog-paginator').css({
                'text-align' : options[64],
                'margin-top' : options[81]+'px'
            });
            item.find('.ba-blog-paginator a').css({
                'font-family' : options[65].replace(new RegExp('\\+','g'), ' '),
                'font-weight' : options[66],
                'background-color' : options[67],
                'color' : options[68],
                'font-size' : options[69]+'px',
                'text-decoration' : options[70],
                'text-transform' : options[71],
                'font-style' : options[72],
                'border-radius' : options[73]+'px',
                'border' : options[75]+'px solid '+options[88],
                'padding' : options[79]+'px '+options[80]+'px'
            }).hover(function(){
                var options = $(this).closest('.ba-item-blog').find('.ba-blog-options').val();
                options = options.split(';');
                $(this).css({
                    'color' : options[76],
                    'background-color' : options[77],
                    'border' : options[75]+'px solid '+options[78]
                });
            }, function(){
                var options = $(this).closest('.ba-item-blog').find('.ba-blog-options').val();
                options = options.split(';');
                $(this).css({
                    'color' : options[68],
                    'background-color' : options[67],
                    'border' : options[75]+'px solid '+options[74]
                });
            });
            setTimeout(function(){
                item.find('.ba-blog-item').each(function(){
                    var width = $(this).innerWidth();
                    if (x + width > maxX) {
                        x = 0;
                        flag = true;
                    }
                    if (x + width*2 > maxX && options[6] > 1) {
                        $(this).addClass('ba-last-post')
                    }
                    if (flag) {
                        y = 0;
                        $(this).prevAll().each(function(){
                            var pos = $(this).position()
                            if (pos.left == x) {
                                y += this.offsetHeight;
                                if (height < y) {
                                    height = y;
                                }
                            }
                            
                        });
                    }
                    if (height < y + this.offsetHeight) {
                        height = y + this.offsetHeight;
                    }
                    $(this).css({
                        'left' : x+'px',
                        'top' : y+'px'
                    });
                    x += width;
                });
                item.find('.ba-blog').height(height);
            }, 300);
            item.find('.older-posts, .newer-posts').on('click', function(){
                var form = $(this).closest('form'),
                    input = form.find('[name="ba_blog_page"]'),
                    page = $(this).attr('data-page');
                input.val(page);
                form.submit();
            });
            item.find('.load-posts').on('click', function(){
                var blog = $(this).closest('.ba-item-blog'),
                    options = blog.find('.ba-blog-options').val(),
                    page = $(this).attr('data-page'),
                    start;
                options = options.split(';');
                start = options[7] * page;
                $.ajax({
                    type:"POST",
                    dataType:'text',
                    url:"index.php?option=com_bagrid&task=bagrid.getBlogPosts",
                    data:{
                        category: options[3],
                        limit : options[7] * 1 + start,
                        start : start
                    },
                    success: function(msg){
                        msg = JSON.parse(msg);
                        msg = JSON.parse(msg.message);
                        blog.find('.hidden-post').each(function(ind, el){
                            if (ind == options[7]) {
                                return false;
                            }
                            if (options[4] == 'cover' && msg[ind].intro_image && options[9] == 1) {
                                $(this).css('background-image', 'url('+msg[i].intro_image+')');
                            } else if (options[4] != 'masonry' && msg[ind].intro_image && options[9] == 1) {
                                $(this).find('.ba-blog-image').css('background-image', 'url('+msg[i].intro_image+')');
                            } else if (options[4] == 'masonry' && msg[ind].intro_image && options[9] == 1) {
                                var image = '<img src="'+msg[i].intro_image+'" alt="'+msg[i].iamge_alt+'">';
                                $(this).find('.ba-blog-image').prepend(image)
                            }
                        });
                        blog.find('.hidden-post').each(function(ind, el){
                            if (ind == options[7]) {
                                return false;
                            }
                            $(this).removeClass('hidden-post');
                        });
                        blog.find('.load-posts').attr('data-page', page++);
                    }
                });
            });
        }

        function addPageStyle()
        {
            $('.ba-item-page-tags').each(function(){
                var options = $(this).find('.ba-page-tags-options').val();
                options = options.split(';');
                $(this).find('.ba-page-tags a').css({
                    'font-family' : options[4].replace(new RegExp('\\+','g'), ' '),
                    'font-weight' : options[5],
                    'font-size' : options[19]+'px',
                    'background-color' : options[6],
                    'color' : options[7],
                    'text-decoration' : options[8],
                    'text-transform' : options[9],
                    'font-style' : options[10],
                    'border-radius' : options[11],
                    'border' : options[13]+'px solid '+options[12],
                    'padding' : options[17]+'px '+options[18]+'px'
                }).hover(function(){
                    var options = $(this).closest('.ba-item-page-tags').find('.ba-page-tags-options').val();
                    options = options.split(';');
                    $(this).css({
                        'color' : options[14],
                        'background-color' : options[15],
                        'border' : options[13]+'px solid '+options[16],
                    });
                },function(){
                    var options = $(this).closest('.ba-item-page-tags').find('.ba-page-tags-options').val();
                    options = options.split(';');
                    $(this).css({
                        'color' : options[7],
                        'background-color' : options[6],
                        'border' : options[13]+'px solid '+options[12],
                    });
                }).addClass('ba-btn-transition');
            });
        }

        $('.content-text').each(function(){
            $(this).removeAttr('contenteditable').removeAttr('tabindex')
                .removeAttr('spellcheck').removeAttr('role').removeAttr('aria-label')
                .removeAttr('title').removeAttr('aria-describedby');
        });
        
        var countdownArray = new Array(),
            introImage = '',
            onePageScroll = true;
        
        if ($('[property="og:image"]').length > 0) {
            introImage = $('[property="og:image"]')[0].content;
        }
        
        function checkFonts()
        {
            var link = document.getElementById('google-fonts'),
                url = '//fonts.googleapis.com/css?family=',
                str = link.href,
                subset = '&subset=latin,cyrillic,greek,latin-ext,greek-ext,vietnamese,cyrillic-ext',
                fonts = {},
                len,
                subStr;
            str = str.replace(location.protocol+url, '');
            str = str.replace(subset, '');
            str = str.split('%7C');
            len = str.length;
            for (var i = 0; i < len; i++) {
                subStr = str[i].split(':');
                fonts[subStr[0]] = subStr[1]
            }
            $('.ba-item-button').each(function(){
                var options = $(this).find('.ba-button-options').val(),
                    key;
                options = options.split(';');
                key = options[22];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[7]) < 0 && !isNaN(options[7])) {
                        fonts[key] = fonts[key]+','+options[7];
                    }
                } else {
                    fonts[key] = options[7];
                }
            });
            $('.ba-item-page-tags').each(function(){
                var options = $(this).find('.ba-page-tags-options').val(),
                    key;
                options = options.split(';');
                key = options[4];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[5]) < 0 && !isNaN(options[5])) {
                        fonts[key] = fonts[key]+','+options[5];
                    }
                } else {
                    fonts[key] = options[5];
                }
            });
            $('.ba-item-slider').each(function(){
                var options = $(this).find('.ba-slider-options').val(),
                    key;
                options = options.split(';');
                key = options[10];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[11]) < 0 && !isNaN(options[11])) {
                        fonts[key] = fonts[key]+','+options[11];
                    }
                } else {
                    fonts[key] = options[11];
                }
                key  = options[20];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[21]) < 0 && !isNaN(options[21])) {
                        fonts[key] = fonts[key]+','+options[21];
                    }
                } else {
                    fonts[key] = options[21];
                }
                key  = options[28];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[29]) < 0 && !isNaN(options[29])) {
                        fonts[key] = fonts[key]+','+options[29];
                    }
                } else {
                    fonts[key] = options[29];
                }
            });
            $('.ba-item-slideset').each(function(){
                var options = $(this).find('.ba-slideset-options').val(),
                    key;
                options = options.split(';');
                key = options[15];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[15]) < 0 && !isNaN(options[16])) {
                        fonts[key] = fonts[key]+','+options[16];
                    }
                } else {
                    fonts[key] = options[16];
                }
                key  = options[25];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[26]) < 0 && !isNaN(options[26])) {
                        fonts[key] = fonts[key]+','+options[26];
                    }
                } else {
                    fonts[key] = options[26];
                }
                key  = options[34];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[35]) < 0 && !isNaN(options[35])) {
                        fonts[key] = fonts[key]+','+options[35];
                    }
                } else {
                    fonts[key] = options[35];
                }
            });
            $('.ba-item-tabs').each(function(){
                var options = $(this).find('.ba-tabs-options').val(),
                    key;
                options = options.split(';');
                key = options[10];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[11]) < 0 && !isNaN(options[11])) {
                        fonts[key] = fonts[key]+','+options[11];
                    }
                } else {
                    fonts[key] = options[11];
                }
            });
            $('.ba-item-weather').each(function(){
                var options = $(this).find('.ba-weather-options').val(),
                    key;
                options = options.split(';');
                key = options[13];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[14]) < 0 && !isNaN(options[14])) {
                        fonts[key] = fonts[key]+','+options[14];
                    }
                } else {
                    fonts[key] = options[14];
                }
                key = options[22];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[23]) < 0 && !isNaN(options[23])) {
                        fonts[key] = fonts[key]+','+options[23];
                    }
                } else {
                    fonts[key] = options[23];
                }
                key = options[31];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[32]) < 0 && !isNaN(options[32])) {
                        fonts[key] = fonts[key]+','+options[32];
                    }
                } else {
                    fonts[key] = options[32];
                }
                key = options[40];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[41]) < 0 && !isNaN(options[41])) {
                        fonts[key] = fonts[key]+','+options[41];
                    }
                } else {
                    fonts[key] = options[41];
                }
            });
            $('.ba-item-accordion').each(function(){
                var options = $(this).find('.ba-accordion-options').val(),
                    key;
                options = options.split(';');
                key = options[7];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[8]) < 0 && !isNaN(options[8])) {
                        fonts[key] = fonts[key]+','+options[8];
                    }
                } else {
                    fonts[key] = options[8];
                }
            });
            $('.ba-item-scroll-to').each(function(){
                var options = $(this).find('.ba-scroll-to-options').val(),
                    key;
                options = options.split(';');
                key = options[22];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[23]) < 0 && !isNaN(options[23])) {
                        fonts[key] = fonts[key]+','+options[22];
                    }
                } else {
                    fonts[key] = options[23];
                }
            });
            $('.ba-item-counter').each(function(){
                var options = $(this).find('.ba-counter-options').val(),
                    key;
                options = options.split(';');
                key = options[6];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[7]) < 0 && !isNaN(options[7])) {
                        fonts[key] = fonts[key]+','+options[6];
                    }
                } else {
                    fonts[key] = options[7];
                }
            });
            $('.ba-item-category-list').each(function(){
                var options = $(this).find('.ba-category-list-options').val(),
                    key;
                options = options.split(';');
                key = options[4];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[5]) < 0 && !isNaN(options[5])) {
                        fonts[key] = fonts[key]+','+options[5];
                    }
                } else {
                    fonts[key] = options[5];
                }
            });
            $('.ba-item-countdown').each(function(){
                var options = $(this).find('.ba-countdown-options').val(),
                    key;
                options = options.split(';');
                key = options[10];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[11]) < 0 && !isNaN(options[11])) {
                        fonts[key] = fonts[key]+','+options[11];
                    }
                } else {
                    fonts[key] = options[11];
                }
                key = options[17];
                if(fonts[key]) {
                    if (fonts[key].indexOf(options[18]) < 0 && !isNaN(options[18])) {
                        fonts[key] = fonts[key]+','+options[18];
                    }
                } else {
                    fonts[key] = options[18];
                }
            });
            str = '';
            for(var prop in fonts) {
                str += prop+':'+fonts[prop]+'%7C';
            }
            str = url+str+subset.replace('%7C', '');
            link.href = str;
            str = '';
            for(var prop in fonts) {
                str += prop+':'+fonts[prop]+'%7C';
            }
            str = url+str+subset.replace('%7C', '');
            link = document.createElement('link');
            link.href = str;
            link.rel = 'stylesheet';
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        checkFonts();

        function initialImageLightbox()
        {
            $('.ba-item-image').each(function(event){
                $(this).find('img').off('click.lightbox');
                if ($(this).hasClass('ba-lightbox-item-image')) {
                    $(this).find('> a').on('click', function(event){
                        event.preventDefault();
                    });
                    $(this).find('img').on('click.lightbox', function(){
                        $('.ba-image-backdrop').remove();
                        var div = document.createElement('div'),
                            width = this.width,
                            height = this.height,
                            backdrop = document.createElement('div'),
                            offset = $(this).offset(),
                            imgHeight = this.naturalHeight,
                            modalTop,
                            imgWidth = this.naturalWidth,
                            modal = $(div),
                            target = $(window).height()-100,
                            flag = true,
                            img = document.createElement('img'),
                            left,
                            wWidth = $(window).width()*1,
                            wHeigth = $(window).height()*1,
                            options = $(this).closest('.ba-item-image').find('.ba-image-options').val();
                        options = options.split(';');
                        if (!options[12]) {
                            options[12] = 'rgba(0, 0, 0, 0.6)';
                        }
                        img.src = this.src;
                        div.className = 'ba-image-modal';
                        div.style.top = offset.top * 1 - $(window).scrollTop() * 1+'px';
                        div.style.left = offset.left+'px';
                        div.style.width = width+'px';
                        div.appendChild(img);
                        img.style.width = width+'px';
                        img.style.height = height+'px';
                        backdrop.className = 'ba-image-backdrop';
                        backdrop.style.backgroundColor = options[12];
                        $(backdrop).on('click', function(){
                            $(this).addClass('image-lightbox-out');
                            modal.animate({
                                'width' : width,
                                'height' : height,
                                'left' : offset.left,
                                'top' : offset.top * 1 - $(window).scrollTop() * 1
                            }, '500', function(){
                                $('.ba-image-backdrop').remove();
                            });
                            modal.find('img').animate({
                                'width' : width,
                                'height' : height,
                                'left' : offset.left,
                                'top' : offset.top * 1 - $(window).scrollTop() * 1
                            }, '500');
                        });
                        $('body').append(div);
                        modal.wrap(backdrop);
                        if (wWidth > 1024) {
                            if (imgWidth * 1 < wWidth && imgHeight * 1 < wHeigth) {
                            
                            } else {
                                if (imgWidth > imgHeight) {
                                    var percent = target/imgWidth;
                                    flag = false;
                                } else {
                                    var percent = target/imgHeight;
                                    flag = true;
                                }
                                imgWidth = imgWidth * percent;
                                imgHeight = imgHeight * percent;
                                if (imgWidth > wWidth) {
                                    imgWidth = imgWidth * percent;
                                    imgHeight = imgHeight * percent;
                                }
                                if (!flag) {
                                    var percent = imgWidth / imgHeight;
                                    imgHeight = target;
                                    imgWidth = imgHeight * percent;
                                    if (wWidth - 100 < imgWidth) {
                                        imgWidth = wHeigth - 100;
                                        imgHeight = imgWidth / percent;
                                    }
                                }
                            }
                        } else {
                            var percent = imgWidth / imgHeight;
                            if (percent >= 1) {
                                imgWidth = wWidth * 0.90;
                                imgHeight = imgWidth / percent;
                                if (wHeigth - imgHeight < wHeigth * 0.1) {
                                    imgHeight = wHeigth * 0.90;
                                    imgWidth = imgHeight * percent;
                                }
                            } else {
                                imgHeight = wHeigth * 0.90;
                                imgWidth = imgHeight * percent;
                                if (wWidth -imgWidth < wWidth * 0.1) {
                                    imgWidth = wWidth * 0.90;
                                    imgHeight = imgWidth / percent;
                                }
                            }
                        }
                        modalTop = (wHeigth - imgHeight)/2;
                        left = (wWidth - imgWidth)/2;
                        modal.animate({
                            'width' : Math.round(imgWidth),
                            'height' : Math.round(imgHeight),
                            'left' : Math.round(left),
                            'top' : Math.round(modalTop)
                        }, '500');
                        modal.find('img').animate({
                            'width' : Math.round(imgWidth),
                            'height' : Math.round(imgHeight),
                            'left' : Math.round(left),
                            'top' : Math.round(modalTop)
                        }, '500');
                    });
                }
            });
        }

        function initWeather(item)
        {
            var options = item.find('.ba-weather-options').val();
            options = options.split(';');
            item.find('.ba-weather').ba_weather('delete');
            item.find('.ba-weather').ba_weather({
                location : options[3],
                unit : options[5],
                days : options[6],
                layout : options[7],
                style : options,
                lang : options[4]
            });
        }

        function initCounter(item)
        {
            var options = item.find('.ba-counter-options').val();
                options = options.split(';');
                item.find('.counter.number').text(options[3]);
                item.find('.counter.number').ba_counter('delete');
                item.find('.counter.number').ba_counter({
                    time : options[4]*1
                });
        }

        function scrollToHover(item)
        {
            item.find('> a').off('hover');
            item.find('> a').hover(function(){
                var options = $(this).closest('.ba-item-scroll-to').find('.ba-scroll-to-options').val();
                options = options.split(';');
                $(this).css({
                    'color' : options[7],
                    'background-color' : options[14],
                    'border' : options[11]+'px solid '+options[15],
                });
            },function(){
                var options = $(this).closest('.ba-item-scroll-to').find('.ba-scroll-to-options').val();
                options = options.split(';');
                $(this).css({
                    'color' : options[4],
                    'background-color' : options[8],
                    'border' : options[11]+'px solid '+options[9]
                });
            });
        }

        function initScrollTo(item)
        {
            var options = item.find('.ba-scroll-to-options').val();
            options = options.split(';');
            scrollToHover(item);
            item.find(' > a').off('click')
            item.find(' > a').on('click', function(event){
                event.preventDefault();
                if (options[6] != '') {
                    var value = $('[data-scroll-to="'+options[6]+'"]').offset().top;
                    $('html, body').stop().animate({
                        scrollTop: value
                    }, options[12]*1, options[13]);
                }
            });
            
        }

        function scrolltoTopHover(item)
        {
            item.find('i.zmdi').off('hover');
            item.find('i.zmdi').hover(function(){
                var options = $(this).closest('.ba-item-scroll-to-top').find('.ba-scroll-to-top-options').val()
                options = options.split(';');
                $(this).css({
                    'color' : options[7],
                    'background-color' : options[14],
                    'border' : options[11]+'px solid '+options[15],
                });
            },function(){
                var options = $(this).closest('.ba-item-scroll-to-top').find('.ba-scroll-to-top-options').val()
                options = options.split(';');
                $(this).css({
                    'color' : options[4],
                    'background-color' : options[8],
                    'border' : options[11]+'px solid '+options[9]
                });
            });
            $('body').append(item[0]);
        }

        function initScrollTop(item)
        {
            var options = item.find('.ba-scroll-to-top-options').val();
            options = options.split(';');
            scrolltoTopHover(item);
            item.find(' > a').off('click')
            item.find(' > a').on('click', function(event){
                event.preventDefault();
                $('html, body').animate({
                    scrollTop: 0
                }, options[12]*1, options[13]);
            });
            $(window).off('scroll.scrollTop');
            $(window).on('scroll.scrollTop', function(){
                var top  = $(window).scrollTop()
                $('.ba-item-scroll-to-top').each(function(){
                    var options = $(this).find('.ba-scroll-to-top-options').val();
                    options = options.split(';');
                    if (top >= options[6]) {
                        $(this).addClass('visible-scroll-to-top');
                    } else {
                        $(this).removeClass('visible-scroll-to-top');
                    }
                });
            });
        }
        
        var currentTab;
        
        $('.ba-item-countdown').each(function(){
            var options = $(this).find('.ba-countdown-options').val();
            options = options.split(';');
            var endTime = makeDate(options[4], options[5]),
                self = this,
                mode = options[6];
            makecountdown(endTime, self, mode, options[9], options[8]);
            countdownArray[options[9]] = setInterval(function(){
                makecountdown(endTime, self, mode, options[9], options[8]);
            }, 1000);
        });
        $('.ba-item-slider').each(function(){
            $(this).parent().addClass('ba-no-padding');
        });
        $('.ba-item-scroll-to-top').each(function(){
            initScrollTop($(this));
        });
        $('.ba-item-scroll-to').each(function(){
            initScrollTo($(this));
        });

        function iconsSetHover()
        {
            $('.ba-item-icon i.zmdi').hover(function(){
                var options = $(this).closest('.ba-item-icon').find('.ba-icon-options').val();
                options = options.split(';');
                $(this).css('color', options[9]);

            },function(){
                var options = $(this).closest('.ba-item-icon').find('.ba-icon-options').val();
                options = options.split(';');
                $(this).css('color', options[4]);
            })
        }
        
        function initDisqus()
        {
            setTimeout(function(){
                var item = $('.ba-item-disqus #disqus_thread');
                if (item.length > 0 ) {
                    var options = item.closest('.ba-item-disqus').find('.ba-disqus-options').val();
                    options = options.split(';');
                    item.empty();
                    var dsq = document.createElement('script')
                    dsq.type = 'text/javascript';
                    dsq.async = true;
                    if (typeof(DISQUS) != 'undefined') {
                        delete(DISQUS)
                    }
                    if (options[3] == '') {
                        options[3] = 'gridbox';
                    }
                    dsq.src = '//'+options[3]+'.disqus.com/embed.js';
                    var old = document.getElementsByTagName('head')[0].appendChild(dsq);
                }
            }, 500);
            
        }
        
        function initSocial(item, counters, facebook, twitter, google, pinterest, lIn, vk)
        {
            if (introImage == '') {
                item.find('.pinterest').hide();
            }
            item.ba_social({
                counters : counters,
                facebook : facebook,
                twitter : twitter,
                google : google,
                linkedin : lIn,
                pinterest : pinterest,
                image : introImage,
                vk : vk
            });
        }

        function initSocials()
        {
            setTimeout(function(){
                $('.ba-item-social').each(function(){
                    var options = $(this).find('.ba-social-options').val(),
                        item = $(this).find('.ba-social');
                    options = options.split(';');
                    initSocial(item, options[3], options[4], options[5], options[6], options[7], options[12], options[13]);
                });
            }, 100);
        }
        
        function makeDate(date, time)
        {
            var endTime = new Date(date),
                year = endTime.getFullYear(),
                month = endTime.getMonth(),
                day = endTime.getDate(),
                mode = time;
            date = new Date(year, month, day, time);
            return date;
        }
    
        function makecountdown(endTime, item, mode, counter, hide)
        {
            var now = new Date();
            endTime = (Date.parse(endTime)) / 1000;
            now = (Date.parse(now) / 1000);
            var timeLeft = endTime - now;
            if (timeLeft >= 0) {
                var days = Math.floor(timeLeft / 86400),
                    hours = Math.floor((timeLeft - (days * 86400)) / 3600),
                    minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600)) / 60),
                    seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));
                if (mode == 'hours') {
                    hours = Math.floor(timeLeft / 3600);
                } else if (mode == 'minutes') {
                    minutes = Math.floor(timeLeft / 60);
                }
                if (hours < "10") {
                    hours = "0" + hours;
                }
                if (minutes < "10") {
                    minutes = "0" + minutes;
                }
                if (seconds < "10") {
                    seconds = "0" + seconds;
                }
                if (mode == 'full') {
                    $(item).find('.days .countdown-time').text(days);
                }
                if (mode != 'minutes') {
                    $(item).find('.hours .countdown-time').text(hours);
                }
                $(item).find('.minutes .countdown-time').text(minutes);
                $(item).find('.seconds .countdown-time').text(seconds);
            } else {
                clearInterval(countdownArray[counter]);
                $(item).find('.days .countdown-time').text('0');
                $(item).find('.hours .countdown-time').text('00');
                $(item).find('.minutes .countdown-time').text('00');
                $(item).find('.seconds .countdown-time').text('00');
                if (hide*1 === 1) {
                    $(item).hide();
                }
            }
        }
        
        function tabsClick()
        {
            $('.ba-item-tabs ul.nav.nav-tabs > li').on('shown', 'a', function (event) {
                var parent = $(this).closest('ul.nav'),
                    options = $(this).closest('.ba-item-tabs').find('.ba-tabs-options').val();
                options = options.split(';');
                if (parent.hasClass('tabs-left') || parent.hasClass('tabs-right')) {
                    var height = $(this).closest('.ba-item-tabs').find(".tab-content").outerHeight();
                    $(this).closest('ul.nav').css('min-height', height+'px');
                }
                $(this).closest('ul').find(' > li.active a').css({
                    'color' : options[14],
                    'background-color' : options[15],
                    'border-color': options[16]
                });
            });
            $('.ba-item-tabs ul.nav.nav-tabs > li').on('click', 'a', function(){
                var content = $(this).attr('href'),
                    tabClass = 'prev';
                $(content).parent().children().each(function(){
                    if ('#'+this.id == content) {
                        tabClass = 'next';
                    }
                    if ('#'+this.id == currentTab) {
                        return false;
                    }
                });
                $(this).closest('.ba-item-tabs').find('.tab-pane').removeClass('prev next');
                $(content).addClass(tabClass);
                var options = $(this).closest('.ba-item-tabs').find('.ba-tabs-options').val();
                options = options.split(';');
                $(this).closest('ul').find('> li a').css({
                    'color' : options[7],
                    'background-color' : '',
                    'border-color': ''
                });
            });
        }

        function tabsHover()
        {
            $('.ba-item-tabs ul.nav.nav-tabs').on('mouseenter', 'li', function(){
                currentTab = $(this).closest('ul').find(' > li.active a').attr('href');
                var options = $(this).closest('.ba-item-tabs').find('.ba-tabs-options').val();
                options = options.split(';');
                $(this).find('a').css({
                    'color' : options[17],
                    'background-color' : options[18],
                    'border' : '1px solid '+options[19]
                });
            });
            $('.ba-item-tabs ul.nav.nav-tabs').on('mouseleave', 'li', function(){
                var options = $(this).closest('.ba-item-tabs').find('.ba-tabs-options').val();
                options = options.split(';');
                if ($(this).hasClass('active')) {
                    $(this).find('a').css({
                        'color' : options[14],
                        'background-color' : options[15],
                        'border' : '',
                        'border-color' : options[16]
                    });
                } else {
                    $(this).find('a').css({
                        'color' : options[7],
                        'background-color' : '',
                        'border' : ''
                    });
                }
            });
        }
        
        tabsClick();
        tabsHover();
        
        //video-background
        
        var video = $('.ba-video-background input').val();
        if (video) {
            video = video.split(';');
        }
        var tag = document.createElement('script'),
            players = 0,
            firstScriptTag = document.getElementsByTagName('script')[0],
            defaultVideo = {
                ratio: 16/9,
                mute: true,
                width: $(window).width(),
                wrapperZIndex: 99,
                start: 0
            };
        var sliderIndex = 0,
            sliderVideo = new Array();

        function onPlayerReadySlider(event)
        {
            event.target.mute();
            if ($(event.target.a).closest('li.item').hasClass('active')) {
                event.target.playVideo()
            }
        }

        function onPlayerStateChangeSlider(state)
        {
            if (state.data === 0) {
                state.target.playVideo();
            }
        }
        tag.src = "https://www.youtube.com/iframe_api";
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        function onPlayerReady(event)
        {
            if (defaultVideo.mute == 1) {
                event.target.mute();
            }
            event.target.playVideo()
        }
        
        function onPlayerStateChange(state)
        {
            if (state.data === 0) {
                state.target.playVideo();
            }
        }
        
        function resizeVideo()
        {
            var width = $(window).width();
            $('.ba-video-background').each(function(indx, element){
                var pWidth,
                    height = $(window).height(),
                    pHeight,
                    player = $(this).find('iframe');
                pHeight = Math.ceil(width / defaultVideo.ratio);
                player.width(width).height(pHeight).css({left: 0, top: 0});
                if ($(this).hasClass('ba-responsive-video-image')) {
                    if (width <= 1024) {
                        $(this).removeClass('ba-hide-video-image');
                    } else {
                        $(this).addClass('ba-hide-video-image');
                    }
                }
            });
            $('.ba-slide-img').each(function(indx, element){
                var pWidth,
                    height = $(window).height(),
                    pHeight,
                    player = $(this).find('iframe');
                pHeight = Math.ceil(width / defaultVideo.ratio);
                player.width(width).height(pHeight);
            });
            $('.ba-item-blog').each(function(){
                var options = $(this).find('.ba-blog-options').val();
                options = options.split(';');
                addPostsStyle($(this));
            });
        }
        
        function createIframe(width, videoId, vq, start)
        {
            if (videoId != '') {
                var player;
                player = new YT.Player('video-background-'+players, {
                    width: width,
                    height: Math.ceil(width / defaultVideo.ratio),
                    videoId: videoId,
                    playerVars: {
                        controls: 0,
                        showinfo: 0,
                        modestbranding: 1,
                        loop : 1,
                        start : start,
                        autohide: 1,
                        iv_load_policy: 3,
                        wmode: 'transparent',
                        vq: vq
                    },
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange
                    }
                });
                resizeVideo();
            }
        }
    
        function reCreateIframe()
        {
            $('.ba-video-background').not('.global-video-bg').each(function(indx, element){
                var id = $(this).find('iframe').attr('id'),
                    i = id.substr(17),
                    parent = $(this).parent();
                if (parent.hasClass('ba-section')) {
                    var options = parent.find('.ba-options').val(),
                        str = '<div class="ba-video-background',
                        width = parent.width();
                    options = options.split(';');
                    var videoId = options[21],
                        vq = options[25];
                    if (options[30] && options[30] != '') {
                        str += ' ba-responsive-video-image';
                    }
                    str += '"';
                    if (options[30] && options[30] != '') {
                        str += ' style="background-image: url('+options[30]+');"';
                    }
                    str += '><div id="'+id;
                    str += '"></div></div>';
                    players = i*1;
                    parent.find(' > .ba-video-background').remove();
                    parent.css('background', 'transparent');
                    parent.append(str);
                    parent.addClass('ba-video');
                    defaultVideo.start = options[24];
                    defaultVideo.mute = options[23];
                } else if (parent.hasClass('ba-row')) {
                    var options = parent.find('.row-options').val(),
                        str = '<div class="ba-video-background',
                        width = parent.width();
                    options = options.split(';');
                    var videoId = options[16],
                        vq = options[20];
                    if (options[27] && options[27] != '') {
                        str += ' ba-responsive-video-image';
                    }
                    str += '"';
                    if (options[27] && options[27] != '') {
                        str += ' style="background-image: url('+options[27]+');"';
                    }
                    str += '><div id="'+id;
                    str += '"></div></div>';
                    players = i*1;
                    parent.find(' > .ba-video-background').remove();
                    parent.css('background', 'transparent');
                    parent.append(str);
                    parent.addClass('ba-video');
                    defaultVideo.start = options[19];
                    defaultVideo.mute = options[18];
                } else {
                    var options = parent.find('.column-options').val(),
                        str = '<div class="ba-video-background',
                        width = parent.width();
                    options = options.split(';');
                    var videoId = options[3],
                        vq = options[7];
                    if (options[24] && options[24] != '') {
                        str += ' ba-responsive-video-image';
                    }
                    str += '"';
                    if (options[24] && options[24] != '') {
                        str += ' style="background-image: url('+options[24]+');"';
                    }
                    str += '><div id="'+id;
                    str += '"></div></div>';
                    players = i*1;
                    parent.find(' > .ba-video-background').remove();
                    parent.css('background', 'transparent');
                    parent.append(str);
                    parent.addClass('ba-video');
                    defaultVideo.start = options[6];
                    defaultVideo.mute = options[5];
                }
                if ($(window).width() > 1024 ||
                    ($(window).width() <= 1024 && !parent.find(' > .ba-video-background').hasClass('ba-responsive-video-image'))) {
                    createIframe(width, videoId, vq, defaultVideo.start);
                }
                players++;
            });
            $('.ba-video').each(function(){
                if ($(this).find(' > .ba-video-background').length == 0) {
                    $(this).removeClass('ba-video');
                }
            });
            $('.ba-slide .ba-slide-img').each(function(){
                var embed;
                if (embed = $(this).attr('data-slide-video')) {
                    var id = $(this).children().attr('id'),
                        start = $(this).attr('data-video-start');
                    $(this).html('<div id="'+id+'"></div>');
                    if ($(window).width() > 1024 || (!$(this).attr('data-img-url'))){
                        sliderVideo[id] = new YT.Player(id, {
                            width: $(window).width(),
                            height: Math.ceil($(window).width() / defaultVideo.ratio),
                            videoId: embed,
                            playerVars: {
                                controls: 0,
                                showinfo: 0,
                                modestbranding: 1,
                                loop : 1,
                                start : start,
                                autohide: 1,
                                iv_load_policy: 3,
                                wmode: 'transparent',
                                vq: 'hd720'
                            },
                            events: {
                                'onReady': onPlayerReadySlider,
                                'onStateChange': onPlayerStateChangeSlider
                            }
                        });
                    }
                    id = id.replace('slider-video-', '')*1+1;
                    if (sliderIndex < id) {
                        sliderIndex = id;
                    }

                }
            });
        }
        
        function createVideo()
        {
            var width = $(window).width(),
                videoId = video[0],
                vq = video[3];
            defaultVideo.start = video[2];
            defaultVideo.mute = video[1];
            var parent = $('#ba-video-background')
            if ($(window).width() > 1024 ||
                ($(window).width() <= 1024 && !parent.find(' > .ba-video-background').hasClass('ba-responsive-video-image'))) {
                if (videoId != '') {
                    var player;
                    player = new YT.Player('ba-video-background', {
                        width: width,
                        height: Math.ceil(width / defaultVideo.ratio),
                        videoId: videoId,
                        playerVars: {
                            controls: 0,
                            showinfo: 0,
                            modestbranding: 1,
                            loop : 1,
                            start : video[2],
                            autohide: 1,
                            iv_load_policy: 3,
                            wmode: 'transparent',
                            vq: vq
                        },
                        events: {
                            'onReady': onPlayerReady,
                            'onStateChange': onPlayerStateChange
                        }
                    });
                    resizeVideo();
                }
            }
        }
        
        var iframeInterval = setInterval(function(){
            if (typeof(YT) !== 'undefined') {
                if (typeof(YT.Player) !== 'undefined') {
                    clearInterval(iframeInterval);
                    if (video) {
                        createVideo();
                    }
                    reCreateIframe();
                }
            }
        }, 12);
        
        $(window).on('resize', function(){
            resizeVideo();
        });
        
        function setHoverButton()
        {
            $('.ba-item-button').each(function(){
                $(this).find('.ba-buttons a').hover(function(){
                    var options = $(this).closest('.ba-item-button').find('.ba-button-options').val();
                    options = options.split(';');
                    $(this).css('color', options[13]);
                    $(this).css('background', options[14]);
                    $(this).css('border', options[12]+'px solid '+options[15]);
                }, function(){
                    var options = $(this).closest('.ba-item-button').find('.ba-button-options').val();
                    options = options.split(';');
                    $(this).css('color', options[5]);
                    $(this).css('background', options[4]);
                    $(this).css('border', options[12]+'px solid '+options[11]);
                });
            });
        }

        var overlayAnimations = new Array(),
            lightboxAnimations = new Array();
        
        function checkAnimation()
        {
            var scripts = document.scripts,
                m = scripts.length,
                indx,
                flag = false,
                animation = new Array('bounceIn', 'bounceInLeft', 'bounceInRight',
                                      'bounceInUp', 'fadeIn', 'fadeInLeft',
                                      'fadeInRight', 'fadeInUp', 'zoomIn');
            for (var j = 0; j < m; j++) {
                indx = scripts[j].src.indexOf('viewportchecker.js');
                if (indx > 0) {
                    flag = true;
                    break;
                }
            }
            if (flag) {
                var n = animation.length;
                for (var i = 0; i < n; i++) {
                    var item = $('.ba-'+animation[i]);
                    if (item.closest('.ba-wrapper').hasClass('overlay-section')) {
                        overlayAnimations.push('visible animated '+animation[i])
                    }
                    if (item.closest('.ba-wrapper').hasClass('ba-lightbox')) {
                        lightboxAnimations.push('visible animated '+animation[i])
                    }
                    item.addClass("hidden").viewportChecker({
                        classToAdd: 'visible animated '+animation[i]                        
                    });
                }
            }
        }
        
        function baGoogleMaps()
        {
            $('.ba-grid-map').each(function(){
                var options = $(this).closest('.ba-item-map').find('.ba-map-options').val(),
                    self = this,
                    zoom = true,
                    draggable = true,
                    mapOption = {
                        center: {
                            lat : 42.345573,
                            lng : -71.098326
                        },
                        zoom: 14,
                        mapTypeId : 'roadmap'
                    };
                options = options.split(';');
                if (options[0] != '') {
                    options[0] = options[0].replace(new RegExp('\\n', 'g'),'\\n');
                    options[0] = JSON.parse(options[0]);
                    mapOption.center = {
                        lat : options[0].center.nb*1,
                        lng : options[0].center.ob*1
                    };
                    mapOption.zoom = options[0].zoom;
                    mapOption.mapTypeId = options[0].mapTypeId
                }
                if (options[6] == 0) {
                    zoom = false;
                }
                if (options[7] == 0) {
                    draggable = false;
                }
                if (options[4] == 0) {
                    mapOption.scrollwheel =  zoom;
                    mapOption.navigationControl = false;
                    mapOption.mapTypeControl = false;
                    mapOption.scaleControl = false;
                    mapOption.draggable = draggable;
                    mapOption.zoomControl = false;
                    mapOption.disableDefaultUI = true;
                    mapOption.disableDoubleClickZoom = true;
                } else {
                    mapOption.scrollwheel =  zoom;
                    mapOption.navigationControl = true;
                    mapOption.mapTypeControl = true;
                    mapOption.scaleControl = true;
                    mapOption.draggable = draggable;
                    mapOption.zoomControl = true;
                    mapOption.disableDefaultUI = false;
                    mapOption.disableDoubleClickZoom = false;
                }
                var map = new google.maps.Map(self, mapOption),
                    marker = '';
                if (options[0].marker != '' && options[0].marker) {
                    var mark = options[0].marker;
                    var keys = [];
                    for (var key in mark) {
                        keys.push(key);
                    }
                    marker = new google.maps.Marker({
                        position: {
                            lat : mark[keys[0]],
                            lng : mark[keys[1]]
                        },
                        map: map,
                        icon : options[8]
                    });
                    if (options[0].description != '') {
                        options[0].description = options[0].description.replace(new RegExp("-_-",'g'), ';');
                        options[0].description = options[0].description.replace(new RegExp("---",'g'), '"');
                        var infowindow = new google.maps.InfoWindow({
                            content : options[0].description
                        });
                        if (options[5] == 1) {
                            infowindow.open(map, marker);
                        }
                        marker.addListener('click', function(event){
                            infowindow.open(map, marker);
                        });
                    }
                }
            });
        }
        
        var sliderVideoTimeout;
        
        function sliderVideoAction(prevItem, thisItem)
        {
            var prevSLide = $(prevItem).find('.ba-slide-img'),
                thisSlide = $(thisItem).find('.ba-slide-img');
            if (prevSLide.attr('data-slide-video')) {
                var id = prevSLide.children().attr('id');
                if (sliderVideo[id]) {
                    if (typeof(sliderVideo[id].pauseVideo) == 'function') {
                        clearTimeout(sliderVideoTimeout);
                        sliderVideo[id].pauseVideo();
                    }
                }
            }
            if (thisSlide.attr('data-slide-video')) {
                var id = thisSlide.children().attr('id');
                if (sliderVideo[id]) {
                    if (typeof(sliderVideo[id].pauseVideo) == 'function') {
                        sliderVideo[id].playVideo();
                        sliderVideoTimeout = setTimeout(function(){
                            sliderVideo[id].playVideo();
                        }, 1000);
                    }
                }
            }
        }
        
        function sliderAddStyle(item, options)
        {
            item.find('.ba-slider-caption .slideshow-title-wrapper').css({
                'text-align' : options[9]
            });
            item.find('.ba-slider-caption .ba-slider-title').css({
                'font-weight' : options[11],
                'text-transform' : options[15],
                'font-style' : options[16],
                'color' : options[12],
                'font-size' : options[13]+'px',
                'font-family': options[10].replace('+', ' '),
                'line-height' : options[14]+'px',
                'margin-bottom' : options[45]+'px'
            });
            item.find('.ba-slider-caption .slideshow-description-wrapper').css({
                'text-align' : options[19]
            });
            item.find('.ba-slider-caption .ba-slide-description').css({
                'font-weight' : options[21],
                'text-transform' : options[25],
                'font-style' : options[26],
                'color' : options[22],
                'font-size' : options[23]+'px',
                'font-family': options[20].replace('+', ' '),
                'line-height' : options[24]+'px'
            });
            item.find('.ba-slider-caption .slider-button').css('text-align', options[27]);
            item.find('.ba-slider-caption .slider-button a').css({
                'font-weight' : options[29],
                'background' : options[30],
                'color' : options[31],
                'text-transform' : options[33],
                'font-size' : options[32]+'px',
                'font-style' : options[34],
                'padding' : options[38]+'px '+options[39]+'px',
                'border-radius' : options[35]+'px',
                'font-family': options[28].replace('+', ' '),
                'border' : options[37]+'px solid '+options[36],
                'margin-top' : options[46]+'px'
            });
            item.find('.slider-button a').off('hover');
            item.find('.slider-button a').hover(function(){
                var options = $(this).closest('.ba-item-slider').find('.ba-slider-options').val();
                options = options.split(';');
                $(this).css('color', options[40]);
                $(this).css('background', options[41]);
                $(this).css('border', options[37]+'px solid '+options[42]);
            }, function(){
                var options = $(this).closest('.ba-item-slider').find('.ba-slider-options').val();
                options = options.split(';');
                $(this).css('color', options[31]);
                $(this).css('background', options[30]);
                $(this).css('border', options[37]+'px solid '+options[36]);
            });
        }
        
        function slidesetAddStyle(item, options)
        {
            item.find('.ba-slideset-caption').css({
                'background-color' : options[10]
            });
            item.find('.ba-slideset-caption .ba-slideset-title').css({
                'font-weight' : options[16],
                'text-transform' : options[21],
                'font-style' : options[22],
                'text-align' : options[14],
                'color' : options[17],
                'font-size' : options[18]+'px',
                'font-family': options[15].replace('+', ' '),
                'line-height' : options[19]+'px',
                'margin-bottom' : options[23]+'px',
                'text-decoration' : options[20]
            });
            item.find('.ba-slideset-caption .ba-slideset-description').css({
                'font-weight' : options[26],
                'text-transform' : options[31],
                'font-style' : options[32],
                'text-align' : options[24],
                'color' : options[27],
                'font-size' : options[28]+'px',
                'font-family': options[25].replace('+', ' '),
                'line-height' : options[29]+'px',
                'text-decoration' : options[30]
            });
            item.find('.ba-slideset-caption .slideset-button').css('text-align', options[33]);
            item.find('.ba-slideset-caption .slideset-button a').css({
                'font-weight' : options[35],
                'background' : options[36],
                'color' : options[37],
                'text-transform' : options[40],
                'font-size' : options[38]+'px',
                'font-style' : options[41],
                'padding' : options[48]+'px '+options[49]+'px',
                'border-radius' : options[42]+'px',
                'font-family': options[34].replace('+', ' '),
                'border' : options[44]+'px solid '+options[43],
                'margin-top' : options[50]+'px',
                'text-decoration' : options[39]
            });
            item.find('.slideset-button a').off('hover');
            item.find('.slideset-button a').hover(function(){
                var options = $(this).closest('.ba-item-slideset').find('.ba-slideset-options').val();
                options = options.split(';');
                $(this).css('color', options[45]);
                $(this).css('background', options[46]);
                $(this).css('border', options[44]+'px solid '+options[47]);
            }, function(){
                var options = $(this).closest('.ba-item-slideset').find('.ba-slideset-options').val();
                options = options.split(';');
                $(this).css('color', options[37]);
                $(this).css('background', options[36]);
                $(this).css('border', options[44]+'px solid '+options[43]);
            });
        }
        
        function drawSlideset(item, mode, count, height)
        {
            var width = item.find('.slideset-content').width(),
                liCount = item.find('.slideset-content li').length,
                dotsContainer = item.find('.ba-slideset-dots');
            if (!item.hasClass('slideset-gutter')) {
                width = width / count;
            } else {
                width = (width - ((count - 1) * 30)) / count;
            }
            item.find('.slideset-content .ba-slideset-img').height(height);
            item.find('.slideset-content li.item').width(width);
            if (mode == 'set') {
                liCount = liCount / count;
            }
            dotsContainer.empty();
            for (var i = 0; i < liCount; i++) {
                dotsContainer.append('<div data-ba-slide-to="'+i+'" class="icon-circle active"></div>');
            }
        }

        function initialSlideset(item, count, mode, autoplay, delay, effect)
        {
            item.ba_slideset('delete');
            item.ba_slideset({
                interval: delay*1,
                autoplay: autoplay*1,
                effect: effect,
                mode : mode,
                count : count*1
            });
            var startCoords = {},
                endCoords = {},
                hDistance, vDistance,
                xabs, yabs,
                hSwipMinDistance = 10;
            
            item.on('touchstart', function( event ) {
                endCoords = event.originalEvent.targetTouches[0];
                startCoords.pageX = event.originalEvent.targetTouches[0].pageX;
                startCoords.pageY = event.originalEvent.targetTouches[0].pageY;
            });
            
            item.on('touchmove', function( event ) {
                endCoords = event.originalEvent.targetTouches[0];
            });
            
            item.on('touchend', function( event ) {
                vDistance = endCoords.pageY - startCoords.pageY;
                hDistance = endCoords.pageX - startCoords.pageX;
                xabs = Math.abs(endCoords.pageX - startCoords.pageX);
                yabs = Math.abs(endCoords.pageY - startCoords.pageY);
                if(hDistance >= hSwipMinDistance && xabs >= yabs) {
                    $(this).find('.ba-slideset-nav .slider-btn-prev').trigger('click');
                } else if (hDistance <= -hSwipMinDistance && xabs >= yabs) {
                    $(this).find('.ba-slideset-nav .slider-btn-next').trigger('click');
                }
            });
        }
        
        function recreateSlidesets()
        {
            $('.ba-item-slideset').each(function(){
                var options = $(this).find('.ba-slideset-options').val(),
                    item = $(this).find('.ba-slideset');
                options = options.split(';');
                slidesetAddStyle(item, options);
                drawSlideset(item, options[2], options[0], options[1]);
                initialSlideset(item, options[0], options[2], options[3], options[5], options[8]);
            });
            $(window).on('resize load', function(){
                $('.ba-item-slideset').each(function(){
                    var options = $(this).find('.ba-slideset-options').val(),
                        item = $(this).find('.ba-slideset');
                    options = options.split(';');
                    drawSlideset(item, options[2], options[0], options[1]);
                    if ($(window).width() < 1024) {
                        drawSlideset(item, options[2], 1, options[1]);
                        initialSlideset(item, 1, 'single', options[3], options[5], options[8]);
                    } else {
                        initialSlideset(item, options[0], options[2], options[3], options[5], options[8]);
                    }
                });
            });
        }
        
        function sliderRecreate()
        {
            $('.ba-item-slider').each(function(){
                var options = $(this).find('.ba-slider-options').val();
                options = options.split(';');
                $(this).find('ul.ba-slide .slider-content .item').removeClass('active ba-next ba-prev ba-right ba-left');
                $(this).find('ul.ba-slide .ba-slider-dots .icon-circle').removeClass('active');
                $(this).find('ul.ba-slide .slider-content .item').first().addClass('active');
                $(this).find('ul.ba-slide .ba-slider-dots .icon-circle').first().addClass('active');
                $(this).find('ul.ba-slide').ba_slider('delete');
                $(this).find('ul.ba-slide').ba_slider({
                    interval: options[4],
                    autoplay: options[2],
                    effect: options[5],
                    pause: options[3],
                    navigation : options[50],
                    style : {
                        'font-weight' : options[21],
                        'text-transform' : options[25],
                        'font-style' : options[26],
                        'text-align' : options[19],
                        'color' : options[22],
                        'font-size' : options[23]+'px',
                        'font-family': options[20].replace(new RegExp('\\+','g'), ' '),
                        'line-height' : options[24]+'px',
                        'text-decoration' : options[48]
                    }
                });
                sliderAddStyle($(this), options);
            });
        }
        
        function addSliderEvents()
        {
            var startCoords = {},
                endCoords = {},
                hDistance, vDistance,
                xabs, yabs,
                hSwipMinDistance = 10;
            
            $('.ba-item-slider').on('touchstart', function( event ) {
                endCoords = event.originalEvent.targetTouches[0];
                startCoords.pageX = event.originalEvent.targetTouches[0].pageX;
                startCoords.pageY = event.originalEvent.targetTouches[0].pageY;
            });
            
            $('.ba-item-slider').on('touchmove', function( event ) {
                endCoords = event.originalEvent.targetTouches[0];
            });
            
            $('.ba-item-slider').on('touchend', function( event ) {
                vDistance = endCoords.pageY - startCoords.pageY;
                hDistance = endCoords.pageX - startCoords.pageX;
                xabs = Math.abs(endCoords.pageX - startCoords.pageX);
                yabs = Math.abs(endCoords.pageY - startCoords.pageY);
                if(hDistance >= hSwipMinDistance && xabs >= yabs) {
                    $(this).find('.ba-slider-nav .slider-btn-prev').trigger('click');
                } else if (hDistance <= -hSwipMinDistance && xabs >= yabs) {
                    $(this).find('.ba-slider-nav .slider-btn-next').trigger('click');
                }
            });
        }

        function checkOnePageActive()
        {
            if ($('.ba-item-main-menu .main-menu').attr('data-main-menu') != 'one-page') {
                return;
            }
            var item = ((navigator.userAgent.toLowerCase().indexOf('webkit') != -1) ? 'body' : 'html'),
                top = $(item).scrollTop(),
                items = new Array(),
                flag = false;
            $('.ba-item-main-menu .main-menu ul.nav.menu > li a').each(function(){
                var id = $(this).attr('data-scroll'),
                    item = $('div[data-scroll="'+id+'"]'),
                    value;
                if (id && item.length > 0) {
                    items.push(item);    
                }
            });
            items = items.sort(sortFunction);
            items = items.reverse();
            for (var i = 0; i < items.length; i ++) {
                var id = items[i].attr('data-scroll'),
                    item = $('a[data-scroll="'+id+'"]'),
                    value = items[i].offset().top,
                    alias = item.attr('data-alias'),
                    url = location.href.replace(location.hash, '')+'#'+alias;
                if (items[i].closest('.ba-wrapper').parent().hasClass('header')) {
                    value = 0;
                }
                if (Math.floor(value) <= Math.floor(top) + 1) {
                    flag = true;
                    item.closest('ul').find('.active').removeClass('active');
                    item.parent().addClass('active');
                    if (location.hash != '#'+alias) {
                        window.history.pushState(null, null, url);
                    }                    
                    break;
                }
            }
            if (!flag) {
                $('.ba-item-main-menu .main-menu ul.nav.menu .active').removeClass('active');
                window.history.pushState(null, null, location.href.replace(location.hash, ''));
            }
        }

        function sortFunction(a, b)
        {
            var topA = a.offset().top,
                topB = b.offset().top;
            if (a.closest('.ba-wrapper').parent().hasClass('header')) {
                topA = 0;
            } else if (b.closest('.ba-wrapper').parent().hasClass('header')) {
                topB = 0;
            }
            if(topA < topB) {
                return -1;
            } else if (topA > topB) {
                return 1;
            } else {
                return 0;
            }
        }

        function onePageClick()
        {
            $('.ba-item-main-menu .main-menu ul.nav.menu').on('click', '> li a', function(event){
                var target = $(this).attr('data-scroll'),
                    item = $('div[data-scroll="'+target+'"]'),
                    alias = $(this).attr('data-alias');
                if (target) {
                    event.preventDefault();
                    $(this).closest('ul').find('.active').removeClass('active');
                    $(this).parent().addClass('active');
                    if (item.length > 0) {
                        var value = item.offset().top
                            url = location.href.replace(location.hash,'')+'#'+alias;
                        if ($('header').hasClass('sidebar-menu')) {
                            header = 0;
                        }
                        if (item.closest('.ba-wrapper').parent().hasClass('header')) {
                            value = 0;
                        }
                        onePageScroll = false;
                        window.history.pushState(null, null, url);
                        var body = ((navigator.userAgent.toLowerCase().indexOf('webkit') != -1) ? 'body' : 'html'),
                            top = $(body).scrollTop();
                        if (top != value) {
                            $('html, body').stop().animate({
                                'scrollTop' : value
                            }, 1000, 'easeOutExpo', function(){
                                setTimeout(function(){
                                    onePageScroll = true;
                                }, 200);
                            });
                        }                        
                    }
                }
                   
            })
        }

        var overlayVideo = new Array();

        function initOverlaySection(item)
        {
            var ind = item.attr('data-overlay'),
                overlay =  $('.overlay-section[data-overlay="'+ind+'"]'),
                height = overlay.height(),
                h = overlay.find('> .ba-section > .ba-edit-item').height(),
                top,
                id,
                offset = {
                    top : '',
                    right : '',
                    left : '',
                    bottom : '',
                },
                overlayTimeout,
                overlayBackdrop,
                options = item.parent().find('.ba-overlay-section-options').val().split(';');
            if (overlay.hasClass('vertical-right')) {
                offset.right = -17 - overlay.width()+'px';
            } else if (overlay.hasClass('vertical-left')) {
                offset.left = -17 - overlay.width()+'px';
            } else if (overlay.hasClass('horizontal-top')) {
                offset.top = -overlay.height()+'px';
            } else if (overlay.hasClass('horizontal-bottom')) {
                offset.bottom = -overlay.height()+'px';
            } else if (overlay.hasClass('lightbox')) {
                offset.left = $(window).width() / 2 - overlay.width() / 2 +'px';
                offset.top = $(window).height() / 2 - overlay.height() / 2 +'px';
            }
            overlay.css({
                'right' : offset.right,
                'left' : offset.left,
                'top' : offset.top,
                'bottom' : offset.bottom
            });
            overlay[0].scrollTop = 0;
            if (!overlay.parent().hasClass('overlay-section-backdrop')) {
                overlayBackdrop = document.createElement('div');
                overlayBackdrop.className = 'overlay-section-backdrop close-section-overlay';
                $('.overlay-section[data-overlay="'+ind+'"]').wrap(overlayBackdrop);
            } else {
                overlay.parent().removeClass('hide-backdrop');
            }
            if (overlay.parent().find('> .overlay-substrate').length == 0) {
                overlay.parent().append('<div class="overlay-substrate close-section-overlay"></div>');
            }
            overlay.parent().find('.overlay-substrate').css('background-color', options[25]);
            overlay.find('i.close-section-overlay').css('color', options[27]);
            overlay.find('.visible.animated').each(function(){
                var $this = $(this);
                overlayAnimations.forEach(function(el){
                    $this.removeClass(el)
                });
            });
            overlay.find('.ba-item iframe').each(function(){
                var $this = $(this),
                    src = $this.attr('src');
                if (src && src.indexOf('www.youtube.com') !== -1) {
                    if (src.indexOf('enablejsapi=1') === -1) {
                        if (src.indexOf('?') === -1) {
                            src += '?';
                        } else {
                            src += '&'
                        }
                        src += 'enablejsapi=1';
                        $this.attr('src', src);
                    }
                    if (!$this.attr('id')) {
                        $this.attr('id', getRandomInt(1, 9999999));
                    }
                    id = $this.attr('id');
                    if (!overlayVideo[id]) {
                        overlayVideo[id] = new YT.Player(id, {
                            events: {
                                onReady: function(event){
                                    if ($('#'+id).closest('.overlay-section').hasClass('visible-section')) {
                                        overlayVideo[id].playVideo();
                                    }                                
                                }
                            }
                        });
                    } else {
                        overlayVideo[id].playVideo();
                    }
                }
            });
            overlayTimeout = setTimeout(function(){
                overlay.addClass('visible-section');
                overlay.parent().css('position', 'fixed');
                $('body').addClass('body-no-scroll');
                height = overlay.height();
                h = overlay.find('> .ba-section > .ba-edit-item').height();
                top = overlay[0].scrollTop + height - h - 1;
                overlay.find('> .ba-section > .ba-overlay').css({
                    'top' : 0
                });
                baGoogleMaps();
                setTimeout(function(){
                    $(window).trigger('scroll');
                }, 300);
            }, 100);
            $('.close-section-overlay').on('click', function(event){
                if ($(event.target).hasClass('close-section-overlay')) {
                    event.stopPropagation();
                    clearTimeout(overlayTimeout);
                    overlay.find('> .ba-section')[0].scrollTop = 0;
                    overlay.removeClass('visible-section');
                    setTimeout(function(){
                        overlay.parent().css('position', 'relative');
                        $('body').removeClass('body-no-scroll');
                    }, 500);
                    overlay.closest('.overlay-section-backdrop').addClass('hide-backdrop');
                    overlay.find('.close-section-overlay').off('click');
                    overlay.find('> .ba-section').off('scroll.overlay');
                    overlay.off('scroll.overlay mousemove');
                    if (overlayVideo[id]) {
                        overlayVideo[id].pauseVideo();
                    }
                    return false;
                }
            });
            height = overlay.height();
            h = overlay.find('> .ba-section > .ba-edit-item').height();
            top = overlay[0].scrollTop + height - h - 1;
            overlay.find('> .ba-section > .ba-edit-item').css({
                'position' : 'fixed',
                'top' : top
            });
            if (overlay.hasClass('vertical')) {
                overlay.on('scroll.overlay', function(){
                    overlay.find('> .ba-section > .ba-overlay').css({
                        'top' : overlay.find('> .ba-section')[0].scrollTop
                    });
                });
            } else {
                overlay.find('> .ba-section').on('scroll.overlay', function(){
                    overlay.find('> .ba-section > .ba-overlay').css({
                        'top' : this.scrollTop
                    });
                });
            }            
        }

        function overlaySectionHover(item)
        {
            item.off('hover');
            item.hover(function(){
                var options = $(this).closest('.ba-item-overlay-section').find('.ba-overlay-section-options').val();
                options = options.split(';');
                $(this).css({
                    'color' : options[7],
                    'background-color' : options[14],
                    'border' : options[11]+'px solid '+options[15],
                });
            },function(){
                var options = $(this).closest('.ba-item-overlay-section').find('.ba-overlay-section-options').val();
                options = options.split(';');
                $(this).css({
                    'color' : options[4],
                    'background-color' : options[8],
                    'border' : options[11]+'px solid '+options[9]
                });
            });
        }
        
        addPageStyle();
        iconsSetHover();
        initDisqus();
        initSocials();
        setHoverButton();
        initialImageLightbox();
        onePageClick();
        if (typeof(google) != 'undefined') {
            baGoogleMaps();
        }
        
        if (typeof($.fn.ba_slideset) == 'function') {
            recreateSlidesets();
        }

        if (typeof($.fn.ba_counter) == 'function') {
            $('.ba-item-counter').each(function(){
                initCounter($(this));
            });
        }

        if (typeof($.fn.ba_weather) == 'function') {
            $('.ba-item-weather').each(function(){
                initWeather($(this));
            });
        }
        
        if (typeof($.fn.ba_slider) == 'function') {
            sliderRecreate();
            addSliderEvents();
            $('.ba-slide').on('slide', function(event){
                sliderVideoAction(event.prevItem, event.currentItem)
            });
        }
        
        checkAnimation();

        $('.ba-item-blog').each(function(){
            addPostsStyle($(this));
        });

        $('.ba-item-tag-cloud').each(function(){
            addTagCloudStyle($(this));
        });

        $('.ba-item-category-list').each(function(){
            addCategoryListStyle($(this));
        })
        
        $(window).on('resize load', function(){
            $('.ba-item-tabs .responsive-nav').remove();
            $('.ba-item-tabs').each(function(){
                var winsize = $(window).width();
                if (winsize <= 768) {
                    var select = '<select class="responsive-nav">';
                    $(this).find('ul.nav-tabs li a').each(function(){
                        select += '<option ';
                        if ($(this).closest('li').hasClass('active')) {
                            select += 'selected ';
                        }
                        select += 'value="'+$(this).attr('href');
                        select += '">'+$(this).text()+'</option>';
                    });
                    select += '</select>';
                    $(this).find('ul.nav-tabs').after(select);
                    $(this).find('.responsive-nav').on('change', function(){
                        var id = $(this).val(),
                            tabsParent = $(this).closest('.ba-item-tabs');
                        tabsParent.find('li a[href="'+id+'"]').trigger('click')
                    });
                }
            });
        });

        $(window).on('scroll', function(){
            if (onePageScroll) {
                checkOnePageActive();
            }
        });

        $(window).on('load', function(){
            var hash = location.hash,
                alias = hash.replace('#', '');
            alias = decodeURIComponent(alias);
            if (!alias) {
                checkOnePageActive();
            } else {
                $('a[data-alias="'+alias+'"]').trigger('click');
            }            
        });

        $('.ba-item-overlay-section > a').each(function(){
            $(this).off('click');
            $(this).on('click', function(event){
                event.preventDefault();
                initOverlaySection($(this));
            });
            overlaySectionHover($(this));
        });
        
        // Responsive Menu
        
        $('.open-menu').click(function() {
            $('.main-menu').addClass('visible-menu').removeClass('hide-menu');
        });
        $('.close-menu').click(function() {
            $('.main-menu').addClass('hide-menu').removeClass('visible-menu');            
        });

        $('.sidebar-menu .main-menu li.deeper.parent').on('mouseenter', function(){
            var coord = this.getBoundingClientRect();
            $(this).find('> .nav-child').css({
                'top' : coord.top * 1 -1 +'px',
                'left' : coord.right * 1 -1 +'px'
            });
        });

        //Default Joomla
        
        $('*[rel=tooltip]').tooltip()
        // Turn radios into btn-group
        $('.radio.btn-group label').addClass('btn');
        $(".btn-group label:not(.active)").click(function(){
            var label = $(this);
            var input = $('#' + label.attr('for'));
            if (!input.prop('checked')) {
                label.closest('.btn-group').find("label").removeClass('active btn-success btn-danger btn-primary');
                if (input.val() == '') {
                    label.addClass('active btn-primary');
                } else if (input.val() == 0) {
                    label.addClass('active btn-danger');
                } else {
                    label.addClass('active btn-success');
                }
                input.prop('checked', true);
            }
        });
        $(".btn-group input[checked=checked]").each(function(){
            if ($(this).val() == '') {
                $("label[for=" + $(this).attr('id') + "]").addClass('active btn-primary');
            } else if ($(this).val() == 0) {
                $("label[for=" + $(this).attr('id') + "]").addClass('active btn-danger');
            } else {
                $("label[for=" + $(this).attr('id') + "]").addClass('active btn-success');
            }
        });
    });
})(jQuery);