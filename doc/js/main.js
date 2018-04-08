/* jQuery Stuffs */

$(document).ready(function () {
    initFirebase();
    checkUser();
    updateOrganizations();
    initMap();
});

$(document).on('click', 'tr', function() {
    centerMap(markers[$(this).attr('id')].position);
});

$("#loginSubmit").click(function() {
    email = $("#email").val();
    password = $("#password").val();

    login(email, password);
});

$("#searchTerm").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    
    $("tr").each(function(index) {
        if (index != 0) {
            $row = $(this);

            var id = $row.find("td").text().toLowerCase();  
  
            if (id.indexOf(value) != 0) {
                $(this).hide()
            } else {
                $(this).show()        
            }
        }
    });
});

/* Initalize Firebase */

function initFirebase() {
    var config = {
        apiKey: "AIzaSyBaHpiOzWWQ4QNOvd05zZHj1NzbZJQfO-k",
        authDomain: "transdir-69dd1.firebaseapp.com",
        databaseURL: "https://transdir-69dd1.firebaseio.com/",
        storageBucket: "gs://transdir-69dd1.appspot.com",
    };

    firebase.initializeApp(config);
}

function checkUser() {
    var user = firebase.auth().currentUser;

    if (user) {
        $('.anonymous').hide();
        $('.admin').show();

    } else {
        $('.admin').hide();
        $('.anonymous').show();
    }
}

function login(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;

        console.log(errorCode);
        console.log(errorMessage);
    });
    
    /* Logged in */

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            $('.anonymous').hide();            
            $('.admin').show();

			$('#welcome').text("Welcome, " + user.email);
			updateApprovals();

        } else {
            $('.admin').hide();
            $('.anonymous').show();
        }
    });
}

function logout() {
    firebase.auth().signOut().then(function(){
    
    }).catch(function(error) {
        console.log(error);
    });
}

/* Google Maps */

var map;
var markers = {}; /* Marker Lookup */

function initMap() {
	var oregon = {
		lat: 43.8041,
		lng: -120.5542,
	}; 

	map = new google.maps.Map(document.getElementById('mapsCanvas'), {
		zoom: 6,
		center: oregon,
	});
}

function addMarker(loc, title) {
    var marker = new google.maps.Marker({
        position: loc,
        map: map,
        title: title,
        animation: google.maps.Animation.DROP,
    }); 

    markers[title] = marker;
}

function centerMap(loc) {
    map.panTo(loc);
}

/* Firebase Database */

function insertTableRow(name, type, loc, location) {
    var trStart = "<tr id='" + name + "'>";
    var thStart = "<th scope='row'>";
    var tdStart = "<td>";

    var trEnd = "</tr>";
    var thEnd = "</th>";
    var tdEnd = "</td>";

    var tableRow = trStart + tdStart + name + tdEnd + tdStart + type + tdEnd + tdStart + loc + tdEnd + trEnd;

    $("#transInfo").append(tableRow);
}

function updateOrganizations() {
    var orgsRef = firebase.database().ref('organizations');

    orgsRef.once('value').then(function(snapshot) {
        var orgObj;

        /* Object Format
            lat, lng: The location of the organization or individual in computer friendly speak.
            name: The name of the organization or individual.
            desc: Description of the organization or individual.
            location: The actual English location of the organization or individual.
            type: The type, surgeons, therapists, doctors, endos. 
        */

        for (var key in snapshot.val()) {
            orgObj = snapshot.val()[key];

            var loc = {
                lat: orgObj.lat,
                lng: orgObj.lng, 
            };

            var locEnglish = orgObj.location;
            var type = orgObj.type;
            var name = orgObj.name;

            addMarker(loc, name);

            insertTableRow(name, type, locEnglish);
        }
    });
}

/* Admin Panel */

function insertConfirm(name, desc, loc, type) {
	var cardStart = "<div class='card' id='" + name + "'>";
	var cardBodyStart = "<div class='card-body'>";
	var cardTitleStart = "<h1 class='card-title'>" + name
	var cardTextStart ="<p class='card-text'>" + desc;


	var cardEnd = "</div>";
	var cardBodyEnd = "</div>";
	var cardTitleEnd = "</h1>";
	var cardTextEnd = "</h1>";

	cardFull = cardStart + cardBodyStart + cardTitleStart + cardTitleEnd + cardTextStart + cardTextEnd;


	$("#confirmations").append(cardFull);	    
}

var confirmations = {} 

function updateApprovals() {
    var confirmRef = firebase.database().ref('confirmations');

	confirmRef.once('value').then(function(snapshot) {
		for (var key in snapshot.val()) {
			var confirmObj = snapshot.val()[key];
		
			var loc = {
				lat: confirmObj.lat,
				lng: confirmObj.lng,
			}

			var locEnglish = confirmObj.location;
			var type = confirmObj.type;
			var name = confirmObj.name;
			var desc = confirmObj.description;

			confirmations[name] = snapshot.val()

			insertConfirm(name, desc, locEnglish, type);
		}
	});
}
