

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
            var pathway_dat = JSON.parse(xmlhttp_pw.responseText);
            for (var i = 0; i < pathway_dat.length; ++i){
                pathways[pathway_dat[i][0]] = pathway_dat[i][1];
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
    xmlhttp_search.open("GET", "/qsdb/cgi-bin/get-search-data.bin", true);
    xmlhttp_search.send();
    
    for (var key in tissues){
        tissue = tissues[key];
        tissue[2] = new Image();
        tissue[2].src = tissue[0];
    }
    
    
    document.documentElement.style.overflow = 'hidden';
    document.body.scroll = "no";
    
    document.addEventListener('keydown', key_down, false);
    //document.addEventListener('keyup', key_up, false);
    document.getElementById("search_background").addEventListener("click", hide_search, false);
    document.getElementById("select_species_background").addEventListener("click", hide_select_species, false);
    document.getElementById("select_pathway_background").addEventListener("click", hide_select_pathway, false);
    document.getElementById("filter_panel_background").addEventListener("click", hide_filter_panel, false);
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
    
    //document.cookie = "";
    
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
            console.log(e);
        }
    }
    if (!read_cookie_information) document.getElementById('cookie_information').style.display = "inline";
    
    change_pathway();
    resize_pathway_view();
}

function resize_pathway_view(){
    
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    preview_element.y = window.innerHeight - preview_element.height;
    draw();
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
        for (var i = 0; i < data.length; ++i){
            data[i].highlight = false;
            if (data[i].type == "protein" && sx <= data[i].x && sy <= data[i].y && data[i].x <= ex && data[i].y <= ey){
                for (var j = 0; j < data[i].proteins.length; ++j){
                    var prot = protein_dictionary[data[i].proteins[j]];
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
            
            
            if (!highlight_element){
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




