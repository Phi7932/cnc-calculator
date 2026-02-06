// api/calculate.js
export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { mode, params, machine } = JSON.parse(req.body);
        let result = { gcode: "", coords: [], path: [] };

        if (mode === 'drilling') {
            result = logicDrilling(params, machine);
        } else if (mode === 'milling') {
            result = logicHexMilling(params, machine);
        } else if (mode === 'circular') {
            result = logicCircularMilling(params, machine);
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --- CÁC HÀM LOGIC BÍ MẬT (Đã cắt từ file HTML của bạn) ---

function logicDrilling(p, machine) {
    const radius = p.pcd / 2;
    let coords = [];
    const rotationRad = (p.rotation * Math.PI) / 180;
    
    for (let i = 0; i < p.holes; i++) {
        const angle = i * (360 / p.holes);
        const angleRad = ((angle * Math.PI) / 180) + rotationRad;
        const x = (radius * Math.cos(angleRad)).toFixed(3);
        const y = (radius * Math.sin(angleRad)).toFixed(3);
        coords.push({ x, y, angle: angle.toFixed(1) });
    }

    let gcode = `(DRILLING G-CODE - ${machine.toUpperCase()})\n`;
    // Logic tạo G-Code phức tạp của bạn nằm ở đây...
    coords.forEach((c, i) => {
        gcode += `N${i+1} G00 X${c.x} Y${c.y}\nG81 Z-${p.depth} R2.0 F100\n`;
    });
    
    return { gcode, coords, radius };
}

function logicHexMilling(p, machine) {
    // Copy toàn bộ logic tính toán Hexagon của bạn vào đây
    const r = p.hexFlat / Math.sqrt(3);
    let path = [];
    for (let i = 0; i <= 6; i++) {
        const angle = (i * 60 + p.rotation) * Math.PI / 180;
        path.push({ x: (r * Math.cos(angle)).toFixed(3), y: (r * Math.sin(angle)).toFixed(3) });
    }
    return { gcode: "(HEX MILLING G-CODE)\n...", path };
}

function logicCircularMilling(p, machine) {
    // Copy toàn bộ logic tính toán Circular Pocket của bạn vào đây
    return { gcode: "(CIRCULAR G-CODE)\n...", path: [] };
}
