// api/calculate.js
export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const body = JSON.parse(req.body);
        const { mode, params, machine } = body;
        let result = {};

        // Logic xử lý Drilling
        if (mode === 'drilling') {
            const radius = params.pcd / 2;
            let coords = [];
            const rotationRad = (params.rotation * Math.PI) / 180;
            for (let i = 0; i < params.holes; i++) {
                const angle = i * (360 / params.holes);
                const angleRad = ((angle * Math.PI) / 180) + rotationRad;
                const x = (radius * Math.cos(angleRad)).toFixed(3);
                const y = (radius * Math.sin(angleRad)).toFixed(3);
                coords.push({ x, y, angle: angle.toFixed(1) });
            }
            result = { gcode: generateDrillingGCode(coords, params, machine), coords, radius };
        } 
        // Logic xử lý Hexagon
        else if (mode === 'milling') {
            const r = params.hexFlat / Math.sqrt(3);
            let path = [];
            for (let i = 0; i <= 6; i++) {
                const angle = (i * 60 + params.rotation) * Math.PI / 180;
                path.push({ x: (r * Math.cos(angle)).toFixed(3), y: (r * Math.sin(angle)).toFixed(3) });
            }
            result = { gcode: "(HEX G-CODE GENERATED)\n...", path };
        }

        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

// Hàm phụ tạo G-code (Copy từ bản gốc của bạn)
function generateDrillingGCode(coords, p, machine) {
    let g = `(TOOL - DRILL D${p.toolDia || 10})\n`;
    g += machine === 'robodrill' ? "G90 G54 G0 X0 Y0\n" : "G90 G54 G00 X0 Y0\n";
    coords.forEach(c => {
        g += `X${c.x} Y${c.y} Z2.0\nG81 Z-${p.depth} R2.0 F100\n`;
    });
    g += "G80 G0 Z100.0\nM30";
    return g;
}
