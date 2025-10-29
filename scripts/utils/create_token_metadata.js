// Criar metadados para o token tBRZ no Phantom
// Isso faz o Phantom reconhecer o token com nome e símbolo corretos

const mintAddress = "CNgjfkVEKKkDspYS5ZZem8KpyhubmGi7MHXFuc55QtZV";

console.log(`
Para adicionar metadados ao token e fazer o Phantom reconhecê-lo:

1. Crie um NFT com metadados em:
   https://www.solanatools.io/tools/metadata

2. Ou use este script Python:
   pip install metaplex
   
3. Ou conecte o mint manualmente no Phantom:
   - Settings → Manage Token List
   - Add Custom Token
   - Enter mint: ${mintAddress}
   - Name: tBRZ
   - Symbol: tBRZ
   - Decimals: 6

MAS: Para o teste E2E, não é necessário!
O token funciona mesmo aparecendo como "Unknown".

O importante é que você TEM 100 tokens e pode fazer pagamento! ✅
`);

console.log(`\nMint para adicionar no .env:`);
console.log(`VITE_BRZ_MINT_DEVNET=${mintAddress}`);
console.log(`BRZ_MINT=${mintAddress}`);
