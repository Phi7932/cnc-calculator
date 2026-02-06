export default function handler(req, res) {
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
            result.gcode = `(G-CODE BY SERVER)\n` + result.coords.map(c => `X${c.x} Y${c.y}`).join('\n');
        }
        // Thêm các mode Hexagon tương tự vào đây...

        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ error: "Server Error" });
    }
}
