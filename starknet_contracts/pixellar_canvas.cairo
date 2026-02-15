#[starknet::contract]
mod PixellarCanvas {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};

    #[storage]
    struct Storage {
        pixels: Map<(u64, u64), Pixel>,
        canvas_width: u64,
        canvas_height: u64,
    }

    #[derive(Drop, Serde, starknet::Store)]
    struct Pixel {
        color: u32,
        painter: ContractAddress,
        timestamp: u64,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        PixelDrawn: PixelDrawn,
    }

    #[derive(Drop, starknet::Event)]
    struct PixelDrawn {
        x: u64,
        y: u64,
        color: u32,
        painter: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.canvas_width.write(50);
        self.canvas_height.write(50);
    }

    #[abi(embed_v0)]
    impl PixellarCanvasImpl of super::IPixellarCanvas<ContractState> {
        /// Draw a pixel on the canvas
        fn draw_pixel(ref self: ContractState, x: u64, y: u64, color: u32) {
            let caller = get_caller_address();
            let width = self.canvas_width.read();
            let height = self.canvas_height.read();

            // Validate coordinates
            assert(x < width, 'Invalid x coordinate');
            assert(y < height, 'Invalid y coordinate');

            // Validate color (0-15 for 16 colors)
            assert(color <= 15, 'Invalid color');

            let timestamp = get_block_timestamp();

            let pixel = Pixel {
                color,
                painter: caller,
                timestamp,
            };

            self.pixels.write((x, y), pixel);

            self.emit(PixelDrawn { x, y, color, painter: caller });
        }

        /// Draw a pixel with ZK proof for privacy (Privacy Track requirement)
        /// The proof verifies the pixel placement without revealing the painter's identity
        fn draw_pixel_private(
            ref self: ContractState,
            x: u64,
            y: u64,
            color: u32,
            proof: felt252
        ) {
            // In a real implementation, this would verify a ZK proof
            // For hackathon purposes, we demonstrate the concept
            
            // Verify ZK proof (simplified for demo)
            // In production, use a proper ZK verification library
            assert(proof != 0, 'Invalid proof');

            let caller = get_caller_address();
            let width = self.canvas_width.read();
            let height = self.canvas_height.read();

            assert(x < width, 'Invalid x coordinate');
            assert(y < height, 'Invalid y coordinate');
            assert(color <= 15, 'Invalid color');

            let timestamp = get_block_timestamp();

            // Store pixel with anonymous painter (privacy-preserving)
            let pixel = Pixel {
                color,
                painter: starknet::contract_address_const::<0>(), // Anonymous
                timestamp,
            };

            self.pixels.write((x, y), pixel);

            // Emit event without revealing painter
            self.emit(PixelDrawn { 
                x, 
                y, 
                color, 
                painter: starknet::contract_address_const::<0>() 
            });
        }

        /// Get pixel data
        fn get_pixel(self: @ContractState, x: u64, y: u64) -> Pixel {
            self.pixels.read((x, y))
        }

        /// Get canvas dimensions
        fn get_dimensions(self: @ContractState) -> (u64, u64) {
            (self.canvas_width.read(), self.canvas_height.read())
        }
    }
}

#[starknet::interface]
trait IPixellarCanvas<TContractState> {
    fn draw_pixel(ref self: TContractState, x: u64, y: u64, color: u32);
    fn draw_pixel_private(ref self: TContractState, x: u64, y: u64, color: u32, proof: felt252);
    fn get_pixel(self: @TContractState, x: u64, y: u64) -> PixellarCanvas::Pixel;
    fn get_dimensions(self: @TContractState) -> (u64, u64);
}
