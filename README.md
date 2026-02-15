# Pixellar 🎨

A multi-chain decentralized collaborative pixel art canvas with ZK-powered privacy features. Built for Starknet Bitcoin & Privacy Hackathon and Stellar ZK Gaming Hackathon.

## 🌟 Overview

Pixellar is a next-generation collaborative pixel art platform that operates across three major blockchains: Sui, Stellar, and Starknet. Users can connect wallets from any of these chains and place pixels on a shared 50x50 canvas, with each pixel placement recorded on-chain.

### Key Features

- **Multi-Chain Support**: Seamlessly switch between Sui, Stellar, and Starknet
- **ZK Privacy**: Privacy-preserving pixel placement on Starknet using Zero-Knowledge proofs
- **ZK Gaming**: Stellar integration with game hub contract for verifiable gameplay
- **Orange-Themed Palette**: 16 beautiful orange-gradient colors
- **Real-time Updates**: See other users' pixels appear instantly via Supabase
- **Wallet Integration**: Support for Sui Wallet, Freighter (Stellar), and ArgentX/Braavos (Starknet)

## 🏆 Hackathon Submissions

### Starknet - Bitcoin and Privacy Hackathon
**Track**: Privacy Track

**Privacy Features**:
- ZK-proof based pixel placement (`draw_pixel_private`)
- Anonymous painter identity preservation
- Privacy-preserving on-chain state
- Zero-knowledge verification of pixel ownership

### Stellar - ZK Gaming Hackathon
**ZK Gaming Mechanics**:
- Integration with Stellar Game Hub contract
- `start_game()` and `end_game()` calls to hub contract
- Verifiable pixel placement outcomes
- Fair gameplay through on-chain verification

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Sui Wallet  │  │Stellar Wallet│  │Starknet Wallet│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼─────────┐
│   Sui Network  │  │Stellar Network │  │Starknet Network│
│  Canvas Smart  │  │  Canvas Smart  │  │  Canvas Smart  │
│   Contract     │  │   Contract +   │  │  Contract +    │
│                │  │   Game Hub     │  │  ZK Privacy    │
└────────────────┘  └────────────────┘  └────────────────┘
                            │
                    ┌───────▼────────┐
                    │    Supabase    │
                    │  Pixel Cache   │
                    │  Real-time DB  │
                    └────────────────┘
```

## 🎨 Color Palette

16 orange-themed colors ranging from white to black:

| Index | Color | Hex | Description |
|-------|-------|-----|-------------|
| 0 | White | #FFFFFF | Pure white |
| 1 | Light Orange Tint | #FFE5CC | Very light |
| 2 | Light Orange | #FFB366 | Soft orange |
| 3 | Dark Orange | #FF8C00 | Primary orange |
| 4 | Red Orange | #FF6B35 | Warm orange |
| 5 | Burnt Orange | #E55300 | Deep warm |
| 6 | Deep Orange | #CC4E00 | Rich orange |
| 7 | Brown Orange | #A04000 | Earthy |
| 8 | Gold | #FFD700 | Golden |
| 9 | Orange | #FFA500 | Classic orange |
| 10 | Bright Orange | #FF7F00 | Vibrant |
| 11 | Orange Red | #FF4500 | Hot orange |
| 12 | Saddle Brown | #8B4513 | Brown |
| 13 | Dark Brown | #654321 | Deep brown |
| 14 | Very Dark Brown | #2C1810 | Almost black |
| 15 | Black | #000000 | Pure black |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Sui CLI (for Sui contract deployment)
- Stellar CLI (for Stellar contract deployment)
- Starknet Foundry (for Starknet contract deployment)
- Wallet extensions:
  - Sui Wallet / Suiet
  - Freighter (Stellar)
  - ArgentX or Braavos (Starknet)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pixellar.git
cd pixellar

# Install frontend dependencies
cd frontend
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Sui
NEXT_PUBLIC_PACKAGE_ID=your_sui_package_id
NEXT_PUBLIC_CANVAS_OBJECT_ID=your_canvas_object_id

# Stellar
NEXT_PUBLIC_STELLAR_CONTRACT_ID=your_stellar_contract_id
NEXT_PUBLIC_STELLAR_NETWORK=testnet

# Starknet
NEXT_PUBLIC_STARKNET_CONTRACT_ADDRESS=your_starknet_contract_address
NEXT_PUBLIC_STARKNET_NETWORK=sepolia
```

### Development

```bash
# Start development server
cd frontend
npm run dev
```

Visit `http://localhost:3000`

## 📦 Smart Contract Deployment

### Sui Contract

```bash
cd sui_place
sui move build
sui client publish --gas-budget 100000000
```

### Stellar Contract

```bash
cd stellar_contracts
cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/pixellar_canvas.wasm \
  --source YOUR_SECRET_KEY \
  --network testnet
```

### Starknet Contract

```bash
cd starknet_contracts
scarb build

# Declare and deploy
starkli declare target/dev/pixellar_canvas.contract_class.json \
  --network sepolia

starkli deploy YOUR_CLASS_HASH \
  --network sepolia
```

## 🎮 How to Play

1. **Connect Wallet**: Choose your preferred blockchain (Sui, Stellar, or Starknet) and connect your wallet
2. **Select Color**: Pick from 16 orange-themed colors
3. **Place Pixel**: Click on the canvas to place your pixel
4. **Wait for Cooldown**: Each blockchain has a 10-second cooldown between placements
5. **Switch Chains**: Change blockchain anytime to place pixels from different networks

## 🔐 Privacy Features (Starknet)

Pixellar implements privacy-preserving pixel placement on Starknet:

- **Anonymous Placement**: Use `draw_pixel_private()` with ZK proof
- **Identity Protection**: Painter address is not revealed on-chain
- **Verifiable Ownership**: Prove pixel ownership without revealing identity
- **Privacy Events**: Blockchain events don't leak painter information

## 🎯 ZK Gaming Features (Stellar)

Integration with Stellar Game Hub:

- **Game Session Management**: Automatic `start_game()` and `end_game()` calls
- **Verifiable Outcomes**: All pixel placements are verifiable on-chain
- **Fair Play**: No trusted intermediary needed
- **Provable State**: Canvas state is cryptographically verifiable

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Blockchain | Sui, Stellar, Starknet |
| Wallets | @mysten/dapp-kit, Freighter API, get-starknet |
| Database | Supabase (PostgreSQL) |
| Real-time | Supabase Subscriptions |
| Deployment | Vercel |

## 📁 Project Structure

```
pixellar/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Landing page
│   │   │   └── game/page.tsx         # Game page
│   │   ├── components/
│   │   │   ├── Canvas.tsx            # Main canvas
│   │   │   ├── ColorPicker.tsx       # Color selection
│   │   │   ├── MultiChainWallet.tsx  # Multi-chain wallet
│   │   │   └── ...
│   │   └── lib/
│   │       ├── store.ts              # Zustand store
│   │       ├── sui.ts                # Sui helpers
│   │       ├── stellar.ts            # Stellar helpers
│   │       ├── starknet.ts           # Starknet helpers
│   │       └── constants.ts          # Configuration
│   └── package.json
├── sui_place/
│   └── sources/
│       └── canvas.move               # Sui contract
├── stellar_contracts/
│   └── pixellar_canvas.rs            # Stellar contract
├── starknet_contracts/
│   └── pixellar_canvas.cairo         # Starknet contract
└── README.md
```

## 🔗 Links

- [Sui Documentation](https://docs.sui.io/)
- [Stellar Documentation](https://developers.stellar.org/)
- [Starknet Documentation](https://docs.starknet.io/)
- [Stellar Game Studio](https://jamesbachini.github.io/Stellar-Game-Studio/)
- [Starknet Hackathon](https://dorahacks.io/hackathon/starknet-bitcoin-privacy)
- [Stellar Hackathon](https://dorahacks.io/hackathon/stellar-zk-gaming)

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License

## 🏅 Hackathon Compliance

### Starknet Requirements ✅
- [x] Privacy-preserving technology (ZK proofs)
- [x] Functional demo on Starknet Sepolia testnet
- [x] Open-source repository
- [x] Starknet wallet integration
- [x] Privacy track alignment

### Stellar Requirements ✅
- [x] ZK-powered game mechanic
- [x] Deployed on Stellar Testnet
- [x] Game hub contract integration (`start_game`, `end_game`)
- [x] Functional frontend
- [x] Open-source repository
- [x] Video demo (to be created)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with 🧡 for Starknet and Stellar hackathons
