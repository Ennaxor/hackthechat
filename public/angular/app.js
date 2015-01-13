var hackthechat = angular.module('hackthechat', ['ngMaterial', 'jsbn.BigInteger']);


hackthechat.controller('app', ['$scope','$location', function($scope, $timeout, $location, BigInteger, $anchorScroll){
		
  $scope.greeting = 'Hola!';

  $scope.showUsers = false;

  $scope.goToProtocol = function(){
  	$location.href( "/#/protocolo" );
  }

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
		
		var socket = io.connect("");
		
		var whisper_msg = "";
		
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

		socket.on("whisper", function(person, whisperTo, msg) {
		    if (person.name === "Tu") {
		      s = "susurras";
			  
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
					secret ="";
				}
			  
		      $("#msgs").append("<li><strong><span style='color:orange;'>" + person.name + "</span></strong> "+s+ " a " + whisperTo + ": " + msg + "</li>");
		    } else {
		      s = "susurra";
			  
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
					secret ="";
				}
			  
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
				return true;
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
			
				$("#msgs").append("<li><strong><span style='color:orange;'>" + who + ":</span></strong> " + msg + "</li>");
			}
		});

		socket.on("disconnect", function(){
			$("#msgs").append("<li><strong><span style='color:red;' class='text-warning'>Servidor no disponible</span></strong></li>");
			$("#msg").attr("disabled", "disabled");
			$("#send").attr("disabled", "disabled");
		});
		
		socket.on("DH", function(whisperTo){
		
			var mensaje = whisper_msg;
			var isCoded = false;
			var re = /^[w]:.*:/;
			var whisper = re.test(whisper_msg);
			var whisperStr = whisper_msg.split(":");
			var whisperMsg = whisperStr[2];
			whisper_msg = "";
			
			if(ready) {
				if (secret!="") {				
					var X = bigInt2str(secret,64);
					var contador=0;
					var limit=whisperMsg.length;
					var aux = "";
					isCoded = true;

					while (contador<limit) {
						aux += String.fromCharCode((whisperMsg).charCodeAt(contador) ^ (X).charCodeAt((contador%(X.length-1))));
						contador++;
					}
					mensaje = aux;
				}
				
				socket.emit("send", mensaje, isCoded, whisperTo);
			}
		});

		$("#send").click(function(){

			var msg = $("#msg").val();
			var whisperStr ="";

			if(msg != ""){

				var re = /^[w]:.*:/;
				var whisper = re.test(msg);
				whisperStr = msg.split(":");

				if (whisper) {
					var whisperTo = whisperStr[1];
					whisper_msg = msg;
					socket.emit("check", whisperTo);
				}
				else {
				
					socket.emit("send", msg);
				}
			}
			$("#msg").val("");
			$("#msgs").animate({ scrollTop: $(document).height() }, "slow");
			return false;		
		});

		$("#msg").keydown(function(e){
			if(e.which == 13) {
				if(e.which == 13) {
			
					var msg = $("#msg").val();
					var whisperStr ="";			
					
					if(msg != ""){

						var re = /^[w]:.*:/;
						var whisper = re.test(msg);
						whisperStr = msg.split(":");

						if (whisper) {

							var whisperTo = whisperStr[1];
							whisper_msg = msg;
							socket.emit("check", whisperTo);
						}
						else {
						
							socket.emit("send", msg);
						}
					}
					$("#msg").val("");
					$("#msgs").animate({ scrollTop: $(document).height() }, "slow");
					return false;		
				}
			}
		});

	});	
	
}]);
