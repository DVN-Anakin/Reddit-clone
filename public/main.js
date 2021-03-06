$(document).ready(function() {
    var firebaseConfig = {
        apiKey: "AIzaSyBqWjR8kS84-CFZV6UHYO1HG-JmLK5l8wE",
        authDomain: "reddit-clone-5442c.firebaseapp.com",
        databaseURL: "https://reddit-clone-5442c.firebaseio.com",
        projectId: "reddit-clone-5442c",
        storageBucket: "reddit-clone-5442c.appspot.com",
        messagingSenderId: "46247685484",
        appId: "1:46247685484:web:956718efa2d4a10fa81749",
        measurementId: "G-XQXBRPY6GC"
    };
    firebase.initializeApp(firebaseConfig);
    var db = firebase.database();

    var DAY_IN_MS = 86400000;

    db.ref('posts')
        .orderByChild('createdAt')      // need to order it before applying filter, note: Firebase can only order by ascending
        .startAt(Date.now() - DAY_IN_MS)   // filter those posts created within last 24 hours 
        .on('child_added', function(snapshot) {
            if ($('#loadingMsg').is(':visible')) {
                $('#loadingMsg').hide();
            }
            var result = snapshot.val();
            result.id = snapshot.key;
            buildPostElement(result);
        });

    db.ref('posts')
        .on('child_changed', function(snapshot) {
            var result = snapshot.val();
            result.id = snapshot.key;
            $('div.votes#'+result.id).text(result.votes);
        });

    function upVote() {
        var itemID = $(this).attr('id');
        db.ref('/posts/' + itemID + '/votes')
            .transaction(function(currentVotes) {
                return currentVotes + 1;
            });
    }
    
    function downVote() {
        var itemID = $(this).attr('id');
        db.ref('/posts/' + itemID + '/votes')
            .transaction(function(currentVotes) {
                return currentVotes - 1;
            });
    }

    /**
     * Creating an html element
     * parameter: item - an object with post's data e.g. { title: 'My video!', link: 'https://www.youtube.com', votes: 9, user: 'Tony Stark', createdAt: 1512089554880 }
     */
    function buildPostElement(item) {
        var $template = $('#content-template').clone();
        var newItem = $template.prop('content');
        var timeFromNow = moment(item.createdAt).fromNow();
    
        $(newItem).find('.content-title').text(item.title);
        $(newItem).find('.arrow').attr('id', item.id);
        $(newItem).find('.vote-up').on('click', upVote);
        $(newItem).find('.vote-down').on('click', downVote);
        $(newItem).find('.votes').text(item.votes).attr('id', item.id);
        $(newItem).find('.content-link').attr('href', item.link).attr('target', '_blank');
        $(newItem).find('.content-meta').text(item.user + ' posted at ' + timeFromNow);
    
        $('#list').prepend(newItem);
    }

    $('#sharePost').on('click', function() {
        var link = $('#inputURL').val();
        var title = $('#inputTitle').val();
        var user = $('#inputUser').val();
        var createdAt = Date.now();
        var votes = 0;
    
        var data = {
            link: link,
            title: title,
            user: user,
            createdAt: createdAt,
            votes: votes
        };
    
        var postsListRef = db.ref('posts');
        var newPostRef = postsListRef.push(data, function(err) {
            if (err) {
                alert('Error saving to firebase: ' + err);
            } else {
                //alert('Success saving to firebase!');
                $('#inputURL').val('');
                $('#inputTitle').val('');
                $('#inputUser').val('');
                $('#addPost').modal('hide');
            }
        });
    });
})