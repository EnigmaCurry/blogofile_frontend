var Crud = function() {
    
    function get_file(path) {
        jQuery.ajax({type: 'GET',
                     url:  '/get_file',
                     data: {path:path},
                     success: function(data) {
                         console.log(data);
                     }
                    });
    }
    
    return {
        get_file: get_file
    }
}();
