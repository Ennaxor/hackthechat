var hackthechat = angular.module('hackthechat', ['ngMaterial', 'jsbn.BigInteger']);


hackthechat.controller('app', ['$scope','$location', function($scope, $location){
  $scope.greeting = 'Hola!';

  //$scope.myInt = new BigInteger('123412341234123412341234123412341234');
  $(document).ready(function(){
		var socket = io.connect("localhost:8000");
		$("#chat").hide();
		$("#name").focus();
		$("form").submit(function(event){
    		event.preventDefault();
		});

		$("#join").click(function(){
			var name = $("#name").val();
			if (name != "") {
				socket.emit("join", name);
				$("#login").detach();
				$("#chat").show();
				$("#msg").focus();
				ready = true;
			}
		});

		$("#name").keypress(function(e){
			if(e.which == 13) {
				var name = $("#name").val();
				if (name != "") {
					socket.emit("join", name);
					ready = true;
					$("#login").detach();
					$("#chat").show();
					$("#msg").focus();
				}
			}
		});

		socket.on("update", function(msg) {
			if(ready)
				$("#msgs").append("<li>" + msg + "</li>");
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
					socket.emit("send", msg);
					$("#msg").val("");
					$("#msgs").animate({ scrollTop: $(document).height() }, "slow");
  					return false;
				}
				
			}
		});

	});

}]);


