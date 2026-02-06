export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    
    try {
        const { mode, params, machine } = JSON.parse(req.body);
        let result = { gcode: "", coords: [], path: [], radius: 0 };

        if (mode === 'drilling') {
            const r = params.pcd / 2;
            const rotationRad = (params.rotation * Math.PI) / 180;
            for (let i = 0; i < params.holes; i++) {
                const angle = i * (360 / params.holes);
                const angleRad = ((angle * Math.PI) / 180) + rotationRad;
                result.coords.push({
                    x: (r * Math.cos(angleRad)).toFixed(3),
                    y: (r * Math.sin(angleRad)).toFixed(3),
                    angle: angle.toFixed(1)
                });
            }
            result.radius = r;
            result.gcode = `(TOOL - DRILL)\nG90 G54 G0 X0 Y0\n` + 
                result.coords.map(c => `X${c.x} Y${c.y} Z2.0\nG81 Z-${params.depth} R2.0 F100`).join('\n') + "\nG80 M30";
        } 
        else if (mode === 'milling') {
            // Logic Hexagon
            const r = params.hexFlat / Math.sqrt(3);
            for (let i = 0; i <= 6; i++) {
                const angle = (i * 60 + params.rotation) * Math.PI / 180;
                result.path.push({ x: (r * Math.cos(angle)).toFixed(3), y: (r * Math.sin(angle)).toFixed(3) });
            }
            result.gcode = "(HEX MILLING G-CODE)\n..."; 
        }

        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
