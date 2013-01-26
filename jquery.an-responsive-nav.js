;(function ($) {
    $.fn.anResponsiveNav = function (options) {
        var settings = $.extend({
                'breakpoint':'800',
                'animationSpeed':'fast',
                'bigScreenClass':'tabletLandscape-desktop',
                'smallScreenClass':'tabletPortrait-phone',
                'cssShow':{
                    'opacity': 1
                },
                'cssHidden':{
                    'height': '0px',
                    'opacity':0
                }
            }, options);

		var test;
		var test123;
		var test1234;
        var $this = jQuery(this);
        var $thisUl = jQuery(this).children('ul');
        var $thisFirstLevelLi = $thisUl.children('li').addClass('first-level');
  		var $allSubNavToggles;
		var $allSubNavs;
        var subNavWidth = 0;
        var classesSet = false;
		var mainNavToggle = jQuery('#main-nav-toggle');
		var triggerEvent = 'click';
		if(Modernizr.touch){
			triggerEvent = 'touchstart';
			delete settings.cssHidden.opacity;
			delete settings.cssShow.opacity;
		}

		var reset = function(){
			$allSubNavToggles.removeClass('active');
			$allSubNavs.css(settings.cssHidden).removeClass('visible right-aligned').addClass('hidden');
		};

        var resizer = function () {
            if (jQuery(window).width() < settings.breakpoint || Modernizr.touch) {
                jQuery('body').removeClass(settings.bigScreenClass).addClass(settings.smallScreenClass);
				$this.css('width', $this.parent().width());
                subNavWidth = 0;
            } else {
                jQuery('body').removeClass(settings.smallScreenClass).addClass(settings.bigScreenClass);
				$this.removeAttr('style');
				$this.find('ul').removeAttr('style');
                calcSubItemWidth();
                setOffsetToSubmenus();
            }
			reset();
        };

        var calcSubMenuHeight = function ($submenuObject) {
            var $link = $submenuObject.children('li').children('a');
            var linkCount = $link.length;
			/*TODO: cache ItemHeight if we can ensure they are all equal*/
            var itemHeight = parseFloat($link.css('height')) + parseFloat($link.css('padding-top')) + parseFloat($link.css('padding-bottom'));
            var liMargin = parseFloat($submenuObject.children('li').css('margin-bottom'));
            return (linkCount * itemHeight) + ((linkCount - 1) * liMargin);
        };

        var calcAllSubMenuHeights = function () {
            var allHeight = $thisFirstLevelLi;
            $this.find('ul.visible').each(function () {
                var $links = jQuery(this).children('li');
                var $link = $links.first().children('a');
                var linkCount = $links.length;
                if (jQuery(this).find('.sub-menu.visible').children('li').length) {
                    linkCount += jQuery(this).find('.sub-menu.visible').children('li').length;
                }
                /*TODO: use function above 'calcSubMenuHeight'*/
				/*TODO: cache ItemHeight if we can ensure they are all equal*/
                var itemHeight = parseFloat($link.css('height')) + parseFloat($link.css('padding-top')) + parseFloat($link.css('padding-bottom'));
                var liMargin = parseFloat(jQuery(this).children('li').css('margin-bottom'));
                var calcHeight = (linkCount * itemHeight) + ((linkCount - 1) * liMargin);
                jQuery(this).css('height', calcHeight + 'px');
                allHeight += calcHeight;
            });
            $thisUl.find('.sub-menu.hidden').each(function () {
                jQuery(this).css('height', '0px');
                jQuery(this).find('ul').css('height', '0px');
            });
            //$thisUl.css('height', allHeight + 'px');
        };

        var generateClasses = function (i) {
            var $li = jQuery(this);
            var $ul = $li.children('ul');
            if ($ul.length) {
                $li.addClass('has-children');
                $ul.addClass('sub-menu');
                $ul.find('li').each(generateClasses);
            }
        };

        var setOffsetToSubmenus = function () {
            $thisFirstLevelLi.filter('.has-children').each(function () {
                var offVal = (jQuery(this).offset().left + subNavWidth) - jQuery(window).width();
                if (offVal > 0) {
                    offVal = offVal * -1;
                    jQuery(this).children('.sub-menu').css('left', offVal + 'px');
                } else{
                    jQuery(this).children('.sub-menu').css('left', '0px');
                }
            });
        };

        var calcSubItemWidth = function(){
            if(subNavWidth == 0){
                var $clone = $thisFirstLevelLi.first().clone().css({
                    position:'absolute',
                    right:'3000%'
                });
                var $pseudoli = jQuery('<div></div>').addClass('sub-menu').css('height', '300px').appendTo($clone);
                $clone.appendTo($this);
                subNavWidth = $pseudoli.width();
                $clone.empty().remove();
            }
        };

        var init = function () {
            calcSubItemWidth();
            if(classesSet === false){
                $thisFirstLevelLi.each(generateClasses);
                $this.find('.has-children').append(jQuery('<span></span>', {class:'submenu-toggle'}));
				$allSubNavToggles = $this.find('.submenu-toggle');
				$allSubNavs = $this.find('.sub-menu');
                classesSet = true;
            }
        };

        init();

        jQuery(window).on('load', function(){
            resizer();
        });

		// Toggle for mainNav
		mainNavToggle.on(triggerEvent, function (e) {
			reset();
			calcAllSubMenuHeights();
			$this.css('width', $this.parent().width());
			if(!$thisUl.hasClass('visible')){
				var tHeight = calcSubMenuHeight($thisUl);
				$thisUl.css('height', tHeight + 'px').addClass('visible');
			} else{
				$thisUl.css('height', '0px').removeClass('visible');
			}
		});

        // Toggle for nav menu
        $this.find('.submenu-toggle').on(triggerEvent, function (e) {
            var $that = jQuery(this);
            var $submenu = $that.prev('.sub-menu');
            if ($that.hasClass('active')) {
                $submenu.css(settings.cssHidden).removeClass('visible').addClass('hidden');
                $submenu.find('.sub-menu').css(settings.cssHidden).removeClass('visible').addClass('hidden');
                if (jQuery('body').hasClass(settings.bigScreenClass)) {
                    $submenu.css('overflow', 'hidden');
                    $submenu.css('height', '0px');
                    $submenu.find('.sub-menu').css('overflow', 'hidden');
                }
                if (jQuery('body').hasClass(settings.smallScreenClass)) {
                    calcAllSubMenuHeights();
                }
                $submenu.find('.submenu-toggle').removeClass('active');
                $that.removeClass('active');
            } else {
                $submenu.css(settings.cssShow).removeClass('hidden').addClass('visible');
                if (($submenu.offset().left + subNavWidth) >= jQuery(window).width()) {
                    $submenu.addClass('right-aligned');
                }
                if (jQuery('body').hasClass(settings.bigScreenClass)) {
                    $submenu.css('height', calcSubMenuHeight($that.prev('.sub-menu')));
                    window.setTimeout(function () {
                        $submenu.css('overflow', 'visible');
                    }, 300);
                } else if (jQuery('body').hasClass(settings.smallScreenClass)) {
                    calcAllSubMenuHeights();
                }
                $that.addClass('active');
            }
			e.preventDefault();
			return false;
        });

        $this.find('.has-children').hoverIntent({
            over:hoverAction,
            timeout:0,
            out:hoverAction
        });

        function hoverAction() {
            var $that = jQuery(this);
            if (!Modernizr.touch && jQuery('body').hasClass(settings.bigScreenClass)) {
                $that.children('.submenu-toggle').trigger(triggerEvent);
            }
        }

        // Call on resize.
        jQuery(window).on('debouncedresize', resizer);

    };

})(jQuery);
