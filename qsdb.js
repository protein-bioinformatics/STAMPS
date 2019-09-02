
specific_node_addition = "";

function init(){
    file_pathname = get_pathname();
    load_tissues();
    get_pathway_groups();
    set_species_menu();
    
    // read GET request
    var pairs = location.search.substring(1).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        HTTP_GET_VARS[pair[0]] = pair[1];
    }
    
    
    
    infobox = new Infobox();
    zoom_sign_in = new zoom_sign(1);
    zoom_sign_out = new zoom_sign(0);
    expand_collapse_obj = new expand_collapse();
    preview_element = new preview();
    select_field_element = new select_field();
    select_field_element.visible = false;
    
    var xmlhttp_pw = new XMLHttpRequest();
    xmlhttp_pw.onreadystatechange = function() {
        if (xmlhttp_pw.readyState == 4 && xmlhttp_pw.status == 200) {
            pathways = JSON.parse(xmlhttp_pw.responseText);
            set_pathway_menu();
            if ("pathway" in HTTP_GET_VARS) change_pathway(parseInt(HTTP_GET_VARS["pathway"]));
            else change_pathway();
            
            if ("zoom" in HTTP_GET_VARS) {
                var wait_for_loading_zoom = setInterval(function(){
                    if (pathway_is_loaded){
                        pathway_is_loaded = false;
                        clearInterval(wait_for_loading_zoom);
                        
                        var http_zoom = parseInt(HTTP_GET_VARS["zoom"]);
                        http_zoom = Math.max(min_zoom, http_zoom);
                        http_zoom = Math.min(max_zoom, http_zoom);
                        
                        
                        
                        var st_zoom = min_zoom + start_zoom_delta;
                        if (st_zoom < http_zoom) for (var i = st_zoom; i < http_zoom; ++i) zoom_in_out(0, 0);
                        else  for (var i = st_zoom; i > http_zoom; --i) zoom_in_out(1, 0);
                            
                        if ("position" in HTTP_GET_VARS) {
                            var position = HTTP_GET_VARS["position"].split(":");
                            if (position.length == 2){
                                
                                var shift_x = parseFloat(position[0]) - null_x;
                                var shift_y = parseFloat(position[1]) - null_y;
                                for (var i = 0; i < elements.length; ++i) elements[i].move(shift_x, shift_y);
                                null_x += shift_x;
                                null_y += shift_y;
                                boundaries[0] += shift_x;
                                boundaries[1] += shift_y;
                            }
                        }
                        
                        update_browser_link();
                        draw();
                        pathway_is_loaded = true;
                    }
                }, 20);
            }
            
            else if ("position" in HTTP_GET_VARS) {
                var position = HTTP_GET_VARS["position"].split(":");
                if (position.length == 2){
                    
                    var shift_x = parseFloat(position[0]) - null_x;
                    var shift_y = parseFloat(position[1]) - null_y;
                    
                    
                    var wait_for_loading_shift = setInterval(function(){
                        if (pathway_is_loaded){
                            pathway_is_loaded = false;
                            clearInterval(wait_for_loading_shift);
                    
                            for (var i = 0; i < elements.length; ++i) elements[i].move(shift_x, shift_y);
                            null_x += shift_x;
                            null_y += shift_y;
                            boundaries[0] += shift_x;
                            boundaries[1] += shift_y;
                            update_browser_link();
                            draw();
                            pathway_is_loaded = true;
                        }
                    }, 20);
                }
            }
            
            resize_pathway_view();
        }
    }
    xmlhttp_pw.open("GET", file_pathname + "scripts/get-pathways.bin", true);
    xmlhttp_pw.send();
    
    
    var xmlhttp_search = new XMLHttpRequest();
    xmlhttp_search.onreadystatechange = function() {
        if (xmlhttp_search.readyState == 4 && xmlhttp_search.status == 200) {
            search_data = JSON.parse(xmlhttp_search.responseText);
        }
    }
    xmlhttp_search.open("GET", file_pathname + "scripts/get-search-data.bin", true);
    xmlhttp_search.send();
    
    for (var key in tissues){
        tissue = tissues[key];
        tissue[2] = new Image();
        tissue[2].src = tissue[0];
    }
    
    navigation_content = ["select_species", "select_metabolic_pathway", "select_signaling_pathway", "search_results", "filter_panel_wrapper", "menu_background"];
    
    document.documentElement.style.overflow = 'hidden';
    document.body.scroll = "no";
    
    document.addEventListener('keydown', key_down, false);
    document.getElementById("menu_background").addEventListener("click", close_navigation, false);
    
    document.getElementById("infobox_html_background").addEventListener("click", hide_infobox, false);
    
    window.addEventListener('resize', resize_ms_view, false);
    window.addEventListener('resize', resize_pathway_view, false);
    document.getElementById("msarea").addEventListener('DOMMouseScroll', view_mouse_wheel_listener, false);
    document.getElementById("msarea").addEventListener("mousewheel", view_mouse_wheel_listener, false);
    document.addEventListener('DOMMouseScroll', prevent_zooming, false);
    document.addEventListener("mousewheel", prevent_zooming, false);
    
    var c = document.getElementById("renderarea");
    //c.style.display = "none";
    var ctx = c.getContext("2d");
    c.onmousedown = mouse_down_listener;
    c.onmouseup = mouse_up_listener;
    c.onmousemove = mouse_move_listener;
    c.addEventListener("click", mouse_click_listener, false);
    c.addEventListener("dblclick", mouse_dblclick_listener, false);
    c.addEventListener('DOMMouseScroll', mouse_wheel_listener, false);
    c.addEventListener('mousewheel', mouse_wheel_listener, false);
    c.addEventListener('contextmenu', function(event){event.preventDefault(); return false;}, false);
    c.addEventListener("mouseout", mouse_up_listener, false);
    
    
    // cookie treatment
    var cookie_data = document.cookie;
    if (typeof cookie_data !== "undefined" && cookie_data != "" && cookie_data.length > 0){
        try {
            cookie_data = JSON.parse(decodeURI(cookie_data));
            filter_parameters = cookie_data["filter_parameters"];
            read_cookie_information = cookie_data["read_cookie_information"];
            
            if (cookie_data["proteins_checked"].length > 0) accession_search_parse_accessions(cookie_data["proteins_checked"]);
        }
        catch (e) {
            document.getElementById('cookie_information').style.display = "none";
        }
    }
    if (!read_cookie_information) document.getElementById('cookie_information').style.display = "inline";
    
    
    
}




function resize_pathway_view(){
    
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    resize_renderarea_width(0);
    
    var statistics_window = document.getElementById("statistics");
    
    ctx.canvas.height = window.innerHeight;
    ctx.canvas.width = window.innerWidth - (statistics_window.style.display != "none" ? statistics_window.getBoundingClientRect().width : 0);
    preview_element.y = window.innerHeight - preview_element.height;
  
    var rect = document.getElementById('select_metabolic_pathway_nav').getBoundingClientRect();
    document.getElementById("select_metabolic_pathway").style.top = (rect.top + document.getElementById('select_metabolic_pathway_nav').offsetHeight).toString() + "px";
    document.getElementById("select_metabolic_pathway").style.left = (rect.left).toString() + "px";
    
    rect = document.getElementById('select_species_nav').getBoundingClientRect();
    document.getElementById("select_species").style.top = (rect.top + document.getElementById('select_species_nav').offsetHeight).toString() + "px";
    document.getElementById("select_species").style.left = (rect.left).toString() + "px";
    
    rect = document.getElementById('filter_panel_nav').getBoundingClientRect();
    document.getElementById("filter_panel_wrapper").style.top = (rect.top + document.getElementById('filter_panel_nav').offsetHeight).toString() + "px";
    document.getElementById("filter_panel_wrapper").style.left = (rect.left).toString() + "px";
    
    
    document.getElementById("pathway_title_field").style.top = (document.getElementById('navigation').offsetHeight).toString() + "px";
    document.getElementById("pathway_title_field").style.left = "0px";
    draw();
}




function resize_renderarea_width(subtract){
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    ctx.canvas.width  = window.innerWidth - subtract;
}




function mouse_click_listener(e){
    
    if (!pathway_is_loaded) return;
    if (!moved){
        if (highlight_element){
            var c = document.getElementById("renderarea");
            var res = get_mouse_pos(c, e);
            highlight_element.mouse_click(res, e.which);
        }
    }
    moved = false;
}




function mouse_down_listener(e){
    if (!pathway_is_loaded) return;
    var c = document.getElementById("renderarea");
    res = get_mouse_pos(c, e);
    if (e.buttons & 2){
        
        
        if (highlight_element){
            highlight_element.mouse_down(res, e.which);
            node_move_x = highlight_element.x;
            node_move_y = highlight_element.y;        
        }
        offsetX = res.x;
        offsetY = res.y;
    }
    else if (e.buttons & 1){
        if (highlight_element){
            highlight_element.mouse_down(res, e.which);
        }
        else {
            select_field_element.visible = true;
            select_field_element.start_position = res;
            select_field_element.end_position = res;
        }
    }
}


function mouse_up_listener(event){
    if (!pathway_is_loaded) return;
    
    if (select_field_element.visible) {
        select_field_element.visible = false;
        
        var sx = Math.min(select_field_element.start_position.x, select_field_element.end_position.x);
        var ex = Math.max(select_field_element.start_position.x, select_field_element.end_position.x);
        var sy = Math.min(select_field_element.start_position.y, select_field_element.end_position.y);
        var ey = Math.max(select_field_element.start_position.y, select_field_element.end_position.y);
        
        var toggled = new Set();
        for (var node_id in data){
            var current_node = data[node_id];
            current_node.highlight = false;
            if (current_node.type == "protein" && sx <= current_node.x && sy <= current_node.y && current_node.x <= ex && current_node.y <= ey){
                for (var j = 0; j < current_node.proteins.length; ++j){
                    var prot = protein_dictionary[current_node.proteins[j]];
                    if (!toggled.has(prot.id)){
                        prot.toggle_marked();
                        toggled.add(prot.id);
                    }
                }
            }
        }
        
        draw();
    }
    var c = document.getElementById("renderarea");
    res = get_mouse_pos(c, event);
    c.style.cursor = "auto";
    if (highlight_element) highlight_element.mouse_up(res);
    moved = false;
}


function right_mouse_down_listener(e){
    if (e.button != 2) return;
    right_mouse_down_start = get_mouse_pos(document.getElementById("renderarea"), e);
}


function mouse_move_listener(e){
    
    if (!pathway_is_loaded) return;
    
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    res = get_mouse_pos(c, e);
    var grid = Math.floor(base_grid * factor * 1000);
    mouse_x = res.x;
    mouse_y = res.y;
        
    // shift all nodes
    if (e.buttons & 2){
        if (!highlight_element || !highlight_element.mouse_down_move(res, e.which)){
            var shift_x = res.x - offsetX;
            var shift_y = res.y - offsetY;
            if (shift_x != 0 || shift_y != 0){
                moved = true;
                c.style.cursor = "all-scroll";
            }
            
            for (var i = 0; i < elements.length; ++i){
                elements[i].move(shift_x, shift_y);
            }
            null_x += shift_x;
            null_y += shift_y;
            boundaries[0] += shift_x;
            boundaries[1] += shift_y;
            update_browser_link();
        }
        draw();
        offsetX = res.x;
        offsetY = res.y;
    }
    else if (e.buttons & 1){
        if (!highlight_element || !highlight_element.mouse_down_move(res, e.which)){
            
            select_field_element.end_position = res;
            var sx = Math.min(select_field_element.start_position.x, select_field_element.end_position.x);
            var ex = Math.max(select_field_element.start_position.x, select_field_element.end_position.x);
            var sy = Math.min(select_field_element.start_position.y, select_field_element.end_position.y);
            var ey = Math.max(select_field_element.start_position.y, select_field_element.end_position.y);
            
            for (var node_id in data){
                var current_node = data[node_id];
                if (current_node.type == "protein" && sx <= current_node.x && sy <= current_node.y && current_node.x <= ex && current_node.y <= ey){
                    current_node.highlight = true;
                }
                else {
                    current_node.highlight = false;
                }
            }
        }
        draw();
    }
    else {
        mouse_up_listener(e);
        
        // find active node
        var newhighlight = 0;
        for (var i = elements.length - 1; i >= 0; --i){
            if (elements[i].is_mouse_over(res)){
                newhighlight = elements[i];
                break; 
            }
        }
        if (highlight_element != newhighlight){
            for (var i = 0; i < elements.length; ++i){
                elements[i].highlight = (elements[i] == newhighlight);
            }
            highlight_element = newhighlight;
            draw();
        }
        
    }
    if(highlight_element && highlight_element.tipp) Tip(e, highlight_element.name);
    else unTip();
    
    var set_mouse_pointer = -1;
    if(highlight_element instanceof node){
        set_mouse_pointer = highlight_element.mouse_pointer_cursor(res);
    }
    c.style.cursor = (set_mouse_pointer >= 0) ? "pointer" : "default";
}



function key_down(event){// canvas to svg
    if (event.which === 17){ // CTRL
        //pathway_to_svg();
        //nsaf_to_svg();
    }
    else if (event.which === 27){ // ESC
        hide_check_spectra();
        hide_download();
        collapse_statistics();
        close_navigation();
        last_opened_menu = "";
    }
    
    // easter egg
    var k_code = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    last_keys.push(event.which);
    while (last_keys.length > 10) last_keys.shift();
    if (last_keys.length == 10){
        var k_is_valid = true;
        for (var i = 0; i < 10; ++i){
            if (k_code[i] != last_keys[i]){
                k_is_valid = false;
                break;
            }
        }
        if (k_is_valid){
            alert("You broke the master code - you sneaky hacker. We'll flood your mailbox with yellow bananas. Your database will be dropped, your client destroyed. All your base are belong to us. Resistance is futile! May the force live long and prosper!!!");
        }
    }    
    if (!pathway_is_loaded) return;
    
    if(event.which == 45 || event.which == 109){
        zoom_in_out(1, 0);
        draw();
    }
    else if (event.which == 43 || event.which == 107){
        zoom_in_out(0, 0);
        draw();
    }
    
}




