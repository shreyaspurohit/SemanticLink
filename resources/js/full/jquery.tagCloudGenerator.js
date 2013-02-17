(function( $ ) {
  var methods={
	  normalize: function(data){
		var maxStrength = Math.max.apply(null, data.map(function(item){return item.tagStrength;}));
		//Normalize
		var normalizedData = data.map(function(item){
			item.tagStrength = item.tagStrength/maxStrength;
			return item;
		});
		return normalizedData;
	  },
	  stepsPerLevel: function(config){
		  return 1/config.numberOfLevel;
	  },
	  calculatefontSizePerc: function(item, stepsPerLevel, config){
		  var bucket=item.tagStrength/stepsPerLevel;
		  var fontSizePer=config.baseFontSizePerc + config.perLevelFontDiffPerc * bucket;
		  return fontSizePer;
	  }
  };
  
  $.fn.generateTagCloud = function(data, options) {
	  if(data){
		  if(typeof data === 'string'){
			  data=$.parseJSON(data);
		  }
		  var config = $.extend({
					numberOfLevel: 5,
					perLevelFontDiffPerc: 20,
					baseFontSizePerc:100
				}, options);
		  this.append('<ul id="tagCloudUl"></ul>');
		  var stepsPerLevel = methods.stepsPerLevel(config);
		  methods.normalize(data).forEach(function(item){		
			var fontSizePer=methods.calculatefontSizePerc(item, stepsPerLevel, config);
			if(undefined !== item.tagUrl)
				$('#tagCloudUl').append($('<li style="font-size:'+ fontSizePer +'%;"><a href="'+item.tagUrl+'">'+ item.tagName+'</a></li>'));
			else
				$('#tagCloudUl').append($('<li style="font-size:'+ fontSizePer +'%;"> <label>' + item.tagName+' </label></li>'));
		  });
	  }
  };
})( jQuery );
