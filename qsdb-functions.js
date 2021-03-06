moved = false;
editor_mode = false;
HTTP_GET_VARS = {};
current_pathway = 1;
current_pathway_list_index = 0;
highlight_element = 0;
offsetX = 0;
offsetY = 0;
null_x = 0;
null_y = 0;
mouse_x = 0;
mouse_y = 0;
zoom_options = [0, 0, 0];
filter_parameters = {};
supported_species = {};
current_species = "";
current_host = "";
new_host = "";
new_species = "";
initial_load = true;
top_n_fragments = [3, 6, 1000];
ion_types = ["y", "b", "b|y"];
filter_parameters["min_peptide_length"] = 8;
filter_parameters["max_peptide_length"] = 25;
filter_parameters["min_precursor_charge"] = 2;
filter_parameters["max_precursor_charge"] = 3;
filter_parameters["max_topn_fragments"] = 2;
filter_parameters["ions"] = 0;
filter_parameters["oxy_m_off"] = true;
filter_parameters["oxy_m_var"] = false;
filter_parameters["oxy_m_fix"] = false;
filter_parameters["carba_c_off"] = true;
filter_parameters["carba_c_var"] = false;
filter_parameters["carba_c_fix"] = false;
filter_parameters["filte_panel_visible"] = false;
filter_parameters["validation_top_n"] = true;
filter_parameters["validation_prm"] = true;
filter_parameters["validation_is"] = true;
filter_parameters["protein_tissues_visible"] = true;
filter_parameters["peptide_tissues_visible"] = false;
filter_parameters["validadion_visible"] = true;
filter_parameters["enable_unreviewed"] = false;
last_opened_menu = "";
navigation_content = [];
pathway_groups = {};
data = {};
edge_data = 0;
node_move_x = 0;
node_move_y = 0;
edges = [];
infobox = 0;
zoom_sign_in = 0;
zoom_sign_out = 0;
start_zoom_delta = 4;
expand_collapse_obj = 0;
elements = [];
boundaries = [0, 0, 0, 0];
pathway_is_loaded = false;
edge_count = 0;
draw_code = 0;
process_edges_semaphore = false;
protein_dictionary = {};
toggled_proteins = new Set();
spectra_exclude = [];
back_function = 0;
num_validation = [0, 0, 0, 0, 0, 0, 0, 0];
search_data = [];
read_cookie_information = false;
analytics_active = false;
selected_menu_dict = {};

windowWidth = 0;
windowHeight = 0;
scaling = 1.25;
expanding_percentage = 0.25;
zoom = 0;
factor = Math.pow(scaling, zoom);
factor_h = factor * 0.5;
max_zoom = 5;
min_zoom = -5;
highlight_zoom = 3;
base_grid = 25;
max_protein_line_number = 3;
metabolite_radius = 12;
arrow_length = 10;
round_rect_radius = 10;
text_size = 15;
check_len = 15;
check_side = check_len * factor;
check_side_h = check_side * 0.5;
check_side_d = check_side * 2;
line_height = 20;
anchors = ['left', 'top', 'right', 'bottom'];
anchor_size = 5;
next_anchor = {"left": "top", "top": "right", "right": "bottom", "bottom": "left"};
opposite_anchor = {"left": "right", "top": "bottom", "right": "left", "bottom": "top"};
on_slide = false;
font_size = text_size * factor;
pathway_font_size = 20;
radius = metabolite_radius * factor;
last_keys = [];
highlighting = 0;
basket = {};
file_pathname = "";
filtered_basket = {};

tissues = {};
tissue_name_to_id = {};
                     
line_width = 5;
disabled_text_color = "#bbbbbb";
disabled_fill_color = "#cccccc";
text_color = "black";



protein_stroke_color = "#f69301";
protein_unconnected_stroke_color = "#7eaddd";
protein_fill_color = "#fff6d5";
protein_disabled_stroke_color = "#cccccc";
protein_disabled_fill_color = "#eeeeee";
membrane_fill_color = "#aaaaaa";
membrane_stroke_color = "#888888";
label_color = "#777777";
metabolite_stroke_color = "#f69301";
metabolite_label_stroke_color = "#999999";
metabolite_highlight_label_stroke_color = "#000000";
metabolite_fill_color = "white";;
pathway_stroke_color = "#f69301";
pathway_disabled_stroke_color = "#cccccc";
pathway_fill_color = "white";
edge_color = "#f69301";
edge_disabled_color = "#cccccc";
slide_color = "#5792da";
node_selected_color = "#ff0000";


/*
// corporate design
protein_stroke_color = "black";
protein_fill_color = "white";
protein_disabled_stroke_color = "#cccccc";
protein_disabled_fill_color = "#eeeeee";
metabolite_stroke_color = "black";
metabolite_fill_color = "white";
pathway_stroke_color = "black";
pathway_disabled_stroke_color = "#cccccc";
pathway_fill_color = "white";
edge_color = "black";
edge_disabled_color = "#cccccc";
slide_color = "black";
*/

slide_width = 2;
slide_bullet = 4;
infobox_fill_color = "white";
infobox_stroke_color = "#777777";
infobox_stroke_width = 1;
infobox_offset_x = 20;
preview_element = 0;
select_field_element = 0;
background_hiding = 0;

pathways = {15: "Alanine, aspartate and glutamate metabolism"};

var filter_panel_meta_data = [0, 0, 0];

filter_panel_meta_data[0] = "<div id=\"filter_panel\" class=\"filter_panel\"> \
    <table> \
        <tr><td>Min. peptide length</td><td><input type=\"number\" min=\"8\" max=\"25\" id=\"min_peptide_length\" /><td></tr> \
        <tr><td>Max. peptide length</td><td><input type=\"number\" min=\"8\" max=\"25\" id=\"max_peptide_length\" /><td></tr> \
        <tr><td>Min. precursor charge</td><td><input type=\"number\" min=\"2\" max=\"6\" id=\"min_precursor_charge\" /><td></tr> \
        <tr><td>Max. precursor charge</td><td><input type=\"number\" min=\"2\" max=\"6\" id=\"max_precursor_charge\" /><td></tr> \
        <tr><td colspan=\"2\">&nbsp;<br>Modifications:</td></tr> \
        <tr><td>Oxydation of M</td><td> \
        <input type=\"radio\" id=\"oxy_m_off\" name=\"oxy_m\" /> off \
        <input type=\"radio\" id=\"oxy_m_var\" name=\"oxy_m\" /> variable \
        <input type=\"radio\" id=\"oxy_m_fix\" name=\"oxy_m\" /> fixed \
        <td></tr> \
        <tr><td>Carbamidomethylation of C</td><td> \
        <input type=\"radio\" id=\"carba_c_off\" name=\"carba_c\" /> off \
        <input type=\"radio\" id=\"carba_c_var\" name=\"carba_c\" /> variable \
        <input type=\"radio\" id=\"carba_c_fix\" name=\"carba_c\" /> fixed \
        <td></tr> \
        <tr><td colspan=\"2\"><br>Tissues:</td></tr>";

filter_panel_meta_data[1] = "<tr><td colspan=\"2\">&nbsp;<br>Report:</td></tr> \
        <tr><td>Top-n fragments</td><td><select id=\"max_topn_fragments\"><option>3</option><option>6</option><option>all</option></select><td></tr> \
        <tr><td>Ions</td><td><select id=\"ions\"><option>y</option><option>b</option><option>y, b</option></select><td></tr> \
        <tr><td colspan=\"2\"><br>Validation:<br>\
        <input type=\"checkbox\" id=\"validation_top_n\" /> Top-n experiment&nbsp;<font color='#ffbebe'>???</font><br> \
        <input type=\"checkbox\" id=\"validation_prm\" /> PRM&nbsp;<font color='#feff90'>???</font><br> \
        <input type=\"checkbox\" id=\"validation_is\" /> SRM + internal standard&nbsp;<font color='#a0ff90'>???</font><br> \
        <input type=\"checkbox\" id=\"enable_unreviewed\" /> enable unreviewed proteins</td></tr> \
        <tr><td colspan=\"2\">&nbsp;<br><font size=\"1\" color=\"blue\" style=\"cursor: pointer;\" onclick=\" \
        document.getElementById('min_peptide_length').value = 8; \
        document.getElementById('max_peptide_length').value = 25; \
        document.getElementById('min_precursor_charge').value = 2; \
        document.getElementById('max_precursor_charge').value = 3; \
        document.getElementById('max_topn_fragments').selectedIndex = 2; \
        document.getElementById('ions').selectedIndex = 0; \
        document.getElementById('oxy_m_off').checked = true; \
        document.getElementById('carba_c_off').checked = true;";

filter_panel_meta_data[2] = "document.getElementById('validation_top_n').checked = true; \
        document.getElementById('validation_prm').checked = true; \
        document.getElementById('validation_is').checked = true; \
        document.getElementById('enable_unreviewed').checked = false; \
        ;\">default settings</td></tr> \
    </table> \
</div>";

var filter_panel_data = "";



var filter_panel_meta_data_landscape = [0, 0, 0];

filter_panel_meta_data_landscape[0] = "<div id=\"filter_panel\"> \
    <table><tr><td valign=\"top\" style=\"border-right: 1px solid #d3d3d3;\"> \
        <table> \
            <tr><td>Min. peptide length</td><td><input type=\"number\" min=\"8\" max=\"25\" id=\"min_peptide_length\" /><td></tr> \
            <tr><td>Max. peptide length</td><td><input type=\"number\" min=\"8\" max=\"25\" id=\"max_peptide_length\" /><td></tr> \
            <tr><td>Min. precursor charge</td><td><input type=\"number\" min=\"2\" max=\"6\" id=\"min_precursor_charge\" /><td></tr> \
            <tr><td>Max. precursor charge</td><td><input type=\"number\" min=\"2\" max=\"6\" id=\"max_precursor_charge\" /><td></tr> \
            <tr><td colspan=\"2\">&nbsp;<br><font size=\"1\" color=\"blue\" style=\"cursor: pointer;\" onclick=\" \
            document.getElementById('min_peptide_length').value = 8; \
            document.getElementById('max_peptide_length').value = 25; \
            document.getElementById('min_precursor_charge').value = 2; \
            document.getElementById('max_precursor_charge').value = 3; \
            document.getElementById('max_topn_fragments').selectedIndex = 2; \
            document.getElementById('ions').selectedIndex = 0; \
            document.getElementById('oxy_m_off').checked = true; \
            document.getElementById('carba_c_off').checked = true;";


filter_panel_meta_data_landscape[1] = "document.getElementById('validation_top_n').checked = true; \
            document.getElementById('validation_prm').checked = true; \
            document.getElementById('validation_is').checked = true; \
            document.getElementById('enable_unreviewed').checked = false; \
            ;\">default settings</td></tr> \
        </table></td> \
        <td valign=\"top\" style=\"border-right: 1px solid #d3d3d3;\"> \
            <table> \
                <tr><td colspan=\"2\">Modifications:</td><td></tr> \
                <tr><td>Oxydation of M</td><td> \
                <input type=\"radio\" id=\"oxy_m_off\" name=\"oxy_m\" /> off \
                <input type=\"radio\" id=\"oxy_m_var\" name=\"oxy_m\" /> variable \
                <input type=\"radio\" id=\"oxy_m_fix\" name=\"oxy_m\" /> fixed \
                <td></tr> \
                <tr><td>Carbamidomethylation of C</td><td> \
                <input type=\"radio\" id=\"carba_c_off\" name=\"carba_c\" /> off \
                <input type=\"radio\" id=\"carba_c_var\" name=\"carba_c\" /> variable \
                <input type=\"radio\" id=\"carba_c_fix\" name=\"carba_c\" /> fixed \
                <td></tr> \
            </table> \
        </td> \
        <td valign=\"top\" style=\"border-right: 1px solid #d3d3d3;\"> \
            <table> \
                <tr><td colspan=\"2\">Tissues:</td><td></tr>";

filter_panel_meta_data_landscape[2] = "</table> \
        </td> \
        <td valign=\"top\" style=\"border-right: 1px solid #d3d3d3;\"> \
            <table> \
                <tr><td colspan=\"2\">Report:</td><td></tr> \
                <tr><td>Top-n fragments</td><td><select id=\"max_topn_fragments\"><option>3</option><option>6</option><option>all</option></select><td></tr> \
                <tr><td>Ions</td><td><select id=\"ions\"><option>y</option><option>b</option><option>y, b</option></select><td></tr> \
            </table> \
        </td> \
        <td valign=\"top\"> \
            <table> \
                <tr><td colspan=\"2\">Validation:</td><td></tr> \
                <tr><td><input type=\"checkbox\" id=\"validation_top_n\" /> Top-n experiment&nbsp;<font color='#ffbebe'>???</font></td><tr> \
                <tr><td><input type=\"checkbox\" id=\"validation_prm\" /> PRM&nbsp;<font color='#feff90'>???</font></td><tr> \
                <tr><td><input type=\"checkbox\" id=\"validation_is\" /> SRM + internal standard&nbsp;<font color='#a0ff90'>???</font></td><tr> \
                <tr><td><input type=\"checkbox\" id=\"enable_unreviewed\" /> enable unreviewed proteins</td><tr> \
                </tr> \
            </table> \
        </td> \
    </td></tr></table> \
</div>";




var filter_panel_data_landscape = "";





function get_check_spectra_content(){
    var proteins_checked = filter_parameters["protein_tissues_visible"] ? "checked" : "";
    var peptides_checked = filter_parameters["peptide_tissues_visible"] ? "checked" : "";
    var validation_visible = filter_parameters["validation_visible"] ? "checked" : "";
    var return_text = "<canvas id=\"check_spectra_msarea\" class=\"msarea\"></canvas> \
    <fieldset id=\"check_spectra_options\" class=\"spectra_options\" style=\"position: fixed; border: 0px; margin: 0px; top: 0px; padding: px;\"> \
        <input type=\"radio\" onchange=\"change_match_error();\" id=\"check_spectra_radio_ppm\" name=\"select_error\" value=\"ppm\" style=\"border: 0px; margin: 0px; top: 0px; padding: 0px;\" \ checked><label for=\"radio_ppm\">Relative</label> \
        <input type=\"radio\" onchange=\"change_match_error();\" id=\"check_spectra_radio_da\" name=\"select_error\" value=\"Da\" style=\"border: 0px; margin: 0px; top: 0px; padding: 0px;\"><label for=\"radio_da\">Absolute</label> \
        <input type=\"text\" onchange=\"change_match_error_value();\" id=\"check_spectra_error_value\" value=\"-\" size=1 style=\"text-align: right;\"><label id=\"check_spectra_unit\">ppm</label> \
    </fieldset> \
    <div id=\"check_spectra_panel\" class=\"spectra_panel\"></div> \
    <div id=\"check_spectra_functions\" style=\"margin: 0px; position: fixed;\"> \
        <table width=\"100%\"><tr><td><font size=\"-1\" color=\"blue\" style=\"cursor: pointer;\" onclick=\"check_spectra_expand_collapse_all(false);\">Expand</font> / \
        <font size=\"-1\" color=\"blue\" style=\"cursor: pointer;\" onclick=\"check_spectra_expand_collapse_all(true);\">Collapse</font></td> \
        <td align=\"right\"> <font size=\"-1\" color=\"blue\" style=\"cursor: pointer;\" onclick=\"clean_basket();\">Delete all proteins</font></td></tr></table> \
    </div> \
    <div id=\"check_spectra_filter_panel_check_spectra\" class=\"filter_panel_check_spectra\"></div> \
    <table width=\"100%\" height=\"100%\"><tr><td valign=\"bottom\"><font color=\"blue\" style=\"cursor: pointer;\" onclick=\"filter_settings_clicked();\" id=\"check_spectra_filter_label\">Show \ filter settings</font>&nbsp;&nbsp;&nbsp; \
    <input type=\"checkbox\" onchange=\"filter_parameters['protein_tissues_visible'] = !filter_parameters['protein_tissues_visible']; show_hide_protein_tissues();\" " + proteins_checked + "> Show protein tissues \
    &nbsp;&nbsp;&nbsp;<input type=\"checkbox\" onchange=\"filter_parameters['peptide_tissues_visible'] = !filter_parameters['peptide_tissues_visible']; show_hide_peptide_tissues();\" " + peptides_checked + "> Show peptide tissues \
    &nbsp;&nbsp;&nbsp;<input type=\"checkbox\" onchange=\"filter_parameters['validation_visible'] = !filter_parameters['validation_visible']; show_hide_peptide_validation();\" " + validation_visible + "> Show validation \
    </td><td valign=\"bottom\" align=\"right\">";
    if (typeof(qsdb_domain) === 'undefined' || qsdb_domain != true){
        return_text += "<button onclick=\"hide_check_spectra(false);\" style=\"display: inline;\">Cancel</button>";
    }
    
    return_text += "<button onclick=\"hide_check_spectra(); back_function();\">Back</button> <button onclick=\"hide_check_spectra(); download_assay();\">Go to Download</button></td></tr></table>";
    return return_text;
}


function get_waiting_background_content(){
    return "<div id=\"waiting_black\" style=\"top: 0px; left: 0px; width: 100%; height: 100%; position: fixed; z-index: 10; background-color: black; opacity: 0.4;\"> \
    </div> \
    <div style=\"top: 40%; left: 40%; width: 20%; height: 20%; position: fixed; z-index: 10; opacity: 40%; background-color: white; border: 1px black solid; border-radius: 15px;\"> \
        <table width=\"100%\" height=\"100%\"> \
            <tr> \
                <td align=\"center\" valign=\"middle\"> \
                    &nbsp;<p><img src=\"images/ajax-loader.gif\" /><p>&nbsp;<p> \
                    Request in progress, please wait. \
                </td> \
            </tr> \
        </table> \
    </div>";
}


function debug(text){
    document.getElementById("hint").innerHTML = text;
}


function load_tissues(){
    // get tissues
    var xmlhttp_tissues = new XMLHttpRequest();
    xmlhttp_tissues.onreadystatechange = function() {
        if (xmlhttp_tissues.readyState == 4 && xmlhttp_tissues.status == 200) {
            supported_tissues = JSON.parse(xmlhttp_tissues.responseText);
            tissue_name_to_id = {};
            tissues = {};
            var sorted_tissues = [];
            
            for (var tissue of supported_tissues){
                filter_parameters["tissue_" + tissue[1].toLowerCase()] = true;
                tissues[tissue[0]] = [tissue[2], tissue[1], 0, "statistics_check_" + tissue[1].toLowerCase(), tissue[3]];
                tissue_name_to_id[tissue[1]] = tissue[0];
                sorted_tissues.push(tissue[1]);
            }
            
            load_css();
            
            // create portrait filter panel
            sorted_tissues.sort();
            var i = 0;
            filter_panel_data = filter_panel_meta_data[0];
            for (var tissue of sorted_tissues){
                if (i % 2 == 0) filter_panel_data += "<tr>";
                filter_panel_data += "<td><input type=\"checkbox\" id=\"check_" + tissue.toLowerCase() + "\" /> " + tissue + "</td>";
                if (i % 2 == 1) filter_panel_data += "</tr>";
                ++i;
            }
            if (i % 2 == 1) filter_panel_data_landscape += "</tr>";
            filter_panel_data += filter_panel_meta_data[1];
            for (var tissue of sorted_tissues){
                filter_panel_data += "document.getElementById('check_" + tissue.toLowerCase() + "').checked = true;";
            }
            filter_panel_data += filter_panel_meta_data[2];
            
            
            
            
            // create landscape filter panel
            filter_panel_data_landscape = filter_panel_meta_data_landscape[0];
            for (var tissue of sorted_tissues){
                filter_panel_data_landscape += "document.getElementById('check_" + tissue.toLowerCase() + "').checked = true;";
            }
            filter_panel_data_landscape += filter_panel_meta_data_landscape[1];
            i = 0;
            for (var tissue of sorted_tissues){
                if (i % 2 == 0) filter_panel_data_landscape += "<tr>";
                filter_panel_data_landscape += "<td><input type=\"checkbox\" id=\"check_" + tissue.toLowerCase() + "\" /> " + tissue + "</td>";
                if (i % 2 == 1) filter_panel_data_landscape += "</tr>";
                ++i;
            }
            if (i % 2 == 1) filter_panel_data_landscape += "</tr>";
            filter_panel_data_landscape += filter_panel_meta_data_landscape[2];
            
            return true;
        }
    }
    xmlhttp_tissues.open("GET", file_pathname + "scripts/get-tissues.py?host=" + encodeURL(current_host), false);
    xmlhttp_tissues.send();
    
}




function load_css(){
    var the_head = document.getElementsByTagName('head')[0];
    var to_remove = [];
    for (var style of the_head.children){
        if (typeof(style.idtype) !== "undefined" && style.idtype == "css_tissue_style"){
            to_remove.push(style);
        }
    }
    
    for (var style of to_remove){
        the_head.removeChild(style);
    }
    
    for (var tissue_key in tissues){
        var style = document.createElement('style');
        style.type = 'text/css';
        style.idtype = "css_tissue_style";
        document.getElementsByTagName('head')[0].appendChild(style);
        style.innerHTML = "div." + tissues[tissue_key][1] + " { \
        background-image: url(\"data:image/png;base64," + tissues[tissue_key][0] + "\"); \
        background-repeat: no-repeat; \
        width: 12px; \
        height: 12px; \
        margin-right: 2px; \
        float: left; \
        display: inline; \
        }";
    }
}




function change_zoom(){
    factor = Math.pow(scaling, zoom);
    font_size = text_size * factor;
    radius = metabolite_radius * factor;
    check_side = check_len * factor;
    check_side_h = check_side * 0.5;
    check_side_d = check_side * 2;
    factor_h = factor * 0.5;
}


function roundRect(x, y, width, height, rect_curve, ctx) {
    ctx.beginPath();
    ctx.moveTo(x + rect_curve, y);
    ctx.lineTo(x + width - rect_curve, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + rect_curve);
    ctx.lineTo(x + width, y + height - rect_curve);
    ctx.quadraticCurveTo(x + width, y + height, x + width - rect_curve, y + height);
    ctx.lineTo(x + rect_curve, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - rect_curve);
    ctx.lineTo(x, y + rect_curve);
    ctx.quadraticCurveTo(x, y, x + rect_curve, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}



CanvasRenderingContext2D.prototype.arrow = function (p1_x, p1_y, p2_x, p2_y, head) {
    if (typeof head == 'undefined') {
        head = true;
    }
    
    if (head){
        var l = Math.sqrt(Math.pow(arrow_length * factor, 2) / (Math.pow(p2_x - p1_x, 2) + Math.pow(p2_y - p1_y, 2)));
        
        var l2 = Math.sqrt(Math.pow(arrow_length / 2 * factor, 2) / (Math.pow(p2_x - p1_x, 2) + Math.pow(p2_y - p1_y, 2)));
        
        var x = p2_x + l * (p1_x - p2_x);
        var y = p2_y + l * (p1_y - p2_y);
        
        var x_arc = p2_x + l2 * (p1_x - p2_x);
        var y_arc = p2_y + l2 * (p1_y - p2_y);
        
        var x_l = x - l / 2 * (p1_y - p2_y);
        var y_l = y + l / 2 * (p1_x - p2_x);
        
        var x_r = x + l / 2 * (p1_y - p2_y);
        var y_r = y - l / 2 * (p1_x - p2_x);
        
        
        this.strokeStyle = edge_color;
        this.fillStyle = edge_color;
        this.lineWidth = line_width * factor;
        this.beginPath();
        this.moveTo(p1_x, p1_y);
        this.lineTo(x, y);
        this.closePath();
        this.stroke();
        
        var r = Math.sqrt(Math.pow(y_arc - y_r, 2) + Math.pow(x_arc - x_r, 2));
        this.lineWidth = 1;
        this.beginPath();
        this.moveTo(p2_x, p2_y);
        this.lineTo(x_r, y_r);
        this.lineTo(x_l, y_l);
        this.closePath();
        this.fill();
    }
    else {
        this.strokeStyle = edge_color;
        this.fillStyle = edge_color;
        this.lineWidth = line_width * factor;
        this.beginPath();
        this.moveTo(p1_x, p1_y);
        this.lineTo(p2_x, p2_y);
        this.closePath();
        this.stroke();
    }
}



function compute_angle(x_1, y_1, x_2, y_2, anchor){
    var angle = 0;
    
    if (x_1 == x_2){
        angle = (y_2 > y_1) * Math.PI / 2;
    }
    else if (x_2 > x_1){
        angle = (Math.atan((y_2 - y_1) / (x_2 - x_1)) + Math.PI / 2) / 2;
    }
    else {
        angle = (Math.atan((y_2 - y_1) / (x_2 - x_1)) - Math.PI / 2) / 2;
    }
    
    switch (anchor){
        case 'left':
            angle += Math.PI / 4;
            break;
        case 'top':
            break;
        case 'right':
            angle -= Math.PI / 4;
            break;
        case 'bottom':
            angle -= Math.PI / 2;
            break;
    }
    if (angle < -Math.PI / 2) angle += Math.PI;
    if (angle > Math.PI / 2) angle -= Math.PI;
    return angle;
}



function draw(sync){
    if (typeof(qsdb_domain) === 'undefined' || qsdb_domain != true) return;
    elements.sort(function(a, b){
        return a.sort_order > b.sort_order;
    });
    
    if (typeof(sync) === "undefined"){
        var dc = Math.random();
        draw_code = dc;
        var dr = setInterval(function(dc){
            var c = document.getElementById("renderarea");
            var ctx = c.getContext("2d");
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            //draw elements visual elements
            for (var i = 0; i < elements.length; ++i){
                if (elements[i].visible && elements[i].include_preview) elements[i].draw(ctx);
            }
         
            clearInterval(dr);
        }, 1, dc);
    }
    else {
        var c = document.getElementById("renderarea");
        var ctx = c.getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        //draw elements visual elements
        for (var i = 0; i < elements.length; ++i){
            if (elements[i].visible && elements[i].include_preview) elements[i].draw(ctx);
        }
    }
    
}




function load_species_data(){
    
    // get species
    var xmlhttp_species = new XMLHttpRequest();
    xmlhttp_species.onreadystatechange = function() {
        if (xmlhttp_species.readyState == 4 && xmlhttp_species.status == 200) {
            supported_species = JSON.parse(xmlhttp_species.responseText);
        }
    }
    xmlhttp_species.open("GET", file_pathname + "scripts/get-species.py?request_all=true", false);
    xmlhttp_species.send();
}



function set_species_menu(reload, request_all){
    
    if (typeof request_all === 'undefined') request_all = true;
    if (typeof reload === 'undefined') reload = false;
    
    // get species
    var xmlhttp_species = new XMLHttpRequest();
    xmlhttp_species.onreadystatechange = function() {
        if (xmlhttp_species.readyState == 4 && xmlhttp_species.status == 200) {
            supported_species = JSON.parse(xmlhttp_species.responseText);
            
            
            var ss_table = document.getElementById("select_species_table");
            ss_table.innerHTML = "";
            var species_counter = 0;
            
            var sorted_species = [];
            for (var ncbi in supported_species) sorted_species.push([supported_species[ncbi], ncbi]);
            sorted_species.sort(function(a, b){
                return a[0] > b[0];
            });

            selected_menu_dict = {};
            
            
            for (var ncbi of sorted_species){
                var dom_species_tr = document.createElement("tr");
                ss_table.appendChild(dom_species_tr);
                
                var dom_species_td = document.createElement("td");
                dom_species_tr.appendChild(dom_species_td);
                
                var toks = ncbi[1].split("|");
                var host = toks.length > 1 ? toks[0] : "";
                var species_id = toks.length > 1 ? toks[1] : toks[0];
                selected_menu_dict[host + "|" + species_id] = dom_species_td;
                /*
                dom_species_td.setAttribute("onclick", "var species_menu = document.getElementById('select_species_table'); \
                    for (var child of species_menu.children){ \
                        child.children[0].className = 'select_menu_cell'; \
                    } \
                    this.className = 'selected_menu_cell'; \
                    last_opened_menu = ''; document.getElementById('select_species').style.display = 'none'; new_host = '" + host + "'; new_species = '" + species_id + "'; load_data();");   
                */
                dom_species_td.setAttribute("onclick", "last_opened_menu = ''; document.getElementById('select_species').style.display = 'none'; new_host = '" + host + "'; new_species = '" + species_id + "'; load_data();");
                dom_species_td.innerHTML = ncbi[0];
                dom_species_td.setAttribute("type", "radio");
                dom_species_td.setAttribute("value", ncbi[1]);
                dom_species_td.setAttribute("name", "species");
                dom_species_td.setAttribute("id", "species_" + ncbi[1]);
                dom_species_td.setAttribute("class", "select_menu_cell");
                
                if (reload){
                    if (current_species == ncbi[1]){
                        dom_species_td.setAttribute("class", "selected_menu_cell");
                    }
                }
                else {
                    if (species_counter == 0) {
                        new_species = ncbi[1];
                        new_host = host;
                        dom_species_td.setAttribute("class", "selected_menu_cell");
                    }
                }
                ++species_counter;
            }
            
        }
    }
    xmlhttp_species.open("GET", file_pathname + "scripts/get-species.py" + (request_all ? "?request_all=true" : ""), false);
    xmlhttp_species.send();
    
}



function set_pathway_menu(){
    if (Object.keys(pathways).length === 0 || Object.keys(pathway_groups).length === 0) return;
    
    var sorted_groups = [];
    for (var pg_id in pathway_groups) sorted_groups.push([pathway_groups[pg_id][3], pg_id]);
    sorted_groups.sort(function(a, b){
        return parseInt(a) <= parseInt(b);
    });
    
    
    // menu for metabolic pathways
    document.getElementById("select_metabolic_pathway").innerHTML = "";
    var metabolic_pathway_menu = document.createElement("table");
    document.getElementById("select_metabolic_pathway").appendChild(metabolic_pathway_menu);
    metabolic_pathway_menu.setAttribute("id", "metabolic_pathway_menu");
    var select_pg = 0;
    for (var row of sorted_groups){
        var pg_id = row[1];
        var pm_tr = document.createElement("tr");
        metabolic_pathway_menu.appendChild(pm_tr);
        pm_tr.setAttribute("id", "pg_" + pg_id);
        
        var pm_td = document.createElement("td");
        pm_tr.appendChild(pm_td);
        pm_td.setAttribute("class", "select_menu_cell");
        pm_td.setAttribute("onclick", "var pw_menu = document.getElementById('metabolic_pathway_menu'); \
            for (var child of pw_menu.children){ \
                if (child.id.startsWith('pg_" + pg_id + "_pw_')) { \
                    if (child.style.display == 'none') child.style.display = 'table-row'; \
                    else child.style.display = 'none'; \
                } \
            }");
        pm_td.innerHTML = "<b>" + pathway_groups[pg_id][1] + "</b>";
        
        var sorted_pathways = [];
        for (pathway_id of pathway_groups[pg_id][2]){
            if (pathway_id in pathways && pathways[pathway_id][1] != "1"){
                var pw_name = replaceAll(replaceAll(pathways[pathway_id][0], "-\\n", ""), "\\n", " ");
                sorted_pathways.push([pathway_id, pw_name]);
            }
        }
        sorted_pathways.sort(function(a, b) {
            var l_a = a[1].length;
            var l_b = b[1].length;
            
            for (var i = 0; i < Math.min(l_a, l_b); ++i){
                if (a[1].charCodeAt(i) < b[1].charCodeAt(i)) return -1;
                else if (a[1].charCodeAt(i) > b[1].charCodeAt(i)) return 1;
            }
            if (l_a < l_b) return -1;
            else if (l_a > l_b) return 1;
            return 0;
        });
        
        for (var i = 0; i < sorted_pathways.length; ++i){
            var selected =  "select_menu_cell";
            if (sorted_pathways[i][0] == current_pathway){
                selected = "selected_menu_cell";
                select_pg = pm_td;
            }
            
            var pm_pw_tr = document.createElement("tr");
            metabolic_pathway_menu.appendChild(pm_pw_tr);
            pm_pw_tr.setAttribute("id", "pg_" + pg_id + "_pw_" + sorted_pathways[i][0]);
            pm_pw_tr.setAttribute("style", "display: none;");
        
            var pm_pw_td = document.createElement("td");
            pm_pw_tr.appendChild(pm_pw_td);
            pm_pw_td.setAttribute("class", selected);
            pm_pw_td.setAttribute("onclick", "change_pathway(" + sorted_pathways[i][0] + ");");
            var pathway_name = sorted_pathways[i][1];
            //var separator = "&nbsp;&nbsp;" + (i == sorted_pathways.length - 1 ? "???" : "???") + "????????????&nbsp;&nbsp;";
            var separator = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
            pathway_name = separator + replaceAll(pathway_name, "-\\n", "");
            
            
            
            
            pathway_name = replaceAll(pathway_name, "\n", " ");
            pm_pw_td.innerHTML = pathway_name;
        }
    }
    
    document.getElementById("select_metabolic_pathway").appendChild(metabolic_pathway_menu);
    select_pg.className = 'selected_menu_cell';
    
    
    
    // menu for signaling pathways
    document.getElementById("select_signaling_pathway").innerHTML = "";
    var signaling_pathway_menu = document.createElement("table");
    document.getElementById("select_signaling_pathway").appendChild(signaling_pathway_menu);
    signaling_pathway_menu.setAttribute("id", "signaling_pathway_menu");
    
    
    var sorted_pathways = [];
    for (pathway_id in pathways){
        if (pathways[pathway_id][1] == "1"){
            var pw_name = replaceAll(replaceAll(pathways[pathway_id][0], "-\n", ""), "\n", " ");
            sorted_pathways.push([pathway_id, pw_name]);
        }
    }
    sorted_pathways.sort(function(a, b) {
        var l_a = a[1].length;
        var l_b = b[1].length;
        
        for (var i = 0; i < Math.min(l_a, l_b); ++i){
            if (a[1].charCodeAt(i) < b[1].charCodeAt(i)) return -1;
            else if (a[1].charCodeAt(i) > b[1].charCodeAt(i)) return 1;
        }
        if (l_a < l_b) return -1;
        else if (l_a > l_b) return 1;
        return 0;
    });
        
    for (var sorted_pathway of sorted_pathways){
        var selected =  "select_menu_cell";
        if (sorted_pathway[0] == current_pathway){
            selected = "selected_menu_cell";
            select_pg = pm_td;
        }
        
        var pm_pw_tr = document.createElement("tr");
        signaling_pathway_menu.appendChild(pm_pw_tr);
        pm_pw_tr.setAttribute("id", "sig_pw_" + sorted_pathway[0]);
    
        var pm_pw_td = document.createElement("td");
        pm_pw_tr.appendChild(pm_pw_td);
        pm_pw_td.setAttribute("class", selected);
        pm_pw_td.setAttribute("onclick", "change_pathway(" + sorted_pathway[0] + ");");
        var pathway_name = sorted_pathway[1];
        pathway_name = replaceAll(pathway_name, "-\\n", "");
        pathway_name = replaceAll(pathway_name, "\n", " ");
        pm_pw_td.innerHTML = pathway_name;
    }
    
    document.getElementById("select_signaling_pathway").appendChild(signaling_pathway_menu);
    
}









function visual_element() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.name = "";
    this.include_preview = true;
    this.mouse_click = function(mouse, key){return -1;};
    this.mouse_dbl_click = function(mouse, key){return -1;};
    this.mouse_down = function(mouse, key){return -1;};
    this.mouse_down_move = function(mouse, key){return false;};
    this.mouse_up = function(mouse){return false;};
    this.is_mouse_over = function(mouse){return false;};
    this.move = function(x, y){return false;};
    this.scale = function(x, y, s){return false;};
    this.draw = function(){};
    this.highlight = false;
    this.tipp = false;
    this.visible = true;
    this.sort_order = 0;
}


function search_pattern(text, len_p, accept, masks, id1, id2){
    var results = [];
    text = text.replace(String.fromCharCode(13) + String.fromCharCode(10), " ");
    text = text.replace(String.fromCharCode(10), " ");
    text = text.replace(String.fromCharCode(13), " ");
    text = text.replace("\n", "");
    text = text.replace("\\n", "");
    for (var i = 0, states = 0; i < text.length; ++i){ // search name
        states = ((states << 1) | 1) & masks[text.charCodeAt(i)];
        if (accept & states) results.push([text, i - len_p + 1, id1, id2]);
    }
    return results;
}


function occurences(text, char){
    var cnt = 0;
    for (var i = 0; i < text.length; ++i){
        if (text[i] == char){
            ++cnt;
        }
    }
    return cnt;
}


function Spectrum(data){
    this.id = data['i'];
    this.mass = data['m'];
    this.charge = data['c'];
    this.mod_sequence = data['s'];
    this.ppm = data['p'];
    this.confidence = data['q'];
    this.filter_valid = false;
    this.user_selected = true;
    this.tissues = data['t'];
    this.occ_M = 0;
    this.occ_m = 0;
    this.occ_C = 0;
    this.occ_c = 0;
    
    this.prepare_modification = function(){
        if (typeof this.mod_sequence === 'undefined') return;
        while (this.mod_sequence.indexOf("M[+16.0]") != -1){
            this.mod_sequence = this.mod_sequence.replace("M[+16.0]", "m");
        }
        while (this.mod_sequence.indexOf("C[+57.0]") != -1){
            this.mod_sequence = this.mod_sequence.replace("C[+57.0]", "c");
        }
        this.occ_M = occurences(this.mod_sequence, 'M');
        this.occ_m = occurences(this.mod_sequence, 'm');
        this.occ_C = occurences(this.mod_sequence, 'C');
        this.occ_c = occurences(this.mod_sequence, 'c');
    }
    this.prepare_modification();        
    
    
    this.filtering = function(){
        
        this.filter_valid = true;
        if (typeof this.mod_sequence === 'undefined'){
            this.filter_valid = false;
            return;
        }
        
        if (this.mod_sequence.indexOf("[") == -1){
            // test for oxydation of M
            if (filter_parameters["oxy_m_off"] && this.occ_m > 0){
                this.filter_valid = false;
            }
            else if (filter_parameters["oxy_m_fix"] && this.occ_M > 0) {
                this.filter_valid = false;
            }
            
            // test for carbamidomethylation of C
            if (filter_parameters["carba_c_off"] && this.occ_c > 0){
                this.filter_valid = false;
            }
            else if (filter_parameters["carba_c_fix"] && this.occ_C > 0) {
                this.filter_valid = false;
            }
        }
        else {
            this.filter_valid = false;
        }
        
        
        
        this.filter_valid &= filter_parameters["validation_top_n"] || (filter_parameters["validation_prm"] && ((this.confidence & 1) == 1)) || (filter_parameters["validation_is"] && ((this.confidence & 2) == 2));
        
        
        this.filter_valid &= filter_parameters["min_precursor_charge"] <= this.charge && this.charge <= filter_parameters["max_precursor_charge"];
        
        
        
        
        if (this.filter_valid && Object.keys(this.tissues).length > 0){
            var tissue_set = new Set(Object.keys(this.tissues).map(Number));
            for (var tissue_key in tissues){
                if (!filter_parameters["tissue_" + tissues[tissue_key][1].toLowerCase()] && tissue_set.has(tissue_name_to_id[tissues[tissue_key][1]])) tissue_set.delete(tissue_name_to_id[tissues[tissue_key][1]]);
            }/*
            if (!filter_parameters["tissue_liver"] && tissue_set.has(tissue_name_to_id["Liver"])) tissue_set.delete(tissue_name_to_id["Liver"]);
            if (!filter_parameters["tissue_kidney"] && tissue_set.has(tissue_name_to_id["Kidney"])) tissue_set.delete(tissue_name_to_id["Kidney"]);
            if (!filter_parameters["tissue_spleen"] && tissue_set.has(tissue_name_to_id["Spleen"])) tissue_set.delete(tissue_name_to_id["Spleen"]);
            if (!filter_parameters["tissue_heart"] && tissue_set.has(tissue_name_to_id["Heart"])) tissue_set.delete(tissue_name_to_id["Heart"]);
            if (!filter_parameters["tissue_blood"] && tissue_set.has(tissue_name_to_id["Platelet"])) tissue_set.delete(tissue_name_to_id["Platelet"]);
            if (!filter_parameters["tissue_fat"] && tissue_set.has(tissue_name_to_id["Fat"])) tissue_set.delete(tissue_name_to_id["Fat"]);
            if (!filter_parameters["tissue_lung"] && tissue_set.has(tissue_name_to_id["Lung"])) tissue_set.delete(tissue_name_to_id["Lung"]);
            if (!filter_parameters["tissue_eye"] && tissue_set.has(tissue_name_to_id["Eye"])) tissue_set.delete(tissue_name_to_id["Eye"]);
            if (!filter_parameters["tissue_gut"] && tissue_set.has(tissue_name_to_id["Gut"])) tissue_set.delete(tissue_name_to_id["Gut"]);
            */
            this.filter_valid &= (tissue_set.size != 0);
        }
        
    }
    
    this.get_statistics = function(){
        return [1, this.filter_valid];
    }
}

function Peptide(data){
    this.peptide_seq = data['p'];
    this.start_pos = data['b'];
    this.spectra = [];
    this.confidence = 0;
    this.filter_valid = false;
    this.user_selected = true;
    this.tissues = {};
    
    for (var i = 0; i < data['s'].length; ++i){
        var new_spec = new Spectrum(data['s'][i]);
        this.confidence |= new_spec.confidence;
        this.spectra.push(new_spec);
        for (t in new_spec.tissues){
            if (!(t in this.tissues)) this.tissues[t] = 0;
            this.tissues[t] += new_spec.tissues[t];
        }
    }
    
    this.search = function(len_p, accept, masks, node_id, prot_id){
        if (typeof this.peptide_seq === 'undefined') return [];
        
        var results = search_pattern(this.peptide_seq, len_p, accept, masks, node_id, prot_id);
        return results;
    }
    
    this.filtering = function(){
        this.filter_valid = false;
        if (typeof this.peptide_seq === 'undefined') return;
        
        for (var i = 0; i < this.spectra.length; ++i){
            this.spectra[i].filtering();
            this.filter_valid |= this.spectra[i].filter_valid;
        }
        this.filter_valid &= filter_parameters["min_peptide_length"] <= this.peptide_seq.length && this.peptide_seq.length <= filter_parameters["max_peptide_length"];
    }
    
    this.get_statistics = function(){
        var num_spectra = 0;
        var valid_spectra = 0;
        for (var i = 0; i < this.spectra.length; ++i){
            var tmp = this.spectra[i].get_statistics();
            num_spectra += tmp[0];
            valid_spectra += tmp[1];
        }
        return [1, this.filter_valid, num_spectra, valid_spectra];
    }
}




function Protein(data){
    this.id = ('i' in data) ? data['i'] : 0;
    
    
    
    this.filtering = function(){
        
        this.filter_valid = false;
        for (var i = 0; i < this.peptides.length; ++i){
            this.peptides[i].filtering();
            this.filter_valid |= this.peptides[i].filter_valid;
        }
        this.filter_valid &= filter_parameters["enable_unreviewed"] || (this.unreviewed != 1);
        
        
        if (this.filter_valid){
            this.fillStyle_rect = "white";
            this.fillStyle_text = text_color;
        }
        else {
            this.fillStyle_rect = disabled_fill_color;
            this.fillStyle_text = disabled_text_color;
        }
    }
    
    
    
    this.update = function(data){
        this.name = ('n' in data) ? data['n'] : "";
        this.definition = ('d' in data) ? data['d'] : "";
        this.kegg_link = ('k' in data) ? data['k'] : "";
        this.accession = ('a' in data) ? data['a'] : "";
        this.ec_number = ('e' in data) ? data['e'] : "";
        this.mass = ('m' in data) ? data['m'] : "";
        this.unreviewed = ('u' in data) ? data['u'] : 0;
        this.prm = 0;
        this.is = 0; // is = internal standard
        this.sequence_length = ('l' in data) ? data['l'] : "";
        this.pI = ('pI' in data) ? data['pI'] : 0;
        this.peptides = [];
        this.filter_valid = false;
        this.containing_spectra = 0;
        this.fillStyle_rect = disabled_fill_color;
        this.fillStyle_text = disabled_text_color;
        this.user_selected = true;
        this.tissues = {};
        this.nsaf = {};
        
        if ('p' in data){
            for (var i = 0; i < data['p'].length; ++i){
                
                var new_pep = new Peptide(data['p'][i]);
                this.prm |= (new_pep.confidence & 1) == 1 ? 1 : 0;
                this.is |= (new_pep.confidence & 2) == 2 ? 1 : 0;
                this.peptides.push(new_pep);
                for (t in new_pep.tissues){
                    if (!(t in this.tissues)) this.tissues[t] = 0;
                    this.tissues[t] += new_pep.tissues[t];
                }        
                this.containing_spectra += this.peptides[i].spectra.length;
            }
        }
        
        if (this.containing_spectra){
            this.fillStyle_rect = "white";
            this.fillStyle_text = text_color;
        }
        this.filtering();
    }
    
    this.update(data);
    
    
    
    
    
    this.get_validation = function(){
        return (this.containing_spectra > 0) + 2 * (this.prm > 0) + 4 * (this.is > 0);
    }
    
    this.get_statistics = function(){
        var num_spectra = 0;
        var valid_spectra = 0;
        var num_peptides = 0;
        var valid_peptides = 0;
        for (var i = 0; i < this.peptides.length; ++i){
            var tmp = this.peptides[i].get_statistics();
            num_peptides += tmp[0];
            valid_peptides += tmp[1];
            num_spectra += tmp[2];
            valid_spectra += tmp[3];
        }
        return [1, this.filter_valid, num_peptides, valid_peptides, num_spectra, valid_spectra];
    }
    
    
    this.search = function(len_p, accept, masks, node_id){
        var results = [];
        
        for (var i = 0; i < this.peptides.length; ++i){
            var r = this.peptides[i].search(len_p, accept, masks, node_id, current_pathway);
            if (r.length) results = results.concat(r);
        }
        return results;
    }
    
    
    this.check_mouse_over_protein_name = function(x, y, line_number, num, mouse){
        var ctx = document.getElementById("renderarea").getContext("2d");
        ctx.font = (text_size * factor).toString() + "px Arial";
        y -= Math.floor((line_number - 1) * line_height * factor_h) - num * line_height * factor;
        var x_l = x + check_side_d;
        var x_r = x_l + ctx.measureText(this.name).width;
        var y_l = y - line_height * factor_h;
        var y_r = y + line_height * factor_h;
        if (x_l <= mouse.x && mouse.x <= x_r && y_l <= mouse.y && mouse.y <= y_r) return true;
        return false;
    }
    
    
    this.get_position = function(x, y, line_number, num){
        y -= (line_number - 1) * line_height * factor_h - num * line_height * factor;
        x += check_side_d;
        return [x, y];
    }
    
    
    this.draw = function(ctx, x, y) {
        var x_c = x + check_side_h;
        var y_c = y - check_side_h;
        ctx.lineWidth = 1;
        ctx.fillStyle = this.fillStyle_rect;
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.rect(x_c, y_c, check_side, check_side);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = this.fillStyle_text;
        var x_pos = x + (check_side_d + ctx.measureText(this.name).width) * 1.1;
        ctx.fillText(this.name, x + check_side_d, y + line_height * factor_h * 0.5);
        
        // draw hooklet
        if (this.id in basket){
            var x_check = x + check_side;
            var y_check = y;
            var x1 = x_check - check_side * 0.375;
            var y1 = y_check;
            var x2 = x_check - check_side * 0.125;
            var y2 = y_check + check_side * 0.375;
            var x3 = x_check + check_side * 0.375;
            var y3 = y_check - check_side * 0.375;
            ctx.lineWidth = factor * 3;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.stroke();
        }
        
        // draw validation semephore
        var radius = line_height * factor_h * 0.4;
        ctx.lineWidth = factor;
        ctx.strokeStyle = "black";
        if (this.containing_spectra > 0){
            ctx.beginPath();
            ctx.arc(x_pos + radius, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffbebe';
            ctx.fill();
            if (factor >= 0.5) ctx.stroke();
        }
        
        if (this.prm > 0){
            ctx.beginPath();
            ctx.arc(x_pos + 3.5 * radius, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = '#feff90';
            ctx.fill();
            if (factor >= 0.5) ctx.stroke();
        }
        
        if (this.is > 0){
            ctx.beginPath();
            ctx.arc(x_pos + 6 * radius, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = '#a0ff90';
            ctx.fill();
            if (factor >= 0.5) ctx.stroke();
        }
    };
    
    this.toggle_marked = function(){
        this.mark(!(this.id in basket));
    }
    
    this.mark = function(m){
        if (m && this.filter_valid){
            basket[this.id] = this;
        }
        else {
            if (this.id in basket) delete basket[this.id];
        }
        compute_statistics();
    }
    
    this.mouse_over_name = function(x, y, x_m, y_m, line_number, num){
        
    }
    
    this.mouse_over_checkbox = function(x, y, x_m, y_m, line_number, num){
        y -= Math.floor((line_number - 1) * line_height * factor_h) - num * line_height * factor;
        var check_side = check_len * factor;
        var l = x + check_side_h;
        var r = x + check_side * 1.5;
        var t = y - check_side_h;
        var b = y + check_side_h;
        if (l <= x_m && x_m <= r && t <= y_m && y_m <= b) return true;
        return false;
    }
}






function wrapText(text, x, y, maxWidth, lineHeight, ctx) {
    var lines = text.split("\n");
    y += (0.5 - (lines.length - 1)) * lineHeight * 0.5;
    for (var i = 0; i < lines.length; i++) {
        var words = lines[i].split(' ');
        var line = '';
        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = ctx.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }

        ctx.fillText(line, x, y);
        y += lineHeight;
    }
}


CanvasRenderingContext2D.prototype.draw_line = function (x1, y1, x2, y2) {
    this.beginPath();
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.closePath();
    this.stroke();
}



select_field.prototype = new visual_element();
select_field.prototype.constructor = select_field;

function select_field(){
    this.start_position = false;
    this.end_position = false;
    this.sort_order = 200;
    
    
    this.is_mouse_over = function(mouse){
        return false;
    }
    
    this.mouse_down = function(mouse, key){
        return false;
    }
    
    this.mouse_down_move = function(mouse, key){
        return false;
    }
    
    this.mouse_up = function(mouse){
        return false;
    }
    
    this.draw = function(ctx){
        if (this.visible){
            ctx.globalAlpha = .4;
            ctx.fillStyle = "black";
            ctx.fillRect(this.start_position.x, this.start_position.y, this.end_position.x - this.start_position.x, this.end_position.y - this.start_position.y);
            ctx.globalAlpha = 1;
        }
    }
}


membrane.prototype = new visual_element();
membrane.prototype.constructor = membrane;

function membrane(){
    this.length = 100;
    this.x = 500;
    this.y = 500;
    
    this.is_mouse_over = function(mouse){
        return false;
        //return (this.x <= mouse.x && mouse.x <= this.x + this.width && this.y <= mouse.y && mouse.y <= this.y + this.height);
    }
    
    this.mouse_down = function(mouse, key){
        return false;
        /*
        this.on_active = true;
        offsetX = mouse.x;
        offsetY = mouse.y;
        if (this.active_boundaries[0] <= mouse.x && mouse.x <= this.active_boundaries[0] + this.active_boundaries[2] && this.active_boundaries[1] <= mouse.y && mouse.y <= this.active_boundaries[1] + this.active_boundaries[3]){
            this.on_move = true;
            this.ctx.canvas.style.cursor = "all-scroll";
        }
        return this.on_active;
        */
    }
    
    this.move = function(shift_x, shift_y){
        //this.x += shift_x;
        //this.y += shift_y;
    }
    
    this.scale = function(res_x, res_y, scale){
        this.x = res_x + scale * (this.x - res_x);
        this.y = res_y + scale * (this.y - res_y);
    }
    
    this.mouse_down_move = function(mouse, key){
        return false;
        /*
        if (this.on_move){
            
            var shift_x = (mouse.x - offsetX) * this.scale_x;
            var shift_y = (mouse.y - offsetY) * this.scale_y;
            
            for (var i = 0; i < data.length; ++i){
                data[i].x -= shift_x;
                data[i].y -= shift_y;
            }
            for (var i = 0; i < edges.length; ++i){
                for (var j = 0; j < edges[i].point_list.length; ++j){
                    edges[i].point_list[j].x -= shift_x;
                    edges[i].point_list[j].y -= shift_y;
                }
            }
            infobox.x -= shift_x;
            infobox.y -= shift_y;
            null_x -= shift_x;
            null_y -= shift_y;
            boundaries[0] -= shift_x;
            boundaries[1] -= shift_y;
            this.compute_boundaries();
            offsetX = mouse.x;
            offsetY = mouse.y;
        }
        return this.on_active;
        */
    }
    
    this.mouse_up = function(mouse){
        /*
        this.on_active = false;
        this.on_move = false;
        this.ctx.canvas.style.cursor = "default";
        */
        return true;
    }
    
    this.draw = function(ctx){
        
        var r = 5;
        var lw = 2;
        var o_y = 36;
        var len_s = 3;
        
        ctx.fillStyle = metabolite_fill_color;
        ctx.strokeStyle = metabolite_stroke_color;
        ctx.lineWidth = lw * factor;
        
        var tmp_x = this.x;
        for (var i = 0; i < this.length; ++i){
            ctx.beginPath();
            ctx.arc(tmp_x, this.y, r * factor, 0, 2 * Math.PI);
            ctx.closePath();
            //this.ctx.fill();
            ctx.stroke();
            
            
            ctx.beginPath();
            ctx.arc(tmp_x, this.y + o_y * factor, r * factor, 0, 2 * Math.PI);
            ctx.closePath();
            //this.ctx.fill();
            ctx.stroke();
            tmp_x += (2 * r + lw) * factor;
        }
        
        tmp_x = this.x;
        var tmp_y = this.y;
        ctx.lineWidth = (lw - 1) * factor;
        for (var i = 0; i < this.length; ++i){
            var ttx = tmp_x + r * factor / 4;
            var tty = this.y + r * factor;
            for (var j = 0; j < 4; ++j){
                ctx.beginPath();
                ctx.moveTo(ttx, tty);
                ttx += ((j % 2 == 0) ? len_s : -len_s) * factor;
                tty += len_s * factor;
                ctx.lineTo(ttx, tty);
                ctx.closePath();
                ctx.stroke();
            }
            
            ttx = tmp_x - r * factor / 2;
            tty = this.y + r * factor;
            for (var j = 0; j < 4; ++j){
                ctx.beginPath();
                ctx.moveTo(ttx, tty);
                ttx += ((j % 2 == 0) ? len_s : -len_s) * factor;
                tty += len_s * factor;
                ctx.lineTo(ttx, tty);
                ctx.closePath();
                ctx.stroke();
            }
            
            ttx = tmp_x + r * factor / 4;
            tty = this.y - (r - o_y) * factor;
            for (var j = 0; j < 4; ++j){
                ctx.beginPath();
                ctx.moveTo(ttx, tty);
                ttx += ((j % 2 == 0) ? len_s : -len_s) * factor;
                tty -= len_s * factor;
                ctx.lineTo(ttx, tty);
                ctx.closePath();
                ctx.stroke();
            }
            
            ttx = tmp_x - r * factor / 2;
            tty = this.y - (r - o_y) * factor;
            for (var j = 0; j < 4; ++j){
                ctx.beginPath();
                ctx.moveTo(ttx, tty);
                ttx += ((j % 2 == 0) ? len_s : -len_s) * factor;
                tty -= len_s * factor;
                ctx.lineTo(ttx, tty);
                ctx.closePath();
                ctx.stroke();
            }
            
            tmp_x += (2 * r + lw) * factor;
        }
    }
    
}


preview.prototype = new visual_element();
preview.prototype.constructor = preview;

function preview(){
    this.preview_image = 0;
    this.preview_image_original = 0;
    this.on_active = false;
    this.on_move = false;
    this.active_boundaries = [0, 0, 0, 0];
    this.scale_x = 1;
    this.scale_y = 1;
    this.sort_order = 500;
    this.visible = true;
    
    this.snapshot = function(){
        var ctx = document.getElementById("renderarea").getContext("2d");
        var x_min = 1e100, x_max = -1e100;
        var y_min = 1e100, y_max = -1e100;
        this.visible = false;
        
        for (var element of elements){
            if (element instanceof node && element.include_preview){
                this.visible = true;
                x_min = Math.min(x_min, element.x - (element.width >> 1));
                x_max = Math.max(x_max, element.x + (element.width >> 1));
                y_min = Math.min(y_min, element.y - (element.height >> 1));
                y_max = Math.max(y_max, element.y + (element.height >> 1));
            }
        }
        
        if (!this.visible) return;
        x_min -= 5;
        x_max += 5;
        y_min -= 5;
        y_max += 5;
        boundaries[0] = x_min;
        boundaries[1] = y_min;
        boundaries[2] = x_max - x_min;
        boundaries[3] = y_max - y_min;
        
        var image_data;
        
        try { 
            image_data = ctx.getImageData(x_min, y_min, (x_max - x_min), (y_max - y_min));
        } catch (e) {
            console.log(e);
            return;
        }
        
        this.width = x_max - x_min;
        this.height = y_max - y_min;
        this.x = 0;
        this.y = window.innerHeight - this.height;
        //this.preview_image.crossOrigin = "anonymous";
        this.preview_image = ctx.createImageData(this.width, this.height);
        this.preview_image_original = ctx.createImageData(this.width, this.height);
        for (var i = 0; i < this.preview_image.data.length; i += 4){
            this.preview_image.data[i] = image_data.data[i];
            this.preview_image.data[i + 1] = image_data.data[i + 1];
            this.preview_image.data[i + 2] = image_data.data[i + 2];
            this.preview_image.data[i + 3] = image_data.data[i + 3];
        }
    }
    
    this.is_mouse_over = function(mouse){
        return (this.x <= mouse.x && mouse.x <= this.x + this.width && this.y <= mouse.y && mouse.y <= this.y + this.height);
    }
    
    this.mouse_down = function(mouse, key){
        this.on_active = true;
        offsetX = mouse.x;
        offsetY = mouse.y;
        if (this.active_boundaries[0] <= mouse.x && mouse.x <= this.active_boundaries[0] + this.active_boundaries[2] && this.active_boundaries[1] <= mouse.y && mouse.y <= this.active_boundaries[1] + this.active_boundaries[3]){
            this.on_move = true;
            document.getElementById("renderarea").getContext("2d").canvas.style.cursor = "all-scroll";
        }
        return this.on_active;
    }
    
    this.mouse_down_move = function(mouse, key){
        if (this.on_move){
            
            var shift_x = -(mouse.x - offsetX) * this.scale_x;
            var shift_y = -(mouse.y - offsetY) * this.scale_y;
            
            for (var i = 0; i < elements.length; ++i){
                elements[i].move(shift_x, shift_y);
            }
            null_x += shift_x;
            null_y += shift_y;
            boundaries[0] += shift_x;
            boundaries[1] += shift_y;
            this.compute_boundaries();
            offsetX = mouse.x;
            offsetY = mouse.y;
            update_browser_link();
        }
        return this.on_active;
    }
    
    this.mouse_up = function(mouse){
        this.on_active = false;
        this.on_move = false;
        document.getElementById("renderarea").getContext("2d").canvas.style.cursor = "default";
        return true;
    }
    
    
    this.compute_boundaries = function(){
        var nav_height = document.getElementById("navigation").getBoundingClientRect().height;
        var active_x_min = Math.max(boundaries[0], 0);
        var active_x_max = Math.min(boundaries[0] + boundaries[2], window.innerWidth);
        var active_y_min = Math.max(boundaries[1], nav_height);
        var active_y_max = Math.min(boundaries[1] + boundaries[3], window.innerHeight);
        
        this.scale_x = boundaries[2] / this.width;
        this.scale_y = boundaries[3] / this.height;
        
        this.active_boundaries[0] = this.x + (active_x_min - boundaries[0]) / boundaries[2] * this.width;
        this.active_boundaries[1] = this.y + (active_y_min - boundaries[1]) / boundaries[3] * this.height;
        this.active_boundaries[2] = Math.max(0, this.width * (active_x_max - active_x_min) / boundaries[2]);
        this.active_boundaries[3] = Math.max(0, this.height * (active_y_max - active_y_min) / boundaries[3]);
    }
    
    this.draw = function(ctx){
        if (this.preview_image){
            
            ctx.putImageData(this.preview_image, this.x, this.y);
            ctx.strokeStyle = "#777777";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
            
            this.compute_boundaries();
            
            ctx.globalAlpha = .4;
            ctx.fillStyle = "black";
            ctx.fillRect(this.active_boundaries[0], this.active_boundaries[1], this.active_boundaries[2], this.active_boundaries[3]);
            ctx.globalAlpha = 1.;
            
        }
    }
}


expand_collapse.prototype = new visual_element();
expand_collapse.prototype.constructor = expand_collapse;

function expand_collapse(){
    this.dir = 1;
    this.name = this.dir ? "expand" : "collapse";
    this.img = document.getElementById(this.name);
    var ratio = 0.02 * window.innerWidth / this.img.width;
    this.width = this.img.width * ratio;
    this.height = this.img.height * ratio;
    this.x = window.innerWidth - this.width * 1.3;
    var nav_height = document.getElementById("navigation").getBoundingClientRect().height;
    this.y = nav_height + this.height * 0.3;
    this.sort_order = 1000;
    
    this.mouse_click = function(mouse, key){
        this.toggle();
    }
    
    this.expand = function(){
        expand_statistics();
        this.dir = 0;
        this.name = "collapse";
        this.img = document.getElementById(this.name);
    }
    
    
    this.collapse = function(){
        this.dir = 1;
        this.name = "expand";
        this.img = document.getElementById(this.name);
        hide_statistics();
    }
    
    
    this.toggle = function(){
        if (this.dir == 1) this.expand();
        else this.collapse();
    }
    
    
    this.is_mouse_over = function(mouse){
        if (!this.visible) return false;
        return (this.x <= mouse.x && mouse.x <= this.x + this.width && this.y <= mouse.y && mouse.y <= this.y + this.height);
    }
    
    this.draw = function(ctx){
        this.x = ctx.canvas.width - this.width * 1.3;
        if (this.visible){
            ctx.globalAlpha = 0.3 + 0.7 * this.highlight;
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
            ctx.globalAlpha = 1.;
        }
    }
    
}



zoom_sign.prototype = new visual_element();
zoom_sign.prototype.constructor = zoom_sign;

function zoom_sign(dir){
    this.dir = dir;
    this.name = dir ? "zoom_in" : "zoom_out";
    this.img = document.getElementById(this.name);
    var ratio = 0.02 * window.innerWidth / this.img.width;
    this.width = this.img.width * ratio;
    this.height = this.img.height * ratio;
    this.x = window.innerWidth - this.width * 1.3;
    this.y = window.innerHeight - this.height * (1.3 + dir);
    this.sort_order = 1000;
    
    this.mouse_click = function(mouse, key){
        zoom_in_out(1 - this.dir, 0);
        draw();
    }
    
    this.is_mouse_over = function(mouse){
        return (this.x <= mouse.x && mouse.x <= this.x + this.width && this.y <= mouse.y && mouse.y <= this.y + this.height);
    }
    
    this.draw = function(ctx){
        this.x = ctx.canvas.width - this.width * 1.3;
        this.y = window.innerHeight - this.height * (1.3 + this.dir);
        ctx.globalAlpha = 0.3 + 0.7 * this.highlight;
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        ctx.globalAlpha = 1.;
    }
}



Infobox.prototype = new visual_element();
Infobox.prototype.constructor = Infobox;

function Infobox(ctx){
    this.node_id = -1;
    this.protein_id = -1;
    this.name = "infobox";
    this.visible = false;
    this.sort_order = 120;
    
    this.create = function(x, y, node_id, protein_id){
        var ctx = document.getElementById("renderarea").getContext("2d");
        this.x = x;
        this.y = y;
        this.node_id = node_id;
        this.protein_id = protein_id;
        if (data[node_id].type == "metabolite"){
            this.width = data[this.node_id].img.width + 40;
            this.height = data[this.node_id].img.height + 60;
            
            var with_lmid = data[this.node_id].lm_id.length > 0;
            
            ctx.font = "bold " + line_height.toString() + "px Arial";
            this.width = Math.max(this.width, ctx.measureText(data[this.node_id].name).width + 40);
            this.height += (3 + (with_lmid ? 1 : 0)) * line_height + 20;
            
            ctx.font = "bold " + (line_height - 5).toString() + "px Arial";
            this.width = Math.max(this.width, ctx.measureText("Formula:  " + data[this.node_id].formula).width + 40);
            this.width = Math.max(this.width, ctx.measureText("Exact Mass / Da: " + data[this.node_id].exact_mass).width + 40);
            this.width = Math.max(this.width, ctx.measureText("C number: " + data[this.node_id].c_number).width + 40);
            if (with_lmid) this.width = Math.max(this.width, ctx.measureText("LM-ID: " + data[this.node_id].lm_id).width + 40);
        }
        else {
            this.width = 40;
            this.height = 40;
            this.height += 8 * line_height + 20;
            ctx.font = "bold " + (line_height - 5).toString() + "px Arial";
            var prot = protein_dictionary[data[this.node_id].proteins[this.protein_id]];
            this.width = Math.max(this.width, ctx.measureText("Definition: " + prot.definition).width + 40);
            this.width = Math.max(this.width, ctx.measureText("Uniprot accession: " + prot.accession).width + 40);
            this.width = Math.max(this.width, ctx.measureText("EC number: " + prot.ec_number).width + 40);
            this.width = Math.max(this.width, ctx.measureText("Mass / Da: " + prot.mass).width + 40);
        }
    }

    this.is_mouse_over = function(mouse){
        if (!this.visible) return false;
        var x_l = this.x - (this.width + infobox_offset_x);
        var x_r = this.x - infobox_offset_x;
        var y_l = this.y - this.height * 0.5;
        var y_r = this.y + this.height * 0.5;
        return (x_l <= mouse.x && mouse.x <= x_r && y_l <= mouse.y && mouse.y <= y_r);
    }
    
    this.mouse_click = function(mouse, key){
    }
    
    
    
    this.scale = function(res_x, res_y, scale){
        this.x = res_x + scale * (this.x - res_x);
        this.y = res_y + scale * (this.y - res_y);
    }

    this.draw = function(ctx){
        if (!this.visible) return;
        var rect_curve = round_rect_radius;
        
        ctx.fillStyle = infobox_fill_color;
        ctx.strokeStyle = infobox_stroke_color;
        ctx.lineWidth = infobox_stroke_width;
        
        var offset_x = this.width + infobox_offset_x;
        var offset_y = this.height * 0.5;
        ctx.beginPath();
        ctx.moveTo(this.x - offset_x + rect_curve, this.y - offset_y);
        ctx.lineTo(this.x - offset_x + this.width - rect_curve, this.y - offset_y);
        ctx.quadraticCurveTo(this.x - offset_x + this.width, this.y - offset_y, this.x - offset_x + this.width, this.y - offset_y + rect_curve);
        
        
        ctx.lineTo(this.x - offset_x + this.width, this.y - infobox_offset_x);
        ctx.lineTo(this.x - offset_x + this.width + infobox_offset_x, this.y);
        ctx.lineTo(this.x - offset_x + this.width, this.y + infobox_offset_x);
        
        ctx.lineTo(this.x - offset_x + this.width, this.y - offset_y + this.height - rect_curve);
        ctx.quadraticCurveTo(this.x - offset_x + this.width, this.y - offset_y + this.height, this.x - offset_x + this.width - rect_curve, this.y - offset_y + this.height);
        ctx.lineTo(this.x - offset_x + rect_curve, this.y - offset_y + this.height);
        ctx.quadraticCurveTo(this.x - offset_x, this.y - offset_y + this.height, this.x - offset_x, this.y - offset_y + this.height - rect_curve);
        ctx.lineTo(this.x - offset_x, this.y - offset_y + rect_curve);
        ctx.quadraticCurveTo(this.x - offset_x, this.y - offset_y, this.x - offset_x + rect_curve, this.y - offset_y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        
        if (data[this.node_id].type == "metabolite"){
            var with_lmid = data[this.node_id].lm_id.length > 0;
            
            var html_content = "<div style=\"font-family: arial;\"><b>" + data[this.node_id].name + "</b>";
            html_content += "<hr>";
            html_content += "<div style=\"font-size: " + (line_height - 5) + "px;\"><b>Formula:</b> " + data[this.node_id].formula + "</div>";
            html_content += "<div style=\"font-size: " + (line_height - 5) + "px;\"><b>Exact mass / Da:</b> " + data[this.node_id].exact_mass + "</div>";
            var c_number = data[this.node_id].c_number;
            html_content += "<div style=\"font-size: " + (line_height - 5) + "px;\"><b>C number:</b> <a href='http://www.genome.jp/dbget-bin/www_bget?" + c_number + "' target=\"blank\">" + data[this.node_id].c_number + "</a></div>";
            var lm_id = data[this.node_id].lm_id;
            if (with_lmid) html_content += "<div style=\"font-size: " + (line_height - 5) + "px;\"><b>LM-ID:</b> <a href='https://www.lipidmaps.org/data/LMSDRecord.php?LMID=" + lm_id + "' target=\"blank\">" + data[this.node_id].lm_id + "</a></div>";
            html_content += "<br>";
            //if (data[this.node_id].foreign_id != -1) html_content += "<img src='" + file_pathname + "images/metabolites/C" + data[this.node_id].foreign_id + ".png'>";
            if (data[this.node_id].foreign_id != -1) html_content += "<img src='data:image/jpeg;base64," + data[this.node_id].image + "'>";
            
            html_content += "</div>";
            
            
            document.getElementById("infobox_html_background").style.display = "inline";
            
            var obj = document.getElementById("infobox_html");
            obj.innerHTML = html_content;
            obj.style.display = "inline";
            obj.style.left = (this.x - offset_x).toString() + "px";
            obj.style.top = (this.y - offset_y).toString() + "px";
        }
        else if (data[this.node_id].type == "protein"){
            var node_obj = protein_dictionary[data[this.node_id].proteins[this.protein_id]];
            
            var coverage_list = [];
            for(var j = 0; j < node_obj.peptides.length; ++j){
                if (!node_obj.peptides[j].filter_valid) continue;
                var st = node_obj.peptides[j].start_pos;
                var en = st + node_obj.peptides[j].peptide_seq.length;
                
                var insert = true;
                for (var k = 0; k < coverage_list.length; ++k){
                    var range = coverage_list[k];
                    if ((range[0] <= st && st < range[1]) ||(range[0] <= en && en < range[1])){
                        range[0] = Math.min(range[0], st);
                        range[1] = Math.max(range[1], en);
                        insert = false;
                    }
                }
                if (insert) coverage_list.push([st, en]);
                
                coverage_list.sort();
                for (var k = 0; k < coverage_list.length - 1; ++k){
                    var r1 = coverage_list[k];
                    var r2 = coverage_list[k + 1];
                    if ((r1[0] <= r2[0] && r2[0] < r1[1]) ||(r1[0] <= r2[1] && r2[1] < r1[1])){
                        r1[0] = Math.min(r1[0], r2[0]);
                        r1[1] = Math.max(r1[1], r2[1]);
                        coverage_list.splice(k + 1, 1);
                        --k;
                    }
                }
            }
            
            var coverage = 0;
            for (var k = 0; k < coverage_list.length; ++k){
                coverage += coverage_list[k][1] - coverage_list[k][0];
            }
            coverage *= 100 / node_obj.sequence_length;
            
            var html_content = "<div style=\"font-family: arial;\"><b>" + node_obj.name + "</b>";
            html_content += "<hr>";
            html_content += "<div style=\"font-size: " + (line_height - 5) + "px; margin: 2px;\"><b>Definition:</b> " + node_obj.definition + "</div>";
            html_content += "<div style=\"font-size: " + (line_height - 5) + "px; margin: 2px;\"><b>Uniprot accession:</b> <a href=\"http://www.uniprot.org/uniprot/" + node_obj.accession + "\" target=\"blank\">" + node_obj.accession + "</a></div>";
            
            html_content += "<div style=\"font-size: " + (line_height - 5) + "px; margin: 2px;\"><b>Kegg:</b> <a href=\"http://www.genome.jp/dbget-bin/www_bget?" + node_obj.kegg_link + "\" target=\"blank\">" + node_obj.kegg_link + "</a></div>";
            
            html_content += "<div style=\"font-size: " + (line_height - 5) + "px; margin: 2px;\"><b>EC number:</b> <a href=\"http://www.genome.jp/dbget-bin/www_bget?ec:" + node_obj.ec_number + "\" target=\"blank\">" + node_obj.ec_number + "</a></div>";
            html_content += "<div style=\"font-size: " + (line_height - 5) + "px; margin: 2px;\"><b>Mass / Da:</b> " + node_obj.mass + "</div>";
            html_content += "<div style=\"font-size: " + (line_height - 5) + "px; margin: 2px;\"><b>Coverage: " + coverage.toFixed(2) + "%</b></div>";
            html_content += "<canvas id=\"infobox_renderarea\" height=\"" + line_height + "\" width=\"" + (this.width - 45) + "\"></canvas>";
            
            
            document.getElementById("infobox_html_background").style.display = "inline";
            
            var obj = document.getElementById("infobox_html");
            obj.innerHTML = html_content;
            obj.style.display = "inline";
            obj.style.left = (this.x - offset_x).toString() + "px";
            obj.style.top = (this.y - offset_y).toString() + "px";
            
            // create coverage lane
            var info_ctx = document.getElementById("infobox_renderarea").getContext("2d");
            info_ctx.fillStyle = edge_color;
            for(var j = 0; j < node_obj.peptides.length; ++j){
                if (!node_obj.peptides[j].filter_valid) continue;
                var st = node_obj.peptides[j].start_pos;
                var en = node_obj.peptides[j].peptide_seq.length;
                st *= (this.width - 45) / node_obj.sequence_length;
                en *= (this.width - 45) / node_obj.sequence_length;
                info_ctx.fillRect(st, 0, en, line_height);
            }
            
            info_ctx.strokeStyle="#000000";
            info_ctx.beginPath();
            info_ctx.moveTo(0, (line_height >> 1));
            info_ctx.lineTo((this.width - 40), (line_height >> 1));
            info_ctx.stroke();
        }
        
    }
}

function hide_infobox(){
    document.getElementById("infobox_html").style.display = "none";
    document.getElementById("infobox_html_background").style.display = "none";
    infobox.visible = false;
    draw();
}

node.prototype = new visual_element();
node.prototype.constructor = node;


function node(data){
    this.x = parseInt(data['x']);
    this.y = parseInt(data['y']);
    this.type = ('t' in data) ? data['t'] : "";
    this.id = data['i'];
    this.name = ('n' in data) ? data['n'] : "";
    this.short_name = ('sn' in data) ? data['sn'] : "";
    //this.name += " (" + this.id + ")";  // TODO: delete this line
    this.c_number = ('c' in data) ? data['c'] : "";
    this.lm_id = ('l' in data) ? data['l'] : "";
    this.smiles = ('s' in data) ? data['s'] : "";
    this.formula = ('f' in data) ? data['f'] : "";
    this.exact_mass = ('e' in data) ? data['e'] : "";
    this.pos = ('pos' in data) ? data['pos'] : "";
    this.img = 0;
    this.image = data['img'];
    this.text_highlight = ('h' in data) ? data['h'] == "1" : false;
    this.highlight = false;
    this.foreign_id = data['r'];
    this.pathway_enabled = false;
    this.proteins = [];
    this.lines = -1;
    this.width = -1;
    this.height = -1;
    this.orig_height = -1;
    this.slide = false;
    this.slide_percent = 0;
    this.on_slide = false;
    this.containing_spectra = 0;
    this.fill_style = protein_disabled_fill_color;
    this.length = 100;  // number of lipid headgroups for membrane
    this.lw = 2;    // line width for membrane
    this.o_y = 18;  // distance for second layer of membrane
    this.lipid_radius = 5;
    this.show_anchors = false;
    this.show_scale = false;
    this.selected = false;
    this.unconnected = true;
    
    
    this.setup_pathway_meta = function(){
        var ctx = document.createElement("canvas").getContext("2d");
        ctx.font = pathway_font_size.toString() + "px Arial";
        this.width = 0;
        var tokens = this.name.split("\n");
        this.height = (40 + 20 * tokens.length) * factor;
        for (var j = 0; j < tokens.length; ++j){
            this.width = Math.max(1.5 * ctx.measureText(tokens[j]).width * factor, this.width);
        }
        this.tipp = false;
        this.pathway_enabled = this.type == 'pathway' && this.foreign_id != 0 && (this.foreign_id in pathways);
    }
    
    this.setup_protein_meta = function(){
        var ctx = document.createElement("canvas").getContext("2d");
        var name = "";
        this.height = 20 + 20 * Math.min(this.proteins.length, max_protein_line_number);
        this.orig_height = 20 + 20 * this.proteins.length;
        this.lines = this.proteins.length;
        this.slide = (this.proteins.length > max_protein_line_number);
        this.fill_style = protein_disabled_fill_color;
        this.width = 0;
        
        for (var i = 0; i < this.proteins.length; ++i){
            if (name.length) name += ", ";
            var prot_name = protein_dictionary[this.proteins[i]].name;
            ctx.font = (font_size / factor).toString() + "px Arial";
            var text_width = ctx.measureText(prot_name).width + 10;
            this.width = Math.max(this.width, text_width);
            this.fill_style = protein_fill_color;
            name += prot_name;
        }
        
        this.width += 70 + this.slide * 20;
        this.height *= factor;
        this.width *= factor;
        this.orig_height *= factor;
        //this.name = name + " " + this.id;
        this.tipp = false;
    }
    
    
    this.setup_label_meta = function(){
        var tokens = this.name.split(" ");
        this.short_name = "";
        this.formula = "";
        this.width = 0;
        this.height = 1;
        for (var token of tokens){
            if (token.indexOf("http") > -1){
                this.formula = token;
            }
            else {
                if (this.short_name.length > 0) this.short_name += " ";
                this.short_name += token;
            }
        }
        var ctx = document.createElement("canvas").getContext("2d");
        ctx.font = (font_size / factor).toString() + "px Arial";
        this.short_name = replaceAll(this.short_name, "\\n", "\n");
        if (this.short_name.indexOf("\n") > -1){
            var tokens = this.short_name.split("\n");
            for (var token of tokens){
                this.width = Math.max(this.width, ctx.measureText(token).width);
            }
            this.height = tokens.length;
        }
        else {
            this.width = ctx.measureText(this.short_name).width;
        }
        this.width *= 1.3 * factor;
        this.height *= (text_size + 2) * factor * 1.3;
    }
    
    this.setup_image = function(){
        this.width = 100;
        this.height = 100;
        this.foreign_id = 10000.;
        this.slide = false;
        this.img = new Image();
        
        var load_process = setInterval(function(nd){
            
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.node = nd;
            
            var request = file_pathname + "scripts/get-image.py?node_id=" + nd.id + "&host=" + encodeURL(current_host);
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var image_meta = JSON.parse(this.responseText);
                    
                    if (Object.keys(image_meta).length == 0) return;
                    
                    var data_type = image_meta["image_type"];
                    
                    
                    if (data_type == "svg") data_type = "svg+xml";
                    this.node.pos = data_type;
                    this.node.foreign_id = image_meta["factor"];
                    this.node.img.src = "data:image/" + this.node.pos + ";charset=utf-8;base64," + image_meta["image"];
                    this.node.img.node = this.node;
                        
                    this.node.img.onload = function(){
                        this.node.width = this.node.img.width;
                        this.node.height = this.node.img.height;
                    
                        // must be done when svg contains no decent information about width and height
                        if (this.node.pos.toLowerCase() == "svg" && (this.node.width == 0 || this.node.height == 0)){
                            try {
                                var decoded = atob(this.responseText);
                                var xmlDoc = new DOMParser().parseFromString(decoded,'text/xml');
                                this.node.width = xmlDoc.children[0].viewBox.baseVal.width;
                                this.node.height = xmlDoc.children[0].viewBox.baseVal.height;
                            }
                            catch(e){
                                return;
                            }
                        }
                        this.node.height *= factor * this.node.foreign_id / 10000.;
                        this.node.width *= factor * this.node.foreign_id / 10000.;
                        
                        this.node.slide = true;
                    
                        draw();
                    }
                }
            }
            xmlhttp.open("GET", request, false);
            xmlhttp.send();
            
            clearInterval(load_process);
        }, 1, this);
    }
    
    
    
    switch (this.type){
        case "protein":
            this.sort_order = 100;
            
            if ('p' in data){
                for (var j = 0; j < data['p'].length; ++j){
                    var prot = 0;
                    var prot_id = data['p'][j]['i'];
                    
                    if (prot_id in protein_dictionary){
                        prot = protein_dictionary[prot_id];
                    }
                    else {
                        prot = new Protein(data['p'][j]);
                        protein_dictionary[prot_id] = prot;
                    }
                    
                    this.proteins.push(prot_id);
                    this.containing_spectra += prot.containing_spectra;
                    this.fill_style = protein_fill_color;
                }
            }
            this.setup_protein_meta();
            break;
            
        case "pathway":
            this.sort_order = 80;
            this.setup_pathway_meta();
            break;
            
        case "metabolite":
            this.sort_order = 60;
            this.width = metabolite_radius * 2;
            this.height = metabolite_radius * 2;
            
            this.img = new Image();
            if (this.foreign_id != -1){
                var load_process = setInterval(function(nd){
                    //nd.img.src = file_pathname + "images/metabolites/C" + nd.foreign_id + ".png";
                    nd.img.src = 'data:image/jpeg;base64,' + nd.image;
                    clearInterval(load_process);
                }, 1, this);
            }
            
            this.tipp = true;
            break;
            
        case "image":
            this.sort_order = 1;
            this.setup_image();
            break;
            
        case "membrane":
            this.sort_order = 5;
            this.width = this.length * (2 * this.lipid_radius + this.lw) * factor;
            this.height = (this.o_y + 2 * this.lipid_radius + this.lw) * factor;
            break;
            
        case "label":
            this.sort_order = 120;
            this.setup_label_meta();
            break;
            
        case "invisible":
            if (editor_mode) {
                this.sort_order = 500;
                this.width = metabolite_radius * 2;
                this.height = metabolite_radius * 2;
            }
            else {
                this.width = 0;
                this.height = 0;
            }
            break;
    }
    
    this.get_statistics = function(){
        var num_spectra = 0;
        var valid_spectra = 0;
        var num_peptides = 0;
        var valid_peptides = 0;
        var num_proteins = 0;
        var valid_proteins = 0;
        for (var i = 0; i < this.proteins.length; ++i){
            var tmp = protein_dictionary[this.proteins[i]].get_statistics();
            num_proteins += tmp[0];
            valid_proteins += tmp[1];
            num_peptides += tmp[2];
            valid_peptides += tmp[3];
            num_spectra += tmp[4];
            valid_spectra += tmp[5];
        }
        return [num_proteins, valid_proteins, num_peptides, valid_peptides, num_spectra, valid_spectra];
    }
    
    this.search = function(len_p, accept, masks){
        var results = [];
        if (this.type == "protein"){
            for (var i = 0; i < this.proteins.length; ++i){
                var r = protein_dictionary[this.proteins[i]].search(len_p, accept, masks, this.id);
                if (r.length) results = results.concat(r);
            }
        }/*
        else {
            results = search_pattern(this.name, len_p, accept, masks, this.id, -1);
        }*/
        return results;
    }
    
    this.move = function(shift_x, shift_y){
        this.x += shift_x;
        this.y += shift_y;
    }
    
    this.scale = function(res_x, res_y, scale){
        this.width *= scale;
        this.height *= scale;
        this.orig_height *= scale;
        this.x = res_x + scale * (this.x - res_x);
        this.y = res_y + scale * (this.y - res_y);
    }
    
    this.mouse_down = function(mouse, key){
        if (!this.slide) return false;
        var sl_x = this.x + this.width * 0.375;
        var sl_y_s = this.y - this.height * 0.375;
        var sl_y_e = this.y + this.height * 0.375;
        var ctl_y = sl_y_s + this.slide_percent * (sl_y_e - sl_y_s);
        
        this.on_slide = Math.sqrt(sq(sl_x - mouse.x) + sq(ctl_y - mouse.y)) < slide_bullet * factor;
        return this.on_slide;
    }
    
    this.mouse_up = function(mouse){
        this.on_slide = false;
        return true;
    }
    
    this.mouse_down_move = function(mouse, key){
        var sl_y_s = this.y - this.height * 0.5 * 0.75;
        var sl_y_e = this.y + this.height * 0.5 * 0.75;
        if (this.on_slide){
            this.slide_percent = (mouse.y - sl_y_s) / (sl_y_e - sl_y_s);
            this.slide_percent = Math.max(this.slide_percent, 0);
            this.slide_percent = Math.min(this.slide_percent, 1);
        }
        return this.on_slide;
    }
    
    this.filtering = function(){
        if (this.type == "protein"){
            for (var i = 0; i < this.proteins.length; ++i){
                protein_dictionary[this.proteins[i]].filtering();
            }
        }
    }
    
    this.draw = function(ctx) {
        var hh = this.height * 0.5;
        var hw = this.width * 0.5;
    
        switch (this.type){
            
            case "protein":
                // draw fill
                ctx.fillStyle = this.fill_style;
                ctx.fillRect(this.x - hw, this.y - hh, this.width, this.height);
       
                ctx.save();
                ctx.rect(this.x - hw, this.y - hh, this.width, this.height);
                ctx.clip();
                
                // draw content
                ctx.textAlign = "left";
                ctx.font = font_size.toString() + "px Arial";
                ctx.fillStyle = "black";
                var ty = this.y;
                var tx = this.x - hw;
                if (this.lines > max_protein_line_number){
                    ty += (this.orig_height * 0.5 - hh) - this.slide_percent * (this.orig_height - this.height);
                    
                    var sl_x = this.x + this.width * 0.375;
                    var sl_y_s = this.y - this.height * 0.375;
                    var sl_y_e = this.y + this.height * 0.375;
                    
                    var ctl_y = sl_y_s + this.slide_percent * (sl_y_e - sl_y_s);
                    
                    ctx.fillStyle = slide_color;
                    ctx.strokeStyle = slide_color;
                    ctx.lineWidth = slide_width * factor;
                    ctx.beginPath();
                    ctx.moveTo(sl_x, sl_y_s);
                    ctx.lineTo(sl_x, sl_y_e);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.arc(sl_x, ctl_y, slide_bullet * factor, 0, 2 * Math.PI);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
                
                this.proteins.sort(function(a, b) {
                    return protein_dictionary[a].name > protein_dictionary[b].name;
                });
                
                var lhf = line_height * factor;
                for (var i = 0, tty = ty - (this.proteins.length - 1) * lhf * 0.5; i < this.proteins.length; i += 1, tty += lhf){
                    if (Math.abs(tty - this.y) <= hh + lhf){
                        protein_dictionary[this.proteins[i]].draw(ctx, tx, tty);
                    }
                }
                ctx.restore();
                
                // draw stroke
                ctx.lineWidth = (line_width + 2 * this.highlight) * factor;
                if (this.selected) ctx.strokeStyle = node_selected_color;
                else if (this.proteins.length > 0){
                    if (this.unconnected) ctx.strokeStyle = protein_unconnected_stroke_color;
                    else ctx.strokeStyle = protein_stroke_color;
                }
                else ctx.strokeStyle = protein_disabled_stroke_color;
                ctx.strokeRect(this.x - hw, this.y - hh, this.width, this.height);
                
                break;
                
                
            case "pathway":
                ctx.fillStyle = pathway_fill_color;
                ctx.strokeStyle = (this.selected) ? node_selected_color : (this.pathway_enabled ? pathway_stroke_color : pathway_disabled_stroke_color);
                ctx.lineWidth = (line_width + 2 * this.highlight * this.pathway_enabled) * factor;
                roundRect(this.x - hw, this.y - hh, this.width, this.height, round_rect_radius * factor, ctx);
                ctx.textAlign = "center";
                ctx.font = (pathway_font_size * factor).toString() + "px Arial";
                ctx.fillStyle = "black";
                wrapText(this.name, this.x, this.y, this.width, pathway_font_size * factor, ctx);
                break;
                
            case "invisible":
                if (!editor_mode) break;
                ctx.fillStyle = (this.selected) ? node_selected_color : pathway_disabled_stroke_color;
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, radius, 0, 1.999 * Math.PI);
                ctx.closePath();
                ctx.fill();
                break;
                
                
            case "metabolite":
                if (this.foreign_id == -1 && !editor_mode) break;
                ctx.fillStyle = metabolite_fill_color;
                ctx.strokeStyle = (this.selected) ? node_selected_color : metabolite_stroke_color;
                ctx.lineWidth = (line_width + 2 * this.highlight) * factor;
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, radius, 0, 1.999 * Math.PI);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.font = (this.text_highlight ? "bold " : "") + ((text_size - (this.text_highlight ? 0 : 3)) * factor).toString() + "px Arial";
                ctx.fillStyle = this.text_highlight ? metabolite_highlight_label_stroke_color : metabolite_label_stroke_color;
                var x = this.x;
                var y = this.y + this.height * 0.15;
                
                
                var selected_name = (this.short_name.length > 0 && this.short_name.length < this.name.length) ? this.short_name : this.name;
                
                if (this.pos == "tl"){
                    x -= 1.5 * radius;
                    y -= 2 * radius;
                    ctx.textAlign = "right";
                }
                else if (this.pos == "tc"){
                    y -= 2 * radius;
                    ctx.textAlign = "center";
                }
                else if (this.pos == "tr"){
                    x += 1.5 * radius;
                    y -= 2 * radius;
                    ctx.textAlign = "left";
                }
                else if (this.pos == "ml"){
                    x -= 1.5 * radius;
                    ctx.textAlign = "right";
                }
                else if (this.pos == "mr"){
                    x += 1.5 * radius;
                    ctx.textAlign = "left";
                }
                else if (this.pos == "bl"){
                    x -= 1.5 * radius;
                    y += 2 * radius;
                    ctx.textAlign = "right";
                }
                else if (this.pos == "bc"){
                    y += 2 * radius;
                    ctx.textAlign = "center";
                }
                else if (this.pos == "br"){
                    x += 1.5 * radius;
                    y += 2 * radius;
                    ctx.textAlign = "left";
                }
                
                ctx.fillText(selected_name, x, y);
                break;
                
                
            case "label":
                ctx.textAlign = "center";
                
                
                ctx.font = (this.text_highlight ? "bold " : "") + ((text_size + (this.text_highlight ? 6 : 2)) * factor).toString() + "px Arial";
                ctx.fillStyle = this.selected ? node_selected_color : (this.formula.length > 0 ? "darkblue" : label_color);
                if (this.short_name.indexOf("\n") > -1){
                    wrapText(this.short_name, this.x, this.y, this.width, pathway_font_size * factor, ctx);
                }
                else {
                    ctx.fillText(this.short_name, this.x, this.y + this.height * 0.3);
                }
                break;
                
            case "image":
                
                if (this.slide){
                    try {
                        ctx.drawImage(this.img, this.x - (this.width >> 1), this.y - (this.height >> 1), this.width, this.height);
                    }
                    catch (e){
                        this.slide = false;
                        draw();
                    }
                }
                else {
                    
                    ctx.lineWidth = 5 * factor;
                    ctx.strokeStyle = "red";
                    ctx.beginPath();
                    ctx.moveTo(this.x - (this.width * 0.9 >> 1), this.y - (this.height * 0.9 >> 1));
                    ctx.lineTo(this.x + (this.width * 0.9 >> 1), this.y + (this.height * 0.9 >> 1));
                    ctx.closePath();
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.moveTo(this.x - (this.width * 0.9 >> 1), this.y + (this.height * 0.9 >> 1));
                    ctx.lineTo(this.x + (this.width * 0.9 >> 1), this.y - (this.height * 0.9 >> 1));
                    ctx.closePath();
                    ctx.stroke();
                    
                    
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 2 * factor;
                    ctx.beginPath();
                    ctx.rect(this.x - (this.width >> 1), this.y - (this.height >> 1), this.width, this.height);
                    ctx.stroke();
                    
                    
                }
                
                if (this.show_scale){
                    ctx.lineWidth = line_width;
                    ctx.strokeStyle = slide_color;
                    
                    ctx.beginPath();
                    ctx.arc(this.x + hw * 0.9, this.y + hh * 0.9, 2 * anchor_size, 0, 1.999 * Math.PI);
                    ctx.closePath();
                    ctx.stroke();
                }
                break;
                
                
            case "membrane":
                var len_s = 3;
                var rotating = this.text_highlight;
                
                var this_x = this.x;
                var this_y = this.y;
                if (rotating){
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.rotate(Math.PI / 2.);
                    this_x = 0;
                    this_y = 0;
                }
                
                
                ctx.fillStyle = membrane_fill_color;
                ctx.strokeStyle = this.selected ? node_selected_color : membrane_stroke_color;
                ctx.lineWidth = this.lw * factor;
                
                
                
                
                var tmp_x = this_x - (this.width >> 1);
                for (var i = 0; i < this.length; ++i){
                    ctx.beginPath();
                    ctx.arc(tmp_x, this_y - this.o_y * factor, this.lipid_radius * factor, 0, 2 * Math.PI);
                    ctx.closePath();
                    ctx.stroke();
                    
                    
                    ctx.beginPath();
                    ctx.arc(tmp_x, this_y + this.o_y * factor, this.lipid_radius * factor, 0, 2 * Math.PI);
                    ctx.closePath();
                    ctx.stroke();
                    tmp_x += (2 * this.lipid_radius + this.lw) * factor;
                }
                
                tmp_x = this_x - (this.width >> 1);
                var tmp_yt = this_y - (this.o_y - this.lipid_radius) * factor;
                var tmp_yb = this_y + (this.o_y - this.lipid_radius) * factor;
                ctx.lineWidth = (this.lw - 1) * factor;
                for (var i = 0; i < this.length; ++i){
                    var ttx = tmp_x + this.lipid_radius * factor / 4;
                    var tty = tmp_yt;
                    for (var j = 0; j < 4; ++j){
                        ctx.beginPath();
                        ctx.moveTo(ttx, tty);
                        ttx += (((j & 1) == 0) ? len_s : -len_s) * factor;
                        tty += len_s * factor;
                        ctx.lineTo(ttx, tty);
                        ctx.closePath();
                        ctx.stroke();
                    }
                    
                    ttx = tmp_x - this.lipid_radius * factor / 2;
                    tty = tmp_yt;
                    for (var j = 0; j < 4; ++j){
                        ctx.beginPath();
                        ctx.moveTo(ttx, tty);
                        ttx += ((j % 2 == 0) ? len_s : -len_s) * factor;
                        tty += len_s * factor;
                        ctx.lineTo(ttx, tty);
                        ctx.closePath();
                        ctx.stroke();
                    }
                    
                    ttx = tmp_x + this.lipid_radius * factor / 4;
                    tty = tmp_yb;
                    for (var j = 0; j < 4; ++j){
                        ctx.beginPath();
                        ctx.moveTo(ttx, tty);
                        ttx += ((j % 2 == 0) ? len_s : -len_s) * factor;
                        tty -= len_s * factor;
                        ctx.lineTo(ttx, tty);
                        ctx.closePath();
                        ctx.stroke();
                    }
                    
                    ttx = tmp_x - this.lipid_radius * factor / 2;
                    tty = tmp_yb;
                    for (var j = 0; j < 4; ++j){
                        ctx.beginPath();
                        ctx.moveTo(ttx, tty);
                        ttx += ((j % 2 == 0) ? len_s : -len_s) * factor;
                        tty -= len_s * factor;
                        ctx.lineTo(ttx, tty);
                        ctx.closePath();
                        ctx.stroke();
                    }
                    tmp_x += (2 * this.lipid_radius + this.lw) * factor;
                }
                if (rotating){
                    ctx.restore();
                }
                break;
        }
        
        
        if (this.show_anchors){
            ctx.lineWidth = line_width * factor;
            ctx.strokeStyle = slide_color;
            
            var anchor_hw = hw;
            var anchor_hh = hh;
            
            if (this.type == "membrane" && this.text_highlight){
                anchor_hw = hh;
                anchor_hh = hw;
            }
            
            ctx.beginPath();
            ctx.arc(this.x - anchor_hw, this.y, anchor_size * factor, 0, 1.999 * Math.PI);
            ctx.closePath();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(this.x + anchor_hw, this.y, anchor_size * factor, 0, 1.999 * Math.PI);
            ctx.closePath();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y - anchor_hh, anchor_size * factor, 0, 1.999 * Math.PI);
            ctx.closePath();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y + anchor_hh, anchor_size * factor, 0, 1.999 * Math.PI);
            ctx.closePath();
            ctx.stroke();
        }
        
        //////////// TODO: delete this lines
        /*
        this.ctx.textAlign = "center";
        this.ctx.font = ((text_size + 6) * factor).toString() + "px Arial";
        this.ctx.fillStyle = "black";
        wrapText(" " + this.id, this.x, this.y, this.width, 20 * factor, this.ctx);
        */
    };
    
    this.is_mouse_over_anchor = function(mouse){
        var hh = this.height * 0.5;
        var hw = this.width * 0.5;
        
        var anchor_x = this.x - hw;
        var anchor_y = this.y;
        if (Math.sqrt(Math.pow(anchor_x - mouse.x, 2) + Math.pow(anchor_y - mouse.y, 2)) < (anchor_size + line_width) * factor) return "left";
        
        var anchor_x = this.x + hw;
        var anchor_y = this.y;
        if (Math.sqrt(Math.pow(anchor_x - mouse.x, 2) + Math.pow(anchor_y - mouse.y, 2)) < (anchor_size + line_width) * factor) return "right";
        
        var anchor_x = this.x;
        var anchor_y = this.y - hh;
        if (Math.sqrt(Math.pow(anchor_x - mouse.x, 2) + Math.pow(anchor_y - mouse.y, 2)) < (anchor_size + line_width) * factor) return "top";
        
        var anchor_x = this.x;
        var anchor_y = this.y + hh;
        if (Math.sqrt(Math.pow(anchor_x - mouse.x, 2) + Math.pow(anchor_y - mouse.y, 2)) < (anchor_size + line_width) * factor) return "bottom";
        
        return "";
    }
    
    this.is_mouse_over_scale_anchor = function(mouse){
        var hh = this.height * 0.5;
        var hw = this.width * 0.5;
        
        var anchor_x = this.x + hw * 0.9;
        var anchor_y = this.y + hh * 0.9;
        return (Math.sqrt(Math.pow(anchor_x - mouse.x, 2) + Math.pow(anchor_y - mouse.y, 2)) < 2 * (anchor_size + line_width));
    }
    
    this.mouse_pointer_cursor = function (res){
    
        switch (this.type){
            case "protein":
                return this.check_mouse_over_protein_name(res);
                
            case "label":
                return (this.is_mouse_over(res) && this.formula.length > 0);
                
            default:
                return false;
        }
    }
    
    this.is_mouse_over = function (mouse){
        var lw = line_width * factor;
        switch (this.type){
            case "metabolite":
                return (Math.sqrt(Math.pow(this.x - mouse.x, 2) + Math.pow(this.y - mouse.y, 2)) < radius + lw);
                
            case "membrane":
                var this_width = this.width;
                var this_height = this.height;
                if (this.text_highlight){
                    this_width = this.height;
                    this_height = this.width;
                }
                return (this.x - (this_width >> 1) - lw <= mouse.x && mouse.x <= this.x + (this_width >> 1) + lw && this.y - (this_height >> 1) - lw <= mouse.y && mouse.y <= this.y + (this_height >> 1) + lw);
                
            default:
                return (this.x - (this.width >> 1) - lw <= mouse.x && mouse.x <= this.x + (this.width >> 1) + lw && this.y - (this.height >> 1) - lw <= mouse.y && mouse.y <= this.y + (this.height >> 1) + lw);
        }
        
                
    };
    
    this.mark_protein_checkbox = function(res){
        var offset_y = 0;
        if (this.lines > max_protein_line_number){
            offset_y = (this.orig_height * 0.5 - this.height * 0.5) - this.slide_percent * (this.orig_height - this.height);
        }
        for (var i = 0; i < this.proteins.length; ++i){
            var prot = protein_dictionary[this.proteins[i]];
            if (prot.mouse_over_checkbox(this.x - (this.width >> 1), this.y + offset_y, res.x, res.y, this.proteins.length, i)){
                prot.toggle_marked();
                break;
            }
        }
    }
    
    this.get_position = function(i){
        if ((this.type == "protein" && (i < 0 || this.proteins.length <= i)) || this.type == "pathway"){
            return [-1, -1];
        }
        
        if (this.type == "metabolite"){
            return [this.x - radius, this.y];
        }
        
        var offset_y = 0;
        if (this.lines > max_protein_line_number){
            offset_y = (this.orig_height * 0.5 - this.height * 0.5) - this.slide_percent * (this.orig_height - this.height);
        }
        
        return protein_dictionary[this.proteins[i]].get_position(this.x - this.width / 2, this.y + offset_y, this.proteins.length, i);
    }
    
    
    this.check_mouse_over_protein_name = function(mouse){
        if (this.type != "protein") return -1;
        
        var offset_y = 0;
        if (this.lines > max_protein_line_number){
            offset_y = (this.orig_height * 0.5 - this.height * 0.5) - this.slide_percent * (this.orig_height - this.height);
        }
        for (var i = 0; i < this.proteins.length; ++i){
            if(protein_dictionary[this.proteins[i]].check_mouse_over_protein_name(this.x - this.width / 2, this.y + offset_y, this.proteins.length, i, mouse)){
                return i;
            }
        }
        return -1;
    }
    
    this.mouse_click = function(mouse, key){
        if (this.type == 'protein'){
            var mopn = this.check_mouse_over_protein_name(mouse);
            if (mopn >= 0){
                prepare_infobox(mopn);
            }
            else {
                this.mark_protein_checkbox(mouse);
                draw();
            }
        }
        else if (this.type == 'metabolite'){
            prepare_infobox(this.is_mouse_over(mouse) - 1);
        }
        else if (this.type == 'pathway'){
            if (this.pathway_enabled){
                change_pathway(this.foreign_id);
            }
        }
        else if (this.type == 'label' && this.formula.length > 0){
            var win = window.open(this.formula, '_blank');
            win.focus();
        }
    }
    
    this.mouse_dbl_click = function(res, key){
        if (this.type != "protein") return false;
        var cnt = 0;
        var cnt_avbl = 0;
        for (var i = 0; i < this.proteins.length; ++i){
            var prot = protein_dictionary[this.proteins[i]];
            cnt += (prot.id in basket);
            cnt_avbl += (prot.peptides.length > 0) && (prot.containing_spectra > 0);
        }
        var marking = (cnt != cnt_avbl);
        for (var i = 0; i < this.proteins.length; ++i){
            protein_dictionary[this.proteins[i]].mark(marking);
        }
        draw();
        return true;
    }
};



function queue_node(_cell){
    this.cost = 100000;
    this.cll = _cell;
    this.pos = 0;
    this.in_queue = false;
}



function priority_queue(){
    this.field = [];
    
    this.is_empty = function(){
        return this.field.length == 0;
    }
    
    this.insert = function(node){
        var i = this.field.length;
        this.field.push(node);
        node.pos = i;
        this.decrease(i);
    };
    
    this.swap = function(i, j){
        this.field[i].pos = j;
        this.field[j].pos = i;
        var tmp = this.field[i];
        this.field[i] = this.field[j];
        this.field[j] = tmp;
    };
    
    this.remove = function(i){
        var lastIdx = this.field.length - 1;
        this.swap(i, lastIdx);
        var removedItem = this.field.pop();
        if ( i != lastIdx ) {
            if ( i == 0 || this.field[i].cost > this.field[this.parent(i)].cost) {
                this.heapify(i);
            }
            else {
                this.decrease(i); // decrease macht nichts, wenn h.key(i) == h.key(parent(i))
            }
        }
        return removedItem;
    };
    
    this.left = function(i){return 2 * i + 1;};
    this.right = function(i){return 2 * i + 2;};
    this.parent = function(i){return Math.floor((i - 1) >> 1);};
    
    this.heapify = function(i){
        var min = i;
        if (this.left(i) < this.field.length && this.field[this.left(i)].cost < this.field[min].cost){
            min = this.left(i);
        }
        if (this.right(i) < this.field.length && this.field[this.right(i)].cost < this.field[min].cost){
            min = this.right(i);
        }
        if (min != i) {
            this.swap(i, min);
            this.heapify(min);
        }
    };
    
    this.decrease = function(i){
        while (i > 0 && this.field[i].cost < this.field[this.parent(i)].cost){
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    };
    
    this.extract_min = function(){
        return this.remove(0);
    };
};






function cell(x, y){
    this.pos = [x, y];
    this.pre = [-1, -1];
    this.post = [-1, -1];
    this.direction = "-";
    this.cost = 100000;
    this.q_node = new queue_node(this);
    this.active = true;
    this.visited = false;
    this.in_open_list = false;
    this.is_target = false;
    this.in_path = false;
}

function check_direction(c_dir, dir){
    switch (c_dir){
        case "l":
            if (dir[0] == -1 && dir[1] == 0) return 0;
            break;
        case "r":
            if (dir[0] == 1 && dir[1] == 0) return 0;
            break;
        case "t":
            if (dir[0] == 0 && dir[1] == -1) return 0;
            break;
        case "b":
            if (dir[0] == 0 && dir[1] == 1) return 0;
            break;
    }
    return 1;
}


function sq(x){
    return x * x;
}


function penelty(dir, d_x, d_y){
    var weight = 2;
    switch (dir){
        case "l":
            return (d_x < 0) * weight;
            break;
        case "r":
            return (d_x > 0) * weight;
            break;
        case "t":
            return (d_y < 0) * weight;
            break;
        case "b":
            return (d_y > 0) * weight;
            break;
    }
    return 0;
}


function point(x, y, b){
    this.x = x;
    this.y = y;
    this.b = b;
};

edge.prototype = new visual_element();
edge.prototype.constructor = edge;

function edge(x_s, y_s, a_s, start_node, x_e, y_e, a_e, end_node, head, reaction_id, reagent_id){
    
    
    this.head = head;
    this.head_start = 0;
    this.point_list = [];
    this.start_point = (x_s, y_s, "");
    this.start_id = start_node.id;
    this.start_anchor = a_s;
    this.end_point = (x_e, y_e, "");
    this.end_id = end_node.id;
    this.end_anchor = a_e;
    this.reaction_id = reaction_id;
    this.reagent_id = reagent_id;
    
    
    this.tail_start = 0;
    
    
    this.dashed_edge = (head & 1) == 1;
    this.edge_enabled = reagent_id < 0 || data[this.start_id].proteins.length > 0 || (this.dashed_edge && data[this.start_id].pathway_enabled);
    this.sort_order = this.edge_enabled ? 20 : 10;
    
    
    this.is_mouse_over = function(mouse){
        for (var i = 0; i < this.point_list.length - 1; ++i){
            var p1 = this.point_list[i];
            var p2 = this.point_list[i + 1];
            var dir = p1.b;
            if (dir != 2) continue;
            var dv_ab = new point(p2.x - p1.x, p2.y - p1.y, "");
            var dv_cd = new point(dv_ab.y, -dv_ab.x, "");
            
            var divi = ((dv_ab.y) * (dv_cd.x) - (dv_ab.x) * (dv_cd.y));
            var beta = divi ? ((p1.x - mouse.x) * (dv_cd.y) - (p1.y - mouse.y) * (dv_cd.x)) / divi : 0;
            if (0 > beta || beta > 1) continue;
            
            var pd = new point(p1.x + beta * dv_ab.x, p1.y + beta * dv_ab.y, "");
            var dist = Math.sqrt(sq(mouse.x - pd.x) + sq(mouse.y - pd.y));
            if (dist < 0.5 * line_width * factor){
                return true;
            }
        }
        return false;
    }
    
    
    
    
    this.move = function(shift_x, shift_y){
        for (var j = 0; j < this.point_list.length; ++j){
            this.point_list[j].x += shift_x;
            this.point_list[j].y += shift_y;
        }
    }
    
    this.scale = function(res_x, res_y, scale){
        for (var j = 0; j < this.point_list.length; ++j){
            this.point_list[j].x = res_x + scale * (this.point_list[j].x - res_x);
            this.point_list[j].y = res_y + scale * (this.point_list[j].y - res_y);
        }
    }
    
    
    this.expand_node = function(matrix, current_node, open_list, W, H, t_x, t_y, t_a){
        var dirs = [[0, -1], [0, 1], [1, 0], [-1, 0]];
        var dir_name = ["t", "b", "r", "l"];
        var dir_op = ["b", "t", "l", "r"];
        for (var i = 0; i < 4; ++i){
            var dir = dirs[i];
            var c_x = current_node.cll.pos[0] + dir[0];
            var c_y = current_node.cll.pos[1] + dir[1];
            if (!(0 <= c_x && c_x < W && 0 <= c_y && c_y < H && matrix[c_y][c_x].active && !matrix[c_y][c_x].visited)){
                continue;
            }
            
            var new_cost = current_node.cll.cost + check_direction(current_node.cll.direction, dir);
            if (c_x == t_x && c_y == t_y && t_a != dir_op[i]) new_cost += 1;
                
            if (new_cost >= matrix[c_y][c_x].cost && matrix[c_y][c_x].q_node.in_queue) continue;
            matrix[c_y][c_x].pre = [current_node.cll.pos[0], current_node.cll.pos[1]];
            matrix[c_y][c_x].cost = new_cost;
            matrix[c_y][c_x].direction = dir_name[i];
            var f = new_cost + penelty(current_node.cll.direction, c_x - t_x, c_y - t_y);
            
            matrix[c_y][c_x].q_node.cost = f;
            if (!matrix[c_y][c_x].q_node.in_queue){
                open_list.insert(matrix[c_y][c_x].q_node);
                matrix[c_y][c_x].q_node.in_queue = true;
            }
            else {
                open_list.decrease(matrix[c_y][c_x].q_node.pos);
            }
        }
    }
    
    this.routing = function(xa_s, ya_s, a_s, protein_node, xa_e, ya_e, a_e, metabolite_node){
        a_s = a_s.charAt(0);
        a_e = a_e.charAt(0);
        var grid = base_grid * factor;
        var offset_x = {"l": -grid, "r": grid, "t": 0, "b": 0};
        var offset_y = {"l": 0, "r": 0, "t": -grid, "b": grid};
        var w_s = protein_node.width * 0.5;
        var h_s = protein_node.height * 0.5;
        var w_e = metabolite_node * 0.5;
        var h_e = metabolite_node * 0.5;
        
        var x_s = protein_node.x;
        var y_s = protein_node.y;
        var x_e = metabolite_node.x;
        var y_e = metabolite_node.y;
        
        var xd_s = xa_s + offset_x[a_s];
        var yd_s = ya_s + offset_y[a_s];
        var xd_e = xa_e + offset_x[a_e];
        var yd_e = ya_e + offset_y[a_e];
        
        // initialize grid
        var W = 14 + Math.ceil(Math.abs(xd_s - xd_e) / grid);
        var H = 14 + Math.ceil(Math.abs(yd_s - yd_e) / grid);
        var open_list = new priority_queue();
        var matrix = [];
        for (var h = 0; h < H; ++h){
            matrix.push([]);
            for (var w = 0; w < W; ++w){
                matrix[h].push(new cell(w, h));
            }
        }
        
        // set start and end point to grids including outcomes
        var diff_x = xd_e - xd_s;
        var diff_y = yd_e- yd_s;
        var cell_x_s = diff_x > 0 ? 4 : W - 5;
        var cell_y_s = diff_y > 0 ? 4 : H - 5;
        var cell_x_e = 0;
        var cell_y_e = 0;
        for (var h = 0; h < H; ++h){    
            var y = (h - cell_y_s) * grid + yd_s;
            for (var w = 0; w < W; ++w){
                var x = (w - cell_x_s) * grid + xd_s;
                var active = true;
                
                if (x_s - w_s <= x && x <= x_s + w_s && y_s - h_s <= y && y <= y_s + h_s){
                    active = false;
                }
                if (active && x_e - w_e <= x && x <= x_e + w_e && y_e - h_e <= y && y <= y_e + h_e){
                    active = false;
                }
                matrix[h][w].active = active;
            }
            if (Math.abs(y - yd_e) < Math.abs((cell_y_e - cell_y_s) * grid + yd_s - yd_e)){
                cell_y_e = h;
            }
        }
        for (var w = 1; w < W; ++w){
            var x = (w - cell_x_s) * grid + xd_s;
            if (Math.abs(x - xd_e) < Math.abs((cell_x_e - cell_x_s) * grid + xd_s - xd_e)){
                cell_x_e = w;
            }
        }
        
        
        // add actual source
        var opposite = {"t": "b", "b": "t", "l": "r", "r": "l"};
        var start_x = cell_x_s + (a_s == "r" ? -1 : (a_s == "l" ? 1 : 0));
        var start_y = cell_y_s + (a_s == "b" ? -1 : (a_s == "t" ? 1 : 0));
        matrix[start_y][start_x].post = [cell_x_s, cell_y_s];
        matrix[cell_y_s][cell_x_s].pre = [start_x, start_y];
        matrix[start_y][start_x].in_path = true;
        matrix[start_y][start_x].active = false;
        matrix[start_y][start_x].direction = a_s;
        
        // add actual target
        var end_x = cell_x_e + (a_e == "r" ? -1 : (a_e == "l" ? 1 : 0));
        var end_y = cell_y_e + (a_e == "b" ? -1 : (a_e == "t" ? 1 : 0));
        matrix[cell_y_e][cell_x_e].post = [end_x, end_y];
        matrix[end_y][end_x].pre = [cell_x_e, cell_y_e];
        matrix[end_y][end_x].active = false;
        matrix[end_y][end_x].direction = opposite[a_e];
        
        
        
        if (!matrix[cell_y_s][cell_x_s].active || !matrix[cell_y_e][cell_x_e].active){
            this.point_list = [new point(xa_s, ya_s, opposite[a_s] + a_s)];
            this.point_list.push(new point(xa_e, ya_e, opposite[a_e] + a_e));
            //return;
        }
        
        
        else {
            
            // start routing
            matrix[cell_y_s][cell_x_s].q_node.cost = 0;
            matrix[cell_y_s][cell_x_s].q_node.in_queue = true;
            matrix[cell_y_s][cell_x_s].cost = 0;
            matrix[cell_y_e][cell_x_e].is_target = true;
            open_list.insert(matrix[cell_y_s][cell_x_s].q_node);
            matrix[cell_y_s][cell_x_s].direction = a_s;
            while (!open_list.is_empty()){
                current_node = open_list.extract_min();
                if (current_node.cll.is_target) break;
                current_node.in_queue = false;
                current_node.cll.visited = true;
                this.expand_node(matrix, current_node, open_list, W, H, cell_x_e, cell_y_e);
            }
            
            
            
            // correct the path from end to front
            var curr_x = end_x;
            var curr_y = end_y;
            var post_x = -1;
            var post_y = -1;
            var iii = 0;
            while ((curr_x != -1) || (curr_y != -1)){
                matrix[curr_y][curr_x].in_path = true;
                if (post_x != -1) matrix[curr_y][curr_x].post = [post_x, post_y];
                if ((post_x - curr_x) == 1) matrix[curr_y][curr_x].direction = "r";
                else if ((post_x - curr_x) == -1) matrix[curr_y][curr_x].direction = "l";
                else if ((post_y - curr_y) == 1) matrix[curr_y][curr_x].direction = "b";
                else if ((post_y - curr_y) == -1) matrix[curr_y][curr_x].direction = "t";
                
                post_x = curr_x;
                post_y = curr_y;
                curr_x = matrix[post_y][post_x].pre[0];
                curr_y = matrix[post_y][post_x].pre[1];
            }
            
            // determining the points / corners of the path
            var curr_x = start_x;
            var curr_y = start_y;
            var x = (curr_x - cell_x_s) * grid + xd_s;
            var y = (curr_y - cell_y_s) * grid + yd_s;
            this.point_list = [new point(x, y, opposite[a_s] + a_s)];
            var in_corner = false;
            var d = a_s;
            var corners = 0;
            var corner_path = [];
            while (((curr_x != -1) || (curr_y != -1))){
                post_x = matrix[curr_y][curr_x].post[0];
                post_y = matrix[curr_y][curr_x].post[1];
                
                if ((curr_x == end_x) && (curr_y == end_y) && !in_corner){
                    var x = (curr_x - cell_x_s) * grid + xd_s;
                    var y = (curr_y - cell_y_s) * grid + yd_s;
                    this.point_list.push(new point(x, y, opposite[d] + d));
                    break;
                }
                if (in_corner){
                    var x = (curr_x - cell_x_s) * grid + xd_s;
                    var y = (curr_y - cell_y_s) * grid + yd_s;
                    this.point_list.push(new point(x, y, opposite[d] + d));
                    if (corner_path.length > 2 && corner_path[corner_path.length - 2]){
                        switch (matrix[curr_y][curr_x].direction){
                            case "l": case "r":
                                y = (this.point_list[this.point_list.length - 1].y + this.point_list[this.point_list.length - 4].y) * 0.5;
                                this.point_list[this.point_list.length - 2].y = y;
                                this.point_list[this.point_list.length - 3].y = y;
                                break;
                            case "t": case "b":
                                x = (this.point_list[this.point_list.length - 1].x + this.point_list[this.point_list.length - 4].x) * 0.5;
                                this.point_list[this.point_list.length - 2].x = x;
                                this.point_list[this.point_list.length - 3].x = x;
                                break;
                        }
                    }
                    in_corner = false;
                    ++corners;
                }
                if (d != matrix[curr_y][curr_x].direction){
                    var x = (matrix[curr_y][curr_x].pre[0] - cell_x_s) * grid + xd_s;
                    var y = (matrix[curr_y][curr_x].pre[1] - cell_y_s) * grid + yd_s;
                    this.point_list.push(new point(x, y, opposite[d] + matrix[curr_y][curr_x].direction));
                    d = matrix[curr_y][curr_x].direction;
                    in_corner = true;
                    corner_path.push(1);
                }
                else {
                    corner_path.push(0);
                }
                
                curr_x = post_x;
                curr_y = post_y;
            }
            
            
            // merge equal points
            for (var i = 0; i < this.point_list.length - 1; ++i){
                var p2_x = this.point_list[i].x;
                var p2_y = this.point_list[i].y;
                var p1_x = this.point_list[i + 1].x;
                var p1_y = this.point_list[i + 1].y;
                if (Math.abs(p2_x - p1_x) < 1 && Math.abs(p2_y - p1_y) < 1){
                    this.point_list.splice(i, 1);
                }
            }
            
            
            
            // correcting the targeting points
            var p_len = this.point_list.length;
            if (corners > 0){
                var shift_x = xa_e - this.point_list[p_len - 1].x;
                var shift_y = ya_e - this.point_list[p_len - 1].y;
                
                var s = false;
                switch (this.point_list[p_len - 2].b){
                    case "lr": case "rl": case "tb": case "bt": s = true; break;
                    default: break;
                }
                if (s){
                    var dd = this.point_list[p_len - 1].b.charAt(0);
                    if (dd == "b" || dd == "t"){
                        this.point_list[p_len - 2].x += shift_x;
                        this.point_list[p_len - 3].x += shift_x;
                    }
                    else {
                        this.point_list[p_len - 2].y += shift_y;
                        this.point_list[p_len - 3].y += shift_y;
                    }
                }
            }
            this.point_list[p_len - 1].x = xa_e;
            this.point_list[p_len - 1].y = ya_e;
        }
        
        
        if (this.point_list.length == 2){
            switch (this.point_list[0].b){
                case "rl": case "lr":
                    this.point_list[0].y = this.point_list[1].y;
                    break;
                case "bt": case "tb":
                    this.point_list[0].x = this.point_list[1].x;
                    break;                
            }
        }
        
        for (var i = 0; i < this.point_list.length; ++i){
            switch (this.point_list[i].b){
                case "rt": case "lt": case "rb": case "lb":
                    this.point_list[i].b = 0;
                    break;
                case "tr": case "tl": case "br": case "bl":
                    this.point_list[i].b = 1;
                    break;
                case "rl": case "lr": case "bt": case "tb":
                    this.point_list[i].b = 2;
                    break;
            }
        }
        
        
        
        if (1 < this.head && this.head <= 5 && this.point_list.length >= 2){
            var p_len = this.point_list.length;
            var x_head = -1;
            var y_head = -1;
            var p2_x = this.point_list[p_len - 1].x;
            var p2_y = this.point_list[p_len - 1].y;
            var p1_x = this.point_list[p_len - 2].x;
            var p1_y = this.point_list[p_len - 2].y;
            var ct_x = -1;
            var ct_y = -1;
            switch (this.point_list[p_len - 2].b){
                case 0:
                    ct_x = this.point_list[p_len - 1].x;
                    ct_y = this.point_list[p_len - 2].y;
                    break;
                case 1:
                    ct_x = this.point_list[p_len - 2].x;
                    ct_y = this.point_list[p_len - 1].y;
                    break;
            }
            
            switch (this.point_list[p_len - 2].b){
                case 2:                    
                    break;
                
                default:                    
                    var mm = 0;
                    var upper = 1;
                    var lower = 0;
                    var l1 = -1;
                    var l = -1;
                    {
                        var a_x = p1_x - 2 * ct_x + p2_x;
                        var a_y = p1_y - 2 * ct_y + p2_y;
                        var b_x = 2 * ct_x - 2 * p1_x;
                        var b_y = 2 * ct_y - 2 * p1_y;
                        var A = 4 * (a_x * a_x + a_y * a_y);
                        var B = 4 * (a_x * b_x + a_y * b_y);
                        var C = b_x * b_x + b_y * b_y;

                        var Sabc = 2 * Math.sqrt(A + B + C);
                        var A_2 = Math.sqrt(A);
                        var A_32 = 2 * A * A_2;
                        var C_2 = 2 * Math.sqrt(C);
                        var BA = B / A_2;

                        l1 = (A_32 * Sabc + A_2 * B * (Sabc - C_2) + (4 * C * A - B * B) * Math.log((2 * A_2 + BA + Sabc) / (BA + C_2))) / (4 * A_32);
                    }
                    while (mm < 10){
                        t = (upper + lower) * 0.5;
                        x_head = (1 - t) * (1 - t) * p1_x + 2 * (1 - t) * t * ct_x + t * t * p2_x;
                        y_head = (1 - t) * (1 - t) * p1_y + 2 * (1 - t) * t * ct_y + t * t * p2_y;
                        var a_x = p1_x - 2 * ct_x + x_head;
                        var a_y = p1_y - 2 * ct_y + y_head;
                        var b_x = 2 * ct_x - 2 * p1_x;
                        var b_y = 2 * ct_y - 2 * p1_y;
                        var A = 4 * (a_x * a_x + a_y * a_y);
                        var B = 4 * (a_x * b_x + a_y * b_y);
                        var C = b_x * b_x + b_y * b_y;

                        var Sabc = 2 * Math.sqrt(A + B + C);
                        var A_2 = Math.sqrt(A);
                        var A_32 = 2 * A * A_2;
                        var C_2 = 2 * Math.sqrt(C);
                        var BA = B / A_2;

                        l = (A_32 * Sabc + A_2 * B * (Sabc - C_2) + (4 * C * A - B * B) * Math.log((2 * A_2 + BA + Sabc) / (BA + C_2))) / (4 * A_32);
                        if (Math.abs(l1 - l - arrow_length * factor) < 5e-2) break;
                        if (l1 - l < arrow_length * factor) upper = t;
                        else lower = t;
                        ++mm;
                    }
                    
                    
                    t *= 1.05;
                    this.head_start = t;
                    break;
            }
        }
         
        else if (6 <= this.head && this.head <= 9 && this.point_list.length >= 2){
            var x_head = -1;
            var y_head = -1;
            var p2_x = this.point_list[0].x;
            var p2_y = this.point_list[0].y;
            var p1_x = this.point_list[1].x;
            var p1_y = this.point_list[1].y;
            var ct_x = -1;
            var ct_y = -1;
            switch (this.point_list[0].b){
                case 0:
                    ct_x = this.point_list[0].x;
                    ct_y = this.point_list[1].y;
                    break;
                case 1:
                    ct_x = this.point_list[1].x;
                    ct_y = this.point_list[0].y;
                    break;
            }
            
            switch (this.point_list[0].b){
                case 2:                    
                    break;
                
                default:                    
                    var mm = 0;
                    var upper = 1;
                    var lower = 0;
                    var l1 = -1;
                    var l = -1;
                    {
                        var a_x = p1_x - 2 * ct_x + p2_x;
                        var a_y = p1_y - 2 * ct_y + p2_y;
                        var b_x = 2 * ct_x - 2 * p1_x;
                        var b_y = 2 * ct_y - 2 * p1_y;
                        var A = 4 * (a_x * a_x + a_y * a_y);
                        var B = 4 * (a_x * b_x + a_y * b_y);
                        var C = b_x * b_x + b_y * b_y;

                        var Sabc = 2 * Math.sqrt(A + B + C);
                        var A_2 = Math.sqrt(A);
                        var A_32 = 2 * A * A_2;
                        var C_2 = 2 * Math.sqrt(C);
                        var BA = B / A_2;

                        l1 = (A_32 * Sabc + A_2 * B * (Sabc - C_2) + (4 * C * A - B * B) * Math.log((2 * A_2 + BA + Sabc) / (BA + C_2))) / (4 * A_32);
                    }
                    while (mm < 10){
                        t = (upper + lower) * 0.5;
                        x_head = (1 - t) * (1 - t) * p1_x + 2 * (1 - t) * t * ct_x + t * t * p2_x;
                        y_head = (1 - t) * (1 - t) * p1_y + 2 * (1 - t) * t * ct_y + t * t * p2_y;
                        var a_x = p1_x - 2 * ct_x + x_head;
                        var a_y = p1_y - 2 * ct_y + y_head;
                        var b_x = 2 * ct_x - 2 * p1_x;
                        var b_y = 2 * ct_y - 2 * p1_y;
                        var A = 4 * (a_x * a_x + a_y * a_y);
                        var B = 4 * (a_x * b_x + a_y * b_y);
                        var C = b_x * b_x + b_y * b_y;

                        var Sabc = 2 * Math.sqrt(A + B + C);
                        var A_2 = Math.sqrt(A);
                        var A_32 = 2 * A * A_2;
                        var C_2 = 2 * Math.sqrt(C);
                        var BA = B / A_2;

                        l = (A_32 * Sabc + A_2 * B * (Sabc - C_2) + (4 * C * A - B * B) * Math.log((2 * A_2 + BA + Sabc) / (BA + C_2))) / (4 * A_32);
                        if (Math.abs(l1 - l - arrow_length * factor) < 5e-2) break;
                        if (l1 - l < arrow_length * factor) upper = t;
                        else lower = t;
                        ++mm;
                    }
                    
                    
                    t *= 1.05;
                    this.tail_start = t;
                    break;
            }
        }
    }
    
    
    this.routing(x_s, y_s, a_s, start_node, x_e, y_e, a_e, end_node);
    
    this.draw = function(ctx){        
        ctx.strokeStyle = this.edge_enabled ? edge_color : edge_disabled_color;
        ctx.fillStyle = this.edge_enabled ? edge_color : edge_disabled_color;
        if (this.dashed_edge) ctx.setLineDash([10 * factor, 10 * factor]);
        
        
        var p_len = this.point_list.length;
        var point_start = (6 <= this.head) ? 1 : 0;
        var point_end = p_len - 1 - ((2 <= this.head && this.head < 6) ? 1 : 0);
        
        
        ctx.lineWidth = (line_width - this.dashed_edge * 3) * factor;
        ctx.beginPath();
        ctx.moveTo(this.point_list[point_start].x, this.point_list[point_start].y);
        
        
        for (var i = point_start; i < point_end; ++i){
            var control = new point(0, 0, 0);
            
            switch (this.point_list[i].b){
                case 0:
                    control.x = this.point_list[i + 1].x;
                    control.y = this.point_list[i].y;
                    ctx.bezierCurveTo(control.x, control.y, this.point_list[i + 1].x, this.point_list[i + 1].y, this.point_list[i + 1].x, this.point_list[i + 1].y);
                    break;
                    
                case 1:
                    control.x = this.point_list[i].x;
                    control.y = this.point_list[i + 1].y;
                    ctx.bezierCurveTo(control.x, control.y, this.point_list[i + 1].x, this.point_list[i + 1].y, this.point_list[i + 1].x, this.point_list[i + 1].y);
                    break;
                    
                default:
                    ctx.lineTo(this.point_list[i + 1].x, this.point_list[i + 1].y);
                    break;
                    
            }
        }
        ctx.stroke();
        
        if (1 < this.head && this.head <= 5 && this.point_list.length >= 2){
            var x_head = -1;
            var y_head = -1;
            var p2_x = this.point_list[p_len - 1].x;
            var p2_y = this.point_list[p_len - 1].y;
            var p1_x = this.point_list[p_len - 2].x;
            var p1_y = this.point_list[p_len - 2].y;
            var ct_x = -1;
            var ct_y = -1;
            switch (this.point_list[p_len - 2].b){
                case 0:
                    ct_x = this.point_list[p_len - 1].x;
                    ct_y = this.point_list[p_len - 2].y;
                    break;
                case 1:
                    ct_x = this.point_list[p_len - 2].x;
                    ct_y = this.point_list[p_len - 1].y;
                    break;
            }
            
            switch (this.point_list[p_len - 2].b){
                case 2:
                    var l = Math.sqrt(Math.pow(arrow_length * factor, 2) / (sq(p2_x - p1_x) + sq(p2_y - p1_y)));
                    x_head = p2_x + l * (p1_x - p2_x);
                    y_head = p2_y + l * (p1_y - p2_y);
                    
                    ctx.lineWidth = (line_width - this.dashed_edge * 3) * factor;
                    ctx.beginPath();
                    ctx.moveTo(p1_x, p1_y);
                    ctx.lineTo(x_head, y_head);
                    ctx.stroke();
                    
                    break;
                
                default:
                    var t = this.head_start;
                    x_head = (1 - t) * (1 - t) * p1_x + 2 * (1 - t) * t * ct_x + t * t * p2_x;
                    y_head = (1 - t) * (1 - t) * p1_y + 2 * (1 - t) * t * ct_y + t * t * p2_y;
                    
                    ctx.beginPath();
                    ctx.moveTo(p1_x, p1_y);
                    ctx.bezierCurveTo(ct_x, ct_y, x_head, y_head, x_head, y_head);
                    ctx.stroke();
                    break;
                    
            }
            
            
            ctx.setLineDash([]);
            switch (this.head){
                case 2:
                case 3:
                    var l = Math.sqrt(Math.pow(arrow_length * factor, 2) / (sq(p2_x - x_head) + sq(p2_y - y_head)));
                    
                    var x_l = x_head - l * 0.65 * (y_head - p2_y);
                    var y_l = y_head + l * 0.65 * (x_head - p2_x);
                            
                    var x_r = x_head + l * 0.65 * (y_head - p2_y);
                    var y_r = y_head - l * 0.65 * (x_head - p2_x);
                    
                    
                    
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p2_x, p2_y);
                    ctx.lineTo(x_r, y_r);
                    ctx.lineTo(x_l, y_l);
                    ctx.closePath();
                    ctx.fill();
                    break;
            
                case 4:
                case 5:
                    var x1 = x_head - 1 * (y_head - p2_y);
                    var y1 = y_head + 1 * (x_head - p2_x);
                    
                    var x2 = x_head + 1 * (y_head - p2_y);
                    var y2 = y_head - 1 * (x_head - p2_x);
                    
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                    break;
                    
                default:
                    break;
            }
        }
        
        else if (6 <= this.head && this.head <= 9 && this.point_list.length >= 2){
            if (this.dashed_edge) ctx.setLineDash([10 * factor, 10 * factor]);
            var x_head = -1;
            var y_head = -1;
            var p2_x = this.point_list[0].x;
            var p2_y = this.point_list[0].y;
            var p1_x = this.point_list[1].x;
            var p1_y = this.point_list[1].y;
            var ct_x = -1;
            var ct_y = -1;
            switch (this.point_list[0].b){
                case 1:
                    ct_x = this.point_list[0].x;
                    ct_y = this.point_list[1].y;
                    break;
                case 0:
                    ct_x = this.point_list[1].x;
                    ct_y = this.point_list[0].y;
                    break;
            }
            
            
            switch (this.point_list[0].b){
                
                case 2:
                    var l = Math.sqrt(Math.pow(arrow_length * factor, 2) / (sq(p2_x - p1_x) + sq(p2_y - p1_y)));
                    x_head = p2_x + l * (p1_x - p2_x);
                    y_head = p2_y + l * (p1_y - p2_y);
                    
                    ctx.lineWidth = (line_width - this.dashed_edge * 3) * factor;
                    ctx.beginPath();
                    ctx.moveTo(p1_x, p1_y);
                    ctx.lineTo(x_head, y_head);
                    ctx.stroke();
                    
                    break;
                    
                    
                default:
                    var t = this.tail_start;
                    x_head = (1 - t) * (1 - t) * p1_x + 2 * (1 - t) * t * ct_x + t * t * p2_x;
                    y_head = (1 - t) * (1 - t) * p1_y + 2 * (1 - t) * t * ct_y + t * t * p2_y;
                    
                    ctx.beginPath();
                    ctx.moveTo(p1_x, p1_y);
                    ctx.bezierCurveTo(ct_x, ct_y, x_head, y_head, x_head, y_head);
                    ctx.stroke();
                    break;
                    
            }
            
            
            ctx.setLineDash([]);
            switch (this.head){
                case 6:
                case 7:
                    var l = Math.sqrt(Math.pow(arrow_length * factor, 2) / (sq(p2_x - x_head) + sq(p2_y - y_head)));
                    var x_l = x_head - l * 0.65 * (y_head - p2_y);
                    var y_l = y_head + l * 0.65 * (x_head - p2_x);
                            
                    var x_r = x_head + l * 0.65 * (y_head - p2_y);
                    var y_r = y_head - l * 0.65 * (x_head - p2_x);
                    
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p2_x, p2_y);
                    ctx.lineTo(x_r, y_r);
                    ctx.lineTo(x_l, y_l);
                    ctx.closePath();
                    ctx.fill();
                    break;
            
                case 8:
                case 9:
                    var x1 = x_head - 1 * (y_head - p2_y);
                    var y1 = y_head + 1 * (x_head - p2_x);
                    
                    var x2 = x_head + 1 * (y_head - p2_y);
                    var y2 = y_head - 1 * (x_head - p2_x);
                    
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                    break;
                    
                default:
                    break;
            }
            
            
            
            ctx.setLineDash([]);
            
        }
        
        ctx.setLineDash([]);
    }
};



function reset_view(){
    zoom = 0;
    null_x = 0;
    null_y = 0;
    change_zoom();
}



function compute_edges(){
    edges = [];
    
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    var diameter = 2 * radius;
    var connections = [];
    var nodes_anchors = {};
    for (var node_id in data){
        nodes_anchors[node_id] = {left: [], right: [], top: [], bottom: []};
    }
    
    var reactions = edge_data['reactions'];
    
    for (var reaction_id in reactions){
        var node_id = reactions[reaction_id]['n'];
        var reagents = reactions[reaction_id]['r'];
        
        for (var reagent_id in reagents){
            
            var metabolite_id = reagents[reagent_id]['n'];
            if (!(metabolite_id in data)) continue;
            var angle_metabolite = compute_angle(data[metabolite_id].x, data[metabolite_id].y, data[node_id].x, data[node_id].y, reagents[reagent_id]['a']);
            
            
            if (reagents[reagent_id]['t'] == 'educt'){
                var angle_node = compute_angle(data[node_id].x, data[node_id].y, data[metabolite_id].x, data[metabolite_id].y, reactions[reaction_id]['in']);
                connections.push([node_id, reactions[reaction_id]['in'], metabolite_id, reagents[reagent_id]['a'], reagents[reagent_id]['h'], reaction_id, reagent_id]);
                nodes_anchors[node_id][reactions[reaction_id]['in']].push([metabolite_id, connections.length - 1, angle_node]);
            }
            else{
                var angle_node = compute_angle(data[node_id].x, data[node_id].y, data[metabolite_id].x, data[metabolite_id].y, reactions[reaction_id]['out']);
                connections.push([node_id, reactions[reaction_id]['out'], metabolite_id, reagents[reagent_id]['a'], reagents[reagent_id]['h'], reaction_id, reagent_id]);
                nodes_anchors[node_id][reactions[reaction_id]['out']].push([metabolite_id, connections.length - 1, angle_node]);
                
            }
            nodes_anchors[metabolite_id][reagents[reagent_id]['a']].push([node_id, connections.length - 1, angle_metabolite]);
        }
    }
    
    
    
    var directs = edge_data['direct'];
    for (var direct_id in directs){
        var node_id_start = directs[direct_id]["ns"];
        var node_id_end = directs[direct_id]["ne"];
        var anchor_start = directs[direct_id]["as"];
        var anchor_end = directs[direct_id]["ae"];
        var head = directs[direct_id]["h"];
        if (!(node_id_start in data) || !(node_id_end in data)) continue;
        
        connections.push([node_id_start, anchor_start, node_id_end, anchor_end, head, direct_id, -1]);
        
        var angle_start = compute_angle(data[node_id_start].x, data[node_id_start].y, data[node_id_end].x, data[node_id_end].y, anchor_start);
        var angle_end = compute_angle(data[node_id_end].x, data[node_id_end].y, data[node_id_start].x, data[node_id_start].y, anchor_end);
        
        nodes_anchors[node_id_start][anchor_start].push([node_id_end, connections.length - 1, angle_start]);
        nodes_anchors[node_id_end][anchor_end].push([node_id_start, connections.length - 1, angle_end]);
        
    }
    
    
    for (var node_id in nodes_anchors){
        for (var a in anchors){
            var node_p = nodes_anchors[node_id][anchors[a]];
            var len = node_p.length;
            if (node_p.length > 1){
                
                node_p.sort(function(a, b) {
                    return a[2] > b[2];
                });
            }
        }
    }
    
    
    for (var i = 0; i < connections.length; ++i){
        var node_id = connections[i][0];
        var node_anchor = connections[i][1];
        var node_len = nodes_anchors[node_id][node_anchor].length;
        var metabolite_id = connections[i][2];
        var metabolite_anchor = connections[i][3];
        var metabolite_len = nodes_anchors[metabolite_id][metabolite_anchor].length;
        var head = connections[i][4];
        var reaction_id = connections[i][5];
        var reagent_id = connections[i][6];
        var start_x = 0, start_y = 0;
        var end_x = 0, end_y = 0;
        var node_pos = 0, metabolite_pos = 0;
        var node_width = 0, node_height = 0;
        for (var j = 0; j < nodes_anchors[node_id][node_anchor].length; ++j){
            var current_entry = nodes_anchors[node_id][node_anchor][j];
            if (current_entry[0] == metabolite_id && current_entry[1] == i){
                start_x = data[node_id].x;
                start_y = data[node_id].y;
                node_width = data[node_id].width;
                node_height = data[node_id].height;
                node_pos = j;
            }
        }
        for (var j = 0; j < nodes_anchors[metabolite_id][metabolite_anchor].length; ++j){
            var current_entry = nodes_anchors[metabolite_id][metabolite_anchor][j];
            if (current_entry[0] == node_id && current_entry[1] == i){
                end_x = data[metabolite_id].x;
                end_y = data[metabolite_id].y;
                metabolite_pos = j;
            }
        }
        var len_adjacent = diameter * (-1 / metabolite_len + 1);
        var correction_shift = metabolite_pos / (metabolite_len - 1);
        
        
        if (data[metabolite_id].type == "metabolite"){
            if (data[metabolite_id].foreign_id != -1 || editor_mode){
            
                switch (metabolite_anchor){
                    case "top":
                        end_y -= radius;
                        var w = len_adjacent;
                        end_x -= w * 0.5;
                        if (metabolite_len > 1){
                            end_x += w * correction_shift;
                        }
                        break;
                    case "bottom":
                        end_y += radius;
                        var w = len_adjacent;
                        end_x += w * 0.5;
                        if (metabolite_len > 1){
                            end_x -= w * correction_shift;
                        }
                        break;
                    case "left":
                        end_x -= radius;
                        var h = len_adjacent;
                        end_y += h * 0.5;
                        if (metabolite_len > 1){
                            end_y -= h * correction_shift;
                        }
                        break;
                    case "right":
                        end_x += radius;
                        var h = len_adjacent;
                        end_y -= h * 0.5;
                        if (metabolite_len > 1){
                            end_y += h * correction_shift;
                        }
                        break;
                }
            }
        }
        else {
            switch (metabolite_anchor){
                case "top":
                    end_y -= data[metabolite_id].height >> 1;
                    break;
                case "bottom":
                    end_y += data[metabolite_id].height >> 1;
                    break;
                case "left":
                    end_x -= data[metabolite_id].width >> 1;
                    break;
                case "right":
                    end_x += data[metabolite_id].width >> 1;
                    break;
            }
        }
        
        if (data[node_id].type == "metabolite"){
            
            if (data[node_id].foreign_id != -1 || editor_mode){
                
                var metabolite_len = nodes_anchors[node_id][node_anchor].length;
                for (var j = 0; j < nodes_anchors[node_id][node_anchor].length; ++j){
                    var current_entry = nodes_anchors[node_id][node_anchor][j];
                    if (current_entry[0] == metabolite_id && current_entry[1] == i){
                        metabolite_pos = j;
                    }
                }
                var len_adjacent = diameter * (-1 / metabolite_len + 1);
                var correction_shift = metabolite_pos / (metabolite_len - 1);
            
            
                switch (node_anchor){
                    case "top":
                        var w = len_adjacent;
                        start_x -= w * 0.5;
                        if (metabolite_len > 1){
                            start_x += w * correction_shift;
                        }
                        break;
                    case "bottom":
                        var w = len_adjacent;
                        start_x += w * 0.5;
                        if (metabolite_len > 1){
                            start_x -= w * correction_shift;
                        }
                        break;
                    case "left":
                        var h = len_adjacent;
                        start_y += h * 0.5;
                        if (metabolite_len > 1){
                            start_y -= h * correction_shift;
                        }
                        break;
                    case "right":
                        var h = len_adjacent;
                        start_y -= h * 0.5;
                        if (metabolite_len > 1){
                            start_y += h * correction_shift;
                        }
                        break;
                }
            }
        }
        
        if (data[node_id].type != "metabolite" || data[node_id].foreign_id == -1 || editor_mode){
                
                
            if ((node_anchor == 'top') || (node_anchor == 'bottom')){
                if (node_anchor == 'top'){
                    start_y -= node_height * 0.5;
                }
                else {
                    start_y += node_height * 0.5;
                }
            }
            if ((node_anchor == 'left') || (node_anchor == 'right')){
                if (node_anchor == 'left'){
                    start_x -= node_width * 0.5;
                }
                else {
                    start_x += node_width * 0.5;
                }
            }
        }
        
        
        var l2_norm = Math.sqrt(Math.pow(start_x - end_x, 2) + Math.pow(start_y - end_y, 2));
        if (l2_norm > base_grid * factor) {
            edges.push(new edge(start_x, start_y, node_anchor, data[node_id], end_x, end_y, metabolite_anchor, data[metabolite_id], head, reaction_id, reagent_id));
            data[node_id].unconnected = false;
            data[metabolite_id].unconnected = false;
        }
    }
}


function assemble_elements(do_preview){
    if (typeof do_preview === 'undefined') do_preview = false;
    
    elements = [];
    
    for (var edge of edges){
        edge.include_preview = true;
        elements.push(edge);
    }
    
    for (var node_id in data){
        data[node_id].include_preview = !do_preview || data[node_id].type != "image";
        elements.push(data[node_id]);
    }
    
    if (infobox != 0) elements.push(infobox);
    if (zoom_sign_in != 0) elements.push(zoom_sign_in);
    if (zoom_sign_out != 0) elements.push(zoom_sign_out);
    if (expand_collapse_obj != 0) elements.push(expand_collapse_obj);
    if (preview_element != 0) elements.push(preview_element);
    if (select_field_element != 0) elements.push(select_field_element);
    
    
    if (infobox != 0) infobox.include_preview = !do_preview;
    if (zoom_sign_in != 0) zoom_sign_in.include_preview = !do_preview;
    if (zoom_sign_out != 0) zoom_sign_out.include_preview = !do_preview;
    if (expand_collapse_obj != 0) expand_collapse_obj.include_preview = !do_preview;
    if (preview_element != 0) preview_element.include_preview = !do_preview;
    if (select_field_element != 0) select_field_element.include_preview = !do_preview;
}


function get_mouse_pos(canvas, evt){
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}



function prevent_zooming(e){
    if(e.ctrlKey) e.preventDefault();
}



function mouse_wheel_listener(e){
    if (!pathway_is_loaded) return;
    if(e.ctrlKey) e.preventDefault();
    var delta = Math.max(-1, Math.min(1, -e.wheelDelta || e.detail));
    var c = document.getElementById("renderarea");
    zoom_in_out(delta >= 0, get_mouse_pos(c, e));
    draw();
}
    
    
function zoom_in_out(dir, res){
    var direction = (1 - 2 * dir);
    if (zoom + direction < min_zoom || max_zoom < zoom + direction)
        return;
    zoom += direction;
    change_zoom();
    var scale = scaling;
    if (dir) scale = 1. / scale;
    
    if (!res) {
        res = [];
        res.x = window.innerWidth * 0.5;
        var nav_height = document.getElementById("navigation").getBoundingClientRect().height;
        res.y = nav_height + (window.innerHeight - nav_height) * 0.5;
    }
    
    for (var i = 0; i < elements.length; ++i){
        elements[i].scale(res.x, res.y, scale);
    }
    null_x = res.x + scale * (null_x - res.x);
    null_y = res.y + scale * (null_y - res.y);
    boundaries[0] = res.x + scale * (boundaries[0] - res.x);
    boundaries[1] = res.y + scale * (boundaries[1] - res.y);
    boundaries[2] *= scale;
    boundaries[3] *= scale;
    update_browser_link();
}


function mouse_dblclick_listener(e){
    if (!pathway_is_loaded) return;
    
    if (infobox.visible){
        infobox.visible = false;
        draw();
    }
    
    if (!moved){
        if (highlight_element && highlight_element.type == 'protein'){
            var c = document.getElementById("renderarea");
            var res = get_mouse_pos(c, e);
            highlight_element.mouse_dbl_click(res, e.which);
        }
    }
    moved = false;
}






function change_pathway(p){
    if (typeof p === "undefined"){
        var highest_group = -1;
        var highest_group_val = 0;
        for (var pg_id in pathway_groups){
            if ((highest_group_val < pathway_groups[pg_id][3]) && (pathway_groups[pg_id][2].size > 0)){
                highest_group = pg_id;
                highest_group_val = pathway_groups[pg_id][3];
            }
        }
        
        var sorted_pathways = [];
        for (pathway_id of pathway_groups[highest_group][2]){
            if (pathway_id in pathways) sorted_pathways.push([pathway_id, pathways[pathway_id][0]]);
        }
        sorted_pathways.sort(function(a, b) {
            var l_a = a[1].length;
            var l_b = b[1].length;
            
            for (var i = 0; i < Math.min(l_a, l_b); ++i){
                if (a[1].charCodeAt(i) < b[1].charCodeAt(i)) return -1;
                else if (a[1].charCodeAt(i) > b[1].charCodeAt(i)) return 1;
            }
            if (l_a < l_b) return -1;
            else if (l_a > l_b) return 1;
            return 0;
        });
        if (sorted_pathways.length > 0) p = sorted_pathways[0][0];
        
    }
    last_opened_menu = "";
    close_navigation();
    if (expand_collapse_obj != 0) expand_collapse_obj.collapse();
    reset_view();
    
    if (p in pathways){
        current_pathway = p;
        update_browser_link();
        var pw_name = replaceAll(replaceAll(pathways[p][0], "-\n", ""), "\n", " ");
        document.title = "STAMPS Home - " + pw_name;
        document.getElementById('pathway_title').innerHTML = pw_name;
        
        var metabolic_pw_menu = document.getElementById('metabolic_pathway_menu');
        var pw_group = 0;
        var pw_pathway = 0;
        var still_searching = true;
        for (var child of metabolic_pw_menu.children){
            child.children[0].className = 'select_menu_cell';
            if (child.id.endsWith("_pw_" + p)){
                still_searching = false;
                pw_pathway = child.children[0];
            }
            else if ((child.id.indexOf("_pw_") == -1) && still_searching) pw_group = child.children[0];
        }
        for (var child of signaling_pathway_menu.children){
            child.children[0].className = 'select_menu_cell';
            if (child.id.endsWith("sig_pw_" + p)){
                still_searching = false;
                pw_pathway = child.children[0];
            }
        }
        
        if (pw_group != 0) pw_group.className = 'selected_menu_cell';
        pw_pathway.className = 'selected_menu_cell';
        load_data();
    }
}




function Tip(e, name) {      
    var wmtt = document.getElementById('tooltip');
    if (wmtt != null && wmtt.style.display != 'block') {
        wmtt.style.display = "block";
        wmtt.innerHTML = name;
    }
    wmtt.style.left = (e.clientX + 20) + "px";
    wmtt.style.top  = (e.clientY + 10) + "px";
}

function unTip() {
    document.getElementById('tooltip').style.display = "none";
}


function download_assay(){
    var spectra_list = "";
    var proteins_list = "";
    for (key in basket){
        var prot = basket[key];
        if (proteins_list.length) proteins_list += ":";
        proteins_list += prot.id + "|";
        for (var i = 0; i < prot.peptides.length; ++i){
            var pep = prot.peptides[i];
            if (!pep.filter_valid || !pep.user_selected) continue;
            for (var j = 0; j < pep.spectra.length; ++j){
                if (pep.spectra[j].filter_valid && pep.spectra[j].user_selected) {
                    if (spectra_list.length) spectra_list += ":";
                    spectra_list += pep.spectra[j].id;
                }
            }
        }
        proteins_list += spectra_list + "|";
        spectra_list = "";
    }
    if (!proteins_list.length){
        alert("No proteins are selected.");
        return;
    }
    
    document.getElementById("waiting_background").style.display = "inline";
    document.getElementById("download").style.display = "inline";
    if (typeof qsdb_domain !== 'undefined' && qsdb_domain !== null){
        document.getElementById("renderarea").style.filter = "blur(5px)";
        document.getElementById("navigation").style.filter = "blur(5px)";
    }
    
    html = "<table width=100% height=100%><tr><td align=\"center\">";
    html += "<img src=\"" + file_pathname + "images/ajax-loader.gif\"></td></tr></table>"
    document.getElementById("download").innerHTML = html;
    
    
    var xmlhttp = new XMLHttpRequest();
    var download_link = "";
    var request = "proteins=" + proteins_list + "&species=" + current_species + "&topnfragments=" + top_n_fragments[filter_parameters['max_topn_fragments']] + "&ions=" + ion_types[filter_parameters['ions']] + "&host=" + encodeURL(current_host);

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            download_link = current_host + "/" + xmlhttp.responseText;
            html = "<table width=100% height=100%><tr><td align=\"center\">";
            html += "<a href=\"" + download_link + "\">download assay</a>";
            html += "<p>&nbsp;<p>";
            html += "Extracted .fasta and .blib file can be easily imported in <a href=\"https://skyline.gs.washington.edu/labkey/project/home/software/Skyline/begin.view\" target=\"_blank\">Skyline</a>.";
            html += "<p>&nbsp;<p>";
            html += "<button onclick=\"hide_download();\">Close Window</button></td></tr></table>"
            document.getElementById("download").innerHTML = html;
            
            analytics("stamps-download");
        }
    }
    xmlhttp.open("POST", file_pathname + "scripts/prepare-download.py", true);
    xmlhttp.send(request);
}



function analytics(action){
    if (!analytics_active) return;
    
    var xmlhttp_matomo = new XMLHttpRequest();
    xmlhttp_matomo.onreadystatechange = function() {
        if (xmlhttp_matomo.readyState == 4 && xmlhttp_matomo.status == 200) {
            var matomo = xmlhttp_matomo.responseText;
        }
    }
    xmlhttp_matomo.open("GET", "https://lifs.isas.de/piwik/piwik.php?idsite=1&rec=1&e_c=BMBF Metrics&e_a=" + action, true);
    xmlhttp_matomo.send();
}



function hide_download (){
    document.getElementById("waiting_background").style.display = "none";
    document.getElementById("download").style.display = "none";
    if (typeof qsdb_domain !== 'undefined' && qsdb_domain !== null){
        document.getElementById("renderarea").style.filter = "none";
        document.getElementById("navigation").style.filter = "none";
    }
}


function charge_plus(x){
    var plusses = "";
    for (var i = 0; i < x; ++i) plusses += "+";
    return plusses;
}

function delete_from_protein_table(prot_id){
    delete basket[prot_id];
    draw();
    check_spectra();
}


function filter_basket(){
    filtered_basket = {};
    for (key in basket){
        if (basket[key].filter_valid) filtered_basket[key] = basket[key];
    }
}


function show_hide_peptide_tissues(){
    for (var t in tissues){ 
        var peptide_tissues = document.getElementsByClassName(tissues[t][1]);
        for (var i = 0; i < peptide_tissues.length; ++i){
            if (peptide_tissues[i].id == "peptide_tissues"){
                peptide_tissues[i].style.display = filter_parameters['peptide_tissues_visible'] ? "inline" : "none";
            }
        }
    }
}


function show_hide_peptide_validation(){
    var peptide_validations = document.getElementsByClassName("peptide_validation");
    for (var i = 0; i < peptide_validations.length; ++i){
        peptide_validations[i].style.display = filter_parameters['validation_visible'] ? "inline" : "none";
    }
}


function show_hide_protein_tissues(){
    for (var t in tissues){ 
        var protein_tissues = document.getElementsByClassName(tissues[t][1]);
        for (var i = 0; i < protein_tissues.length; ++i){
            if (protein_tissues[i].id == "protein_tissues"){
                protein_tissues[i].style.display = filter_parameters['protein_tissues_visible'] ? "inline" : "none";
            }
        }
    }
}

function check_spectra_expand_collapse_all(do_collapse){
    for (key in filtered_basket){
        check_spectra_expand_collapse_peptide(key, do_collapse);
        var prot = filtered_basket[key];
        for (var i = 0; i < prot.peptides.length; ++i){
            var pep_id = prot.id + "_" + prot.peptides[i].peptide_seq;
            var spec_element = document.getElementById("spectrum_" + pep_id);
            if (typeof(spec_element) != 'undefined' && spec_element != null) check_spectra_expand_collapse_spectra(pep_id, do_collapse);
        }
    }
}


function check_spectra_expand_collapse_spectra(pep_id, do_collapse){
    var sign_right = String.fromCharCode(9656);
    var sign_down = String.fromCharCode(9662);
    if (typeof do_collapse === "undefined") do_collapse = document.getElementById("spectrum_" + pep_id).style.display == 'inline';
    document.getElementById("peptide_sign_" + pep_id).innerHTML = do_collapse ? sign_right : sign_down;
    document.getElementById("spectrum_" + pep_id).style.display = do_collapse ? 'none' : 'inline';
}


function check_spectra_uncheck_peptides(prot_id, check){
    var curr_prot = protein_dictionary[prot_id];
    var num_pep = 0;
    for (var i = 0; i < curr_prot.peptides.length; ++i){
        var curr_pep = curr_prot.peptides[i];
        if (!curr_pep.filter_valid) continue;
        curr_pep.user_selected = check;
        num_pep += check ? 1 : 0;
        document.getElementById("cb-" + prot_id + "-" + i).checked = check;
        for (var j = 0; j < curr_pep.spectra.length; ++j){
            var curr_spec = curr_pep.spectra[j];
            if (!curr_spec.filter_valid) continue;
            curr_spec.user_selected = check;
            document.getElementById("cb-" + prot_id + "-" + i + "-" + curr_spec.id).checked = check;
        }
    }
    document.getElementById("prot-" + prot_id + "-num_pep").innerHTML = num_pep;
}


function check_spectra_expand_collapse_peptide(prot_id, do_collapse){
    var current_prot = filtered_basket[prot_id];
    var sign_right = String.fromCharCode(9656);
    var sign_down = String.fromCharCode(9662);
    var pep_id = "peptides_" + prot_id;
    var dom_pep = document.getElementById(pep_id);
    var peptide_tissue_style = filter_parameters['peptide_tissues_visible'] ? "inline" : "none";
    var peptide_validation_style = filter_parameters['validation_visible'] ? "inline" : "none";
    if (typeof do_collapse === "undefined") do_collapse = dom_pep.style.display == "inline";
    
    if (do_collapse){
        dom_pep.innerHTML = "";
        dom_pep.style.display = "none";
        document.getElementById("protein_sign_" + current_prot.id).innerHTML = sign_right;
    }
    else {
        if (dom_pep.style.display == "inline") return;
        document.getElementById("protein_sign_" + current_prot.id).innerHTML = sign_down;
        dom_pep.style.display = "inline";
        for (var j = 0; j < current_prot.peptides.length; ++j){
            var current_pep = current_prot.peptides[j];
            if (!current_pep.filter_valid) continue;
            var specs = prot_id + "_" + current_pep.peptide_seq;
            var n_specs = current_pep.spectra.length;
            
            var onclick_command = "var curr_pep = protein_dictionary[" + current_prot.id + "].peptides[" + j + "]; \
            curr_pep.user_selected = !curr_pep.user_selected; \
            for (var k = 0; k < curr_pep.spectra.length; ++k){ \
                if (!curr_pep.spectra[k].filter_valid) continue; \
                curr_pep.spectra[k].user_selected = curr_pep.user_selected; \
                document.getElementById('cb-" + current_prot.id + "-" + j + "-' + curr_pep.spectra[k].id).checked = curr_pep.user_selected; \
            } \
            var curr_prot = protein_dictionary[" + current_prot.id + "]; \
            var num_pep = 0; \
            for (var j = 0; j < protein_dictionary[" + current_prot.id + "].peptides.length; ++j){ \
                if (!curr_prot.peptides[j].filter_valid || !curr_prot.peptides[j].user_selected) continue; \
                ++num_pep; \
            } \
            document.getElementById('prot-' + " + current_prot.id + " + '-num_pep').innerHTML = num_pep;";
            var dom_pep_tr = document.createElement("tr");
            dom_pep.appendChild(dom_pep_tr);
            dom_pep_tr.setAttribute("id", specs);
            
            
            var dom_pep_td = document.createElement("td");
            dom_pep_tr.appendChild(dom_pep_td);
            dom_pep_td.setAttribute("width", "100%");
            dom_pep_td.setAttribute("onclick", "check_spectra_expand_collapse_spectra('" + specs + "');");
            dom_pep_td.setAttribute("style", "border-bottom: 1px solid #d3d3d3; cursor: pointer; color: " + (n_specs ? "black" : disabled_text_color) + ";");
            
            dom_pep_txt = document.createTextNode("\u00A0\u00A0\u00A0\u00A0");
            var dom_div_space = document.createElement("div");
            dom_pep_td.appendChild(dom_div_space);
            dom_div_space.setAttribute("style", "display: inline; margin: 0px; padding: 0px; float: left;");
            dom_div_space.appendChild(dom_pep_txt);
            
            
            var dom_pep_div = document.createElement("div");
            dom_pep_td.appendChild(dom_pep_div);
            dom_pep_div.setAttribute("style", "display:inline; margin: 0px; padding: 0px; float: left;");
            dom_pep_div.setAttribute("id", "peptide_sign_" + specs);
            
            
            dom_pep_sign = document.createTextNode(sign_right);
            dom_pep_div.appendChild(dom_pep_sign);
            
            
            
            dom_pep_seq = document.createTextNode("\u00A0" + current_pep.peptide_seq + "\u00A0");
            var dom_div_pep_info = document.createElement("div");
            dom_pep_td.appendChild(dom_div_pep_info);
            dom_div_pep_info.setAttribute("style", "display: inline; margin: 0px; padding: 0px; float: left;");
            dom_div_pep_info.appendChild(dom_pep_seq);
            
            
            
            var dom_div_pep_font1 = document.createElement("font");
            dom_div_pep_font1.setAttribute("color", "#ffbebe");
            dom_div_pep_font1.innerHTML = "???";
            var dom_div_pep_font2 = document.createElement("font");
            dom_div_pep_font2.setAttribute("color", "#feff90");
            dom_div_pep_font2.innerHTML = "???";
            var dom_div_pep_font3 = document.createElement("font");
            dom_div_pep_font3.setAttribute("color", "#a0ff90");
            dom_div_pep_font3.innerHTML = "???";
            
            var dom_div_pep_validation = document.createElement("div");
            dom_pep_td.appendChild(dom_div_pep_validation);
            dom_div_pep_validation.setAttribute("class", "peptide_validation");
            dom_div_pep_validation.setAttribute("style", "display: inline; margin: 0px; padding: 0px; float: left; display: " + peptide_validation_style + ";");
            
            dom_div_pep_validation.appendChild(dom_div_pep_font1);
            if ((current_pep.confidence & 1) == 1) dom_div_pep_validation.appendChild(dom_div_pep_font2);
            if ((current_pep.confidence & 2) == 2) dom_div_pep_validation.appendChild(dom_div_pep_font3);
            
            
    
            var curr_pep_tissues = Array.from(Object.keys(current_pep.tissues)).sort();
            if (curr_pep_tissues.length > 0){
                dom_pep_space = document.createTextNode("\u00A0\u00A0");
                dom_pep_td.appendChild(dom_pep_space);
                
                
                for (var t = 0; t < curr_pep_tissues.length; ++t){
                    if (curr_pep_tissues[t] in tissues){
                        var orientation = (tissues[curr_pep_tissues[t]][2].width > tissues[curr_pep_tissues[t]][2].height) ? "width" : "height";
                        var dom_pep_img = document.createElement("div");
                        dom_pep_td.appendChild(dom_pep_img);
                        dom_pep_img.setAttribute("id", "peptide_tissues");
                        dom_pep_img.setAttribute("class", tissues[curr_pep_tissues[t]][1]);
                        dom_pep_img.setAttribute("title", tissues[curr_pep_tissues[t]][1]);
                        dom_pep_img.setAttribute("style", "display: " + peptide_tissue_style);
                    }
                }
            }
            
            
            
            
            
            var dom_pep_td2 = document.createElement("td");
            dom_pep_tr.appendChild(dom_pep_td2);
            dom_pep_td2.setAttribute("style", "border-bottom: 1px solid #d3d3d3; padding-right: 10px;");
            dom_pep_td2.setAttribute("align", "right");
            
            var dom_pep_td2_input = document.createElement("input");
            dom_pep_td2.appendChild(dom_pep_td2_input);
            dom_pep_td2_input.setAttribute("style", "display: inline;");
            dom_pep_td2_input.setAttribute("type", "checkbox");
            dom_pep_td2_input.setAttribute("id", "cb-" + current_prot.id + "-" + j);
            dom_pep_td2_input.setAttribute("title", "(De)select all peptides for protein '" + protein_dictionary[current_prot.id].accession + "' by right clicking.");
            dom_pep_td2_input.setAttribute("onclick", onclick_command);
            dom_pep_td2_input.prot_id =  current_prot.id;
            dom_pep_td2_input.addEventListener("contextmenu", function(event){check_spectra_uncheck_peptides(this.prot_id, !this.checked); event.preventDefault(); return false;}, false);
            dom_pep_td2_input.checked = current_pep.user_selected;
            
            
            
            
            var dom_pep_td3 = document.createElement("td");
            dom_pep_tr.appendChild(dom_pep_td3);
            dom_pep_td3.setAttribute("style", "border-bottom: 1px solid #d3d3d3;");
            dom_pep_td3.setAttribute("align", "right");
            
            var dom_div_protter = document.createElement("font");
            dom_pep_td3.appendChild(dom_div_protter);
            dom_div_protter.setAttribute("style", "cursor: pointer; display: inline; margin: 0px; padding: 0px; float: left;");
            dom_div_protter.setAttribute("face", "Arial,Helvetica");
            dom_div_protter.setAttribute("color", "#e17009");
            var protter_link = "http://wlab.ethz.ch/protter/#up=" + current_prot.accession + "&tm=auto&legend&n:myRegionName,fc:yellow,bc:blue,cc:white=" + (current_pep.start_pos + 1) + "-" + (current_pep.start_pos + current_pep.peptide_seq.length).toString();
            dom_div_protter.setAttribute("onclick", "window.open('" + protter_link + "')");
            dom_div_protter.innerHTML = "<b>P</b>";
            
            
            var dom_pep_tr2 = document.createElement("tr");
            dom_pep.appendChild(dom_pep_tr2);
            
            var dom_pep_tr2_td = document.createElement("td");
            dom_pep_tr2.appendChild(dom_pep_tr2_td);
            dom_pep_tr2_td.setAttribute("width", "100%");
            
            
            var dom_spec_table = document.createElement("table");
            dom_pep_tr2_td.appendChild(dom_spec_table);
            dom_spec_table.setAttribute("cellspacing", 0);
            dom_spec_table.setAttribute("cellpadding", 0);
            dom_spec_table.setAttribute("id", "spectrum_" + specs);
            dom_spec_table.setAttribute("style", "display: none;");
            
            for (var k = 0; k < n_specs; ++k){
                if (!current_pep.spectra[k].filter_valid) continue;
                var curr_spec = current_pep.spectra[k];
                var onclick_spec_command = "var curr_spec = protein_dictionary[" + current_prot.id + "].peptides[" + j + "].spectra[" + k + "]; \
                curr_spec.user_selected = !curr_spec.user_selected; \
                if (curr_spec.user_selected && !document.getElementById('cb-" + current_prot.id + "-" + j + "').checked) { \
                    protein_dictionary[" + current_prot.id + "].peptides[" + j + "].user_selected = true; \
                    document.getElementById('cb-" + current_prot.id + "-" + j + "').checked = true; \
                } \
                var curr_prot = protein_dictionary[" + current_prot.id + "]; \
                var num_pep = 0; \
                for (var j = 0; j < protein_dictionary[" + current_prot.id + "].peptides.length; ++j){ \
                    if (!curr_prot.peptides[j].filter_valid || !curr_prot.peptides[j].user_selected) continue; \
                    ++num_pep; \
                } \
                document.getElementById('prot-' + " + current_prot.id + " + '-num_pep').innerHTML = num_pep;";
                
                var dom_spec_tr = document.createElement("tr");
                dom_spec_table.appendChild(dom_spec_tr);
                
                
                var dom_spec_td1 = document.createElement("td");
                dom_spec_tr.appendChild(dom_spec_td1);
                dom_spec_td1.setAttribute("width", "100%");
                dom_spec_td1.setAttribute("onclick", "load_spectrum(" + curr_spec.id + ", null, 'check_spectra');");
                dom_spec_td1.setAttribute("style", "border-bottom: 1px solid #d3d3d3; cursor: pointer;");
                
                var dom_spec_td1_txt = document.createTextNode("\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" + curr_spec['mass'] + charge_plus(curr_spec['charge']));
                dom_spec_td1.appendChild(dom_spec_td1_txt);
                
                
                var dom_spec_td2 = document.createElement("td");
                dom_spec_tr.appendChild(dom_spec_td2);
                dom_spec_td2.setAttribute("style", "border-bottom: 1px solid #d3d3d3; padding-right: 20px;");
                dom_spec_td2.setAttribute("align", "right");
                
                var dom_spec_td2_input = document.createElement("input");
                dom_spec_td2.appendChild(dom_spec_td2_input);
                dom_spec_td2_input.setAttribute("style", "display: inline;");
                dom_spec_td2_input.setAttribute("type", "checkbox");
                dom_spec_td2_input.setAttribute("onclick", onclick_spec_command);
                dom_spec_td2_input.setAttribute("id", "cb-" + current_prot.id + "-" + j + "-" + curr_spec.id);
                dom_spec_td2_input.checked = curr_spec.user_selected;
                
            }
        }
    }
}





function check_spectra(){
    var expanded_proteins = [];
    var expanded_peptides = [];
    last_opened_menu = "";
    if (document.getElementById("filter_panel_wrapper") != null) document.getElementById("filter_panel_wrapper").innerHTML = "";
    if (document.getElementById("check_spectra_panel").innerHTML != ""){
        var table_children = document.getElementById("check_spectra_panel").children[0].children;
        for (var i = 0; i < table_children.length; ++i){
            if (table_children[i].hasAttribute("id")){
                var prot_id = table_children[i].getAttribute("id");
                if (document.getElementById('peptides_' + prot_id).style.display == 'inline') expanded_proteins.push(prot_id);
            }
            else if (table_children[i].children[0].children[0].style.display == "inline"){
                var prot_children = table_children[i].children[0].children[0].children;
                for (var j = 0; j < prot_children.length; ++j){
                    if (prot_children[j].hasAttribute("id")){
                        var pep_id = prot_children[j].getAttribute("id");
                        if (document.getElementById("spectrum_" + pep_id).style.display == 'inline') expanded_peptides.push(pep_id);
                    }
                }
            }
        }   
    }
    
    
    
    filter_basket();
    document.getElementById("check_spectra_panel").innerHTML = "";
    
    document.getElementById("check_spectra_filter_label").innerHTML = "Show filter settings";
    document.getElementById("check_spectra_filter_panel_check_spectra").innerHTML = "";
    document.getElementById("check_spectra_filter_panel_check_spectra").style.display = "none";
    filter_parameters["filter_panel_visible"] = false;
    
    
    document.getElementById("check_spectra").style.display = "inline";
    document.getElementById("waiting_background").style.display = "inline";
    if (typeof qsdb_domain !== 'undefined' && qsdb_domain !== null){
        document.getElementById("renderarea").style.filter = "blur(5px)";
        document.getElementById("navigation").style.filter = "blur(5px)";
    }
    resize_ms_view("check_spectra");
    spectrum_loaded = false;
    draw_spectrum("check_spectra");
    
    document.getElementById("check_spectra_error_value").value = (document.getElementById("check_spectra_radio_ppm").checked ? tolerance_relative : tolerance_absolute);
    
    var dom_table = document.createElement("table");
    document.getElementById("check_spectra_panel").appendChild(dom_table);
    dom_table.setAttribute("id", "review_proteins_table");
    dom_table.setAttribute("width", "100%"); 
    dom_table.setAttribute("cellspacing", "0"); 
    dom_table.setAttribute("border", "0"); 
    var proteins_content = [];
    
    for (key in filtered_basket){
        proteins_content.push([filtered_basket[key].name, filtered_basket[key]]);
    }
    proteins_content.sort();
    
    
    var sign_right = String.fromCharCode(9656); // triangle right
    var sign_down = String.fromCharCode(9662); // triangle down
    var protein_tissue_style = filter_parameters['protein_tissues_visible'] ? "inline" : "none";
    for (var i = 0; i < proteins_content.length; ++i){
        var current_prot = proteins_content[i][1];
        
        var bg_color = (i & 1) ? "#DDDDDD" : "white";
        var num_pep = 0;
        for (var j = 0; j < current_prot.peptides.length; ++j){
            if (!current_prot.peptides[j].filter_valid || !current_prot.peptides[j].user_selected) continue;
            num_pep += 1;
        }
        
        var dom_tr = document.createElement("tr");
        dom_table.appendChild(dom_tr);
        dom_tr.setAttribute("id", current_prot.id);
        
        var dom_td1 = document.createElement("td");
        dom_tr.appendChild(dom_td1);
        var dom_td2 = document.createElement("td");
        dom_tr.appendChild(dom_td2);
        var dom_td3 = document.createElement("td");
        dom_tr.appendChild(dom_td3);
        
        
        dom_td1.setAttribute("width", "90%");
        dom_td1.setAttribute("bgcolor", bg_color);
        dom_td1.setAttribute("onclick", "check_spectra_expand_collapse_peptide(" + current_prot.id + ");");
        dom_td1.setAttribute("style", "cursor: pointer;");
        
        var dom_t1 = document.createTextNode("  ");
        dom_td1.appendChild(dom_t1);
        
        var dom_div1 = document.createElement("div");
        dom_td1.appendChild(dom_div1);
        dom_div1.setAttribute("style", "display:inline; margin: 0px; padding: 0px; float: left;");
        dom_div1.setAttribute("id", "protein_sign_" + current_prot.id);
        
        var dom_sign = document.createTextNode(sign_right);
        dom_div1.appendChild(dom_sign);
        
        var dom_div_prot_info = document.createElement("div");
        dom_td1.appendChild(dom_div_prot_info);
        dom_div_prot_info.setAttribute("style", "display: inline; margin: 0px; padding: 0px; float: left;");
        var sing_plur = "Peptide" + (num_pep > 1 ? "s" : "");
        
        var dom_div_prot_num_pep = document.createElement("div");
        dom_div_prot_num_pep.setAttribute("id", "prot-" + current_prot.id + "-num_pep");
        dom_div_prot_num_pep.setAttribute("style", "display: inline; margin: 0px; padding: 0px;");
        dom_div_prot_num_pep.innerHTML = num_pep;
        
        var dom_t_info = document.createTextNode("\u00A0" + proteins_content[i][0] + " | " + current_prot.accession + " | ");
        var dom_t_info2 = document.createTextNode(" " + sing_plur + "\u00A0");
        dom_div_prot_info.appendChild(dom_t_info);
        dom_div_prot_info.appendChild(dom_div_prot_num_pep);
        dom_div_prot_info.appendChild(dom_t_info2);
        
        
        var curr_tissues = Array.from(Object.keys(current_prot.tissues)).sort();
        if (curr_tissues.length > 0){
            var dom_t2 = document.createTextNode("\u00A0\u00A0");
            dom_td1.appendChild(dom_t2);
            
            for (var t = 0; t < curr_tissues.length; ++t){
                if (curr_tissues[t] in tissues){
                    var tissue_data = tissues[curr_tissues[t]];
                    var dom_div_tissue = document.createElement("div");
                    dom_td1.appendChild(dom_div_tissue);
                    dom_div_tissue.setAttribute("id", "protein_tissues");
                    dom_div_tissue.setAttribute("class", tissue_data[1]);
                    dom_div_tissue.setAttribute("title", tissue_data[1]);
                    dom_div_tissue.setAttribute("style", "display: " + (filter_parameters['protein_tissues_visible'] ? "inline" : "none"));
                }
            }
        }
        dom_td2.setAttribute("bgcolor", bg_color);
        dom_td2.setAttribute("align", "right");
        dom_td3.setAttribute("bgcolor", bg_color);
        dom_td3.setAttribute("align", "right");
        
        var dom_img_del = document.createElement("div");
        dom_td2.appendChild(dom_img_del);
        dom_img_del.setAttribute("class", "Del");
        dom_img_del.setAttribute("onclick", "delete_from_protein_table(" + current_prot.id + ");");
        
        
        var dom_div_protter = document.createElement("font");
        dom_td3.appendChild(dom_div_protter);
        dom_div_protter.setAttribute("style", "cursor: pointer; display: inline; margin: 0px; padding: 0px; float: left;");
        dom_div_protter.setAttribute("face", "Arial,Helvetica");
        dom_div_protter.setAttribute("color", "#e17009");
        var protter_link = "http://wlab.ethz.ch/protter/#up=" + current_prot.accession + "&tm=auto&legend&n:myRegionName,fc:yellow,bc:blue,cc:white=";
        
        for (var j = 0; j < current_prot.peptides.length; ++j){
            var current_pep = current_prot.peptides[j];
            if (j > 0) protter_link += ",";
            protter_link += (current_pep.start_pos + 1) + "-" + (current_pep.start_pos + current_pep.peptide_seq.length).toString();
        }
        dom_div_protter.setAttribute("onclick", "window.open('" + protter_link + "')");
        dom_div_protter.innerHTML = "<b>P</b>";
        
        
        
        var dom_tr_pep = document.createElement("tr");
        dom_table.appendChild(dom_tr_pep);
        
        var dom_td_pep = document.createElement("td");
        dom_tr_pep.appendChild(dom_td_pep);
        dom_td_pep.setAttribute("width", "100%");
        var dom_table_pep = document.createElement("table");
        dom_td_pep.appendChild(dom_table_pep);
        dom_table_pep.setAttribute("border", 0);
        dom_table_pep.setAttribute("cellspacing", 0);
        dom_table_pep.setAttribute("cellpadding", 0);
        dom_table_pep.setAttribute("id", "peptides_" + current_prot.id);
        dom_table_pep.setAttribute("style", "display: none;");
    }
    
    if (expanded_proteins.length > 0){
        for (var i = 0; i < expanded_proteins.length; ++i){
            var prot_id = expanded_proteins[i];
            var pep_element = document.getElementById('peptides_' + prot_id);
            if (typeof(pep_element) != 'undefined' && pep_element != null) check_spectra_expand_collapse_peptide(prot_id);
        }
    }
    
    if (expanded_peptides.length > 0){
        for (var i = 0; i < expanded_peptides.length; ++i){
            var pep_id = expanded_peptides[i];
            var spec_element = document.getElementById(pep_id);
            if (typeof(spec_element) != 'undefined' && spec_element != null) check_spectra_expand_collapse_spectra(pep_id);
        }
    }
}








function get_pathways(){
    
    var xmlhttp_pw = new XMLHttpRequest();
    xmlhttp_pw.onreadystatechange = function() {
        if (xmlhttp_pw.readyState == 4 && xmlhttp_pw.status == 200) {
            pathways = JSON.parse(xmlhttp_pw.responseText);
            set_pathway_menu();
            
        }
    }
    xmlhttp_pw.open("GET", file_pathname + "scripts/get-pathways.bin?host=" + encodeURL(current_host), true);
    xmlhttp_pw.send();
}






function set_frame(){
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





function get_pathway_groups(){
    // get pathway groups
    var xmlhttp_pg = new XMLHttpRequest();
    xmlhttp_pg.onreadystatechange = function() {
        if (xmlhttp_pg.readyState == 4 && xmlhttp_pg.status == 200) {
            pathway_groups = JSON.parse(xmlhttp_pg.responseText);
            for (pg_id in pathway_groups) pathway_groups[pg_id][2] = new Set(pathway_groups[pg_id][2].split(","));
            get_pathways();
        }
    }
    xmlhttp_pg.open("GET", file_pathname + "scripts/get-pathway-groups.py?host=" + encodeURL(current_host), false);
    xmlhttp_pg.send();
    
}


function hide_background(){
    if (background_hiding != 0){
        document.getElementById("click_background").style.display = "none";
        background_hiding();
    }
}


function hide_accession_search (forward){
    document.getElementById("accession_search").style.display = "none";
    if (!forward) document.getElementById("waiting_background").style.display = "none";
}

function hide_locus_search (forward){
    document.getElementById("locus_search").style.display = "none";
    if (!forward) document.getElementById("waiting_background").style.display = "none";
}

function hide_function_search (forward){
    document.getElementById("function_search").style.display = "none";
    if (!forward) document.getElementById("waiting_background").style.display = "none";
}

function hide_chromosome_search (forward){
    document.getElementById("chromosome_search").style.display = "none";
    if (!forward) document.getElementById("waiting_background").style.display = "none";
}


function hide_check_spectra (){
    document.getElementById("waiting_background").style.display = "none";
    document.getElementById("check_spectra").style.display = "none";
    if (typeof qsdb_domain !== 'undefined' && qsdb_domain !== null){
        document.getElementById("renderarea").style.filter = "";
        document.getElementById("navigation").style.filter = "";
    }
}



function start_search(){
    var search_text = document.getElementById("search_field").value;
    var len_p = search_text.length;
    if (len_p > 2){
        var masks = new Array(128).fill(0);
        
        var lower = search_text.toLowerCase();
        var upper = search_text.toUpperCase();
        
        
        var bit = 1;
        for (var i = 0; i < len_p; ++i, bit <<= 1){
            masks[lower.charCodeAt(i)] |= bit;
            masks[upper.charCodeAt(i)] |= bit;
            if (lower.charAt(i) == '-') masks[' '.charCodeAt(0)] |= bit;
            if (lower.charAt(i) == ' ') masks['-'.charCodeAt(0)] |= bit;
            if (lower.charAt(i) == '.') masks[','.charCodeAt(0)] |= bit;
            if (lower.charAt(i) == ',') masks['.'.charCodeAt(0)] |= bit;
        }
        
        var accept = 1 << (len_p - 1);
        var results = [];
        for (var i = 0; i < search_data.length; ++i){
            var s_data = search_data[i];
            var r = search_pattern(s_data[0], len_p, accept, masks, s_data[1], s_data[2]);
            if (r.length) results = results.concat(r);
        }
        
        for (var node_id in data){
            var r = data[node_id].search(len_p, accept, masks);
            if (r.length) results = results.concat(r);
        }
        results.sort();
        
        
        if (results.length){
            document.getElementById("search_results").style.display = "inline";
            document.getElementById("menu_background").style.display = "inline";
            var rect = document.getElementById('search_field_nav').getBoundingClientRect();
            document.getElementById("search_results").style.top = (rect.top + document.getElementById('search_field_nav').offsetHeight).toString() + "px";
            document.getElementById("search_results").style.left = (rect.left).toString() + "px";
            var inner_html = "<table>";
            for (var i = 0; i < results.length; ++i){
                var t1 = "<font color=\"" + disabled_text_color + "\">" + results[i][0].substring(0, results[i][1]) + "</font>";
                
                var t2 = results[i][0].substring(results[i][1], results[i][1] + len_p);
                
                var t3 = "<font color=\"" + disabled_text_color + "\">" + results[i][0].substring(results[i][1] + len_p, results[i][0].length);
                
                var foreign_pw = (results[i][3] != current_pathway && (results[i][3] in pathways)) ? " (" + pathways[results[i][3]][0] + ")" : "";
                inner_html += "<tr><td class=\"single_search_result\" onclick=\"highlight_node(" + results[i][2] + ", " + results[i][3] + ");\">" + t1 + t2 + t3 + foreign_pw + "<font></td></tr>";
            }
            inner_html += "</table>";
            document.getElementById("search_results").innerHTML = inner_html;
            document.getElementById("search_results").style.width = (rect.top + document.getElementById('search_results').width + 20).toString() + "px";
        }
        else {
            close_navigation();
        }
    }
    else {
        close_navigation();
    }
}


function highlight_node(node_id, pathway_id){
    close_navigation();
    if (pathway_id != current_pathway){
        change_pathway(pathway_id);
        var waiting_for_pathway = setInterval(function(){
            if (pathway_is_loaded){
                clearInterval (waiting_for_pathway);
                highlight_node_inner(node_id);
            }
        }, 25);
    }
    else {
        highlight_node_inner(node_id);
    }
}



function get_pathname(){
    var pname = window.location.pathname;
    var tokens = pname.split("/");
    if (tokens[tokens.length - 1].indexOf(".") > -1){
        pname = "";
        for (var i = 0; i < tokens.length - 1; ++i){
            pname += tokens[i] + "/";
        }
    }
    return pname;
}




function highlight_node_inner(node_id){
    var progress = 0;
    var steps = 30;
    var time = 3; // seconds
    var std_dev = time / 6.;
    var c = document.getElementById("renderarea");
    document.getElementById("animation_background").style.display = "inline";
    var x = data[node_id].x;
    var y = data[node_id].y;
    var width  = window.innerWidth * 0.5;
    var height = window.innerHeight * 0.5;
    var scale = Math.pow(Math.pow(scaling, highlight_zoom - zoom), 1 / (time * steps));
    var zoom_scale = (highlight_zoom - zoom) / (time * steps);
    
    var moving = setInterval(function(node_id){
        if (progress >= time) {
            zoom = highlight_zoom;
            var l = 0, ii = 0;
            highlighting = setInterval(function(node_id){
                if (ii >= 3){
                    clearInterval (highlighting);
                }
                else {
                    data[node_id].highlight = (l < 25);
                    draw();
                    l += 1;
                    if (l >= 50){
                        l = 0; ii += 1;
                    }
                }
            }, 20, node_id);
            document.getElementById("animation_background").style.display = "none";
            clearInterval (moving);
            zoom = highlight_zoom;
            change_zoom();
            draw();
            
        }
        else {
            var split = Math.exp(-0.5 * sq((progress - time * 0.5) / std_dev)) / (Math.sqrt(2 * Math.PI) * std_dev) / steps;
            
            for (var node_id in data){
                data[node_id].width *= scale;
                data[node_id].height *= scale;
                data[node_id].orig_height *= scale;
                data[node_id].x = width + scale * (data[node_id].x + split * (width - x) - width);
                data[node_id].y = height + scale * (data[node_id].y + split * (height - y) - height);
            }
            for (var i = 0; i < edges.length; ++i){
                for (var j = 0; j < edges[i].point_list.length; ++j){
                    edges[i].point_list[j].x = width + scale * (edges[i].point_list[j].x + split * (width - x) - width);
                    edges[i].point_list[j].y = height + scale * (edges[i].point_list[j].y + split * (height - y) - height);
                }
            }
            
            
            infobox.x = width + scale * (infobox.x + split * (width - x) - width);
            infobox.y = height + scale * (infobox.y + split * (height - y) - height);
            x = width + scale * (x - width);
            y = height + scale * (y - height);
            null_x = width + scale * (null_x - width);
            null_y = height + scale * (null_y - height);
            boundaries[0] = width + scale * (boundaries[0] + split * (width - x) - width);
            boundaries[1] = height + scale * (boundaries[1] + split * (height - y) - height);
            boundaries[2] *= scale;
            boundaries[3] *= scale;
            
            var rect = c.getBoundingClientRect();
            mouse_move_listener(
            {
                clientX: mouse_x + rect.left,
                clientY: mouse_y + rect.top
            });
            
            zoom += zoom_scale;
            change_zoom();
            update_browser_link();
            draw();
            progress += 1 / steps;
        }
    }, steps, node_id);
    
}



function select_species(){
    if (last_opened_menu != "select_species"){
        var rect = document.getElementById('select_species_nav').getBoundingClientRect();
        document.getElementById("select_species").style.top = (rect.top + document.getElementById('select_species_nav').offsetHeight).toString() + "px";
        document.getElementById("select_species").style.left = (rect.left).toString() + "px";
        document.getElementById("select_species").style.display = "inline";
        document.getElementById("menu_background").style.display = "inline";
        last_opened_menu = "select_species";
    }
    else {
        last_opened_menu = "";
    }
}


function open_filter_panel(){
    if (last_opened_menu != "filter_panel_wrapper"){
        document.getElementById("check_spectra_filter_panel_check_spectra").innerHTML = "";
        document.getElementById("filter_panel_wrapper").innerHTML = filter_panel_data;
        document.getElementById("filter_panel_wrapper").style.display = "inline";
        var rect = document.getElementById('filter_panel_nav').getBoundingClientRect();
        load_filter_parameters();
        document.getElementById("filter_panel_wrapper").style.top = (rect.top + document.getElementById('filter_panel_nav').offsetHeight).toString() + "px";
        document.getElementById("filter_panel_wrapper").style.left = (rect.left).toString() + "px";
        document.getElementById("menu_background").style.display = "inline";
        last_opened_menu = "filter_panel_wrapper";
    }
    else {
        last_opened_menu = "";
    }
}



function adopt_filter_parameters(){
    filter_parameters["min_peptide_length"] = document.getElementById("min_peptide_length").value;
    filter_parameters["max_peptide_length"] = document.getElementById("max_peptide_length").value;
    filter_parameters["min_precursor_charge"] = document.getElementById("min_precursor_charge").value;
    filter_parameters["max_precursor_charge"] = document.getElementById("max_precursor_charge").value;
    filter_parameters["max_topn_fragments"] = document.getElementById("max_topn_fragments").selectedIndex;
    filter_parameters["ions"] = document.getElementById("ions").selectedIndex;
    filter_parameters["oxy_m_off"] = document.getElementById("oxy_m_off").checked;
    filter_parameters["oxy_m_var"] = document.getElementById("oxy_m_var").checked;
    filter_parameters["oxy_m_fix"] = document.getElementById("oxy_m_fix").checked;
    filter_parameters["carba_c_off"] = document.getElementById("carba_c_off").checked;
    filter_parameters["carba_c_var"] = document.getElementById("carba_c_var").checked;
    filter_parameters["carba_c_fix"] = document.getElementById("carba_c_fix").checked;
    for (tissue_key in tissues){
        filter_parameters["tissue_" + tissues[tissue_key][1].toLowerCase()] = document.getElementById("check_" + tissues[tissue_key][1].toLowerCase()).checked;
    }
    filter_parameters["validation_top_n"] = document.getElementById("validation_top_n").checked;
    filter_parameters["validation_prm"] = document.getElementById("validation_prm").checked;
    filter_parameters["validation_is"] = document.getElementById("validation_is").checked;
    filter_parameters["enable_unreviewed"] = document.getElementById("enable_unreviewed").checked;
}


function load_filter_parameters(){
    document.getElementById("min_peptide_length").value = filter_parameters["min_peptide_length"];
    document.getElementById("max_peptide_length").value = filter_parameters["max_peptide_length"];
    document.getElementById("min_precursor_charge").value = filter_parameters["min_precursor_charge"];
    document.getElementById("max_precursor_charge").value = filter_parameters["max_precursor_charge"];
    document.getElementById("max_topn_fragments").selectedIndex = filter_parameters["max_topn_fragments"];
    document.getElementById("ions").selectedIndex = filter_parameters["ions"];
    document.getElementById("oxy_m_off").checked = filter_parameters["oxy_m_off"];
    document.getElementById("oxy_m_var").checked = filter_parameters["oxy_m_var"];
    document.getElementById("oxy_m_fix").checked = filter_parameters["oxy_m_fix"];
    document.getElementById("carba_c_off").checked = filter_parameters["carba_c_off"];
    document.getElementById("carba_c_var").checked = filter_parameters["carba_c_var"];
    document.getElementById("carba_c_fix").checked = filter_parameters["carba_c_fix"];
    for (tissue_key in tissues){
        document.getElementById("check_" + tissues[tissue_key][1].toLowerCase()).checked = filter_parameters["tissue_" + tissues[tissue_key][1].toLowerCase()];
    }
    document.getElementById("validation_top_n").checked = filter_parameters["validation_top_n"];
    document.getElementById("validation_prm").checked = filter_parameters["validation_prm"];
    document.getElementById("validation_is").checked = filter_parameters["validation_is"];
    document.getElementById("enable_unreviewed").checked = filter_parameters["enable_unreviewed"];
}



function hide_filter_panel(){
    var filter_panel_wrapper = document.getElementById("filter_panel_wrapper");
    if (typeof(filter_panel_wrapper) !== "undefined" && filter_panel_wrapper != null && filter_panel_wrapper.style.display == "inline"){
        var filter_changed = false;
        if (filter_parameters["min_peptide_length"] != document.getElementById("min_peptide_length").value) filter_changed = true;
        if (filter_parameters["max_peptide_length"] != document.getElementById("max_peptide_length").value) filter_changed = true;
        if (filter_parameters["min_precursor_charge"] != document.getElementById("min_precursor_charge").value) filter_changed = true;
        if (filter_parameters["max_precursor_charge"] != document.getElementById("max_precursor_charge").value) filter_changed = true;
        if (filter_parameters["max_topn_fragments"] != document.getElementById("max_topn_fragments").selectedIndex) filter_changed = true;
        if (filter_parameters["ions"] != document.getElementById("ions").selectedIndex) filter_changed = true;
        if (filter_parameters["oxy_m_off"] != document.getElementById("oxy_m_off").checked) filter_changed = true;
        if (filter_parameters["oxy_m_var"] != document.getElementById("oxy_m_var").checked) filter_changed = true;
        if (filter_parameters["oxy_m_fix"] != document.getElementById("oxy_m_fix").checked) filter_changed = true;
        if (filter_parameters["carba_c_off"] != document.getElementById("carba_c_off").checked) filter_changed = true;
        if (filter_parameters["carba_c_var"] != document.getElementById("carba_c_var").checked) filter_changed = true;
        if (filter_parameters["carba_c_fix"] != document.getElementById("carba_c_fix").checked) filter_changed = true;
        for (tissue_key in tissues){
            if (filter_parameters["tissue_" + tissues[tissue_key][1].toLowerCase()] != document.getElementById("check_" + tissues[tissue_key][1].toLowerCase()).checked) filter_changed = true;
        }
        if (filter_parameters["validation_top_n"] != document.getElementById("validation_top_n").checked) filter_changed = true;
        if (filter_parameters["validation_prm"] != document.getElementById("validation_prm").checked) filter_changed = true;
        if (filter_parameters["validation_is"] != document.getElementById("validation_is").checked) filter_changed = true;
        if (filter_parameters["enable_unreviewed"] != document.getElementById("enable_unreviewed").checked) filter_changed = true;
        
        if (filter_changed){
            var proceed = true;
            var one_marked = false;
            for (var node_id in data){
                for (var j = 0; j < data[node_id].proteins.length && !one_marked; ++j){
                    if (data[node_id].proteins[j].id in basket){
                        one_marked = true;
                    }
                }
                if (one_marked) break;
            }
            
            adopt_filter_parameters();
            for (var node_id in data){
                data[node_id].filtering();
            }
            compute_statistics();
            draw();
        }
    }
}


function select_metabolic_pathway(){
    if (last_opened_menu != "select_metabolic_pathway"){
        var rect = document.getElementById('select_metabolic_pathway_nav').getBoundingClientRect();
        document.getElementById("select_metabolic_pathway").style.top = (rect.top + document.getElementById('select_metabolic_pathway_nav').offsetHeight).toString() + "px";
        document.getElementById("select_metabolic_pathway").style.left = (rect.left).toString() + "px";
        document.getElementById("select_metabolic_pathway").style.display = "inline";
        document.getElementById("menu_background").style.display = "inline";
        last_opened_menu = "select_metabolic_pathway";
    }
    else {
        last_opened_menu = "";
    }
}


function select_signaling_pathway(){
    if (last_opened_menu != "select_signaling_pathway"){
        var rect = document.getElementById('select_signaling_pathway_nav').getBoundingClientRect();
        document.getElementById("select_signaling_pathway").style.top = (rect.top + document.getElementById('select_signaling_pathway_nav').offsetHeight).toString() + "px";
        document.getElementById("select_signaling_pathway").style.left = (rect.left).toString() + "px";
        document.getElementById("select_signaling_pathway").style.display = "inline";
        document.getElementById("menu_background").style.display = "inline";
        last_opened_menu = "select_signaling_pathway";
    }
    else {
        last_opened_menu = "";
    }
}


function round10(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}



function update_browser_link(){
    var text_field = document.getElementById("browser_view");
    if (typeof(text_field) === "undefined" || text_field == null) return;
    var view_text = location.hostname + location.pathname + "?pathway=" + current_pathway + "&zoom=" + zoom.toFixed(0) + "&position=" + null_x.toFixed(0) + ":" + null_y.toFixed(0);
    text_field.value = view_text;
    text_field.focus();
    text_field.setSelectionRange(view_text.length, view_text.length);
}


function compute_statistics(){
    if (typeof qsdb_domain === 'undefined' || qsdb_domain === null) return;
    document.getElementById("stat_pathway").innerHTML = pathways[current_pathway][0];
    
    
    var proteins_content = new Set();
    for (var node_id in data){
        for (var j = 0; j < data[node_id].proteins.length; ++j){
            proteins_content.add(data[node_id].proteins[j]);
        }
    }
    
    var num_proteins = proteins_content.size;
    var num_spectra = 0;
    var valid_spectra = 0;
    var num_peptides = 0;
    var valid_peptides = 0;
    var valid_proteins = 0;
    var sel_proteins = 0;
    var sel_peptides = 0;
    var sel_spectra = 0;
    num_validation = [0, 0, 0, 0, 0, 0, 0, 0]; // no validation, Top-n, PRM, SRM + internal standard, Top-n and PRM, Top-n and SRM + internal standard, PRM and SRM + internal standard, Top-n and PRM and SRM + internal standard
    proteins_content.forEach (prot_id => {
        var prot = protein_dictionary[prot_id];
        var tmp = prot.get_statistics();
        valid_proteins += prot.filter_valid;
        num_peptides += tmp[2];
        if (prot.filter_valid) valid_peptides += tmp[3];
        num_spectra += tmp[4];
        if (prot.filter_valid) valid_spectra += tmp[5];
        num_validation[prot.get_validation()] += 1;
        
        if (prot_id in basket){
            sel_proteins += 1;
            sel_peptides += tmp[3];
            sel_spectra += tmp[5];
        }
    });
    
    
    document.getElementById("stat_num_prot").innerHTML = num_proteins;
    document.getElementById("stat_filter_prot").innerHTML = valid_proteins + " / " + round10(valid_proteins / proteins_content.size * 100, 1) + "%";
    document.getElementById("stat_sel_prot").innerHTML = sel_proteins;
    
    document.getElementById("stat_num_pep").innerHTML = num_peptides;
    document.getElementById("stat_filter_pep").innerHTML = valid_peptides;
    document.getElementById("stat_sel_pep").innerHTML = sel_peptides;
    
    document.getElementById("stat_num_spec").innerHTML = num_spectra;
    document.getElementById("stat_filter_spec").innerHTML = valid_spectra;
    document.getElementById("stat_sel_spec").innerHTML = sel_spectra;
}


function expand_statistics(){
    var wdth = window.innerWidth * (1 - expanding_percentage);
    var rect = document.getElementById('select_metabolic_pathway_nav').getBoundingClientRect();
    document.getElementById("statistics").style.top = (rect.top + document.getElementById('select_metabolic_pathway_nav').offsetHeight).toString() + "px";
    resize_renderarea_width(window.innerWidth - wdth);
    document.getElementById("statistics").style.left = (wdth).toString() + "px";
    document.getElementById("statistics").style.width = (window.innerWidth * expanding_percentage).toString() + "px";
    document.getElementById("statistics").style.height = "100%";
    document.getElementById("statistics").style.display = "inline";
    compute_statistics();
    var canvas_pie = document.getElementById('piechart');
    var context_pie = canvas_pie.getContext('2d');
    
    context_pie.clearRect(0, 0, canvas_pie.width, canvas_pie.height);
    
    // fill the venn diagram
    context_pie.globalAlpha = .1;
    var centerX = canvas_pie.width / 3;
    var centerY = canvas_pie.height / 3;
    var radius = centerY + 5;
    
    
    
    roundRect(0, 0, canvas_pie.width, canvas_pie.height, 25, context_pie);
    context_pie.globalAlpha = .4;
    
    
    centerX += 5;
    centerY += 5;
    context_pie.beginPath();
    context_pie.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context_pie.fillStyle = '#ff4d4d';
    context_pie.fill();
    
    centerX += canvas_pie.width / 3 - 10;
    context_pie.beginPath();
    context_pie.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context_pie.fillStyle = '#fdff38';
    context_pie.fill();
    
    centerX = canvas_pie.width / 2;
    centerY += canvas_pie.height / 3 - 10;
    context_pie.beginPath();
    context_pie.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context_pie.fillStyle = '#55ff38';
    context_pie.fill();
    context_pie.globalAlpha = 1;
    
    
    
    // create stroke around the circles
    context_pie.lineWidth = 1;
    context_pie.strokeStyle = '#000000';
    centerX = canvas_pie.width / 3 + 5;
    centerY = canvas_pie.height / 3 + 5;
    context_pie.beginPath();
    context_pie.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context_pie.stroke();
    
    centerX += canvas_pie.width / 3 - 10;
    context_pie.beginPath();
    context_pie.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context_pie.stroke();
    
    centerX = canvas_pie.width / 2;
    centerY += canvas_pie.height / 3 - 10;
    context_pie.beginPath();
    context_pie.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context_pie.stroke();
    
    
    context_pie.textAlign = "center";
    context_pie.font = "16px Arial";
    context_pie.fillStyle = "black";
    
    context_pie.fillText(num_validation[3], canvas_pie.width / 2, canvas_pie.height * 0.2);
    context_pie.fillText(num_validation[7], canvas_pie.width / 2, canvas_pie.height * 0.5);
    context_pie.fillText(num_validation[4], canvas_pie.width / 2, canvas_pie.height * 0.89);
    context_pie.fillText(num_validation[1], canvas_pie.width / 7, canvas_pie.height * 0.32);
    context_pie.fillText(num_validation[2], canvas_pie.width * 6 / 7, canvas_pie.height * 0.32);
    context_pie.fillText(num_validation[5], canvas_pie.width * 0.25, canvas_pie.height * 0.62);
    context_pie.fillText(num_validation[6], canvas_pie.width * 0.75, canvas_pie.height * 0.62);
    context_pie.fillText(num_validation[0], canvas_pie.width * 0.92, canvas_pie.height * 0.9);
    
    if (pathway_is_loaded) draw();
}


function collapse_statistics(){
    if (!pathway_is_loaded) return;
    if (expand_collapse_obj != 0) expand_collapse_obj.collapse();
}    
    
function hide_statistics(){
    resize_renderarea_width(0);
    document.getElementById("statistics").style.display = "none";
    draw();
}


function close_navigation(){
    hide_filter_panel();
    collapse_statistics();
    for (var i = 0; i < navigation_content.length; ++i){
        document.getElementById(navigation_content[i]).style.display = "none";
    }
}


function prepare_infobox(prot){
    infobox.visible = false;
    var steps = 24;
    var time = 1; // seconds
    
    unTip();
    var he = highlight_element;
    var xy = he.get_position(prot);
    var x = xy[0];
    var y = xy[1];
    
    var progress = 0;
    var width  = window.innerWidth * 0.5;
    var height = window.innerHeight * 0.5;
    var std_dev = time / 6.;
    var inv_steps = 1. / steps;
    document.getElementById("animation_background").style.display = "inline";
    var c = document.getElementById("renderarea");
    
    var moving = setInterval(function(){
        if (progress >= time) {
            clearInterval (moving);
            document.getElementById("animation_background").style.display = "none";
            infobox.visible = true;
            var xy = he.get_position(prot);
            infobox.create(xy[0], xy[1], he.id, prot);
            he.highlight = false;
            he = 0;
            draw();
        }
        else {
            var split = Math.exp(-0.5 * sq((progress - time * 0.5) / std_dev)) / (Math.sqrt(2 * Math.PI) * std_dev) * inv_steps;
            for (var node_id in elements) elements[node_id].move(split * (width - x), split * (height - y));
                
            null_x += split * (width - x);
            null_y += split * (height - y);
            boundaries[0] += split * (width - x);
            boundaries[1] += split * (height - y);
            update_browser_link();
            draw();
            
            var rect = c.getBoundingClientRect();
            mouse_move_listener(
            {
                clientX: mouse_x + rect.left,
                clientY: mouse_y + rect.top
            });
            
            progress += inv_steps;
        }
    }, steps);
}



function set_selected_species(species_td){
    if (typeof(species_td) === "undefined") return;
    
    var species_menu = document.getElementById('select_species_table');
    for (var child of species_menu.children){
        child.children[0].className = 'select_menu_cell';
    }
    species_td.className = 'selected_menu_cell';
}


function load_data(reload){
    if (new_host != current_host){
        if (initial_load || confirm("Warning: you are changing the host, all selected proteins will be discarded. Do you want to continue?")){
            pathway_is_loaded = false;
            initial_load = false;
            current_host = new_host;
            current_species = new_species;
            basket = {};
            get_pathway_groups();
            load_tissues();
            change_pathway();
            set_selected_species(selected_menu_dict[current_host + "|" + current_species]);
        }
        document.getElementById("menu_background").style.display = "none";
        return;
    }
    else {
        initial_load = false;
        current_species = new_species;
        set_selected_species(selected_menu_dict[current_host + "|" + current_species]);
    }
    pathway_is_loaded = false;
    
    
    
    if (!reload){
        reset_view();
    }
    
    
    // reset current information
    if(!reload){
        data = {};
        edge_data = 0;
        edges = [];
    }
    else {
        for (var node_id in data){
            if (data[node_id].type == "protein"){
                var protein_node = data[node_id];
                protein_node.proteins = [];
                protein_node.fill_style = protein_disabled_fill_color;
                protein_node.setup_protein_meta();
            }
        }
    }
    var tmp_data = 0;
    elements = [];
    clearInterval(highlighting);
    infobox.visible = false;
    
    
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    
    
    
    protein_dictionary = {};
    for (prot_id in basket) protein_dictionary[prot_id] = basket[prot_id];
    
    
    process_edges_semaphore = false;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            tmp_data = JSON.parse(xmlhttp.responseText);
        }
    }
    var request_nodes = file_pathname + "scripts/get-nodes.bin?pathway=" + current_pathway + "&host=" + encodeURL(current_host) + "&species=" + encodeURL(current_species + specific_node_addition);
    xmlhttp.open("GET", request_nodes, true);
    xmlhttp.send();
    
    
    var request_edges = file_pathname + "scripts/get-edges.bin?pathway=" + current_pathway + "&host=" + encodeURL(current_host);
    
    // get nodes information
    var xmlhttp_edge = new XMLHttpRequest();
    xmlhttp_edge.onreadystatechange = function() {
        if (xmlhttp_edge.readyState == 4 && xmlhttp_edge.status == 200) {
            edge_data = JSON.parse(xmlhttp_edge.responseText);
        }
    }
    xmlhttp_edge.open("GET", request_edges, true);
    xmlhttp_edge.send();
    
    
    var x_min = 1e100, x_max = -1e100;
    var y_min = 1e100, y_max = -1e100;
    var preview_zoom = 0, m_zoom = 0;
    var nav_height = document.getElementById("navigation").getBoundingClientRect().height;
    
    var process_nodes = setInterval(function(){
        if (tmp_data){
            if (!reload){
                
                for (var i = 0; i < tmp_data.length; ++i){
                    var new_node = new node(tmp_data[i]);
                    data[new_node.id] = new_node;
                    
                    var node_width = new_node.width;
                    var node_height = new_node.height;
                    
                    if (new_node.type == "membrane" && new_node.text_highlight) {
                        node_width = new_node.height;
                        node_height = new_node.width;
                    }
                    
                    x_min = Math.min(x_min, new_node.x - node_width * 0.5);
                    x_max = Math.max(x_max, new_node.x + node_width * 0.5);
                    y_min = Math.min(y_min, new_node.y - node_height * 0.5);
                    y_max = Math.max(y_max, new_node.y + node_height * 0.5);
                }
                x_min -= base_grid * 4;
                y_min -= base_grid * 4;
                x_max += base_grid * 4;
                y_max += base_grid * 4;
                
                var shift_x = (ctx.canvas.width - x_min - x_max) * 0.5;
                var shift_y = nav_height + (ctx.canvas.height - nav_height - y_min - y_max) * 0.5;
                for (var node_id in data){
                    data[node_id].move(shift_x, shift_y);
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
                
                zoom_options[0] = preview_zoom;
                zoom_options[1] = m_zoom;
            }
            
            else {
                zoom_options[2] = zoom;
                for (var i = 0; i < tmp_data.length; ++i){
                    var new_node = new node(tmp_data[i]);
                    if (new_node.type != "protein") continue;
                    new_node.x = data[new_node.id].x;
                    new_node.y = data[new_node.id].y;
                    data[new_node.id] = new_node;
                }
            }
            
            
            
            
            process_edges_semaphore = true;
            clearInterval(process_nodes);
            
            // get nodes information
            var xmlhttp_prot = new XMLHttpRequest();
            xmlhttp_prot.onreadystatechange = function() {
                if (xmlhttp_prot.readyState == 4 && xmlhttp_prot.status == 200) {
                    request_load_proteins(JSON.parse(xmlhttp_prot.responseText), false, true);
                }
            }
            
            xmlhttp_prot.open("GET", file_pathname + "scripts/get-proteins.bin?pathway=" + current_pathway + "&species=" + current_species + "&host=" + encodeURL(current_host), true);
            xmlhttp_prot.send();
        }
    }, 1);
        
        
    var process_edges = setInterval(function(){
        if (tmp_data && edge_data && process_edges_semaphore){
            compute_edges();
            assemble_elements(true);
            // create preview
            min_zoom = zoom_options[0];
            for (var i = zoom; i >= min_zoom; --i) zoom_in_out(1, 0);
            draw(1);
            preview_element.snapshot();
            
            
            assemble_elements();
            var t_zoom = reload ? zoom_options[2] - start_zoom_delta : zoom_options[1];
            for (var i = 0; i < (t_zoom - zoom_options[0] + start_zoom_delta); ++i) zoom_in_out(0, 0);
            min_zoom = zoom_options[1];
            
            pathway_is_loaded = true;
            document.getElementById("menu_background").style.display = "none";
            c.style.display = "inline";
            clearInterval(process_edges);
        }
    }, 1);
}


function encodeURL(str){
    str = encodeURI(str);
    return replaceAll(str, "=", "%3D");
}


function replaceAll(str, find, replace) {
    //return str.replace(new RegExp(find, 'g'), replace);
    return str.split(find).join(replace);
}


function accession_search_parse_accessions(accessions, synchronous){
    var show_check = false;
    if (typeof accessions === "undefined"){
        accessions = document.getElementById("accessions").value;
        show_check = true;
        protein_dictionary = [];
    }
    if (typeof synchronous === "undefined") synchronous = true;
    basket = {};
    spectra_exclude = [];
    accessions = replaceAll(accessions, "\n", ":");
    accessions = replaceAll(accessions, " ", "");
    accessions = replaceAll(accessions, "\t", "");
    
    // get nodes information
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            request_load_proteins(JSON.parse(xmlhttp.responseText), show_check);
        }
    }
    
    xmlhttp.open("GET", file_pathname + "scripts/get-proteins.bin?accessions=" + accessions + "&species=" + current_species + "&host=" + encodeURL(current_host), synchronous);
    xmlhttp.send();
}




function request_load_proteins(data, check, post_load){
    if (typeof post_load === "undefined") post_load = false;
    for (var node_id in data){
        var p_id = data[node_id]["i"];
        var prot = 0;
        if (p_id in protein_dictionary){
            prot = protein_dictionary[p_id];
            prot.update(data[node_id]);
        }
        else {
            prot = new Protein(data[node_id], 0);
            protein_dictionary[prot.id] = prot;
        }
        prot.filtering();
        if (prot.filter_valid && !post_load) basket[prot.id] = prot;
    }
    if (check) check_spectra();
    if (post_load) draw();
}




function locus_search_request_data(){
    basket = {};
    protein_dictionary = [];
    spectra_exclude = [];
    var loci_select = document.getElementById("loci");
    var IDs = "";
    for (var i = 0; i < loci_select.options.length; ++i){
        if (loci_select.options[i].selected){
            if (IDs.length > 0) IDs += ":";
            IDs += loci_select.options[i].id;
        }
    }
    
    // request proteins
    var request = file_pathname + "scripts/get-proteins.bin?loci=" + IDs + "&species=" + current_species + "&host=" + encodeURL(current_host);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            request_load_proteins(JSON.parse(xmlhttp.responseText), true);
        }
    }
    
    xmlhttp.open("GET", request, true);
    xmlhttp.send();
}




function function_search_request_data(){
    basket = {};
    protein_dictionary = [];
    spectra_exclude = [];
    var function_select = document.getElementById("function_search_field").getElementsByTagName("li");
    var IDs = "";
    for (var i = 0; i < function_select.length; ++i){
        if (function_select[i].style.backgroundColor != ""){
            if (IDs.length > 0) IDs += ":";
            IDs += function_select[i].id;
        }
    }
    
    // request proteins
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            request_load_proteins(JSON.parse(xmlhttp.responseText), true);
        }
    }
    
    xmlhttp.open("GET", file_pathname + "scripts/get-proteins.bin?functions=" + IDs + "&species=" + current_species + "&host=" + encodeURL(current_host), true);
    xmlhttp.send();
}



function chromosome_search_request_data(){
    basket = {};
    protein_dictionary = [];
    spectra_exclude = [];
    var accessionIDs = "";
    for (var chromosome_key in chromosome_data){
        for (var i = 0; i < chromosome_data[chromosome_key].length; ++i){
            if (chromosome_data[chromosome_key][i][9]){
                if (accessionIDs.length > 0) accessionIDs += ":";
                accessionIDs += chromosome_data[chromosome_key][i][4];
            }
        }
    }
    
    // request proteins
    var request = file_pathname + "scripts/get-proteins.bin?accessions=" + accessionIDs + "&species=" + current_species + "&host=" + encodeURL(current_host);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            request_load_proteins(JSON.parse(xmlhttp.responseText), true);
        }
    }
    
    xmlhttp.open("GET", request, true);
    xmlhttp.send();
}


function filter_settings_clicked(){
    if (!filter_parameters["filter_panel_visible"]){
        document.getElementById("filter_label").innerHTML = "Apply filter settings";
        document.getElementById("filter_panel_check_spectra").style.display = "block";
        if (document.getElementById("filter_panel_check_spectra") != 'undefined') document.getElementById("filter_panel_check_spectra").innerHTML = "";
        document.getElementById("filter_panel_check_spectra").innerHTML = filter_panel_data_landscape;
        document.getElementById("filter_panel").style.display = "block";
        load_filter_parameters();
        filter_parameters["filter_panel_visible"] = true;
        resize_ms_view();
    }
    else {
        adopt_filter_parameters();
        document.getElementById("filter_label").innerHTML = "Show filter settings";
        document.getElementById("filter_panel_check_spectra").innerHTML = "";
        document.getElementById("filter_panel_check_spectra").style.display = "none";
        filter_parameters["filter_panel_visible"] = false;
        for (var key in protein_dictionary){
            protein_dictionary[key].filtering();
        }
        check_spectra();
        if (current_loaded_spectrum != -1) load_spectrum(current_loaded_spectrum, null, "check_spectra");
    }
}


function clean_basket(){
    if (confirm('Do you want to delete all proteins from the basket?')) {
        basket = {};
        filtered_basket = {};
        which_proteins_checked = new Set();
        draw();
        check_spectra();
    }
}



function pathway_to_svg(){
    var svg_margin = 20;
    assemble_elements(true);
    
    var min_x = 1e10, max_x = -1e10, min_y = 1e10, max_y = -1e10;
    for (var i = 0; i < elements.length; ++i){
        if(!(elements[i] instanceof node)) continue;
        
        var node_width = elements[i].width;
        var node_height = elements[i].height;
        
        if (elements[i].type == "membrane" && elements[i].text_highlight) {
            node_width = elements[i].height;
            node_height = elements[i].width;
        }
        
        
        min_x = Math.min(min_x, elements[i].x - node_width * 0.5);
        max_x = Math.max(max_x, elements[i].x + node_width * 0.5);
        min_y = Math.min(min_y, elements[i].y - node_height * 0.5);
        max_y = Math.max(max_y, elements[i].y + node_height * 0.5);
    }
    min_x -= 2 * base_grid;
    min_y -= 2 * base_grid;
    max_x += 2 * base_grid;
    max_y += 2 * base_grid;
    
    var shift_x = (svg_margin >> 1) - min_x;
    var shift_y = (svg_margin >> 1) - min_y;
    var svg_ctx = new C2S(svg_margin + max_x - min_x, svg_margin + max_y - min_y);
    
    
    // change the ctx object in all elements for drawing
    svg_ctx.clearRect(0, 0, svg_margin + max_x - min_x, svg_margin + max_y - min_y);
    for (var i = 0; i < elements.length; ++i){
        elements[i].move(shift_x, shift_y);
        if (elements[i].include_preview) elements[i].draw(svg_ctx);
    }
    var svgCode = svg_ctx.getSerializedSvg(true);
    
    
    
    //revert the changing
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    for (var i = 0; i < elements.length; ++i){
        elements[i].move(-shift_x, -shift_y);
        elements[i].ctx = ctx;
        if (elements[i].type == "protein"){
            for(var j = 0; j < elements[i].proteins.length; ++j){
                elements[i].proteins[j].ctx = ctx;
            }
        }
    }
    assemble_elements();
    
    var parts = svgCode.split("/>");
    svgCode = parts.join("/>\n");
    
    
    var serializer = new XMLSerializer();
    var svg_blob = new Blob([svgCode], {'type': "image/svg+xml"});
    
    
    const tempLink = document.createElement('a');
    tempLink.style.display = 'none';
    tempLink.href = window.URL.createObjectURL(svg_blob);
    tempLink.setAttribute('download', "pathway.svg");
    tempLink.setAttribute('target', '_blank');
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
        
}
