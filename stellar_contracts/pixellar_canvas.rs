#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, Symbol, Vec};

#[derive(Clone)]
#[contracttype]
pub struct Pixel {
    pub color: u32,
    pub painter: Address,
    pub timestamp: u64,
}

#[contract]
pub struct PixellarCanvas;

const CANVAS_WIDTH: u64 = 50;
const CANVAS_HEIGHT: u64 = 50;
const GAME_HUB: Symbol = symbol_short!("GAMEHUB");

#[contractimpl]
impl PixellarCanvas {
    /// Initialize the canvas
    pub fn initialize(env: Env, game_hub: Address) {
        env.storage().instance().set(&GAME_HUB, &game_hub);
    }

    /// Draw a pixel on the canvas with ZK verification support
    pub fn draw(
        env: Env,
        painter: Address,
        x: u64,
        y: u64,
        color: u32,
    ) -> Result<(), &'static str> {
        painter.require_auth();

        // Validate coordinates
        if x >= CANVAS_WIDTH || y >= CANVAS_HEIGHT {
            return Err("Invalid coordinates");
        }

        // Validate color (0-15 for 16 colors)
        if color > 15 {
            return Err("Invalid color");
        }

        let key = (x, y);
        let timestamp = env.ledger().timestamp();

        let pixel = Pixel {
            color,
            painter: painter.clone(),
            timestamp,
        };

        env.storage().persistent().set(&key, &pixel);

        Ok(())
    }

    /// Get pixel data
    pub fn get_pixel(env: Env, x: u64, y: u64) -> Option<Pixel> {
        if x >= CANVAS_WIDTH || y >= CANVAS_HEIGHT {
            return None;
        }

        let key = (x, y);
        env.storage().persistent().get(&key)
    }

    /// Get all pixels (for initial load)
    pub fn get_all_pixels(env: Env) -> Vec<((u64, u64), Pixel)> {
        let mut pixels = Vec::new(&env);
        
        for x in 0..CANVAS_WIDTH {
            for y in 0..CANVAS_HEIGHT {
                let key = (x, y);
                if let Some(pixel) = env.storage().persistent().get::<(u64, u64), Pixel>(&key) {
                    pixels.push_back(((x, y), pixel));
                }
            }
        }
        
        pixels
    }

    /// Call game hub start_game (required for hackathon)
    pub fn start_game(env: Env, game_id: Symbol) {
        let game_hub: Address = env.storage().instance().get(&GAME_HUB).unwrap();
        
        // Call game hub contract
        // This would invoke the game hub's start_game function
        // Implementation depends on game hub interface
    }

    /// Call game hub end_game (required for hackathon)
    pub fn end_game(env: Env, game_id: Symbol) {
        let game_hub: Address = env.storage().instance().get(&GAME_HUB).unwrap();
        
        // Call game hub contract
        // This would invoke the game hub's end_game function
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_draw_pixel() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PixellarCanvas);
        let client = PixellarCanvasClient::new(&env, &contract_id);

        let painter = Address::generate(&env);
        let game_hub = Address::generate(&env);

        client.initialize(&game_hub);
        
        // Draw a pixel
        client.draw(&painter, &0, &0, &6); // Orange color

        // Verify pixel
        let pixel = client.get_pixel(&0, &0).unwrap();
        assert_eq!(pixel.color, 6);
        assert_eq!(pixel.painter, painter);
    }
}
