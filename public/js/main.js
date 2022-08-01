
 
(function ($) {
    "use strict";

    $(window).on('load', function(){
        //===== Prealoder
        $("#preloader").delay(1800).fadeOut("slow");

    });

    $(document).ready(function () {

        //03. Smooth Scroll Initialize
        // function smoothScroolInit() {
        //     $('a').smoothScroll({
        //         speed: 1000
        //     });
        // }
        // smoothScroolInit();

        //05. sticky header
        function sticky_header(){
            var wind = $(window);
            var sticky = $('header');
            wind.on('scroll', function () {
                var scroll = wind.scrollTop();
                if (scroll < 20) {
                    sticky.removeClass('sticky');
                } else {
                    sticky.addClass('sticky');
                }
            });
        }
        sticky_header();
        //===== Back to top

        // Show or hide the sticky footer button
        $(window).on('scroll', function (event) {
            if ($(this).scrollTop() > 600) {
                $('.back-to-top').fadeIn(200);
            } else {
                $('.back-to-top').fadeOut(200);
            }
        });

        //Animate the scroll to yop
        $('.back-to-top').on('click', function (event) {
            event.preventDefault();

            $('html, body').animate({
                scrollTop: 0,
            }, 1500);
        });

        
        // Hamburger-menu
        $('.mini-search-icon-default, .mini-search-icon').on('click', function () {
            $('.main-search-box').toggleClass('d-inline-flex');
        });

        // Hamburger-menu
        // $('.hamburger-menu, #menu li a').on('click', function () {
        //     $('.hamburger-menu .line-top').toggleClass('current');
        //     $('.hamburger-menu .line-center').toggleClass('current');
        //     $('.hamburger-menu .line-bottom').toggleClass('current');
        //     $('.ofcavas-menu').toggleClass('current');
        // });

         



        $('.tab-link').on('click',function (e) {
            e.preventDefault();
            var tab_id = $(this).attr('href');

            // $('.tab li a').removeClass('current');
            $('.contact-sub').removeClass('current');

            // $(this).addClass('current');
            $(tab_id).addClass('current');
        });

    });

})(jQuery);