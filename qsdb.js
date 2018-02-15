

function init(){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var receive = xmlhttp.responseText;
        }
    }
    xmlhttp.open("GET", "/qsdb/cgi-bin/set-counter.bin?counter=request", true);
    xmlhttp.send();
    
    var xmlhttp_pw = new XMLHttpRequest();
    xmlhttp_pw.onreadystatechange = function() {
        if (xmlhttp_pw.readyState == 4 && xmlhttp_pw.status == 200) {
            pathways = JSON.parse(xmlhttp_pw.responseText);
            for (var i = 0; i < pathways.length; ++i){
                pathway_dict[pathways[i][0]] = i;
            }
            set_pathway_menu();
        }
    }
    xmlhttp_pw.open("GET", "/qsdb/cgi-bin/get-pathways.bin", true);
    xmlhttp_pw.send();
    
    
    
    var xmlhttp_search = new XMLHttpRequest();
    xmlhttp_search.onreadystatechange = function() {
        if (xmlhttp_search.readyState == 4 && xmlhttp_search.status == 200) {
            search_data = JSON.parse(xmlhttp_search.responseText);
        }
    }
    xmlhttp_search.open("GET", "/qsdb/cgi-bin/get-search-data.py", true);
    xmlhttp_search.send();
    
    for (var key in tissues){
        tissue = tissues[key];
        tissue[2] = new Image();
        tissue[2].src = tissue[0];
    }
    
    
    document.documentElement.style.overflow = 'hidden';
    document.body.scroll = "no";
    
    document.addEventListener('keydown', key_down, false);
    document.addEventListener('keyup', key_up, false);
    document.getElementById("search_background").addEventListener("click", hide_search, false);
    document.getElementById("select_species_background").addEventListener("click", hide_select_species, false);
    document.getElementById("select_pathway_background").addEventListener("click", hide_select_pathway, false);
    document.getElementById("filter_panel_background").addEventListener("click", hide_filter_panel, false);
    document.getElementById("infobox_html_background").addEventListener("click", hide_infobox, false);
    
    window.addEventListener('resize', resize_ms_view, false);
    window.addEventListener('resize', resize_pathway_view, false);
    document.getElementById("msarea").addEventListener("mousewheel", view_mouse_wheel_listener, false);
    document.getElementById("msarea").addEventListener('DOMMouseScroll', view_mouse_wheel_listener, false);
    
    
    // cookie treatment
    var cookie_data = document.cookie;
    if (typeof cookie_data !== "undefined" && cookie_data != "" && cookie_data.length > 0){
        cookie_data = JSON.parse(decodeURI(cookie_data));
        which_proteins_checked = new Set(cookie_data["proteins_checked"]);
        filter_parameters = cookie_data["filter_parameters"];
    }
    
    change_pathway(0);
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
            
            
            if (!event_key_down || !highlight_element){
                for (var i = 0; i < elements.length; ++i){
                    elements[i].move(shift_x, shift_y);
                }
                null_x += shift_x;
                null_y += shift_y;
                boundaries[0] += shift_x;
                boundaries[1] += shift_y;
            }
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
            
            for (var i = 0; i < data.length; ++i){
                if (data[i].type == "protein" && sx <= data[i].x && sy <= data[i].y && data[i].x <= ex && data[i].y <= ey){
                    data[i].highlight = true;
                }
                else {
                    data[i].highlight = false;
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
        if (highlight_element != newhighlight && !event_moving_node){
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
        set_mouse_pointer = highlight_element.check_mouse_over_protein_name(res);
    }
    c.style.cursor = (set_mouse_pointer >= 0) ? "pointer" : "default";
}



function key_down(event){// canvas to svg
    if (event.which === 17){ // CTRL
        //pathway_to_svg();
        //nsaf_to_svg();
        return false;
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
            alert("You broke the master code - you sneaky hacker. We'll flood your mailbox with yellow bananas. Your database will be dropped, your client destroyed. All your base are belong to us. Resistance is futile!!!");
        }
    }    
    if (!pathway_is_loaded) return;
    
    if(event.which == 45){
        zoom_in_out(1, 0);
        draw();
    }
    else if (event.which == 43){
        zoom_in_out(0, 0);
        draw();
    }
    
}




