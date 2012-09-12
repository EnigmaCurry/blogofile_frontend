$(document).ready( function() {

    var fileContextMenu = $('<ul id="fileContextMenu" class="contextMenu">\
    <li class="delete">\
        <a href="#delete">Delete</a>\
    </li>\
    <li class="copy">\
        <a href="#force_reload">Force Reload</a>\
    </li>\
    </ul>');
    $('body').append(fileContextMenu);

    var fileContextMenuAction = function(action, el, pos) {
        var path = el.attr('rel')
        if(action == 'force_reload') {
            editor.open(path, true);
        }
        if(action == 'delete') {
            if(confirm('Are you sure you wish to delete this file?\n\n'+path)) {
                var buffer = editor.getBuffer(path);
                if(buffer) {
                    buffer.close();
                }
                Crud.delete_path(path, function() {
                    if (path.split('/').length <= 2) {
                        //If the path is at the root, refresh the root
                        //folder: 
                       $(el).parents('.jqueryFileTree').trigger('refresh_root');
                    } else {
                        //Find the parent folder and refresh it:
                        $(el).parents('.directory:first').children('a:first').trigger('refresh');
                    }
                });
            }
        }
    };

    var dirContextMenu = $('<ul id="dirContextMenu" class="contextMenu">\
    <li class="delete">\
        <a href="#delete">Delete</a>\
    </li>\
    <li class="refresh">\
        <a href="#refresh">Refresh</a>\
    </li>\
    </ul>');
    $('body').append(dirContextMenu);

    var dirContextMenuAction = function(action, el, pos) {
        var path = el.attr('rel')
        if(action == 'refresh') {
            $(el).trigger('refresh');
        }
    };

    $('#filenav').fileTree({
        root: '/',
        script: '/list_directory',
        expandSpeed: 500,
        collapseSpeed: 500,
        multiFolder: false,
        fileContextMenu: 'fileContextMenu',
        fileContextMenuAction: fileContextMenuAction,
        dirContextMenu: 'dirContextMenu',
        dirContextMenuAction: dirContextMenuAction
    }, function(path) {
        //Get the file from the server:
        editor.open(path)
    });
    
});
