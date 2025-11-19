export class InputHandler {
    constructor() {
        this.keys = {
            left: false,
            right: false,
            enter: false,
            space: false,
            escape: false
        };

        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;
            if (e.key === 'Enter') this.keys.enter = true;
            if (e.key === ' ') this.keys.space = true;
            if (e.key === 'Escape') this.keys.escape = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
            if (e.key === 'Enter') this.keys.enter = false;
            if (e.key === ' ') this.keys.space = false;
            if (e.key === 'Escape') this.keys.escape = false;
        });

        // Touch/Mouse Controls for Buttons
        const setupBtn = (id, key) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            
            const press = (e) => { e.preventDefault(); this.keys[key] = true; };
            const release = (e) => { e.preventDefault(); this.keys[key] = false; };

            btn.addEventListener('mousedown', press);
            btn.addEventListener('touchstart', press);
            btn.addEventListener('mouseup', release);
            btn.addEventListener('touchend', release);
            btn.addEventListener('mouseleave', release);
        };

        setupBtn('btn-left', 'left');
        setupBtn('btn-right', 'right');
        
        // Special handling for Shoot/Dash/Enter buttons triggers
        const btnShoot = document.getElementById('btn-shoot');
        if (btnShoot) {
            const trigger = (e) => {
                e.preventDefault();
                // Dispatch space keydown event manually or handle directly
                window.dispatchEvent(new KeyboardEvent('keydown', { 'key': ' ' }));
            };
            btnShoot.addEventListener('mousedown', trigger);
            btnShoot.addEventListener('touchstart', trigger);
        }

        const btnDash = document.getElementById('btn-dash');
        if (btnDash) {
            const trigger = (e) => {
                e.preventDefault();
                 window.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Shift' }));
            };
            btnDash.addEventListener('mousedown', trigger);
            btnDash.addEventListener('touchstart', trigger);
        }
    }
}
