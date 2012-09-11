"""
Flask based filesystem CRUD
~~~~~~~~~~~~~~~~~~~~~~~~~~~

This flask server handles basic CRUD operations on a directory tree.

WARNING: This has very little security as of yet. Don't use this in public. 

"""
import os.path
import shutil
import errno
from flask import Flask, request, session, abort, jsonify
from decorators import required_arg, sandbox_path
from response_codes import *
from jquery_file_tree import html_folder
import config

from flask import Request
def on_json_fail(one, two):
    print one.data
    raise Exception('asdfasdfasdfasdf')
Request.on_json_loading_failed = on_json_fail

### Configuration
app = Flask(__name__)
app.config.from_object(config)

### Routed functions
@app.route('/list_directory')
@required_arg('path')
@sandbox_path('path')
def list_directory(sandboxed_path):
    """
    List the contents of a directory.
    
    sandboxed_path - the cleaned up path calculated in sandbox_path decorator

    request arguments:
    path - the directory to list
    format - 'json' or 'html' - html is used for jQuery File Tree.
    """
    format = request.args.get('format')

    try:
        listing = os.listdir(sandboxed_path)
    except OSError:
        return error(BAD_FILENAME_OR_DIRECTORY)

    files = []
    for f in listing:
        f = os.path.join(sandboxed_path, f)
        if os.path.isfile(f):
            files.append('/' + os.path.relpath(f, config.SANDBOX))

    dirs = []
    for d in listing:
        d = os.path.join(sandboxed_path, d)
        if os.path.isdir(d):
            dirs.append('/' + os.path.relpath(d, config.SANDBOX))
    
    path = request.args.get('path')
    if format == 'html':
        return html_folder(dirs, files)
    else:
        return jsonify(path=path, directories=dirs, files=files)

@app.route('/get_file')
@required_arg('path')
@sandbox_path('path')
def get_file(sandboxed_path):
    """
    Get the contents of a file.

    sandboxed_path - the cleaned up path calculated in sandbox_path decorator

    arguments:
    path - the path to the file
    """
    try:
        f = open(sandboxed_path)
    except IOError:
        return error(BAD_FILENAME_OR_DIRECTORY, value=path)
    
    path = request.args.get('path')
    return jsonify(path=path, modified=int(os.path.getmtime(sandboxed_path)), 
                   size=os.path.getsize(sandboxed_path), content=f.read())

@app.route('/save_file', methods=['POST','PUT'])
@required_arg('path')
@required_arg('content')
@sandbox_path('path')
def save_file(sandboxed_path):
    """
    Saves content into a file

    sandboxed_path - the cleaned up path calculated in sandbox_path decorator

    arguments:
    path - the path to the file
    contents - the contents of the file
    """
    content = request.json['content']
    try:
        f = open(sandboxed_path, "w")
    except IOError:
        return error(BAD_FILENAME_OR_DIRECTORY, value=path)

    f.write(content)
    f.close()
    path = request.json['path']
    return jsonify(path=path, modified=int(os.path.getmtime(sandboxed_path)), 
                   size=os.path.getsize(sandboxed_path), message='saved')

@app.route('/delete_path', methods=['POST','PUT'])
@required_arg('path')
@sandbox_path('path')
def delete_path(sandboxed_path):
    """
    Delete a file or directory

    sandboxed_path - the cleaned up path calculated in sandbox_path decorator

    arguments:
    path - the path to the file or directory
    recursive - if True, a directory and all descendent files/directories will be deleted.
    """
    if os.path.isfile(sandboxed_path):
        try:
            os.unlink(sandboxed_path)
        except OSError:
            return error(BAD_FILENAME_OR_DIRECTORY, value=path)
    elif os.path.isdir(sandboxed_path):
        try:
            recursive = request.json['recursive']
        except KeyError:
            recursive = False
        if recursive == True or recursive == 'True' or recursive == 1:
            try:
                shutil.rmtree(sandboxed_path)
            except OSError:
                return error(BAD_FILENAME_OR_DIRECTORY, value=path)
        else:
            try:
                os.rmdir(sandboxed_path)
            except OSError, e:
                if e.errno == errno.ENOTEMPTY:
                    return error(DIRECTORY_NOT_EMPTY, value=path)
    else:
        return error(BAD_FILENAME_OR_DIRECTORY, value=path)
            
    path = request.json['path']
    return jsonify(path=path, message='deleted')

if __name__ == '__main__':
    app.run()
