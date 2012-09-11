import os

def html_folder(dirs, files):
    """This lists a directory in the format needed by the jQuery File
    Tree plugin"""
    html = []
    html.append('<ul class="jqueryFileTree" style="display: none;">')
    for d in dirs:
        html.append('<li class="directory collapsed">'
                    '<a href="#" rel="%s/">%s</a></li>' 
                    % (d, os.path.split(d)[1]))
    for f in files:
        html.append('<li class="file ext_txt">'
                    '<a href="#" rel="%s">%s</a></li>' 
                    % (f, os.path.split(f)[1]))
    html.append("</ul>")
    return "\n".join(html)
                    
                    
    
