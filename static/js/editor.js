$(document).ready(function(){
    
    var container = window.container = document.getElementById("editor");

    // Ymacs buffers
    var letter = window.letter = new Ymacs_Buffer({ name: "letter" });
    letter.setq("indent_level", 4);
    var letter2 = window.letter = new Ymacs_Buffer({ name: "letter2" });
    letter2.setq("indent_level", 4);

    // Ymacs
    var ymacs = window.ymacs = new Ymacs({buffers: [ letter, letter2]});
    ymacs.setColorTheme([ "dark", "y" ]);

    // Inject Ymacs into "ymacs_container"
    layout = window.layout = new DlLayout({});
    var jqLayout = $(layout.getElement());
    jqLayout.attr('id','editor_container');
    var element = window.element = layout.getElement();
    container.innerHTML = "";
    container.appendChild(element);
    layout.packWidget(ymacs, { pos: "top", fill: "*" });

    //Automatically resize the editor whenever the screen size
    //changes:
    $(window).resize(function() {
        layout.setSize({ x: $(container).width(), y: $(container).height() - 100});
    });    
    $(window).resize();

    //Put the minibuffer below the modeline... don't know why it gets
    //put at the top:
    minibuffer = $(".Ymacs_Minibuffer").parent();
    ymacsframe = $(".Ymacs_Frame");
    minibuffer.remove();
    ymacsframe.after(minibuffer);
});
