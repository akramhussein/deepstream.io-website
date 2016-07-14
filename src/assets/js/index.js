/**
 * Main JS file for Casper behaviours
 */

/* globals jQuery, document */
(function ($, undefined) {
    "use strict";

    var $document = $(document);

    $document.ready(function () {

        var $postContent = $(".post-content");
        $postContent.fitVids();

        $(".scroll-down").arctic_scroll();

        $(".menu-button, .nav-cover, .nav-close").on("click", function(e){
            e.preventDefault();
            $("body").toggleClass("nav-opened nav-closed");
        });

    });

    // Arctic Scroll by Paul Adam Davis
    // https://github.com/PaulAdamDavis/Arctic-Scroll
    $.fn.arctic_scroll = function (options) {

        var defaults = {
            elem: $(this),
            speed: 500
        },

        allOptions = $.extend(defaults, options);

        allOptions.elem.click(function (event) {
            event.preventDefault();
            var $this = $(this),
                $htmlBody = $('html, body'),
                offset = ($this.attr('data-offset')) ? $this.attr('data-offset') : false,
                position = ($this.attr('data-position')) ? $this.attr('data-position') : false,
                toMove;

            if (offset) {
                toMove = parseInt(offset);
                $htmlBody.stop(true, false).animate({scrollTop: ($(this.hash).offset().top + toMove) }, allOptions.speed);
            } else if (position) {
                toMove = parseInt(position);
                $htmlBody.stop(true, false).animate({scrollTop: toMove }, allOptions.speed);
            } else {
                $htmlBody.stop(true, false).animate({scrollTop: ($(this.hash).offset().top) }, allOptions.speed);
            }
        });

    };

    searchAutocomplete();

})(jQuery);


// for docs pages
var SEARCH_BASE = 'https://search-deepstream-website-fozmccbxnnchstaflr5wmac3l4.eu-central-1.es.amazonaws.com';
function searchAutocomplete() {
    $('.main-search').autocomplete({
        appendTo: '.main-serach-results',
        source: function(request, response) {
            const requestData = {
              query: {
                bool: {
                  should: [
                    {
                      match: {
                        title: {
                          query: request.term,
                          boost: 1000
                        }
                      }
                    },
                    {
                      match: {
                        content: request.term
                      }
                    }
                  ]
                }
              }
            };
            $.ajax({
              url: SEARCH_BASE + '/pages/_search',
              data: requestData,
              crossDomain: true,
              dataType: 'json',
              success: function(data, status) {
                if (status === 'success') {
                    console.log(data)
                    var hits = data.hits.hits;
                    return response(hits.map(function(item) {
                        return {
                            title: item._source.title,
                            link: item._source.filePath.replace('readme.md', ''),
                            type: item._type
                        }
                    }));
                }
                return response([]);
              }
            })
        },
        minLength: 3,
        focus: function(event, ui) {
            return false;
        },
        select: function(event, ui) {
            window.location = '/' + ui.item.slug;
            return false;
        }
    }).autocomplete('instance')._renderItem = function(ul, item) {
      return $('<li>')
        .append("<a href='/" + item.link + "'><br>" + item.title + "</a>")
        .appendTo(ul);
    };
    $('input.main-search').on('focus', function() {
        $('ul.ui-autocomplete').show()
    })
}

$(function(){
    if ( $( '.docs .col' ).length === 0 ) {
        return;
    }

    var history = window.History.createHistory();
    var adjustSize = function() {
        var windowWidth = $(window).width();
        if( windowWidth > 999 ) {
            $( '.docs' ).addClass( 'two-col' );
            $( '.docs .col.left.small' ).toggle( true );
            $( '.docs .col.big.right' ).width( windowWidth -  ( $('.docs .col.left').width() + 2 ) );
        } else {
            $( '.docs' ).removeClass( 'two-col' );
            $( '.docs .col.left.small' ).toggle( false );
            $( '.docs .col.big.right' ).width( windowWidth );
        }
        // $( '.docs .col' ).height( $(window).height() - $( 'nav' ).height() );
    };

    adjustSize();
    $(window).resize( adjustSize );

    $( '.sub-section-toggle' ).click(function(){
        $(this).parent().toggleClass( 'open' );
    });

    function getBaseName(basename) {
        return basename.split( '/' ).filter( function( item ) {
            return item !== '';
        } ).reverse()[ 0 ];
    }

    function getDirname(basename) {
        var array = basename.split( '/' );
        array.pop();
        return array.join('/') + '/'
    }

    $( '.tree-nav .entry a' ).click(function( e ){
        e.preventDefault();
        var pathname = $(this).attr( 'href' );
        var basename = getBaseName( pathname );
        history.push( {
            pathname: pathname,
            state: {
                realPathname: pathname + basename + '.html',
            }
        } );
    });

    var unlisten = history.listen(function(location) {
        var pathname = (location.state || {}).realPathname
        if (pathname == null) {
            // the first page visit didn't set the state
            // so recover the ajax page from its basename
            pathname = location.pathname + getBaseName(location.pathname) + '.html'
        }
        changeEntryPage( {
            pathname: pathname
        } );
    })

    function changeEntryPage( location ) {
        var dirname = getDirname(location.pathname);
        var link = $( '[href="' + dirname + '"]' )
        $( '.entry .active' ).removeClass( 'active' );

        link.parent().addClass( 'active' );

        // ensure that the subsection is open when navigating via browser history
        link.parents('.sub-section-container').addClass('open')

        $( '.col.right .header h1' ).text( link.text() );
        $.get( location.pathname, function( result ){

            //TODO Error handling
            $( '.breadcrumbs span:last-child' ).text( link.text() );
            $( '.col.big.right .content' ).html( result );

            $('.content pre code').each(function(i, block) {
                Prism.highlightElement( block );
            });
        });
    };
});

$(function(){
    $('a.install-link').each(function(){
        var url = 'https' + '://api.github.com/repos/deepstreamio/deepstream.io/releases/latest';
        var anchor = $(this);

         $.getJSON( url, function( data ){
            var i, asset = data.assets.filter(function( asset ){
                return asset.name.toLowerCase().indexOf( anchor.data( 'os' ) ) !== -1;
            })[ 0 ];

            anchor
                .text( 'download ' + asset.name )
                .attr( 'href', asset.browser_download_url );
        });
    });
});

$(function(){
    setTimeout(function(){
        $('.deepstream-star').removeClass('start');
    }, 16000 );
});
