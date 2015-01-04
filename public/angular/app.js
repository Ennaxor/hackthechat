var hackthechat = angular.module('hackthechat', ['ngMaterial', 'jsbn.BigInteger']);


hackthechat.controller('app', ['$scope','$location', function($scope, $timeout, $location, BigInteger){
		
  $scope.greeting = 'Hola!';

  $scope.showUsers = false;

  //$scope.myInt = new BigInteger('123412341234123412341234123412341234');
  $(document).ready(function(){
		//Using 1536-bit MODP Group
		//http://datatracker.ietf.org/doc/rfc3526/?include_text=1
		
		//Generator
		var g = str2bigInt('2',10,80);
		//Prime
		var p = str2bigInt('FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA237327FFFFFFFFFFFFFFFF',16,80);
  
		//Secret key
		var a = randBigInt(80,0);
		//Public key
		var A = bigInt2str(powMod(g,a,p),64);
		var secret="";
		
		var socket = io.connect("localhost:8000");
		
		$("#chat").hide();
		$("#name").focus();
		$("form").submit(function(event){
    		event.preventDefault();
		});

		$("#join").click(function(){
			var name = $("#name").val();
			if (name != "" && A != "") {
				socket.emit("join", name, A);
				$("#login").detach();
				$("#chat").show();
				$("#msg").focus();
				ready = true;
			}
		});		

		$("#name").keypress(function(e){
			if(e.which == 13) {
				var name = $("#name").val();
				if (name != "" && A != "") {
					socket.emit("join", name, A);
					ready = true;
					$("#login").detach();
					$("#chat").show();
					$("#msg").focus();
				}
			}
		});

		socket.on("whisper", function(person, msg) {
		    if (person.name === "Tu") {
		      s = "susurras";
		      $("#msgs").append("<li><strong><span style='color:orange;'>" + person.name + "</span></strong> "+s+": " + msg + "</li>");
		    } else {
		      s = "susurra";
		      $("#msgs").append("<li><strong><span style='color:orange;'>" + person + "</span></strong> "+s+": " + msg + "</li>");
		    }
		    
		 });

		socket.on("update", function(msg) {
			if(ready)
				$("#msgs").append("<li>" + msg + "</li>");
		})

		socket.on("public_key", function(B) {
			if(ready){
				secret = powMod(str2bigInt(B,64,80),a,p);
				//$("#msgs").append("<li>" + bigInt2str(secret,64) + "</li>");
			}
		})
		
		
		socket.on("update-people", function(people){
			if(ready) {
				$("#people").empty();
				$.each(people, function(clientid, name) {
					$('#people').append("<li>" + name + "</li>");
				});
			}
		});

		socket.on("chat", function(who, msg){
			if(ready) {
				
				if (secret!="") {
					var X = bigInt2str(secret,64);
					var contador=0;
					var limit=msg.length;
					var aux = "";
					while (contador<limit) {
						aux += String.fromCharCode((msg).charCodeAt(contador) ^ (X).charCodeAt((contador%(X.length-1))));
						contador++;
					}
					msg=aux;
				}
				
				$("#msgs").append("<li><strong><span class='text-success'>" + who + "</span></strong> dice: " + msg + "</li>");
			}
		});

		socket.on("disconnect", function(){
			$("#msgs").append("<li><strong><span style='color:red;' class='text-warning'>Servidor no disponible</span></strong></li>");
			$("#msg").attr("disabled", "disabled");
			$("#send").attr("disabled", "disabled");
		});


		$("#send").click(function(){
			var msg = $("#msg").val();
			if(msg != ""){
				if (secret!="") {
					var X = bigInt2str(secret,64);
					var contador=0;
					var limit=msg.length;
					var aux = "";
					while (contador<limit) {
						aux += String.fromCharCode((msg).charCodeAt(contador) ^ (X).charCodeAt((contador%(X.length-1))));
						contador++;
					}
					msg=aux;
				}
				socket.emit("send", msg);
				$("#msg").val("");
				$("#msgs").animate({ scrollTop: $(document).height() }, "slow");
  				return false;

			}			
		});

		$("#msg").keydown(function(e){
			if(e.which == 13) {
				var msg = $("#msg").val();
				if(msg != ""){
					if (secret!="") {
						var X = bigInt2str(secret,64);
						var contador=0;
						var limit=msg.length;
						var aux = "";
						while (contador<limit) {
							aux += String.fromCharCode((msg).charCodeAt(contador) ^ (X).charCodeAt((contador%(X.length-1))));
							contador++;
						}
						msg=aux;
					}
					socket.emit("send", msg);
					$("#msg").val("");
					$("#msgs").animate({ scrollTop: $(document).height() }, "slow");
  					return false;
				}
			}
		});

	});


( function( $ ) {
	// Setup variables
	$window = $(window);
	$slide = $('.homeSlide');
	$slideTall = $('.homeSlideTall');
	$slideTall2 = $('.homeSlideTall2');
	$body = $('body');
	htmlbody = $('html,body');
	var duration = 500;
	
    //FadeIn all sections   
	$body.imagesLoaded( function() {
		setTimeout(function() {
		      
		      // Resize sections
		      adjustWindow();
		      
		      // Init navigation
		      initHomepageNav();
		      
		      // Fade in sections
			  $body.removeClass('loading').addClass('loaded');
			  
		}, 800);
	});
	
	function adjustWindow(){
		
		// Init Skrollr
		var s = skrollr.init({
		    forceHeight: false,
		    render: function(data) {
		    
		        //Debugging - Log the current scroll position.
		        //console.log(data.curTop);
		    }
		});
		
		// Get window size
	    winH = $window.height();
	    
	    // Keep minimum height 550
	    if(winH <= 550) {
			winH = 550;
		} 
	    
	    // Resize our slides
	    $slide.height(winH);
	    $slideTall.height(winH*2);
	    $slideTall2.height(winH*3);
	    
	    // Refresh Skrollr after resizing our sections
	    s.refresh($('.homeSlide'));
	    
	}

	function initHomepageNav(){
		
		var homeSlides = $('.homeSlide');
		var $slideContent = $('.hsContainer');
		var slidesCount = $(homeSlides).length;
		var activeSlide = 1;
		
		// Build HTML for Nav
		$('<div/>', {
		    'id' : 'slideNav'
		}).append($('<ul><li class="slideNavPrev"><a class="disabled" href="#" title="Go to previous slide"><span class="ico ico-up">↑</span></a></li><li><span id="activeSlide">'+activeSlide+'</span>/<span id="maxSlides">'+slidesCount+'</span></li><li class="slideNavNext"><a href="#" title="Go to next slide"><span class="ico ico-down">↓</span></a></li></ul>')).appendTo('body').delay(1200).fadeIn(duration);
		

		// Navigation highligting
		var $activeSlide = $('#activeSlide');
		var $maxSlides = $('#maxSlides');
		var $numberOfSlides = parseInt($maxSlides.text());
		var slideNavPrev = $('');
		var $slideNavNext = $('.slideNavNext');
		var $slideNavPrev = $('.slideNavPrev');	
		var $slideNavNextA = $('.slideNavNext a');
		var $slideNavPrevA = $('.slideNavPrev a');	
		
		// Highlight the section currently scrolling DOWN
		homeSlides.waypoint(function(direction) {
		  if (direction === 'down') {
		    var index = $(this).index();
			var index = index+1;
			$activeSlide.text(index);
			showHideNavItems();
		  }
		}, { offset: '50%' });
		
		// Highlight the section currently scrolling UP
		homeSlides.waypoint(function(direction) {
		  if (direction === 'up') {
			var index = $(this).index();
			var index = index+1;
			$activeSlide.text(index);
			showHideNavItems();
		  }
		}, {
		  offset: function() {
		    // This is the calculation that would give you
		    // "bottom of element hits middle of window"
		    return $.waypoints('viewportHeight') / 2 - $(this).outerHeight();
		  }
		});
		
		//Fade out unnecesary nav items
		function showHideNavItems(){
			var $activeSlideNumber = parseInt($activeSlide.text());
			
			if($activeSlideNumber == 1){
			
				$slideNavNextA.removeAttr('class');
				$slideNavPrev.animate({opacity: 0.25}).find('a').addClass('disabled');
				
			} else if ($activeSlideNumber == $numberOfSlides) {
			
				$slideNavPrevA.removeAttr('class');
				$slideNavNext.animate({opacity: 0.25}).find('a').addClass('disabled');
				
			} else {
			
				$slideNavNext.add($slideNavPrev).animate({opacity: 1});
				$slideNavNextA.add($slideNavPrevA).removeAttr('class');
				
			}
		}	
		
		//Next slide
		$slideNavNext.click(function (e) {
		    e.preventDefault();
		    var index = parseInt($activeSlide.text());
		    index++;
		    if(index <= $numberOfSlides){
		        
				scrollToSlide(index);
		        
		    }
		});
		
		//Prev slide
		$slideNavPrev.click(function (e) {
		    e.preventDefault();
		    var index = parseInt($activeSlide.text());
		    index--;
		    if(index > 0){
		        
		        scrollToSlide(index);
		        
		    }
		});
	    
	    
		function scrollToSlide(slideId){
			
			// Custom slide content offset
		    var customSlideOffset = $("#slide-"+slideId).attr('data-content-offset');
		    
		    
		    // Scroll to the top of a container if it doesn't have custom offset defined
		    if(typeof customSlideOffset === 'undefined'){
		        
		        htmlbody.animate({scrollTop: ($("#slide-"+slideId).offset().top) + 'px'},'slow');
		        
		    } else {
		        
		        // Convert percentage 'eg. 25p' into pixels
		        if(customSlideOffset.indexOf('p')!=-1) {
			       
			       var customSlideOffset = parseInt(customSlideOffset.split('p')[0]);
				   var slideHeight = $slide.height();
				   
				   customSlideOffset = Math.ceil((slideHeight/100) * customSlideOffset);
				   
				   //console.log(slideHeight +' '+ customSlideOffset);
				   
				   htmlbody.animate({scrollTop: ($("#slide-"+slideId).offset().top + customSlideOffset) + 'px'},'slow');
			        
		        } else {
			       
			       var customSlideOffset = parseInt(customSlideOffset);
			       
			       htmlbody.animate({scrollTop: ($("#slide-"+slideId).offset().top + customSlideOffset) + 'px'},'slow');
			        
		        }
		    
		    }
		}
	    
	    
	}
		
} )( jQuery );


	
	
}]);


