

function init(){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var receive = xmlhttp.responseText;
        }
    }
    //xmlhttp.open("GET", "set-counter.py?counter=request", true);
    xmlhttp.open("GET", "/qsdb/cgi-bin/set-counter.bin?counter=request", true);
    xmlhttp.send();
    
    var xmlhttp_pw = new XMLHttpRequest();
    xmlhttp_pw.onreadystatechange = function() {
        if (xmlhttp_pw.readyState == 4 && xmlhttp_pw.status == 200) {
            pathways = JSON.parse(xmlhttp_pw.responseText);
            set_pathway_menu();
        }
    }
    //xmlhttp_pw.open("GET", "get-pathways.py", true);
    xmlhttp_pw.open("GET", "/qsdb/cgi-bin/get-pathways.bin", true);
    xmlhttp_pw.send();
    
    
    
    
    document.documentElement.style.overflow = 'hidden';
    document.body.scroll = "no";
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    infobox = new Infobox(ctx);
    zoom_sign_in = new zoom_sign(ctx, 1);
    zoom_sign_out = new zoom_sign(ctx, 0);
    
    
    c.onclick = function (event)
    {
        if (event.region) {
            alert('You clicked ' + event.region);
        }
    }
    
    
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    c.onmousedown = mouse_down_listener;
    c.onmouseup = mouse_up_listener;
    c.onmousemove = mouse_move_listener;
    c.addEventListener("click", mouse_click_listener, false);
    c.addEventListener("dblclick", mouse_dblclick_listener, false);
    //c.addEventListener("wheel", mouse_wheel_listener, false);
    //c.addEventListener("mousewheel", mouse_wheel_listener, false);
    c.addEventListener('DOMMouseScroll', mouse_wheel_listener, false);
    
    document.addEventListener('keydown', key_down, false);
    document.addEventListener('keyup', key_up, false);
    document.getElementById("search_background").addEventListener("click", hide_search, false);
    document.getElementById("select_species_background").addEventListener("click", hide_select_species, false);
    document.getElementById("select_pathway_background").addEventListener("click", hide_select_pathway, false);
    document.getElementById("disclaimer_background").addEventListener("click", hide_disclaimer, false);
    document.getElementById("check_spectra_background").addEventListener("click", hide_check_spectra, false);
    
    window.addEventListener('resize', resize_ms_view, false);
    document.getElementById("msarea").addEventListener("mousewheel", view_mouse_wheel_listener, false);
    document.getElementById("msarea").addEventListener('DOMMouseScroll', view_mouse_wheel_listener, false);
    
    c.oncontextmenu = function (event){
        return false;
    }
    change_pathway(0);
}





function load_data(reload){
    
    pathway_is_loaded = false;
    if (!reload){
        reset_view();
        document.getElementById("search_field").value = "";
        hide_search();
    }
    
    
    
    
    
    elements = [];
    edges = [];
    clearInterval(highlighting);
    infobox.visible = false;
    
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    preview_element = new preview(ctx);
    
    var species = [];
    if(document.getElementById("species_mouse").checked) species.push("mouse");
    //if(document.getElementById("species_human").checked) species.push("human");
    var species_string = species.join(":");
    
    // get data information
    data = [];
    data_ref = [];
    var tmp_data = 0;
    nodes = 0;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            tmp_data = JSON.parse(xmlhttp.responseText);
        }
    }
    
    // get nodes information
    var xmlhttp2 = new XMLHttpRequest();
    xmlhttp2.onreadystatechange = function() {
        if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200) {
            nodes = JSON.parse(xmlhttp2.responseText);
        }
    }
    
    
    //xmlhttp.open("GET", "get-qsdbdata.py?request=qsdbdata&pathway=" + current_pathway + "&species=" + species_string, true);
    xmlhttp.open("GET", "/qsdb/cgi-bin/get-nodes.bin?pathway=" + current_pathway + "&species=" + species_string, true);
    xmlhttp.send();
    
    
    //xmlhttp2.open("GET", "get-edgedata.py?pathway=" + current_pathway, true);
    xmlhttp2.open("GET", "/qsdb/cgi-bin/get-edges.bin?pathway=" + current_pathway, true);
    xmlhttp2.send();
    
    
    
    var x_min = 1e100, x_max = -1e100;
    var y_min = 1e100, y_max = -1e100;
    var preview_zoom = 0, m_zoom = 0;
    var nav_height = document.getElementById("navigation").getBoundingClientRect().height;
    
    
    
    var process_nodes = setInterval(function(){
        if (tmp_data){
            for (var i = 0; i < tmp_data.length; ++i){
                data.push(new node(tmp_data[i], c));
                x_min = Math.min(x_min, data[i].x - data[i].width * 0.5);
                x_max = Math.max(x_max, data[i].x + data[i].width * 0.5);
                y_min = Math.min(y_min, data[i].y - data[i].height * 0.5);
                y_max = Math.max(y_max, data[i].y + data[i].height * 0.5);
                data_ref[data[i].id] = i;
            }
            if (reload){
                for (var i = 0; i < data.length; ++i){
                    data[i].x += null_x;
                    data[i].y += null_y;
                    data[i].width *= factor;
                    data[i].height *= factor;
                    data[i].x = null_x + factor * (data[i].x - null_x);
                    data[i].y = null_y + factor * (data[i].y - null_y);
                }
            }
            if (!reload){
                var shift_x = (ctx.canvas.width - x_min - x_max) * 0.5;
                var shift_y = nav_height + (ctx.canvas.height - nav_height - y_min - y_max) * 0.5;
                for (var i = 0; i < data.length; ++i){
                    data[i].x += shift_x;
                    data[i].y += shift_y;
                }
                null_x += shift_x;
                null_y += shift_y;
            
                
                if ((x_max - x_min) / ctx.canvas.width > (y_max - y_min) / (ctx.canvas.height - nav_height)){
                    m_zoom = -Math.ceil(Math.log((x_max - x_min) / ctx.canvas.width) / Math.log(scaling));
                    preview_zoom = -Math.ceil(Math.log((x_max - x_min) / ctx.canvas.width * 5) / Math.log(scaling));
                }
                else {
                    m_zoom = -Math.ceil(Math.log((y_max - y_min) / (ctx.canvas.height - nav_height)) / Math.log(scaling));
                    preview_zoom = -Math.ceil(Math.log((y_max - y_min) / (ctx.canvas.height - nav_height) * 5) / Math.log(scaling));
                }
            }
            clearInterval(process_nodes);
            
        }
    }, 1);
        
    var start_time = new Date().getTime();
    var process_edges = setInterval(function(){
        if (tmp_data && nodes){
            compute_edges();
            assemble_elements();
            min_zoom = preview_zoom;
            for (var i = zoom; i >= preview_zoom; --i) zoom_in_out(1, 0);
            draw(1);
            preview_element.snapshot();
            for (var i = 0; i < (m_zoom - preview_zoom); ++i) zoom_in_out(0, 0);
            min_zoom = m_zoom;
            draw();
            pathway_is_loaded = true;
            clearInterval(process_edges);
        }
    }, 1);
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
    if (e.buttons & 1){
        if (!highlight_element || !highlight_element.mouse_down_move(res, e.which)){
            var shift_x = res.x - offsetX;
            var shift_y = res.y - offsetY;
            if (shift_x != 0 || shift_y != 0){
                moved = true;
                c.style.cursor = "all-scroll";
            }
            
            
            if (!event_key_down || !highlight_element){
                
                for (var i = 0; i < data.length; ++i){
                    data[i].x += shift_x;
                    data[i].y += shift_y;
                }
                for (var i = 0; i < edges.length; ++i){
                    var edg = edges[i];
                    for (var j = 0; j < edges[i].point_list.length; ++j){
                        edg.point_list[j].x += shift_x;
                        edg.point_list[j].y += shift_y;
                    }
                }
                infobox.x += shift_x;
                infobox.y += shift_y;
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
    else {
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
    if(highlight_element && highlight_element.tipp) Tip(e, highlight_element.id + " " + highlight_element.name);
    else unTip();
    
}



function key_down(event){
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
            alert("You breaked the master code - you sneaky hacker. We'll flood your mailbox with yellow bananas. Your database will be dropped, your client destroyed. All your base are belong to us!!!");
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





document.addEventListener('DOMContentLoaded', init, false);
