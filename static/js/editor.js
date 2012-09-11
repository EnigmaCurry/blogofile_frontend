var Editor = Class.$extend({
    //Save the named buffer, or if none specified, the currently visible file:
    save : function (buffer_name) {
        alert("save - unimplemented!");
    },
    
    //Open a file. Implementations should check to see if the file is
    //already opened and ask if the file should be reloaded:
    open : function() {
        alert("open - unimplemented!");
    },

    //Display the editor. Replaces the #editor div with the editor widgets.
    display : function() {
        alert("display - unimplemented!");
    }
});

var YMacs = Editor.$extend({
    __init__ : function() {
        // Ymacs
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
    }
});


$(document).ready(function(){
    
    ymacs = YMacs();
    ymacs.display();
    
});
