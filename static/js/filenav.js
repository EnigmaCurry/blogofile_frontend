$(document).ready( function() {
    $('#filenav').fileTree({
        root: '/',
        script: '/list_directory',
        expandSpeed: 500,
        collapseSpeed: 500,
        multiFolder: false
    }, function(path) {
        //Get the file from the server:
        Crud.get_file(path, function(data) {
                //Load the content into the editor
                //TODO: Make an abstract class for an editor so that we can
                //swap them out.
                //TODO: Lock this, so that either this can only be
                //called sequentially, or that each successive call
                //cancels other pending calls.
                var path_parts = path.split('/')
                var filename = path_parts[path_parts.length-1]
                var buffer = window.ymacs.createBuffer({name:filename})
                buffer.setCode(data['content'])
                window.ymacs.switchToBuffer(buffer)
        });
    });
});
