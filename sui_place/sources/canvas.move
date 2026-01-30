module sui_place::canvas {
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::event;
    
    // Canvas dimensions (500x500 = 250,000 pixels)
    const CANVAS_WIDTH: u64 = 500;
    const CANVAS_HEIGHT: u64 = 500;
    const COOLDOWN_MS: u64 = 10000; // 10 seconds
    
    // Errors
    const E_INVALID_COORDINATES: u64 = 0;
    const E_INVALID_COLOR: u64 = 1;
    const E_COOLDOWN_ACTIVE: u64 = 2;
    
    /// Shared object for canvas state
    public struct Canvas has key {
        id: UID,
        pixels: Table<u64, u8>,        // position -> color (0-15)
        cooldowns: Table<address, u64>, // user -> last_draw_timestamp
    }
    
    /// Event emitted on pixel change
    public struct PixelChanged has copy, drop {
        x: u64,
        y: u64,
        color: u8,
        sender: address,
    }
    
    /// Initialize canvas - called once on publish
    fun init(ctx: &mut TxContext) {
        let canvas = Canvas {
            id: object::new(ctx),
            pixels: table::new(ctx),
            cooldowns: table::new(ctx),
        };
        transfer::share_object(canvas);
    }
    
    /// Draw a pixel on the canvas
    public entry fun draw(
        canvas: &mut Canvas,
        clock: &Clock,
        x: u64,
        y: u64,
        color: u8,
        ctx: &mut TxContext
    ) {
        // Validate coordinates
        assert!(x < CANVAS_WIDTH && y < CANVAS_HEIGHT, E_INVALID_COORDINATES);
        // Validate color (0-15 for 16 colors like r/place)
        assert!(color <= 15, E_INVALID_COLOR);
        
        let sender = tx_context::sender(ctx);
        let now = clock::timestamp_ms(clock);
        
        // Check and update cooldown
        if (table::contains(&canvas.cooldowns, sender)) {
            let last_draw = *table::borrow(&canvas.cooldowns, sender);
            assert!(now >= last_draw + COOLDOWN_MS, E_COOLDOWN_ACTIVE);
            *table::borrow_mut(&mut canvas.cooldowns, sender) = now;
        } else {
            table::add(&mut canvas.cooldowns, sender, now);
        };
        
        // Update pixel
        let position = y * CANVAS_WIDTH + x;
        if (table::contains(&canvas.pixels, position)) {
            *table::borrow_mut(&mut canvas.pixels, position) = color;
        } else {
            table::add(&mut canvas.pixels, position, color);
        };
        
        // Emit event for indexer
        event::emit(PixelChanged { x, y, color, sender });
    }
    
    /// Get remaining cooldown for a user (in milliseconds)
    public fun get_cooldown_remaining(canvas: &Canvas, clock: &Clock, user: address): u64 {
        if (!table::contains(&canvas.cooldowns, user)) {
            return 0
        };
        
        let last_draw = *table::borrow(&canvas.cooldowns, user);
        let now = clock::timestamp_ms(clock);
        let cooldown_end = last_draw + COOLDOWN_MS;
        
        if (now >= cooldown_end) {
            0
        } else {
            cooldown_end - now
        }
    }
    
    /// Get canvas dimensions
    public fun get_dimensions(): (u64, u64) {
        (CANVAS_WIDTH, CANVAS_HEIGHT)
    }

    // === Test Functions ===
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
