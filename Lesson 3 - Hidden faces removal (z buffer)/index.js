function cross(A, B) { 
    return {x: A.y * B.z - A.z * B.y, y: A.z * B.x - A.x * B.z, z: A.x * B.y - A.y * B.x};
}

function draw_point(x, y, ctx, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, ctx.canvas.clientHeight - y, 1, 1);
}

function line(x0, y0, x1, y1, ctx, color) {
    let steep = false;
    if (Math.abs(x0 - x1) < Math.abs(y0 - y1)) { // if the line is steep, we transpose the image
        x0 = [y0, y0 = x0][0]; // swap
        x1 = [y1, y1 = x1][0]; // swap
        steep = true;
    }

    if (x0 > x1) { // make it left−to−right 
        x0 = [x1, x1 = x0][0]; // swap
        y0 = [y1, y1 = y0][0]; // swap
    } 

    let dx = x1 - x0; 
    let dy = y1 - y0; 
    let derror2 = Math.abs(dy) * 2; 
    let error2 = 0; 
    let y = y0;

    for (let x = x0; x <= x1; x++) { 
        if (steep) {
            draw_point(y, x, ctx, color);
        } else {
            draw_point(x, y, ctx, color);
        }

        error2 += derror2; 
        if (error2 > dx) { 
            y += (y1>y0?1:-1); 
            error2 -= dx*2; 
        }  
    } 
}

function barycentric(pts, P) { 
    let u = cross({x: pts[2].x - pts[0].x, y: pts[1].x - pts[0].x, z: pts[0].x - P.x}, 
                  {x: pts[2].y - pts[0].y, y: pts[1].y - pts[0].y, z: pts[0].y - P.y});
    // u.z = (pts[2].x - pts[0].x) * (pts[1].y - pts[0].y) - (pts[1].x - pts[0].x) * (pts[2].y - pts[0].y)
    /* `pts` and `P` has integer value as coordinates
       so `abs(u.z)` < 1 means `u.z` is 0, that means
       triangle is degenerate, in this case return something with negative coordinates */
    if (Math.abs(u.z) < 1) return {x:-1, y:1, z:1};
    return {x: 1.0 - (u.x + u.y) / u.z, y: u.y /u.z, z: u.x / u.z}; 
} 

function triangle(pts, ctx, color) { 
    let bboxmin = [ctx.canvas.clientWidth - 1, ctx.canvas.clientHeight - 1]; 
    let bboxmax = [0, 0];
    let clamp = [ctx.canvas.clientWidth - 1, ctx.canvas.clientHeight - 1]; 
    for (let i = 0; i < 3; i++) { 
        for (let j = 0; j < 2; j++) { 
            bboxmin[j] = Math.max(0,        Math.min(bboxmin[j], j == 0 ? pts[i].x : pts[i].y)); 
            bboxmax[j] = Math.min(clamp[j], Math.max(bboxmax[j], j == 0 ? pts[i].x : pts[i].y)); 
        } 
    } 

    let P = {x: 0, y: 0}; 
    for (P.x = bboxmin[0]; P.x <= bboxmax[0]; P.x++) { 
        for (P.y = bboxmin[1]; P.y <= bboxmax[1]; P.y++) { 
            let bc_screen  = barycentric(pts, P); 
            if (bc_screen.x < 0 || bc_screen.y < 0 || bc_screen.z < 0) 
                continue; 
            draw_point(P.x, P.y, ctx, color); 
        } 
    } 
} 

function draw() {
    let canvas = document.getElementById('index');
    if (canvas.getContext) {
        let ctx = canvas.getContext('2d');
        for (let x = 0; x < ctx.canvas.clientWidth; ++x) {
            for (let y = 0; y < ctx.canvas.clientHeight; ++y) {
                ctx.fillStyle = 'black';
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        // let t0 = [{x:10, y:70}, {x:50, y:160}, {x:70, y:80}]; 
        // let t1 = [{x:180, y:50}, {x:150, y:1}, {x:70, y:180}];
        // let t2 = [{x:180, y:150}, {x:120, y:160}, {x:130, y:180}];
        // triangle(t0, ctx, 'red');
        // triangle(t1, ctx, 'white');
        // triangle(t2, ctx, 'green');

        // scene "2d mesh"
        line(20,  34,  744, 400, ctx, 'red');
        line(120, 434, 444, 400, ctx, 'green');
        line(330, 463, 594, 200, ctx, 'blue');

        // screen line
        line(10,  10,  790, 10,  ctx, 'white');
    }
}