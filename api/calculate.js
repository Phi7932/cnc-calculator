// api/calculate.js
export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    try {
        const { mode, params, machine } = JSON.parse(req.body);
        let result = { gcode: "", coords: [], path: [] };

        if (mode === 'drilling') {
            result = calculateDrillingLogic(params, machine);
        } else if (mode === 'milling') {
            result = calculateHexagonLogic(params, machine);
        } else if (mode === 'circular') {
            result = calculateCircularLogic(params, machine);
        }
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

// --- COPY TOÀN BỘ CÁC HÀM TÍNH TOÁN TOÁN HỌC CỦA BẠN VÀO ĐÂY ---
function calculateDrillingLogic(p, machine) {
    const radius = p.pcd / 2;
    let coords = [];
    const rotationRad = (p.rotation * Math.PI) / 180;
    for (let i = 0; i < p.holes; i++) {
        const angle = i * (360 / p.holes);
        const angleRad = ((angle * Math.PI) / 180) + rotationRad;
        coords.push({
            x: (radius * Math.cos(angleRad)).toFixed(3),
            y: (radius * Math.sin(angleRad)).toFixed(3),
            angle: angle.toFixed(1)
        });
    }
    // Logic G-Code cho từng máy (Takisawa, Robodrill...)
    let gcode = `(G-CODE ${machine.toUpperCase()})\n`;
    coords.forEach(c => {
        if (machine === 'robodrill') gcode += `G00 X${c.x} Y${c.y}\nG83 Z-${p.depth} R2.0 Q3.0 F100\n`;
        else gcode += `X${c.x} Y${c.y}\n`;
    });
    return { gcode, coords, radius };
}

function calculateHexagonLogic(p, machine) {
    const r = p.hexFlat / Math.sqrt(3);
    let path = [];
    for (let i = 0; i <= 6; i++) {
        const angle = (i * 60 + p.rotation) * Math.PI / 180;
        path.push({ x: (r * Math.cos(angle)).toFixed(3), y: (r * Math.sin(angle)).toFixed(3) });
    }
    return { gcode: "(HEX G-CODE)\n...", path };
}

function calculateCircularLogic(p, machine) {
    // Tương tự cho Circular Pocket...
    return { gcode: "(CIRCULAR G-CODE)\n...", path: [] };
}
