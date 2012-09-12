var Buffer = Class.$extend({
    __init__ : function(name, path, callbacks) {
        //name - Name of the buffer
        //path - The path to the file on the server
        //callbacks -
        //  get_content - set the content of the editor for the buffer
        //  set_content - get the content of the editor for the buffer
        //  close_buffer - close the editor for this buffer
        this.name = name;
        this.path = path;
        //This is the SHA1 of the content the last time the file was
        //saved.
        this.__callbacks = callbacks;
    },
    
    save : function(callback) {
        //Get the content from the editor and save it on the server.
        Crud.save_file(this.path, get_content_cb(), function() {
            this.saved_sha1 = SHA1(this.get_content_cb());
            callback();
        });
    },

    is_modified : function() {
        return SHA1(this.get_content_cb()) != this.saved_sha1
    },

    get_content: function() {
        return this.__callbacks['get_content']();
    },

    set_content: function(content) {
        this.__callbacks['set_content'](content);
        this.saved_sha1 = SHA1(content);
    },
    
    close: function() {
        this.__callbacks['close_buffer'](this);
    }

});

var Editor = Class.$extend({
    __init__ : function() {
        this.__buffers_by_name = {};
        this.__buffers_by_path = {};
    },

    __add_buffer: function(buffer) {
        this.__buffers_by_name[buffer.name] = buffer;
        this.__buffers_by_path[buffer.path] = buffer;
    },

    __remove_buffer: function(buffer) {
        delete this.__buffers_by_name[buffer.name];
        delete this.__buffers_by_path[buffer.path];
    },

    //Save the named buffer, or if none specified, the currently visible file:
    save : function (buffer_name) {
        throw "save unimplemented!";
    },
    
    //Create a unique buffer name from the path
    __get_unused_buffer_name: function(path) {
        var filename = path.split('/').pop(-1);
        if (this.__buffers_by_name[filename] == undefined) {
            return filename;
        } else {
            var i = 1;
            while (true) {
                var name = filename + ' (' + i + ')';
                if (this.__buffers_by_name[name] == undefined) {
                    return name;
                }
                i++;
            }
        }
    },
        
    //Open a file. Download the file from the server. Check to see if
    //a buffer with that file is already open and if it is different
    //than the server version. If force_reload == true, ask the
    //user what to do, otherwise don't do anything. If the file has
    //not been opened before, create a new buffer in the editor and
    //raise it.
    open : function(path, force_reload) {
        //Get the file from the server:
        var self = this;
        Crud.get_file(path, function(response) {
            //Check if we already have this path open:
            var buffer = self.__buffers_by_path[path];
            if (buffer) {
                self.raise_buffer(buffer);
                //Check if the local buffer differs from the server:
                if (SHA1(response.content) != SHA1(self.get_buffer_content(buffer))) {
                    if (force_reload) {
                        if(confirm('You have unsaved local changes to this file.\n\nWould you like to discard your local changes and use the server\'s version of this file?')) {
                            buffer.set_content(response.content);
                        }
                    }
                }
            } else {
                var buffer = Buffer(self.__get_unused_buffer_name(path), path, {
                    'get_content': function() {
                        var b = self.__buffers_by_path[path];
                        return self.get_buffer_content(b);
                    },
                    'set_content': function(content) {
                        var b = self.__buffers_by_path[path];
                        return self.set_buffer_content(b, content);
                    },
                    'close_buffer': function(buf) {
                        self.close_buffer(buf);
                        self.__remove_buffer(buf);
                    }
                });
                self.__add_buffer(buffer)
                buffer.set_content(response.content)
                self.raise_buffer(buffer);
            }
        });
    },

    getBuffer: function(path) {
        return this.__buffers_by_path[path];
    },

});

var YMacs = Editor.$extend({
    __init__ : function() {
        this.$super();
        this.ymacs = new Ymacs();
        this.ymacs.setColorTheme([ "dark", "y" ]);

        // Inject Ymacs into "ymacs_container"
        this.layout = new DlLayout({});
        this.element = $(this.layout.getElement());
        this.element.attr('id','editor_container');

        this.__already_rendered = false
    },
    
    display : function() {
        var self = this;
        var container = $("#editor");
        container.html("")
        container.append(this.element);
        this.layout.packWidget(this.ymacs, { pos: "top", fill: "*" });

        if(this.__already_rendered == false) {
            this.__already_rendered = true;
            //Automatically resize the editor whenever the screen size
            //changes:
            $(window).resize(function() {
                self.layout.setSize({ x: container.width(), y: container.height() - 19});
            });    
            $(window).resize();

            //Put the minibuffer below the modeline... don't know why it gets
            //put at the top:
            var minibuffer = this.element.find(".Ymacs_Minibuffer").parent();
            var ymacsframe = this.element.find(".Ymacs_Frame");
            minibuffer.remove();
            ymacsframe.after(minibuffer);
            //And then there's two minibuffers (???) so delete the second
            //one...
            this.element.find(".Ymacs_Minibuffer:last").remove();
        }
    },

    get_buffer_content: function(buffer) {
        return this.ymacs.getBuffer(buffer.name).getCode();
    },

    set_buffer_content: function(buffer, content) {
        var buf = this.ymacs.getBuffer(buffer.name);
        if (!buf) {
            buf = this.ymacs.createBuffer({name: buffer.name});
        }
        return buf.setCode(content);
    },

    close_buffer: function(buffer) {
        this.ymacs.getBuffer(buffer.name).destroy();
    },

    raise_buffer: function(buffer) {
        this.ymacs.frames[0].setBuffer(this.ymacs.getBuffer(buffer.name))
    }
});

SHA1=function(l){function p(b,a){return b<<a|b>>>32-a}l+="";for(var n=Math,c=[1518500249,1859775393,2400959708,3395469782,1732584193,4023233417,2562383102,271733878,3285377520,4294967295],s=n.ceil(l.length/4)+2,q=n.ceil(s/16),g=[],a=0,h=[],j,d,e,f,m,i,b,k;a<q;a++){g[a]=[];for(k=0;k<16;k++){function o(b,c){return l.charCodeAt(a*64+k*4+b)<<c}g[a][k]=o(0,24)|o(1,16)|o(2,8)|o(3,0)}}i=l.length*8-8;a=q-1;g[a][14]=i/(c[9]+1);g[a][14]=n.floor(g[a][14]);g[a][15]=i&c[9];for(a=0;a<q;a++){for(b=0;b<16;b++)h[b]=g[a][b];for(b=16;b<80;b++)h[b]=p(h[b-3]^h[b-8]^h[b-14]^h[b-16],1);j=c[4];d=c[5];e=c[6];f=c[7];m=c[8];for(b=0;b<80;b++){var r=n.floor(b/20),t=p(j,5)+(r<1?d&e^~d&f:r==2?d&e^d&f^e&f:d^e^f)+m+c[r]+h[b]&c[9];m=f;f=e;e=p(d,30);d=j;j=t}c[4]+=j;c[5]+=d;c[6]+=e;c[7]+=f;c[8]+=m}i="";for(z=4;z<9;z++)for(a=7;a>=0;a--)i+=((c[z]&c[9])>>>a*4&15).toString(16);return i};

$(document).ready(function(){
    
    var ymacs = YMacs();
    ymacs.display();

    editor = ymacs;
});
