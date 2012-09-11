import os
from flask import request, jsonify
from functools import wraps
from response_codes import *
import config
import exceptions

### Request decorators:
### These produce client visible errors.

def required_arg(name, response=REQUIRED_ARG_MISSING):
    """A decorator that requires a request to include an argument,
    otherwise an error is thrown."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if request.method == 'GET':
                if not request.args.get(name):
                    if response == REQUIRED_ARG_MISSING:
                        return error(response, value=name)
                    else:
                        return error(response)
            elif request.method in ['POST', 'PUT']:
                if not request.json:
                    return error(NO_JSON_FOUND)
                if not request.json.has_key(name):
                    if response == REQUIRED_ARG_MISSING:
                        return error(response, value=name)
                    else:
                        return error(response)
            else:
                return error(BAD_HTTP_METHOD, value=request.method)
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def sandbox_path(path_arg):
    """A decorator that requires that a given argument be a path that
    is appropriately sandboxed."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if request.method == 'GET':
                path = request.args.get(path_arg)
            elif request.method in ['POST', 'PUT']:
                path = request.json[path_arg]
            else:
                return error(BAD_HTTP_METHOD, value=request.method)
            if path.startswith('/'):
                path = '.' + path
            realpath = os.path.abspath(os.path.join(config.SANDBOX, path))
            if not realpath.startswith(config.SANDBOX):
                return error(BAD_FILENAME_OR_DIRECTORY, value=path)
            return f(sandboxed_path=realpath)
        return decorated_function
    return decorator
    
