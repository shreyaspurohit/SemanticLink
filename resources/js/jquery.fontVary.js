(function($) {
    $.fn.textFontAdjust = function(subElem, options) {
	var config = $.extend({
		 maxFontPerc : 100,
		 minFontPerc : 25,
		 additionalWidthToDecrease: 0
	},options);
        var fontSizePerc = config.maxFontPerc,
        	textElem = $(subElem),
        	maxHeight = $(this).height(),
         	maxWidth = $(this).width()-config.additionalWidthToDecrease;
        var textHeight, textWidth;
        do {	    
            textElem.css('font-size', fontSizePerc + '%');
            fontSizePerc = fontSizePerc - 1;
        } while ((textElem.height() > maxHeight || textElem.width() > maxWidth) && fontSizePerc > config.minFontPerc);
        return this;
    }
})(jQuery);
