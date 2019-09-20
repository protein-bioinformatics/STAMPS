ms_zoom = 0;
max_ms_zoom = 60;
ms_scaling = 1.2;
origin_x = 0;
last_x = 0;
left_border = 0;
right_border = 0;
top_border = 0;
bottom_border = 0;
spectrum_loaded = false;
x_tics = [200, 100, 50, 25, 10, 5, 2, 1, 0.5, 0.25, 0.125, 0.0625, 0.03125, 0.015625, 0.0078125];
y_tics = [0.2, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5];
peaks = [];
acids = [];
tolerance_relative = 5;
tolerance_absolute = 0.02;
H =       1.007276;
C12 =    12.000000;
O =      15.994914;
H2O =    18.009466
H3O =    19.016742;
O2 =     31.989829;
electron = 0.00054857990946;
acetyl = 43.016742;
peptide = "";
peptide_mod = "";
spectrum_active = true;
charge = 0;
precursor_mass = 0;
grid_color = "#DDDDDD";
label_color = "black";
var ion_type = {no_type: 0, a_type: 1, b_type: 2, c_type: 3, x_type: 4, y_type: 5, z_type: 6, precursor: 7, immonium: 8};
var ion_type_colors = ["#888888", "#888888", "#0056af", "#888888", "#888888", "#D40000", "#888888", "#c89200", "#ff9600"];
var current_loaded_spectrum = -1;



acids['A'] =  71.037110;
acids['R'] = 156.101110;
acids['N'] = 114.042930;
acids['D'] = 115.026940;
acids['C'] = 103.009190;
acids['c'] = 160.030654;
acids['E'] = 129.042590;
acids['Q'] = 128.058580;
acids['G'] =  57.021460;
acids['H'] = 137.058910;
acids['I'] = 113.084060;
acids['L'] = 113.084060;
acids['K'] = 128.094960;
acids['M'] = 131.040490;
acids['m'] = 147.035404;
acids['n'] = 163.030318;
acids['F'] = 147.068410;
acids['P'] =  97.052760;
acids['S'] =  87.032030;
acids['T'] = 101.047680;
acids['W'] = 186.079310;
acids['Y'] = 163.063330;
acids['V'] =  99.068410;





function peptide_seq_mass(peptide_seq){
    var mass = 0;
    for (var i = 0; i < peptide_seq.length; ++i){
        mass += acids[peptide_seq[i]];
    }
    return mass;
}




function binary_search(key, ppm){
    var low = 0;
    var high = peaks.length - 1;
    best_index = low;
    while (low <= high) {
        var mid = (low + high) >> 1;
        if (peaks[mid].mass < key) low = mid + 1;
        else if (peaks[mid].mass > key) high = mid - 1;
        else {
            best_index = mid;
            break;
        }
        if (Math.abs(peaks[mid].mass - key) < Math.abs(peaks[best_index].mass - key)) best_index = mid;
    }
    
    var mass_diff = Math.abs(peaks[best_index].mass - key);
    return [ppm ? mass_diff / key * 1000000 : mass_diff, best_index];
}






function peak(ms, xx, int){
    this.mass = ms;
    this.x = xx;
    this.intensity = int;
    this.type = ion_type.no_type;
    this.annotation = "";
    this.highlight = false;
}






function subscripting(x){
    var str = "";
    var num = 1;
    var n = Math.floor(Math.log10(x)) + 1;
    for (var i = 0; i < n; ++i){
        str = String.fromCharCode(8320 + Math.floor(x % (num * 10) / num)) + str;
        num *= 10;
    }
    return str;
}






function annotation(ions, ms_panel){
    if (peaks.length == 0) return;
    
    // annotate y-ions
    var tolerance = (document.getElementById(ms_panel + "_radio_ppm").checked ? tolerance_relative : tolerance_absolute);
    var rev_peptide = peptide_mod.split("").reverse().join("");
    var mass = 0;
    
    for (var i = 0; i < peaks.length; ++i){
        peaks[i].type = ion_type.no_type;
        peaks[i].annotation = "";
        peaks[i].highlight = false;
    }
    
    // annotate immonium ions
    for (var i = 0; i < peptide_mod.length; ++i){
        mass = acids[peptide_mod[i]] - C12 - O + H;
        var diff_mass = binary_search(mass, document.getElementById(ms_panel + "_radio_ppm").checked);
        if (diff_mass[0] < tolerance){
            peaks[diff_mass[1]].highlight = true;
            peaks[diff_mass[1]].type = ion_type.immonium;
            peaks[diff_mass[1]].annotation = peptide_mod[i];
        }
    }
    
    
    // annotate b-ions
    if (ions.has("b")){
        mass = 0;
        for (var i = 0; i < peptide_mod.length; ++i){
            mass += acids[peptide_mod[i]];
            
            for (var crg = 1; crg <= charge; ++crg){
                if (mass >= 800 * (crg - 1)){
                    var diff_mass = binary_search((mass + (H - electron) * crg) / crg, document.getElementById(ms_panel + "_radio_ppm").checked);
                    if (diff_mass[0] < tolerance){
                        peaks[diff_mass[1]].highlight = true;
                        peaks[diff_mass[1]].type = ion_type.b_type;
                        peaks[diff_mass[1]].annotation = "b" + subscripting(i + 1) + (crg > 1 ? charge_plus(crg) : "");
                    }
                }
            }
        }
    }
    
    // annotate y-ions
    if (ions.has("y")){
        mass = H2O;
        for (var i = 0; i < rev_peptide.length; ++i){
            mass += acids[rev_peptide[i]];
            for (var crg = 1; crg <= charge; ++crg){
                if (mass >= 800 * (crg - 1)){
                var diff_mass = binary_search((mass + (H - electron) * crg) / crg, document.getElementById(ms_panel + "_radio_ppm").checked);
                    if (diff_mass[0] < tolerance){
                        peaks[diff_mass[1]].highlight = true;
                        peaks[diff_mass[1]].type = ion_type.y_type;
                        peaks[diff_mass[1]].annotation = "y" + subscripting(i + 1) + (crg > 1 ? charge_plus(crg) : "");
                    }
                }
            }
        }
    }
    
    // annotate precursor
    var diff_mass = binary_search(precursor_mass, document.getElementById(ms_panel + "_radio_ppm").checked);
    if (diff_mass[0] < tolerance){
        peaks[diff_mass[1]].highlight = true;
        peaks[diff_mass[1]].type = ion_type.precursor;
        peaks[diff_mass[1]].annotation = "pre" + charge_plus(charge);
    }
}






function resize_ms_view(ms_panel){
    var t_top = 0.02;
    
    var filter_height = filter_parameters["filter_panel_visible"] ? 0.3 : 0;
    
    document.getElementById(ms_panel + "_msarea").width = document.getElementById(ms_panel).offsetWidth * 0.695;
    document.getElementById(ms_panel + "_msarea").height = document.getElementById(ms_panel).offsetHeight * (0.9 - filter_height);
    document.getElementById(ms_panel + "_panel").style.width = (document.getElementById(ms_panel).offsetWidth * 0.29).toString() + "px";
    var sp_height = document.getElementById(ms_panel).offsetHeight * (0.87 - filter_height);
    document.getElementById(ms_panel + "_panel").style.height = (sp_height).toString() + "px";
    document.getElementById(ms_panel + "_functions").style.width = (document.getElementById(ms_panel).offsetWidth * 0.29).toString() + "px";
    document.getElementById(ms_panel + "_functions").style.height = (document.getElementById(ms_panel).offsetHeight * (0.05)).toString() + "px";
    
    
    var rect = document.getElementById(ms_panel).getBoundingClientRect();
    document.getElementById(ms_panel + "_msarea").style.top = (rect.top + (rect.bottom - rect.top) * t_top).toString() + "px";
    document.getElementById(ms_panel + "_msarea").style.left = (rect.left + (rect.right - rect.left) * 0.3).toString() + "px";
    document.getElementById(ms_panel + "_panel").style.top = (rect.top + (rect.bottom - rect.top) * t_top).toString() + "px";
    document.getElementById(ms_panel + "_panel").style.left = (rect.left + (rect.right - rect.left) * 0.005).toString() + "px";
    document.getElementById(ms_panel + "_functions").style.top = (sp_height + rect.top + (rect.bottom - rect.top) * t_top).toString() + "px";
    document.getElementById(ms_panel + "_functions").style.left = (rect.left + (rect.right - rect.left) * 0.005).toString() + "px";
    
    if (document.getElementById(ms_panel + "_options") != null){
        document.getElementById(ms_panel + "_options").style.top = (rect.top + (rect.bottom - rect.top) * t_top).toString() + "px";
        document.getElementById(ms_panel + "_options").style.left = (rect.left + (rect.right - rect.left) * 0.3).toString() + "px";
    }
    
    
    if (filter_parameters["filter_panel_visible"]){
        document.getElementById("filter_panel_check_spectra").style.left = (rect.left + (rect.right - rect.left) * 0.005).toString() + "px";
        document.getElementById("filter_panel_check_spectra").style.top = (rect.top + (rect.bottom - rect.top) * t_top + document.getElementById("msarea").height + 5).toString() + "px";
        document.getElementById("filter_panel_check_spectra").style.width = ((document.getElementById(ms_panel).offsetWidth * 0.695) + (rect.left + (rect.right - rect.left) * 0.3) - (rect.left + (rect.right - rect.left) * 0.005)).toString() + "px";
        document.getElementById("filter_panel_check_spectra").style.height = (document.getElementById(ms_panel).offsetHeight * filter_height).toString() + "px";
    }
    
    
    var scl_w = (document.getElementById(ms_panel + "_msarea").width - 40 - 70) / (right_border - left_border);
    origin_x *= scl_w;
    last_x *= scl_w;
    for (var i = 0; i < peaks.length; ++i) {
        peaks[i].x *= scl_w;
    }
    left_border = 70;
    right_border = document.getElementById(ms_panel + "_msarea").width - 40;
    top_border = 40;
    bottom_border = document.getElementById(ms_panel + "_msarea").height - 25;
    
    if (spectrum_loaded) draw_spectrum(ms_panel);
}






function change_match_error_value(ms_panel){
    // check if new value is a number
    var n = document.getElementById(ms_panel + "_error_value").value;
    if (!isNaN(parseFloat(n)) && isFinite(n)){
        if (document.getElementById(ms_panel + "_radio_ppm").checked){
            tolerance_relative = parseFloat(n);
        }
        else {
            tolerance_absolute = parseFloat(n);
        }
        if (spectrum_loaded){
            ions = new Set(ion_types[filter_parameters["ions"]].split("|"));
            annotation(ions, ms_panel);
            draw_spectrum(ms_panel);
        }
    }
    else {
        document.getElementById(ms_panel + "_error_value").value = (document.getElementById(ms_panel + "_radio_ppm").checked ? tolerance_relative : tolerance_absolute);
    }
}






function change_match_error(ms_panel){
    if (document.getElementById(ms_panel + "_radio_ppm").checked){
        document.getElementById(ms_panel + "_unit").innerHTML = document.getElementById(ms_panel + "_radio_ppm").value;
        document.getElementById(ms_panel + "_error_value").value = tolerance_relative;
    }
    else {
        document.getElementById(ms_panel + "_unit").innerHTML = document.getElementById(ms_panel + "_radio_da").value;
        document.getElementById(ms_panel + "_error_value").value = tolerance_absolute;
    }
    if (spectrum_loaded){
        ions = new Set(ion_types[filter_parameters["ions"]].split("|"));
        annotation(ions, ms_panel);
        draw_spectrum(ms_panel);
    }
}





function reset_spectrum(){
    
    peaks = [];
    spectrum_loaded = true;
}




function load_spectrum(spectrum_id, spectrum_data, ms_panel){
    var c = document.getElementById(ms_panel + "_msarea");
    var ctx = c.getContext("2d");
    ms_zoom = 0;
    peaks = [];
    current_loaded_spectrum = spectrum_id;
    
    if (typeof spectrum_data === "undefined" || spectrum_data == null){
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                spectrum_data = JSON.parse(xmlhttp.responseText);
            }
        }
        console.log(file_pathname + "scripts/get-msdata.py?spectrum_id=" + spectrum_id + "&species=" + current_species + "&host=" + current_host);
        xmlhttp.open("GET", file_pathname + "scripts/get-msdata.py?spectrum_id=" + spectrum_id + "&species=" + current_species + "&host=" + current_host, false);
        xmlhttp.send();
    }
    
    
    peptide = spectrum_data["peptideSeq"];
    precursor_mass = spectrum_data["precursorMZ"];
    charge = spectrum_data["precursorCharge"];
    peptide_mod = spectrum_data["peptideModSeq"];
    spectrum_active = spectrum_data["scoreType"] != -1;
    
    
    while (peptide_mod.indexOf("M[+16.0]") != -1){
        peptide_mod = peptide_mod.replace("M[+16.0]", "m");
    }
    while (peptide_mod.indexOf("C[+57.0]") != -1){
        peptide_mod = peptide_mod.replace("C[+57.0]", "c");
    }
    var canvas_width = ctx.canvas.width;
    
    left_border = 70;
    right_border = ctx.canvas.width - 40;
    top_border = 40;
    bottom_border = ctx.canvas.height - 25;
    
    
    peaks.push(new peak(0, 0, 0));
    origin_x = left_border;
    last_x = right_border;
    var max_mass = 0;
    for (var items in spectrum_data["peakMZ"]){
        peaks.push(new peak(spectrum_data["peakMZ"][items], 0, spectrum_data["peakIntensity"][items]));
    }
    var ii = peaks.length - 1;
    peaks.push(new peak(peaks[ii].mass * 1.05, 0, 0));
    var max_mass = peaks[ii + 1].mass;
    
    for (var i = 0; i < peaks.length; ++i) {
        peaks[i].x = origin_x + canvas_width * 0.9 * peaks[i].mass / max_mass;
    }
    spectrum_loaded = true;
    
    ions = new Set(ion_types[filter_parameters["ions"]].split("|"));
    annotation(ions, ms_panel);
    draw_spectrum(ms_panel);
}






function draw_spectrum(ms_panel, ctx){
    if (typeof(ms_panel) === 'undefined') ms_panel = "check_spectra";
    
    if (typeof(ctx) === 'undefined') {
        var c = document.getElementById(ms_panel + "_msarea");
        ctx = c.getContext("2d");
    }
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font="10px Arial";
    
    if (!spectrum_loaded || peaks.length == 0) return;
    
    ctx.fillStyle = "black";
    // Add x-axis tics, values and grid
    var max_tic = peaks[peaks.length - 1].mass;
    var tics_start = Math.min(peaks[0].x, left_border);
    var tic = x_tics[Math.floor(ms_zoom / 4)];
    var width = Math.max(peaks[peaks.length - 1].x, right_border) - Math.min(peaks[0].x, left_border);
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    for (var i = 0; i < max_tic; i += tic){
        var x = tics_start + i * width / max_tic;
        if (left_border <= x && x <= right_border){
            
            ctx.setLineDash([0]);
            ctx.strokeStyle = label_color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, bottom_border);
            ctx.lineTo(x, bottom_border + 8);    
            ctx.closePath();
            ctx.stroke();
            
            var txt = i.toString();
            ctx.fillText(txt, x, bottom_border + 14);
            
            
            ctx.setLineDash([10]);
            ctx.strokeStyle = grid_color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, bottom_border);
            ctx.lineTo(x, top_border);    
            ctx.closePath();
            ctx.stroke();
        }
    }
    
    var max_mass = 0;
    var max_intensity = 0;
    for (var i = 0; i < peaks.length; ++i) {
        if (left_border <= peaks[i].x && peaks[i].x <= right_border){
            max_intensity = Math.max(max_intensity, peaks[i].intensity);
        }
    }
    
    // Add y-axis tics, values and grid
    var lg = Math.floor(Math.log10(max_intensity));
    var y_tic = y_tics[Math.floor(max_intensity / Math.pow(10, lg))] * Math.pow(10, lg);
    ctx.textAlign = "right";
    ctx.textBaseline = 'middle';
    for (var i = 0; i < max_intensity; i += y_tic){
        var y = bottom_border - i * (bottom_border - top_border) / max_intensity;
        ctx.setLineDash([0]);
        ctx.strokeStyle = label_color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(left_border, y);
        ctx.lineTo(left_border - 8, y);    
        ctx.closePath();
        ctx.stroke();
        
        
        if (i != 0){
            var exponent = Math.floor(Math.log10(i));
            var mantissa = i / Math.pow(10, exponent);
            
            var abundance_label = mantissa.toFixed(2) + "×10";
            ctx.fillText(abundance_label, left_border - 16, y);
            
            ctx.font="8px Arial";
            ctx.textAlign = "left";
            ctx.fillText(exponent.toString(), left_border - 16, y - 5);
            ctx.font="10px Arial";
            ctx.textAlign = "right";
        }
        else {
            var abundance_label = "0";
            ctx.fillText(abundance_label, left_border - 16, y);
        }
        
        
        ctx.setLineDash([10]);
        ctx.strokeStyle = grid_color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(left_border, y);
        ctx.lineTo(right_border, y);    
        ctx.closePath();
        ctx.stroke();
    }
    
    
    
    // Add Masses
    var zero_x = left_border;
    var zero_y = bottom_border;
    ctx.lineWidth = 1;
    ctx.setLineDash([0]);
    ctx.strokeStyle = ion_type_colors[ion_type.no_type];
    var y_factor = (bottom_border - top_border) / max_intensity;
    var y_offset = 5;
    var annotated = [];
    var annotated_rest = [];
    for (var i = 0; i < peaks.length; ++i) {
        if (left_border <= peaks[i].x && peaks[i].x <= right_border){
            if (peaks[i].type == ion_type.no_type){
                ctx.beginPath();
                ctx.moveTo(peaks[i].x, zero_y);
                ctx.lineTo(peaks[i].x, zero_y - peaks[i].intensity * y_factor);    
                ctx.closePath();
                ctx.stroke();
            }
            else {
                if (peaks[i].type == ion_type.y_type || peaks[i].type == ion_type.b_type){
                    annotated.push(peaks[i]);
                }
                else {
                    annotated_rest.push(peaks[i]);
                }
                
            }
        }
    }
    
    
    // draw annotated immoniums and precursors
    ctx.lineWidth = 2;
    ctx.font="16px Arial";
    for (var i = 0; i < annotated_rest.length; ++i) {
        ctx.strokeStyle = ion_type_colors[annotated_rest[i].type];
        ctx.beginPath();
        ctx.moveTo(annotated_rest[i].x, zero_y);
        ctx.lineTo(annotated_rest[i].x, zero_y - annotated_rest[i].intensity * y_factor);    
        ctx.closePath();
        ctx.stroke();
    }
    // draw annotations
    for (var i = 0; i < annotated_rest.length; ++i) {
        ctx.textAlign = "center";
        ctx.textBaseline = 'bottom';
        ctx.fillText(annotated_rest[i].annotation, annotated_rest[i].x, zero_y - annotated_rest[i].intensity * y_factor - y_offset);
    }
    
    
    
    
    
    annotated.sort(function(a, b) {
        return b.intensity - a.intensity;
    });
    
    
    // draw annotated peaks
    ctx.lineWidth = 2;
    ctx.font="16px Arial";
    for (var i = 0; i < Math.min(top_n_fragments[filter_parameters["max_topn_fragments"]], annotated.length); ++i) {
        ctx.strokeStyle = ion_type_colors[annotated[i].type];
        ctx.beginPath();
        ctx.moveTo(annotated[i].x, zero_y);
        ctx.lineTo(annotated[i].x, zero_y - annotated[i].intensity * y_factor);    
        ctx.closePath();
        ctx.stroke();
    }
    
    // draw annotations
    for (var i = 0; i < Math.min(top_n_fragments[filter_parameters["max_topn_fragments"]], annotated.length); ++i) {
        ctx.textAlign = "center";
        ctx.textBaseline = 'bottom';
        ctx.fillText(annotated[i].annotation, annotated[i].x, zero_y - annotated[i].intensity * y_factor - y_offset);
    }
    
    
    // Add axis and labels
    ctx.strokeStyle = label_color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(zero_x, top_border);
    ctx.lineTo(zero_x, zero_y);    
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(zero_x, zero_y);    
    ctx.lineTo(right_border, zero_y);    
    ctx.closePath();
    ctx.stroke();
    ctx.font="16px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = 'top';
    ctx.fillText("m/z", right_border  + 5, bottom_border - 8);
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(-Math.PI/2);
    ctx.textAlign = "center";
    //ctx.fillText("intensity", left_border - 100, top_border);
    
    
    ctx.restore();
    
    
    if (!spectrum_active) {
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = "#bbbbbb";
        ctx.beginPath();
        ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}





function get_mouse_pos(canvas, evt){
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}





function view_mouse_wheel_listener(e, ms_panel){
    if(e.ctrlKey) e.preventDefault();
    
    
    var delta = Math.max(-1, Math.min(1, -e.wheelDelta || e.detail));
    var direction = (1 - 2 *(delta >= 0));
    if (ms_zoom + direction < 0 || max_ms_zoom <= ms_zoom + direction)
        return;
    
    ms_zoom += direction;
    var scale = ms_scaling;
    if (delta >= 0) scale = 1. / scale;
    
    var c = document.getElementById(ms_panel + "_msarea");
    var ctx = c.getContext("2d");
    
    res = get_mouse_pos(c, e);
    origin_x = res.x + scale * (origin_x - res.x);
    last_x = res.x + scale * (last_x - res.x);
    for (var i = 0; i < peaks.length; ++i) {
        peaks[i].x = res.x + scale * (peaks[i].x - res.x);
    }
    if (origin_x > ctx.canvas.width * 0.05){
        var diff = origin_x - ctx.canvas.width * 0.05;
        origin_x -= diff;
        last_x -= diff;
        for (var i = 0; i < peaks.length; ++i) {
            peaks[i].x -= diff;
        }
    }
    
    if (last_x < ctx.canvas.width * 0.95){
        var diff = ctx.canvas.width * 0.95 - last_x;
        last_x += diff;
        origin_x += diff;
        for (var i = 0; i < peaks.length; ++i) {
            peaks[i].x += diff;
        }
    }
    
    draw_spectrum(ms_panel);
}





function spectrum_to_svg(ms_panel){
    if (!spectrum_loaded || typeof(ms_panel) === "undefined") return;
    
    var c = document.getElementById(ms_panel + "_msarea");
    var ctx = c.getContext("2d");
    var svg_ctx = new C2S(ctx.canvas.width, ctx.canvas.height);
    draw_spectrum(ms_panel, svg_ctx);
    
    var svgCode = svg_ctx.getSerializedSvg(true);
    var parts = svgCode.split("/>");
    svgCode = parts.join("/>\n");
    
    window.open("data:application/txt," + encodeURIComponent(svgCode), "_self");
}