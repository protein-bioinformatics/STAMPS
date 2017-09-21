moved = false;
HTTP_GET_VARS = [];
current_pathway = 1;
current_pathway_list_index = 0;
current_pathway_title = 0;
highlight_element = 0;
offsetX = 0;
offsetY = 0;
null_x = 0;
null_y = 0;
mouse_x = 0;
mouse_y = 0;
filter_parameters = [];
filter_parameters["min_peptide_length"] = 8;
filter_parameters["max_peptide_length"] = 25;
filter_parameters["min_precursor_charge"] = 2;
filter_parameters["max_precursor_charge"] = 3;
filter_parameters["oxy_m_off"] = true;
filter_parameters["oxy_m_var"] = false;
filter_parameters["oxy_m_fix"] = false;
filter_parameters["carba_c_off"] = true;
filter_parameters["carba_c_var"] = false;
filter_parameters["carba_c_fix"] = false;
filter_parameters["filte_panel_visible"] = false;
filter_parameters["tissue_brain"] = true;
filter_parameters["tissue_liver"] = true;
filter_parameters["tissue_kidney"] = true;
filter_parameters["tissue_spleen"] = true;
filter_parameters["tissue_heart"] = true;
filter_parameters["tissue_blood"] = true;
filter_parameters["tissue_fat"] = true;
filter_parameters["tissue_lung"] = true;
filter_parameters["tissue_eye"] = true;
filter_parameters["tissue_gut"] = true;
data = [];
data_ref = [];
nodes = 0;
event_moving_node = false;
event_key_down = false;
node_move_x = 0;
node_move_y = 0;
edges = [];
infobox = 0;
zoom_sign_in = 0;
zoom_sign_out = 0;
expand_obj = 0;
collapse_obj = 0;
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
next_anchor = {"left": "top", "top": "right", "right": "bottom", "bottom": "left"};
on_slide = false;
font_size = text_size * factor;
radius = metabolite_radius * factor;
last_keys = [];
highlighting = 0;
basket = {};
filtered_basket = {};
//tissues = {1: "images/brain.svg", 2: "images/liver.svg", 3: "images/kidney.svg", 4: spleen, 5: "images/heart.svg", 6: blood, 7: fat, 8: "images/lung.svg"}
tissues = {1: ["images/brain.svg", "Brain", 0],
           2: ["images/liver.svg", "Liver", 0],
           3: ["images/kidney.svg", "Kidney", 0],
           4: ["images/spleen.svg", "Spleen", 0],
           5: ["images/heart.svg", "Heart", 0],
           6: ["images/blood.svg", "Blood", 0],
           7: ["images/fat.svg", "Fat", 0],
           8: ["images/lung.svg", "Lung", 0],
           9: ["images/eye.svg", "Eye", 0],
           10: ["images/gut.svg", "Gut", 0]}
           


line_width = 5;
disabled_text_color = "#bbbbbb";
disabled_fill_color = "#cccccc";
text_color = "black";

protein_stroke_color = "#f69301";
protein_fill_color = "#fff6d5";
protein_disabled_stroke_color = "#cccccc";
protein_disabled_fill_color = "#eeeeee";
metabolite_stroke_color = "#f69301";
metabolite_fill_color = "white";;
pathway_stroke_color = "#f69301";
pathway_fill_color = "white";
edge_color = "#f69301";
edge_disabled_color = "#cccccc";
slide_color = "#5792da";
background_hiding = 0;

/*
// corporate design
protein_stroke_color = "black";
protein_fill_color = "white";
metabolite_stroke_color = "black";
metabolite_fill_color = "white";
pathway_stroke_color = "black";
pathway_fill_color = "white";
edge_color = "black";
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

pathway_dict = {};
pathways = [[15, "Alanine, aspartate and glutamate metabolism"]];
//pathways = [[28, "Alanine, aspartate and glutamate metabolism"]];


var filter_panel_data = "<div id=\"filter_panel\" class=\"filter_panel\"> \
    <table> \
        <tr><td>Min. peptide length</td><td><input type=\"number\" min=\"8\" max=\"25\" id=\"min_peptide_length\" /><td></tr> \
        <tr><td>Max. peptide length</td><td><input type=\"number\" min=\"8\" max=\"25\" id=\"max_peptide_length\" /><td></tr> \
        <tr><td>Min. precursor charge</td><td><input type=\"number\" min=\"2\" max=\"6\" id=\"min_precursor_charge\" /><td></tr> \
        <tr><td>Max. precursor charge</td><td><input type=\"number\" min=\"2\" max=\"6\" id=\"max_precursor_charge\" /><td></tr> \
        <tr><td colspan=\"2\">&nbsp;<br>Modifications:</td><td></tr> \
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
        <tr><td colspan=\"2\">Tissues:</td><td></tr> \
                <tr><td><input type=\"checkbox\" id=\"check_brain\" /> Brain</td> \
                    <td><input type=\"checkbox\" id=\"check_liver\" /> Liver</td> \
                </tr> \
                <tr><td><input type=\"checkbox\" id=\"check_kidney\" /> Kidney</td> \
                    <td><input type=\"checkbox\" id=\"check_spleen\" /> Spleen</td> \
                </tr> \
                <tr><td><input type=\"checkbox\" id=\"check_heart\" /> Heart</td> \
                    <td><input type=\"checkbox\" id=\"check_blood\" /> Blood</td> \
                </tr> \
                <tr><td><input type=\"checkbox\" id=\"check_fat\" /> Fat</td> \
                    <td><input type=\"checkbox\" id=\"check_lung\" /> Lung</td> \
                </tr> \
                <tr><td><input type=\"checkbox\" id=\"check_eye\" /> Eye</td> \
                    <td><input type=\"checkbox\" id=\"check_gut\" /> Gut</td> \
                </tr> \
        <tr><td colspan=\"2\">&nbsp;<br><font size=\"1\" color=\"blue\" style=\"cursor: pointer;\" onclick=\" \
        document.getElementById('min_peptide_length').value = 8; \
        document.getElementById('max_peptide_length').value = 25; \
        document.getElementById('min_precursor_charge').value = 2; \
        document.getElementById('max_precursor_charge').value = 3; \
        document.getElementById('oxy_m_off').checked = true; \
        document.getElementById('carba_c_off').checked = true; \
        document.getElementById('check_brain').checked = true; \
        document.getElementById('check_liver').checked = true; \
        document.getElementById('check_kidney').checked = true; \
        document.getElementById('check_spleen').checked = true; \
        document.getElementById('check_heart').checked = true; \
        document.getElementById('check_blood').checked = true; \ \
        document.getElementById('check_fat').checked = true; \
        document.getElementById('check_lung').checked = true; \
        document.getElementById('check_eye').checked = true; \
        document.getElementById('check_gut').checked = true; \
        ;\">default settings</td></tr> \
    </table> \
</div>";


var filter_panel_data_landscape = "<div id=\"filter_panel\"> \
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
            document.getElementById('oxy_m_off').checked = true; \
            document.getElementById('carba_c_off').checked = true; \
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
        <td valign=\"top\"> \
            <table> \
                <tr><td colspan=\"2\">Tissues:</td><td></tr> \
                <tr><td><input type=\"checkbox\" id=\"check_brain\" /> Brain</td> \
                    <td><input type=\"checkbox\" id=\"check_liver\" /> Liver</td> \
                </tr> \
                <tr><td><input type=\"checkbox\" id=\"check_kidney\" /> Kidney</td> \
                    <td><input type=\"checkbox\" id=\"check_spleen\" /> Spleen</td> \
                </tr> \
                <tr><td><input type=\"checkbox\" id=\"check_heart\" /> Heart</td> \
                    <td><input type=\"checkbox\" id=\"check_blood\" /> Blood</td> \
                </tr> \
                <tr><td><input type=\"checkbox\" id=\"check_fat\" /> Fat</td> \
                    <td><input type=\"checkbox\" id=\"check_lung\" /> Lung</td> \
                </tr> \
                <tr><td><input type=\"checkbox\" id=\"check_eye\" /> Eye</td> \
                    <td><input type=\"checkbox\" id=\"check_gut\" /> Gut</td> \
                </tr> \
            </table> \
        </td> \
    </td></tr></table> \
</div>";




function get_check_spectra_content(){
    var return_text = "<canvas id=\"msarea\" class=\"msarea\"></canvas> \
    <fieldset id=\"spectra_options\" class=\"spectra_options\" style=\"position: fixed; border: 0px; margin: 0px; top: 0px; padding: px;\"> \
        <input type=\"radio\" onchange=\"change_match_error();\" id=\"radio_ppm\" name=\"select_error\" value=\"ppm\" style=\"border: 0px; margin: 0px; top: 0px; padding: 0px;\" \ checked><label for=\"radio_ppm\">Relative</label> \
        <input type=\"radio\" onchange=\"change_match_error();\" id=\"radio_da\" name=\"select_error\" value=\"Da\" style=\"border: 0px; margin: 0px; top: 0px; padding: 0px;\"><label for=\"radio_da\">Absolute</label> \
        <input type=\"text\" onchange=\"change_match_error_value();\" id=\"error_value\" value=\"-\" size=1 style=\"text-align: right;\"><label id=\"unit\">ppm</label> \
    </fieldset> \
    <div id=\"spectra_panel\" class=\"spectra_panel\"></div> \
    <div id=\"filter_panel_check_spectra\" class=\"filter_panel_check_spectra\">uia</div> \
    <table width=\"100%\" height=\"100%\"><tr><td valign=\"bottom\"><font color=\"blue\" style=\"cursor: pointer;\" onclick=\"filter_settings_clicked();\" id=\"filter_label\">Show \ filter settings</font></td><td valign=\"bottom\" align=\"right\">";
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


function change_zoom(){
    factor = Math.pow(scaling, zoom);
    font_size = text_size * factor;
    radius = metabolite_radius * factor;
    check_side = check_len * factor;
    check_side_h = check_side * 0.5;
    check_side_d = check_side * 2;
    factor_h = factor * 0.5;
}


CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, rect_curve) {
    this.beginPath();
    this.moveTo(x + rect_curve, y);
    this.lineTo(x + width - rect_curve, y);
    this.quadraticCurveTo(x + width, y, x + width, y + rect_curve);
    this.lineTo(x + width, y + height - rect_curve);
    this.quadraticCurveTo(x + width, y + height, x + width - rect_curve, y + height);
    this.lineTo(x + rect_curve, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - rect_curve);
    this.lineTo(x, y + rect_curve);
    this.quadraticCurveTo(x, y, x + rect_curve, y);
    this.closePath();
    this.fill();
    this.stroke();
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
    if (typeof(sync) == "undefined"){
        var dc = Math.random();
        draw_code = dc;
        var dr = setInterval(function(dc){
            var c = document.getElementById("renderarea");
            var ctx = c.getContext("2d");
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            //draw elements visual elements
            for (var i = 0; i < elements.length; ++i){
                if (elements[i].visible) elements[i].draw();
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
            if (elements[i].visible) elements[i].draw();
        }
    }
}

function set_pathway_menu(){
    var pathway_menu = "<table>";
    for (var i = 0; i < pathways.length; ++i){
        var selected = (pathways[i][0] == current_pathway) ? "selected_pathway_cell" : "select_pathway_cell";
        pathway_menu += "<tr><td class=\"" + selected + "\" onclick=\"change_pathway(";
        pathway_menu += i;
        pathway_menu += ");\">";
        pathway_menu += pathways[i][1]; 
        pathway_menu += "</td></tr>";
    }
    pathway_menu += "</table>";
    document.getElementById("select_pathway").innerHTML = pathway_menu;
}


function visual_element() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.name = "";
    this.mouse_click = function(mouse, key){return -1;};
    this.mouse_dbl_click = function(mouse, key){return -1;};
    this.mouse_down = function(mouse, key){return -1;};
    this.mouse_down_move = function(mouse, key){return false;};
    this.mouse_up = function(mouse){return false;};
    this.is_mouse_over = function(mouse){return false;};
    this.draw = function(){};
    this.highlight = false;
    this.tipp = false;
    this.visible = true;
}


function search_pattern(text, len_p, accept, masks, id1, id2){
    var results = [];
    text = text.replace(String.fromCharCode(13) + String.fromCharCode(10), " ");
    text = text.replace(String.fromCharCode(10), " ");
    text = text.replace(String.fromCharCode(13), " ");
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
    this.id = data['id'];
    this.mass = data['mass'];
    this.charge = data['charge'];
    this.mod_sequence = data['mod_sequence'];
    this.filter_valid = false;
    this.user_selected = true;
    this.occ_M = 0;
    this.occ_m = 0;
    this.occ_C = 0;
    this.occ_c = 0;
    
    
    
    this.prepare_modification = function(){
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
        
        this.filter_valid &= filter_parameters["min_precursor_charge"] <= this.charge && this.charge <= filter_parameters["max_precursor_charge"];
    }
    
    this.get_statistics = function(){
        return [1, this.filter_valid];
    }
}

function Peptide(data){
    this.peptide_seq = data['peptide_seq'];
    this.spectra = [];
    this.filter_valid = false;
    this.user_selected = true;
    this.tissues = new Set();
    if ("tissues" in data) this.tissues = new Set(data['tissues']);
    
    for (var i = 0; i < data['spectra'].length; ++i){
        this.spectra.push(new Spectrum(data['spectra'][i]));
        
    }
    
    this.search = function(len_p, accept, masks, node_id, prot_id){
        var results = search_pattern(this.peptide_seq, len_p, accept, masks, node_id, prot_id);
        
        return results;
    }
    
    this.filtering = function(){
        this.filter_valid = false;
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




function Protein(data, ctx){
    this.id = data['id'];
    this.name = data['name'];
    this.definition = data['definition'];
    this.kegg_link = data['kegg_link'];
    this.accession = data['accession'];
    this.ec_number = data['ec_number'];
    this.mass = data['mass'];
    this.peptides = [];
    this.marked = false;
    this.filter_valid = false;
    this.containing_spectra = 0;
    this.fillStyle_rect = disabled_fill_color;
    this.fillStyle_text = disabled_text_color;
    this.ctx = ctx;
    this.user_selected = true;
    this.tissues = new Set();
    
    for (var i = 0; i < data['peptides'].length; ++i){
        this.peptides.push(new Peptide(data['peptides'][i]));
        this.containing_spectra += this.peptides[i].spectra.length;
        this.tissues = new Set([...this.tissues, ...this.peptides[i].tissues]);
    }
    if (this.containing_spectra){
        this.fillStyle_rect = "white";
        this.fillStyle_text = text_color;
    }
    
    this.filtering = function(){
        this.marked = false;
        this.filter_valid = false;
        for (var i = 0; i < this.peptides.length; ++i){
            this.peptides[i].filtering();
            this.filter_valid |= this.peptides[i].filter_valid;
        }
        
        if (this.filter_valid){
            var tissue_set = new Set(Array.from(this.tissues));
            if (!filter_parameters["tissue_brain"] && tissue_set.has(1)) tissue_set.delete(1);
            if (!filter_parameters["tissue_liver"] && tissue_set.has(2)) tissue_set.delete(2);
            if (!filter_parameters["tissue_kidney"] && tissue_set.has(3)) tissue_set.delete(3);
            if (!filter_parameters["tissue_spleen"] && tissue_set.has(4)) tissue_set.delete(4);
            if (!filter_parameters["tissue_heart"] && tissue_set.has(5)) tissue_set.delete(5);
            if (!filter_parameters["tissue_blood"] && tissue_set.has(6)) tissue_set.delete(6);
            if (!filter_parameters["tissue_fat"] && tissue_set.has(7)) tissue_set.delete(7);
            if (!filter_parameters["tissue_lung"] && tissue_set.has(8)) tissue_set.delete(8);
            if (!filter_parameters["tissue_eye"] && tissue_set.has(9)) tissue_set.delete(9);
            if (!filter_parameters["tissue_gut"] && tissue_set.has(10)) tissue_set.delete(10);
            
            if (tissue_set.size == 0) this.filter_valid = false;
        }
        
        if (this.filter_valid){
            this.fillStyle_rect = "white";
            this.fillStyle_text = text_color;
        }
        else {
            this.fillStyle_rect = disabled_fill_color;
            this.fillStyle_text = disabled_text_color;
        }
    }
    this.filtering();
    
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
        var r = search_pattern(this.name, len_p, accept, masks, node_id, this.id);
        if (r.length) results = results.concat(r);
        r = search_pattern(this.accession, len_p, accept, masks, node_id, this.id);
        if (r.length) results = results.concat(r);
        r = search_pattern(this.definition, len_p, accept, masks, node_id, this.id);
        if (r.length) results = results.concat(r);
        r = search_pattern(this.ec_number, len_p, accept, masks, node_id, this.id);
        if (r.length) results = results.concat(r);
        
        for (var i = 0; i < this.peptides.length; ++i){
            var r = this.peptides[i].search(len_p, accept, masks, node_id, this.id);
            if (r.length) results = results.concat(r);
        }
        return results;
    }
    
    
    this.check_mouse_over_protein_name = function(ctx, x, y, line_number, num, mouse){
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
    
    
    this.draw = function(x, y) {
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
        ctx.fillText(this.name, x + check_side_d, y);
        
        
        // draw hooklet
        if (this.marked){
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
        
    };
    
    this.toggle_marked = function(){
        this.mark(!this.marked);
    }
    
    this.mark = function(m){
        if (this.filter_valid){
            this.marked = m;
            compute_statistics();
        }
        if (this.marked){
            basket[this.id] = this;
        }
        else {
            if (this.id in basket) delete basket[this.id];
        }
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






CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, maxWidth, lineHeight) {
    var lines = text.split("\n");
    y -= (lines.length - 1) * lineHeight * 0.5;
    for (var i = 0; i < lines.length; i++) {
        var words = lines[i].split(' ');
        var line = '';
        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = this.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                this.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }

        this.fillText(line, x, y);
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


pathway_title.prototype = new visual_element();
pathway_title.prototype.constructor = pathway_title;

function pathway_title(ctx){
    this.ctx = ctx;
    this.draw = function(){
        var nav_height = document.getElementById("navigation").getBoundingClientRect().height;
        this.ctx.fillStyle = "#f3f8ff";
        this.ctx.strokeStyle = "#aaaaaa";
        var curr_title_text = "Current pathway: " + pathways[current_pathway_list_index][1];
        this.ctx.font = "bold 20px Arial";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = 'top';
        var wdth = this.ctx.measureText(curr_title_text).width + 30;
        this.ctx.fillRect(-2, nav_height - 2, wdth, 40);
        this.ctx.strokeRect(-2, nav_height - 2, wdth, 40);
        this.ctx.fillStyle = "#aaaaaa";
        this.ctx.fillText(curr_title_text, 10, 10 + nav_height);
    }
}

select_field.prototype = new visual_element();
select_field.prototype.constructor = select_field;

function select_field(ctx){
    this.ctx = ctx;
    this.start_position = false;
    this.end_position = false;
    
    
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
    
    this.draw = function(){
        if (this.visible){
            this.ctx.globalAlpha = .4;
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(this.start_position.x, this.start_position.y, this.end_position.x - this.start_position.x, this.end_position.y - this.start_position.y);
            this.ctx.globalAlpha = 1;
        }
    }
}


preview.prototype = new visual_element();
preview.prototype.constructor = preview;

function preview(ctx){
    this.preview_image = 0;
    this.preview_image_original = 0;
    this.ctx = ctx;
    this.on_active = false;
    this.on_move = false;
    this.active_boundaries = [0, 0, 0, 0];
    this.scale_x = 1;
    this.scale_y = 1;
    
    this.snapshot = function(){
        var x_min = 1e100, x_max = -1e100;
        var y_min = 1e100, y_max = -1e100;
        for (var i = 0; i < data.length; ++i){
            x_min = Math.min(x_min, data[i].x - data[i].width * 0.5);
            x_max = Math.max(x_max, data[i].x + data[i].width * 0.5);
            y_min = Math.min(y_min, data[i].y - data[i].height * 0.5);
            y_max = Math.max(y_max, data[i].y + data[i].height * 0.5);
        }
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
            image_data = this.ctx.getImageData(x_min, y_min, (x_max - x_min), (y_max - y_min));
        } catch (e) {
            console.log(e);
            return;
        }
        
        this.width = x_max - x_min;
        this.height = y_max - y_min;
        this.x = 0;
        this.y = window.innerHeight - this.height;
        this.preview_image.crossOrigin = "anonymous";
        this.preview_image = this.ctx.createImageData(this.width, this.height);
        this.preview_image_original = this.ctx.createImageData(this.width, this.height);
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
            this.ctx.canvas.style.cursor = "all-scroll";
        }
        return this.on_active;
    }
    
    this.mouse_down_move = function(mouse, key){
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
    }
    
    this.mouse_up = function(mouse){
        this.on_active = false;
        this.on_move = false;
        this.ctx.canvas.style.cursor = "default";
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
    
    this.draw = function(){
        if (this.preview_image){
            
            this.ctx.putImageData(this.preview_image, this.x, this.y);
            this.ctx.strokeStyle = "#777777";
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.rect(this.x, this.y, this.width, this.height);
            this.ctx.stroke();
            
            this.compute_boundaries();
            
            this.ctx.globalAlpha = .4;
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(this.active_boundaries[0], this.active_boundaries[1], this.active_boundaries[2], this.active_boundaries[3]);
            this.ctx.globalAlpha = 1.;
            
        }
    }
}


expand_collapse.prototype = new visual_element();
expand_collapse.prototype.constructor = expand_collapse;

function expand_collapse(ctx, dir){
    this.dir = dir;
    this.name = dir ? "expand" : "collapse";
    this.img = document.getElementById(this.name);
    var ratio = 0.02 * window.innerWidth / this.img.width;
    this.width = this.img.width * ratio;
    this.height = this.img.height * ratio;
    this.x = window.innerWidth - this.width * 1.3;
    var nav_height = document.getElementById("navigation").getBoundingClientRect().height;
    this.y = nav_height + this.height * 0.3;
    this.ctx = ctx;
    
    this.mouse_click = function(mouse, key){
        if (this.dir){
            expand_statistics();
        }
        else {
            collapse_statistics();
        }
    }
    
    this.is_mouse_over = function(mouse){
        if (!this.visible) return false;
        return (this.x <= mouse.x && mouse.x <= this.x + this.width && this.y <= mouse.y && mouse.y <= this.y + this.height);
    }
    
    this.draw = function(){
        this.x = this.ctx.canvas.width - this.width * 1.3;
        if (this.visible){
            this.ctx.globalAlpha = 0.3 + 0.7 * this.highlight;
            this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
            this.ctx.globalAlpha = 1.;
        }
    }
}



zoom_sign.prototype = new visual_element();
zoom_sign.prototype.constructor = zoom_sign;

function zoom_sign(ctx, dir){
    this.dir = dir;
    this.name = dir ? "zoom_in" : "zoom_out";
    this.img = document.getElementById(this.name);
    var ratio = 0.02 * window.innerWidth / this.img.width;
    this.width = this.img.width * ratio;
    this.height = this.img.height * ratio;
    this.x = window.innerWidth - this.width * 1.3;
    this.y = window.innerHeight - this.height * (1.3 + dir);
    this.ctx = ctx;
    
    this.mouse_click = function(mouse, key){
        zoom_in_out(1 - this.dir, 0);
        draw();
    }
    
    this.is_mouse_over = function(mouse){
        return (this.x <= mouse.x && mouse.x <= this.x + this.width && this.y <= mouse.y && mouse.y <= this.y + this.height);
    }
    
    this.draw = function(){
        this.x = this.ctx.canvas.width - this.width * 1.3;
        this.ctx.globalAlpha = 0.3 + 0.7 * this.highlight;
        this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        this.ctx.globalAlpha = 1.;
    }
}



Infobox.prototype = new visual_element();
Infobox.prototype.constructor = Infobox;

function Infobox(ctx){
    this.node_id = -1;
    this.protein_id = -1;
    this.name = "infobox";
    this.ctx = ctx;
    this.visible = false;    
    
    this.create = function(x, y, node_id, protein_id){
        this.x = x;
        this.y = y;
        this.node_id = node_id;
        this.protein_id = protein_id;
        if (data[node_id].type == "metabolite"){
            this.width = data[this.node_id].img.width + 40;
            this.height = data[this.node_id].img.height + 40;
            
            this.ctx.font = "bold " + line_height.toString() + "px Arial";
            this.width = Math.max(this.width, this.ctx.measureText(data[this.node_id].name).width + 40);
            this.height += 3 * line_height + 20;
            
            this.ctx.font = "bold " + (line_height - 5).toString() + "px Arial";
            this.width = Math.max(this.width, this.ctx.measureText("Formula:  " + data[this.node_id].formula).width + 40);
            this.width = Math.max(this.width, this.ctx.measureText("Exact Mass / Da: " + data[this.node_id].exact_mass).width + 40);
            
        }
        else {
            this.width = 40;
            this.height = 40;
            this.height += 5 * line_height + 20;
            this.ctx.font = "bold " + (line_height - 5).toString() + "px Arial";
            this.width = Math.max(this.width, this.ctx.measureText("Definition: " + data[this.node_id].proteins[this.protein_id].definition).width + 40);
            this.width = Math.max(this.width, this.ctx.measureText("Uniprot accession: " + data[this.node_id].proteins[this.protein_id].accession).width + 40);
            this.width = Math.max(this.width, this.ctx.measureText("EC number: " + data[this.node_id].proteins[this.protein_id].ec_number).width + 40);
            this.width = Math.max(this.width, this.ctx.measureText("Mass / Da: " + data[this.node_id].proteins[this.protein_id].mass).width + 40);
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
        this.visible = false;
        draw();
    }

    this.draw = function(){
        if (!this.visible) return;
        var rect_curve = round_rect_radius;
        
        this.ctx.fillStyle = infobox_fill_color;
        this.ctx.strokeStyle = infobox_stroke_color;
        this.ctx.lineWidth = infobox_stroke_width;
        
        var offset_x = this.width + infobox_offset_x;
        var offset_y = this.height * 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x - offset_x + rect_curve, this.y - offset_y);
        this.ctx.lineTo(this.x - offset_x + this.width - rect_curve, this.y - offset_y);
        this.ctx.quadraticCurveTo(this.x - offset_x + this.width, this.y - offset_y, this.x - offset_x + this.width, this.y - offset_y + rect_curve);
        
        
        this.ctx.lineTo(this.x - offset_x + this.width, this.y - infobox_offset_x);
        this.ctx.lineTo(this.x - offset_x + this.width + infobox_offset_x, this.y);
        this.ctx.lineTo(this.x - offset_x + this.width, this.y + infobox_offset_x);
        
        this.ctx.lineTo(this.x - offset_x + this.width, this.y - offset_y + this.height - rect_curve);
        this.ctx.quadraticCurveTo(this.x - offset_x + this.width, this.y - offset_y + this.height, this.x - offset_x + this.width - rect_curve, this.y - offset_y + this.height);
        this.ctx.lineTo(this.x - offset_x + rect_curve, this.y - offset_y + this.height);
        this.ctx.quadraticCurveTo(this.x - offset_x, this.y - offset_y + this.height, this.x - offset_x, this.y - offset_y + this.height - rect_curve);
        this.ctx.lineTo(this.x - offset_x, this.y - offset_y + rect_curve);
        this.ctx.quadraticCurveTo(this.x - offset_x, this.y - offset_y, this.x - offset_x + rect_curve, this.y - offset_y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        if (data[this.node_id].type == "metabolite"){
            this.ctx.textAlign = "left";
            this.ctx.textBaseline = 'top';
            this.ctx.font = "bold " + line_height.toString() + "px Arial";
            this.ctx.fillStyle = "black";
            this.ctx.fillText(data[this.node_id].name, this.x - offset_x + 20, this.y - offset_y + 20);
            
            this.ctx.beginPath();
            this.ctx.strokeStyle = disabled_fill_color;
            this.ctx.moveTo(this.x - offset_x + 20, this.y - offset_y + line_height + 30);
            this.ctx.lineTo(this.x - offset_x + this.width - 20, this.y - offset_y + line_height + 30);
            this.ctx.stroke();
            
            this.ctx.font = "bold " + (line_height - 5).toString() + "px Arial";
            this.ctx.fillText("Formula:", this.x - offset_x + 20, this.y - offset_y + line_height + 40);
            this.ctx.fillText("Exact mass / Da:", this.x - offset_x + 20, this.y - offset_y + 2 * line_height + 40);
            var l_for = this.ctx.measureText("Formula: ").width;
            var l_ems = this.ctx.measureText("Exact mass / Da: ").width;
            
            
            
            this.ctx.font = (line_height - 5).toString() + "px Arial";
            this.ctx.fillText(data[this.node_id].formula, this.x - offset_x + 20 + l_for, this.y - offset_y + line_height + 40);
            this.ctx.fillText(data[this.node_id].exact_mass, this.x - offset_x + 20 + l_ems, this.y - offset_y + 2 * line_height + 40);
            
            if (data[this.node_id].img.width){
                this.ctx.drawImage(data[this.node_id].img, this.x - offset_x + 20, this.y - offset_y + 40 + 3 * line_height);
            }
        }
        else if (data[this.node_id].type == "protein"){
            this.ctx.textAlign = "left";
            this.ctx.textBaseline = 'top';
            this.ctx.font = "bold " + line_height.toString() + "px Arial";
            this.ctx.fillStyle = "black";
            this.ctx.fillText(data[this.node_id].proteins[this.protein_id].name, this.x - offset_x + 20, this.y - offset_y + 20);
        
            this.ctx.beginPath();
            this.ctx.strokeStyle = disabled_fill_color;
            this.ctx.moveTo(this.x - offset_x + 20, this.y - offset_y + line_height + 30);
            this.ctx.lineTo(this.x - offset_x + this.width - 20, this.y - offset_y + line_height + 30);
            this.ctx.stroke();
            
            this.ctx.font = "bold " + (line_height - 5).toString() + "px Arial";
            this.ctx.fillText("Definition: ", this.x - offset_x + 20, this.y - offset_y + line_height + 40);
            this.ctx.fillText("Uniprot accession: ", this.x - offset_x + 20, this.y - offset_y + 2 * line_height + 40);
            this.ctx.fillText("EC number: ", this.x - offset_x + 20, this.y - offset_y + 3 * line_height + 40);
            this.ctx.fillText("Mass / Da: ", this.x - offset_x + 20, this.y - offset_y + 4 * line_height + 40);
            var l_def = this.ctx.measureText("Definition: ").width;
            var l_acc = this.ctx.measureText("Uniprot accession: ").width;
            var l_ec = this.ctx.measureText("EC number: ").width;
            var l_ms = this.ctx.measureText("Mass / Da: ").width;
            
            
            
            this.ctx.font = (line_height - 5).toString() + "px Arial";
            this.ctx.fillText(data[this.node_id].proteins[this.protein_id].definition, this.x - offset_x + 20 + l_def, this.y - offset_y + line_height + 40);
            this.ctx.fillText(data[this.node_id].proteins[this.protein_id].accession, this.x - offset_x + 20 + l_acc, this.y - offset_y + 2 * line_height + 40);
            this.ctx.fillText(data[this.node_id].proteins[this.protein_id].ec_number, this.x - offset_x + 20 + l_ec, this.y - offset_y + 3 * line_height + 40);
            this.ctx.fillText(data[this.node_id].proteins[this.protein_id].mass, this.x - offset_x + 20 + l_ms, this.y - offset_y + 4 * line_height + 40);
        }
    }
}

node.prototype = new visual_element();
node.prototype.constructor = node;

function node(data, c){
    this.x = parseInt(data['x']);
    this.y = parseInt(data['y']);
    this.type = data['type'];
    this.id = data['id'];
    //this.name = data['name'];
    this.name = data['name'] + " " + this.id;  // TODO: delete this line
    this.c_number = data['c_number'];
    this.formula = data['formula'];
    this.exact_mass = data['exact_mass'];
    this.img = 0;
    this.highlight = false;
    this.pathway_ref = data['pathway_ref'];
    this.proteins = [];
    this.lines = -1;
    this.width = -1;
    this.height = -1;
    this.orig_height = -1;
    this.c = c;
    this.ctx = c.getContext("2d");
    this.slide = false;
    this.slide_percent = 0;
    this.on_slide = false;
    this.ctx.font = (text_size * factor).toString() + "px Arial";
    this.containing_spectra = 0;
    this.fill_style = protein_disabled_fill_color;
    
    switch (this.type){
        case "protein":
            var name = "";
            this.height = 20 + 20 * Math.min(data['proteins'].length, max_protein_line_number);
            this.orig_height = 20 + 20 * data['proteins'].length;
            this.lines = data['proteins'].length;
            this.slide = (data['proteins'].length > max_protein_line_number);
            for (var j = 0; j < data['proteins'].length; ++j){
                var prot = 0;
                if (!(data['proteins'][j]['id'] in protein_dictionary)){
                    prot = new Protein(data['proteins'][j], this.ctx);
                    protein_dictionary[prot.id] = prot;
                }
                else {
                    prot = protein_dictionary[data['proteins'][j]['id']];
                }
                if (prot.id in basket){
                    basket[prot.id] = prot;
                    if (!toggled_proteins.has(prot.id)){
                        prot.toggle_marked();
                        toggled_proteins.add(prot.id);
                    }
                }
                this.proteins.push(prot);
                this.containing_spectra += prot.containing_spectra;
                if (name.length) name += ", ";
                var prot_name = prot.name;
                var text_width = this.ctx.measureText(prot_name).width;
                if (this.width < text_width){
                    this.width = text_width;
                }
                name += prot.name;
                this.fill_style = protein_fill_color;
            }
            this.width += 50 + this.slide * 20;
            this.name = name;
            this.tipp = (name.length || true);
            break;
        case "pathway":
            var tokens = data['name'].split("\n");
            this.height = 40 + 20 * tokens.length;
            
            for (var j = 0; j < tokens.length; ++j){
                if (this.width < tokens[j].length) this.width = tokens[j].length;
            }
            this.width *= 12;
            this.tipp = true;
            break;
        case "metabolite":
            this.width = metabolite_radius * 2;
            this.height = metabolite_radius * 2;
            this.img = new Image();
            this.crossOrigin = 'anonymous';
            //this.img.src = "http://www.genome.jp/Fig/compound/" + nd.c_number + ".gif";
            var load_process = setInterval(function(nd){
                //nd.img = new Image();
                nd.img.src = "http://www.genome.jp/Fig/compound/" + nd.c_number + ".gif";
                clearInterval(load_process);
            }, 1, this);
            this.tipp = true;
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
            var tmp = this.proteins[i].get_statistics();
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
                var r = this.proteins[i].search(len_p, accept, masks, this.id);
                if (r.length) results = results.concat(r);
            }
        }
        else {
            results = search_pattern(this.name, len_p, accept, masks, this.id, -1);
        }
        return results;
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
                this.proteins[i].filtering();
            }
        }
    }
    
    this.draw = function() {
        var hh = this.height * 0.5;
        var hw = this.width * 0.5;
    
        switch (this.type){
            
            case "protein":
                
                // draw fill
                this.ctx.fillStyle = this.fill_style;
                this.ctx.fillRect(this.x - hw, this.y - hh, this.width, this.height);
       
                this.ctx.save();
                this.ctx.rect(this.x - hw, this.y - hh, this.width, this.height);
                this.ctx.clip();
                
                
                // draw content
                this.ctx.textAlign = "left";
                this.ctx.textBaseline = 'middle';
                this.ctx.font = font_size.toString() + "px Arial";
                this.ctx.fillStyle = "black";
                var ty = this.y;
                var tx = this.x - hw;
                if (this.lines > max_protein_line_number){
                    ty += (this.orig_height * 0.5 - hh) - this.slide_percent * (this.orig_height - this.height);
                    
                    var sl_x = this.x + this.width * 0.375;
                    var sl_y_s = this.y - this.height * 0.375;
                    var sl_y_e = this.y + this.height * 0.375;
                    
                    var ctl_y = sl_y_s + this.slide_percent * (sl_y_e - sl_y_s);
                    
                    this.ctx.fillStyle = slide_color;
                    this.ctx.strokeStyle = slide_color;
                    this.ctx.lineWidth = slide_width * factor;
                    this.ctx.beginPath();
                    this.ctx.moveTo(sl_x, sl_y_s);
                    this.ctx.lineTo(sl_x, sl_y_e);
                    this.ctx.stroke();
                    
                    this.ctx.beginPath();
                    this.ctx.arc(sl_x, ctl_y, slide_bullet * factor, 0, 2 * Math.PI);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();
                }
                
                var lhf = line_height * factor;
                for (var i = 0, tty = ty - (this.proteins.length - 1) * lhf * 0.5; i < this.proteins.length; i += 1, tty += lhf){
                    if (Math.abs(tty - this.y) <= hh + lhf) this.proteins[i].draw(tx, tty);
                }
                
                this.ctx.restore();
                
                // draw stroke
                this.ctx.lineWidth = (line_width + 2 * this.highlight) * factor;
                this.ctx.strokeStyle = this.proteins.length ? protein_stroke_color :  protein_disabled_stroke_color;
                this.ctx.strokeRect(this.x - hw, this.y - hh, this.width, this.height);
                break;
                
                
            case "pathway":
                this.ctx.fillStyle = pathway_fill_color;
                this.ctx.strokeStyle = pathway_stroke_color;
                this.ctx.lineWidth = (line_width + 2 * this.highlight) * factor;
                this.ctx.roundRect(this.x - hw, this.y - hh, this.width, this.height, round_rect_radius * factor);
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = 'middle';
                this.ctx.font = ((text_size + 6) * factor).toString() + "px Arial";
                this.ctx.fillStyle = "black";
                this.ctx.wrapText(this.name, this.x, this.y, this.width, 20 * factor);
                break;
                
            case "metabolite":
                this.ctx.fillStyle = metabolite_fill_color;
                this.ctx.strokeStyle = metabolite_stroke_color;
                this.ctx.lineWidth = (line_width + 2 * this.highlight) * factor;
                this.ctx.beginPath();
                this.ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                
                //////////// TODO: delete this lines
                
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = 'middle';
                this.ctx.font = ((text_size + 6) * factor).toString() + "px Arial";
                this.ctx.fillStyle = "black";
                this.ctx.wrapText(this.name, this.x, this.y, this.width, 20 * factor);
                
                
                
                break;
        }
        
    };
    
    this.is_mouse_over = function (mouse){
        switch (this.type){
            case "metabolite":
                if (Math.sqrt(Math.pow(this.x - mouse.x, 2) + Math.pow(this.y - mouse.y, 2)) < radius){
                        return true;                    
                }
                break;
                
            default:
                if (this.x - this.width * 0.5 <= mouse.x && mouse.x <= this.x + this.width * 0.5){
                    if (this.y - this.height * 0.5 <= mouse.y && mouse.y <= this.y + this.height * 0.5){
                        return true;
                    }
                }
        }
        return false;
    };
    
    this.mark_protein_checkbox = function(res){
        var offset_y = 0;
        if (this.lines > max_protein_line_number){
            offset_y = (this.orig_height * 0.5 - this.height * 0.5) - this.slide_percent * (this.orig_height - this.height);
        }
        for (var i = 0; i < this.proteins.length; ++i){
            if (this.proteins[i].mouse_over_checkbox(this.x - this.width / 2, this.y + offset_y, res.x, res.y, this.proteins.length, i)){
                this.proteins[i].toggle_marked();
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
        
        return this.proteins[i].get_position(this.x - this.width / 2, this.y + offset_y, this.proteins.length, i);
    }
    
    
    this.check_mouse_over_protein_name = function(mouse){
        if (this.type != "protein") return -1;
        
        var offset_y = 0;
        if (this.lines > max_protein_line_number){
            offset_y = (this.orig_height * 0.5 - this.height * 0.5) - this.slide_percent * (this.orig_height - this.height);
        }
        for (var i = 0; i < this.proteins.length; ++i){
            if(this.proteins[i].check_mouse_over_protein_name(this.ctx, this.x - this.width / 2, this.y + offset_y, this.proteins.length, i, mouse)){
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
            if (this.pathway_ref != 0 && (this.pathway_ref in pathway_dict)){
                change_pathway(pathway_dict[this.pathway_ref]);
            }
        }
    }
    
    this.mouse_dbl_click = function(res, key){
        if (this.type != "protein") return false;
        var cnt = 0;
        var cnt_avbl = 0;
        for (var i = 0; i < this.proteins.length; ++i){
            cnt += this.proteins[i].marked;
            cnt_avbl += (this.proteins[i].peptides.length > 0) && (this.proteins[i].containing_spectra > 0);
        }
        var marking = (cnt != cnt_avbl);
        for (var i = 0; i < this.proteins.length; ++i){
            this.proteins[i].mark(marking);
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

function edge(c, x_s, y_s, a_s, protein_node, x_e, y_e, a_e, metabolite_node, head, reaction_id, reagent_id, edge_id){
    
    this.c = c;
    this.ctx = this.c.getContext("2d");
    this.head = head;
    this.head_start = 0;
    this.point_list = [];
    this.start_point = (x_s, y_s, "");
    this.start_id = protein_node.id;
    this.start_anchor = a_s;
    this.end_point = (x_e, y_e, "");
    this.end_id = metabolite_node.id;
    this.end_anchor = a_e;
    this.reaction_id = reaction_id;
    this.reagent_id = reagent_id;
    this.edge_id = edge_id;
    this.bidirectional = data[data_ref[this.start_id]].type == "metabolite" && nodes[this.reaction_id]['reversible'];
    this.tail_start = 0;
    
    
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
        var W = 8 + Math.ceil(Math.abs(xd_s - xd_e) / grid);
        var H = 8 + Math.ceil(Math.abs(yd_s - yd_e) / grid);
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
        
        if (this.head && this.point_list.length >= 2){
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
         
        if (this.bidirectional){
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
    
    
    this.routing(x_s, y_s, a_s, protein_node, x_e, y_e, a_e, metabolite_node);
    
    this.draw = function(){
        var dashed_edge = data[data_ref[this.start_id]].type == "pathway";
        var edge_enabled = data[data_ref[this.start_id]].proteins.length > 0 || dashed_edge;
        
        this.ctx.strokeStyle = edge_enabled ? edge_color : edge_disabled_color;
        this.ctx.fillStyle = edge_enabled ? edge_color : edge_disabled_color;
        if (dashed_edge) this.ctx.setLineDash([10 * factor, 10 * factor]);
        
        /*
        if (data[data_ref[this.start_id]].type == "metabolite"){
            this.ctx.strokeStyle = "#ff0000";
            this.ctx.fillStyle = "#ff0000";
        }*/
        
        this.ctx.lineWidth = (line_width - dashed_edge * 3) * factor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.point_list[0].x, this.point_list[0].y);
        var p_len = this.point_list.length;
        for (var i = 0; i < p_len - 1 - this.head; ++i){
            var control = new point(0, 0, 0);
            
            switch (this.point_list[i].b){
                case 0:
                    control.x = this.point_list[i + 1].x;
                    control.y = this.point_list[i].y;
                    this.ctx.quadraticCurveTo(control.x, control.y, this.point_list[i + 1].x, this.point_list[i + 1].y);
                    break;
                    
                case 1:
                    control.x = this.point_list[i].x;
                    control.y = this.point_list[i + 1].y;
                    this.ctx.quadraticCurveTo(control.x, control.y, this.point_list[i + 1].x, this.point_list[i + 1].y);
                    break;
                    
                default:
                    this.ctx.lineTo(this.point_list[i + 1].x, this.point_list[i + 1].y);
                    break;
                    
            }
        }
        this.ctx.stroke();
        
        if (this.head && this.point_list.length >= 2){
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
                    
                    this.ctx.lineWidth = line_width * factor;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1_x, p1_y);
                    this.ctx.lineTo(x_head, y_head);
                    this.ctx.stroke();
                    
                    break;
                
                default:
                    var t = this.head_start;
                    x_head = (1 - t) * (1 - t) * p1_x + 2 * (1 - t) * t * ct_x + t * t * p2_x;
                    y_head = (1 - t) * (1 - t) * p1_y + 2 * (1 - t) * t * ct_y + t * t * p2_y;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1_x, p1_y);
                    this.ctx.bezierCurveTo(ct_x, ct_y, x_head, y_head, x_head, y_head);
                    this.ctx.stroke();
                    break;
                    
            }
            
            var l = Math.sqrt(Math.pow(arrow_length * factor, 2) / (sq(p2_x - x_head) + sq(p2_y - y_head)));
            var x_l = x_head - l * 0.65 * (y_head - p2_y);
            var y_l = y_head + l * 0.65 * (x_head - p2_x);
                    
            var x_r = x_head + l * 0.65 * (y_head - p2_y);
            var y_r = y_head - l * 0.65 * (x_head - p2_x);
            
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(p2_x, p2_y);
            this.ctx.lineTo(x_r, y_r);
            this.ctx.lineTo(x_l, y_l);
            this.ctx.closePath();
            this.ctx.fill();
            
            
        }
        
        if (this.bidirectional){
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
                    var l = Math.sqrt(Math.pow(arrow_length * factor, 2) / (sq(p2_x - p1_x) + sq(p2_y - p1_y)));
                    x_head = p2_x + l * (p1_x - p2_x);
                    y_head = p2_y + l * (p1_y - p2_y);
                    
                    this.ctx.lineWidth = line_width * factor;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1_x, p1_y);
                    this.ctx.lineTo(x_head, y_head);
                    this.ctx.stroke();
                    
                    break;
                
                default:
                    var t = this.head_start;
                    x_head = (1 - t) * (1 - t) * p1_x + 2 * (1 - t) * t * ct_x + t * t * p2_x;
                    y_head = (1 - t) * (1 - t) * p1_y + 2 * (1 - t) * t * ct_y + t * t * p2_y;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1_x, p1_y);
                    this.ctx.bezierCurveTo(ct_x, ct_y, x_head, y_head, x_head, y_head);
                    this.ctx.stroke();
                    break;
                    
            }
            
            var l = Math.sqrt(Math.pow(arrow_length * factor, 2) / (sq(p2_x - x_head) + sq(p2_y - y_head)));
            var x_l = x_head - l * 0.65 * (y_head - p2_y);
            var y_l = y_head + l * 0.65 * (x_head - p2_x);
                    
            var x_r = x_head + l * 0.65 * (y_head - p2_y);
            var y_r = y_head - l * 0.65 * (x_head - p2_x);
            
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(p2_x, p2_y);
            this.ctx.lineTo(x_r, y_r);
            this.ctx.lineTo(x_l, y_l);
            this.ctx.closePath();
            this.ctx.fill();
            
            
        }
        this.ctx.setLineDash([]);
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
    var diameter = 2 * radius;
    var connections = [];
    var nodes_anchors = [];
    for (var i = 0; i < data.length; ++i){
        nodes_anchors.push({left: [], right: [], top: [], bottom: []});
    }
    for (var i = 0; i < nodes.length; ++i){
        var node_id = data_ref[nodes[i]['node_id']];
        var reversible = parseInt(nodes[i]['reversible']);
        for (var j = 0; j < nodes[i]['reagents'].length; ++j){
            
            var metabolite_id = data_ref[nodes[i]['reagents'][j]['node_id']];
            var angle_metabolite = compute_angle(data[metabolite_id].x, data[metabolite_id].y, data[node_id].x,                     data[node_id].y, nodes[i]['reagents'][j]['anchor']);
            
            
            if (nodes[i]['reagents'][j]['type'] == 'educt'){
                var angle_node = compute_angle(data[node_id].x, data[node_id].y, data[metabolite_id].x, data[metabolite_id].y, nodes[i]['anchor_in']);
                connections.push([node_id, nodes[i]['anchor_in'], metabolite_id, nodes[i]['reagents'][j]['anchor'], reversible, i, j, nodes[i]['reagents'][j]['id']]);
                nodes_anchors[node_id][nodes[i]['anchor_in']].push([metabolite_id, connections.length - 1, angle_node]);
            }
            else{
                var angle_node = compute_angle(data[node_id].x, data[node_id].y, data[metabolite_id].x, data[metabolite_id].y, nodes[i]['anchor_out']);
                connections.push([node_id, nodes[i]['anchor_out'], metabolite_id, nodes[i]['reagents'][j]['anchor'], true, i, j, nodes[i]['reagents'][j]['id']]);
                nodes_anchors[node_id][nodes[i]['anchor_out']].push([metabolite_id, connections.length - 1, angle_node]);
                
            }
            nodes_anchors[metabolite_id][nodes[i]['reagents'][j]['anchor']].push([node_id, connections.length - 1, angle_metabolite]);
        }
    }
    
    
    for (var i = 0; i < nodes_anchors.length; ++i){
        for (var a in anchors){
            var node_p = nodes_anchors[i][anchors[a]];
            var len = node_p.length;
            if (node_p.length > 1){
                
                // bubble sort, don't worry, the array are very short, not longer than 5
                for (var j = 0; j < len; ++j){
                    var swps = 0;
                    for (var k = 0; k < len - 1; ++k){
                        if (node_p[k][2] > node_p[k + 1][2]){
                            var tmp = node_p[k];
                            node_p[k] = node_p[k + 1];
                            node_p[k + 1] = tmp;
                            swps += 1;
                        }
                    }
                    if (!swps) break;
                }
            }
        }
    }
    
    for (var i = 0; i < connections.length; ++i){
        edges.push(0);
    }
    
    for (var i = 0; i < connections.length; ++i){
        var node_id = connections[i][0];
        var node_anchor = connections[i][1];
        var node_len = nodes_anchors[node_id][node_anchor].length;
        var metabolite_id = connections[i][2];
        var metabolite_anchor = connections[i][3];
        var metabolite_len = nodes_anchors[metabolite_id][metabolite_anchor].length;
        var has_head = connections[i][4];
        var reaction_id = connections[i][5];
        var reagent_id = connections[i][6];
        var edge_id = connections[i][7];
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
        
        if (data[node_id].type == "metabolite"){
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
        edges[i] = new edge(c, start_x, start_y, node_anchor, data[node_id], end_x, end_y, metabolite_anchor, data[metabolite_id], has_head, reaction_id, reagent_id, edge_id);
    }
    
    // sorting the edges, so that active edges will be drown as last, hence on top of inactive edges. Clever, eh?
    edges.sort(function(a, b){
        a_rank = data[data_ref[a.start_id]].type == 'pathway' || data[data_ref[a.start_id]].proteins.length > 0;
        b_rank = data[data_ref[b.start_id]].type == 'pathway' || data[data_ref[b.start_id]].proteins.length > 0;
        return a_rank - b_rank;
    });
}


function assemble_elements(skip_rest){
    elements = [];
    for (var i = 0; i < edges.length; ++i) elements.push(edges[i]);    
    for (var i = 0; i < data.length; ++i) elements.push(data[i]);
    if (typeof skip_rest == 'undefined') {
        elements.push(infobox);
        elements.push(zoom_sign_in);
        elements.push(zoom_sign_out);
        elements.push(expand_obj);
        elements.push(collapse_obj);
        elements.push(preview_element);
        elements.push(select_field_element);
        elements.push(current_pathway_title);
    }
}


function get_mouse_pos(canvas, evt){
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}



function mouse_wheel_listener(e){
    if (!pathway_is_loaded) return;
    var c = document.getElementById("renderarea");
    zoom_in_out(e.detail >= 0, get_mouse_pos(c, e));
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
    for (var i = 0; i < data.length; ++i){
        data[i].width *= scale;
        data[i].height *= scale;
        data[i].orig_height *= scale;
        data[i].x = res.x + scale * (data[i].x - res.x);
        data[i].y = res.y + scale * (data[i].y - res.y);
    }
    for (var i = 0; i < edges.length; ++i){
        for (var j = 0; j < edges[i].point_list.length; ++j){
            edges[i].point_list[j].x = res.x + scale * (edges[i].point_list[j].x - res.x);
            edges[i].point_list[j].y = res.y + scale * (edges[i].point_list[j].y - res.y);
        }
    }
    infobox.x = res.x + scale * (infobox.x - res.x);
    infobox.y = res.y + scale * (infobox.y - res.y);
    null_x = res.x + scale * (null_x - res.x);
    null_y = res.y + scale * (null_y - res.y);
    boundaries[0] = res.x + scale * (boundaries[0] - res.x);
    boundaries[1] = res.y + scale * (boundaries[1] - res.y);
    boundaries[2] *= scale;
    boundaries[3] *= scale;
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



function change_pathway(p){
    hide_select_pathway();
    collapse_statistics();
    current_pathway = pathways[p][0];
    current_pathway_list_index = p;
    set_pathway_menu();
    reset_view();
    document.title = "QSDB Home - " + pathways[p][1];
    load_data();
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



function key_up(event){    
    if (!pathway_is_loaded) return;
    
    if (event_moving_node) update_node(event);
    event_key_down = false;
    if (event.buttons == 2 && !moved){
        show_custom_menu();
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
                    if (!toggled.has(data[i].proteins[j].id)){
                        data[i].proteins[j].toggle_marked();
                        toggled.add(data[i].proteins[j].id);
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
    if (event_moving_node) update_node(event);
}


function download_assay(){
    var spectra_list = "";
    var proteins_list = "";
    for (key in basket){
        var prot = basket[key];
        if (proteins_list.length) proteins_list += ":";
        proteins_list += prot.id;
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
    }
    if (!spectra_list.length){
        alert("No proteins are selected.");
        return;
    }
    
    var xmlhttp_c = new XMLHttpRequest();
    xmlhttp_c.onreadystatechange = function() {
        if (xmlhttp_c.readyState == 4 && xmlhttp_c.status == 200) {
            var receive = xmlhttp_c.responseText;
        }
    }
    xmlhttp_c.open("GET", "/qsdb/cgi-bin/set-counter.bin?counter=download", true);
    xmlhttp_c.send();
    
    document.getElementById("waiting_background").style.display = "inline";
    document.getElementById("download").style.display = "inline";
    if (typeof qsdb_domain !== 'undefined' && qsdb_domain !== null){
        document.getElementById("renderarea").style.filter = "blur(5px)";
        document.getElementById("navigation").style.filter = "blur(5px)";
    }
    
    html = "<table width=100% height=100%><tr><td align=\"center\">";
    html += "<img src=\"/qsdb/images/ajax-loader.gif\"></td></tr></table>"
    document.getElementById("download").innerHTML = html;
    
    
    var xmlhttp = new XMLHttpRequest();
    var download_link = "";
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            download_link = xmlhttp.responseText;
            html = "<table width=100% height=100%><tr><td align=\"center\">";
            html += "<a href=\"" + download_link + "\">download assay</a>";
            html += "<p>&nbsp;<p>";
            html += "Extracted .fasta and .blib file can be easily imported in <a href=\"https://skyline.gs.washington.edu/labkey/project/home/software/Skyline/begin.view\" target=\"_blank\">Skyline</a>.";
            html += "<p>&nbsp;<p>";
            html += "<button onclick=\"hide_download();\">Close Window</button></td></tr></table>"
            document.getElementById("download").innerHTML = html;
        }
    }
    xmlhttp.open("GET", "cgi-bin/prepare-download.py?spectra=" + spectra_list + "&proteins=" + proteins_list, true);
    xmlhttp.send();
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
    basket[prot_id].mark(false);
    delete basket[prot_id];
    if (typeof qsdb_domain !== 'undefined' && qsdb_domain !== null) draw();
    check_spectra();
}



function toggle_peptide_selection(pep_id){
    /*
    basket[prot_id].mark(false);
    delete basket[prot_id];
    if (typeof qsdb_domain !== 'undefined' && qsdb_domain !== null) draw();
    check_spectra();
    */
}


function filter_basket(){
    filtered_basket = {};
    for (key in basket){
        if (basket[key].filter_valid) filtered_basket[key] = basket[key];
    }
}


function check_spectra(){
    
    filter_basket();
    
    document.getElementById("check_spectra").style.display = "inline";
    document.getElementById("waiting_background").style.display = "inline";
    if (typeof qsdb_domain !== 'undefined' && qsdb_domain !== null){
        document.getElementById("renderarea").style.filter = "blur(5px)";
        document.getElementById("navigation").style.filter = "blur(5px)";
    }
    resize_ms_view();
    spectrum_loaded = false;
    draw_spectrum();
    
    document.getElementById("error_value").value = (document.getElementById("radio_ppm").checked ? tolerance_relative : tolerance_absolute);
    
    // triangle right: 9656
    // triangle down: 9662
    
    var inner_html = "<table id=\"review_proteins_table\" width=\"100%\" cellspacing=\"0\" border=\"0\">";
    var proteins_content = [];
    for (key in filtered_basket){
        proteins_content.push([filtered_basket[key].name, key]);
    }
    proteins_content.sort();
    for (var i = proteins_content.length - 1; i > 0; --i){
        if (proteins_content[i][0] == proteins_content[i - 1][0]){
            proteins_content.splice(i, 1);
        }
    }
    var peps = 0;
    var specs = 0;
    var line = 0;
    var sign_right = String.fromCharCode(9656);
    var sign_down = String.fromCharCode(9662);
    for (var i = 0; i < proteins_content.length; ++i){
        var current_prot = filtered_basket[proteins_content[i][1]];
        
        var bg_color = (line & 1) ? "#DDDDDD" : "white";
        ++line;
        var num_pep = 0;
        for (var j = 0; j < current_prot.peptides.length; ++j){
            if (!current_prot.peptides[j].filter_valid) continue;
            num_pep += 1;
        }
        
        
        inner_html += "<tr id=\"" + current_prot.id + "\"><td width=\"70%\" bgcolor=\"" + bg_color + "\" onclick=\"document.getElementById('protein_sign_" + i + "').innerHTML = (document.getElementById('peptide_" + peps + "').style.display == 'inline' ? '" + sign_right + "' : '" + sign_down + "'); document.getElementById('peptide_" + peps + "').style.display = (document.getElementById('peptide_" + peps + "').style.display == 'inline' ? 'none' : 'inline');\" style=\"cursor: pointer;\">&nbsp;<div style=\"display:inline; margin: 0px; padding: 0px;\" id=\"protein_sign_" + i + "\">" + sign_right + "</div>&nbsp;" + proteins_content[i][0] + " | " + current_prot.accession + " | " + num_pep + " Peptides</td><td width=\"25%\" bgcolor=\"" + bg_color + "\">";
        
        var curr_tissues = Array.from(current_prot.tissues).sort();

        for (var t = 0; t < curr_tissues.length; ++t){
            if (curr_tissues[t] in tissues){
                var orientation = "height";
                if (tissues[curr_tissues[t]][2].width > tissues[curr_tissues[t]][2].height) orientation = "width";
                inner_html += "<img src=\"" + tissues[curr_tissues[t]][0] + "\" style=\"margin-right: 2px;\" title=\"" + tissues[curr_tissues[t]][1] + "\" " + orientation + "=\"16\" />";
            }
        }
        inner_html += "</td><td bgcolor=\"" + bg_color + "\" align=\"right\"><img src=\"images/delete.png\" width=\"16\" height=\"16\" onclick=\"delete_from_protein_table(" + current_prot.id + ");\" /></td></tr>";
        
        inner_html += "<tr><td colspan=\"2\" width=\"100%\"><table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" id='peptide_" + peps + "' style=\"display: none;\">";
        for (var j = 0; j < current_prot.peptides.length; ++j){
            if (!current_prot.peptides[j].filter_valid) continue;
            var current_pep = current_prot.peptides[j];
            var n_specs = current_pep.spectra.length;
            var peptite_checked = current_pep.user_selected ? "checked" : "";
            var onclick_command = "\
            protein_dictionary[" + current_prot.id + "].peptides[" + j + "].user_selected = !protein_dictionary[" + current_prot.id + "].peptides[" + j + "].user_selected; \
            if (!protein_dictionary[" + current_prot.id + "].peptides[" + j + "].user_selected){ \
                for (var k = 0; k < protein_dictionary[" + current_prot.id + "].peptides[" + j + "].spectra.length; ++k){ \
                    if (!protein_dictionary[" + current_prot.id + "].peptides[" + j + "].spectra[k].filter_valid) continue; \
                    protein_dictionary[" + current_prot.id + "].peptides[" + j + "].spectra[k].user_selected = false; \
                    document.getElementById('cb-" + current_prot.id + "-" + j + "-' + protein_dictionary[" + current_prot.id + "].peptides[" + j + "].spectra[k].id).checked = false; \
                } \
            } \
            else { \
                for (var k = 0; k < protein_dictionary[" + current_prot.id + "].peptides[" + j + "].spectra.length; ++k){ \
                    if (!protein_dictionary[" + current_prot.id + "].peptides[" + j + "].spectra[k].filter_valid) continue; \
                    protein_dictionary[" + current_prot.id + "].peptides[" + j + "].spectra[k].user_selected = true; \
                    document.getElementById('cb-" + current_prot.id + "-" + j + "-' + protein_dictionary[" + current_prot.id + "].peptides[" + j + "].spectra[k].id).checked = true; \
                } \
            }";
            inner_html += "<tr><td width=\"100%\" onclick=\"document.getElementById('peptide_sign_" + specs + "').innerHTML = (document.getElementById('spectrum_" + specs + "').style.display == 'inline' ? '" + sign_right + "' : '" + sign_down + "'); document.getElementById('spectrum_" + specs + "').style.display = (document.getElementById('spectrum_" + specs + "').style.display == 'inline' ? 'none' : 'inline');\" style=\"border-bottom: 1px solid #d3d3d3; cursor: pointer; color: " + (n_specs ? "black" : disabled_text_color) + ";\">&nbsp;&nbsp;&nbsp;&nbsp;<div style=\"display:inline; margin: 0px; padding: 0px;\" id=\"peptide_sign_" + specs + "\">" + sign_right + "</div>&nbsp;" + current_pep.peptide_seq + "</td><td style=\"border-bottom: 1px solid #d3d3d3; padding-right: 10px;\" align=\"right\"><input style=\"display: inline;\" type=\"checkbox\" " + peptite_checked + " onclick=\"" + onclick_command + "\" id='cb-" + current_prot.id + "-" + j + "' /></td></tr>";
            inner_html += "<tr><td colspan=\"2\" width=\"100%\"><table cellspacing=\"0\" cellpadding=\"0\" id='spectrum_" + specs + "' style=\"display: none;\">";
            for (var k = 0; k < n_specs; ++k){
                if (!current_pep.spectra[k].filter_valid) continue;
                var spectrum_checked = current_pep.spectra[k].user_selected ? "checked" : "";
                var onclick_spec_command = "protein_dictionary[" + current_prot.id + "].peptides[" + j + "].spectra[" + k + "].user_selected = !protein_dictionary[" + current_prot.id + "].peptides[" + j + "].spectra[" + k + "].user_selected; \
                if (protein_dictionary[" + current_prot.id + "].peptides[" + j + "].spectra[" + k + "].user_selected && !document.getElementById('cb-" + current_prot.id + "-" + j + "').checked) { \
                    protein_dictionary[" + current_prot.id + "].peptides[" + j + "].user_selected = true; \
                    document.getElementById('cb-" + current_prot.id + "-" + j + "').checked = true; \
                }";
                inner_html += "<tr><td width=\"100%\" onclick=\"load_spectrum(" + current_pep.spectra[k].id + ");\" style=\"border-bottom: 1px solid #d3d3d3; cursor: pointer;\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + current_pep.spectra[k]['mass'] + charge_plus(current_pep.spectra[k]['charge']) + "</td><td style=\"border-bottom: 1px solid #d3d3d3; padding-right: 20px;\" align=\"right\"><input style=\"display: inline;\" type=\"checkbox\" " + spectrum_checked + " onclick=\"" + onclick_spec_command + "\" id='cb-" + current_prot.id + "-" + j + "-" + current_pep.spectra[k].id + "' /></td></tr>";
                
            }
            inner_html += "</table></td></tr>";
            ++specs;
        }
        inner_html += "</table></td></tr>";
        ++peps;
    }
    inner_html += "</table>";
    
    document.getElementById("spectra_panel").innerHTML = inner_html;
}



function open_disclaimer (){
    document.getElementById("disclaimer").style.display = "inline";
    document.getElementById("click_background").style.display = "inline";
    background_hiding = hide_disclaimer;
}

function open_accession_search (){
    document.getElementById("accession_search").style.display = "inline";
    document.getElementById("waiting_background").style.display = "inline";
    document.getElementById("error_filter_text_accession").innerHTML = "";
}

function open_locus_search (){
    document.getElementById("locus_search").style.display = "inline";
    document.getElementById("waiting_background").style.display = "inline";
    document.getElementById("error_filter_text_locus").innerHTML = "";
}

function open_function_search (){
    document.getElementById("function_search").style.display = "inline";
    document.getElementById("waiting_background").style.display = "inline";
    document.getElementById("error_filter_text_function").innerHTML = "";
}


function open_chromosome_search(){
    document.getElementById("chromosome_search").style.display = "inline";
    document.getElementById("waiting_background").style.display = "inline";
    chromosome_height = document.getElementById("chromosome_search").offsetHeight * 0.8;
    document.getElementById("chromosome_information_table_wrapper").style.height = chromosome_height.toString() + "px";
    if (chromosome_selected == -1) draw_chromosome_ideograms();
    document.getElementById("error_filter_text_chromosome").innerHTML = "";
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

function hide_disclaimer (){
    document.getElementById("disclaimer").style.display = "none";
    document.getElementById("waiting_background").style.display = "none";
}


function hide_check_spectra (){
    document.getElementById("waiting_background").style.display = "none";
    document.getElementById("check_spectra").style.display = "none";
    if (typeof qsdb_domain !== 'undefined' && qsdb_domain !== null){
        document.getElementById("renderarea").style.filter = "none";
        document.getElementById("navigation").style.filter = "none";
    }
}


function show_search(){
    var search_text = document.getElementById("search_field").value;
    var len_p = search_text.length;
    if (len_p > 2 && document.getElementById("search_results").innerHTML.length){
        document.getElementById("search_results").style.display = "inline";
        document.getElementById("search_background").style.display = "inline";
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
        for (var i = 0; i < len_p; ++i){
            masks[lower.charCodeAt(i)] |= bit;
            masks[upper.charCodeAt(i)] |= bit;
            if (lower.charAt(i) == '-') masks[' '.charCodeAt(0)] |= bit;
            if (lower.charAt(i) == ' ') masks['-'.charCodeAt(0)] |= bit;
            if (lower.charAt(i) == '.') masks[','.charCodeAt(0)] |= bit;
            if (lower.charAt(i) == ',') masks['.'.charCodeAt(0)] |= bit;
            bit <<= 1;
        }
        
        var accept = 1 << (len_p - 1);
        var results = [];
        for (var i = 0; i < data.length; ++i){
            var r = data[i].search(len_p, accept, masks);
            if (r.length){
                results = results.concat(r);
            }
        }
        
        if (results.length){
            document.getElementById("search_results").style.display = "inline";
            document.getElementById("search_background").style.display = "inline";
            var rect = document.getElementById('search_field_nav').getBoundingClientRect();
            document.getElementById("search_results").style.top = (rect.top + document.getElementById('search_field_nav').offsetHeight).toString() + "px";
            document.getElementById("search_results").style.left = (rect.left).toString() + "px";
            var inner_html = "<table>";
            for (var i = 0; i < results.length; ++i){
                var t1 = "<font color=\"" + disabled_text_color + "\">" + results[i][0].substring(0, results[i][1]) + "</font>";
                var t2 = results[i][0].substring(results[i][1], results[i][1] + len_p);
                var t3 = "<font color=\"" + disabled_text_color + "\">" + results[i][0].substring(results[i][1] + len_p, results[i][0].length) + "</font>";
                inner_html += "<tr><td class=\"single_search_result\" onclick=\"highlight_protein(" + results[i][2] + ", " + results[i][3] + ");\">" + t1 + t2 + t3 + "</td></tr>";
            }
            inner_html += "</table>";
            document.getElementById("search_results").innerHTML = inner_html;
        }
        else {
            hide_search();
        }
    }
    else {
        hide_search();
    }
}





function highlight_protein(node_id, prot_id){
    
    hide_search();
    var progress = 0;
    var steps = 30;
    var time = 3; // seconds
    var std_dev = time / 6.;
    var c = document.getElementById("renderarea");
    document.getElementById("animation_background").style.display = "inline";
    var x = data[data_ref[node_id]].x;
    var y = data[data_ref[node_id]].y;
    var width  = window.innerWidth * 0.5;
    var height = window.innerHeight * 0.5;
    var scale = Math.pow(Math.pow(scaling, highlight_zoom - zoom), 1 / (time * steps));
    var zoom_scale = (highlight_zoom - zoom) / (time * steps);
    
    var moving = setInterval(function(){
        if (progress >= time) {
            zoom = highlight_zoom;
            var l = 0, ii = 0;
            highlighting = setInterval(function(){
                if (ii >= 3){
                    clearInterval (highlighting);
                }
                else {
                    data[data_ref[node_id]].highlight = (l < 25);
                    draw();
                    l += 1;
                    if (l >= 50){
                        l = 0; ii += 1;
                    }
                }
            }, 20);
            document.getElementById("animation_background").style.display = "none";
            clearInterval (moving);
            zoom = highlight_zoom;
            change_zoom();
            draw();
            
        }
        else {
            var split = Math.exp(-0.5 * sq((progress - time * 0.5) / std_dev)) / (Math.sqrt(2 * Math.PI) * std_dev) / steps;
            for (var i = 0; i < data.length; ++i){
                data[i].width *= scale;
                data[i].height *= scale;
                data[i].orig_height *= scale;
                data[i].x = width + scale * (data[i].x + split * (width - x) - width);
                data[i].y = height + scale * (data[i].y + split * (height - y) - height);
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
            draw();
            progress += 1 / steps;
        }
    }, steps);
    
}


function hide_search(){
    document.getElementById("search_results").style.display = "none";
    document.getElementById("search_background").style.display = "none";
}


function select_species(){
    if (document.getElementById("select_species").style.display == "inline"){
        hide_select_species();
    }
    else {
        var rect = document.getElementById('select_species_nav').getBoundingClientRect();
        document.getElementById("select_species").style.top = (rect.top + document.getElementById('select_species_nav').offsetHeight).toString() + "px";
        document.getElementById("select_species").style.left = (rect.left).toString() + "px";
        document.getElementById("select_species").style.display = "inline";
        document.getElementById("select_species_background").style.display = "inline";
    }
}


function open_filter_panel(){
    if (document.getElementById("filter_panel_wrapper").style.display == "inline"){
        hide_filter_panel();
    }
    else {
        document.getElementById("filter_panel_check_spectra").innerHTML = "";
        document.getElementById("filter_panel_wrapper").innerHTML = filter_panel_data;
        document.getElementById("filter_panel_wrapper").style.display = "inline";
        var rect = document.getElementById('filter_panel_nav').getBoundingClientRect();
        load_filter_parameters();
        document.getElementById("filter_panel_wrapper").style.top = (rect.top + document.getElementById('filter_panel_nav').offsetHeight).toString() + "px";
        document.getElementById("filter_panel_wrapper").style.left = (rect.left).toString() + "px";
        document.getElementById("filter_panel_background").style.display = "inline";
    }
}


function hide_select_species(){
    document.getElementById("select_species").style.display = "none";
    document.getElementById("select_species_background").style.display = "none";
}



function adopt_filter_parameters(){
    filter_parameters = [];
    filter_parameters["min_peptide_length"] = document.getElementById("min_peptide_length").value;
    filter_parameters["max_peptide_length"] = document.getElementById("max_peptide_length").value;
    filter_parameters["min_precursor_charge"] = document.getElementById("min_precursor_charge").value;
    filter_parameters["max_precursor_charge"] = document.getElementById("max_precursor_charge").value;
    filter_parameters["oxy_m_off"] = document.getElementById("oxy_m_off").checked;
    filter_parameters["oxy_m_var"] = document.getElementById("oxy_m_var").checked;
    filter_parameters["oxy_m_fix"] = document.getElementById("oxy_m_fix").checked;
    filter_parameters["carba_c_off"] = document.getElementById("carba_c_off").checked;
    filter_parameters["carba_c_var"] = document.getElementById("carba_c_var").checked;
    filter_parameters["carba_c_fix"] = document.getElementById("carba_c_fix").checked;
    filter_parameters["tissue_brain"] = document.getElementById("check_brain").checked;
    filter_parameters["tissue_liver"] = document.getElementById("check_liver").checked;
    filter_parameters["tissue_kidney"] = document.getElementById("check_kidney").checked;
    filter_parameters["tissue_spleen"] = document.getElementById("check_spleen").checked;
    filter_parameters["tissue_heart"] = document.getElementById("check_heart").checked;
    filter_parameters["tissue_blood"] = document.getElementById("check_blood").checked;
    filter_parameters["tissue_fat"] = document.getElementById("check_fat").checked;
    filter_parameters["tissue_lung"] = document.getElementById("check_lung").checked;
    filter_parameters["tissue_eye"] = document.getElementById("check_eye").checked;
    filter_parameters["tissue_gut"] = document.getElementById("check_gut").checked;
}


function load_filter_parameters(){
    document.getElementById("min_peptide_length").value = filter_parameters["min_peptide_length"];
    document.getElementById("max_peptide_length").value = filter_parameters["max_peptide_length"];
    document.getElementById("min_precursor_charge").value = filter_parameters["min_precursor_charge"];
    document.getElementById("max_precursor_charge").value = filter_parameters["max_precursor_charge"];
    document.getElementById("oxy_m_off").checked = filter_parameters["oxy_m_off"];
    document.getElementById("oxy_m_var").checked = filter_parameters["oxy_m_var"];
    document.getElementById("oxy_m_fix").checked = filter_parameters["oxy_m_fix"];
    document.getElementById("carba_c_off").checked = filter_parameters["carba_c_off"];
    document.getElementById("carba_c_var").checked = filter_parameters["carba_c_var"];
    document.getElementById("carba_c_fix").checked = filter_parameters["carba_c_fix"];
    document.getElementById("check_brain").checked = filter_parameters["tissue_brain"];
    document.getElementById("check_liver").checked = filter_parameters["tissue_liver"];
    document.getElementById("check_kidney").checked = filter_parameters["tissue_kidney"];
    document.getElementById("check_spleen").checked = filter_parameters["tissue_spleen"];
    document.getElementById("check_heart").checked = filter_parameters["tissue_heart"];
    document.getElementById("check_blood").checked = filter_parameters["tissue_blood"];
    document.getElementById("check_fat").checked = filter_parameters["tissue_fat"];
    document.getElementById("check_lung").checked = filter_parameters["tissue_lung"];
    document.getElementById("check_eye").checked = filter_parameters["tissue_eye"];
    document.getElementById("check_gut").checked = filter_parameters["tissue_gut"];
}



function hide_filter_panel(){
    if (document.getElementById("filter_panel_wrapper").style.display == "inline"){
        var filter_changed = false;
        if (filter_parameters["min_peptide_length"] != document.getElementById("min_peptide_length").value) filter_changed = true;
        if (filter_parameters["max_peptide_length"] != document.getElementById("max_peptide_length").value) filter_changed = true;
        if (filter_parameters["min_precursor_charge"] != document.getElementById("min_precursor_charge").value) filter_changed = true;
        if (filter_parameters["max_precursor_charge"] != document.getElementById("max_precursor_charge").value) filter_changed = true;
        if (filter_parameters["oxy_m_off"] != document.getElementById("oxy_m_off").checked) filter_changed = true;
        if (filter_parameters["oxy_m_var"] != document.getElementById("oxy_m_var").checked) filter_changed = true;
        if (filter_parameters["oxy_m_fix"] != document.getElementById("oxy_m_fix").checked) filter_changed = true;
        if (filter_parameters["carba_c_off"] != document.getElementById("carba_c_off").checked) filter_changed = true;
        if (filter_parameters["carba_c_var"] != document.getElementById("carba_c_var").checked) filter_changed = true;
        if (filter_parameters["carba_c_fix"] != document.getElementById("carba_c_fix").checked) filter_changed = true;
        if (filter_parameters["tissue_brain"] != document.getElementById("check_brain").checked) filter_changed = true;
        if (filter_parameters["tissue_liver"] != document.getElementById("check_liver").checked) filter_changed = true;
        if (filter_parameters["tissue_kidney"] != document.getElementById("check_kidney").checked) filter_changed = true;
        if (filter_parameters["tissue_spleen"] != document.getElementById("check_spleen").checked) filter_changed = true;
        if (filter_parameters["tissue_heart"] != document.getElementById("check_heart").checked) filter_changed = true;
        if (filter_parameters["tissue_blood"] != document.getElementById("check_blood").checked) filter_changed = true;
        if (filter_parameters["tissue_fat"] != document.getElementById("check_fat").checked) filter_changed = true;
        if (filter_parameters["tissue_lung"] != document.getElementById("check_lung").checked) filter_changed = true;
        if (filter_parameters["tissue_eye"] != document.getElementById("check_eye").checked) filter_changed = true;
        if (filter_parameters["tissue_gut"] != document.getElementById("check_gut").checked) filter_changed = true;
        
        if (filter_changed){
            var proceed = true;
            var one_marked = false;
            for (var i = 0; i < data.length && !one_marked; ++i){
                for (var j = 0; j < data[i].proteins.length && !one_marked; ++j){
                    if (data[i].proteins[j].marked){
                        one_marked = true;
                    }
                }
            }
        
            if (one_marked){
                proceed = confirm('Filter settings were changed, all protein selections are being discarded, do you want to proceed?');
            }
            
            if (proceed){
                basket = {};
                adopt_filter_parameters();
                for (var i = 0; i < data.length; ++i){
                    data[i].filtering();
                }
                draw();
                compute_statistics();
            }            
            
        }
        
        
        document.getElementById("filter_panel_wrapper").style.display = "none";
        document.getElementById("filter_panel_background").style.display = "none";
    }
}


function select_pathway(){
    if (document.getElementById("select_pathway").style.display == "inline"){
        hide_select_pathway();
    }
    else {
        var rect = document.getElementById('select_pathway_nav').getBoundingClientRect();
        document.getElementById("select_pathway").style.top = (rect.top + document.getElementById('select_pathway_nav').offsetHeight).toString() + "px";
        document.getElementById("select_pathway").style.left = (rect.left).toString() + "px";
        document.getElementById("select_pathway").style.display = "inline";
        document.getElementById("select_pathway_background").style.display = "inline";
    }
}


function hide_select_pathway(){
    document.getElementById("select_pathway").style.display = "none";
    document.getElementById("select_pathway_background").style.display = "none";
}

function round10(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function compute_statistics(){
    if (typeof qsdb_domain === 'undefined' || qsdb_domain === null) return;
    document.getElementById("stat_pathway").innerHTML = pathways[current_pathway_list_index][1];
    var validation = pathways[current_pathway_list_index][2];
    if (validation == "is"){
        document.getElementById("stat_val_type").style.background = "#a0ff90";
        document.getElementById("stat_validation").style.background = "#a0ff90";
        document.getElementById("stat_validation").innerHTML = "PRM + internal standard";
        
    }
    else if (validation == "prm"){
        document.getElementById("stat_val_type").style.background = "#feff90";
        document.getElementById("stat_validation").style.background = "#feff90";
        document.getElementById("stat_validation").innerHTML = "PRM";
    }
    else if (validation == "topn"){
        document.getElementById("stat_val_type").style.background = "#ffbebe";
        document.getElementById("stat_validation").style.background = "#ffbebe";
        document.getElementById("stat_validation").innerHTML = "Top-<i>n</i> experiment";
    }
    
    
    var num_proteins = 0;
    var proteins_content = [];
    for (var i = 0; i < data.length; ++i){
        num_proteins += data[i].proteins.length;
        for (var j = 0; j < data[i].proteins.length; ++j){
            proteins_content.push([data[i].proteins[j].name, i, j, data[i].proteins[j].marked]);
        }
    }
    proteins_content.sort();
    for (var i = proteins_content.length - 1; i > 0; --i){
        if (proteins_content[i][0] == proteins_content[i - 1][0]){
            if (proteins_content[i][3] && !proteins_content[i - 1][3]){
                tmp = proteins_content[i];
                proteins_content[i] = proteins_content[i - 1];
                proteins_content[i - 1] = tmp;
            }
            proteins_content.splice(i, 1);
        }
    }
    
    var num_spectra = 0;
    var valid_spectra = 0;
    var num_peptides = 0;
    var valid_peptides = 0;
    var valid_proteins = 0;
    var sel_proteins = 0;
    var sel_peptides = 0;
    var sel_spectra = 0;
    for (var i = 0; i < proteins_content.length; ++i){
        var tmp = data[proteins_content[i][1]].proteins[proteins_content[i][2]].get_statistics();
        valid_proteins += data[proteins_content[i][1]].proteins[proteins_content[i][2]].filter_valid;
        num_peptides += tmp[2];
        valid_peptides += tmp[3];
        num_spectra += tmp[4];
        valid_spectra += tmp[5];
        if (proteins_content[i][3]){
            sel_proteins += 1;
            sel_peptides += tmp[3];
            sel_spectra += tmp[5];
        }
    }
    document.getElementById("stat_num_prot").innerHTML = num_proteins;
    document.getElementById("stat_dist_prot").innerHTML = proteins_content.length;
    document.getElementById("stat_filter_prot").innerHTML = valid_proteins + " / " + round10(valid_proteins / proteins_content.length * 100, 1) + "%";
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
    var rect = document.getElementById('select_pathway_nav').getBoundingClientRect();
    document.getElementById("statistics").style.top = (rect.top + document.getElementById('select_pathway_nav').offsetHeight).toString() + "px";
    document.getElementById("renderarea").width = wdth;
    document.getElementById("statistics").style.left = (wdth).toString() + "px";
    document.getElementById("statistics").style.width = (window.innerWidth * expanding_percentage).toString() + "px";
    document.getElementById("statistics").style.height = "100%";
    document.getElementById("statistics").style.display = "inline";
    expand_obj.visible = false;
    collapse_obj.visible = true;
    compute_statistics();
    if (pathway_is_loaded) draw();
}


function collapse_statistics(){
    if (!pathway_is_loaded) return;
    document.getElementById("renderarea").width  = window.innerWidth;
    document.getElementById("statistics").style.display = "none";
    expand_obj.visible = true;
    collapse_obj.visible = false;
    draw();
}




function close_navigation(nav){
    switch (nav){
        case 1:
            hide_select_species();
            hide_filter_panel();
            break;
        case 2:
            hide_select_pathway();
            hide_filter_panel();
            break;
        case 3:
            hide_select_species();
            hide_select_pathway();
            break;
        default:
            hide_select_species();
            hide_select_pathway();
            hide_filter_panel();
            break;
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
            infobox.create(xy[0], xy[1], data_ref[he.id], prot);
            he.highlight = false;
            he = 0;
            draw();
        }
        else {
            var split = Math.exp(-0.5 * sq((progress - time * 0.5) / std_dev)) / (Math.sqrt(2 * Math.PI) * std_dev) * inv_steps;
            for (var i = 0; i < data.length; ++i){
                data[i].x += split * (width - x);
                data[i].y += split * (height - y);
            }
            for (var i = 0; i < edges.length; ++i){
                for (var j = 0; j < edges[i].point_list.length; ++j){
                    edges[i].point_list[j].x += split * (width - x);
                    edges[i].point_list[j].y += split * (height - y);
                }
            }
            null_x += split * (width - x);
            null_y += split * (height - y);
            boundaries[0] += split * (width - x);
            boundaries[1] += split * (height - y);
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
    collapse_statistics();
    
    
    document.getElementById("renderarea_wrapper").innerHTML = "<canvas id=\"renderarea\" class=\"renderarea\">Your browser does not support the HTML5 canvas tag.</canvas>";
    
    
    
    var c = document.getElementById("renderarea");
    c.style.display = "none";
    var ctx = c.getContext("2d");
    c.onmousedown = mouse_down_listener;
    c.onmouseup = mouse_up_listener;
    c.onmousemove = mouse_move_listener;
    c.addEventListener("click", mouse_click_listener, false);
    c.addEventListener("dblclick", mouse_dblclick_listener, false);
    c.addEventListener('DOMMouseScroll', mouse_wheel_listener, false);
    c.addEventListener('contextmenu', function(event){event.preventDefault(); return false;}, false);
    c.addEventListener("mouseout", mouse_up_listener, false);
    for (var key in tissues){
        tissue = tissues[key];
        tissue[2] = new Image();
        tissue[2].src = tissue[0];
    }
    
    infobox = new Infobox(ctx);
    zoom_sign_in = new zoom_sign(ctx, 1);
    zoom_sign_out = new zoom_sign(ctx, 0);
    expand_obj = new expand_collapse(ctx, 1);
    collapse_obj = new expand_collapse(ctx, 0);
    preview_element = new preview(ctx);
    select_field_element = new select_field(ctx);
    select_field_element.visible = false;
    collapse_obj.visible = false;
    current_pathway_title = new pathway_title(ctx);
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    
    
    var species = [];
    if(document.getElementById("species_mouse").checked) species.push("mouse");
    //if(document.getElementById("species_human").checked) species.push("human");
    var species_string = species.join(":");
    
    // get data information
    data = [];
    data_ref = [];
    var tmp_data = 0;
    nodes = 0;
    protein_dictionary = {};
    toggled_proteins = new Set();
    process_edges_semaphore = false;
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
    
    
    xmlhttp.open("GET", "/qsdb/cgi-bin/get-nodes.bin?pathway=" + current_pathway + "&species=" + species_string, true);
    xmlhttp.send();
    
    
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
            process_edges_semaphore = true;
            clearInterval(process_nodes);
            
        }
    }, 1);
        
    
    var process_edges = setInterval(function(){
        if (tmp_data && nodes && process_edges_semaphore){
            compute_edges();
            assemble_elements(1);
            min_zoom = preview_zoom;
            for (var i = zoom; i >= preview_zoom; --i) zoom_in_out(1, 0);
            draw(1);
            preview_element.snapshot();
            assemble_elements();
            for (var i = 0; i < (m_zoom - preview_zoom); ++i) zoom_in_out(0, 0);
            min_zoom = m_zoom;
            draw(1);
            pathway_is_loaded = true;
            c.style.display = "inline";
            clearInterval(process_edges);
        }
    }, 1);
}



function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}


function accession_search_parse_accessions(){
    basket = {};
    spectra_exclude = [];
    var accessions = document.getElementById("accessions").value;
    accessions = replaceAll(accessions, "\n", ":");
    accessions = replaceAll(accessions, " ", "");
    accessions = replaceAll(accessions, "\t", "");
    
    // get nodes information
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            request_load_proteins(JSON.parse(xmlhttp.responseText));
        }
    }
    
    xmlhttp.open("GET", "/qsdb/cgi-bin/get-proteins.bin?accessions=" + accessions, true);
    xmlhttp.send();
}




function request_load_proteins(data){
    for (var i = 0; i < data.length; ++i){
        var p_id = data[i]["id"];
        if (p_id in basket) continue;
        var prot = new Protein(data[i], 0);
        protein_dictionary[prot.id] = prot;
        prot.filtering();
        if (prot.filter_valid) basket[prot.id] = prot;
    }
    check_spectra();
}




function locus_search_request_data(){
    basket = {};
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
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            request_load_proteins(JSON.parse(xmlhttp.responseText));
        }
    }
    
    xmlhttp.open("GET", "/qsdb/cgi-bin/get-proteins.bin?loci=" + IDs, true);
    xmlhttp.send();
}




function function_search_request_data(){
    basket = {};
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
            request_load_proteins(JSON.parse(xmlhttp.responseText));
        }
    }
    
    xmlhttp.open("GET", "/qsdb/cgi-bin/get-proteins.bin?functions=" + IDs, true);
    xmlhttp.send();
}



function chromosome_search_request_data(){
    basket = {};
    spectra_exclude = [];
    var accessionIDs = "";
    for (var chromosome_key in chromosome_data){
        for (var i = 0; i < chromosome_data[chromosome_key].length; ++i){
            if (chromosome_data[chromosome_key][i][9]){
                if (accessionIDs.length > 0) accessionIDs += ":";
                accessionIDs += chromosome_data[chromosome_key][i][5];
            }
        }
    }
    
    // request proteins
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            request_load_proteins(JSON.parse(xmlhttp.responseText));
        }
    }
    
    xmlhttp.open("GET", "/qsdb/cgi-bin/get-proteins.bin?accessions=" + accessionIDs, true);
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
    }
}