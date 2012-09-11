from flask import jsonify
### Predefined response codes:

responses = {
    'NO_DIRECTORY_SPECIFIED': ('No Directory Specified', 400),
    'REQUIRED_ARG_MISSING': ('Required Argument Missing', 400),
    'BAD_FILENAME_OR_DIRECTORY': ('Bad filename or directory', 400),
    'NO_JSON_FOUND': ('Expected JSON message not found', 400),
    'BAD_HTTP_METHOD': ('Bad HTTP Method', 400),
    'DIRECTORY_NOT_EMPTY': ('Directory is not empty', 400)
    }

for name, response in responses.items():
    responses[name] = (name,) + response

locals().update(responses)
del responses

def error(response, **kwargs):
    return jsonify(code=response[0], error=response[1], **kwargs), response[2]
