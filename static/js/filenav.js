$(document).ready( function() {
    $('#filenav').fileTree({
        root: '/',
        script: '/list_directory',
        expandSpeed: 500,
        collapseSpeed: 500,
        multiFolder: false
    }, function(file) {
        alert(file);
    });
});
