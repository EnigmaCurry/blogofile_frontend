var Crud = function() {
    
    function get_file(path, callback) {
        jQuery.ajax({type: 'GET',
                     url:  '/get_file',
                     data: {path:path},
                     success: callback,
                     error: function(){alert('get_file failed')}
                    });
    }

    function save_file(path, content, callback) {
        jQuery.ajax({type: 'POST',
                     url:  '/save_file',
                     data: JSON.stringify(
                         {path:path,
                          content:content}),
                     success: callback,
                     error: function(){alert('save_file failed')},
                     contentType: 'application/json'
                    });
    }

    function delete_path(path, callback) {
        jQuery.ajax({type: 'POST',
                     url:  '/delete_path',
                     data: JSON.stringify(
                         {path:path,
                          content:content}),
                     success: callback,
                     error: function(){alert('delete_path failed')},
                     contentType: 'application/json'
                    });
    }
    
    return {
        get_file: get_file,
        save_file: save_file,
        delete_path: delete_path
    }
}();
