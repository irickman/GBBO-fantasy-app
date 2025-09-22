import { hash } from '@node-rs/argon2'

const password = process.argv[2]
if (!password) {
  console.error('Usage: pnpm tsx scripts/hash.ts "your shared password"')
  process.exit(1)
}

const main = async () => {
  const out = await hash(password, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
    variant: 'argon2id',
  })
  console.log('Generated hash:')
  console.log(out)
  console.log('\nAdd this to your .env file as AUTH_PASSWORD_HASH=')
}

main().catch(console.error)
