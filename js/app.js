var favorites;
var autoFirstClick = false;

$(document).ready(function() {
    var sideslider = $('[data-toggle=collapse-side]');
    var sel = sideslider.attr('data-target');
    var sel2 = sideslider.attr('data-target-2');
    sideslider.click(function(event) {
        $(sel).toggleClass('in');
        $(sel2).toggleClass('out');
    });

    $('.tab-menu-switcher').click(function() {
        $('.navbar-inverse .side-collapse').removeClass('out');
        $('.navbar-inverse .side-collapse').addClass('in');
        nav_open = false;
        $('html').removeClass('js-nav');

        $('.tab-content').hide();
        var tabToken = $(this).attr('data-tab-token');

        if (tabToken == 'home') {
            $('.flechasA').fadeIn('fast');
            if (!autoFirstClick) {
                showFirstTale();
            } else {
                autoFirstClick = false;
            }
        } else {
            $('.flechasA').fadeOut('fast');

            if (tabToken == 'calendario') {
                $('.flechasB').fadeIn('fast');
            } else {
                $('.flechasB').fadeOut('fast');
            }
        }

        $('#tab-' + tabToken).show();
        hideSearchTab();
        enableScroll();

        _pushState('/disney-365/' + tabToken);

        setTimeout(function() {
            $(window).resize();
        }, 300);

        return false;
    });

    /* Search */
    $('#searchForm').submit(function() {
        preValidateSearch();
        return false;
    });
    // Show icon
    $('#search-term').focusin(function() {
        $(this).val('');
        $(this).css({'color': '#002325', 'font-size': '20px'});
        $('#search-input-icon').show();
    });
    // restore search input
    $('#search-term').focusout(function() {
        $(this).css({'color': '#002325', 'font-size': '20px'});
        setTimeout(function() { $('#search-input-icon').hide(); }, 1);
    });
    $('#search-input-icon').click(function() {
        preValidateSearch();
        return false;
    });
    /* end Search */

    $('.ir-arriba').click(function() {
        $('body, html').animate({scrollTop : '0px'}, 300);
    });

    $('.flechasA').click(function() {
        $('html, body').animate({scrollTop : '0px'});
    });

    $('#carousel-example-generic, #carousel-calendar').on('slid.bs.carousel', function(e) {
        $(window).resize();
    });

    $(window).scroll(function() {
        if ($(this).scrollTop() > 100) {
            $('.ir-arriba').slideDown(300);
        } else {
            $('.ir-arriba').slideUp(300);
        }

        var scroll = $(window).scrollTop();
        var altoDescarga = $('.descarga').offset().top;
        if (scroll > (altoDescarga - 500)) {
            $('.flechasA').removeClass('posiFija');
        } else {
            $('.flechasA').addClass('posiFija');
        }
    });

    // Back to top button
    $(window).on('scroll', function() {
        showBackToTop();
    });
    $('#back-to-top').on('click', function(e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop : 0
        }, 700);
    });
});

_pushState = function(href) {
    history.pushState({}, '', href);
    if (ga != undefined) {
        ga('send', 'pageview');
    }
}

var displayStory = function(storyIndex) {
    $('.home .carousel-inner .item').removeClass('active');
    $('.home .carousel-inner .item:nth-child(' + storyIndex + ')').addClass('active');
};

var displayStoryExternal = function(storyIndex) {
    $('li[data-tab-token=home]').click();
    $('.flechasB').hide();
    displayStory(parseInt(storyIndex));
};

var saveFavoriteArticle = function(articleId) {
    var element = $('span[data-favorite-article=' + articleId + ']');
    if (element) {
        if (element.data('favorite-flag') == 0) {
            $.post('/disney-365/api/saveFavoriteArticle', {
                articleId: articleId
            }, function(response) {
                toogleFavorites([ articleId ]);
            });
        } else {
            $.ajax({
                url: '/disney-365/api/deleteFavoriteArticle',
                type: 'DELETE',
                data: {articleId : articleId},
                success: function(result) {
                    toogleFavorites([articleId]);
                }
            });
        }
    }
}

var updateFavorites = function() {
    $.post('/disney-365/api/findFavoritesArticles', function(response) {
        toogleFavorites(response);
        favorites = response;
    });
}

var toogleFavorites = function(articleIds) {
    if (articleIds) {
        for (var i = 0; i < articleIds.length; i++) {
            var element = $('span[data-favorite-article=' + articleIds[i] + ']');
            if (element) {
                if (element.data('favorite-flag') == 0) {
                    $('span[data-favorite-article=' + articleIds[i] + '] i').addClass('favorite-article-active');
                    element.data('favorite-flag', 1);
                } else {
                    $('span[data-favorite-article=' + articleIds[i] + '] i').removeClass('favorite-article-active');
                    element.data('favorite-flag', 0);
                }
            }
            var element = $('div[data-favorite-article=' + articleIds[i] + ']');
            if (element) {
                element.toggle();
            }
            element = $('.favorite-mark-' + articleIds[i]);
            if (element) {
                element.toggle();
            }
        }
    }

    if ($('#favorites-container').children(':visible').length == 0) {
        $('#favorites-not-found').show();
    } else {
        $('#favorites-not-found').hide();
    }
}

var runSearchByText = function() {
    var searchTerm = $('#search-term').val();

    $.get('/disney-365/api/search', {searchTerm: searchTerm}, function(data) {
        $('#search-term').blur();
        $('#article-entry').remove();
        $('.tab-content').hide();

        $('#page-content').append('<div id="article-entry">' + data.content + '</div>');

        var resultMinHeight = $(window).height();
        $('#searchResults').css('min-height', resultMinHeight + 'px');

        window.scrollTo(0, 0);
        $('.flechasA').hide();
        $('.flechasB').hide();
        _pushState('/disney-365/search');
    }).fail(function(error) {
        $('#search-term').css({'color': 'red','font-size': '0.9em'});
        $('#search-term').val('La búsqueda no está disponible.');
    });
}

var runSearchByTag = function() {
    var searchTerm = $('#search-term').val();

    $.get('/disney-365/api/searchTag', {searchTerm: searchTerm}, function(data) {
        $('#search-term').blur();
        $('#article-entry').remove();
        $('.tab-content').hide();

        $('#page-content').append('<div id="article-entry">' + data.content + '</div>');

        var resultMinHeight = $(window).height();
        $('#searchResults').css('min-height', resultMinHeight + 'px');

        window.scrollTo(0, 0);
        $('.flechasA').hide();
        $('.flechasB').hide();
        _pushState('/disney-365/search');
    }).fail(function(error) {
        $('#search-term').css({
            'color': 'red',
            'font-size': '0.9em'
        });
        $('#search-term').val('La búsqueda no está disponible.');
    });
}

var hideSearchTab = function() {
    $('#article-entry').remove();
}

var toggleShareButtons = function(articleId) {
    $('span[data-share-article="' + articleId + '"] i').toggleClass('bookmark-activo');
    $('#share-buttons-' + articleId).toggle();
}

var enableScroll = function() {
    $('html, body').css({
        overflow: 'auto',
        height: 'auto'
    });
}

var disableScroll = function() {
    $('html, body').css({
        overflow: 'hidden',
        height: '100%'
    });
}

var showBackToTop = function() {
    var scrollTrigger = 100; // px
    var scrollTop = $(window).scrollTop();
    if (scrollTop > scrollTrigger) {
        $('#back-to-top').addClass('show');
    } else {
        $('#back-to-top').removeClass('show');
    }
};
