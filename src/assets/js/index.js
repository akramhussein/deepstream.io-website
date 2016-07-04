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
function searchAutocomplete() {
    $(".main-search").autocomplete({
        appendTo: '.main-serach-results',
        source: "/search",
        minLength: 3,
        focus: function( event, ui ) {
            return false;
        },
        select: function( event, ui ) {
            window.location = '/' + ui.item.slug;
            return false;
        }
    }).autocomplete( "instance" )._renderItem = function( ul, item ) {
      const otherOccurrences = item.occurrences.length > 2 ? ' other occurrences' : ' other occurrence'
      return $( "<li>" )
        .append( "<a target='_blank' href='/" + item.slug + "' title='" + item.slug + "'>" +
            '<strong>' + item.title + "</strong><br>" + '<em>' + (item.occurrences[0] || '') + '</em>' +
            ((item.occurrences.length > 1) ? (' and ' + (item.occurrences.length - 1) + otherOccurrences) : '')
            + "</a>"
        )
        .appendTo( ul );
    };
    $("input.main-search").on('focus', function() {
        $("ul.ui-autocomplete").show()
    })
}

$(function(){
    if ( $( '.docs .col' ).length === 0 ) {
        return;
    }
    // var history = window.History.createHistory();
    var adjustSize = function() {
        $( '.docs .col.big.right' ).width( $(window).width() -  ( $('.docs .col.left').width() + 2 ) );
        $( '.docs .col' ).height( $(window).height() - $( 'nav' ).height() );
    };

    adjustSize();
    $(window).resize( adjustSize );

    $( '.sub-section-toggle' ).click(function(){
        $(this).parent().toggleClass( 'open' );
    });

    $( '.tree-nav .entry a' ).click(function( e ){
        e.preventDefault();
        var pathname = $(this).attr( 'href' );
        // history.push( {pathname: pathname} );
        changeEntryPage( {
            pathname: pathname
        })
    });
    //history.listen( changeEntryPage );

    function changeEntryPage( location ) {
        var pathname = location.pathname;
        var link = $( '[href="' + pathname + '"]' )
        $( '.entry .active' ).removeClass( 'active' );

        link.parent().addClass( 'active' );

        $( '.col.right .header h1' ).text( link.text() );
        $.get( pathname, function( result ){

            var content = $( result ).find( '.col.big.right .content' ).html();
            //TODO Error handling
            $( '.col.big.right .content' ).html( content );

            $('.content pre code').each(function(i, block) {
                    hljs.highlightBlock(block);
            });
        });
    };
});