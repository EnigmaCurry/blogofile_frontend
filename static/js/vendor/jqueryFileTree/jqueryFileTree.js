// This is a modified file tree plugin specifically for the Blogofile
// frontend. It's not terribly Blogofile specific, and could probably
// be reused as-is, but it probably veers too far off course to
// contribe back upstream, so consider this a fork.
//
// This file may be used under the same terms as the original version.
//
// Original header follows:
// 
// jQuery File Tree Plugin
// 
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// Visit http://abeautifulsite.net/notebook.php?article=58 for more information
//
// Usage: $('.fileTreeDemo').fileTree( options, callback )
//
// Options:  root           - root folder to display; default = /
//           script         - location of the serverside AJAX file to use; default = jqueryFileTree.php
//           folderEvent    - event to trigger expand/collapse; default = click
//           expandSpeed    - default = 500 (ms); use -1 for no animation
//           collapseSpeed  - default = 500 (ms); use -1 for no animation
//           expandEasing   - easing function to use on expand (optional)
//           collapseEasing - easing function to use on collapse (optional)
//           multiFolder    - whether or not to limit the browser to one subfolder at a time
//           loadMessage    - Message to display while initial tree loads (can be HTML)
//
// History:
//
// 1.01 - updated to work with foreign characters in directory/file names (12 April 2008)
// 1.00 - released (24 March 2008)
//
// TERMS OF USE
// 
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC. 
//
    if(jQuery) (function($){
	
	$.extend($.fn, {
	    fileTree: function(o, h) {
		// Defaults
		if( !o ) var o = {};
		if( o.root == undefined ) o.root = '/';
		if( o.script == undefined ) o.script = 'jqueryFileTree.php';
		if( o.folderEvent == undefined ) o.folderEvent = 'click';
		if( o.expandSpeed == undefined ) o.expandSpeed= 500;
		if( o.collapseSpeed == undefined ) o.collapseSpeed= 500;
		if( o.expandEasing == undefined ) o.expandEasing = null;
		if( o.collapseEasing == undefined ) o.collapseEasing = null;
		if( o.multiFolder == undefined ) o.multiFolder = true;
		if( o.loadMessage == undefined ) o.loadMessage = 'Loading...';
		if( o.fileContextMenu == undefined ) o.fileContextMenu = null;
                if( o.fileContextMenuAction == undefined ) o.fileContextMenuAction = null;
		if( o.dirContextMenu == undefined ) o.dirContextMenu = null;
                if( o.dirContextMenuAction == undefined ) o.dirContextMenuAction = null;
		
		$(this).each( function() {
		    
		    function showTree(c, t) {
			$(c).addClass('wait');
			$(".jqueryFileTree.start").remove();
			$.get(o.script, { path: t, format:'html'}, function(data) {
			    $(c).find('.start').html('');
			    $(c).removeClass('wait').append(data);
			    if( o.root == t ) $(c).find('UL:hidden').show(); else $(c).find('UL:hidden').slideDown({ duration: o.expandSpeed, easing: o.expandEasing });
			    bindTree(c);
			});
		    }
		    
		    function bindTree(t) {
                        //Refresh folder:
                        $(t).find('li.directory a').bind('refresh', function(event) {
			    $(this).parent().find('UL').remove(); // cleanup
			    showTree( $(this).parent(), escape($(this).attr('rel').match( /.*\// )) );
                        });
                        //Click file/folder:
			$(t).find('LI A').bind(o.folderEvent, function(event) {
			    if( $(this).parent().hasClass('directory') ) {
				if( $(this).parent().hasClass('collapsed') ) {
				    // Expand
				    if( !o.multiFolder ) {
					$(this).parent().parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
					$(this).parent().parent().find('LI.directory').removeClass('expanded').addClass('collapsed');
				    }
				    $(this).parent().find('UL').remove(); // cleanup
				    showTree( $(this).parent(), escape($(this).attr('rel').match( /.*\// )) );
				    $(this).parent().removeClass('collapsed').addClass('expanded');
				} else {
				    // Collapse
				    $(this).parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
				    $(this).parent().removeClass('expanded').addClass('collapsed');
				}
			    } else {
				h($(this).attr('rel'));
			    }
			    return false;
			});
                        //Right click file:
                        if (o.fileContextMenuAction) {
                            $(t).find('li.file a').contextMenu({menu: o.fileContextMenu}, o.fileContextMenuAction);
                        }
                        //Right click folder:
                        if (o.dirContextMenuAction) {
                            $(t).find('li.directory a').contextMenu({menu: o.dirContextMenu}, o.dirContextMenuAction);
                        }
			// Prevent A from triggering the # on non-click events
			if( o.folderEvent.toLowerCase != 'click' ) $(t).find('LI A').bind('click', function() { return false; });
		    }
		    // Loading message
		    $(this).html('<ul class="jqueryFileTree start"><li class="wait">' + o.loadMessage + '<li></ul>');
		    // Get the initial file list
		    showTree( $(this), escape(o.root) );
                    // Bind a refresh action to the root:
                    var self = $(this);
                    $(this).bind('refresh_root', function(event) {
                        self.children().remove();
                        showTree( self, escape(o.root) );
                    });
		});
	    }
	});
	
    })(jQuery);
